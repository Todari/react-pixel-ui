import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import { generatePixelArt, parseComputedStyles } from '@react-pixel-ui/core';
import { usePixelConfig } from '../context/PixelConfigProvider';
import { createStyleObserver } from '../utils/style-observer';
import {
  releaseManagedParentFilter,
  setManagedParentFilter,
} from '../utils/parent-filter-manager';

const useIsomorphicLayoutEffect =
  typeof window !== 'undefined' ? useLayoutEffect : useEffect;

export interface UsePixelRefOptions {
  pixelSize?: number;
  enabled?: boolean;
  observeHover?: boolean;
  observeFocus?: boolean;
  observeActive?: boolean;
}

// Longhand-only to avoid shorthand/longhand conflicts during capture/restore.
// e.g., restoring `background` then `backgroundImage=''` would clear the gradient.
const MANAGED_PROPS = [
  'clipPath',
  'backgroundColor', 'backgroundImage', 'backgroundSize',
  'backgroundRepeat', 'backgroundPosition',
  'backgroundOrigin', 'backgroundClip',
  'imageRendering',
  'filter',
  'borderWidth', 'borderStyle', 'borderColor', 'borderRadius',
  'boxShadow',
] as const;

interface ParentFilterSnapshot {
  el: HTMLElement;
  token: symbol;
}

/**
 * Hook that automatically pixelates any HTML element.
 *
 * Applies staircase clip-path, pixel gradient, and hard shadow.
 *
 * The style observer is created inside an effect (not the ref callback),
 * so React 18 StrictMode's simulated unmount/remount re-creates it
 * symmetrically instead of permanently disconnecting it.
 */
export function usePixelRef<T extends HTMLElement = HTMLDivElement>(
  options: UsePixelRefOptions = {},
): React.RefCallback<T> {
  const config = usePixelConfig();
  const pixelSize = options.pixelSize ?? config.pixelSize;
  const enabled = options.enabled ?? true;
  const observeHover = options.observeHover ?? true;
  const observeFocus = options.observeFocus ?? true;
  const observeActive = options.observeActive ?? true;

  const [node, setNode] = useState<T | null>(null);
  const observerRef = useRef<{
    disconnect: () => void;
    pause: () => void;
  } | null>(null);
  const isApplyingRef = useRef(false);
  const originalStylesRef = useRef<Record<string, string> | null>(null);
  const parentFilterTokenRef = useRef(Symbol('react-pixel-ui-shadow'));
  // Track any parent filter registration so it can be released cleanly.
  const parentFilterRef = useRef<ParentFilterSnapshot | null>(null);

  const captureOriginals = useCallback((el: HTMLElement) => {
    const originals: Record<string, string> = {};
    for (const prop of MANAGED_PROPS) {
      originals[prop] = el.style[prop as 'filter'] || '';
    }
    originalStylesRef.current = originals;
  }, []);

  const restoreOriginals = useCallback((el: HTMLElement) => {
    const originals = originalStylesRef.current;
    if (!originals) return;
    for (const prop of MANAGED_PROPS) {
      el.style[prop as 'filter'] = originals[prop] || '';
    }
  }, []);

  const restoreParentFilter = useCallback(() => {
    const snapshot = parentFilterRef.current;
    if (!snapshot) return;
    try {
      releaseManagedParentFilter(snapshot.el, snapshot.token);
    } catch {
      // Parent may have been removed from the DOM — nothing to restore.
    }
    parentFilterRef.current = null;
  }, []);

  const applyPixelArt = useCallback(() => {
    const el = node;
    if (!el || !enabled) return;
    if (isApplyingRef.current) return;
    isApplyingRef.current = true;

    // Pause the observer so our own inline-style writes don't trigger it.
    // The observer resumes after one animation frame, by which point the
    // browser has committed our mutations and they've been drained from
    // the MutationObserver queue.
    observerRef.current?.pause();

    try {
      if (!originalStylesRef.current) captureOriginals(el);

      restoreOriginals(el);
      // Also restore any previously written parent filter before
      // re-measuring, so the new apply cycle starts from a clean state.
      restoreParentFilter();

      // Measure outer (border-box) dimensions so the composite image covers
      // the entire element including the border area. We keep the original
      // border-width but change its color to transparent — this preserves
      // the element's outer box and avoids a content-box layout shift.
      const width = el.offsetWidth;
      const height = el.offsetHeight;
      if (width === 0 || height === 0) return;

      const computed = getComputedStyle(el);
      const artConfig = parseComputedStyles(computed, pixelSize, {
        width,
        height,
      });

      const result = generatePixelArt(width, height, artConfig, {
        want: 'composite',
      });

      if (result.clipPath !== 'none') {
        el.style.clipPath = result.clipPath;
      }

      if (result.compositeImage) {
        // Composite PNG bakes background + border into one image.
        el.style.borderColor = 'transparent';
        el.style.borderRadius = '0';
        el.style.backgroundImage = result.compositeImage;
        el.style.backgroundSize = '100% 100%';
        el.style.backgroundRepeat = 'no-repeat';
        el.style.backgroundOrigin = 'border-box';
        el.style.backgroundClip = 'border-box';
        el.style.imageRendering = 'pixelated';
      } else if (artConfig.backgroundColor || artConfig.borderColor) {
        // The background couldn't be pixelated (url() image,
        // conic-gradient, ...) — leave the element's own background and
        // border alone so it degrades gracefully instead of vanishing.
        el.style.borderRadius = '0';
      }

      // The composer puts the shadow filter on wrapperStyle when a border
      // wrapper is needed and on contentStyle otherwise — check both, or
      // borderless elements silently lose their shadow.
      const shadowFilter = (result.wrapperStyle.filter ??
        result.contentStyle.filter) as string | undefined;

      if (shadowFilter) {
        // Replace the author box-shadow with the pixelated drop-shadow.
        el.style.boxShadow = 'none';

        if (result.clipPath !== 'none' && el.parentElement) {
          // drop-shadow on the SAME element as clip-path gets clipped —
          // apply it to the parent. The manager preserves author filters and
          // coordinates sibling usePixelRef instances sharing this parent.
          const parent = el.parentElement;
          const token = parentFilterTokenRef.current;
          parentFilterRef.current = {
            el: parent,
            token,
          };
          setManagedParentFilter(parent, token, shadowFilter);
        } else {
          el.style.filter = shadowFilter;
        }
      }
    } catch (err) {
      if (process.env.NODE_ENV !== 'production') {
        console.warn('[react-pixel-ui] usePixelRef failed to apply pixel art:', err);
      }
    } finally {
      isApplyingRef.current = false;
    }
  }, [
    node,
    pixelSize,
    enabled,
    captureOriginals,
    restoreOriginals,
    restoreParentFilter,
  ]);

  // Own the whole lifecycle (capture → apply → observe → restore) in one
  // layout effect: StrictMode's mount→cleanup→remount double-invocation
  // tears everything down and recreates it symmetrically, instead of the
  // observer dying with the first simulated unmount.
  useIsomorphicLayoutEffect(() => {
    if (!node || !enabled) return;

    captureOriginals(node);
    applyPixelArt();

    const observer = createStyleObserver(node, {
      onUpdate: () => {
        if (isApplyingRef.current) return;
        applyPixelArt();
      },
      hover: observeHover,
      focus: observeFocus,
      active: observeActive,
      observeStyle: true,
    });
    observerRef.current = observer;

    return () => {
      observer.disconnect();
      observerRef.current = null;
      restoreOriginals(node);
      restoreParentFilter();
      originalStylesRef.current = null;
    };
  }, [
    node,
    enabled,
    applyPixelArt,
    observeHover,
    observeFocus,
    observeActive,
    captureOriginals,
    restoreOriginals,
    restoreParentFilter,
  ]);

  return useCallback((el: T | null) => {
    setNode(el);
  }, []);
}

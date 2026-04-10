import { useCallback, useEffect, useRef } from 'react';
import { generatePixelArt, parseComputedStyles } from '@react-pixel-ui/core';
import { usePixelConfig } from '../context/PixelConfigProvider';
import { createStyleObserver } from '../utils/style-observer';

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
  originalFilter: string;
}

/**
 * Hook that automatically pixelates any HTML element.
 *
 * Applies staircase clip-path, pixel gradient, and hard shadow.
 * For borders, uses the outer clip-path with padding to simulate
 * the border (no wrapper div or pseudo-element needed).
 */
export function usePixelRef<T extends HTMLElement = HTMLDivElement>(
  options: UsePixelRefOptions = {},
): React.RefCallback<T> {
  const config = usePixelConfig();
  const pixelSize = options.pixelSize ?? config.pixelSize;
  const enabled = options.enabled ?? true;

  const elementRef = useRef<T | null>(null);
  const observerRef = useRef<{
    disconnect: () => void;
    pause: () => void;
  } | null>(null);
  const isApplyingRef = useRef(false);
  const originalStylesRef = useRef<Record<string, string> | null>(null);
  const originalPaddingRef = useRef<string>('');
  // Track any parent element we wrote a `filter` to, so we can restore it.
  const parentFilterRef = useRef<ParentFilterSnapshot | null>(null);

  const captureOriginals = useCallback((el: HTMLElement) => {
    const originals: Record<string, string> = {};
    for (const prop of MANAGED_PROPS) {
      originals[prop] = el.style[prop as 'filter'] || '';
    }
    originalStylesRef.current = originals;
    originalPaddingRef.current = el.style.padding || '';
  }, []);

  const restoreOriginals = useCallback((el: HTMLElement) => {
    const originals = originalStylesRef.current;
    if (!originals) return;
    for (const prop of MANAGED_PROPS) {
      el.style[prop as 'filter'] = originals[prop] || '';
    }
    el.style.padding = originalPaddingRef.current;
  }, []);

  const restoreParentFilter = useCallback(() => {
    const snapshot = parentFilterRef.current;
    if (!snapshot) return;
    try {
      snapshot.el.style.filter = snapshot.originalFilter;
    } catch {
      // Parent may have been removed from the DOM — nothing to restore.
    }
    parentFilterRef.current = null;
  }, []);

  const applyPixelArt = useCallback(() => {
    const el = elementRef.current;
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

      const computed = getComputedStyle(el);
      const artConfig = parseComputedStyles(computed, pixelSize);
      // Measure outer (border-box) dimensions so the composite image covers
      // the entire element including the border area. We keep the original
      // border-width but change its color to transparent — this preserves
      // the element's outer box and avoids a content-box layout shift.
      const width = el.offsetWidth;
      const height = el.offsetHeight;
      if (width === 0 || height === 0) return;

      const result = generatePixelArt(width, height, artConfig);

      el.style.borderColor = 'transparent';
      el.style.borderRadius = '0';
      el.style.boxShadow = 'none';

      if (result.clipPath !== 'none') {
        el.style.clipPath = result.clipPath;
      }

      if (result.compositeImage) {
        el.style.backgroundImage = result.compositeImage;
        el.style.backgroundSize = '100% 100%';
        el.style.backgroundRepeat = 'no-repeat';
        el.style.backgroundOrigin = 'border-box';
        el.style.backgroundClip = 'border-box';
        el.style.imageRendering = 'pixelated';
      } else if (result.contentStyle.background) {
        el.style.background = result.contentStyle.background as string;
      }

      // drop-shadow must be on a PARENT element — clip-path clips filter on same element.
      // Snapshot the parent's original filter before writing, so we can restore it
      // on cleanup (ref detach / option change / unmount).
      if (result.wrapperStyle.filter && el.parentElement) {
        const parent = el.parentElement;
        parentFilterRef.current = {
          el: parent,
          originalFilter: parent.style.filter,
        };
        parent.style.filter = result.wrapperStyle.filter as string;
      }
    } catch (err) {
      if (process.env.NODE_ENV !== 'production') {
        // eslint-disable-next-line no-console
        console.warn('[react-pixel-ui] usePixelRef failed to apply pixel art:', err);
      }
    } finally {
      isApplyingRef.current = false;
    }
  }, [pixelSize, enabled, captureOriginals, restoreOriginals, restoreParentFilter]);

  useEffect(() => {
    return () => {
      observerRef.current?.disconnect();
      const el = elementRef.current;
      if (el) restoreOriginals(el);
      restoreParentFilter();
    };
  }, [restoreOriginals, restoreParentFilter]);

  useEffect(() => {
    applyPixelArt();
  }, [applyPixelArt]);

  return useCallback(
    (node: T | null) => {
      observerRef.current?.disconnect();
      if (elementRef.current) restoreOriginals(elementRef.current);
      restoreParentFilter();
      elementRef.current = node;
      originalStylesRef.current = null;

      if (!node || !enabled) return;

      captureOriginals(node);
      applyPixelArt();

      observerRef.current = createStyleObserver(node, {
        onUpdate: () => {
          if (isApplyingRef.current) return;
          applyPixelArt();
        },
        hover: options.observeHover ?? true,
        focus: options.observeFocus ?? true,
        active: options.observeActive ?? true,
        observeStyle: true,
      });
    },
    [applyPixelArt, enabled, captureOriginals, restoreOriginals,
     restoreParentFilter,
     options.observeHover, options.observeFocus, options.observeActive],
  );
}

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
  'backgroundRepeat', 'backgroundPosition', 'imageRendering',
  'filter',
  'borderWidth', 'borderStyle', 'borderColor', 'borderRadius',
  'boxShadow',
] as const;

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
  const observerRef = useRef<{ disconnect: () => void } | null>(null);
  const isApplyingRef = useRef(false);
  const originalStylesRef = useRef<Record<string, string> | null>(null);
  const originalPaddingRef = useRef<string>('');

  const captureOriginals = useCallback((el: HTMLElement) => {
    const originals: Record<string, string> = {};
    for (const prop of MANAGED_PROPS) {
      originals[prop] = el.style[prop as any] || '';
    }
    originalStylesRef.current = originals;
    originalPaddingRef.current = el.style.padding || '';
  }, []);

  const restoreOriginals = useCallback((el: HTMLElement) => {
    const originals = originalStylesRef.current;
    if (!originals) return;
    for (const prop of MANAGED_PROPS) {
      el.style[prop as any] = originals[prop] || '';
    }
    el.style.padding = originalPaddingRef.current;
  }, []);

  const applyPixelArt = useCallback(() => {
    const el = elementRef.current;
    if (!el || !enabled) return;
    if (isApplyingRef.current) return;
    isApplyingRef.current = true;

    try {
      if (!originalStylesRef.current) captureOriginals(el);

      // Restore originals for reading
      restoreOriginals(el);

      const computed = getComputedStyle(el);
      const artConfig = parseComputedStyles(computed, pixelSize);
      const width = el.offsetWidth;
      const height = el.offsetHeight;
      if (width === 0 || height === 0) return;

      const result = generatePixelArt(width, height, artConfig);

      // Always apply directly — no wrapper div, no pseudo-elements
      el.style.borderStyle = 'none';
      el.style.borderRadius = '0';
      el.style.boxShadow = 'none';

      if (result.clipPath !== 'none') {
        el.style.clipPath = result.clipPath;
      }

      // Apply gradient or solid background
      const cs = result.needsWrapper ? result.contentStyle : result.contentStyle;
      const bw = result.needsWrapper ? (artConfig.borderWidth || 0) : 0;

      if (bw > 0) {
        // Border mode: backgroundColor = border color,
        // BMP positioned/sized to inner area
        el.style.backgroundColor = artConfig.borderColor || '';
        if (cs.backgroundImage) {
          el.style.backgroundImage = cs.backgroundImage as string;
          el.style.backgroundSize = `calc(100% - ${bw * 2}px) calc(100% - ${bw * 2}px)`;
          el.style.backgroundPosition = `${bw}px ${bw}px`;
          el.style.backgroundRepeat = 'no-repeat';
          el.style.imageRendering = 'pixelated';
        } else if (cs.background) {
          el.style.background = cs.background as string;
        }
      } else {
        if (cs.backgroundImage) {
          el.style.backgroundImage = cs.backgroundImage as string;
          el.style.backgroundSize = '100% 100%';
          el.style.backgroundRepeat = 'no-repeat';
          el.style.imageRendering = 'pixelated';
        } else if (cs.background) {
          el.style.background = cs.background as string;
        }
      }

      if (result.wrapperStyle.filter) {
        el.style.filter = result.wrapperStyle.filter as string;
      } else if (result.contentStyle.filter) {
        el.style.filter = result.contentStyle.filter as string;
      }
    } finally {
      Promise.resolve().then(() => { isApplyingRef.current = false; });
    }
  }, [pixelSize, enabled, captureOriginals, restoreOriginals]);

  useEffect(() => {
    return () => { observerRef.current?.disconnect(); };
  }, []);

  useEffect(() => {
    applyPixelArt();
  }, [applyPixelArt]);

  return useCallback(
    (node: T | null) => {
      observerRef.current?.disconnect();
      if (elementRef.current) restoreOriginals(elementRef.current);
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
      });
    },
    [applyPixelArt, enabled, captureOriginals, restoreOriginals,
     options.observeHover, options.observeFocus, options.observeActive],
  );
}

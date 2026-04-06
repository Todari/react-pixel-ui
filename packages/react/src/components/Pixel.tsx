import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  isValidElement,
  cloneElement,
} from 'react';
import { generatePixelArt, parseComputedStyles } from '@react-pixel-ui/core';
import { usePixelConfig } from '../context/PixelConfigProvider';
import { createStyleObserver } from '../utils/style-observer';

const useIsomorphicLayoutEffect =
  typeof window !== 'undefined' ? useLayoutEffect : useEffect;

export interface PixelProps {
  size?: number;
  enabled?: boolean;
  observeHover?: boolean;
  observeFocus?: boolean;
  observeActive?: boolean;
  children: React.ReactElement;
}

const MANAGED_PROPS = [
  'clipPath', 'background', 'backgroundColor', 'backgroundImage',
  'backgroundSize', 'backgroundRepeat', 'imageRendering',
  'filter', 'border', 'borderRadius', 'borderColor',
  'borderWidth', 'borderStyle', 'position', 'boxShadow',
  'inset', 'overflow',
] as const;

/**
 * Wrapper component that automatically pixelates its child element.
 * Reads computed styles and applies pixel art via direct DOM manipulation.
 */
export function Pixel({
  size,
  enabled = true,
  observeHover = true,
  observeFocus = true,
  observeActive = true,
  children,
}: PixelProps) {
  const config = usePixelConfig();
  const pixelSize = size ?? config.pixelSize;

  const childRef = useRef<HTMLElement | null>(null);
  const observerRef = useRef<{ disconnect: () => void } | null>(null);
  const prevConfigKeyRef = useRef('');
  const isApplyingRef = useRef(false);
  const originalStylesRef = useRef<Record<string, string> | null>(null);

  const captureOriginals = useCallback((el: HTMLElement) => {
    const originals: Record<string, string> = {};
    for (const prop of MANAGED_PROPS) {
      originals[prop] = el.style[prop as any] || '';
    }
    originalStylesRef.current = originals;
  }, []);

  const restoreOriginals = useCallback((el: HTMLElement) => {
    const originals = originalStylesRef.current;
    if (!originals) return;
    for (const prop of MANAGED_PROPS) {
      el.style[prop as any] = originals[prop] || '';
    }
  }, []);

  const applyPixelArt = useCallback(() => {
    const el = childRef.current;
    if (!el || !enabled) return;
    if (isApplyingRef.current) return;
    isApplyingRef.current = true;

    try {
      if (!originalStylesRef.current) {
        captureOriginals(el);
      }

      // Restore originals so getComputedStyle reads the user's CSS
      restoreOriginals(el);

      const computed = getComputedStyle(el);
      const artConfig = parseComputedStyles(computed, pixelSize);
      const width = el.offsetWidth;
      const height = el.offsetHeight;
      if (width === 0 || height === 0) return;

      const configKey = JSON.stringify(artConfig) + `|${width}x${height}`;
      if (configKey === prevConfigKeyRef.current) return;
      prevConfigKeyRef.current = configKey;

      const result = generatePixelArt(width, height, artConfig);

      // Apply pixel art directly to DOM
      el.style.border = 'none';
      el.style.borderRadius = '0';
      el.style.boxShadow = 'none';

      if (result.clipPath !== 'none') {
        el.style.clipPath = result.clipPath;
      }

      if (result.contentStyle.backgroundImage) {
        el.style.backgroundImage = result.contentStyle.backgroundImage as string;
        el.style.backgroundSize = '100% 100%';
        el.style.backgroundRepeat = 'no-repeat';
        el.style.imageRendering = 'pixelated';
      } else if (result.contentStyle.background) {
        el.style.background = result.contentStyle.background as string;
      }

      if (result.contentStyle.filter) {
        el.style.filter = result.contentStyle.filter as string;
      }
    } finally {
      Promise.resolve().then(() => { isApplyingRef.current = false; });
    }
  }, [pixelSize, enabled, captureOriginals, restoreOriginals]);

  const setRef = useCallback(
    (node: HTMLElement | null) => {
      observerRef.current?.disconnect();
      childRef.current = node;
      originalStylesRef.current = null;
      prevConfigKeyRef.current = '';

      if (!node || !enabled) return;

      captureOriginals(node);
      applyPixelArt();

      observerRef.current = createStyleObserver(node, {
        onUpdate: () => {
          if (isApplyingRef.current) return;
          applyPixelArt();
        },
        hover: observeHover,
        focus: observeFocus,
        active: observeActive,
      });
    },
    [applyPixelArt, enabled, captureOriginals, observeHover, observeFocus, observeActive],
  );

  useEffect(() => {
    return () => observerRef.current?.disconnect();
  }, []);

  useIsomorphicLayoutEffect(() => {
    prevConfigKeyRef.current = '';
    originalStylesRef.current = null;
    applyPixelArt();
  }, [pixelSize]);

  if (!isValidElement(children)) return children;

  const mergedRef = (node: HTMLElement | null) => {
    setRef(node);
    const childRefProp = (children as any).ref;
    if (typeof childRefProp === 'function') childRefProp(node);
    else if (childRefProp && typeof childRefProp === 'object') {
      (childRefProp as React.MutableRefObject<HTMLElement | null>).current = node;
    }
  };

  return cloneElement(children, { ref: mergedRef } as any);
}

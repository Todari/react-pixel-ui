import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  isValidElement,
  cloneElement,
} from 'react';
import { generatePixelArt, parseComputedStyles } from '@react-pixel-ui/core';
import { usePixelConfig } from '../context/PixelConfigProvider';
import { createStyleObserver } from '../utils/style-observer';

const useIsomorphicLayoutEffect =
  typeof window !== 'undefined' ? useLayoutEffect : useEffect;

export interface PixelProps {
  /** Pixel block size (default: from PixelConfigProvider or 4) */
  size?: number;
  /** Enable/disable pixelation (default: true) */
  enabled?: boolean;
  /** Re-compute on hover (default: true) */
  observeHover?: boolean;
  /** Re-compute on focus (default: true) */
  observeFocus?: boolean;
  /** Re-compute on active (default: true) */
  observeActive?: boolean;
  /** Single child element to pixelate */
  children: React.ReactElement;
}

// Properties managed by us — stripped before reading original styles
const MANAGED_PROPS = [
  'clipPath', 'background', 'backgroundColor', 'backgroundImage',
  'backgroundSize', 'backgroundRepeat', 'imageRendering',
  'filter', 'border', 'borderRadius', 'borderColor',
  'borderWidth', 'borderStyle', 'position', 'boxShadow',
] as const;

/**
 * Wrapper component that automatically pixelates its child element.
 * Reads computed styles from the child and applies pixel art transformations.
 *
 * When a border is detected, renders a wrapper div for the border layer.
 * Without border, applies pixel art directly to the child.
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
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const observerRef = useRef<{ disconnect: () => void } | null>(null);
  const prevConfigKeyRef = useRef('');
  const isApplyingRef = useRef(false);
  const [needsWrapper, setNeedsWrapper] = useState(false);

  const applyPixelArt = useCallback(() => {
    const el = childRef.current;
    if (!el || !enabled) return;
    if (isApplyingRef.current) return;
    isApplyingRef.current = true;

    try {
      // 1. Strip managed styles to reveal original CSS
      for (const prop of MANAGED_PROPS) {
        el.style[prop as any] = '';
      }

      // 2. Read original computed styles
      const computed = getComputedStyle(el);
      const artConfig = parseComputedStyles(computed, pixelSize);
      const width = el.offsetWidth;
      const height = el.offsetHeight;
      if (width === 0 || height === 0) return;

      // 3. Diff check
      const configKey = JSON.stringify(artConfig) + `|${width}x${height}`;
      if (configKey === prevConfigKeyRef.current) {
        // Re-apply cached styles (they were stripped in step 1)
        return;
      }
      prevConfigKeyRef.current = configKey;

      // 4. Generate pixel art
      const result = generatePixelArt(width, height, artConfig);

      // 5. Apply — update wrapper state if needed
      if (result.needsWrapper !== needsWrapper) {
        setNeedsWrapper(result.needsWrapper);
      }

      // Apply styles directly to DOM
      if (result.needsWrapper && wrapperRef.current) {
        // Wrapper = border layer
        const w = wrapperRef.current;
        w.style.position = 'relative';
        w.style.width = `${width}px`;
        w.style.height = `${height}px`;
        w.style.backgroundColor = artConfig.borderColor || '';
        if (result.clipPath !== 'none') w.style.clipPath = result.clipPath;
        if (result.wrapperStyle.filter) w.style.filter = result.wrapperStyle.filter as string;

        // Child = content layer
        el.style.position = 'absolute';
        el.style.inset = `${result.contentStyle.inset}`;
        el.style.border = 'none';
        el.style.borderRadius = '0';
        el.style.boxShadow = 'none';
        if (result.innerClipPath && result.innerClipPath !== 'none') {
          el.style.clipPath = result.innerClipPath;
        }
        if (result.contentStyle.backgroundImage) {
          el.style.backgroundImage = result.contentStyle.backgroundImage as string;
          el.style.backgroundSize = '100% 100%';
          el.style.backgroundRepeat = 'no-repeat';
          el.style.imageRendering = 'pixelated';
        } else if (result.contentStyle.background) {
          el.style.background = result.contentStyle.background as string;
        }
      } else if (!result.needsWrapper) {
        // No border — direct apply
        el.style.border = 'none';
        el.style.borderRadius = '0';
        el.style.boxShadow = 'none';
        if (result.clipPath !== 'none') el.style.clipPath = result.clipPath;
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
      }
    } finally {
      Promise.resolve().then(() => {
        isApplyingRef.current = false;
      });
    }
  }, [pixelSize, enabled, needsWrapper]);

  const setRef = useCallback(
    (node: HTMLElement | null) => {
      observerRef.current?.disconnect();
      childRef.current = node;

      if (!node || !enabled) return;

      // Defer initial apply to allow browser to compute styles
      requestAnimationFrame(() => applyPixelArt());

      observerRef.current = createStyleObserver(node, {
        onUpdate: applyPixelArt,
        hover: observeHover,
        focus: observeFocus,
        active: observeActive,
      });
    },
    [applyPixelArt, enabled, observeHover, observeFocus, observeActive],
  );

  useEffect(() => {
    return () => observerRef.current?.disconnect();
  }, []);

  // Re-apply when pixelSize changes
  useIsomorphicLayoutEffect(() => {
    prevConfigKeyRef.current = ''; // force recompute
    applyPixelArt();
  }, [pixelSize]);

  if (!isValidElement(children)) return children;

  // Merge ref
  const mergedRef = (node: HTMLElement | null) => {
    setRef(node);
    const childRefProp = (children as any).ref;
    if (typeof childRefProp === 'function') childRefProp(node);
    else if (childRefProp && typeof childRefProp === 'object') {
      (childRefProp as React.MutableRefObject<HTMLElement | null>).current = node;
    }
  };

  const child = cloneElement(children, { ref: mergedRef } as any);

  if (needsWrapper) {
    return <div ref={wrapperRef}>{child}</div>;
  }

  return child;
}

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
import type { PixelArtStyles } from '@react-pixel-ui/core';
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

/**
 * Wrapper component that automatically pixelates its child element.
 * Reads computed styles from the child and applies pixel art transformations.
 *
 * @example
 * ```tsx
 * <Pixel size={4}>
 *   <div className="bg-red-500 rounded-xl border-2 border-black p-4">
 *     Hello World
 *   </div>
 * </Pixel>
 * ```
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

  const [pixelResult, setPixelResult] = useState<PixelArtStyles | null>(null);

  const computePixelArt = useCallback(() => {
    const el = childRef.current;
    if (!el || !enabled) {
      setPixelResult(null);
      return;
    }

    const width = el.offsetWidth;
    const height = el.offsetHeight;
    if (width === 0 || height === 0) return;

    const computed = getComputedStyle(el);
    const artConfig = parseComputedStyles(computed, pixelSize);

    // Diff check
    const key = JSON.stringify(artConfig) + `|${width}x${height}`;
    if (key === prevConfigKeyRef.current) return;
    prevConfigKeyRef.current = key;

    const result = generatePixelArt(width, height, artConfig);
    setPixelResult(result);
  }, [pixelSize, enabled]);

  // Set up observers when child element mounts
  const setRef = useCallback(
    (node: HTMLElement | null) => {
      observerRef.current?.disconnect();
      childRef.current = node;

      if (!node || !enabled) return;

      // Initial computation
      computePixelArt();

      observerRef.current = createStyleObserver(node, {
        onUpdate: computePixelArt,
        hover: observeHover,
        focus: observeFocus,
        active: observeActive,
      });
    },
    [computePixelArt, enabled, observeHover, observeFocus, observeActive],
  );

  // Cleanup
  useEffect(() => {
    return () => observerRef.current?.disconnect();
  }, []);

  // Re-compute when pixelSize changes
  useIsomorphicLayoutEffect(() => {
    computePixelArt();
  }, [computePixelArt]);

  if (!isValidElement(children)) return children;

  // Merge ref with child's existing ref
  const mergedRef = (node: HTMLElement | null) => {
    setRef(node);
    const childRefProp = (children as any).ref;
    if (typeof childRefProp === 'function') childRefProp(node);
    else if (childRefProp && typeof childRefProp === 'object') {
      (childRefProp as React.MutableRefObject<HTMLElement | null>).current = node;
    }
  };

  // Not yet computed — render child as-is with ref
  if (!pixelResult) {
    return cloneElement(children, { ref: mergedRef } as any);
  }

  const { wrapperStyle, contentStyle, needsWrapper } = pixelResult;

  // Build content style (override original CSS with pixel art)
  const pixelContentStyle: React.CSSProperties = {
    ...(contentStyle as React.CSSProperties),
    border: 'none',
    borderRadius: 0,
    boxShadow: 'none',
  };

  if (needsWrapper) {
    // Render wrapper div for border + cloned child for content
    return (
      <div style={wrapperStyle as React.CSSProperties}>
        {cloneElement(children, {
          ref: mergedRef,
          style: {
            ...((children.props as any).style || {}),
            ...pixelContentStyle,
          },
        } as any)}
      </div>
    );
  }

  // No border — apply directly to child
  return cloneElement(children, {
    ref: mergedRef,
    style: {
      ...((children.props as any).style || {}),
      ...pixelContentStyle,
    },
  } as any);
}

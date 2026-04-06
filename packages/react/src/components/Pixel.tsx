import React, {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  isValidElement,
  cloneElement,
} from 'react';
import { generatePixelArt, parseComputedStyles } from '@react-pixel-ui/core';
import type { PixelArtConfig } from '@react-pixel-ui/core';
import { usePixelConfig } from '../context/PixelConfigProvider';

const useIsomorphicLayoutEffect =
  typeof window !== 'undefined' ? useLayoutEffect : useEffect;

export interface PixelProps {
  size?: number;
  enabled?: boolean;
  children: React.ReactElement;
}

/**
 * Wrapper component that automatically pixelates its child element.
 *
 * Phase 1: Renders child as-is to measure computed styles.
 * Phase 2: Re-renders with pixel art styles applied via cloneElement.
 */
export function Pixel({
  size,
  enabled = true,
  children,
}: PixelProps) {
  const config = usePixelConfig();
  const pixelSize = size ?? config.pixelSize;

  const childRef = useRef<HTMLElement | null>(null);
  // Store parsed config from the original CSS (read once before pixel art)
  const [artState, setArtState] = useState<{
    config: PixelArtConfig;
    width: number;
    height: number;
  } | null>(null);

  // Reset when pixelSize changes — forces re-read of original styles
  // (without this, the layout effect reads already-pixelated styles)
  useEffect(() => {
    setArtState(null);
  }, [pixelSize]);

  // Read computed styles when artState is null (before pixel art is applied)
  useIsomorphicLayoutEffect(() => {
    if (artState !== null) return; // already computed
    const el = childRef.current;
    if (!el || !enabled) return;

    const computed = getComputedStyle(el);
    const artConfig = parseComputedStyles(computed, pixelSize);
    // Compute the dimensions the element WILL have after we remove its border.
    // border-box: element keeps its offsetWidth (border is inside the box)
    // content-box: element shrinks to clientWidth (border was outside the box)
    const boxSizing = computed.boxSizing;
    const width = boxSizing === 'border-box' ? el.offsetWidth : el.clientWidth;
    const height = boxSizing === 'border-box' ? el.offsetHeight : el.clientHeight;

    if (width > 0 && height > 0) {
      setArtState({ config: artConfig, width, height });
    }
  }, [artState, pixelSize, enabled]);

  if (!isValidElement(children) || !enabled) return children;

  // Merge ref with child's existing ref
  const mergedRef = (node: HTMLElement | null) => {
    childRef.current = node;
    const childRefProp = (children as any).ref;
    if (typeof childRefProp === 'function') childRefProp(node);
    else if (childRefProp && typeof childRefProp === 'object') {
      (childRefProp as React.MutableRefObject<HTMLElement | null>).current = node;
    }
  };

  // Phase 1: no pixel art yet — render child as-is with ref to measure
  if (!artState) {
    return cloneElement(children, { ref: mergedRef } as any);
  }

  // Phase 2: generate pixel art and apply via style override
  const result = generatePixelArt(artState.width, artState.height, artState.config);

  const pixelStyle: React.CSSProperties = {
    background: 'none',
    border: 'none',
    borderRadius: 0,
    boxShadow: 'none',
  };

  if (result.clipPath !== 'none') {
    pixelStyle.clipPath = result.clipPath;
  }

  // Use composite image (border + gradient baked into one BMP)
  if (result.compositeImage) {
    pixelStyle.backgroundImage = result.compositeImage;
    pixelStyle.backgroundSize = '100% 100%';
    pixelStyle.backgroundRepeat = 'no-repeat';
    pixelStyle.imageRendering = 'pixelated';
  } else if (result.contentStyle.background) {
    pixelStyle.background = result.contentStyle.background as string;
  }

  if (result.wrapperStyle.filter) {
    pixelStyle.filter = result.wrapperStyle.filter as string;
  } else if (result.contentStyle.filter) {
    pixelStyle.filter = result.contentStyle.filter as string;
  }

  const childProps = children.props as any;
  return cloneElement(children, {
    ref: mergedRef,
    style: { ...(childProps.style || {}), ...pixelStyle },
  } as any);
}

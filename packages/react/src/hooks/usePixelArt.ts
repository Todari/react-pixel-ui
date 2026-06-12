import { useMemo } from 'react';
import { generatePixelArt } from '@react-pixel-ui/core';
import type { PixelArtConfig } from '@react-pixel-ui/core';

export interface UsePixelArtResult {
  /** Style for the outer wrapper div (border layer) */
  wrapperStyle: React.CSSProperties;
  /** Style for the inner content div */
  contentStyle: React.CSSProperties;
  /** Whether a wrapper div is needed (true when border is specified) */
  needsWrapper: boolean;
  /** Outer clip-path polygon string */
  clipPath: string;
  /** Inner clip-path polygon string (null if no border) */
  innerClipPath: string | null;
}

/**
 * Main hook for generating pixel art styles.
 *
 * Transforms PixelArtConfig into CSS styles using clip-path polygons,
 * stepped gradients, and drop-shadow filters.
 *
 * @param width - Element width in CSS px
 * @param height - Element height in CSS px
 * @param config - Pixel art configuration
 * @returns Styles and metadata for rendering
 */
export function usePixelArt(
  width: number,
  height: number,
  config: PixelArtConfig,
): UsePixelArtResult {
  const {
    pixelSize,
    borderRadius,
    borderWidth,
    borderColor,
    backgroundColor,
    shadow,
  } = config;
  // Extract shadow and radius fields to primitive locals so the memo
  // compares by value — an inline per-corner array (`borderRadius={[8,8,
  // 0,0]}`) is a fresh reference every render and would otherwise defeat
  // the memo, regenerating the PNG on every parent re-render. This also
  // lets the exhaustive-deps linter verify the dependencies.
  const shadowX = shadow?.x;
  const shadowY = shadow?.y;
  const shadowColor = shadow?.color;
  const [radiusTL, radiusTR, radiusBR, radiusBL] = Array.isArray(borderRadius)
    ? borderRadius
    : [borderRadius, borderRadius, borderRadius, borderRadius];

  return useMemo(() => {
    const allSame =
      radiusTL === radiusTR && radiusTR === radiusBR && radiusBR === radiusBL;
    const result = generatePixelArt(
      width,
      height,
      {
        pixelSize,
        borderRadius: allSame
          ? radiusTL
          : [radiusTL ?? 0, radiusTR ?? 0, radiusBR ?? 0, radiusBL ?? 0],
        borderWidth,
        borderColor,
        backgroundColor,
        shadow:
          shadowX !== undefined && shadowY !== undefined && shadowColor
            ? { x: shadowX, y: shadowY, color: shadowColor }
            : undefined,
      },
      // The composite PNG output is not part of this hook's result —
      // skip generating it.
      { want: 'styles' },
    );

    return {
      wrapperStyle: result.wrapperStyle as React.CSSProperties,
      contentStyle: result.contentStyle as React.CSSProperties,
      needsWrapper: result.needsWrapper,
      clipPath: result.clipPath,
      innerClipPath: result.innerClipPath,
    };
  }, [
    width,
    height,
    pixelSize,
    radiusTL,
    radiusTR,
    radiusBR,
    radiusBL,
    borderWidth,
    borderColor,
    backgroundColor,
    shadowX,
    shadowY,
    shadowColor,
  ]);
}

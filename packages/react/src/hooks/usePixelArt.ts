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

  return useMemo(() => {
    const result = generatePixelArt(width, height, {
      pixelSize,
      borderRadius,
      borderWidth,
      borderColor,
      backgroundColor,
      shadow,
    });

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
    borderRadius,
    borderWidth,
    borderColor,
    backgroundColor,
    shadow?.x,
    shadow?.y,
    shadow?.color,
  ]);
}

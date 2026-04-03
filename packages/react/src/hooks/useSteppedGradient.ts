import { useMemo } from 'react';
import { generateSteppedGradient } from '@react-pixel-ui/core';

/**
 * Low-level hook for converting a CSS gradient into a stepped (pixelated) version.
 * Use this when you only need gradient conversion without other pixel art features.
 *
 * @param gradient - CSS gradient string
 * @param pixelSize - Pixel grid size for band width
 * @param width - Element width in CSS px
 * @param height - Element height in CSS px
 * @returns Stepped gradient CSS string, or the original if parsing fails
 */
export function useSteppedGradient(
  gradient: string,
  pixelSize: number,
  width: number,
  height: number,
): string {
  return useMemo(() => {
    return generateSteppedGradient(gradient, pixelSize, width, height) ?? gradient;
  }, [gradient, pixelSize, width, height]);
}

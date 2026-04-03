import { useMemo } from 'react';
import {
  generateStaircasePolygon,
  parseBorderRadius,
} from '@react-pixel-ui/core';

/**
 * Low-level hook for generating staircase clip-path polygons.
 * Use this when you only need the clip-path without other pixel art features.
 *
 * @param width - Element width in CSS px
 * @param height - Element height in CSS px
 * @param borderRadius - Border radius (single value or per-corner array)
 * @param pixelSize - Pixel grid size
 * @returns clip-path polygon CSS string
 */
export function useStaircaseClip(
  width: number,
  height: number,
  borderRadius: number | [number, number, number, number],
  pixelSize: number,
): string {
  return useMemo(() => {
    const radii = parseBorderRadius(borderRadius);
    return generateStaircasePolygon(width, height, radii, pixelSize);
  }, [width, height, borderRadius, pixelSize]);
}

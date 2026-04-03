import { snapToGrid } from '../utils/math';

/**
 * Generate a CSS filter: drop-shadow() value for hard pixel shadows.
 *
 * The shadow offset is snapped to the pixel grid and blur is always 0,
 * creating a crisp, retro shadow that follows the element's clip-path contour.
 *
 * @param x - Horizontal offset in CSS px
 * @param y - Vertical offset in CSS px
 * @param color - Shadow color (any CSS color string)
 * @param pixelSize - Pixel grid size for snapping
 * @returns CSS filter value string
 */
export function generatePixelShadow(
  x: number,
  y: number,
  color: string,
  pixelSize: number,
): string {
  // Snap offsets to pixel grid
  const snappedX = snapToGrid(x, pixelSize) || pixelSize;
  const snappedY = snapToGrid(y, pixelSize) || pixelSize;

  return `drop-shadow(${snappedX}px ${snappedY}px 0 ${color})`;
}

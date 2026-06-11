import { sanitizePixelSize } from '../utils/math';

/**
 * Generate a CSS filter: drop-shadow() value for hard pixel shadows.
 *
 * The shadow offset is snapped to the pixel grid and blur is always 0,
 * creating a crisp, retro shadow that follows the element's clip-path contour.
 *
 * Offsets snap to the NEAREST grid line and zero offsets stay zero, so a
 * straight shadow (e.g. `box-shadow: 0 4px`) stays straight instead of
 * turning diagonal.
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
  const ps = sanitizePixelSize(pixelSize);
  const snappedX = Math.round(x / ps) * ps;
  const snappedY = Math.round(y / ps) * ps;

  return `drop-shadow(${snappedX}px ${snappedY}px 0 ${color})`;
}

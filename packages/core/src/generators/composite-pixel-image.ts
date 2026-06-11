import type { BorderRadii, RGBAColor } from '../types';
import { isCellInsideCircle, sanitizePixelSize } from '../utils/math';
import { parseColor } from '../utils/color';
import { parseGradient } from '../utils/gradient-parser';
import { encodePNG } from '../utils/png';
import { sampleGradient2D } from './pixel-gradient';

const TRANSPARENT: RGBAColor = { r: 0, g: 0, b: 0, a: 0 };

/**
 * Generate a composite PNG that includes both border and gradient
 * with staircase corners baked into the image.
 *
 * Each pixel block is:
 * - Fully transparent if outside the outer staircase shape
 * - Border color if between outer and inner staircase
 * - Gradient/solid color if inside the inner staircase
 * - Transparent in the content area when no background is specified
 *
 * This eliminates the rectangular-gradient-inside-staircase problem
 * where diagonal corner borders disappear.
 *
 * Returns null when there is nothing parseable to draw — including when
 * a background is PRESENT but unsupported (url() images, conic-gradient,
 * etc.). Consumers must treat null as "leave the element's own styles
 * alone" so unsupported backgrounds degrade gracefully instead of being
 * replaced by a transparent image.
 */
export function generateCompositePixelImage(
  width: number,
  height: number,
  pixelSize: number,
  outerRadii: BorderRadii,
  borderWidth: number,
  borderColor: string | undefined,
  backgroundColor: string | undefined,
): string | null {
  if (!backgroundColor && !borderColor) return null;

  const ps = sanitizePixelSize(pixelSize);
  const cols = Math.max(1, Math.ceil(width / ps));
  const rows = Math.max(1, Math.ceil(height / ps));

  // Parse colors
  const parsedBorderColor = borderColor ? parseColor(borderColor) : null;
  const gradient = backgroundColor ? parseGradient(backgroundColor) : null;
  const solidBg =
    !gradient && backgroundColor ? parseColor(backgroundColor) : null;

  // A background was specified but we can't parse it (url() image,
  // conic-gradient, var() that didn't resolve, ...). Bail out so the
  // caller keeps the original CSS instead of erasing it.
  if (backgroundColor && !gradient && !solidBg) return null;

  // Nothing to draw at all (e.g. border specified with unparseable color)
  const hasBorder = borderWidth > 0 && !!parsedBorderColor;
  if (!hasBorder && !gradient && !solidBg) return null;

  // Inner dimensions and radii
  const innerW = width - borderWidth * 2;
  const innerH = height - borderWidth * 2;
  const innerRadii: BorderRadii = {
    topLeft: Math.max(0, outerRadii.topLeft - borderWidth),
    topRight: Math.max(0, outerRadii.topRight - borderWidth),
    bottomRight: Math.max(0, outerRadii.bottomRight - borderWidth),
    bottomLeft: Math.max(0, outerRadii.bottomLeft - borderWidth),
  };

  const pixels: RGBAColor[] = [];

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      // Map PNG pixel to DISPLAY coordinates (not grid coordinates)
      // This prevents edge artifacts when dimensions aren't multiples of pixelSize
      const cx = ((col + 0.5) / cols) * width;
      const cy = ((row + 0.5) / rows) * height;

      // 1. Outside outer shape → fully transparent
      if (!isInsideShape(cx, cy, width, height, outerRadii, ps)) {
        pixels.push(TRANSPARENT);
        continue;
      }

      // 2. Border area (between outer and inner)
      if (hasBorder) {
        const innerCx = cx - borderWidth;
        const innerCy = cy - borderWidth;

        if (!isInsideShape(innerCx, innerCy, innerW, innerH, innerRadii, ps)) {
          pixels.push(parsedBorderColor || TRANSPARENT);
          continue;
        }
      }

      // 3. Content area — gradient, solid, or transparent (no background).
      // A border-only element keeps a transparent interior so whatever is
      // behind the element stays visible, matching CSS semantics.
      if (gradient) {
        const color = sampleGradient2D(gradient, cx, cy, width, height);
        pixels.push(color);
      } else if (solidBg) {
        pixels.push(solidBg);
      } else {
        pixels.push(TRANSPARENT);
      }
    }
  }

  return encodePNG(cols, rows, pixels);
}

/**
 * Check if a point is inside a staircase-rounded rectangle.
 */
function isInsideShape(
  px: number,
  py: number,
  width: number,
  height: number,
  radii: BorderRadii,
  pixelSize: number,
): boolean {
  // Outside the bounding rectangle
  if (px < 0 || py < 0 || px >= width || py >= height) return false;

  // Check each corner region
  // Top-left
  if (px < radii.topLeft && py < radii.topLeft) {
    const col = Math.floor(px / pixelSize);
    const row = Math.floor(py / pixelSize);
    return isCellInsideCircle(col, row, radii.topLeft, pixelSize);
  }
  // Top-right
  if (px >= width - radii.topRight && py < radii.topRight) {
    const localX = width - px;
    const col = Math.floor(localX / pixelSize);
    const row = Math.floor(py / pixelSize);
    return isCellInsideCircle(col, row, radii.topRight, pixelSize);
  }
  // Bottom-right
  if (px >= width - radii.bottomRight && py >= height - radii.bottomRight) {
    const localX = width - px;
    const localY = height - py;
    const col = Math.floor(localX / pixelSize);
    const row = Math.floor(localY / pixelSize);
    return isCellInsideCircle(col, row, radii.bottomRight, pixelSize);
  }
  // Bottom-left
  if (px < radii.bottomLeft && py >= height - radii.bottomLeft) {
    const col = Math.floor(px / pixelSize);
    const localY = height - py;
    const row = Math.floor(localY / pixelSize);
    return isCellInsideCircle(col, row, radii.bottomLeft, pixelSize);
  }

  // Not in any corner region → inside
  return true;
}

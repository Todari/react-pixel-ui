import type { BorderRadii, RGBAColor, ParsedGradient } from '../types';
import { isCellInsideCircle } from '../utils/math';
import { parseColor, sampleGradient } from '../utils/color';
import { parseGradient } from '../utils/gradient-parser';
import { clamp } from '../utils/math';
import { encodePNG } from '../utils/png';

const TRANSPARENT: RGBAColor = { r: 0, g: 0, b: 0, a: 0 };

/**
 * Generate a composite PNG that includes both border and gradient
 * with staircase corners baked into the image.
 *
 * Each pixel block is:
 * - Fully transparent if outside the outer staircase shape
 * - Border color if between outer and inner staircase
 * - Gradient/solid color if inside the inner staircase
 *
 * This eliminates the rectangular-gradient-inside-staircase problem
 * where diagonal corner borders disappear.
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

  const cols = Math.max(1, Math.ceil(width / pixelSize));
  const rows = Math.max(1, Math.ceil(height / pixelSize));

  // Parse colors
  const parsedBorderColor = borderColor ? parseColor(borderColor) : null;
  const gradient = backgroundColor
    ? parseGradient(backgroundColor)
    : null;
  const solidBg = !gradient && backgroundColor
    ? parseColor(backgroundColor)
    : null;

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
      const cx = (col + 0.5) / cols * width;
      const cy = (row + 0.5) / rows * height;

      // 1. Outside outer shape → fully transparent
      if (!isInsideShape(cx, cy, width, height, outerRadii, pixelSize)) {
        pixels.push(TRANSPARENT);
        continue;
      }

      // 2. Border area (between outer and inner)
      if (borderWidth > 0) {
        const innerCx = cx - borderWidth;
        const innerCy = cy - borderWidth;

        if (!isInsideShape(innerCx, innerCy, innerW, innerH, innerRadii, pixelSize)) {
          pixels.push(parsedBorderColor || TRANSPARENT);
          continue;
        }
      }

      // 3. Content area — gradient or solid
      if (gradient) {
        const color = sampleGradient2D(gradient, cx, cy, width, height);
        pixels.push(color);
      } else if (solidBg) {
        pixels.push(solidBg);
      } else {
        pixels.push(parsedBorderColor || TRANSPARENT);
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

/** Sample gradient at a 2D position */
function sampleGradient2D(
  gradient: ParsedGradient,
  px: number,
  py: number,
  width: number,
  height: number,
): RGBAColor {
  if (gradient.type === 'radial') {
    const cx = width / 2, cy = height / 2;
    const maxDist = Math.sqrt(cx * cx + cy * cy);
    const dist = Math.sqrt((px - cx) * (px - cx) + (py - cy) * (py - cy));
    return sampleGradient(gradient.stops, clamp(dist / maxDist, 0, 1));
  }
  const angleRad = (gradient.angle * Math.PI) / 180;
  const dirX = Math.sin(angleRad);
  const dirY = -Math.cos(angleRad);
  const gradientLength =
    Math.abs(width * Math.sin(angleRad)) + Math.abs(height * Math.cos(angleRad));
  if (gradientLength === 0) return sampleGradient(gradient.stops, 0.5);
  const dot = (px - width / 2) * dirX + (py - height / 2) * dirY;
  return sampleGradient(gradient.stops, clamp(dot / gradientLength + 0.5, 0, 1));
}

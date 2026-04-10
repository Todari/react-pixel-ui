import type { ParsedGradient, RGBAColor } from '../types';
import { parseGradient } from '../utils/gradient-parser';
import { sampleGradient } from '../utils/color';
import { clamp } from '../utils/math';
import { encodePNG } from '../utils/png';

/**
 * Generate a pixel-art gradient as a tiny PNG data URL.
 *
 * Each pixel in the PNG corresponds to one pixelSize×pixelSize block.
 * The gradient is sampled at the center of each block in 2D,
 * producing true square pixel blocks instead of diagonal bands.
 *
 * Apply with:
 *   background-image: url(...)
 *   background-size: 100% 100%
 *   image-rendering: pixelated / crisp-edges
 */
export function generatePixelGradient(
  cssGradient: string,
  pixelSize: number,
  width: number,
  height: number,
): string | null {
  const parsed = parseGradient(cssGradient);
  if (!parsed) return null;

  const cols = Math.max(1, Math.ceil(width / pixelSize));
  const rows = Math.max(1, Math.ceil(height / pixelSize));

  // Sample gradient at each pixel block center
  const pixels: RGBAColor[] = [];
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const px = (col + 0.5) * pixelSize;
      const py = (row + 0.5) * pixelSize;
      const color = sampleGradient2D(parsed, px, py, width, height);
      pixels.push(color);
    }
  }

  return encodePNG(cols, rows, pixels);
}

/**
 * Sample a gradient at a 2D position within the element.
 */
function sampleGradient2D(
  gradient: ParsedGradient,
  px: number,
  py: number,
  width: number,
  height: number,
): RGBAColor {
  if (gradient.type === 'radial') {
    // Radial: distance from center
    const cx = width / 2;
    const cy = height / 2;
    const maxDist = Math.sqrt(cx * cx + cy * cy);
    const dist = Math.sqrt((px - cx) * (px - cx) + (py - cy) * (py - cy));
    const t = clamp(dist / maxDist, 0, 1);
    return sampleGradient(gradient.stops, t);
  }

  // Linear: project point onto gradient line
  // CSS convention: 0deg = to top, 90deg = to right (clockwise)
  const angleRad = (gradient.angle * Math.PI) / 180;
  const dirX = Math.sin(angleRad);
  const dirY = -Math.cos(angleRad);
  const gradientLength =
    Math.abs(width * Math.sin(angleRad)) +
    Math.abs(height * Math.cos(angleRad));

  if (gradientLength === 0) {
    return sampleGradient(gradient.stops, 0.5);
  }

  const dot = (px - width / 2) * dirX + (py - height / 2) * dirY;
  const t = clamp(dot / gradientLength + 0.5, 0, 1);
  return sampleGradient(gradient.stops, t);
}

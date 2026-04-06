import type { BorderRadii, RGBAColor, ParsedGradient } from '../types';
import { isCellInsideCircle } from '../utils/math';
import { parseColor, sampleGradient } from '../utils/color';
import { parseGradient } from '../utils/gradient-parser';
import { clamp } from '../utils/math';

/**
 * Generate a composite BMP that includes both border and gradient
 * with staircase corners baked into the image.
 *
 * Each pixel block is:
 * - Transparent if outside the outer staircase shape
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
      // Map BMP pixel to DISPLAY coordinates (not grid coordinates)
      // This prevents edge artifacts when dimensions aren't multiples of pixelSize
      const cx = (col + 0.5) / cols * width;
      const cy = (row + 0.5) / rows * height;

      // 1. Outside outer shape → use border color or black (BMP has no transparency)
      if (!isInsideShape(cx, cy, width, height, outerRadii, pixelSize)) {
        pixels.push(parsedBorderColor || { r: 0, g: 0, b: 0, a: 1 });
        continue;
      }

      // 2. Border area (between outer and inner)
      if (borderWidth > 0) {
        const innerCx = cx - borderWidth;
        const innerCy = cy - borderWidth;

        if (!isInsideShape(innerCx, innerCy, innerW, innerH, innerRadii, pixelSize)) {
          pixels.push(parsedBorderColor || { r: 0, g: 0, b: 0, a: 1 });
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
        pixels.push(parsedBorderColor || { r: 0, g: 0, b: 0, a: 1 });
      }
    }
  }

  const bmpBase64 = encodeBMP(cols, rows, pixels);
  return `url("data:image/bmp;base64,${bmpBase64}")`;
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

// --- BMP encoding (same as pixel-gradient.ts) ---

function encodeBMP(width: number, height: number, pixels: RGBAColor[]): string {
  const rowBytes = width * 3;
  const rowPadding = (4 - (rowBytes % 4)) % 4;
  const paddedRowBytes = rowBytes + rowPadding;
  const pixelDataSize = paddedRowBytes * height;
  const fileSize = 54 + pixelDataSize;
  const bytes: number[] = new Array(fileSize);

  bytes[0] = 0x42; bytes[1] = 0x4d;
  writeLE32(bytes, 2, fileSize);
  writeLE32(bytes, 6, 0);
  writeLE32(bytes, 10, 54);
  writeLE32(bytes, 14, 40);
  writeLE32(bytes, 18, width);
  writeLE32(bytes, 22, height);
  writeLE16(bytes, 26, 1);
  writeLE16(bytes, 28, 24);
  writeLE32(bytes, 30, 0);
  writeLE32(bytes, 34, pixelDataSize);
  writeLE32(bytes, 38, 0);
  writeLE32(bytes, 42, 0);
  writeLE32(bytes, 46, 0);
  writeLE32(bytes, 50, 0);

  for (let row = 0; row < height; row++) {
    const srcRow = height - 1 - row;
    const rowOffset = 54 + row * paddedRowBytes;
    for (let col = 0; col < width; col++) {
      const pixel = pixels[srcRow * width + col];
      const i = rowOffset + col * 3;
      bytes[i] = pixel.b;
      bytes[i + 1] = pixel.g;
      bytes[i + 2] = pixel.r;
    }
    for (let p = 0; p < rowPadding; p++) {
      bytes[rowOffset + rowBytes + p] = 0;
    }
  }
  return toBase64(bytes);
}

function writeLE16(a: number[], o: number, v: number) { a[o]=v&0xff; a[o+1]=(v>>8)&0xff; }
function writeLE32(a: number[], o: number, v: number) { a[o]=v&0xff; a[o+1]=(v>>8)&0xff; a[o+2]=(v>>16)&0xff; a[o+3]=(v>>24)&0xff; }

const B64 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
function toBase64(bytes: number[]): string {
  let r = '';
  for (let i = 0; i < bytes.length; i += 3) {
    const b0 = bytes[i], b1 = bytes[i+1]??0, b2 = bytes[i+2]??0;
    r += B64[b0>>2];
    r += B64[((b0&3)<<4)|(b1>>4)];
    r += i+1<bytes.length ? B64[((b1&15)<<2)|(b2>>6)] : '=';
    r += i+2<bytes.length ? B64[b2&63] : '=';
  }
  return r;
}

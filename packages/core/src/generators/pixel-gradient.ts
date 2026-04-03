import type { ParsedGradient, RGBAColor } from '../types';
import { parseGradient } from '../utils/gradient-parser';
import { sampleGradient } from '../utils/color';
import { clamp } from '../utils/math';

/**
 * Generate a pixel-art gradient as a tiny BMP data URL.
 *
 * Each pixel in the BMP corresponds to one pixelSize×pixelSize block.
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

  // Encode as BMP data URL
  const bmpBase64 = encodeBMP(cols, rows, pixels);
  return `url("data:image/bmp;base64,${bmpBase64}")`;
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

// --- BMP encoding (pure JS, no browser/Node APIs) ---

/** Encode pixel data into a 24-bit BMP as a base64 string */
function encodeBMP(
  width: number,
  height: number,
  pixels: RGBAColor[],
): string {
  const rowBytes = width * 3;
  const rowPadding = (4 - (rowBytes % 4)) % 4;
  const paddedRowBytes = rowBytes + rowPadding;
  const pixelDataSize = paddedRowBytes * height;
  const fileSize = 54 + pixelDataSize;

  const bytes: number[] = new Array(fileSize);

  // --- BMP File Header (14 bytes) ---
  bytes[0] = 0x42; // 'B'
  bytes[1] = 0x4d; // 'M'
  writeLE32(bytes, 2, fileSize);
  writeLE32(bytes, 6, 0); // reserved
  writeLE32(bytes, 10, 54); // pixel data offset

  // --- DIB Header / BITMAPINFOHEADER (40 bytes) ---
  writeLE32(bytes, 14, 40); // header size
  writeLE32(bytes, 18, width);
  writeLE32(bytes, 22, height); // positive = bottom-up rows
  writeLE16(bytes, 26, 1); // color planes
  writeLE16(bytes, 28, 24); // bits per pixel
  writeLE32(bytes, 30, 0); // compression (BI_RGB)
  writeLE32(bytes, 34, pixelDataSize);
  writeLE32(bytes, 38, 0); // h pixels/meter
  writeLE32(bytes, 42, 0); // v pixels/meter
  writeLE32(bytes, 46, 0); // colors used
  writeLE32(bytes, 50, 0); // important colors

  // --- Pixel Data (bottom-up, BGR order) ---
  for (let row = 0; row < height; row++) {
    // BMP rows are bottom-up: first row in file = last row visually
    const srcRow = height - 1 - row;
    const rowOffset = 54 + row * paddedRowBytes;

    for (let col = 0; col < width; col++) {
      const pixel = pixels[srcRow * width + col];
      const i = rowOffset + col * 3;
      bytes[i] = pixel.b; // BMP uses BGR order
      bytes[i + 1] = pixel.g;
      bytes[i + 2] = pixel.r;
    }

    // Padding bytes (0)
    for (let p = 0; p < rowPadding; p++) {
      bytes[rowOffset + rowBytes + p] = 0;
    }
  }

  return toBase64(bytes);
}

function writeLE16(arr: number[], offset: number, value: number): void {
  arr[offset] = value & 0xff;
  arr[offset + 1] = (value >> 8) & 0xff;
}

function writeLE32(arr: number[], offset: number, value: number): void {
  arr[offset] = value & 0xff;
  arr[offset + 1] = (value >> 8) & 0xff;
  arr[offset + 2] = (value >> 16) & 0xff;
  arr[offset + 3] = (value >> 24) & 0xff;
}

const B64_CHARS =
  'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

/** Pure JS base64 encoder — no btoa/Buffer dependency */
function toBase64(bytes: number[]): string {
  let result = '';
  const len = bytes.length;

  for (let i = 0; i < len; i += 3) {
    const b0 = bytes[i];
    const b1 = i + 1 < len ? bytes[i + 1] : 0;
    const b2 = i + 2 < len ? bytes[i + 2] : 0;

    result += B64_CHARS[b0 >> 2];
    result += B64_CHARS[((b0 & 3) << 4) | (b1 >> 4)];
    result += i + 1 < len ? B64_CHARS[((b1 & 15) << 2) | (b2 >> 6)] : '=';
    result += i + 2 < len ? B64_CHARS[b2 & 63] : '=';
  }

  return result;
}

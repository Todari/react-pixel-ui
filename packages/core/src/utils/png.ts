import type { RGBAColor } from '../types';

/**
 * Encode RGBA pixels as a minimal PNG data URL.
 *
 * Uses uncompressed deflate ("stored") blocks — no actual compression,
 * which keeps the encoder small and fast. File size is ~4× raw pixels.
 *
 * Pure JS; no Canvas, Buffer, or btoa dependency. SSR-safe.
 */
export function encodePNG(
  width: number,
  height: number,
  pixels: RGBAColor[],
): string {
  const bytes: number[] = [];

  // PNG magic (8 bytes)
  bytes.push(0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a);

  // IHDR chunk
  const ihdr: number[] = new Array(13);
  writeUint32BE(ihdr, 0, width);
  writeUint32BE(ihdr, 4, height);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // color type: RGBA
  ihdr[10] = 0; // compression method
  ihdr[11] = 0; // filter method
  ihdr[12] = 0; // interlace method
  writeChunk(bytes, 'IHDR', ihdr);

  // IDAT: raw pixel data wrapped in zlib (stored blocks)
  const rowStride = 1 + width * 4; // 1 filter byte + RGBA
  const raw: number[] = new Array(height * rowStride);
  let o = 0;
  for (let y = 0; y < height; y++) {
    raw[o++] = 0; // filter: None
    const rowStart = y * width;
    for (let x = 0; x < width; x++) {
      const p = pixels[rowStart + x];
      if (p) {
        raw[o++] = p.r & 0xff;
        raw[o++] = p.g & 0xff;
        raw[o++] = p.b & 0xff;
        raw[o++] = Math.round(p.a * 255) & 0xff;
      } else {
        raw[o++] = 0;
        raw[o++] = 0;
        raw[o++] = 0;
        raw[o++] = 0;
      }
    }
  }
  writeChunk(bytes, 'IDAT', deflateStored(raw));

  // IEND chunk
  writeChunk(bytes, 'IEND', []);

  return `url("data:image/png;base64,${toBase64(bytes)}")`;
}

// --- PNG chunk writing ---

function writeChunk(out: number[], type: string, data: number[]): void {
  const length = data.length;
  out.push(
    (length >>> 24) & 0xff,
    (length >>> 16) & 0xff,
    (length >>> 8) & 0xff,
    length & 0xff,
  );

  const typeStart = out.length;
  out.push(
    type.charCodeAt(0),
    type.charCodeAt(1),
    type.charCodeAt(2),
    type.charCodeAt(3),
  );

  // Append data in chunks to avoid stack overflow on large arrays
  const BATCH = 4096;
  for (let i = 0; i < data.length; i += BATCH) {
    const end = Math.min(i + BATCH, data.length);
    for (let j = i; j < end; j++) out.push(data[j]);
  }

  // CRC32 over type + data
  let crc = 0xffffffff;
  for (let i = typeStart; i < out.length; i++) {
    crc = CRC_TABLE[(crc ^ out[i]) & 0xff] ^ (crc >>> 8);
  }
  crc = (crc ^ 0xffffffff) >>> 0;
  out.push(
    (crc >>> 24) & 0xff,
    (crc >>> 16) & 0xff,
    (crc >>> 8) & 0xff,
    crc & 0xff,
  );
}

// --- Deflate: stored blocks (no compression) ---

function deflateStored(data: number[]): number[] {
  const out: number[] = [];

  // zlib header: CMF=0x78 (deflate, 32K window), FLG=0x01 (no preset, level 0)
  // 0x7801 % 31 === 0 (zlib checksum requirement)
  out.push(0x78, 0x01);

  const MAX_BLOCK = 65535;
  let pos = 0;
  if (data.length === 0) {
    // Empty stored final block
    out.push(0x01, 0x00, 0x00, 0xff, 0xff);
  } else {
    while (pos < data.length) {
      const len = Math.min(MAX_BLOCK, data.length - pos);
      const isFinal = pos + len >= data.length;

      // Block header: BFINAL (1 bit) + BTYPE=00 (2 bits) + 5 bits padding = 1 byte
      out.push(isFinal ? 0x01 : 0x00);

      // LEN (little-endian)
      out.push(len & 0xff, (len >>> 8) & 0xff);
      // NLEN = one's complement of LEN
      const nlen = ~len & 0xffff;
      out.push(nlen & 0xff, (nlen >>> 8) & 0xff);

      // Raw bytes
      for (let i = 0; i < len; i++) out.push(data[pos + i]);
      pos += len;
    }
  }

  // Adler32 trailer (big-endian)
  const adler = adler32(data);
  out.push(
    (adler >>> 24) & 0xff,
    (adler >>> 16) & 0xff,
    (adler >>> 8) & 0xff,
    adler & 0xff,
  );

  return out;
}

// --- Adler32 checksum ---

function adler32(data: number[]): number {
  let a = 1;
  let b = 0;
  const MOD = 65521;
  // Process in batches to avoid overflow (safe margin: 5552)
  let i = 0;
  while (i < data.length) {
    const end = Math.min(i + 5552, data.length);
    for (; i < end; i++) {
      a += data[i];
      b += a;
    }
    a %= MOD;
    b %= MOD;
  }
  return ((b << 16) | a) >>> 0;
}

// --- CRC32 table (precomputed once) ---

const CRC_TABLE: number[] = (() => {
  const table: number[] = new Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    table[n] = c >>> 0;
  }
  return table;
})();

// --- Helpers ---

function writeUint32BE(arr: number[], offset: number, value: number): void {
  arr[offset] = (value >>> 24) & 0xff;
  arr[offset + 1] = (value >>> 16) & 0xff;
  arr[offset + 2] = (value >>> 8) & 0xff;
  arr[offset + 3] = value & 0xff;
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

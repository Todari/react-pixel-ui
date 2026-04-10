import { describe, it, expect } from 'vitest';
import { inflateSync } from 'node:zlib';
import { encodePNG } from './png';
import type { RGBAColor } from '../types';

function decodeDataUrl(url: string): Buffer {
  const match = url.match(/base64,([^"]+)/);
  if (!match) throw new Error('invalid data url');
  return Buffer.from(match[1], 'base64');
}

function readUint32BE(buf: Buffer, offset: number): number {
  return buf.readUInt32BE(offset);
}

describe('encodePNG', () => {
  const makePixels = (
    width: number,
    height: number,
    color: RGBAColor,
  ): RGBAColor[] => {
    const out: RGBAColor[] = [];
    for (let i = 0; i < width * height; i++) out.push({ ...color });
    return out;
  };

  it('emits a valid PNG data URL', () => {
    const url = encodePNG(2, 2, makePixels(2, 2, { r: 255, g: 0, b: 0, a: 1 }));
    expect(url).toMatch(/^url\("data:image\/png;base64,/);
  });

  it('starts with PNG magic bytes', () => {
    const url = encodePNG(1, 1, [{ r: 0, g: 0, b: 0, a: 1 }]);
    const bytes = decodeDataUrl(url);
    expect(Array.from(bytes.slice(0, 8))).toEqual([
      0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a,
    ]);
  });

  it('writes a correct IHDR chunk', () => {
    const url = encodePNG(10, 5, makePixels(10, 5, { r: 0, g: 0, b: 0, a: 1 }));
    const bytes = decodeDataUrl(url);
    // IHDR starts at byte 8 (after magic)
    expect(readUint32BE(bytes, 8)).toBe(13); // length
    expect(bytes.slice(12, 16).toString('ascii')).toBe('IHDR');
    expect(readUint32BE(bytes, 16)).toBe(10); // width
    expect(readUint32BE(bytes, 20)).toBe(5); // height
    expect(bytes[24]).toBe(8); // bit depth
    expect(bytes[25]).toBe(6); // color type: RGBA
  });

  it('writes IEND chunk with canonical CRC', () => {
    const url = encodePNG(1, 1, [{ r: 0, g: 0, b: 0, a: 1 }]);
    const bytes = decodeDataUrl(url);
    // IEND is the last 12 bytes
    const iend = bytes.slice(bytes.length - 12);
    expect(readUint32BE(iend, 0)).toBe(0); // length
    expect(iend.slice(4, 8).toString('ascii')).toBe('IEND');
    expect(readUint32BE(iend, 8)).toBe(0xae426082); // well-known IEND CRC
  });

  it('preserves RGBA values including alpha', () => {
    const pixels: RGBAColor[] = [
      { r: 255, g: 0, b: 0, a: 1 },
      { r: 0, g: 255, b: 0, a: 0.5 },
      { r: 0, g: 0, b: 255, a: 0 },
      { r: 128, g: 128, b: 128, a: 0.75 },
    ];
    const url = encodePNG(2, 2, pixels);
    const bytes = decodeDataUrl(url);

    // Find IDAT chunk
    let pos = 8;
    let idatData: Buffer | null = null;
    while (pos < bytes.length) {
      const len = readUint32BE(bytes, pos);
      const type = bytes.slice(pos + 4, pos + 8).toString('ascii');
      if (type === 'IDAT') {
        idatData = bytes.slice(pos + 8, pos + 8 + len);
        break;
      }
      pos += 8 + len + 4;
    }
    expect(idatData).not.toBeNull();

    // Inflate IDAT — should equal raw pixels with filter bytes
    const inflated = inflateSync(idatData!);
    // Row 0: filter(0) + 2 pixels * 4 bytes = 9 bytes
    expect(inflated.length).toBe(2 * (1 + 2 * 4));
    expect(inflated[0]).toBe(0); // filter byte
    expect(inflated[1]).toBe(255); // r of pixel (0,0)
    expect(inflated[4]).toBe(255); // a of pixel (0,0) = 1.0 → 255
    expect(inflated[8]).toBe(128); // a of pixel (0,1) = 0.5 → 128
    // Row 1
    expect(inflated[9]).toBe(0); // filter byte
    expect(inflated[13]).toBe(0); // a of pixel (1,0) = 0 → 0
    expect(inflated[17]).toBe(191); // a of pixel (1,1) = 0.75 → 191
  });

  it('handles large images by splitting deflate blocks', () => {
    // A 200x200 image will exceed the 65535-byte block limit
    // (200*200*4 + 200 = 160200 bytes raw → 3 stored blocks)
    const pixels = makePixels(200, 200, { r: 1, g: 2, b: 3, a: 1 });
    const url = encodePNG(200, 200, pixels);
    const bytes = decodeDataUrl(url);

    // Find IDAT
    let pos = 8;
    let idatData: Buffer | null = null;
    while (pos < bytes.length) {
      const len = readUint32BE(bytes, pos);
      const type = bytes.slice(pos + 4, pos + 8).toString('ascii');
      if (type === 'IDAT') {
        idatData = bytes.slice(pos + 8, pos + 8 + len);
        break;
      }
      pos += 8 + len + 4;
    }
    expect(idatData).not.toBeNull();

    // Should round-trip through zlib
    const inflated = inflateSync(idatData!);
    expect(inflated.length).toBe(200 * (1 + 200 * 4));
    // Spot-check a pixel in the middle
    const rowStride = 1 + 200 * 4;
    const row100 = 100 * rowStride;
    expect(inflated[row100]).toBe(0); // filter
    expect(inflated[row100 + 1]).toBe(1); // r
    expect(inflated[row100 + 2]).toBe(2); // g
    expect(inflated[row100 + 3]).toBe(3); // b
    expect(inflated[row100 + 4]).toBe(255); // a
  });
});

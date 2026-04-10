import { describe, it, expect } from 'vitest';
import { inflateSync } from 'node:zlib';
import { generateCompositePixelImage } from './composite-pixel-image';

function decodeDataUrl(url: string): Buffer {
  const match = url.match(/base64,([^"]+)/);
  if (!match) throw new Error('invalid data url');
  return Buffer.from(match[1], 'base64');
}

function readIHDR(bytes: Buffer): {
  width: number;
  height: number;
  colorType: number;
} {
  return {
    width: bytes.readUInt32BE(16),
    height: bytes.readUInt32BE(20),
    colorType: bytes[25],
  };
}

function readIDAT(bytes: Buffer): Buffer {
  let pos = 8;
  while (pos < bytes.length) {
    const len = bytes.readUInt32BE(pos);
    const type = bytes.slice(pos + 4, pos + 8).toString('ascii');
    if (type === 'IDAT') return bytes.slice(pos + 8, pos + 8 + len);
    pos += 8 + len + 4;
  }
  throw new Error('no IDAT');
}

describe('generateCompositePixelImage', () => {
  const flatRadii = {
    topLeft: 0,
    topRight: 0,
    bottomRight: 0,
    bottomLeft: 0,
  };

  it('returns null when no background and no border', () => {
    expect(
      generateCompositePixelImage(60, 30, 6, flatRadii, 0, undefined, undefined),
    ).toBeNull();
  });

  it('outputs a PNG (not BMP) data URL', () => {
    const url = generateCompositePixelImage(
      60,
      30,
      6,
      flatRadii,
      0,
      undefined,
      '#ff0000',
    );
    expect(url).toMatch(/^url\("data:image\/png;base64,/);
  });

  it('emits RGBA (color type 6) PNG', () => {
    const url = generateCompositePixelImage(
      60,
      30,
      6,
      flatRadii,
      0,
      undefined,
      '#ff0000',
    );
    const bytes = decodeDataUrl(url!);
    const ihdr = readIHDR(bytes);
    expect(ihdr.colorType).toBe(6);
  });

  it('encodes transparent pixels outside the staircase shape', () => {
    const url = generateCompositePixelImage(
      60,
      30,
      6,
      { topLeft: 12, topRight: 12, bottomRight: 12, bottomLeft: 12 },
      0,
      undefined,
      '#ff0000',
    );
    const bytes = decodeDataUrl(url!);
    const idat = readIDAT(bytes);
    const inflated = inflateSync(idat);

    const cols = Math.ceil(60 / 6); // 10
    const rowStride = 1 + cols * 4;

    // Row 0, col 0 (top-left corner, outside staircase → transparent)
    const r0c0AlphaOffset = 0 /* row0 */ + 1 /* filter */ + 0 * 4 + 3; // 4 = alpha byte
    expect(inflated[r0c0AlphaOffset]).toBe(0);

    // Middle of the image (center row, center col) → opaque red
    const midRow = Math.floor(5 / 2);
    const midCol = Math.floor(cols / 2);
    const midOffset = midRow * rowStride + 1 + midCol * 4;
    expect(inflated[midOffset]).toBe(255); // r
    expect(inflated[midOffset + 3]).toBe(255); // a = 1.0
  });

  it('bakes border into the image when borderWidth > 0', () => {
    const url = generateCompositePixelImage(
      60,
      30,
      6,
      flatRadii,
      6, // border width = one pixel cell
      '#00ff00', // border color
      '#0000ff', // bg color
    );
    const bytes = decodeDataUrl(url!);
    const idat = readIDAT(bytes);
    const inflated = inflateSync(idat);

    const cols = Math.ceil(60 / 6);
    const rowStride = 1 + cols * 4;

    // First row, first column → should be inside shape (no radius)
    // but within border region → green
    const borderCellOffset = 0 + 1 + 0 * 4;
    expect(inflated[borderCellOffset]).toBe(0); // r
    expect(inflated[borderCellOffset + 1]).toBe(255); // g
    expect(inflated[borderCellOffset + 2]).toBe(0); // b

    // Middle of the image → inside border → blue
    const midRow = Math.floor(5 / 2);
    const midCol = Math.floor(cols / 2);
    const midOffset = midRow * rowStride + 1 + midCol * 4;
    expect(inflated[midOffset]).toBe(0); // r
    expect(inflated[midOffset + 1]).toBe(0); // g
    expect(inflated[midOffset + 2]).toBe(255); // b
  });
});

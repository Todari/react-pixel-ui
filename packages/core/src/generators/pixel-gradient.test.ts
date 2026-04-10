import { describe, it, expect } from 'vitest';
import { inflateSync } from 'node:zlib';
import { generatePixelGradient } from './pixel-gradient';

function decodeDataUrl(url: string): Buffer {
  const match = url.match(/base64,([^"]+)/);
  if (!match) throw new Error('invalid data url');
  return Buffer.from(match[1], 'base64');
}

describe('generatePixelGradient', () => {
  it('returns null for non-gradient strings', () => {
    expect(generatePixelGradient('red', 4, 100, 50)).toBeNull();
    expect(generatePixelGradient('none', 4, 100, 50)).toBeNull();
  });

  it('outputs a PNG data URL for linear gradients', () => {
    const url = generatePixelGradient(
      'linear-gradient(to right, red, blue)',
      6,
      60,
      30,
    );
    expect(url).toMatch(/^url\("data:image\/png;base64,/);
  });

  it('samples opaque gradient correctly at endpoints', () => {
    const url = generatePixelGradient(
      'linear-gradient(to right, red, blue)',
      6,
      60,
      6,
    );
    const bytes = decodeDataUrl(url!);
    let pos = 8;
    let idat: Buffer | null = null;
    while (pos < bytes.length) {
      const len = bytes.readUInt32BE(pos);
      const t = bytes.slice(pos + 4, pos + 8).toString('ascii');
      if (t === 'IDAT') {
        idat = bytes.slice(pos + 8, pos + 8 + len);
        break;
      }
      pos += 8 + len + 4;
    }
    const inflated = inflateSync(idat!);
    // Single row: filter + 10 RGBA pixels
    // Leftmost pixel → ~red, rightmost → ~blue
    const leftR = inflated[1];
    const leftB = inflated[3];
    const rightR = inflated[1 + 9 * 4];
    const rightB = inflated[1 + 9 * 4 + 2];
    expect(leftR).toBeGreaterThan(leftB); // more red on the left
    expect(rightB).toBeGreaterThan(rightR); // more blue on the right
  });

  it('preserves alpha in gradients with rgba stops', () => {
    const url = generatePixelGradient(
      'linear-gradient(to right, rgba(255,0,0,0), rgba(255,0,0,1))',
      6,
      60,
      6,
    );
    const bytes = decodeDataUrl(url!);
    let pos = 8;
    let idat: Buffer | null = null;
    while (pos < bytes.length) {
      const len = bytes.readUInt32BE(pos);
      const t = bytes.slice(pos + 4, pos + 8).toString('ascii');
      if (t === 'IDAT') {
        idat = bytes.slice(pos + 8, pos + 8 + len);
        break;
      }
      pos += 8 + len + 4;
    }
    const inflated = inflateSync(idat!);
    const leftA = inflated[4];
    const rightA = inflated[1 + 9 * 4 + 3];
    expect(leftA).toBeLessThan(50); // near transparent
    expect(rightA).toBeGreaterThan(200); // near opaque
  });

  it('parses radial gradients', () => {
    const url = generatePixelGradient(
      'radial-gradient(red, blue)',
      6,
      60,
      60,
    );
    expect(url).toMatch(/^url\("data:image\/png;base64,/);
  });
});

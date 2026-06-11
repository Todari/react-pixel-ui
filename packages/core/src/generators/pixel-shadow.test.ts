import { describe, it, expect } from 'vitest';
import { generatePixelShadow } from './pixel-shadow';

describe('generatePixelShadow', () => {
  it('keeps zero offsets at zero (straight shadows stay straight)', () => {
    expect(generatePixelShadow(0, 4, '#000', 4)).toBe(
      'drop-shadow(0px 4px 0 #000)',
    );
    expect(generatePixelShadow(4, 0, '#000', 4)).toBe(
      'drop-shadow(4px 0px 0 #000)',
    );
  });

  it('snaps to the nearest grid line symmetrically', () => {
    expect(generatePixelShadow(6, 6, '#000', 4)).toBe(
      'drop-shadow(8px 8px 0 #000)',
    );
    expect(generatePixelShadow(-7, -7, '#000', 4)).toBe(
      'drop-shadow(-8px -8px 0 #000)',
    );
    expect(generatePixelShadow(1, 1, '#000', 4)).toBe(
      'drop-shadow(0px 0px 0 #000)',
    );
  });

  it('sanitizes a non-positive pixelSize', () => {
    expect(generatePixelShadow(4, 4, '#000', 0)).toBe(
      'drop-shadow(4px 4px 0 #000)',
    );
  });
});

import { describe, it, expect } from 'vitest';
import { generatePixelArt } from './composer';

describe('generatePixelArt', () => {
  it('returns a minimal result for a plain background', () => {
    const result = generatePixelArt(100, 50, {
      pixelSize: 4,
      backgroundColor: '#ff0000',
    });
    expect(result.needsWrapper).toBe(false);
    expect(result.clipPath).toBe('none');
    expect(result.contentStyle.width).toBe('100px');
    expect(result.contentStyle.height).toBe('50px');
    // No border → no composite image border region, but background is solid
    expect(result.compositeImage).toBeTruthy();
  });

  it('flags needsWrapper when border is set', () => {
    const result = generatePixelArt(100, 50, {
      pixelSize: 4,
      borderWidth: 4,
      borderColor: '#000',
      backgroundColor: '#fff',
    });
    expect(result.needsWrapper).toBe(true);
    expect(result.wrapperStyle.backgroundColor).toBe('#000');
  });

  it('snaps borderWidth up to the pixelSize grid', () => {
    const result = generatePixelArt(100, 50, {
      pixelSize: 4,
      borderWidth: 3, // rounds up to 4
      borderColor: '#000',
      backgroundColor: '#fff',
    });
    expect(result.needsWrapper).toBe(true);
    // Inset should equal the snapped borderWidth
    expect(result.contentStyle.inset).toBe('4px');
  });

  it('clamps borderWidth to half of min(width, height)', () => {
    const result = generatePixelArt(20, 10, {
      pixelSize: 4,
      borderWidth: 100, // absurdly large
      borderColor: '#000',
      backgroundColor: '#fff',
    });
    // Half of min(20,10) = 5 → snapped down to 4 (multiple of pixelSize)
    // The composer clamps then snaps; either way borderWidth must be ≤ 5
    const inset = parseInt(result.contentStyle.inset as string, 10);
    expect(inset).toBeLessThanOrEqual(5);
    expect(inset).toBeGreaterThan(0);
  });

  it('validates pixelSize — floor to int, min 1', () => {
    expect(() =>
      generatePixelArt(100, 50, {
        pixelSize: 0,
        backgroundColor: '#f00',
      }),
    ).not.toThrow();
    expect(() =>
      generatePixelArt(100, 50, {
        pixelSize: -5,
        backgroundColor: '#f00',
      }),
    ).not.toThrow();
  });

  it('generates a clip-path only when a radius is set', () => {
    const flat = generatePixelArt(100, 50, {
      pixelSize: 4,
      backgroundColor: '#f00',
    });
    expect(flat.clipPath).toBe('none');

    const rounded = generatePixelArt(100, 50, {
      pixelSize: 4,
      borderRadius: 12,
      backgroundColor: '#f00',
    });
    expect(rounded.clipPath).toMatch(/^polygon\(/);
  });

  it('generates a drop-shadow filter when shadow is set', () => {
    const result = generatePixelArt(100, 50, {
      pixelSize: 4,
      backgroundColor: '#f00',
      shadow: { x: 4, y: 4, color: 'rgba(0,0,0,0.25)' },
    });
    expect(result.contentStyle.filter).toContain('drop-shadow');
  });

  it('uses wrapper filter when border exists', () => {
    const result = generatePixelArt(100, 50, {
      pixelSize: 4,
      borderWidth: 4,
      borderColor: '#000',
      backgroundColor: '#fff',
      shadow: { x: 4, y: 4, color: 'rgba(0,0,0,0.25)' },
    });
    expect(result.wrapperStyle.filter).toContain('drop-shadow');
  });
});

import { describe, it, expect } from 'vitest';
import {
  parseColor,
  interpolateColor,
  colorToCSS,
  sampleGradient,
} from './color';

describe('parseColor', () => {
  it('parses named colors', () => {
    expect(parseColor('red')).toEqual({ r: 255, g: 0, b: 0, a: 1 });
    expect(parseColor('white')).toEqual({ r: 255, g: 255, b: 255, a: 1 });
    expect(parseColor('transparent')).toEqual({ r: 0, g: 0, b: 0, a: 0 });
  });

  it('normalizes case for named colors', () => {
    expect(parseColor('BLUE')).toEqual({ r: 0, g: 0, b: 255, a: 1 });
  });

  it('parses 3-digit hex', () => {
    expect(parseColor('#f00')).toEqual({ r: 255, g: 0, b: 0, a: 1 });
  });

  it('parses 6-digit hex', () => {
    expect(parseColor('#ff6b6b')).toEqual({ r: 255, g: 107, b: 107, a: 1 });
  });

  it('parses 4-digit hex with alpha', () => {
    const c = parseColor('#f00a');
    expect(c?.r).toBe(255);
    expect(c?.g).toBe(0);
    expect(c?.b).toBe(0);
    expect(c?.a).toBeCloseTo(170 / 255, 3);
  });

  it('parses 8-digit hex with alpha', () => {
    const c = parseColor('#ff000080');
    expect(c?.r).toBe(255);
    expect(c?.a).toBeCloseTo(128 / 255, 3);
  });

  it('parses rgb() comma syntax', () => {
    expect(parseColor('rgb(10, 20, 30)')).toEqual({ r: 10, g: 20, b: 30, a: 1 });
  });

  it('parses rgba() with alpha', () => {
    expect(parseColor('rgba(255, 0, 0, 0.5)')).toEqual({
      r: 255,
      g: 0,
      b: 0,
      a: 0.5,
    });
  });

  it('parses modern rgb() space syntax', () => {
    expect(parseColor('rgb(10 20 30)')).toEqual({ r: 10, g: 20, b: 30, a: 1 });
  });

  it('parses modern rgb() with slash alpha', () => {
    expect(parseColor('rgb(255 0 0 / 0.5)')).toEqual({
      r: 255,
      g: 0,
      b: 0,
      a: 0.5,
    });
  });

  it('parses modern rgb() with percent alpha', () => {
    expect(parseColor('rgb(255 0 0 / 50%)')).toEqual({
      r: 255,
      g: 0,
      b: 0,
      a: 0.5,
    });
  });

  it('clamps rgb values out of range', () => {
    // parseInt allows 300, clamp pulls it to 255
    expect(parseColor('rgb(300, 0, 0)')).toEqual({ r: 255, g: 0, b: 0, a: 1 });
  });

  it('returns null for unsupported formats', () => {
    expect(parseColor('color-mix(in srgb, red, blue)')).toBeNull();
    expect(parseColor('var(--primary)')).toBeNull();
    expect(parseColor('notacolor')).toBeNull();
    expect(parseColor('#xyz')).toBeNull();
  });

  describe('oklch / oklab', () => {
    it('parses a reference oklch value (red-ish)', () => {
      // oklch(0.628 0.2577 29.234) is approximately sRGB red
      const c = parseColor('oklch(0.628 0.2577 29.234)');
      expect(c).not.toBeNull();
      expect(c!.r).toBeGreaterThan(240);
      expect(c!.g).toBeLessThan(20);
      expect(c!.b).toBeLessThan(20);
    });

    it('parses percentage lightness', () => {
      const c = parseColor('oklch(100% 0 0)');
      expect(c).toEqual({ r: 255, g: 255, b: 255, a: 1 });
    });

    it('parses alpha via slash syntax', () => {
      const c = parseColor('oklch(0.7 0.15 180 / 0.5)');
      expect(c?.a).toBe(0.5);
    });

    it('accepts hue units', () => {
      const deg = parseColor('oklch(0.7 0.15 180deg)');
      const turn = parseColor('oklch(0.7 0.15 0.5turn)');
      expect(deg).toEqual(turn);
    });

    it('parses oklab reference value', () => {
      // oklab(0 0 0) is black
      const black = parseColor('oklab(0 0 0)');
      expect(black).toEqual({ r: 0, g: 0, b: 0, a: 1 });
      // oklab(1 0 0) is white
      const white = parseColor('oklab(1 0 0)');
      expect(white).toEqual({ r: 255, g: 255, b: 255, a: 1 });
    });

    it('clamps out-of-gamut values to sRGB [0,255]', () => {
      // Heavily saturated value — expect valid 0-255 ints
      const c = parseColor('oklch(0.7 1.5 120)');
      expect(c).not.toBeNull();
      expect(c!.r).toBeGreaterThanOrEqual(0);
      expect(c!.r).toBeLessThanOrEqual(255);
      expect(c!.g).toBeGreaterThanOrEqual(0);
      expect(c!.g).toBeLessThanOrEqual(255);
      expect(c!.b).toBeGreaterThanOrEqual(0);
      expect(c!.b).toBeLessThanOrEqual(255);
    });

    it('returns null on malformed oklch', () => {
      expect(parseColor('oklch(0.5)')).toBeNull();
      expect(parseColor('oklch(0.5 0.1)')).toBeNull();
      expect(parseColor('oklch(abc def ghi)')).toBeNull();
    });
  });

  describe('hsl/hsla', () => {
    it('parses hsl comma syntax for primary colors', () => {
      expect(parseColor('hsl(0, 100%, 50%)')).toEqual({
        r: 255,
        g: 0,
        b: 0,
        a: 1,
      });
      expect(parseColor('hsl(120, 100%, 50%)')).toEqual({
        r: 0,
        g: 255,
        b: 0,
        a: 1,
      });
      expect(parseColor('hsl(240, 100%, 50%)')).toEqual({
        r: 0,
        g: 0,
        b: 255,
        a: 1,
      });
    });

    it('parses hsla comma syntax with alpha', () => {
      const c = parseColor('hsla(0, 100%, 50%, 0.5)');
      expect(c?.r).toBe(255);
      expect(c?.a).toBe(0.5);
    });

    it('parses hsl modern slash syntax', () => {
      const c = parseColor('hsl(0 100% 50% / 0.5)');
      expect(c?.r).toBe(255);
      expect(c?.a).toBe(0.5);
    });

    it('handles rad/grad/turn hue units', () => {
      // 0.5 turn = 180deg
      const c1 = parseColor('hsl(0.5turn, 100%, 50%)');
      expect(c1?.r).toBe(0);
      expect(c1?.g).toBe(255);
      expect(c1?.b).toBe(255);
    });

    it('wraps negative hues', () => {
      // -60 → 300 → magenta
      const c = parseColor('hsl(-60, 100%, 50%)');
      expect(c?.r).toBe(255);
      expect(c?.g).toBe(0);
      expect(c?.b).toBe(255);
    });

    it('clamps saturation and lightness', () => {
      const black = parseColor('hsl(0, 100%, 0%)');
      expect(black).toEqual({ r: 0, g: 0, b: 0, a: 1 });
      const white = parseColor('hsl(0, 0%, 100%)');
      expect(white).toEqual({ r: 255, g: 255, b: 255, a: 1 });
    });
  });
});

describe('interpolateColor', () => {
  it('interpolates RGBA channels at t=0.5', () => {
    const a = { r: 0, g: 0, b: 0, a: 0 };
    const b = { r: 200, g: 100, b: 50, a: 1 };
    expect(interpolateColor(a, b, 0.5)).toEqual({
      r: 100,
      g: 50,
      b: 25,
      a: 0.5,
    });
  });

  it('returns first color at t=0', () => {
    const a = { r: 10, g: 20, b: 30, a: 1 };
    expect(interpolateColor(a, { r: 0, g: 0, b: 0, a: 0 }, 0).r).toBe(10);
  });

  it('returns second color at t=1', () => {
    const b = { r: 10, g: 20, b: 30, a: 1 };
    expect(interpolateColor({ r: 0, g: 0, b: 0, a: 0 }, b, 1).r).toBe(10);
  });
});

describe('colorToCSS', () => {
  it('emits hex for opaque colors', () => {
    expect(colorToCSS({ r: 255, g: 0, b: 0, a: 1 })).toBe('#ff0000');
  });

  it('emits rgba() for translucent colors', () => {
    expect(colorToCSS({ r: 255, g: 0, b: 0, a: 0.5 })).toBe('rgba(255, 0, 0, 0.5)');
  });

  it('pads hex digits', () => {
    expect(colorToCSS({ r: 1, g: 2, b: 3, a: 1 })).toBe('#010203');
  });
});

describe('sampleGradient', () => {
  const stops = [
    { color: { r: 0, g: 0, b: 0, a: 1 }, position: 0 },
    { color: { r: 255, g: 255, b: 255, a: 1 }, position: 1 },
  ];

  it('returns first stop at or before position 0', () => {
    expect(sampleGradient(stops, 0).r).toBe(0);
    expect(sampleGradient(stops, -1).r).toBe(0);
  });

  it('returns last stop at or beyond position 1', () => {
    expect(sampleGradient(stops, 1).r).toBe(255);
    expect(sampleGradient(stops, 2).r).toBe(255);
  });

  it('interpolates at midpoint', () => {
    const c = sampleGradient(stops, 0.5);
    expect(c.r).toBeCloseTo(128, -1);
  });

  it('handles single-stop gradients', () => {
    const single = [{ color: { r: 100, g: 0, b: 0, a: 1 }, position: 0.5 }];
    expect(sampleGradient(single, 0.3).r).toBe(100);
  });

  it('returns black on empty stops', () => {
    expect(sampleGradient([], 0.5)).toEqual({ r: 0, g: 0, b: 0, a: 1 });
  });
});

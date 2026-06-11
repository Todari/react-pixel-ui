import { describe, it, expect } from 'vitest';
import { parseGradient, resolveGradientAngle } from './gradient-parser';

describe('parseGradient', () => {
  it('parses linear-gradient with angle', () => {
    const g = parseGradient('linear-gradient(45deg, red, blue)');
    expect(g?.type).toBe('linear');
    expect(g?.angle).toBe(45);
    expect(g?.stops).toHaveLength(2);
    expect(g?.stops[0].color).toEqual({ r: 255, g: 0, b: 0, a: 1 });
    expect(g?.stops[1].color).toEqual({ r: 0, g: 0, b: 255, a: 1 });
  });

  it('parses direction keywords', () => {
    expect(parseGradient('linear-gradient(to right, red, blue)')?.angle).toBe(90);
    expect(parseGradient('linear-gradient(to bottom, red, blue)')?.angle).toBe(180);
    expect(parseGradient('linear-gradient(to top left, red, blue)')?.angle).toBe(315);
  });

  it('defaults to 180deg when no direction', () => {
    expect(parseGradient('linear-gradient(red, blue)')?.angle).toBe(180);
  });

  it('distributes stop positions evenly when omitted', () => {
    const g = parseGradient('linear-gradient(red, green, blue)');
    expect(g?.stops[0].position).toBe(0);
    expect(g?.stops[1].position).toBeCloseTo(0.5, 2);
    expect(g?.stops[2].position).toBe(1);
  });

  it('parses explicit percent positions', () => {
    const g = parseGradient('linear-gradient(red 0%, blue 100%)');
    expect(g?.stops[0].position).toBe(0);
    expect(g?.stops[1].position).toBe(1);
  });

  it('parses rgba() stops with commas inside parens', () => {
    const g = parseGradient(
      'linear-gradient(rgba(255, 0, 0, 0.5), rgba(0, 0, 255, 1))',
    );
    expect(g?.stops).toHaveLength(2);
    expect(g?.stops[0].color.a).toBe(0.5);
  });

  it('parses radial-gradient', () => {
    const g = parseGradient('radial-gradient(red, blue)');
    expect(g?.type).toBe('radial');
    expect(g?.stops).toHaveLength(2);
  });

  it('parses linear-gradient with hsl stops', () => {
    const g = parseGradient('linear-gradient(hsl(0, 100%, 50%), hsl(240, 100%, 50%))');
    expect(g?.stops).toHaveLength(2);
    expect(g?.stops[0].color.r).toBe(255);
    expect(g?.stops[1].color.b).toBe(255);
  });

  it('parses radial-gradient with hsl stops', () => {
    const g = parseGradient('radial-gradient(hsl(0, 100%, 50%), blue)');
    expect(g?.type).toBe('radial');
    expect(g?.stops).toHaveLength(2);
    expect(g?.stops[0].color.r).toBe(255);
  });

  it('strips repeating- prefix', () => {
    const g = parseGradient('repeating-linear-gradient(45deg, red, blue)');
    expect(g?.type).toBe('linear');
    expect(g?.angle).toBe(45);
  });

  it('returns null for unrecognized values', () => {
    expect(parseGradient('none')).toBeNull();
    expect(parseGradient('url(foo.png)')).toBeNull();
  });

  it('returns null if fewer than 2 stops', () => {
    expect(parseGradient('linear-gradient(red)')).toBeNull();
  });
});

describe('parseGradient — CSS Color 4 and robustness', () => {
  it('strips interpolation method from direction (Tailwind v4)', () => {
    const g = parseGradient('linear-gradient(to right in oklab, red, blue)');
    expect(g?.angle).toBe(90);
    expect(g?.stops).toHaveLength(2);
  });

  it('strips interpolation method from angle prelude', () => {
    const g = parseGradient(
      'linear-gradient(45deg in oklch longer hue, red, blue)',
    );
    expect(g?.angle).toBe(45);
  });

  it('handles bare interpolation prelude with default direction', () => {
    const g = parseGradient('linear-gradient(in oklab, red, blue)');
    expect(g?.angle).toBe(180);
    expect(g?.stops).toHaveLength(2);
  });

  it('converts turn/rad/grad angle units to degrees', () => {
    expect(parseGradient('linear-gradient(0.25turn, red, blue)')?.angle).toBe(90);
    expect(
      parseGradient('linear-gradient(100grad, red, blue)')?.angle,
    ).toBeCloseTo(90, 5);
    expect(
      parseGradient('linear-gradient(1.5707963rad, red, blue)')?.angle,
    ).toBeCloseTo(90, 4);
  });

  it('marks corner keywords and resolves aspect-ratio-dependent angles', () => {
    const g = parseGradient('linear-gradient(to top right, red, blue)');
    expect(g?.corner).toBe('top-right');
    // Square fallback
    expect(g?.angle).toBe(45);
    // Magic corner: 200x100 box → atan2(100, 200) ≈ 26.57deg
    expect(resolveGradientAngle(g!, 200, 100)).toBeCloseTo(26.565, 2);
    expect(resolveGradientAngle(g!, 100, 100)).toBeCloseTo(45, 5);

    const bl = parseGradient('linear-gradient(to bottom left, red, blue)');
    expect(resolveGradientAngle(bl!, 200, 100)).toBeCloseTo(180 + 26.565, 2);
  });

  it('never leaves a -1 position when an edge stop fails to parse', () => {
    // 'notacolor' is dropped; the surviving edge stops must still get 0/1
    const g = parseGradient('linear-gradient(red, blue, notacolor)');
    expect(g?.stops).toHaveLength(2);
    for (const stop of g!.stops) {
      expect(stop.position).toBeGreaterThanOrEqual(0);
    }
    expect(g?.stops[1].position).toBe(1);
  });

  it('expands double-position stops into two stops (hard edges)', () => {
    const g = parseGradient('linear-gradient(red 0% 50%, blue 50% 100%)');
    expect(g?.stops).toHaveLength(4);
    expect(g?.stops.map((s) => s.position)).toEqual([0, 0.5, 0.5, 1]);
    expect(g?.stops[1].color.r).toBe(255);
    expect(g?.stops[2].color.b).toBe(255);
  });

  it('keeps stops with px positions instead of dropping them', () => {
    const g = parseGradient('linear-gradient(red 0px, blue 100px)');
    expect(g?.stops).toHaveLength(2);
    expect(g?.stops[0].position).toBe(0);
    expect(g?.stops[1].position).toBe(1);
  });

  it('parses full CSS named colors in stops', () => {
    const g = parseGradient('linear-gradient(tomato, rebeccapurple)');
    expect(g?.stops).toHaveLength(2);
    expect(g?.stops[0].color).toEqual({ r: 255, g: 99, b: 71, a: 1 });
    expect(g?.stops[1].color).toEqual({ r: 102, g: 51, b: 153, a: 1 });
  });
});

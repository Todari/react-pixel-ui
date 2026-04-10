import { describe, it, expect } from 'vitest';
import { parseGradient } from './gradient-parser';

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

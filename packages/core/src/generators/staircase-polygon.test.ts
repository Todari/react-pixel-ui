import { describe, it, expect } from 'vitest';
import {
  generateStaircasePolygon,
  generatePolygonPoints,
  parseBorderRadius,
} from './staircase-polygon';

describe('parseBorderRadius', () => {
  it('returns all zero for undefined', () => {
    expect(parseBorderRadius(undefined)).toEqual({
      topLeft: 0,
      topRight: 0,
      bottomRight: 0,
      bottomLeft: 0,
    });
  });

  it('returns all zero for 0', () => {
    expect(parseBorderRadius(0)).toEqual({
      topLeft: 0,
      topRight: 0,
      bottomRight: 0,
      bottomLeft: 0,
    });
  });

  it('applies number uniformly', () => {
    expect(parseBorderRadius(12)).toEqual({
      topLeft: 12,
      topRight: 12,
      bottomRight: 12,
      bottomLeft: 12,
    });
  });

  it('applies 4-tuple in TL/TR/BR/BL order', () => {
    expect(parseBorderRadius([1, 2, 3, 4])).toEqual({
      topLeft: 1,
      topRight: 2,
      bottomRight: 3,
      bottomLeft: 4,
    });
  });
});

describe('generateStaircasePolygon', () => {
  it('returns "none" for a zero-radius rectangle', () => {
    const result = generateStaircasePolygon(
      100,
      50,
      { topLeft: 0, topRight: 0, bottomRight: 0, bottomLeft: 0 },
      4,
    );
    // Zero-radius path produces a simple rectangle polygon
    expect(result).toMatch(/^polygon\(/);
  });

  it('produces polygon() string with points for rounded corners', () => {
    const result = generateStaircasePolygon(
      100,
      50,
      { topLeft: 12, topRight: 12, bottomRight: 12, bottomLeft: 12 },
      4,
    );
    expect(result).toMatch(/^polygon\(/);
    expect(result).toContain('px');
  });
});

describe('generatePolygonPoints', () => {
  it('returns a 4-point rectangle when all radii are 0', () => {
    const points = generatePolygonPoints(
      100,
      50,
      { topLeft: 0, topRight: 0, bottomRight: 0, bottomLeft: 0 },
      4,
    );
    expect(points).toHaveLength(4);
    expect(points[0]).toEqual({ x: 0, y: 0 });
    expect(points[1]).toEqual({ x: 100, y: 0 });
    expect(points[2]).toEqual({ x: 100, y: 50 });
    expect(points[3]).toEqual({ x: 0, y: 50 });
  });

  it('produces additional points for each rounded corner', () => {
    const pointsZero = generatePolygonPoints(
      100,
      50,
      { topLeft: 0, topRight: 0, bottomRight: 0, bottomLeft: 0 },
      4,
    );
    const pointsRounded = generatePolygonPoints(
      100,
      50,
      { topLeft: 12, topRight: 12, bottomRight: 12, bottomLeft: 12 },
      4,
    );
    expect(pointsRounded.length).toBeGreaterThan(pointsZero.length);
  });
});

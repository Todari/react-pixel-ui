import { describe, it, expect } from 'vitest';
import {
  snapToGrid,
  snapToGridCeil,
  isCellInsideCircle,
  buildCornerGrid,
  traceStaircaseBoundary,
  clamp,
  lerp,
} from './math';

describe('snapToGrid', () => {
  it('floors to pixelSize multiple', () => {
    expect(snapToGrid(10, 4)).toBe(8);
    expect(snapToGrid(12, 4)).toBe(12);
    expect(snapToGrid(0, 4)).toBe(0);
  });
});

describe('snapToGridCeil', () => {
  it('ceils to pixelSize multiple', () => {
    expect(snapToGridCeil(10, 4)).toBe(12);
    expect(snapToGridCeil(12, 4)).toBe(12);
  });
});

describe('isCellInsideCircle', () => {
  it('returns true for cells near the corner', () => {
    // radius=12, pixelSize=4: corner is at (12,12), grid is 3x3
    // Cell (2,2) center at (10,10) — dist from (12,12) = ~2.83 < 12 → inside
    expect(isCellInsideCircle(2, 2, 12, 4)).toBe(true);
  });

  it('returns false for cells outside the radius', () => {
    // Cell (0,0) center at (2,2) — dist from (12,12) ≈ 14.1 > 12 → outside
    expect(isCellInsideCircle(0, 0, 12, 4)).toBe(false);
  });
});

describe('buildCornerGrid', () => {
  it('creates a square grid sized ceil(radius/pixelSize)', () => {
    const grid = buildCornerGrid(12, 4);
    expect(grid).toHaveLength(3);
    expect(grid[0]).toHaveLength(3);
  });

  it('handles zero radius', () => {
    const grid = buildCornerGrid(0, 4);
    expect(grid).toHaveLength(0);
  });
});

describe('traceStaircaseBoundary', () => {
  it('returns [] for empty grid', () => {
    expect(traceStaircaseBoundary([], 4)).toEqual([]);
  });

  it('returns points for a simple corner grid', () => {
    const grid = buildCornerGrid(8, 4);
    const points = traceStaircaseBoundary(grid, 4);
    expect(points.length).toBeGreaterThan(0);
  });
});

describe('clamp', () => {
  it('clamps within range', () => {
    expect(clamp(5, 0, 10)).toBe(5);
    expect(clamp(-5, 0, 10)).toBe(0);
    expect(clamp(15, 0, 10)).toBe(10);
  });
});

describe('lerp', () => {
  it('linearly interpolates', () => {
    expect(lerp(0, 10, 0)).toBe(0);
    expect(lerp(0, 10, 1)).toBe(10);
    expect(lerp(0, 10, 0.5)).toBe(5);
  });
});

import type { BorderRadii, Point } from '../types';
import { buildCornerGrid, traceStaircaseBoundary } from '../utils/math';

/**
 * Generate a clip-path polygon string for a rectangle with staircase corners.
 *
 * The polygon approximates border-radius with pixel-grid-aligned steps,
 * creating the characteristic pixel art aesthetic.
 */
export function generateStaircasePolygon(
  width: number,
  height: number,
  radii: BorderRadii,
  pixelSize: number,
): string {
  const points = generatePolygonPoints(width, height, radii, pixelSize);
  if (points.length === 0) {
    return 'none';
  }
  const pointStr = points.map((p) => `${p.x}px ${p.y}px`).join(', ');
  return `polygon(${pointStr})`;
}

/**
 * Generate the raw polygon points for a staircase-cornered rectangle.
 *
 * Points trace the perimeter CLOCKWISE:
 *   TL (left-edge → top-edge) → top edge →
 *   TR (top-edge → right-edge) → right edge →
 *   BR (right-edge → bottom-edge) → bottom edge →
 *   BL (bottom-edge → left-edge) → left edge → close
 */
export function generatePolygonPoints(
  width: number,
  height: number,
  radii: BorderRadii,
  pixelSize: number,
): Point[] {
  // If all radii are 0, return simple rectangle (clockwise)
  if (
    radii.topLeft === 0 &&
    radii.topRight === 0 &&
    radii.bottomRight === 0 &&
    radii.bottomLeft === 0
  ) {
    return [
      { x: 0, y: 0 },
      { x: width, y: 0 },
      { x: width, y: height },
      { x: 0, y: height },
    ];
  }

  const points: Point[] = [];

  // traceStaircaseBoundary returns the TL corner boundary going
  // from top-edge (first point) to left-edge (last point).

  // --- TL corner: REVERSED boundary → left-edge up to top-edge ---
  if (radii.topLeft > 0) {
    const boundary = getCornerBoundary(radii.topLeft, pixelSize);
    // Reverse: goes from left-edge → top-edge (clockwise)
    const reversed = [...boundary].reverse();
    points.push(...reversed);
  } else {
    points.push({ x: 0, y: 0 });
  }

  // (implicit top edge connects TL's last point to TR's first point)

  // --- TR corner: X-mirrored boundary → top-edge down to right-edge ---
  if (radii.topRight > 0) {
    const boundary = getCornerBoundary(radii.topRight, pixelSize);
    // Mirror X: x → width - x (same direction: top-edge → right-edge)
    const mirrored = boundary.map((p) => ({ x: width - p.x, y: p.y }));
    points.push(...mirrored);
  } else {
    points.push({ x: width, y: 0 });
  }

  // (implicit right edge connects TR's last point to BR's first point)

  // --- BR corner: REVERSED + XY-mirrored boundary → right-edge down to bottom-edge ---
  if (radii.bottomRight > 0) {
    const boundary = getCornerBoundary(radii.bottomRight, pixelSize);
    // Reverse then mirror XY: right-edge → bottom-edge
    const transformed = [...boundary]
      .reverse()
      .map((p) => ({ x: width - p.x, y: height - p.y }));
    points.push(...transformed);
  } else {
    points.push({ x: width, y: height });
  }

  // (implicit bottom edge connects BR's last point to BL's first point)

  // --- BL corner: Y-mirrored boundary → bottom-edge up to left-edge ---
  if (radii.bottomLeft > 0) {
    const boundary = getCornerBoundary(radii.bottomLeft, pixelSize);
    // Mirror Y: y → height - y (same direction: bottom-edge → left-edge)
    const mirrored = boundary.map((p) => ({ x: p.x, y: height - p.y }));
    points.push(...mirrored);
  } else {
    points.push({ x: 0, y: height });
  }

  // (implicit left edge connects BL's last point back to TL's first point → close)

  return points;
}

/**
 * Get the staircase boundary for a corner with given radius and pixelSize.
 * Returns points for the TOP-LEFT corner going from top-edge to left-edge.
 */
function getCornerBoundary(radius: number, pixelSize: number): Point[] {
  const grid = buildCornerGrid(radius, pixelSize);
  if (grid.length === 0) return [{ x: 0, y: 0 }];

  const boundary = traceStaircaseBoundary(grid, pixelSize);
  if (boundary.length === 0) return [{ x: 0, y: 0 }];

  return boundary;
}

/** Parse a border-radius value into per-corner radii */
export function parseBorderRadius(
  radius: number | [number, number, number, number] | undefined,
): BorderRadii {
  if (radius === undefined || radius === 0) {
    return { topLeft: 0, topRight: 0, bottomRight: 0, bottomLeft: 0 };
  }
  if (typeof radius === 'number') {
    return {
      topLeft: radius,
      topRight: radius,
      bottomRight: radius,
      bottomLeft: radius,
    };
  }
  return {
    topLeft: radius[0],
    topRight: radius[1],
    bottomRight: radius[2],
    bottomLeft: radius[3],
  };
}

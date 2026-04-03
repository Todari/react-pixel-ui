import type { Point } from '../types';

/** Snap a value down to the nearest multiple of pixelSize */
export function snapToGrid(value: number, pixelSize: number): number {
  return Math.floor(value / pixelSize) * pixelSize;
}

/** Snap a value up to the nearest multiple of pixelSize */
export function snapToGridCeil(value: number, pixelSize: number): number {
  return Math.ceil(value / pixelSize) * pixelSize;
}

/**
 * Determine if a pixel cell's center is inside a quarter-circle.
 *
 * The circle is centered at (radius, radius) with the given radius.
 * A cell at grid position (col, row) has its center at:
 *   cx = col * pixelSize + pixelSize / 2
 *   cy = row * pixelSize + pixelSize / 2
 */
export function isCellInsideCircle(
  col: number,
  row: number,
  radius: number,
  pixelSize: number,
): boolean {
  const cx = col * pixelSize + pixelSize / 2;
  const cy = row * pixelSize + pixelSize / 2;
  const dx = cx - radius;
  const dy = cy - radius;
  return dx * dx + dy * dy <= radius * radius;
}

/**
 * Build a boolean grid for a quarter-circle corner.
 * Returns a 2D array where true = cell is inside (visible).
 * Grid dimensions: gridSize x gridSize, where gridSize = ceil(radius / pixelSize).
 */
export function buildCornerGrid(
  radius: number,
  pixelSize: number,
): boolean[][] {
  const gridSize = Math.ceil(radius / pixelSize);
  const grid: boolean[][] = [];

  for (let row = 0; row < gridSize; row++) {
    grid[row] = [];
    for (let col = 0; col < gridSize; col++) {
      grid[row][col] = isCellInsideCircle(col, row, radius, pixelSize);
    }
  }

  return grid;
}

/**
 * Trace the staircase boundary of a quarter-circle corner grid.
 * Returns polygon points for the TOP-LEFT corner, going from the top edge
 * downward along the staircase to the left edge.
 *
 * The points trace the boundary between visible and hidden cells,
 * creating the characteristic pixel art staircase effect.
 */
export function traceStaircaseBoundary(
  grid: boolean[][],
  pixelSize: number,
): Point[] {
  const gridSize = grid.length;
  if (gridSize === 0) return [];

  // For each row, find the first visible column (leftmost visible cell)
  const firstVisibleCol: number[] = [];
  for (let row = 0; row < gridSize; row++) {
    let found = -1;
    for (let col = 0; col < gridSize; col++) {
      if (grid[row][col]) {
        found = col;
        break;
      }
    }
    firstVisibleCol.push(found);
  }

  // Build staircase points going from top-right to bottom-left of the corner
  const points: Point[] = [];
  let prevX = -1;

  for (let row = 0; row < gridSize; row++) {
    const col = firstVisibleCol[row];
    if (col === -1) continue; // entire row hidden

    const x = col * pixelSize;
    const y = row * pixelSize;

    if (x !== prevX) {
      if (prevX !== -1) {
        // Horizontal step: from previous x to current x at current y
        points.push({ x: prevX, y });
      }
      // Vertical point at new x position
      points.push({ x, y });
      prevX = x;
    }
  }

  // Close the bottom of the staircase to the left edge (x=0)
  if (prevX > 0) {
    const lastY = gridSize * pixelSize;
    points.push({ x: prevX, y: lastY });
    points.push({ x: 0, y: lastY });
  } else if (prevX === 0) {
    points.push({ x: 0, y: gridSize * pixelSize });
  }

  return points;
}

/** Clamp a number between min and max */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/** Linear interpolation */
export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

import type { PixelShadowConfig } from '../types';

/**
 * Parse a computed boxShadow string into a PixelShadowConfig.
 * getComputedStyle returns values like "rgba(0, 0, 0, 0.25) 4px 4px 0px 0px"
 * Takes the first shadow only.
 */
export function parseBoxShadow(
  boxShadow: string,
): PixelShadowConfig | null {
  if (!boxShadow || boxShadow === 'none') return null;

  const trimmed = boxShadow.trim();

  // Skip inset shadows
  if (trimmed.startsWith('inset')) return null;

  // Extract color (rgb/rgba at the start)
  let color = 'rgba(0,0,0,0.3)';
  let rest = trimmed;

  const rgbMatch = trimmed.match(/^(rgba?\([^)]+\))\s*/);
  if (rgbMatch) {
    color = rgbMatch[1];
    rest = trimmed.slice(rgbMatch[0].length);
  }

  // Parse values: offset-x offset-y blur spread
  const values = rest.match(/-?[\d.]+px/g);
  if (!values || values.length < 2) return null;

  const x = parseFloat(values[0]);
  const y = parseFloat(values[1]);

  if (x === 0 && y === 0) return null;

  return { x, y, color };
}

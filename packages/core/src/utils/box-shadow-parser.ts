import type { PixelShadowConfig } from '../types';

/**
 * Parse a computed boxShadow string into a PixelShadowConfig.
 *
 * getComputedStyle returns values like "rgba(0, 0, 0, 0.25) 4px 4px 0px 0px".
 * Browsers serialize the `inset` keyword at the END of each shadow
 * ("rgb(...) 4px 4px 0px 0px inset"), while author styles put it first —
 * both forms are detected. Multiple shadows are split on top-level commas
 * and the first non-inset shadow is used.
 */
export function parseBoxShadow(
  boxShadow: string,
): PixelShadowConfig | null {
  if (!boxShadow || boxShadow === 'none') return null;

  for (const shadow of splitShadows(boxShadow)) {
    const trimmed = shadow.trim();
    if (!trimmed) continue;

    // Skip inset shadows wherever the keyword appears
    if (/\binset\b/.test(trimmed)) continue;

    // Extract color (rgb/rgba anywhere in the shadow — computed style
    // puts it first, author styles may put it last)
    let color = 'rgba(0,0,0,0.3)';
    let rest = trimmed;

    const rgbMatch = trimmed.match(/(rgba?\([^)]+\))/);
    if (rgbMatch) {
      color = rgbMatch[1];
      rest = trimmed.replace(rgbMatch[1], ' ');
    }

    // Parse values: offset-x offset-y blur spread
    const values = rest.match(/-?[\d.]+px/g);
    if (!values || values.length < 2) continue;

    const x = parseFloat(values[0]);
    const y = parseFloat(values[1]);

    if (x === 0 && y === 0) continue;

    return { x, y, color };
  }

  return null;
}

/** Split a box-shadow list on commas outside parentheses */
function splitShadows(value: string): string[] {
  const parts: string[] = [];
  let depth = 0;
  let current = '';
  for (const char of value) {
    if (char === '(') depth++;
    else if (char === ')') depth--;
    if (char === ',' && depth === 0) {
      parts.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  if (current.trim()) parts.push(current);
  return parts;
}

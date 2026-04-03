import type { RGBAColor } from '../types';
import { clamp, lerp } from './math';

const NAMED_COLORS: Record<string, RGBAColor> = {
  transparent: { r: 0, g: 0, b: 0, a: 0 },
  black: { r: 0, g: 0, b: 0, a: 1 },
  white: { r: 255, g: 255, b: 255, a: 1 },
  red: { r: 255, g: 0, b: 0, a: 1 },
  green: { r: 0, g: 128, b: 0, a: 1 },
  blue: { r: 0, g: 0, b: 255, a: 1 },
  yellow: { r: 255, g: 255, b: 0, a: 1 },
  cyan: { r: 0, g: 255, b: 255, a: 1 },
  magenta: { r: 255, g: 0, b: 255, a: 1 },
  orange: { r: 255, g: 165, b: 0, a: 1 },
  purple: { r: 128, g: 0, b: 128, a: 1 },
  pink: { r: 255, g: 192, b: 203, a: 1 },
  gray: { r: 128, g: 128, b: 128, a: 1 },
  grey: { r: 128, g: 128, b: 128, a: 1 },
};

/** Parse a CSS color string into RGBA components */
export function parseColor(color: string): RGBAColor | null {
  const trimmed = color.trim().toLowerCase();

  // Named colors
  if (trimmed in NAMED_COLORS) {
    return { ...NAMED_COLORS[trimmed] };
  }

  // Hex: #rgb, #rgba, #rrggbb, #rrggbbaa
  if (trimmed.startsWith('#')) {
    return parseHexColor(trimmed);
  }

  // rgb() / rgba()
  const rgbMatch = trimmed.match(
    /rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*([\d.]+)\s*)?\)/,
  );
  if (rgbMatch) {
    return {
      r: clamp(parseInt(rgbMatch[1], 10), 0, 255),
      g: clamp(parseInt(rgbMatch[2], 10), 0, 255),
      b: clamp(parseInt(rgbMatch[3], 10), 0, 255),
      a: rgbMatch[4] !== undefined ? clamp(parseFloat(rgbMatch[4]), 0, 1) : 1,
    };
  }

  return null;
}

function parseHexColor(hex: string): RGBAColor | null {
  const h = hex.slice(1);

  if (h.length === 3) {
    return {
      r: parseInt(h[0] + h[0], 16),
      g: parseInt(h[1] + h[1], 16),
      b: parseInt(h[2] + h[2], 16),
      a: 1,
    };
  }

  if (h.length === 4) {
    return {
      r: parseInt(h[0] + h[0], 16),
      g: parseInt(h[1] + h[1], 16),
      b: parseInt(h[2] + h[2], 16),
      a: parseInt(h[3] + h[3], 16) / 255,
    };
  }

  if (h.length === 6) {
    return {
      r: parseInt(h.slice(0, 2), 16),
      g: parseInt(h.slice(2, 4), 16),
      b: parseInt(h.slice(4, 6), 16),
      a: 1,
    };
  }

  if (h.length === 8) {
    return {
      r: parseInt(h.slice(0, 2), 16),
      g: parseInt(h.slice(2, 4), 16),
      b: parseInt(h.slice(4, 6), 16),
      a: parseInt(h.slice(6, 8), 16) / 255,
    };
  }

  return null;
}

/** Interpolate between two colors at position t (0-1) */
export function interpolateColor(
  a: RGBAColor,
  b: RGBAColor,
  t: number,
): RGBAColor {
  return {
    r: Math.round(lerp(a.r, b.r, t)),
    g: Math.round(lerp(a.g, b.g, t)),
    b: Math.round(lerp(a.b, b.b, t)),
    a: lerp(a.a, b.a, t),
  };
}

/** Convert an RGBA color to a CSS string */
export function colorToCSS(color: RGBAColor): string {
  if (color.a === 1) {
    const r = color.r.toString(16).padStart(2, '0');
    const g = color.g.toString(16).padStart(2, '0');
    const b = color.b.toString(16).padStart(2, '0');
    return `#${r}${g}${b}`;
  }
  return `rgba(${color.r}, ${color.g}, ${color.b}, ${color.a})`;
}

/**
 * Sample a gradient at a given position (0-1).
 * Finds the two surrounding stops and interpolates between them.
 */
export function sampleGradient(
  stops: Array<{ color: RGBAColor; position: number }>,
  position: number,
): RGBAColor {
  if (stops.length === 0) {
    return { r: 0, g: 0, b: 0, a: 1 };
  }
  if (stops.length === 1 || position <= stops[0].position) {
    return { ...stops[0].color };
  }
  if (position >= stops[stops.length - 1].position) {
    return { ...stops[stops.length - 1].color };
  }

  // Find surrounding stops
  for (let i = 0; i < stops.length - 1; i++) {
    const curr = stops[i];
    const next = stops[i + 1];
    if (position >= curr.position && position <= next.position) {
      const range = next.position - curr.position;
      const t = range === 0 ? 0 : (position - curr.position) / range;
      return interpolateColor(curr.color, next.color, t);
    }
  }

  return { ...stops[stops.length - 1].color };
}

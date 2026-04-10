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

  // rgb() / rgba() — comma syntax: rgb(255, 0, 0) or rgba(255, 0, 0, 0.5)
  const rgbComma = trimmed.match(
    /rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*([\d.]+)\s*)?\)/,
  );
  if (rgbComma) {
    return {
      r: clamp(parseInt(rgbComma[1], 10), 0, 255),
      g: clamp(parseInt(rgbComma[2], 10), 0, 255),
      b: clamp(parseInt(rgbComma[3], 10), 0, 255),
      a: rgbComma[4] !== undefined ? clamp(parseFloat(rgbComma[4]), 0, 1) : 1,
    };
  }

  // Modern CSS space syntax: rgb(255 0 0) or rgb(255 0 0 / 0.5)
  const rgbSpace = trimmed.match(
    /rgba?\(\s*(\d+)\s+(\d+)\s+(\d+)\s*(?:\/\s*([\d.]+%?)\s*)?\)/,
  );
  if (rgbSpace) {
    let a = 1;
    if (rgbSpace[4] !== undefined) {
      a = rgbSpace[4].endsWith('%')
        ? parseFloat(rgbSpace[4]) / 100
        : parseFloat(rgbSpace[4]);
    }
    return {
      r: clamp(parseInt(rgbSpace[1], 10), 0, 255),
      g: clamp(parseInt(rgbSpace[2], 10), 0, 255),
      b: clamp(parseInt(rgbSpace[3], 10), 0, 255),
      a: clamp(a, 0, 1),
    };
  }

  // hsl() / hsla() — both comma and modern slash syntax
  const hsl = parseHslColor(trimmed);
  if (hsl) return hsl;

  // oklch() / oklab() — perceptual color spaces introduced in CSS Color 4
  const oklch = parseOklchOrOklab(trimmed);
  if (oklch) return oklch;

  return null;
}

/**
 * Parse hsl() / hsla() strings. Handles both legacy comma syntax
 * (`hsl(120, 50%, 50%)`) and modern space syntax (`hsl(120 50% 50% / 0.5)`).
 */
function parseHslColor(input: string): RGBAColor | null {
  if (!input.startsWith('hsl')) return null;

  // Comma syntax: hsl(h, s%, l%) or hsla(h, s%, l%, a)
  const comma = input.match(
    /hsla?\(\s*([-\d.]+)(deg|rad|grad|turn)?\s*,\s*([\d.]+)%\s*,\s*([\d.]+)%\s*(?:,\s*([\d.]+%?)\s*)?\)/,
  );
  if (comma) {
    return hslToRgba(
      normalizeHue(parseFloat(comma[1]), comma[2]),
      parseFloat(comma[3]) / 100,
      parseFloat(comma[4]) / 100,
      parseAlphaToken(comma[5]),
    );
  }

  // Space syntax: hsl(h s% l%) or hsl(h s% l% / a)
  const space = input.match(
    /hsla?\(\s*([-\d.]+)(deg|rad|grad|turn)?\s+([\d.]+)%\s+([\d.]+)%\s*(?:\/\s*([\d.]+%?)\s*)?\)/,
  );
  if (space) {
    return hslToRgba(
      normalizeHue(parseFloat(space[1]), space[2]),
      parseFloat(space[3]) / 100,
      parseFloat(space[4]) / 100,
      parseAlphaToken(space[5]),
    );
  }

  return null;
}

function parseAlphaToken(token: string | undefined): number {
  if (token === undefined) return 1;
  return token.endsWith('%')
    ? clamp(parseFloat(token) / 100, 0, 1)
    : clamp(parseFloat(token), 0, 1);
}

function normalizeHue(value: number, unit: string | undefined): number {
  let deg = value;
  if (unit === 'rad') deg = (value * 180) / Math.PI;
  else if (unit === 'grad') deg = value * 0.9;
  else if (unit === 'turn') deg = value * 360;
  // Wrap into [0, 360)
  deg = ((deg % 360) + 360) % 360;
  return deg;
}

function hslToRgba(h: number, s: number, l: number, a: number): RGBAColor {
  // Convert HSL → RGB via standard algorithm
  s = clamp(s, 0, 1);
  l = clamp(l, 0, 1);
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const hh = h / 60;
  const x = c * (1 - Math.abs((hh % 2) - 1));
  let r1 = 0;
  let g1 = 0;
  let b1 = 0;
  if (hh >= 0 && hh < 1) { r1 = c; g1 = x; }
  else if (hh < 2) { r1 = x; g1 = c; }
  else if (hh < 3) { g1 = c; b1 = x; }
  else if (hh < 4) { g1 = x; b1 = c; }
  else if (hh < 5) { r1 = x; b1 = c; }
  else if (hh < 6) { r1 = c; b1 = x; }
  const m = l - c / 2;
  return {
    r: Math.round((r1 + m) * 255),
    g: Math.round((g1 + m) * 255),
    b: Math.round((b1 + m) * 255),
    a,
  };
}

/**
 * Parse oklch() and oklab() functional notation.
 *
 *   oklch(L C H)       oklch(L C H / alpha)
 *   oklab(L a b)       oklab(L a b / alpha)
 *
 * L accepts a number (0–1) or a percentage. C/a/b are numbers. H is a number
 * in degrees (or with deg/rad/grad/turn units). Only the modern space-
 * separated syntax is valid per spec.
 */
function parseOklchOrOklab(input: string): RGBAColor | null {
  const isOklch = input.startsWith('oklch(');
  const isOklab = input.startsWith('oklab(');
  if (!isOklch && !isOklab) return null;

  const inner = input.slice(input.indexOf('(') + 1, input.lastIndexOf(')'));
  const slashIdx = inner.indexOf('/');
  const head = slashIdx === -1 ? inner : inner.slice(0, slashIdx);
  const alphaPart = slashIdx === -1 ? undefined : inner.slice(slashIdx + 1);

  const tokens = head.trim().split(/\s+/).filter(Boolean);
  if (tokens.length !== 3) return null;

  const L = parsePercentOrNumber(tokens[0], 1);
  if (L === null) return null;

  let oklabL: number;
  let oklabA: number;
  let oklabB: number;

  if (isOklch) {
    const C = parseFloat(tokens[1]);
    if (Number.isNaN(C)) return null;
    const huePart = tokens[2];
    const hueMatch = huePart.match(/^(-?[\d.]+)(deg|rad|grad|turn)?$/);
    if (!hueMatch) return null;
    const Hdeg = normalizeHue(parseFloat(hueMatch[1]), hueMatch[2]);
    const hueRad = (Hdeg * Math.PI) / 180;
    oklabL = L;
    oklabA = C * Math.cos(hueRad);
    oklabB = C * Math.sin(hueRad);
  } else {
    const a = parseFloat(tokens[1]);
    const b = parseFloat(tokens[2]);
    if (Number.isNaN(a) || Number.isNaN(b)) return null;
    oklabL = L;
    oklabA = a;
    oklabB = b;
  }

  const alpha = parseAlphaToken(alphaPart?.trim());
  return oklabToRgba(oklabL, oklabA, oklabB, alpha);
}

function parsePercentOrNumber(
  token: string,
  oneEquals: number,
): number | null {
  if (token.endsWith('%')) {
    const n = parseFloat(token);
    if (Number.isNaN(n)) return null;
    return (n / 100) * oneEquals;
  }
  const n = parseFloat(token);
  if (Number.isNaN(n)) return null;
  return n;
}

/** Convert oklab → linear sRGB → sRGB (gamma-corrected 0-255). */
function oklabToRgba(
  L: number,
  a: number,
  b: number,
  alpha: number,
): RGBAColor {
  // oklab → LMS (cube root space → linear LMS via cubing)
  const l_ = L + 0.3963377774 * a + 0.2158037573 * b;
  const m_ = L - 0.1055613458 * a - 0.0638541728 * b;
  const s_ = L - 0.0894841775 * a - 1.2914855480 * b;
  const lLin = l_ * l_ * l_;
  const mLin = m_ * m_ * m_;
  const sLin = s_ * s_ * s_;

  // LMS → linear sRGB
  const rLin = +4.0767416621 * lLin - 3.3077115913 * mLin + 0.2309699292 * sLin;
  const gLin = -1.2684380046 * lLin + 2.6097574011 * mLin - 0.3413193965 * sLin;
  const bLin = -0.0041960863 * lLin - 0.7034186147 * mLin + 1.7076147010 * sLin;

  const toSrgb = (v: number): number => {
    const c = v <= 0.0031308 ? 12.92 * v : 1.055 * Math.pow(v, 1 / 2.4) - 0.055;
    return Math.round(clamp(c, 0, 1) * 255);
  };

  return {
    r: toSrgb(rLin),
    g: toSrgb(gLin),
    b: toSrgb(bLin),
    a: alpha,
  };
}

const HEX_RE = /^[0-9a-f]+$/;

function parseHexColor(hex: string): RGBAColor | null {
  const h = hex.slice(1);

  // Reject any non-hex characters before parseInt (which would yield NaN).
  if (!HEX_RE.test(h)) return null;

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

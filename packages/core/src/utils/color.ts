import type { RGBAColor } from '../types';
import { clamp, lerp } from './math';

// Complete CSS named-color table (CSS Color 4), stored as packed 0xRRGGBB
// numbers to keep the bundle small. `transparent` is handled separately.
const NAMED_COLOR_HEX: Record<string, number> = {
  aliceblue: 0xf0f8ff, antiquewhite: 0xfaebd7, aqua: 0x00ffff,
  aquamarine: 0x7fffd4, azure: 0xf0ffff, beige: 0xf5f5dc, bisque: 0xffe4c4,
  black: 0x000000, blanchedalmond: 0xffebcd, blue: 0x0000ff,
  blueviolet: 0x8a2be2, brown: 0xa52a2a, burlywood: 0xdeb887,
  cadetblue: 0x5f9ea0, chartreuse: 0x7fff00, chocolate: 0xd2691e,
  coral: 0xff7f50, cornflowerblue: 0x6495ed, cornsilk: 0xfff8dc,
  crimson: 0xdc143c, cyan: 0x00ffff, darkblue: 0x00008b, darkcyan: 0x008b8b,
  darkgoldenrod: 0xb8860b, darkgray: 0xa9a9a9, darkgreen: 0x006400,
  darkgrey: 0xa9a9a9, darkkhaki: 0xbdb76b, darkmagenta: 0x8b008b,
  darkolivegreen: 0x556b2f, darkorange: 0xff8c00, darkorchid: 0x9932cc,
  darkred: 0x8b0000, darksalmon: 0xe9967a, darkseagreen: 0x8fbc8f,
  darkslateblue: 0x483d8b, darkslategray: 0x2f4f4f, darkslategrey: 0x2f4f4f,
  darkturquoise: 0x00ced1, darkviolet: 0x9400d3, deeppink: 0xff1493,
  deepskyblue: 0x00bfff, dimgray: 0x696969, dimgrey: 0x696969,
  dodgerblue: 0x1e90ff, firebrick: 0xb22222, floralwhite: 0xfffaf0,
  forestgreen: 0x228b22, fuchsia: 0xff00ff, gainsboro: 0xdcdcdc,
  ghostwhite: 0xf8f8ff, gold: 0xffd700, goldenrod: 0xdaa520, gray: 0x808080,
  green: 0x008000, greenyellow: 0xadff2f, grey: 0x808080,
  honeydew: 0xf0fff0, hotpink: 0xff69b4, indianred: 0xcd5c5c,
  indigo: 0x4b0082, ivory: 0xfffff0, khaki: 0xf0e68c, lavender: 0xe6e6fa,
  lavenderblush: 0xfff0f5, lawngreen: 0x7cfc00, lemonchiffon: 0xfffacd,
  lightblue: 0xadd8e6, lightcoral: 0xf08080, lightcyan: 0xe0ffff,
  lightgoldenrodyellow: 0xfafad2, lightgray: 0xd3d3d3, lightgreen: 0x90ee90,
  lightgrey: 0xd3d3d3, lightpink: 0xffb6c1, lightsalmon: 0xffa07a,
  lightseagreen: 0x20b2aa, lightskyblue: 0x87cefa, lightslategray: 0x778899,
  lightslategrey: 0x778899, lightsteelblue: 0xb0c4de, lightyellow: 0xffffe0,
  lime: 0x00ff00, limegreen: 0x32cd32, linen: 0xfaf0e6, magenta: 0xff00ff,
  maroon: 0x800000, mediumaquamarine: 0x66cdaa, mediumblue: 0x0000cd,
  mediumorchid: 0xba55d3, mediumpurple: 0x9370db, mediumseagreen: 0x3cb371,
  mediumslateblue: 0x7b68ee, mediumspringgreen: 0x00fa9a,
  mediumturquoise: 0x48d1cc, mediumvioletred: 0xc71585,
  midnightblue: 0x191970, mintcream: 0xf5fffa, mistyrose: 0xffe4e1,
  moccasin: 0xffe4b5, navajowhite: 0xffdead, navy: 0x000080,
  oldlace: 0xfdf5e6, olive: 0x808000, olivedrab: 0x6b8e23, orange: 0xffa500,
  orangered: 0xff4500, orchid: 0xda70d6, palegoldenrod: 0xeee8aa,
  palegreen: 0x98fb98, paleturquoise: 0xafeeee, palevioletred: 0xdb7093,
  papayawhip: 0xffefd5, peachpuff: 0xffdab9, peru: 0xcd853f, pink: 0xffc0cb,
  plum: 0xdda0dd, powderblue: 0xb0e0e6, purple: 0x800080,
  rebeccapurple: 0x663399, red: 0xff0000, rosybrown: 0xbc8f8f,
  royalblue: 0x4169e1, saddlebrown: 0x8b4513, salmon: 0xfa8072,
  sandybrown: 0xf4a460, seagreen: 0x2e8b57, seashell: 0xfff5ee,
  sienna: 0xa0522d, silver: 0xc0c0c0, skyblue: 0x87ceeb,
  slateblue: 0x6a5acd, slategray: 0x708090, slategrey: 0x708090,
  snow: 0xfffafa, springgreen: 0x00ff7f, steelblue: 0x4682b4, tan: 0xd2b48c,
  teal: 0x008080, thistle: 0xd8bfd8, tomato: 0xff6347, turquoise: 0x40e0d0,
  violet: 0xee82ee, wheat: 0xf5deb3, white: 0xffffff, whitesmoke: 0xf5f5f5,
  yellow: 0xffff00, yellowgreen: 0x9acd32,
};

/** Parse a CSS color string into RGBA components */
export function parseColor(color: string): RGBAColor | null {
  const trimmed = color.trim().toLowerCase();

  // Named colors
  if (trimmed === 'transparent') {
    return { r: 0, g: 0, b: 0, a: 0 };
  }
  if (trimmed in NAMED_COLOR_HEX) {
    const packed = NAMED_COLOR_HEX[trimmed];
    return {
      r: (packed >> 16) & 0xff,
      g: (packed >> 8) & 0xff,
      b: packed & 0xff,
      a: 1,
    };
  }

  // Hex: #rgb, #rgba, #rrggbb, #rrggbbaa
  if (trimmed.startsWith('#')) {
    return parseHexColor(trimmed);
  }

  // rgb() / rgba() — comma syntax: rgb(255, 0, 0) or rgba(255, 0, 0, 0.5)
  // Anchored so embedded colors inside larger strings (e.g. an unsupported
  // `conic-gradient(rgb(255, 0, 0), ...)`) are not misparsed as the color.
  const rgbComma = trimmed.match(
    /^rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*([\d.]+)\s*)?\)$/,
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
    /^rgba?\(\s*(\d+)\s+(\d+)\s+(\d+)\s*(?:\/\s*([\d.]+%?)\s*)?\)$/,
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

  // color(<colorspace> r g b [/ a]) — Chromium serializes computed
  // color-mix() results in this form (e.g. "color(srgb 0.5 0 0.5)")
  const colorFn = parseColorFunction(trimmed);
  if (colorFn) return colorFn;

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

/**
 * Parse `color(<colorspace> c1 c2 c3 [/ alpha])` functional notation.
 *
 * Chromium serializes computed color-mix() results (and other CSS Color 4
 * colors) in this form. Supports srgb, srgb-linear, and display-p3.
 */
function parseColorFunction(input: string): RGBAColor | null {
  const match = input.match(
    /^color\(\s*(srgb|srgb-linear|display-p3)\s+(-?[\d.]+%?)\s+(-?[\d.]+%?)\s+(-?[\d.]+%?)\s*(?:\/\s*([\d.]+%?)\s*)?\)$/,
  );
  if (!match) return null;

  const space = match[1];
  const channel = (token: string): number => {
    const n = token.endsWith('%') ? parseFloat(token) / 100 : parseFloat(token);
    return clamp(n, 0, 1);
  };
  let r = channel(match[2]);
  let g = channel(match[3]);
  let b = channel(match[4]);
  const alpha = parseAlphaToken(match[5]);

  if (space === 'srgb') {
    return {
      r: Math.round(r * 255),
      g: Math.round(g * 255),
      b: Math.round(b * 255),
      a: alpha,
    };
  }

  if (space === 'display-p3') {
    // display-p3 → linear P3 → XYZ → linear sRGB
    const lin = (v: number) =>
      v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    const lr = lin(r);
    const lg = lin(g);
    const lb = lin(b);
    r = 1.2249401762 * lr - 0.2249404026 * lg;
    g = -0.0420569547 * lr + 1.0420571161 * lg;
    b = -0.0196375546 * lr - 0.0786360456 * lg + 1.0982736002 * lb;
  } else {
    // srgb-linear: channels are already linear sRGB
  }

  const toSrgb = (v: number): number => {
    const c = v <= 0.0031308 ? 12.92 * v : 1.055 * Math.pow(v, 1 / 2.4) - 0.055;
    return Math.round(clamp(c, 0, 1) * 255);
  };

  // For srgb-linear and display-p3 paths, r/g/b now hold linear sRGB
  return { r: toSrgb(r), g: toSrgb(g), b: toSrgb(b), a: alpha };
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

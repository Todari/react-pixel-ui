import type { ParsedGradient, GradientStop, GradientCorner } from '../types';
import { parseColor } from './color';

// Side keywords have exact angles; corner keywords are aspect-ratio
// dependent ("magic corners") and handled via CORNER_MAP below.
const DIRECTION_MAP: Record<string, number> = {
  'to top': 0,
  'to right': 90,
  'to bottom': 180,
  'to left': 270,
};

const CORNER_MAP: Record<string, GradientCorner> = {
  'to top right': 'top-right',
  'to right top': 'top-right',
  'to bottom right': 'bottom-right',
  'to right bottom': 'bottom-right',
  'to bottom left': 'bottom-left',
  'to left bottom': 'bottom-left',
  'to top left': 'top-left',
  'to left top': 'top-left',
};

/** Square-box approximation used when the element size is unknown */
const CORNER_FALLBACK_ANGLE: Record<GradientCorner, number> = {
  'top-right': 45,
  'bottom-right': 135,
  'bottom-left': 225,
  'top-left': 315,
};

/**
 * Parse a CSS gradient string into a structured representation.
 * Supports linear-gradient with angles and direction keywords.
 */
export function parseGradient(cssGradient: string): ParsedGradient | null {
  const trimmed = cssGradient.trim();

  // Support repeating-linear-gradient and repeating-radial-gradient
  // by stripping the "repeating-" prefix (pixel art inherently doesn't repeat)
  const normalized = trimmed.replace(/^repeating-/, '');

  if (normalized.startsWith('linear-gradient')) {
    return parseLinearGradient(normalized);
  }

  if (normalized.startsWith('radial-gradient')) {
    return parseRadialGradient(normalized);
  }

  return null;
}

/**
 * Resolve the actual gradient angle for an element of the given size.
 *
 * Corner keywords (`to top right` etc.) don't have a fixed angle: per
 * CSS Images 3 the gradient line is perpendicular to the box diagonal
 * joining the two corners adjacent to the target corner, so the angle
 * depends on the element's aspect ratio.
 */
export function resolveGradientAngle(
  gradient: ParsedGradient,
  width: number,
  height: number,
): number {
  if (!gradient.corner || width <= 0 || height <= 0) return gradient.angle;
  const base = (Math.atan2(height, width) * 180) / Math.PI;
  switch (gradient.corner) {
    case 'top-right':
      return base;
    case 'bottom-right':
      return 180 - base;
    case 'bottom-left':
      return 180 + base;
    case 'top-left':
      return 360 - base;
  }
}

/**
 * Strip a CSS Color 4 interpolation-method suffix from a direction
 * prelude, e.g. "to right in oklab" or "45deg in oklch longer hue".
 * Tailwind v4 emits these and they survive into getComputedStyle output.
 */
function stripInterpolationMethod(part: string): string {
  return part
    .replace(
      /\s+in\s+[a-z0-9-]+(\s+(shorter|longer|increasing|decreasing)\s+hue)?$/i,
      '',
    )
    .trim();
}

/** Parse a CSS angle token (deg/rad/grad/turn) into degrees */
function parseAngleToken(token: string): number | null {
  const m = token.match(/^(-?[\d.]+)(deg|rad|grad|turn)$/i);
  if (!m) return null;
  const v = parseFloat(m[1]);
  if (Number.isNaN(v)) return null;
  const unit = m[2].toLowerCase();
  if (unit === 'rad') return (v * 180) / Math.PI;
  if (unit === 'grad') return v * 0.9;
  if (unit === 'turn') return v * 360;
  return v;
}

function parseLinearGradient(css: string): ParsedGradient | null {
  // Extract content inside parentheses
  const match = css.match(/linear-gradient\((.+)\)/s);
  if (!match) return null;

  const content = match[1].trim();
  const parts = splitGradientArgs(content);

  let angle = 180; // default: to bottom
  let corner: GradientCorner | undefined;
  let colorStartIndex = 0;

  const firstRaw = parts[0].trim().toLowerCase();

  if (/^in\s/.test(firstRaw)) {
    // Bare interpolation-method prelude, e.g. "in oklab" — default direction
    colorStartIndex = 1;
  } else {
    const firstPart = stripInterpolationMethod(firstRaw);
    const parsedAngle = parseAngleToken(firstPart);
    if (parsedAngle !== null) {
      angle = parsedAngle;
      colorStartIndex = 1;
    } else if (firstPart.startsWith('to ')) {
      const dir = firstPart.replace(/\s+/g, ' ');
      if (dir in DIRECTION_MAP) {
        angle = DIRECTION_MAP[dir];
      } else if (dir in CORNER_MAP) {
        corner = CORNER_MAP[dir];
        angle = CORNER_FALLBACK_ANGLE[corner];
      }
      colorStartIndex = 1;
    }
  }

  // Parse color stops
  const stops = parseColorStops(parts.slice(colorStartIndex));
  if (stops.length < 2) return null;

  return corner
    ? { type: 'linear', angle, stops, corner }
    : { type: 'linear', angle, stops };
}

const FUNCTIONAL_COLOR_PREFIXES = ['rgb', 'hsl', 'oklch', 'oklab', 'color('];

function isFunctionalColor(part: string): boolean {
  return FUNCTIONAL_COLOR_PREFIXES.some((p) => part.startsWith(p));
}

function parseRadialGradient(css: string): ParsedGradient | null {
  const match = css.match(/radial-gradient\((.+)\)/s);
  if (!match) return null;

  const content = match[1].trim();
  const parts = splitGradientArgs(content);

  // Skip shape/size/position keywords, find color stops
  let colorStartIndex = 0;
  for (let i = 0; i < parts.length; i++) {
    const part = parts[i].trim();
    // If part looks like a color (starts with # or a functional color or
    // is a named color), start here.
    if (
      part.startsWith('#') ||
      isFunctionalColor(part) ||
      /^[a-z]+(\s|$)/.test(part)
    ) {
      // For functional colors the whole part is the color;
      // for named/hex, take the first whitespace-separated token.
      const colorCandidate = isFunctionalColor(part)
        ? part
        : part.split(/\s+/)[0];
      if (parseColor(colorCandidate)) {
        colorStartIndex = i;
        break;
      }
    }
  }

  const stops = parseColorStops(parts.slice(colorStartIndex));
  if (stops.length < 2) return null;

  return { type: 'radial', angle: 0, stops };
}

/**
 * Split gradient arguments by commas, respecting parentheses.
 * e.g., "rgb(1,2,3) 0%, rgb(4,5,6) 100%" → ["rgb(1,2,3) 0%", "rgb(4,5,6) 100%"]
 */
function splitGradientArgs(content: string): string[] {
  const parts: string[] = [];
  let depth = 0;
  let current = '';

  for (const char of content) {
    if (char === '(') depth++;
    else if (char === ')') depth--;

    if (char === ',' && depth === 0) {
      parts.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }

  if (current.trim()) {
    parts.push(current.trim());
  }

  return parts;
}

/** Parse an array of "color position" strings into GradientStops */
function parseColorStops(parts: string[]): GradientStop[] {
  const stops: GradientStop[] = [];

  for (const rawPart of parts) {
    const part = rawPart.trim();
    if (!part) continue;

    // Tokenize trailing <length-percentage> position tokens. CSS allows
    // up to two (double-position stops like "red 0% 50%" define two stops).
    const m = part.match(/^(.*?)((?:\s+-?[\d.]+(?:%|px))*)$/s);
    const colorStr = (m ? m[1] : part).trim();
    const posTokens = m && m[2] ? m[2].trim().split(/\s+/).filter(Boolean) : [];

    const color = parseColor(colorStr);
    if (!color) continue;

    // px positions can't be resolved without the element size — keep the
    // stop and let its position be auto-distributed (graceful degradation).
    const positions: Array<number | null> = posTokens.length
      ? posTokens.map((tok) =>
          tok.endsWith('%') ? Math.max(0, parseFloat(tok) / 100) : null,
        )
      : [null];

    for (const position of positions) {
      stops.push({ color: { ...color }, position: position ?? -1 });
    }
  }

  // Resolve edge sentinels by stop index (not raw part index, which can
  // diverge when a part fails to parse or expands to two stops): an
  // unspecified first stop sits at 0, an unspecified last stop at 1.
  if (stops.length > 0) {
    if (stops[0].position < 0) stops[0].position = 0;
    const last = stops[stops.length - 1];
    if (last.position < 0) last.position = 1;
  }

  // Fill in missing positions with even distribution
  distributePositions(stops);

  return stops;
}

/** Distribute missing positions (marked as -1) evenly between known positions */
function distributePositions(stops: GradientStop[]): void {
  let lastKnown = 0;

  for (let i = 0; i < stops.length; i++) {
    if (stops[i].position >= 0) {
      // Found a known position — fill in gaps before it
      const knownPos = stops[i].position;
      const gapStart = lastKnown + 1;

      if (gapStart <= i) {
        const startPos = stops[lastKnown].position;
        const count = i - lastKnown;
        for (let j = gapStart; j < i; j++) {
          const t = (j - lastKnown) / count;
          stops[j].position = startPos + t * (knownPos - startPos);
        }
      }

      lastKnown = i;
    }
  }
}

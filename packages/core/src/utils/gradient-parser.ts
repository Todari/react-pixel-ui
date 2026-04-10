import type { ParsedGradient, GradientStop } from '../types';
import { parseColor } from './color';

const DIRECTION_MAP: Record<string, number> = {
  'to top': 0,
  'to top right': 45,
  'to right': 90,
  'to bottom right': 135,
  'to bottom': 180,
  'to bottom left': 225,
  'to left': 270,
  'to top left': 315,
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

function parseLinearGradient(css: string): ParsedGradient | null {
  // Extract content inside parentheses
  const match = css.match(/linear-gradient\((.+)\)/s);
  if (!match) return null;

  const content = match[1].trim();
  const parts = splitGradientArgs(content);

  let angle = 180; // default: to bottom
  let colorStartIndex = 0;

  // Check if first part is an angle or direction
  const firstPart = parts[0].trim();

  if (firstPart.endsWith('deg')) {
    angle = parseFloat(firstPart);
    colorStartIndex = 1;
  } else if (firstPart.startsWith('to ')) {
    const dir = firstPart.toLowerCase();
    if (dir in DIRECTION_MAP) {
      angle = DIRECTION_MAP[dir];
    }
    colorStartIndex = 1;
  }

  // Parse color stops
  const stops = parseColorStops(parts.slice(colorStartIndex));
  if (stops.length < 2) return null;

  return { type: 'linear', angle, stops };
}

const FUNCTIONAL_COLOR_PREFIXES = ['rgb', 'hsl', 'oklch', 'oklab'];

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

  for (let i = 0; i < parts.length; i++) {
    const part = parts[i].trim();
    if (!part) continue;

    // Split into color and optional position
    // The position is always at the end, like "50%" or "100px"
    const posMatch = part.match(/\s+([\d.]+%?)$/);
    let colorStr: string;
    let position: number | null = null;

    if (posMatch) {
      colorStr = part.slice(0, posMatch.index).trim();
      const posStr = posMatch[1];
      if (posStr.endsWith('%')) {
        position = parseFloat(posStr) / 100;
      } else {
        position = parseFloat(posStr);
      }
    } else {
      colorStr = part;
    }

    const color = parseColor(colorStr);
    if (!color) continue;

    // If position not specified, it will be distributed evenly
    if (position === null) {
      if (i === 0) position = 0;
      else if (i === parts.length - 1) position = 1;
    }

    stops.push({ color, position: position ?? -1 });
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

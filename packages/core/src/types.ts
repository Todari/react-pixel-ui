import type { CSSProperties } from './css-properties';

/** Pixel art configuration input */
export interface PixelArtConfig {
  /** Pixel grid size in CSS px (e.g., 4 = 4x4 pixel blocks) */
  pixelSize: number;
  /** Border radius to pixelate into staircase corners. Supports per-corner array [tl, tr, br, bl] */
  borderRadius?: number | [number, number, number, number];
  /** Pixel border thickness in CSS px */
  borderWidth?: number;
  /** Border color (any CSS color string) */
  borderColor?: string;
  /** Background color or CSS gradient string */
  backgroundColor?: string;
  /** Hard pixel shadow (no blur) */
  shadow?: PixelShadowConfig;
}

export interface PixelShadowConfig {
  /** Horizontal offset in CSS px (snapped to pixelSize grid) */
  x: number;
  /** Vertical offset in CSS px (snapped to pixelSize grid) */
  y: number;
  /** Shadow color (any CSS color string) */
  color: string;
}

/** Generated pixel art styles for DOM application */
export interface PixelArtStyles {
  /** Style for the outer wrapper div (border layer). Only needed when needsWrapper is true */
  wrapperStyle: CSSProperties;
  /** Style for the inner content div */
  contentStyle: CSSProperties;
  /** Whether a wrapper div is needed (true when border is specified) */
  needsWrapper: boolean;
  /** Outer clip-path polygon string */
  clipPath: string;
  /** Inner clip-path polygon string (null if no border) */
  innerClipPath: string | null;
  /** Composite BMP data URL with border + gradient baked in (for single-element rendering) */
  compositeImage: string | null;
}

/** Point on a 2D coordinate system */
export interface Point {
  x: number;
  y: number;
}

/** Parsed border radius values for each corner */
export interface BorderRadii {
  topLeft: number;
  topRight: number;
  bottomRight: number;
  bottomLeft: number;
}

/** Parsed CSS gradient stop */
export interface GradientStop {
  color: RGBAColor;
  position: number; // 0-1
}

/** Corner target of a `to <corner>` linear gradient direction */
export type GradientCorner =
  | 'top-left'
  | 'top-right'
  | 'bottom-right'
  | 'bottom-left';

/** Parsed CSS gradient */
export interface ParsedGradient {
  type: 'linear' | 'radial';
  angle: number; // degrees (CSS convention: 0=top, 90=right)
  stops: GradientStop[];
  /**
   * Set when the direction was a corner keyword (e.g. `to top right`).
   * Per CSS the real angle depends on the element's aspect ratio —
   * resolve it with resolveGradientAngle(gradient, width, height).
   * `angle` holds the square-box (45°-multiple) approximation as fallback.
   */
  corner?: GradientCorner;
}

/** RGBA color representation */
export interface RGBAColor {
  r: number; // 0-255
  g: number; // 0-255
  b: number; // 0-255
  a: number; // 0-1
}

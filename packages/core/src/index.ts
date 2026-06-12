// Types
export type {
  PixelArtConfig,
  PixelArtStyles,
  PixelShadowConfig,
  BorderRadii,
  Point,
  RGBAColor,
  ParsedGradient,
  GradientStop,
  GradientCorner,
} from './types';

export type { CSSProperties } from './css-properties';

// Main composer
export { generatePixelArt } from './composer';
export type { GeneratePixelArtOptions } from './composer';

// Individual generators (tree-shakeable)
export {
  generateStaircasePolygon,
  generatePolygonPoints,
  parseBorderRadius,
} from './generators/staircase-polygon';
export { generateSteppedGradient } from './generators/stepped-gradient';
export { generatePixelGradient } from './generators/pixel-gradient';
export { generateCompositePixelImage } from './generators/composite-pixel-image';
export { generatePixelShadow } from './generators/pixel-shadow';

// Computed style parser
export { parseComputedStyles } from './computed-style-parser';
export type { ElementSize } from './computed-style-parser';

// Utilities
export { parseColor, interpolateColor, colorToCSS } from './utils/color';
export { parseGradient, resolveGradientAngle } from './utils/gradient-parser';
export { snapToGrid, snapToGridCeil, sanitizePixelSize } from './utils/math';

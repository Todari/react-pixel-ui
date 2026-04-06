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
} from './types';

export type { CSSProperties } from './css-properties';

// Main composer
export { generatePixelArt } from './composer';

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

// Utilities
export { parseColor, interpolateColor, colorToCSS } from './utils/color';
export { parseGradient } from './utils/gradient-parser';
export { snapToGrid, snapToGridCeil } from './utils/math';

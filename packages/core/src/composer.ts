import type { CSSProperties } from './css-properties';
import type { PixelArtConfig, PixelArtStyles, BorderRadii } from './types';
import {
  generateStaircasePolygon,
  parseBorderRadius,
} from './generators/staircase-polygon';
import { generatePixelGradient } from './generators/pixel-gradient';
import { generatePixelShadow } from './generators/pixel-shadow';

/**
 * Snap a value to the nearest multiple of pixelSize.
 * Returns at least pixelSize if the value is positive.
 */
function snapToPixel(value: number, pixelSize: number): number {
  if (value <= 0) return 0;
  return Math.max(pixelSize, Math.round(value / pixelSize) * pixelSize);
}

/**
 * Snap border radii to pixel grid and clamp so corners don't overlap.
 * Same behavior as CSS: radius is clamped to min(width/2, height/2).
 */
function snapRadii(
  radii: BorderRadii,
  pixelSize: number,
  width: number,
  height: number,
): BorderRadii {
  const maxR = Math.min(width / 2, height / 2);
  const snap = (r: number) =>
    r > 0 ? Math.min(snapToPixel(r, pixelSize), maxR) : 0;
  return {
    topLeft: snap(radii.topLeft),
    topRight: snap(radii.topRight),
    bottomRight: snap(radii.bottomRight),
    bottomLeft: snap(radii.bottomLeft),
  };
}

/**
 * Generate pixel art styles from a configuration.
 *
 * All values (borderWidth, borderRadius) are snapped to the pixelSize grid
 * so that inner and outer staircases stay in phase.
 */
export function generatePixelArt(
  width: number,
  height: number,
  config: PixelArtConfig,
): PixelArtStyles {
  const { pixelSize, borderColor, backgroundColor, shadow } = config;

  // Snap border width to pixel grid for clean alignment
  const borderWidth = config.borderWidth
    ? snapToPixel(config.borderWidth, pixelSize)
    : 0;

  // Snap radii to pixel grid and clamp to element dimensions
  const rawRadii = parseBorderRadius(config.borderRadius);
  const radii = snapRadii(rawRadii, pixelSize, width, height);

  const needsWrapper = borderWidth > 0 && !!borderColor;

  // Generate outer clip-path
  const hasRadius = Object.values(radii).some((r) => r > 0);
  const outerClipPath = hasRadius
    ? generateStaircasePolygon(width, height, radii, pixelSize)
    : 'none';

  // Generate inner clip-path by insetting outer radii by snapped borderWidth
  let innerClipPath: string | null = null;
  if (needsWrapper) {
    const innerWidth = width - borderWidth * 2;
    const innerHeight = height - borderWidth * 2;
    const innerRadii: BorderRadii = {
      topLeft: Math.max(0, radii.topLeft - borderWidth),
      topRight: Math.max(0, radii.topRight - borderWidth),
      bottomRight: Math.max(0, radii.bottomRight - borderWidth),
      bottomLeft: Math.max(0, radii.bottomLeft - borderWidth),
    };
    const hasInnerRadius = Object.values(innerRadii).some((r) => r > 0);
    innerClipPath = hasInnerRadius
      ? generateStaircasePolygon(innerWidth, innerHeight, innerRadii, pixelSize)
      : 'none';
  }

  // Resolve background — use inner dimensions for gradient when border exists
  const bgWidth = needsWrapper ? width - borderWidth * 2 : width;
  const bgHeight = needsWrapper ? height - borderWidth * 2 : height;
  const resolvedBg = resolveBackground(
    backgroundColor,
    pixelSize,
    bgWidth,
    bgHeight,
  );

  // Generate shadow filter
  const shadowFilter = shadow
    ? generatePixelShadow(shadow.x, shadow.y, shadow.color, pixelSize)
    : undefined;

  // Build styles
  const wrapperStyle: CSSProperties = {};
  const contentStyle: CSSProperties = {};

  if (needsWrapper) {
    // Wrapper: border color background + outer clip-path
    wrapperStyle.position = 'relative';
    wrapperStyle.backgroundColor = borderColor;
    wrapperStyle.width = `${width}px`;
    wrapperStyle.height = `${height}px`;
    if (outerClipPath !== 'none') {
      wrapperStyle.clipPath = outerClipPath;
    }
    if (shadowFilter) {
      wrapperStyle.filter = shadowFilter;
    }

    // Content: inner background + inner clip-path
    contentStyle.position = 'absolute';
    contentStyle.inset = `${borderWidth}px`;
    contentStyle.overflow = 'hidden';
    if (innerClipPath && innerClipPath !== 'none') {
      contentStyle.clipPath = innerClipPath;
    }
    applyBackground(contentStyle, resolvedBg);
  } else {
    // No border: single element with clip-path
    contentStyle.width = `${width}px`;
    contentStyle.height = `${height}px`;
    if (outerClipPath !== 'none') {
      contentStyle.clipPath = outerClipPath;
    }
    applyBackground(contentStyle, resolvedBg);
    if (shadowFilter) {
      contentStyle.filter = shadowFilter;
    }
  }

  return {
    wrapperStyle,
    contentStyle,
    needsWrapper,
    clipPath: outerClipPath,
    innerClipPath,
  };
}

interface ResolvedBackground {
  /** True if this is a pixel gradient BMP (needs image-rendering: pixelated) */
  isPixelImage: boolean;
  /** CSS value — either a color string or a url("data:...") */
  value: string;
}

/** Resolve background — generate pixel gradient BMP for gradients, pass through solid colors */
function resolveBackground(
  backgroundColor: string | undefined,
  pixelSize: number,
  width: number,
  height: number,
): ResolvedBackground | undefined {
  if (!backgroundColor) return undefined;

  if (
    backgroundColor.includes('linear-gradient') ||
    backgroundColor.includes('radial-gradient')
  ) {
    const bmpUrl = generatePixelGradient(
      backgroundColor,
      pixelSize,
      width,
      height,
    );
    if (bmpUrl) {
      return { isPixelImage: true, value: bmpUrl };
    }
  }

  return { isPixelImage: false, value: backgroundColor };
}

/** Apply resolved background to a style object */
function applyBackground(
  style: CSSProperties,
  bg: ResolvedBackground | undefined,
): void {
  if (!bg) return;

  if (bg.isPixelImage) {
    style.backgroundImage = bg.value;
    style.backgroundSize = '100% 100%';
    style.backgroundRepeat = 'no-repeat';
    style.imageRendering = 'pixelated';
  } else {
    style.background = bg.value;
  }
}

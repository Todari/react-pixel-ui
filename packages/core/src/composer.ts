import type { CSSProperties } from './css-properties';
import type { PixelArtConfig, PixelArtStyles, BorderRadii } from './types';
import {
  generateStaircasePolygon,
  parseBorderRadius,
} from './generators/staircase-polygon';
import { generatePixelGradient } from './generators/pixel-gradient';
import { generateCompositePixelImage } from './generators/composite-pixel-image';
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

/** Options for generatePixelArt */
export interface GeneratePixelArtOptions {
  /**
   * Which outputs to generate. Generating a PNG is the expensive part
   * of this function, and the two PNG outputs are mutually exclusive in
   * practice — generating only the one you need roughly halves the cost.
   *
   * - 'styles': wrapperStyle/contentStyle (pixel-gradient backgroundImage);
   *   compositeImage is null.
   * - 'composite': compositeImage (border + background in one PNG);
   *   contentStyle carries the raw background as fallback.
   * - 'both' (default): everything — backward compatible.
   */
  want?: 'styles' | 'composite' | 'both';
}

// Small LRU keyed by all inputs. generatePixelArt is pure, and UI churn
// (hover/focus/theme toggles) tends to alternate between a handful of
// configs — caching makes repeat generations free.
const CACHE_LIMIT = 16;
const artCache = new Map<string, PixelArtStyles>();

/**
 * Generate pixel art styles from a configuration.
 *
 * All values (borderWidth, borderRadius) are snapped to the pixelSize grid
 * so that inner and outer staircases stay in phase.
 *
 * Results are cached (small LRU) — treat the returned object as immutable.
 */
export function generatePixelArt(
  width: number,
  height: number,
  config: PixelArtConfig,
  options?: GeneratePixelArtOptions,
): PixelArtStyles {
  const want = options?.want ?? 'both';

  const cacheKey = `${width}|${height}|${want}|${JSON.stringify(config)}`;
  const cached = artCache.get(cacheKey);
  if (cached) {
    // Refresh LRU position
    artCache.delete(cacheKey);
    artCache.set(cacheKey, cached);
    return cached;
  }

  const result = generatePixelArtUncached(width, height, config, want);

  artCache.set(cacheKey, result);
  if (artCache.size > CACHE_LIMIT) {
    const oldest = artCache.keys().next().value;
    if (oldest !== undefined) artCache.delete(oldest);
  }

  return result;
}

function generatePixelArtUncached(
  width: number,
  height: number,
  config: PixelArtConfig,
  want: 'styles' | 'composite' | 'both',
): PixelArtStyles {
  const { borderColor, backgroundColor, shadow } = config;

  // Validate pixelSize — prevent division by zero / infinite loops
  const pixelSize = Math.max(1, Math.floor(config.pixelSize || 4));

  // Snap border width to pixel grid, clamp to half element size
  const maxBorderWidth = Math.floor(Math.min(width, height) / 2);
  const borderWidth = config.borderWidth
    ? Math.min(snapToPixel(config.borderWidth, pixelSize), maxBorderWidth)
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

  // Resolve background — use inner dimensions for gradient when border exists.
  // When only the composite output is wanted, skip the (expensive) pixel
  // gradient PNG and pass the raw background through as a fallback value.
  const bgWidth = needsWrapper ? width - borderWidth * 2 : width;
  const bgHeight = needsWrapper ? height - borderWidth * 2 : height;
  const resolvedBg =
    want === 'composite'
      ? backgroundColor !== undefined
        ? { isPixelImage: false, value: backgroundColor }
        : undefined
      : resolveBackground(backgroundColor, pixelSize, bgWidth, bgHeight);

  // Generate shadow filter. Offsets that snap to 0/0 produce no visible
  // shadow — skip the filter entirely so consumers don't add wrappers for it.
  let shadowFilter = shadow
    ? generatePixelShadow(shadow.x, shadow.y, shadow.color, pixelSize)
    : undefined;
  if (shadowFilter && shadowFilter.startsWith('drop-shadow(0px 0px')) {
    shadowFilter = undefined;
  }

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

  // Generate composite PNG with border + gradient baked in (for
  // single-element use) — skipped when only styles are wanted.
  const compositeImage =
    want === 'styles'
      ? null
      : generateCompositePixelImage(
          width, height, pixelSize, radii,
          needsWrapper ? borderWidth : 0,
          needsWrapper ? borderColor : undefined,
          backgroundColor,
        );

  return {
    wrapperStyle,
    contentStyle,
    needsWrapper,
    clipPath: outerClipPath,
    innerClipPath,
    compositeImage,
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

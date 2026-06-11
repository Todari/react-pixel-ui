import type { PixelArtConfig } from './types';
import { parseBoxShadow } from './utils/box-shadow-parser';

/** Element size used to resolve percentage-based computed values */
export interface ElementSize {
  width: number;
  height: number;
}

/**
 * Resolve a computed border-*-radius longhand to a single px number.
 *
 * Computed radii are usually px, but percentages stay percentages
 * (`border-radius: 50%` computes to "50%"), and elliptical radii have
 * two components ("10px 20px"). Percentages resolve against the border
 * box (horizontal → width, vertical → height); since the staircase model
 * uses one radius per corner, the smaller resolved component is used.
 */
function resolveRadius(value: string, size?: ElementSize): number {
  if (!value) return 0;
  const components = value.trim().split(/\s+/).slice(0, 2);

  const resolved = components.map((component, i) => {
    const n = parseFloat(component);
    if (Number.isNaN(n)) return 0;
    if (component.endsWith('%')) {
      if (!size) return n; // no size available — legacy px fallback
      const reference = i === 0 ? size.width : size.height;
      // A single "50%" component applies to both axes — use the smaller
      // reference so the radius fits the element.
      const ref =
        components.length === 1 ? Math.min(size.width, size.height) : reference;
      return (n / 100) * ref;
    }
    return n;
  });

  return Math.max(0, Math.min(...resolved));
}

/**
 * Parse computed CSS styles (from getComputedStyle) into a PixelArtConfig.
 * This bridges arbitrary CSS styling (Tailwind, inline, CSS modules)
 * to the pixel art generation pipeline.
 *
 * @param size - The element's border-box size, used to resolve
 *   percentage border-radius values. When omitted, percentages are
 *   treated as px (legacy behavior).
 */
export function parseComputedStyles(
  computed: CSSStyleDeclaration,
  pixelSize: number,
  size?: ElementSize,
): PixelArtConfig {
  const tlr = resolveRadius(computed.borderTopLeftRadius, size);
  const trr = resolveRadius(computed.borderTopRightRadius, size);
  const brr = resolveRadius(computed.borderBottomRightRadius, size);
  const blr = resolveRadius(computed.borderBottomLeftRadius, size);

  const allSame = tlr === trr && trr === brr && brr === blr;
  const borderRadius = allSame
    ? tlr
    : ([tlr, trr, brr, blr] as [number, number, number, number]);

  // Border width — take top as representative (uniform border assumed)
  const borderWidth = parseFloat(computed.borderTopWidth) || 0;

  // Border color
  const borderColor =
    borderWidth > 0 ? computed.borderTopColor : undefined;

  // Border style — only apply pixel border for solid borders
  const borderStyle = computed.borderTopStyle;
  const hasBorder = borderWidth > 0 && borderStyle !== 'none' && !!borderColor;

  // Background — prefer gradient over solid color
  const bgImage = computed.backgroundImage;
  const bgColor = computed.backgroundColor;

  let backgroundColor: string | undefined;
  if (bgImage && bgImage !== 'none') {
    // Gradient found (Tailwind bg-gradient-to-r etc.)
    backgroundColor = bgImage;
  } else if (bgColor && bgColor !== 'rgba(0, 0, 0, 0)') {
    backgroundColor = bgColor;
  }

  // Box shadow → pixel shadow
  const shadow = parseBoxShadow(computed.boxShadow);

  return {
    pixelSize,
    borderRadius: borderRadius === 0 ? undefined : borderRadius,
    borderWidth: hasBorder ? borderWidth : undefined,
    borderColor: hasBorder ? borderColor : undefined,
    backgroundColor,
    shadow: shadow ?? undefined,
  };
}

import type { PixelArtConfig } from './types';
import { parseBoxShadow } from './utils/box-shadow-parser';

/**
 * Parse computed CSS styles (from getComputedStyle) into a PixelArtConfig.
 * This bridges arbitrary CSS styling (Tailwind, inline, CSS modules)
 * to the pixel art generation pipeline.
 */
export function parseComputedStyles(
  computed: CSSStyleDeclaration,
  pixelSize: number,
): PixelArtConfig {
  // Border radius — computed values are always in px
  const tlr = parseFloat(computed.borderTopLeftRadius) || 0;
  const trr = parseFloat(computed.borderTopRightRadius) || 0;
  const brr = parseFloat(computed.borderBottomRightRadius) || 0;
  const blr = parseFloat(computed.borderBottomLeftRadius) || 0;

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

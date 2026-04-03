import { parseGradient } from '../utils/gradient-parser';
import { colorToCSS, sampleGradient } from '../utils/color';

/**
 * Convert a CSS gradient string into a stepped (pixelated) version
 * with hard color stops that create discrete color bands.
 *
 * Each band is approximately pixelSize wide along the gradient axis.
 * The gradient line length is computed from the CSS angle and element dimensions.
 * Adjacent band boundaries overlap by 0.05% to prevent subpixel bleeding.
 *
 * @param cssGradient - CSS gradient string
 * @param pixelSize - Pixel grid size in CSS px
 * @param width - Element width in CSS px
 * @param height - Element height in CSS px
 * @returns Stepped gradient CSS string, or null if parsing fails
 */
export function generateSteppedGradient(
  cssGradient: string,
  pixelSize: number,
  width: number,
  height: number,
): string | null {
  const parsed = parseGradient(cssGradient);
  if (!parsed) return null;

  // Compute CSS gradient line length based on angle and element dimensions.
  // CSS spec: length = abs(W * sin(angle)) + abs(H * cos(angle))
  // CSS angle convention: 0deg = to top, 90deg = to right (clockwise)
  const angleRad = (parsed.angle * Math.PI) / 180;
  const gradientLength =
    parsed.type === 'linear'
      ? Math.abs(width * Math.sin(angleRad)) +
        Math.abs(height * Math.cos(angleRad))
      : Math.max(width, height); // radial: approximate with max dimension

  const numBands = Math.max(2, Math.round(gradientLength / pixelSize));
  const OVERLAP = 0.05; // % overlap to prevent subpixel bleeding

  const bandStops: string[] = [];

  for (let i = 0; i < numBands; i++) {
    const midpoint = (i + 0.5) / numBands;
    const color = sampleGradient(parsed.stops, midpoint);
    const cssColor = colorToCSS(color);

    const bandStart = (i / numBands) * 100;
    const bandEnd = ((i + 1) / numBands) * 100;

    if (i === 0) {
      bandStops.push(`${cssColor} ${bandStart}%`);
      bandStops.push(`${cssColor} ${bandEnd + OVERLAP}%`);
    } else if (i === numBands - 1) {
      bandStops.push(`${cssColor} ${bandStart - OVERLAP}%`);
      bandStops.push(`${cssColor} ${bandEnd}%`);
    } else {
      bandStops.push(`${cssColor} ${bandStart - OVERLAP}%`);
      bandStops.push(`${cssColor} ${bandEnd + OVERLAP}%`);
    }
  }

  if (parsed.type === 'linear') {
    return `linear-gradient(${parsed.angle}deg, ${bandStops.join(', ')})`;
  }

  return `radial-gradient(${bandStops.join(', ')})`;
}

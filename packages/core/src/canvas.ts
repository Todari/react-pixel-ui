import { CSSStyleMap } from './types';

/**
 * Canvas에서 색상을 추출하는 함수들
 */
export function extractColorFromCSS(styles: CSSStyleMap): string {
  // background-color 우선
  if (styles['background-color']) {
    return styles['background-color'];
  }
  
  // background에서 색상 추출
  if (styles.background) {
    const background = styles.background;
    const colorMatch = background.match(/(#[0-9a-fA-F]{3,6}|rgb\([^)]+\)|rgba\([^)]+\))/);
    if (colorMatch) {
      return colorMatch[1];
    }
  }
  
  return '#ffffff'; // 기본값
}

/**
 * Canvas에서 그라디언트를 그리는 함수
 */
export function drawGradient(
  ctx: CanvasRenderingContext2D,
  styles: CSSStyleMap,
  width: number,
  height: number,
  unitPixel: number
): void {
  const background = styles.background || styles['background-image'];
  
  if (!background || !background.includes('gradient')) {
    return;
  }
  
  // linear-gradient 파싱
  const gradientMatch = background.match(/linear-gradient\(([^)]+)\)/);
  if (!gradientMatch) return;
  
  const gradientParams = gradientMatch[1];
  const stops = gradientParams.match(/(#[0-9a-fA-F]{3,6}|rgb\([^)]+\)|rgba\([^)]+\))\s+(\d+%?)/g);
  
  if (!stops || stops.length < 2) return;
  
  const gradient = ctx.createLinearGradient(0, 0, width * unitPixel, height * unitPixel);
  
  stops.forEach((stop, index) => {
    const [color, position] = stop.split(/\s+/);
    const pos = position.includes('%') 
      ? parseInt(position) / 100 
      : index / (stops.length - 1);
    gradient.addColorStop(pos, color);
  });
  
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width * unitPixel, height * unitPixel);
}

/**
 * Canvas에서 border를 그리는 함수
 */
export function drawBorder(
  ctx: CanvasRenderingContext2D,
  styles: CSSStyleMap,
  width: number,
  height: number,
  unitPixel: number
): void {
  const borderWidth = parseInt(styles['border-width'] || styles.border || '0');
  const borderColor = styles['border-color'] || '#000000';
  const borderStyle = styles['border-style'] || 'solid';
  
  if (borderWidth <= 0) return;
  
  ctx.strokeStyle = borderColor;
  ctx.lineWidth = borderWidth * unitPixel;
  
  if (borderStyle === 'solid') {
    ctx.strokeRect(
      borderWidth * unitPixel / 2,
      borderWidth * unitPixel / 2,
      (width - borderWidth) * unitPixel,
      (height - borderWidth) * unitPixel
    );
  }
} 
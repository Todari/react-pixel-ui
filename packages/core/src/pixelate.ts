import { PixelOptions, PixelatedStyle } from './types';
import { parseCSS } from './css-parser';
import { extractColorFromCSS, drawGradient, drawBorder } from './canvas';

/**
 * CSS를 pixel화하여 Canvas 이미지로 변환
 */
export function pixelateCSS(
  cssString: string,
  width: number = 100,
  height: number = 100,
  options: PixelOptions = {}
): PixelatedStyle {
  const {
    unitPixel = 4,
    quality = 'medium',
    smooth = false
  } = options;

  // CSS 파싱
  const styles = parseCSS(cssString);
  
  // Canvas 생성
  const canvas = document.createElement('canvas');
  const pixelWidth = Math.ceil(width / unitPixel);
  const pixelHeight = Math.ceil(height / unitPixel);
  
  canvas.width = pixelWidth;
  canvas.height = pixelHeight;
  
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Canvas 2D context를 초기화할 수 없습니다');
  }
  
  // 이미지 스무딩 설정
  ctx.imageSmoothingEnabled = smooth;
  ctx.imageSmoothingQuality = quality;
  
  // 배경색 그리기
  const backgroundColor = extractColorFromCSS(styles);
  ctx.fillStyle = backgroundColor;
  ctx.fillRect(0, 0, pixelWidth, pixelHeight);
  
  // 그라디언트 그리기
  drawGradient(ctx, styles, width, height, unitPixel);
  
  // border 그리기
  drawBorder(ctx, styles, width, height, unitPixel);
  
  // Canvas를 data URL로 변환
  const dataURL = canvas.toDataURL('image/png');
  
  return {
    backgroundImage: `url(${dataURL})`,
    backgroundSize: '100% 100%',
    imageRendering: smooth ? 'auto' : 'pixelated',
    position: 'relative',
    zIndex: '1',
    pointerEvents: 'none'
  };
}

/**
 * CSS 스타일 객체를 문자열로 변환
 */
export function styleObjectToString(styles: Record<string, string>): string {
  return Object.entries(styles)
    .map(([key, value]) => `${key}: ${value}`)
    .join('; ');
}

/**
 * CSS 문자열을 pixel화된 스타일 객체로 변환
 */
export function createPixelatedStyle(
  cssString: string,
  options: PixelOptions = {}
): Record<string, string> {
  const pixelatedStyle = pixelateCSS(cssString, 100, 100, options);
  
  // 원본 CSS와 pixel화된 스타일을 결합
  const originalStyles = parseCSS(cssString);
  const combinedStyles = {
    ...originalStyles,
    ...pixelatedStyle
  };
  
  return combinedStyles;
} 
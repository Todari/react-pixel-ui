/**
 * 배경 요소만 픽셀화하는 전용 렌더러
 * 텍스트는 제외하고 배경, 테두리, 그라디언트만 처리
 */

import { PixelColor, PixelGradient, PixelUnit } from './types';

export interface BackgroundStyle {
  backgroundColor?: PixelColor;
  backgroundImage?: PixelGradient;
  border?: {
    width: PixelUnit;
    color: PixelColor;
    style: 'solid' | 'dashed' | 'dotted';
  };
  borderRadius?: PixelUnit;
  boxShadow?: {
    offsetX: PixelUnit;
    offsetY: PixelUnit;
    blurRadius: PixelUnit;
    color: PixelColor;
  };
}

export interface BackgroundRenderOptions {
  width: number;
  height: number;
  pixelSize: number; // 픽셀화 정도 (1 = 원본, 4 = 4배 축소 후 확대)
}

/**
 * PixelUnit을 실제 픽셀 값으로 변환
 */
function unitToPixels(unit: PixelUnit, containerSize: number): number {
  switch (unit.unit) {
    case 'px':
      return unit.value;
    case '%':
      return (unit.value / 100) * containerSize;
    case 'em':
      return unit.value * 16; // 기본 폰트 크기
    case 'rem':
      return unit.value * 16;
    case 'vw':
      return (unit.value / 100) * window.innerWidth;
    case 'vh':
      return (unit.value / 100) * window.innerHeight;
    default:
      return unit.value;
  }
}

/**
 * 배경 요소들을 저화질 Canvas에 렌더링
 */
function renderBackgroundToLowRes(
  style: BackgroundStyle, 
  options: BackgroundRenderOptions
): HTMLCanvasElement {
  const { width, height, pixelSize } = options;

  // 저화질 Canvas 생성 (픽셀 크기만큼 축소)
  const lowResWidth = Math.ceil(width / pixelSize);
  const lowResHeight = Math.ceil(height / pixelSize);

  // 브라우저 환경 체크
  if (typeof document === 'undefined') {
    throw new Error('픽셀화는 브라우저 환경에서만 사용할 수 있습니다.');
  }

  const canvas = document.createElement('canvas');
  canvas.width = lowResWidth;
  canvas.height = lowResHeight;

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Canvas 2D 컨텍스트를 생성할 수 없습니다.');
  }
  
  ctx.imageSmoothingEnabled = false;
  
  // 둥근 모서리가 있는 경우 먼저 클리핑 패스 설정
  if (style.borderRadius) {
    const radius = unitToPixels(style.borderRadius, Math.min(width, height)) / pixelSize;
    
    // 픽셀 크기가 1일 때는 원본 radius 유지
    const adjustedRadius = pixelSize === 1 ? 
      unitToPixels(style.borderRadius, Math.min(width, height)) :
      radius;
      
    createRoundedPath(ctx, lowResWidth, lowResHeight, adjustedRadius);
    ctx.clip();
  }
  
  // 배경색 렌더링
  if (style.backgroundColor) {
    const { r, g, b, a } = style.backgroundColor;
    ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${a / 255})`;
    ctx.fillRect(0, 0, lowResWidth, lowResHeight);
  }
  
  // 배경 그라디언트 렌더링
  if (style.backgroundImage) {
    renderGradientLowRes(ctx, style.backgroundImage, lowResWidth, lowResHeight);
  }
  
  // 테두리 렌더링 (둥근 모서리 고려)
  if (style.border && style.border.width.value > 0) {
    renderBorderLowRes(ctx, style.border, lowResWidth, lowResHeight, width, height, style.borderRadius);
  }
  
  return canvas;
}

/**
 * 저화질 Canvas에 그라디언트 렌더링
 */
function renderGradientLowRes(
  ctx: CanvasRenderingContext2D,
  gradient: PixelGradient,
  width: number,
  height: number
): void {
  if (gradient.type === 'linear') {
    // CSS linear-gradient 각도를 Canvas 각도로 변환
    // CSS: 0deg = 위쪽, 90deg = 오른쪽 (시계방향)
    // Canvas: 0deg = 오른쪽, 90deg = 위쪽 (수학적 각도)
    const cssAngle = gradient.angle || 0;
    const canvasAngle = (90 - cssAngle) * Math.PI / 180;
    
    // 그라디언트 방향 계산 (대각선 길이 사용)
    const diagonal = Math.sqrt(width * width + height * height);
    const x1 = width / 2 - (Math.cos(canvasAngle) * diagonal) / 2;
    const y1 = height / 2 - (Math.sin(canvasAngle) * diagonal) / 2;
    const x2 = width / 2 + (Math.cos(canvasAngle) * diagonal) / 2;
    const y2 = height / 2 + (Math.sin(canvasAngle) * diagonal) / 2;
    
    const canvasGradient = ctx.createLinearGradient(x1, y1, x2, y2);
    
    // 색상 정지점 추가
    gradient.stops.forEach(stop => {
      const { r, g, b, a } = stop.color;
      canvasGradient.addColorStop(stop.position, `rgba(${r}, ${g}, ${b}, ${a / 255})`);
    });
    
    ctx.fillStyle = canvasGradient;
    ctx.fillRect(0, 0, width, height);
  }
}

/**
 * 둥근 사각형 패스 생성
 */
function createRoundedPath(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  radius: number
): void {
  ctx.beginPath();
  ctx.moveTo(radius, 0);
  ctx.lineTo(width - radius, 0);
  ctx.quadraticCurveTo(width, 0, width, radius);
  ctx.lineTo(width, height - radius);
  ctx.quadraticCurveTo(width, height, width - radius, height);
  ctx.lineTo(radius, height);
  ctx.quadraticCurveTo(0, height, 0, height - radius);
  ctx.lineTo(0, radius);
  ctx.quadraticCurveTo(0, 0, radius, 0);
  ctx.closePath();
}

/**
 * 저화질 Canvas에 테두리 렌더링
 */
function renderBorderLowRes(
  ctx: CanvasRenderingContext2D,
  border: NonNullable<BackgroundStyle['border']>,
  lowResWidth: number,
  lowResHeight: number,
  originalWidth: number,
  originalHeight: number,
  borderRadius?: BackgroundStyle['borderRadius']
): void {
  const borderWidth = unitToPixels(border.width, Math.min(originalWidth, originalHeight));
  const pixelSize = originalWidth / lowResWidth;
  
  // 정확한 비율 유지를 위한 border 크기 계산
  let scaledBorderWidth = borderWidth / pixelSize;
  
  // 픽셀 크기가 1일 때는 원본과 동일하게 유지
  if (pixelSize === 1) {
    scaledBorderWidth = borderWidth;
  } else {
    // 픽셀화 시에도 비율을 최대한 유지
    scaledBorderWidth = Math.max(0.5, scaledBorderWidth);
  }
  
  const { r, g, b, a } = border.color;
  ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${a / 255})`;
  ctx.lineWidth = scaledBorderWidth;
  
  // 테두리 스타일에 따른 렌더링
  if (border.style === 'dashed') {
    ctx.setLineDash([scaledBorderWidth * 2, scaledBorderWidth]);
  } else if (border.style === 'dotted') {
    ctx.setLineDash([scaledBorderWidth, scaledBorderWidth]);
  } else {
    ctx.setLineDash([]);
  }

  
  // border 두께를 2배로 늘려서 CSS border와 비슷하게 만들기
  const adjustedBorderWidth = scaledBorderWidth * 2;
  ctx.lineWidth = adjustedBorderWidth;
  
  if (borderRadius) {
    const radius = unitToPixels(borderRadius, Math.min(originalWidth, originalHeight)) / pixelSize;
    const adjustedRadius = pixelSize === 1 ? 
      unitToPixels(borderRadius, Math.min(originalWidth, originalHeight)) :
      Math.max(0, radius - adjustedBorderWidth / 2);
    
    ctx.save();
    createRoundedPath(ctx, lowResWidth, lowResHeight, adjustedRadius);
    ctx.stroke();
    ctx.restore();
  } else {
    const halfBorder = adjustedBorderWidth / 2;
    ctx.strokeRect(halfBorder, halfBorder, lowResWidth - adjustedBorderWidth, lowResHeight - adjustedBorderWidth);
  }
}



/**
 * 저화질 Canvas를 고화질로 확대하여 픽셀화 효과 생성
 */
function upscaleToPixelated(
  lowResCanvas: HTMLCanvasElement,
  targetWidth: number,
  targetHeight: number
): HTMLCanvasElement {
  const highResCanvas = document.createElement('canvas');
  highResCanvas.width = targetWidth;
  highResCanvas.height = targetHeight;
  
  const ctx = highResCanvas.getContext('2d');
  if (!ctx) {
    throw new Error('Canvas 2D 컨텍스트를 생성할 수 없습니다.');
  }
  
  // 픽셀화 효과를 위해 이미지 스무딩 비활성화
  ctx.imageSmoothingEnabled = false;
  
  // 저화질 이미지를 고화질 크기로 확대
  ctx.drawImage(lowResCanvas, 0, 0, targetWidth, targetHeight);
  
  return highResCanvas;
}

/**
 * 배경 스타일을 픽셀화된 데이터 URL로 변환
 */
export function renderPixelatedBackground(
  style: BackgroundStyle,
  options: BackgroundRenderOptions
): string {
  // 1. 저화질 Canvas에 배경 렌더링
  const lowResCanvas = renderBackgroundToLowRes(style, options);
  
  // 2. 고화질로 확대하여 픽셀화 효과 생성
  const pixelatedCanvas = upscaleToPixelated(lowResCanvas, options.width, options.height);
  
  // 3. 데이터 URL로 변환
  return pixelatedCanvas.toDataURL();
}

/**
 * 간편한 팩토리 함수
 */
export function createPixelatedBackgroundURL(
  backgroundColor?: string,
  backgroundImage?: string,
  borderRadius?: string,
  border?: string,
  width: number = 200,
  height: number = 100,
  pixelSize: number = 4
): string {
  // CSS 문자열을 BackgroundStyle로 변환하는 간단한 파서
  const style: BackgroundStyle = {};
  
  if (backgroundColor) {
    style.backgroundColor = parseColorString(backgroundColor);
  }
  
  if (backgroundImage && backgroundImage.includes('gradient')) {
    style.backgroundImage = parseGradientString(backgroundImage);
  }
  
  if (borderRadius) {
    style.borderRadius = { value: parseFloat(borderRadius), unit: 'px' };
  }
  
  if (border) {
    // 간단한 border 파싱 (예: "2px solid #333")
    const parts = border.split(' ');
    if (parts.length >= 3) {
      style.border = {
        width: { value: parseFloat(parts[0]), unit: 'px' },
        style: parts[1] as 'solid',
        color: parseColorString(parts[2])
      };
    }
  }
  
  return renderPixelatedBackground(style, { width, height, pixelSize });
}

// 간단한 색상 파서
function parseColorString(color: string): PixelColor {
  if (color.startsWith('#')) {
    const hex = color.slice(1);
    if (hex.length === 3) {
      return {
        r: parseInt(hex[0] + hex[0], 16),
        g: parseInt(hex[1] + hex[1], 16),
        b: parseInt(hex[2] + hex[2], 16),
        a: 255
      };
    } else if (hex.length === 6) {
      return {
        r: parseInt(hex.slice(0, 2), 16),
        g: parseInt(hex.slice(2, 4), 16),
        b: parseInt(hex.slice(4, 6), 16),
        a: 255
      };
    }
  }
  
  // 기본값
  return { r: 0, g: 0, b: 0, a: 255 };
}

// 간단한 그라디언트 파서
function parseGradientString(gradient: string): PixelGradient | undefined {
  const linearMatch = gradient.match(/linear-gradient\(([^)]+)\)/);
  if (!linearMatch) return undefined;
  
  const parts = linearMatch[1].split(',').map(s => s.trim());
  let angle = 45; // 기본 각도
  let colorStart = 0;
  
  // 각도 파싱
  if (parts[0].includes('deg')) {
    angle = parseFloat(parts[0]);
    colorStart = 1;
  }
  
  // 색상 정지점 파싱
  const stops = parts.slice(colorStart).map((colorStr, index) => {
    const color = parseColorString(colorStr.trim());
    const position = index / (parts.length - colorStart - 1);
    return { color, position };
  });
  
  return {
    type: 'linear',
    angle,
    stops
  };
}
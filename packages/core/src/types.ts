/**
 * 픽셀 렌더링 엔진의 핵심 타입 정의
 */

// CSS 속성을 픽셀 단위로 해석하기 위한 기본 타입들
export interface PixelUnit {
  value: number;
  unit: 'px' | '%' | 'em' | 'rem' | 'vw' | 'vh';
}

export interface PixelColor {
  r: number;
  g: number;
  b: number;
  a: number;
}

export interface PixelGradient {
  type: 'linear' | 'radial';
  angle?: number; // degrees for linear
  stops: Array<{
    color: PixelColor;
    position: number; // 0-1
  }>;
}

// 픽셀 렌더링을 위한 CSS 스타일 정의
export interface PixelStyle {
  // 박스 모델
  width?: PixelUnit;
  height?: PixelUnit;
  padding?: {
    top: PixelUnit;
    right: PixelUnit;
    bottom: PixelUnit;
    left: PixelUnit;
  };
  margin?: {
    top: PixelUnit;
    right: PixelUnit;
    bottom: PixelUnit;
    left: PixelUnit;
  };
  
  // 배경
  backgroundColor?: PixelColor;
  backgroundImage?: PixelGradient;
  
  // 테두리
  border?: {
    width: PixelUnit;
    color: PixelColor;
    style: 'solid' | 'dashed' | 'dotted';
  };
  borderRadius?: PixelUnit;
  
  // 텍스트
  color?: PixelColor;
  fontSize?: PixelUnit;
  fontFamily?: string;
  fontWeight?: number | 'normal' | 'bold';
  textAlign?: 'left' | 'center' | 'right';
  lineHeight?: number;
  
  // 그림자
  boxShadow?: {
    offsetX: PixelUnit;
    offsetY: PixelUnit;
    blurRadius: PixelUnit;
    color: PixelColor;
  };
  textShadow?: {
    offsetX: PixelUnit;
    offsetY: PixelUnit;
    blurRadius: PixelUnit;
    color: PixelColor;
  };
}

// 픽셀 렌더링 옵션
export interface PixelRenderOptions {
  pixelSize: number; // 픽셀 크기 (1 = 실제 픽셀, 2 = 2x2 픽셀 블록)
  antialiasing: boolean; // 안티앨리어싱 여부
  dithering: boolean; // 디더링 여부
  colorDepth: number; // 색상 깊이 (8, 16, 24, 32)
}

// 렌더링할 요소 정의
export interface PixelElement {
  type: 'div' | 'span' | 'text';
  style: PixelStyle;
  content?: string; // 텍스트 콘텐츠
  children?: PixelElement[];
  x: number; // 픽셀 좌표
  y: number; // 픽셀 좌표
  width: number; // 계산된 픽셀 너비
  height: number; // 계산된 픽셀 높이
}

// 렌더링 컨텍스트
export interface PixelRenderContext {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  imageData: ImageData;
  pixels: Uint8ClampedArray;
  width: number;
  height: number;
  options: PixelRenderOptions;
}
/**
 * 간단한 픽셀화 엔진 - 배경만 픽셀화하고 텍스트는 원본 유지
 */

import { parseCSS, cssPropertiesToPixelStyle } from './css-parser';
import { renderPixelatedBackground, BackgroundStyle } from './background-renderer';
import { PixelStyle } from './types';

export interface SimplePixelOptions {
  width: number;
  height: number;
  pixelSize: number;
}

export interface PixelizedResult {
  backgroundImage: string; // 픽셀화된 배경의 데이터 URL
  textStyle: any; // 텍스트 관련 스타일
  containerStyle: any; // 전체 컨테이너 스타일
}

/**
 * PixelStyle을 BackgroundStyle과 텍스트 스타일로 분리
 */
function separateStyles(pixelStyle: PixelStyle): {
  backgroundStyle: BackgroundStyle;
  textStyle: any;
} {
  const backgroundStyle: BackgroundStyle = {
    backgroundColor: pixelStyle.backgroundColor,
    backgroundImage: pixelStyle.backgroundImage,
    border: pixelStyle.border,
    borderRadius: pixelStyle.borderRadius,
    boxShadow: pixelStyle.boxShadow
  };

  const textStyle: any = {
    color: pixelStyle.color ? 
      `rgba(${pixelStyle.color.r}, ${pixelStyle.color.g}, ${pixelStyle.color.b}, ${pixelStyle.color.a / 255})` : 
      undefined,
    fontSize: pixelStyle.fontSize ? 
      `${pixelStyle.fontSize.value}${pixelStyle.fontSize.unit}` : 
      undefined,
    fontFamily: pixelStyle.fontFamily,
    fontWeight: pixelStyle.fontWeight,
    textAlign: pixelStyle.textAlign,
    lineHeight: pixelStyle.lineHeight
  };

  return { backgroundStyle, textStyle };
}

/**
 * CSS 문자열을 픽셀화된 결과로 변환
 */
export function pixelizeCSS(
  cssString: string,
  options: SimplePixelOptions
): PixelizedResult {
  // CSS 파싱
  const pixelStyle = parseCSS(cssString);
  
  // 배경 스타일과 텍스트 스타일 분리
  const { backgroundStyle, textStyle } = separateStyles(pixelStyle);
  
  // 배경만 픽셀화
  const backgroundImage = renderPixelatedBackground(backgroundStyle, options);
  
  // 컨테이너 스타일 생성
  const containerStyle: any = {
    width: options.width,
    height: options.height,
    backgroundImage: `url(${backgroundImage})`,
    backgroundSize: 'cover',
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'center',
    imageRendering: 'pixelated', // 브라우저 픽셀화 힌트
    display: 'flex',
    alignItems: 'center',
    justifyContent: textStyle.textAlign === 'center' ? 'center' : 
                   textStyle.textAlign === 'right' ? 'flex-end' : 'flex-start',
    padding: pixelStyle.padding ? 
      `${pixelStyle.padding.top.value}${pixelStyle.padding.top.unit} ${pixelStyle.padding.right.value}${pixelStyle.padding.right.unit} ${pixelStyle.padding.bottom.value}${pixelStyle.padding.bottom.unit} ${pixelStyle.padding.left.value}${pixelStyle.padding.left.unit}` : 
      undefined
  };
  
  return {
    backgroundImage,
    textStyle,
    containerStyle
  };
}

/**
 * React CSSProperties를 픽셀화된 결과로 변환
 */
export function pixelizeCSSProperties(
  cssProps: any,
  options: SimplePixelOptions
): PixelizedResult {
  // CSS Properties를 PixelStyle로 변환
  const pixelStyle = cssPropertiesToPixelStyle(cssProps);
  
  // 배경 스타일과 텍스트 스타일 분리
  const { backgroundStyle, textStyle } = separateStyles(pixelStyle);
  
  // 배경만 픽셀화
  const backgroundImage = renderPixelatedBackground(backgroundStyle, options);
  
  // 컨테이너 스타일 생성
  const containerStyle: any = {
    width: options.width,
    height: options.height,
    backgroundImage: `url(${backgroundImage})`,
    backgroundSize: 'cover',
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'center',
    imageRendering: 'pixelated',
    display: 'flex',
    alignItems: 'center',
    justifyContent: textStyle.textAlign === 'center' ? 'center' : 
                   textStyle.textAlign === 'right' ? 'flex-end' : 'flex-start',
    padding: cssProps.padding
  };
  
  return {
    backgroundImage,
    textStyle,
    containerStyle
  };
}

/**
 * 간편한 픽셀화 함수 - CSS 문자열 직접 사용
 */
export function createPixelizedStyle(
  css: string,
  width: number = 200,
  height: number = 100,
  pixelSize: number = 4
): any {
  const result = pixelizeCSS(css, { width, height, pixelSize });
  
  // 컨테이너 스타일과 텍스트 스타일을 합침
  return {
    ...result.containerStyle,
    ...result.textStyle
  };
}
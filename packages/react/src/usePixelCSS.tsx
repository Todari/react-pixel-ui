/**
 * CSS를 픽셀화하는 React 훅 - 배경만 픽셀화하고 텍스트는 선명하게 유지
 */

import { useMemo } from 'react';
import { pixelizeCSS, pixelizeCSSProperties, SimplePixelOptions } from '@react-pixel-ui/core';

export interface UsePixelCSSOptions extends Partial<SimplePixelOptions> {
  // 추가 옵션들
}

/**
 * CSS 문자열을 픽셀화하는 훅
 */
export function usePixelCSS(
  css: string,
  options: UsePixelCSSOptions = {}
): {
  backgroundImage: string;
  textStyle: React.CSSProperties;
  containerStyle: React.CSSProperties;
  pixelStyle: React.CSSProperties; // 호환성을 위한 통합 스타일
} {
  // 기본 옵션
  const pixelOptions: SimplePixelOptions = useMemo(() => ({
    width: 200,
    height: 100,
    pixelSize: 4,
    ...options
  }), [options]);

  // 픽셀화 처리
  const result = useMemo(() => {
    try {
      const pixelized = pixelizeCSS(css, pixelOptions);
      
      // 호환성을 위한 통합 스타일
      const pixelStyle: React.CSSProperties = {
        ...pixelized.containerStyle,
        ...pixelized.textStyle
      };

      return {
        backgroundImage: pixelized.backgroundImage,
        textStyle: pixelized.textStyle,
        containerStyle: pixelized.containerStyle,
        pixelStyle
      };
    } catch (error) {
      console.error('픽셀 CSS 렌더링 오류:', error);
      return {
        backgroundImage: '',
        textStyle: {},
        containerStyle: {},
        pixelStyle: {}
      };
    }
  }, [css, pixelOptions]);

  return result;
}

/**
 * React CSSProperties를 픽셀화하는 훅
 */
export function usePixelCSSProperties(
  cssProps: React.CSSProperties,
  options: UsePixelCSSOptions = {}
): {
  backgroundImage: string;
  textStyle: React.CSSProperties;
  containerStyle: React.CSSProperties;
  pixelStyle: React.CSSProperties; // 호환성을 위한 통합 스타일
} {
  // 기본 옵션
  const pixelOptions: SimplePixelOptions = useMemo(() => ({
    width: 200,
    height: 100,
    pixelSize: 4,
    ...options
  }), [options]);

  // 픽셀화 처리
  const result = useMemo(() => {
    try {
      const pixelized = pixelizeCSSProperties(cssProps, pixelOptions);
      
      // 호환성을 위한 통합 스타일
      const pixelStyle: React.CSSProperties = {
        ...pixelized.containerStyle,
        ...pixelized.textStyle
      };

      return {
        backgroundImage: pixelized.backgroundImage,
        textStyle: pixelized.textStyle,
        containerStyle: pixelized.containerStyle,
        pixelStyle
      };
    } catch (error) {
      console.error('픽셀 CSS Properties 렌더링 오류:', error);
      return {
        backgroundImage: '',
        textStyle: {},
        containerStyle: {},
        pixelStyle: {}
      };
    }
  }, [cssProps, pixelOptions]);

  return result;
}
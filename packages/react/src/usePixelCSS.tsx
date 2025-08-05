/**
 * 간단한 픽셀 CSS 훅 - 가장 일반적인 사용 사례를 위한 단순화된 API
 */

import { useMemo } from 'react';
import { pixelizeCSS, PixelOptions } from '@react-pixel-ui/core';

export interface PixelCSSOptions {
  /** 픽셀 크기 (기본값: 4) */
  pixelSize?: number;
  /** 컨테이너 너비 (기본값: 자동 감지 또는 300) */
  width?: number;
  /** 컨테이너 높이 (기본값: 자동 감지 또는 150) */
  height?: number;
}

/**
 * 픽셀 CSS 훅 - 이전 API와 호환성 유지
 */
export function usePixelCSS(
  css: string,
  options: PixelCSSOptions = {}
): {
  backgroundImage: string;
  textStyle: React.CSSProperties;
  containerStyle: React.CSSProperties;
  pixelStyle: React.CSSProperties;
} {
  const pixelOptions: PixelOptions = useMemo(() => ({
    width: options.width || 300,
    height: options.height || 150,
    pixelSize: options.pixelSize || 4,
  }), [options.width, options.height, options.pixelSize]);

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
 * 프리셋을 사용한 픽셀 CSS 훅
 */
export function usePixelPreset(
  preset: 'button' | 'card' | 'badge',
  customCSS?: string,
  options: PixelCSSOptions = {}
): React.CSSProperties {
  const presetCSS = useMemo(() => {
    const presets = {
      button: `
        background: linear-gradient(45deg, #667eea, #764ba2);
        border: 2px solid #333;
        border-radius: 8px;
        padding: 12px 24px;
        color: white;
        font-weight: bold;
        cursor: pointer;
      `,
      card: `
        background: white;
        border: 1px solid #e1e5e9;
        border-radius: 12px;
        padding: 20px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      `,
      badge: `
        background: #ff6b6b;
        border-radius: 20px;
        padding: 4px 12px;
        color: white;
        font-size: 12px;
        font-weight: bold;
      `
    };

    return presets[preset] + (customCSS ? `\n${customCSS}` : '');
  }, [preset, customCSS]);

  return usePixelCSS(presetCSS, options);
}
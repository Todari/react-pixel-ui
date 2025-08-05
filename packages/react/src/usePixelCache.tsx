/**
 * 픽셀 CSS 캐싱 시스템
 */

import { useMemo, useRef } from 'react';
import { pixelizeCSS, PixelOptions } from '@react-pixel-ui/core';

// 전역 캐시
const pixelCache = new Map<string, string>();

/**
 * 캐시 키 생성
 */
function createCacheKey(css: string, options: PixelOptions): string {
  return `${css}|${options.width}x${options.height}@${options.pixelSize}px`;
}

/**
 * 캐시된 픽셀 CSS 훅
 */
export function useCachedPixelCSS(
  css: string,
  options: PixelOptions
): React.CSSProperties {
  const cacheKey = useMemo(() => createCacheKey(css, options), [css, options]);
  
  const style = useMemo(() => {
    try {
      // 캐시에서 확인
      const cached = pixelCache.get(cacheKey);
      if (cached) {
        return {
          backgroundImage: `url(${cached})`,
          backgroundSize: 'cover',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center',
          imageRendering: 'pixelated' as const,
          width: options.width,
          height: options.height,
        };
      }

      // 새로 생성
      const pixelized = pixelizeCSS(css, options);
      
      // 캐시에 저장
      pixelCache.set(cacheKey, pixelized.backgroundImage);
      
      return {
        ...pixelized.containerStyle,
        ...pixelized.textStyle
      };
    } catch (error) {
      console.error('캐시된 픽셀 CSS 렌더링 오류:', error);
      return {};
    }
  }, [css, options, cacheKey]);

  return style;
}

/**
 * 캐시 관리 훅
 */
export function usePixelCacheManager() {
  const cacheSize = useRef(0);
  
  const clearCache = () => {
    pixelCache.clear();
    cacheSize.current = 0;
  };
  
  const getCacheInfo = () => ({
    size: pixelCache.size,
    keys: Array.from(pixelCache.keys())
  });
  
  const removeCacheEntry = (key: string) => {
    return pixelCache.delete(key);
  };

  return {
    clearCache,
    getCacheInfo,
    removeCacheEntry
  };
}
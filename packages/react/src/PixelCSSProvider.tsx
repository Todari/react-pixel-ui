import { createContext, useContext, ReactNode } from 'react';
import { PixelOptions } from '@react-pixel-ui/core';

interface PixelCSSContextValue {
  defaultOptions: PixelOptions;
}

const PixelCSSContext = createContext<PixelCSSContextValue | undefined>(undefined);

interface PixelCSSProviderProps {
  children: ReactNode;
  defaultOptions?: PixelOptions;
}

/**
 * PixelCSS의 기본 옵션을 제공하는 컨텍스트 제공자
 */
export function PixelCSSProvider({ 
  children, 
  defaultOptions = { unitPixel: 4, quality: 'medium', smooth: false } 
}: PixelCSSProviderProps) {
  return (
    <PixelCSSContext.Provider value={{ defaultOptions }}>
      {children}
    </PixelCSSContext.Provider>
  );
}

/**
 * PixelCSS 컨텍스트를 사용하는 훅
 */
export function usePixelCSSContext(): PixelCSSContextValue {
  const context = useContext(PixelCSSContext);
  if (!context) {
    throw new Error('usePixelCSSContext는 PixelCSSProvider 내에서 사용되어야 합니다');
  }
  return context;
} 
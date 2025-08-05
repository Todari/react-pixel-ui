import { useEffect, useState, useRef, useCallback } from 'react';
import { 
  createDOMPixelate, 
  PixelOptions, 
  PixelatedStyle,
  PixelateInstance,
  parseCSS 
} from '@react-pixel-ui/core';

/**
 * DOM 요소를 실시간으로 pixel화하는 React 훅
 * 
 * @param css CSS 문자열
 * @param options pixel화 옵션
 * @returns [pixelatedStyle, elementRef] 튜플
 * 
 * @example
 * ```tsx
 * function MyComponent() {
 *   const [pixelCSS, ref] = usePixelCSS(`
 *     background: linear-gradient(45deg, #ff0000, #00ff00);
 *     border: 2px solid #000;
 *     border-radius: 8px;
 *     padding: 16px;
 *   `);
 *   
 *   return <div ref={ref} style={pixelCSS}>Pixelated Content</div>;
 * }
 * ```
 */
export function usePixelCSS(
  css: string,
  options: PixelOptions = {}
): [React.CSSProperties, React.RefCallback<HTMLElement>] {
  const [pixelatedStyle, setPixelatedStyle] = useState<React.CSSProperties>({});
  const [originalStyle, setOriginalStyle] = useState<React.CSSProperties>({});
  const pixelateInstanceRef = useRef<PixelateInstance | null>(null);
  const elementRef = useRef<HTMLElement | null>(null);

  // CSS 파싱 및 원본 스타일 설정
  useEffect(() => {
    const parsedCSS = parseCSS(css);
    setOriginalStyle(parsedCSS);
  }, [css]);

  // 픽셀화 인스턴스 생성 및 관리
  const setupPixelate = useCallback((element: HTMLElement) => {
    // 기존 인스턴스 정리
    if (pixelateInstanceRef.current) {
      pixelateInstanceRef.current.destroy();
    }

    // 새 인스턴스 생성
    pixelateInstanceRef.current = createDOMPixelate({
      element,
      css,
      ...options,
      onUpdate: (style: PixelatedStyle) => {
        setPixelatedStyle(style as any);
      },
      onError: (error: Error) => {
        console.error('픽셀화 오류:', error);
        // 오류 발생 시 원본 스타일만 사용
        setPixelatedStyle({});
      },
    });
  }, [css, options]);

  // ref 콜백 함수
  const refCallback = useCallback((element: HTMLElement | null) => {
    elementRef.current = element;
    
    if (element) {
      setupPixelate(element);
    } else {
      // 요소가 제거될 때 정리
      if (pixelateInstanceRef.current) {
        pixelateInstanceRef.current.destroy();
        pixelateInstanceRef.current = null;
      }
    }
  }, [setupPixelate]);

  // 옵션이나 CSS가 변경될 때 업데이트
  useEffect(() => {
    if (pixelateInstanceRef.current && elementRef.current) {
      pixelateInstanceRef.current.updateOptions({
        element: elementRef.current,
        css,
        ...options,
      });
    }
  }, [css, options]);

  // 컴포넌트 언마운트 시 정리
  useEffect(() => {
    return () => {
      if (pixelateInstanceRef.current) {
        pixelateInstanceRef.current.destroy();
      }
    };
  }, []);

  // 원본 스타일과 픽셀화된 스타일을 합성
  const combinedStyle = {
    ...originalStyle,
    ...pixelatedStyle,
  };

  return [combinedStyle, refCallback];
}

/**
 * 간단한 CSS 픽셀화 훅 (DOM 연결 없이 CSS만 처리)
 * 
 * @deprecated DOM 기반 usePixelCSS 사용을 권장합니다
 */
export function useSimplePixelCSS(
  css: string,
  options: PixelOptions = {}
): React.CSSProperties {
  const [style, setStyle] = useState<React.CSSProperties>({});

  useEffect(() => {
    try {
      const parsedCSS = parseCSS(css);
      // CSS Filter 기반 간단한 픽셀화
      const pixelStyle = {
        ...parsedCSS,
        imageRendering: options.smooth ? 'auto' : 'pixelated',
        filter: options.smooth ? 'none' : 'blur(0.5px) contrast(120%)',
      };
      setStyle(pixelStyle as any);
    } catch (error) {
      console.error('CSS 파싱 오류:', error);
      setStyle({});
    }
  }, [css, options]);

  return style;
} 
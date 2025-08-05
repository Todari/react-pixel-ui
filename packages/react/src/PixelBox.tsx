/**
 * 픽셀화된 컴포넌트 - styled-components와 유사한 사용법
 */

import React, { forwardRef, useMemo } from 'react';
import { usePixelCSS, PixelCSSOptions } from './usePixelCSS';

export interface PixelBoxProps extends React.HTMLAttributes<HTMLDivElement> {
  /** CSS 문자열 */
  css?: string;
  /** 픽셀화 옵션 */
  pixelOptions?: PixelCSSOptions;
  /** 자식 요소 */
  children?: React.ReactNode;
}

/**
 * 픽셀화된 박스 컴포넌트
 * 
 * @example
 * ```tsx
 * <PixelBox 
 *   css={`
 *     background: linear-gradient(45deg, #ff6b6b, #4ecdc4);
 *     border: 2px solid #333;
 *     border-radius: 10px;
 *     padding: 20px;
 *   `}
 *   pixelOptions={{ pixelSize: 6 }}
 * >
 *   픽셀화된 콘텐츠
 * </PixelBox>
 * ```
 */
export const PixelBox = forwardRef<HTMLDivElement, PixelBoxProps>(
  ({ css = '', pixelOptions, children, style, ...props }, ref) => {
    const pixelStyle = usePixelCSS(css, pixelOptions);
    
    const combinedStyle = useMemo(() => ({
      ...pixelStyle,
      ...style
    }), [pixelStyle, style]);

    return (
      <div ref={ref} style={combinedStyle} {...props}>
        {children}
      </div>
    );
  }
);

PixelBox.displayName = 'PixelBox';

/**
 * 프리셋 픽셀 버튼
 */
export interface PixelButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** 픽셀화 옵션 */
  pixelOptions?: PixelCSSOptions;
  /** 버튼 변형 */
  variant?: 'primary' | 'secondary' | 'danger';
}

export const PixelButton = forwardRef<HTMLButtonElement, PixelButtonProps>(
  ({ pixelOptions, variant = 'primary', children, style, ...props }, ref) => {
    const variantCSS = useMemo(() => {
      const variants = {
        primary: `
          background: linear-gradient(45deg, #667eea, #764ba2);
          border: 2px solid #333;
          color: white;
        `,
        secondary: `
          background: linear-gradient(45deg, #f093fb, #f5576c);
          border: 2px solid #333;
          color: white;
        `,
        danger: `
          background: linear-gradient(45deg, #ff6b6b, #ee5a24);
          border: 2px solid #333;
          color: white;
        `
      };

      return variants[variant] + `
        border-radius: 8px;
        padding: 12px 24px;
        font-weight: bold;
        cursor: pointer;
        transition: transform 0.1s;
      `;
    }, [variant]);

    const pixelStyle = usePixelCSS(variantCSS, pixelOptions);
    
    const combinedStyle = useMemo(() => ({
      ...pixelStyle,
      ...style
    }), [pixelStyle, style]);

    return (
      <button ref={ref} style={combinedStyle} {...props}>
        {children}
      </button>
    );
  }
);

PixelButton.displayName = 'PixelButton';
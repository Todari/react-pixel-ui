import React, { forwardRef, useMemo } from 'react';
import type { PixelShadowConfig } from '@react-pixel-ui/core';
import { usePixelArt } from '../hooks/usePixelArt';
import { usePixelConfig } from '../context/PixelConfigProvider';

export type PixelButtonVariant = 'primary' | 'secondary' | 'danger';

const VARIANT_STYLES: Record<
  PixelButtonVariant,
  { background: string; borderColor: string }
> = {
  primary: {
    background: 'linear-gradient(180deg, #667eea, #764ba2)',
    borderColor: '#4a3580',
  },
  secondary: {
    background: 'linear-gradient(180deg, #f093fb, #f5576c)',
    borderColor: '#c04455',
  },
  danger: {
    background: 'linear-gradient(180deg, #ff6b6b, #ee5a24)',
    borderColor: '#b8441a',
  },
};

export interface PixelButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Button style variant */
  variant?: PixelButtonVariant;
  /** Pixel grid size */
  pixelSize?: number;
  /** Button width in CSS px */
  width?: number;
  /** Button height in CSS px */
  height?: number;
  /** Border radius */
  borderRadius?: number;
  /** Hard pixel shadow */
  shadow?: PixelShadowConfig;
}

/**
 * Pre-styled pixel art button with variant support.
 */
export const PixelButton = forwardRef<HTMLButtonElement, PixelButtonProps>(
  function PixelButton(
    {
      variant = 'primary',
      pixelSize: pixelSizeProp,
      width = 160,
      height = 48,
      borderRadius = 8,
      shadow,
      style,
      children,
      ...rest
    },
    ref,
  ) {
    const config = usePixelConfig();
    const pixelSize = pixelSizeProp ?? config.pixelSize;
    const variantStyle = VARIANT_STYLES[variant];

    const { wrapperStyle, contentStyle, needsWrapper } = usePixelArt(
      width,
      height,
      {
        pixelSize,
        borderRadius,
        borderWidth: 2,
        borderColor: variantStyle.borderColor,
        backgroundColor: variantStyle.background,
        shadow: shadow ?? { x: pixelSize, y: pixelSize, color: 'rgba(0,0,0,0.25)' },
      },
    );

    const buttonBaseStyle: React.CSSProperties = useMemo(
      () => ({
        border: 'none',
        cursor: 'pointer',
        color: '#fff',
        fontWeight: 'bold',
        fontSize: '14px',
        fontFamily: 'inherit',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'filter 0.1s ease',
        ...style,
      }),
      [style],
    );

    if (needsWrapper) {
      return (
        <div style={wrapperStyle}>
          <button
            ref={ref}
            style={{ ...contentStyle, ...buttonBaseStyle }}
            {...rest}
          >
            {children}
          </button>
        </div>
      );
    }

    return (
      <button
        ref={ref}
        style={{ ...contentStyle, ...buttonBaseStyle }}
        {...rest}
      >
        {children}
      </button>
    );
  },
);

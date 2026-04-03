import React, { forwardRef } from 'react';
import type { PixelShadowConfig } from '@react-pixel-ui/core';
import { usePixelArt } from '../hooks/usePixelArt';
import { useResponsiveSize } from '../hooks/useResponsiveSize';
import { usePixelConfig } from '../context/PixelConfigProvider';

export interface PixelBoxProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Pixel grid size in CSS px. Falls back to PixelConfigProvider default. */
  pixelSize?: number;
  /** Width in CSS px (required unless responsive is true) */
  width?: number;
  /** Height in CSS px (required unless responsive is true) */
  height?: number;
  /** Border radius — single value or per-corner [tl, tr, br, bl] */
  borderRadius?: number | [number, number, number, number];
  /** Border thickness in CSS px */
  borderWidth?: number;
  /** Border color (any CSS color) */
  borderColor?: string;
  /** Background color or CSS gradient string */
  background?: string;
  /** Hard pixel shadow */
  shadow?: PixelShadowConfig;
  /** Enable responsive mode (auto-detect size via ResizeObserver) */
  responsive?: boolean;
}

/**
 * Generic container with pixel art styling.
 *
 * Renders staircase corners via clip-path, stepped gradients,
 * and hard pixel shadows. When a border is specified, automatically
 * uses a wrapper div for the border effect.
 */
export const PixelBox = forwardRef<HTMLDivElement, PixelBoxProps>(
  function PixelBox(
    {
      pixelSize: pixelSizeProp,
      width: widthProp,
      height: heightProp,
      borderRadius,
      borderWidth,
      borderColor,
      background,
      shadow,
      responsive = false,
      style,
      children,
      ...rest
    },
    ref,
  ) {
    const config = usePixelConfig();
    const pixelSize = pixelSizeProp ?? config.pixelSize;

    // Responsive size detection
    const { ref: sizeRef, size: detectedSize } = useResponsiveSize(
      pixelSize,
      responsive,
    );

    const width = responsive && detectedSize ? detectedSize.width : (widthProp ?? 200);
    const height = responsive && detectedSize ? detectedSize.height : (heightProp ?? 100);

    const {
      wrapperStyle,
      contentStyle,
      needsWrapper,
    } = usePixelArt(width, height, {
      pixelSize,
      borderRadius,
      borderWidth,
      borderColor: borderColor ?? config.borderColor,
      backgroundColor: background,
      shadow,
    });

    // Merge user style with generated content style
    const mergedContentStyle: React.CSSProperties = {
      ...contentStyle,
      ...style,
    };

    if (needsWrapper) {
      return (
        <div
          ref={(node) => {
            // Forward both refs
            if (typeof ref === 'function') ref(node);
            else if (ref) (ref as React.MutableRefObject<HTMLDivElement | null>).current = node;
            if (responsive) (sizeRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
          }}
          style={wrapperStyle}
          {...rest}
        >
          <div style={mergedContentStyle}>
            {children}
          </div>
        </div>
      );
    }

    return (
      <div
        ref={(node) => {
          if (typeof ref === 'function') ref(node);
          else if (ref) (ref as React.MutableRefObject<HTMLDivElement | null>).current = node;
          if (responsive) (sizeRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
        }}
        style={mergedContentStyle}
        {...rest}
      >
        {children}
      </div>
    );
  },
);

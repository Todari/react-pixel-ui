import React, { forwardRef } from 'react';
import type { PixelShadowConfig } from '@react-pixel-ui/core';
import { usePixelArt } from '../hooks/usePixelArt';
import { useResponsiveSize } from '../hooks/useResponsiveSize';
import { usePixelConfig } from '../context/PixelConfigProvider';

export interface PixelBoxProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Pixel grid size in CSS px. Falls back to PixelConfigProvider default. */
  pixelSize?: number;
  /** Width in CSS px (ignored when responsive is true) */
  width?: number;
  /** Height in CSS px (ignored when responsive is true) */
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
  /**
   * Responsive mode: the box follows the size your CSS gives it
   * (className/style — e.g. width: '100%'), detected via ResizeObserver.
   * The component does not pin its own width/height in this mode.
   */
  responsive?: boolean;
}

/** Remove the generated px width/height so user CSS drives the layout */
function stripSize(style: React.CSSProperties): React.CSSProperties {
  const { width: _width, height: _height, ...rest } = style;
  return rest;
}

/**
 * Generic container with pixel art styling.
 *
 * Renders staircase corners via clip-path, stepped gradients,
 * and hard pixel shadows. When a border is specified, automatically
 * uses a wrapper div for the border effect.
 *
 * The user `className`, `style`, and other props always land on the
 * ROOT element (the wrapper when a border is used).
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

    // Responsive size detection — measures the size user CSS produced
    const { ref: sizeRef, size: detectedSize } = useResponsiveSize(
      pixelSize,
      responsive,
    );

    const width = responsive
      ? (detectedSize?.width ?? 0)
      : (widthProp ?? 200);
    const height = responsive
      ? (detectedSize?.height ?? 0)
      : (heightProp ?? 100);
    const hasSize = width > 0 && height > 0;

    const { wrapperStyle, contentStyle, needsWrapper } = usePixelArt(
      width,
      height,
      {
        pixelSize,
        borderRadius,
        borderWidth,
        borderColor: borderColor ?? config.borderColor,
        backgroundColor: background,
        shadow,
      },
    );

    const mergedRef = (node: HTMLDivElement | null) => {
      if (typeof ref === 'function') ref(node);
      else if (ref) {
        (ref as React.MutableRefObject<HTMLDivElement | null>).current = node;
      }
      if (responsive) {
        (sizeRef as React.MutableRefObject<HTMLDivElement | null>).current =
          node;
      }
    };

    // Root style: generated styles + user style (user wins). In responsive
    // mode the generated px width/height are stripped so the box keeps
    // following its container; before the first measurement only the user
    // style is applied.
    const generatedRootStyle = needsWrapper ? wrapperStyle : contentStyle;
    const rootStyle: React.CSSProperties = hasSize
      ? {
          ...(responsive ? stripSize(generatedRootStyle) : generatedRootStyle),
          ...style,
        }
      : { ...style };

    if (needsWrapper) {
      return (
        <div ref={mergedRef} style={rootStyle} {...rest}>
          <div style={hasSize ? contentStyle : undefined}>{children}</div>
        </div>
      );
    }

    return (
      <div ref={mergedRef} style={rootStyle} {...rest}>
        {children}
      </div>
    );
  },
);

PixelBox.displayName = 'PixelBox';

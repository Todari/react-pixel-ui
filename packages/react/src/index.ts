// Hooks
export { usePixelArt } from './hooks/usePixelArt';
export type { UsePixelArtResult } from './hooks/usePixelArt';
export { usePixelRef } from './hooks/usePixelRef';
export type { UsePixelRefOptions } from './hooks/usePixelRef';
export { useStaircaseClip } from './hooks/useStaircaseClip';
export { useSteppedGradient } from './hooks/useSteppedGradient';
export { useResponsiveSize } from './hooks/useResponsiveSize';

// Components
export { Pixel } from './components/Pixel';
export type { PixelProps } from './components/Pixel';
export { PixelBox } from './components/PixelBox';
export type { PixelBoxProps } from './components/PixelBox';
export { PixelButton } from './components/PixelButton';
export type { PixelButtonProps, PixelButtonVariant } from './components/PixelButton';

// Context
export { PixelConfigProvider, usePixelConfig } from './context/PixelConfigProvider';
export type { PixelConfig, PixelConfigProviderProps } from './context/PixelConfigProvider';

// Re-export core types
export type {
  PixelArtConfig,
  PixelArtStyles,
  PixelShadowConfig,
  BorderRadii,
} from '@react-pixel-ui/core';

import React, { createContext, useContext } from 'react';

export interface PixelConfig {
  /** Default pixel grid size (default: 4) */
  pixelSize: number;
  /** Default border color */
  borderColor?: string;
}

const defaultConfig: PixelConfig = {
  pixelSize: 4,
};

const PixelConfigContext = createContext<PixelConfig>(defaultConfig);

export interface PixelConfigProviderProps {
  config: Partial<PixelConfig>;
  children: React.ReactNode;
}

/**
 * Provider for default pixel art configuration.
 * Wrap your app or component tree to set defaults for all PixelBox/usePixelArt consumers.
 */
export function PixelConfigProvider({
  config,
  children,
}: PixelConfigProviderProps) {
  const merged = { ...defaultConfig, ...config };
  return (
    <PixelConfigContext.Provider value={merged}>
      {children}
    </PixelConfigContext.Provider>
  );
}

/** Access the current pixel art configuration from context */
export function usePixelConfig(): PixelConfig {
  return useContext(PixelConfigContext);
}

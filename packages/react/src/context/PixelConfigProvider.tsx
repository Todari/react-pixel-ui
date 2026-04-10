import React, { createContext, useContext, useMemo } from 'react';

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
  // Extract to locals so the exhaustive-deps linter can verify the memo.
  const pixelSize = config.pixelSize;
  const borderColor = config.borderColor;
  const merged = useMemo<PixelConfig>(
    () => ({
      ...defaultConfig,
      ...(pixelSize !== undefined ? { pixelSize } : null),
      ...(borderColor !== undefined ? { borderColor } : null),
    }),
    [pixelSize, borderColor],
  );
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

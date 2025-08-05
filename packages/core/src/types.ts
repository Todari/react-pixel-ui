export interface PixelOptions {
  unitPixel?: number;
  quality?: 'low' | 'medium' | 'high';
  smooth?: boolean;
  updateMode?: 'realtime' | 'debounced' | 'manual';
  debounceMs?: number;
  fallbackToCSSFilter?: boolean;
}

export interface PixelatedStyle {
  backgroundImage: string;
  backgroundSize: string;
  backgroundRepeat?: string;
  backgroundPosition?: string;
  imageRendering: string;
  position: string;
  zIndex: string;
  pointerEvents: string;
  transform?: string;
  transformOrigin?: string;
  filter?: string;
}

export interface CSSStyleMap {
  [key: string]: string;
}

export interface DOMPixelateOptions extends PixelOptions {
  element: HTMLElement;
  css?: string;
  onUpdate?: (pixelatedStyle: PixelatedStyle) => void;
  onError?: (error: Error) => void;
}

export interface PixelateInstance {
  update: () => Promise<void>;
  updateOptions: (options: Partial<DOMPixelateOptions>) => void;
  destroy: () => void;
  getPixelatedStyle: () => PixelatedStyle | null;
} 
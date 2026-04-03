/**
 * Minimal CSSProperties type for core package (no React dependency).
 * Only includes properties relevant to pixel art generation.
 */
export interface CSSProperties {
  clipPath?: string;
  background?: string;
  backgroundColor?: string;
  backgroundImage?: string;
  filter?: string;
  position?: string;
  display?: string;
  inset?: string | number;
  margin?: string | number;
  padding?: string | number;
  overflow?: string;
  boxSizing?: string;
  width?: string | number;
  height?: string | number;
  [key: string]: string | number | undefined;
}

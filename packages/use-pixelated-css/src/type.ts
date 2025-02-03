export type StyleMap = {
  [key: string]: string[];
}

export type BoxStylesKeys = 'contentBox' | 'paddingBox' | 'borderBox' | 'marginBox';
export type BoxStyles = Record<BoxStylesKeys, StyleMap>;
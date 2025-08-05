/**
 * CSS 문자열을 픽셀 렌더링을 위한 구조체로 파싱
 */

import { PixelStyle, PixelUnit, PixelColor, PixelGradient } from './types';

/**
 * CSS 단위를 PixelUnit으로 파싱
 */
export function parseUnit(value: string | number): PixelUnit {
  if (typeof value === 'number') {
    return { value, unit: 'px' };
  }
  
  const match = value.match(/^(-?\d*\.?\d+)(px|%|em|rem|vw|vh)?$/);
  if (!match) {
    return { value: 0, unit: 'px' };
  }
  
  return {
    value: parseFloat(match[1]),
    unit: (match[2] as any) || 'px'
  };
}

/**
 * CSS 색상을 PixelColor로 파싱
 */
export function parseColor(color: string): PixelColor {
  // hex 색상 (#rgb, #rrggbb)
  if (color.startsWith('#')) {
    const hex = color.slice(1);
    if (hex.length === 3) {
      return {
        r: parseInt(hex[0] + hex[0], 16),
        g: parseInt(hex[1] + hex[1], 16),
        b: parseInt(hex[2] + hex[2], 16),
        a: 255
      };
    } else if (hex.length === 6) {
      return {
        r: parseInt(hex.slice(0, 2), 16),
        g: parseInt(hex.slice(2, 4), 16),
        b: parseInt(hex.slice(4, 6), 16),
        a: 255
      };
    }
  }
  
  // rgb/rgba 색상
  const rgbMatch = color.match(/rgba?\\(([^)]+)\\)/);
  if (rgbMatch) {
    const values = rgbMatch[1].split(',').map(v => parseFloat(v.trim()));
    return {
      r: Math.round(values[0] || 0),
      g: Math.round(values[1] || 0),
      b: Math.round(values[2] || 0),
      a: Math.round((values[3] || 1) * 255)
    };
  }
  
  // 기본 색상들
  const namedColors: Record<string, PixelColor> = {
    'transparent': { r: 0, g: 0, b: 0, a: 0 },
    'black': { r: 0, g: 0, b: 0, a: 255 },
    'white': { r: 255, g: 255, b: 255, a: 255 },
    'red': { r: 255, g: 0, b: 0, a: 255 },
    'green': { r: 0, g: 128, b: 0, a: 255 },
    'blue': { r: 0, g: 0, b: 255, a: 255 },
  };
  
  return namedColors[color.toLowerCase()] || { r: 0, g: 0, b: 0, a: 255 };
}

/**
 * linear-gradient 파싱
 */
export function parseGradient(gradient: string): PixelGradient | null {
  const linearMatch = gradient.match(/linear-gradient\\(([^)]+)\\)/);
  if (!linearMatch) return null;
  
  const parts = linearMatch[1].split(',').map(s => s.trim());
  let angle = 0;
  let colorStart = 0;
  
  // 각도 파싱
  if (parts[0].includes('deg')) {
    angle = parseFloat(parts[0]);
    colorStart = 1;
  } else if (parts[0] === 'to right') {
    angle = 90;
    colorStart = 1;
  } else if (parts[0] === 'to bottom') {
    angle = 180;
    colorStart = 1;
  } else if (parts[0] === 'to left') {
    angle = 270;
    colorStart = 1;
  }
  
  // 색상 정지점 파싱
  const stops = parts.slice(colorStart).map((colorStr, index) => {
    const color = parseColor(colorStr.trim());
    const position = index / (parts.length - colorStart - 1);
    return { color, position };
  });
  
  return {
    type: 'linear',
    angle,
    stops
  };
}

/**
 * CSS 문자열을 PixelStyle로 파싱
 */
export function parseCSS(cssString: string): PixelStyle {
  const style: PixelStyle = {};
  
  // CSS 속성들을 파싱
  const rules = cssString.split(';').map(rule => rule.trim()).filter(Boolean);
  
  for (const rule of rules) {
    const [property, value] = rule.split(':').map(s => s.trim());
    if (!property || !value) continue;
    
    switch (property) {
      case 'width':
        style.width = parseUnit(value);
        break;
      case 'height':
        style.height = parseUnit(value);
        break;
      case 'background-color':
      case 'backgroundColor':
        style.backgroundColor = parseColor(value);
        break;
      case 'background-image':
      case 'backgroundImage':
        if (value.includes('gradient')) {
          style.backgroundImage = parseGradient(value) || undefined;
        }
        break;
      case 'color':
        style.color = parseColor(value);
        break;
      case 'font-size':
      case 'fontSize':
        style.fontSize = parseUnit(value);
        break;
      case 'font-family':
      case 'fontFamily':
        style.fontFamily = value.replace(/['"]/g, '');
        break;
      case 'font-weight':
      case 'fontWeight':
        if (value === 'bold') {
          style.fontWeight = 'bold';
        } else if (value === 'normal') {
          style.fontWeight = 'normal';
        } else {
          style.fontWeight = parseInt(value) || 400;
        }
        break;
      case 'text-align':
      case 'textAlign':
        style.textAlign = value as 'left' | 'center' | 'right';
        break;
      case 'border-radius':
      case 'borderRadius':
        style.borderRadius = parseUnit(value);
        break;
      case 'padding':
        const paddingValue = parseUnit(value);
        style.padding = {
          top: paddingValue,
          right: paddingValue,
          bottom: paddingValue,
          left: paddingValue
        };
        break;
    }
  }
  
  return style;
}

/**
 * CSSProperties를 PixelStyle로 변환
 */
export function cssPropertiesToPixelStyle(cssProps: any): PixelStyle {
  const style: PixelStyle = {};
  
  if (cssProps.width) style.width = parseUnit(cssProps.width);
  if (cssProps.height) style.height = parseUnit(cssProps.height);
  if (cssProps.backgroundColor) style.backgroundColor = parseColor(cssProps.backgroundColor);
  if (cssProps.backgroundImage && cssProps.backgroundImage.includes('gradient')) {
    style.backgroundImage = parseGradient(cssProps.backgroundImage) || undefined;
  }
  if (cssProps.color) style.color = parseColor(cssProps.color);
  if (cssProps.fontSize) style.fontSize = parseUnit(cssProps.fontSize);
  if (cssProps.fontFamily) style.fontFamily = cssProps.fontFamily.replace(/['"]/g, '');
  if (cssProps.fontWeight) {
    if (cssProps.fontWeight === 'bold') {
      style.fontWeight = 'bold';
    } else if (cssProps.fontWeight === 'normal') {
      style.fontWeight = 'normal';
    } else {
      style.fontWeight = parseInt(cssProps.fontWeight.toString()) || 400;
    }
  }
  if (cssProps.textAlign) style.textAlign = cssProps.textAlign as 'left' | 'center' | 'right';
  if (cssProps.borderRadius) style.borderRadius = parseUnit(cssProps.borderRadius);
  if (cssProps.padding) {
    const paddingValue = parseUnit(cssProps.padding);
    style.padding = {
      top: paddingValue,
      right: paddingValue,
      bottom: paddingValue,
      left: paddingValue
    };
  }
  
  return style;
}
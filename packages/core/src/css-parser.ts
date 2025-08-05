import { CSSStyleMap } from './types';

/**
 * CSS 문자열을 파싱하여 스타일 객체로 변환
 */
export function parseCSS(cssString: string): CSSStyleMap {
  const styles: CSSStyleMap = {};
  
  // CSS 문자열에서 스타일 규칙 추출
  const styleRegex = /([a-zA-Z-]+)\s*:\s*([^;]+);/g;
  let match;
  
  while ((match = styleRegex.exec(cssString)) !== null) {
    const [, property, value] = match;
    styles[property.trim()] = value.trim();
  }
  
  return styles;
}

/**
 * CSS 속성을 정규화
 */
export function normalizeCSSProperty(property: string): string {
  return property
    .replace(/[A-Z]/g, (match) => `-${match.toLowerCase()}`)
    .replace(/^-/, '');
}

/**
 * CSS 값을 정규화
 */
export function normalizeCSSValue(value: string): string {
  return value.trim().replace(/\s+/g, ' ');
} 
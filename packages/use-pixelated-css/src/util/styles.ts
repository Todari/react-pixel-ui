import { StyleMap } from "../types/type";

export const styleMap = (ref: React.RefObject<HTMLElement>) => {
  const styleMap: StyleMap = {};
  
  if (!ref.current) return styleMap;
  
  let computedStyle: CSSStyleDeclaration;  
  try {  
    computedStyle = getComputedStyle(ref.current);  
  } catch (error) {  
    console.error('스타일을 계산하는 중 오류가 발생했습니다:', error);  
    return styleMap;  
  }  
  
  for (let i = 0; i < computedStyle.length; i++) {
    const property = computedStyle[i];
    const value = computedStyle.getPropertyValue(property);
    if (value) {
      styleMap[property] = value;
    }
  }

  return styleMap;
}
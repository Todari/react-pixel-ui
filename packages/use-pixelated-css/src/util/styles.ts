import { StyleMap } from "../types/type";

export const styleMap = (ref: React.RefObject<HTMLElement>) => {
  const styleMap: StyleMap = {};
  
  if (!ref.current) return styleMap;
  
  const computedStyle = getComputedStyle(ref.current);
  
  for (let i = 0; i < computedStyle.length; i++) {
    const property = computedStyle[i];
    const value = computedStyle.getPropertyValue(property);
    if (value) {
      styleMap[property] = value;
    }
  }

  return styleMap;
}
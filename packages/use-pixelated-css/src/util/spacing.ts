import { StyleMap } from "../types/type";
import { pixelUnit } from "./cssUnit";

export function rectSize(styles: StyleMap, element: HTMLElement) {

  const border = {
    top: pixelUnit(styles['border-top-width']  || '0', element),
    right: pixelUnit(styles['border-right-width']  || '0', element),
    bottom: pixelUnit(styles['border-bottom-width']  || '0', element),
    left: pixelUnit(styles['border-left-width']  || '0', element)
  };

  // padding 크기 계산
  const padding = {
    top: pixelUnit(styles['padding-top']  || '0', element),
    right: pixelUnit(styles['padding-right']  || '0', element),
    bottom: pixelUnit(styles['padding-bottom']  || '0', element),
    left: pixelUnit(styles['padding-left']  || '0', element)
  };

  const boxSizing = styles['box-sizing']  || 'content-box';

  // box-sizing에 따른 content 영역 크기 계산
  let contentWidth = (element?.clientWidth ?? 0) + (border.left + border.right);
  let contentHeight = (element?.clientHeight ?? 0) + (border.top + border.bottom);

  // content-box일 때는 border와 padding을 더해줌
  if (boxSizing === 'content-box') {
    contentWidth += (padding.left + padding.right);
    contentHeight += (padding.top + padding.bottom);
  }

  return {
    contentWidth,
    contentHeight,
    border,
    padding,
    boxSizing
  }
}
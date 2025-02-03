import { StyleMap } from "../types/type";
import { pixelUnit } from "./cssUnit";

export function rectSize(styles: StyleMap, ref: React.RefObject<HTMLElement>) {
  const border = {
    top: pixelUnit(styles['border-top-width']?.[0] || '0', ref.current!),
    right: pixelUnit(styles['border-right-width']?.[0] || '0', ref.current!),
    bottom: pixelUnit(styles['border-bottom-width']?.[0] || '0', ref.current!),
    left: pixelUnit(styles['border-left-width']?.[0] || '0', ref.current!)
  };

  // padding 크기 계산
  const padding = {
    top: pixelUnit(styles['padding-top']?.[0] || '0', ref.current!),
    right: pixelUnit(styles['padding-right']?.[0] || '0', ref.current!),
    bottom: pixelUnit(styles['padding-bottom']?.[0] || '0', ref.current!),
    left: pixelUnit(styles['padding-left']?.[0] || '0', ref.current!)
  };

  const boxSizing = styles['box-sizing']?.[0] || 'content-box';

  // box-sizing에 따른 content 영역 크기 계산
  let contentWidth = (ref.current?.clientWidth ?? 0) + (border.left + border.right);
  let contentHeight = (ref.current?.clientHeight ?? 0) + (border.top + border.bottom);

  // content-box일 때는 border와 padding을 더해줌
  if (boxSizing === 'content-box') {
    contentWidth += (padding.left + padding.right);
    contentHeight += (padding.top + padding.bottom);
  }

  console.log(contentWidth, contentHeight, boxSizing);

  return {
    contentWidth,
    contentHeight,
    border,
    padding,
    boxSizing
  }
}
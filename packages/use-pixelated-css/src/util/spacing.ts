import { StyleMap } from "../types/type";
import { pixelUnit } from "./cssUnit";

export function rectSizeByStyleMap(styles: StyleMap, ref: React.RefObject<HTMLElement>) {
  const size = {
    width: pixelUnit(styles['width']?.[0] || '0', ref.current!),
    height: pixelUnit(styles['height']?.[0] || '0', ref.current!),
  }

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
  let contentWidth = size.width;
  let contentHeight = size.height

  // content-box일 때는 border와 padding을 더해줌
  if (boxSizing === 'content-box') {
    contentWidth += (border.left + border.right) + (padding.left + padding.right);
    contentHeight += (border.top + border.bottom) + (padding.top + padding.bottom);
  }

  console.log(size, contentWidth, contentHeight, boxSizing);

  return {
    contentWidth,
    contentHeight,
    border,
    padding,
    boxSizing
  }
}
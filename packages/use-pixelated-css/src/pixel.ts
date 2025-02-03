import { css } from "@emotion/react";
import { styleMap } from "./util/styles";
import { drawBorder } from "./render/border";
import { drawBackground } from "./render";

interface Params{
  ref: React.RefObject<HTMLElement>;
  unitPixel: number;
}

export function pixelate({ref, unitPixel}: Params) {
  const styles = styleMap(ref);
  const canvas = document.createElement('canvas');
  canvas.width = (ref.current?.getBoundingClientRect().width ?? 0) / unitPixel;
  canvas.height = (ref.current?.getBoundingClientRect().height ?? 0) / unitPixel;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('2D 컨텍스트를 초기화할 수 없습니다');
  ctx.imageSmoothingEnabled = false;

  console.log(styles);
  drawBackground({styleMap: styles, ctx, ref: ref.current!, unitPixel});
  // drawBorder({styleMap: styles, ctx, unitPixel, ref});
  console.log(canvas.toDataURL());
  
  return css`
    width: ${ref.current?.getBoundingClientRect().width}px;
    height: ${ref.current?.getBoundingClientRect().height}px;
    background-image: url(${canvas.toDataURL()});
    border: 0;
    background-size: 100%;
    image-rendering: pixelated;
  `;
}
import { StyleMap } from "../../types/type";
import { pixelUnit } from "../../util/cssUnit";

interface Params{
  ctx: CanvasRenderingContext2D;
  styles: StyleMap;
  element: HTMLElement;
  unitPixel: number;
}

export function applyBorderRadius({ctx, styles, element, unitPixel}: Params) {
  ctx.beginPath();
  
  const width = ctx.canvas.width;
  const height = ctx.canvas.height;
  
  // border-radius 값 가져오기
  const radius = {
    topLeft: pixelUnit(styles['border-top-left-radius'] || '0', element) / unitPixel,
    topRight: pixelUnit(styles['border-top-right-radius'] || '0', element) / unitPixel,
    bottomRight: pixelUnit(styles['border-bottom-right-radius'] || '0', element) / unitPixel,
    bottomLeft: pixelUnit(styles['border-bottom-left-radius'] || '0', element) / unitPixel
  };

  // 경로 그리기
  ctx.moveTo(radius.topLeft, 0);
  ctx.lineTo(width - radius.topRight, 0);
  ctx.quadraticCurveTo(width, 0, width, radius.topRight);
  
  ctx.lineTo(width, height - radius.bottomRight);
  ctx.quadraticCurveTo(width, height, width - radius.bottomRight, height);
  
  ctx.lineTo(radius.bottomLeft, height);
  ctx.quadraticCurveTo(0, height, 0, height - radius.bottomLeft);
  
  ctx.lineTo(0, radius.topLeft);
  ctx.quadraticCurveTo(0, 0, radius.topLeft, 0);
  
  ctx.closePath();
  ctx.clip();
}
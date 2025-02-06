import { StyleMap } from "../../types/type";
import { pixelUnit } from "../../util/cssUnit";

interface Params{
  ctx: CanvasRenderingContext2D;
  styles: StyleMap;
  element: HTMLElement;
  unitPixel: number;
}

export function applyBorderRadius({ctx, styles, element, unitPixel}: Params) {
  if (!ctx || !ctx.canvas) {  
    console.warn('Invalid canvas context');  
    return;  
  }  
  
  ctx.beginPath();
  
  const width = ctx.canvas.width;
  const height = ctx.canvas.height;
  
  // border-radius 값 가져오기
    const radius = {  
    topLeft: Math.max(0, pixelUnit(styles['border-top-left-radius'] || '0', element)) / unitPixel,  
    topRight: Math.max(0, pixelUnit(styles['border-top-right-radius'] || '0', element)) / unitPixel,  
    bottomRight: Math.max(0, pixelUnit(styles['border-bottom-right-radius'] || '0', element)) / unitPixel,  
    bottomLeft: Math.max(0, pixelUnit(styles['border-bottom-left-radius'] || '0', element)) / unitPixel  
  };  

  // 모든 radius가 0이면 클리핑 생략  
  if (Object.values(radius).every(r => r === 0)) {  
    return;  
  }  

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
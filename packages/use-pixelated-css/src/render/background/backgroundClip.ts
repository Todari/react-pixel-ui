import { StyleMap } from "../../types/type";
import { pixelUnit } from "../../util/cssUnit";

export function applyClipPath(
  ctx: CanvasRenderingContext2D, 
  clipMode: string,
  styleMap: StyleMap,
  ref: HTMLElement,
  unitPixel: number
) {
  const canvas = ctx.canvas;
  ctx.save();
  ctx.beginPath();

  // padding-box나 content-box에 대한 영역 계산
  const bounds = calculateClipBounds(clipMode, styleMap, canvas, ref, unitPixel);
  
  // 클리핑 패스 생성
  ctx.rect(
    bounds.x,
    bounds.y,
    bounds.width,
    bounds.height
  );
  
  ctx.clip();
}

interface ClipBounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

function calculateClipBounds(
  clipMode: string,
  styleMap: StyleMap,
  canvas: HTMLCanvasElement,
  ref: HTMLElement,
  unitPixel: number
): ClipBounds {
  // padding 값 파싱
  const padding = {
    top: pixelUnit(styleMap['padding-top']  || '0', ref) / unitPixel,
    right: pixelUnit(styleMap['padding-right']  || '0', ref) / unitPixel,
    bottom: pixelUnit(styleMap['padding-bottom']  || '0', ref) / unitPixel,
    left: pixelUnit(styleMap['padding-left']  || '0', ref) / unitPixel
  };

  // border 값 파싱
  const border = {
    top: pixelUnit(styleMap['border-top-width']  || '0', ref) / unitPixel,
    right: pixelUnit(styleMap['border-right-width']  || '0', ref) / unitPixel,
    bottom: pixelUnit(styleMap['border-bottom-width']  || '0', ref) / unitPixel,
    left: pixelUnit(styleMap['border-left-width']  || '0', ref) / unitPixel
  };

  if (clipMode === 'padding-box') {
    return {
      x: border.left,
      y: border.top,
      width: canvas.width - (border.left + border.right),
      height: canvas.height - (border.top + border.bottom)
    };
  } else if (clipMode === 'content-box') {
    return {
      x: border.left + padding.left,
      y: border.top + padding.top,
      width: canvas.width - (border.left + border.right + padding.left + padding.right),
      height: canvas.height - (border.top + border.bottom + padding.top + padding.bottom)
    };
  }

  // border-box (기본값)의 경우 전체 캔버스 영역 사용
  return {
    x: 0,
    y: 0,
    width: canvas.width,
    height: canvas.height
  };
}
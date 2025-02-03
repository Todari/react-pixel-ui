import { convertCSSUnitToPx } from "../../util/cssUnit";
import { StyleMap } from "../../type";

interface Params {
  ctx: CanvasRenderingContext2D;
  styleMap: StyleMap;
  unitPixel: number;
}

// border 스타일 우선순위 처리를 위한 타입
type BorderStyle = {
  width: number;
  style: string;
  color: string;
  image?: {
    source: string;
    slice: number[];
    width: number[];
    outset: number[];
    repeat: string;
  };
};

export function drawBorder({ctx, styleMap, unitPixel}: Params) {
  // 1. border-image가 있는지 먼저 확인 (최우선)
  const borderImage = getBorderImage(styleMap);
  if (borderImage) {
    return drawBorderImage(ctx, borderImage, unitPixel);
  }

  // 2. 개별 방향 스타일 계산 (논리적 속성 > 물리적 속성 > 축약형)
  const borderStyles = computeBorderStyles(styleMap, ctx, unitPixel);
  
  // 3. border-radius 계산 (논리적 > 물리적)
  const borderRadius = computeBorderRadius(styleMap, ctx, unitPixel);
  
  // 4. box-sizing에 따른 오프셋 계산
  const offset = computeOffset(styleMap, borderStyles);

  // 5. 테두리 그리기
  drawBorderPath(ctx, borderStyles, borderRadius, offset);
}

function computeBorderStyles(styleMap: StyleMap, ctx: CanvasRenderingContext2D, unitPixel: number): Record<string, BorderStyle> {
  return {
    top: getDirectionalBorderStyle('top', styleMap, ctx, unitPixel),
    right: getDirectionalBorderStyle('right', styleMap, ctx, unitPixel),
    bottom: getDirectionalBorderStyle('bottom', styleMap, ctx, unitPixel),
    left: getDirectionalBorderStyle('left', styleMap, ctx, unitPixel)
  };
}

function getDirectionalBorderStyle(direction: string, styleMap: StyleMap, ctx: CanvasRenderingContext2D, unitPixel: number): BorderStyle {
  // 우선순위: 논리적 > 물리적 > 축약형
  const logicalMap = {
    top: 'block-start',
    bottom: 'block-end',
    left: 'inline-start',
    right: 'inline-end'
  };

  const logical = logicalMap[direction];
  
  return {
    width: getPropertyWithFallback([
      `border-${logical}-width`,
      `border-${direction}-width`,
      'border-width'
    ], styleMap, ctx, unitPixel),
    
    style: getPropertyWithFallback([
      `border-${logical}-style`,
      `border-${direction}-style`,
      'border-style'
    ], styleMap),
    
    color: getPropertyWithFallback([
      `border-${logical}-color`,
      `border-${direction}-color`,
      'border-color'
    ], styleMap)
  };
}

function drawBorderPath(
  ctx: CanvasRenderingContext2D, 
  styles: Record<string, BorderStyle>,
  radius: Record<string, number>,
  offset: Record<string, number>
) {
  // 각 방향별로 스타일에 따른 처리
  ['top', 'right', 'bottom', 'left'].forEach(direction => {
    const style = styles[direction];
    
    switch(style.style) {
      case 'solid':
        drawSolidBorder(ctx, direction, style, radius, offset);
        break;
      case 'dashed':
        drawDashedBorder(ctx, direction, style, radius, offset);
        break;
      case 'dotted':
        drawDottedBorder(ctx, direction, style, radius, offset);
        break;
      case 'double':
        drawDoubleBorder(ctx, direction, style, radius, offset);
        break;
      // 다른 스타일들 추가...
    }
  });
}

function drawSolidBorder(
  ctx: CanvasRenderingContext2D,
  direction: string,
  style: BorderStyle,
  radius: Record<string, number>,
  offset: Record<string, number>
) {
  ctx.beginPath();
  // 현재 구현된 경로 그리기 로직 사용
  ctx.strokeStyle = style.color;
  ctx.lineWidth = style.width;
  ctx.stroke();
}

// 다른 border 스타일 구현...
function drawDashedBorder(/*...*/) { /* ... */ }
function drawDottedBorder(/*...*/) { /* ... */ }
function drawDoubleBorder(/*...*/) { /* ... */ }

function getBorderImage(styleMap: StyleMap) {
  const source = styleMap['border-image-source']?.[0];
  if (!source || source === 'none') return null;
  
  return {
    source,
    slice: parseBorderImageSlice(styleMap['border-image-slice']?.[0]),
    width: parseBorderImageWidth(styleMap['border-image-width']?.[0]),
    outset: parseBorderImageOutset(styleMap['border-image-outset']?.[0]),
    repeat: styleMap['border-image-repeat']?.[0]
  };
}

// 유틸리티 함수들...
function getPropertyWithFallback(properties: string[], styleMap: StyleMap, ctx?: CanvasRenderingContext2D, unitPixel?: number) {
  for (const prop of properties) {
    if (styleMap[prop]?.[0]) {
      return unitPixel && ctx 
        ? convertCSSUnitToPx(styleMap[prop][0], ctx.canvas) / unitPixel
        : styleMap[prop][0];
    }
  }
  return null;
}

// 8. 그라데이션 테두리 처리
function drawGradientBorder(ctx: CanvasRenderingContext2D, styleMap: StyleMap) {
  const width = ctx.canvas.width;
  const height = ctx.canvas.height;
  const gradient = ctx.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, borderColor.top);
  gradient.addColorStop(1, borderColor.bottom);
  
  ctx.strokeStyle = gradient;
  ctx.stroke();
}

// 9. 이미지 테두리 처리
function drawImageBorder(ctx: CanvasRenderingContext2D, styleMap: ComputedStyle) {
  const borderImage = new Image();
  borderImage.src = styleMap['border-image-source'][0];
  
  borderImage.onload = () => {
    const pattern = ctx.createPattern(borderImage, 'repeat');
    if (pattern) {
      ctx.strokeStyle = pattern;
      ctx.stroke();
    }
  };
}
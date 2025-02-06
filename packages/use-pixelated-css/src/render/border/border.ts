import { StyleMap } from "../../types/type";
import { pixelUnit } from "../../util/cssUnit";
import { drawBorderImage } from "./borderImage";
import { drawBorderPath } from "./borderPath";

export interface BorderParams {
  ctx: CanvasRenderingContext2D;
  styles: StyleMap;
  unitPixel: number;
  element: HTMLElement;
}

export interface BorderImageParams {
  source: string;
  slice: number[];
  width: number[];
  outset: number[];
  repeat: string;
}

export function drawBorder({ctx, styles, unitPixel, element}: BorderParams) {
  // 1. border-image 처리 (최우선)
  const borderImage = parseBorderImage(styles);
  if (borderImage) {
    drawBorderImage(ctx, borderImage, unitPixel);
    return null;
  }

  // 2. border-radius 계산
  const radius = parseBorderRadius(styles, element, unitPixel);
  
  // 3. 각 방향별 border 스타일 계산
  const borders = parseBorderStyles(styles, element, unitPixel);
  // 4. border 그리기
  drawBorderPath(ctx, borders, radius);
}

function parseBorderImage(styles: StyleMap): BorderImageParams | null {
  // border-image가 없으면 null 반환
  if (!styles['border-image-source']  || styles['border-image-source']  === 'none') {
    return null;
  }

  // slice 값 파싱 (기본값: [0, 0, 0, 0])
  const sliceValues = styles['border-image-slice'] ?.split(' ') || ['0'];
  const slice = expandToFourValues(sliceValues).map(v => parseInt(v));

  // width 값 파싱 (기본값: [1, 1, 1, 1])
  const widthValues = styles['border-image-width'] ?.split(' ') || ['1'];
  const width = expandToFourValues(widthValues).map(v => parseInt(v));

  // outset 값 파싱 (기본값: [0, 0, 0, 0])
  const outsetValues = styles['border-image-outset'] ?.split(' ') || ['0'];
  const outset = expandToFourValues(outsetValues).map(v => parseInt(v));

  // repeat 값 파싱 (기본값: 'stretch')
  const repeat = styles['border-image-repeat']  || 'stretch';

  return {
    source: styles['border-image-source'],
    slice,
    width,
    outset,
    repeat
  };
}

function expandToFourValues(values: string[]): string[] {
  switch (values.length) {
    case 1:
      return [values[0], values[0], values[0], values[0]];
    case 2:
      return [values[0], values[1], values[0], values[1]];
    case 3:
      return [values[0], values[1], values[2], values[1]];
    case 4:
      return values;
    default:
      return ['0', '0', '0', '0'];
  }
}

interface BorderStyle {
  width: number;
  style: string;
  color: string;
}

export interface BorderStyles {
  top: BorderStyle;
  right: BorderStyle;
  bottom: BorderStyle;
  left: BorderStyle;
}

export interface BorderRadius {
  topLeft: number;
  topRight: number;
  bottomRight: number;
  bottomLeft: number;
}

export function parseBorderRadius(
  styleMap: StyleMap, 
  element: HTMLElement,
  unitPixel: number
): BorderRadius {
  // 논리적 속성 우선
  const corners = {
    topLeft: ['border-start-start-radius', 'border-top-left-radius'],
    topRight: ['border-start-end-radius', 'border-top-right-radius'],
    bottomRight: ['border-end-end-radius', 'border-bottom-right-radius'],
    bottomLeft: ['border-end-start-radius', 'border-bottom-left-radius']
  };

  const result = {} as BorderRadius;

  Object.entries(corners).forEach(([corner, properties]) => {
    const value = 
      styleMap[properties[0]]  ||
      styleMap[properties[1]]  ||
      styleMap['border-radius']  ||
      '0';

    result[corner as keyof BorderRadius] = pixelUnit(value, element) / unitPixel;
  });

  return result;
}

function parseBorderStyles(styleMap: StyleMap, element: HTMLElement, unitPixel: number): BorderStyles {
  const directions = ['top', 'right', 'bottom', 'left'] as const;
  const result = {} as BorderStyles;

  directions.forEach(dir => {
    // 논리적 속성 우선
    const logical = {
      top: 'block-start',
      right: 'inline-end',
      bottom: 'block-end',
      left: 'inline-start'
    }[dir];

    result[dir] = {
      width: getBorderWidth(styleMap, dir, logical, element, unitPixel),
      style: getBorderStyle(styleMap, dir, logical),
      color: getBorderColor(styleMap, dir, logical)
    };
  });

  return result;
}

function getBorderWidth(
  styleMap: StyleMap, 
  physical: string, 
  logical: string, 
  element: HTMLElement,
  unitPixel: number
): number {
  // 우선순위: 논리적 > 물리적 > 축약형
  const value = 
    styleMap[`border-${logical}-width`]  ||
    styleMap[`border-${physical}-width`]  ||
    styleMap['border-width']  ||
    '0';

  return pixelUnit(value, element) / unitPixel;
}

function getBorderStyle(styleMap: StyleMap, physical: string, logical: string): string {
  return (
    styleMap[`border-${logical}-style`]  ||
    styleMap[`border-${physical}-style`]  ||
    styleMap['border-style']  ||
    'none'
  );
}

function getBorderColor(styleMap: StyleMap, physical: string, logical: string): string {
  return (
    styleMap[`border-${logical}-color`]  ||
    styleMap[`border-${physical}-color`]  ||
    styleMap['border-color']  ||
    'currentcolor'
  );
}
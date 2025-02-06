import { StyleMap } from "../../types/type";

interface BorderImageParams {
  source: string;
  slice: number[];
  width: number[];
  outset: number[];
  repeat: string;
}

export function drawBorderImage(
  ctx: CanvasRenderingContext2D,
  borderImage: BorderImageParams,
  unitPixel: number
) {
  const image = new Image();
  image.src = borderImage.source.replace(/url\(['"]?(.*?)['"]?\)/g, '$1');

  return new Promise((resolve) => {
    image.onload = () => {
      const canvas = ctx.canvas;
      const areas = computeNineSliceAreas(canvas, borderImage.width, unitPixel);
      const slices = computeImageSlices(image, borderImage.slice);
      
      // 각 영역별로 이미지 그리기
      areas.forEach((area, index) => {
        const slice = slices[index];
        
        // 중앙 영역은 건너뛰기 (index === 8)
        if (index === 8) return;

        switch (borderImage.repeat) {
          case 'stretch':
            drawStretchedSlice(ctx, image, slice, area);
            break;
          case 'repeat':
            drawRepeatedSlice(ctx, image, slice, area);
            break;
          case 'round':
            drawRoundedSlice(ctx, image, slice, area);
            break;
          case 'space':
            drawSpacedSlice(ctx, image, slice, area);
            break;
        }
      });

      resolve(true);
    };

    image.onerror = () => {
      console.error('Border image loading failed');
      resolve(false);
    };
  });
}

interface Area {
  dx: number;
  dy: number;
  dw: number;
  dh: number;
}

interface Slice {
  sx: number;
  sy: number;
  sw: number;
  sh: number;
}

function computeNineSliceAreas(
  canvas: HTMLCanvasElement,
  widthValues: number[],
  unitPixel: number
): Area[] {
  const [top, right, bottom, left] = widthValues;
  const borderWidths = {
    top: top / unitPixel,
    right: right / unitPixel,
    bottom: bottom / unitPixel,
    left: left / unitPixel
  };

  // 9개 영역 계산
  return [
    // 코너 영역
    { dx: 0, dy: 0, dw: borderWidths.left, dh: borderWidths.top },
    { dx: canvas.width - borderWidths.right, dy: 0, dw: borderWidths.right, dh: borderWidths.top },
    { dx: canvas.width - borderWidths.right, dy: canvas.height - borderWidths.bottom, dw: borderWidths.right, dh: borderWidths.bottom },
    { dx: 0, dy: canvas.height - borderWidths.bottom, dw: borderWidths.left, dh: borderWidths.bottom },
    
    // 엣지 영역
    { dx: borderWidths.left, dy: 0, dw: canvas.width - borderWidths.left - borderWidths.right, dh: borderWidths.top },
    { dx: canvas.width - borderWidths.right, dy: borderWidths.top, dw: borderWidths.right, dh: canvas.height - borderWidths.top - borderWidths.bottom },
    { dx: borderWidths.left, dy: canvas.height - borderWidths.bottom, dw: canvas.width - borderWidths.left - borderWidths.right, dh: borderWidths.bottom },
    { dx: 0, dy: borderWidths.top, dw: borderWidths.left, dh: canvas.height - borderWidths.top - borderWidths.bottom },
    
    // 중앙 영역
    { dx: borderWidths.left, dy: borderWidths.top, dw: canvas.width - borderWidths.left - borderWidths.right, dh: canvas.height - borderWidths.top - borderWidths.bottom }
  ];
}

function computeImageSlices(image: HTMLImageElement, sliceValues: number[]): Slice[] {
  const [top, right, bottom, left] = sliceValues;
  const imageWidth = image.width;
  const imageHeight = image.height;

  return [
    // 코너 슬라이스
    { sx: 0, sy: 0, sw: left, sh: top },
    { sx: imageWidth - right, sy: 0, sw: right, sh: top },
    { sx: imageWidth - right, sy: imageHeight - bottom, sw: right, sh: bottom },
    { sx: 0, sy: imageHeight - bottom, sw: left, sh: bottom },
    
    // 엣지 슬라이스
    { sx: left, sy: 0, sw: imageWidth - left - right, sh: top },
    { sx: imageWidth - right, sy: top, sw: right, sh: imageHeight - top - bottom },
    { sx: left, sy: imageHeight - bottom, sw: imageWidth - left - right, sh: bottom },
    { sx: 0, sy: top, sw: left, sh: imageHeight - top - bottom },
    
    // 중앙 슬라이스
    { sx: left, sy: top, sw: imageWidth - left - right, sh: imageHeight - top - bottom }
  ];
}

function drawStretchedSlice(
  ctx: CanvasRenderingContext2D,
  image: HTMLImageElement,
  slice: Slice,
  area: Area
) {
  // 이미지 슬라이스를 대상 영역에 맞게 늘려서 그리기
  ctx.drawImage(
    image,
    slice.sx, slice.sy, slice.sw, slice.sh,
    area.dx, area.dy, area.dw, area.dh
  );
}

function drawRepeatedSlice(
  ctx: CanvasRenderingContext2D,
  image: HTMLImageElement,
  slice: Slice,
  area: Area
) {
  // 패턴 생성
  const pattern = ctx.createPattern(createSliceCanvas(image, slice), 'repeat');
  if (!pattern) return;

  // 클리핑 영역 설정
  ctx.save();
  ctx.beginPath();
  ctx.rect(area.dx, area.dy, area.dw, area.dh);
  ctx.clip();

  // 패턴 적용 및 그리기
  ctx.fillStyle = pattern;
  ctx.fillRect(area.dx, area.dy, area.dw, area.dh);
  
  ctx.restore();
}

function drawRoundedSlice(
  ctx: CanvasRenderingContext2D,
  image: HTMLImageElement,
  slice: Slice,
  area: Area
) {
  // 반복 횟수 계산 (반올림)
  const horizontalCount = Math.max(1, Math.round(area.dw / slice.sw));
  const verticalCount = Math.max(1, Math.round(area.dh / slice.sh));

  // 조정된 크기 계산
  const adjustedWidth = area.dw / horizontalCount;
  const adjustedHeight = area.dh / verticalCount;

  // 클리핑 영역 설정
  ctx.save();
  ctx.beginPath();
  ctx.rect(area.dx, area.dy, area.dw, area.dh);
  ctx.clip();

  // 타일 그리기
  for (let y = 0; y < verticalCount; y++) {
    for (let x = 0; x < horizontalCount; x++) {
      ctx.drawImage(
        image,
        slice.sx, slice.sy, slice.sw, slice.sh,
        area.dx + (x * adjustedWidth),
        area.dy + (y * adjustedHeight),
        adjustedWidth,
        adjustedHeight
      );
    }
  }

  ctx.restore();
}

function drawSpacedSlice(
  ctx: CanvasRenderingContext2D,
  image: HTMLImageElement,
  slice: Slice,
  area: Area
) {
  // 최소 1개 이상의 타일이 들어가도록 계산
  const horizontalCount = Math.max(1, Math.floor(area.dw / slice.sw));
  const verticalCount = Math.max(1, Math.floor(area.dh / slice.sh));

  // 간격 계산
  const horizontalSpace = horizontalCount > 1 ? 
    (area.dw - (horizontalCount * slice.sw)) / (horizontalCount - 1) : 0;
  const verticalSpace = verticalCount > 1 ? 
    (area.dh - (verticalCount * slice.sh)) / (verticalCount - 1) : 0;

  // 클리핑 영역 설정
  ctx.save();
  ctx.beginPath();
  ctx.rect(area.dx, area.dy, area.dw, area.dh);
  ctx.clip();

  // 타일 그리기
  for (let y = 0; y < verticalCount; y++) {
    for (let x = 0; x < horizontalCount; x++) {
      ctx.drawImage(
        image,
        slice.sx, slice.sy, slice.sw, slice.sh,
        area.dx + (x * (slice.sw + horizontalSpace)),
        area.dy + (y * (slice.sh + verticalSpace)),
        slice.sw,
        slice.sh
      );
    }
  }

  ctx.restore();
}

function createSliceCanvas(image: HTMLImageElement, slice: Slice): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = slice.sw;
  canvas.height = slice.sh;
  const ctx = canvas.getContext('2d');
  
  if (ctx) {
    ctx.drawImage(
      image,
      slice.sx, slice.sy, slice.sw, slice.sh,
      0, 0, slice.sw, slice.sh
    );
  }
  
  return canvas;
}
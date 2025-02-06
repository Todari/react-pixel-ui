import { Background } from "./background";

interface BackgroundImageParams {
  ctx: CanvasRenderingContext2D;
  background: Background;
}

export function drawBackgroundImage({ctx, background}: BackgroundImageParams) {
  if (!background.image) {  
    return Promise.reject(new Error('이미지 URL이 제공되지 않았습니다.'));  
  }  

  const image = new Image();
  const imageUrl = background.image!.replace(/url\(['"]?(.*?)['"]?\)/g, '$1');

  if (!imageUrl) {  
    return Promise.reject(new Error('유효하지 않은 이미지 URL입니다.'));  
  }  
  
  image.src = imageUrl;  

  return new Promise((resolve) => {
    const timeout = setTimeout(() => {  
      console.error('이미지 로딩 시간 초과');  
      resolve(false);  
    }, 10000); // 10초 타임아웃  
    image.onload = () => {
      const canvas = ctx.canvas;
      
      // 1. 이미지 크기 계산
      const size = calculateBackgroundSize(
        background.size,
        { width: image.width, height: image.height },
        { width: canvas.width, height: canvas.height }
      );

      // 2. 이미지 위치 계산
      const position = calculateBackgroundPosition(
        background.position,
        size,
        { width: canvas.width, height: canvas.height }
      );

      // 3. repeat 처리
      switch (background.repeat) {
        case 'no-repeat':
          drawSingleImage(ctx, image, position, size);
          break;
        case 'repeat-x':
          drawRepeatedImage(ctx, image, position, size, 'x');
          break;
        case 'repeat-y':
          drawRepeatedImage(ctx, image, position, size, 'y');
          break;
        case 'repeat':
          drawRepeatedImage(ctx, image, position, size, 'both');
          break;
        case 'space':
          drawSpacedImage(ctx, image, position, size);
          break;
        case 'round':
          drawRoundedImage(ctx, image, position, size);
          break;
      }

      resolve(true);
    };

    image.onerror = () => {
      clearTimeout(timeout);
      console.error('Background image loading failed');
      resolve(false);
    };
  });
}

interface Size {
  width: number;
  height: number;
}

interface Position {
  x: number;
  y: number;
}

function calculateBackgroundSize(
  sizeValue: [string, string],
  imageSize: Size,
  containerSize: Size
): Size {
  const [widthValue, heightValue] = sizeValue;

  if (widthValue === 'cover' || heightValue === 'cover') {
    return calculateCoverSize(imageSize, containerSize);
  }

  if (widthValue === 'contain' || heightValue === 'contain') {
    return calculateContainSize(imageSize, containerSize);
  }

  return {
    width: parseBackgroundDimension(widthValue, containerSize.width, imageSize.width),
    height: parseBackgroundDimension(heightValue, containerSize.height, imageSize.height)
  };
}

function calculateBackgroundPosition(
  positionValue: [string, string],
  imageSize: Size,
  containerSize: Size
): Position {
  const [xValue, yValue] = positionValue;

  return {
    x: parseBackgroundPosition(xValue, containerSize.width, imageSize.width),
    y: parseBackgroundPosition(yValue, containerSize.height, imageSize.height)
  };
}

function drawSingleImage(
  ctx: CanvasRenderingContext2D,
  image: HTMLImageElement,
  position: Position,
  size: Size
) {
  ctx.drawImage(
    image,
    position.x,
    position.y,
    size.width,
    size.height
  );
}

function drawRepeatedImage(
  ctx: CanvasRenderingContext2D,
  image: HTMLImageElement,
  position: Position,
  size: Size,
  direction: 'x' | 'y' | 'both'
) {
  const canvas = ctx.canvas;
  const imageTile = createImageTile(image, size);     
  const pattern = ctx.createPattern(imageTile, 
    direction === 'x' ? 'repeat-x' : 
    direction === 'y' ? 'repeat-y' : 
    'repeat'
  );
  if (!pattern) {  
    console.error('패턴을 생성할 수 없습니다.');  
    return;  
  }  

  if (pattern) {
    ctx.save();
    ctx.translate(position.x, position.y);
    ctx.fillStyle = pattern;
    ctx.fillRect(
      0, 0,
      direction === 'y' ? size.width : canvas.width,
      direction === 'x' ? size.height : canvas.height
    );
    ctx.restore();
  }
}

function drawSpacedImage(
  ctx: CanvasRenderingContext2D,
  image: HTMLImageElement,
  position: Position,
  size: Size
) {
  const canvas = ctx.canvas;
  const horizontalCount = Math.floor(canvas.width / size.width);
  const verticalCount = Math.floor(canvas.height / size.height);
  
  const horizontalSpace = (canvas.width - (horizontalCount * size.width)) / (horizontalCount + 1);
  const verticalSpace = (canvas.height - (verticalCount * size.height)) / (verticalCount + 1);

  for (let y = 0; y < verticalCount; y++) {
    for (let x = 0; x < horizontalCount; x++) {
      ctx.drawImage(
        image,
        position.x + (x * (size.width + horizontalSpace)) + horizontalSpace,
        position.y + (y * (size.height + verticalSpace)) + verticalSpace,
        size.width,
        size.height
      );
    }
  }
}

function drawRoundedImage(
  ctx: CanvasRenderingContext2D,
  image: HTMLImageElement,
  position: Position,
  size: Size
) {
  const canvas = ctx.canvas;
  const horizontalCount = Math.round(canvas.width / size.width);
  const verticalCount = Math.round(canvas.height / size.height);
  
  const adjustedWidth = canvas.width / horizontalCount;
  const adjustedHeight = canvas.height / verticalCount;

  for (let y = 0; y < verticalCount; y++) {
    for (let x = 0; x < horizontalCount; x++) {
      ctx.drawImage(
        image,
        position.x + (x * adjustedWidth),
        position.y + (y * adjustedHeight),
        adjustedWidth,
        adjustedHeight
      );
    }
  }
}

// 유틸리티 함수들
function createImageTile(image: HTMLImageElement, size: Size): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = size.width;
  canvas.height = size.height;
  const ctx = canvas.getContext('2d');
  if (!ctx) {  
    throw new Error('이미지 타일용 캔버스 컨텍스트를 생성할 수 없습니다.');  
  }  
  ctx.drawImage(image, 0, 0, size.width, size.height);
  return canvas;
}

function calculateCoverSize(imageSize: Size, containerSize: Size): Size {
  const imageRatio = imageSize.width / imageSize.height;
  const containerRatio = containerSize.width / containerSize.height;

  if (containerRatio > imageRatio) {
    return {
      width: containerSize.width,
      height: containerSize.width / imageRatio
    };
  } else {
    return {
      width: containerSize.height * imageRatio,
      height: containerSize.height
    };
  }
}

function calculateContainSize(imageSize: Size, containerSize: Size): Size {
  const imageRatio = imageSize.width / imageSize.height;
  const containerRatio = containerSize.width / containerSize.height;

  if (containerRatio > imageRatio) {
    return {
      width: containerSize.height * imageRatio,
      height: containerSize.height
    };
  } else {
    return {
      width: containerSize.width,
      height: containerSize.width / imageRatio
    };
  }
}

function parseBackgroundDimension(value: string, containerSize: number, originalSize: number): number {
  if (typeof value !== 'string') {  
    throw new Error('배경 크기는 문자열이어야 합니다.');  
  }  
  if (containerSize < 0 || originalSize < 0) {  
    throw new Error('컨테이너와 원본 크기는 0보다 커야 합니다.');  
  }  
  if (value === 'auto') return originalSize;
  if (value.endsWith('%')) return (containerSize * parseFloat(value)) / 100;
  const size = parseFloat(value);  
  if (isNaN(size)) {  
    throw new Error('유효하지 않은 크기 값입니다.');  
  }  
  return size;  
}

function parseBackgroundPosition(value: string, containerSize: number, imageSize: number): number {
  if (value.endsWith('%')) {
    return (containerSize - imageSize) * (parseFloat(value) / 100);
  }
  
  switch (value) {
    case 'left':
    case 'top':
      return 0;
    case 'right':
    case 'bottom':
      return containerSize - imageSize;
    case 'center':
      return (containerSize - imageSize) / 2;
    default:
      return parseFloat(value); // px 값 처리
  }
}
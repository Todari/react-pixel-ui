/**
 * 디바운스 함수
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

/**
 * Canvas에서 픽셀화 처리
 */
export function pixelateCanvasData(
  canvas: HTMLCanvasElement,
  unitPixel: number = 4
): HTMLCanvasElement {
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas context를 가져올 수 없습니다');

  const originalWidth = canvas.width;
  const originalHeight = canvas.height;
  
  // 작은 크기로 축소
  const smallWidth = Math.ceil(originalWidth / unitPixel);
  const smallHeight = Math.ceil(originalHeight / unitPixel);
  
  // 임시 캔버스 생성
  const tempCanvas = document.createElement('canvas');
  const tempCtx = tempCanvas.getContext('2d');
  if (!tempCtx) throw new Error('임시 Canvas context를 가져올 수 없습니다');
  
  tempCanvas.width = smallWidth;
  tempCanvas.height = smallHeight;
  
  // 축소된 크기로 그리기
  tempCtx.imageSmoothingEnabled = false;
  tempCtx.drawImage(canvas, 0, 0, smallWidth, smallHeight);
  
  // 원본 크기로 다시 확대
  ctx.imageSmoothingEnabled = false;
  ctx.clearRect(0, 0, originalWidth, originalHeight);
  ctx.drawImage(tempCanvas, 0, 0, originalWidth, originalHeight);
  
  return canvas;
}

/**
 * CSS Filter 기반 픽셀화 스타일 생성
 */
export function createCSSFilterPixelStyle(
  unitPixel: number = 4,
  smooth: boolean = false
): Record<string, string> {
  const scale = 1 / unitPixel;
  return {
    imageRendering: smooth ? 'auto' : 'pixelated',
    transform: `scale(${scale}) scale(${unitPixel})`,
    transformOrigin: 'top left',
    filter: smooth ? 'none' : `blur(0.5px) contrast(120%)`,
  };
}

/**
 * 요소의 실제 렌더링 크기 계산
 */
export function getElementRenderSize(element: HTMLElement): {
  width: number;
  height: number;
} {
  const rect = element.getBoundingClientRect();
  
  return {
    width: rect.width,
    height: rect.height,
  };
}

/**
 * 에러 처리 래퍼
 */
export function safeAsync<T>(
  asyncFn: () => Promise<T>,
  fallback: T,
  onError?: (error: Error) => void
): Promise<T> {
  return asyncFn().catch((error) => {
    if (onError) {
      onError(error instanceof Error ? error : new Error(String(error)));
    }
    return fallback;
  });
}
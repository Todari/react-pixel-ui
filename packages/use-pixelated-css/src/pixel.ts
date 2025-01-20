import { css } from "@emotion/react";

import { convertCSSUnitToPx } from "./cssUnit";

import type { SerializedStyles } from "@emotion/react";

interface PixelateParams {
  prevCss: SerializedStyles;
  ref: React.RefObject<HTMLElement>;
  unitPixel: number;
}

export const pixelate = ({ prevCss, ref, unitPixel }: PixelateParams) => {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx || !ref.current) {
    console.error('Canvas context or ref is not available');
    return prevCss;
  }

  canvas.width = ref.current.clientWidth;
  canvas.height = ref.current.clientHeight;

  const cssString = prevCss.styles;
  const backgroundMatch = /background:\s*([^;]+);/.exec(cssString);
  const borderMatch = /border:\s*([^;]+);/.exec(cssString);
  const borderRadiusMatch = /border-radius:\s*([^;]+);/.exec(cssString);
  
  const borderRadius = convertCSSUnitToPx(borderRadiusMatch?.[1] || '0', ref.current);
  const borderWidth = getBorderWidth(borderMatch, ref.current);

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (borderRadius > 0) {
    ctx.beginPath();
    const clipRadius = borderRadius;
    ctx.moveTo(clipRadius, 0);
    ctx.lineTo(canvas.width - clipRadius, 0);
    ctx.quadraticCurveTo(canvas.width, 0, canvas.width, clipRadius);
    ctx.lineTo(canvas.width, canvas.height - clipRadius);
    ctx.quadraticCurveTo(canvas.width, canvas.height, canvas.width - clipRadius, canvas.height);
    ctx.lineTo(clipRadius, canvas.height);
    ctx.quadraticCurveTo(0, canvas.height, 0, canvas.height - clipRadius);
    ctx.lineTo(0, clipRadius);
    ctx.quadraticCurveTo(0, 0, clipRadius, 0);
    ctx.closePath();
    ctx.clip();
  }

  drawBackground(ctx, ref.current, backgroundMatch, borderRadius);

  drawBorder(ctx, ref.current, borderMatch, borderRadius, borderWidth);

  const dataUrl = createPixelatedImage(ctx, canvas, ref.current, unitPixel);

  return css`
    ${prevCss}
    border:none;
    border-radius:0;
    background: url(${dataUrl});
    background-size: 100% 100%;
    image-rendering: pixelated;
  `;
}

function getBorderWidth(borderMatch: RegExpMatchArray | null, element: HTMLElement) {
  if (!borderMatch) return 0;
  
  const borderParts = borderMatch[1].split(/\s+/);
  return convertCSSUnitToPx(borderParts[0], element);
}

function drawBackground(ctx: CanvasRenderingContext2D, element: HTMLElement, backgroundMatch: RegExpMatchArray | null, borderRadius: number) {
  if (backgroundMatch) {
    const gradient = backgroundMatch[1];
    if (gradient.includes('linear-gradient')) {
      const gradientInfo = (/linear-gradient\((.*?)\)/.exec(gradient))?.[1];
      const linearGradient = createLinearGradient(ctx, element, gradientInfo);
      ctx.fillStyle = linearGradient;
    } else {
      ctx.fillStyle = backgroundMatch[1];
    }
    ctx.fillRect(0, 0, element.clientWidth, element.clientHeight);
  }
}

function createLinearGradient(ctx: CanvasRenderingContext2D, element: HTMLElement, gradientInfo: string | undefined) {
  let x0 = 0, y0 = 0, x1 = 0, y1 = element.clientHeight;
  if (gradientInfo) {
    const parts = gradientInfo.split(',');
    const direction = parts[0].trim();
    ({ x0, y0, x1, y1 } = calculateGradientDirection(element, direction));
    const linearGradient = ctx.createLinearGradient(x0, y0, x1, y1);
    addColorStops(linearGradient, parts.slice(1));
    return linearGradient;
  }
  return ctx.createLinearGradient(x0, y0, x1, y1);
}

function calculateGradientDirection(element: HTMLElement, direction: string) {
  let x0 = 0, y0 = 0, x1 = 0, y1 = element.clientHeight;
  if (direction.includes('to right')) {
    x1 = element.clientWidth;
    y1 = 0;
  } else if (direction.includes('to left')) {
    x0 = element.clientWidth;
    y0 = 0;
    x1 = 0;
    y1 = 0;
  } else if (direction.includes('to top')) {
    x1 = 0;
    y1 = 0;
  } else if (direction.includes('deg')) {
    const angle = parseInt(direction);
    const radian = (angle - 90) * Math.PI / 180;
    x1 = element.clientWidth * Math.cos(radian);
    y1 = element.clientHeight * Math.sin(radian);
  }
  return { x0, y0, x1, y1 };
}

function addColorStops(linearGradient: CanvasGradient, colorStops: string[]) {
  colorStops.forEach((stop, index) => {
    const colorInfo = stop.trim();
    const percentMatch = /(\d+)%/.exec(colorInfo);
    const color = colorInfo.replace(/\d+%/g, '').trim();
    const position = percentMatch ? parseInt(percentMatch[1]) / 100 : index / (colorStops.length - 1);
    linearGradient.addColorStop(position, color);
  });
}

function drawBorder(ctx: CanvasRenderingContext2D, element: HTMLElement, borderMatch: RegExpMatchArray | null, borderRadius: number, borderWidth: number) {
  if (borderMatch) {
    const borderParts = borderMatch[1].split(/\s+/);
    const borderColor = borderParts[borderParts.length - 1];
    ctx.strokeStyle = borderColor;
    ctx.lineWidth = borderWidth;
    if (borderRadius > 0 && borderColor !== 'none') {
      drawRoundedRect(ctx, element, borderRadius, borderWidth);
    } else {
      ctx.strokeRect(borderWidth / 2, borderWidth / 2, element.clientWidth - borderWidth, element.clientHeight - borderWidth);
    }
  }
}

function drawRoundedRect(ctx: CanvasRenderingContext2D, element: HTMLElement, borderRadius: number, borderWidth: number) {
  ctx.beginPath();
  ctx.moveTo(borderRadius + borderWidth / 2, borderWidth / 2);
  ctx.lineTo(element.clientWidth - borderRadius - borderWidth / 2, borderWidth / 2);
  ctx.quadraticCurveTo(element.clientWidth - borderWidth / 2, borderWidth / 2, element.clientWidth - borderWidth / 2, borderRadius + borderWidth / 2);
  ctx.lineTo(element.clientWidth - borderWidth / 2, element.clientHeight - borderRadius - borderWidth / 2);
  ctx.quadraticCurveTo(element.clientWidth - borderWidth / 2, element.clientHeight - borderWidth / 2, element.clientWidth - borderRadius - borderWidth / 2, element.clientHeight - borderWidth / 2);
  ctx.lineTo(borderRadius + borderWidth / 2, element.clientHeight - borderWidth / 2);
  ctx.quadraticCurveTo(borderWidth / 2, element.clientHeight - borderWidth / 2, borderWidth / 2, element.clientHeight - borderRadius - borderWidth / 2);
  ctx.lineTo(borderWidth / 2, borderRadius + borderWidth / 2);
  ctx.quadraticCurveTo(borderWidth / 2, borderWidth / 2, borderRadius + borderWidth / 2, borderWidth / 2);
  ctx.closePath();
  ctx.stroke();
}

function createPixelatedImage(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, element: HTMLElement, unitPixel: number) {
  const smallCanvas = document.createElement('canvas');
  const smallCtx = smallCanvas.getContext('2d');
  if (!smallCtx) {
    return '';
  }

  smallCanvas.width = Math.floor(element.clientWidth / unitPixel);
  smallCanvas.height = Math.floor(element.clientHeight / unitPixel);

  smallCtx.drawImage(
    canvas,
    0, 0, element.clientWidth, element.clientHeight,
    0, 0, smallCanvas.width, smallCanvas.height
  );

  ctx.imageSmoothingEnabled = false;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(
    smallCanvas,
    0, 0, smallCanvas.width, smallCanvas.height,
    0, 0, canvas.width, canvas.height
  );

  return canvas.toDataURL();
}
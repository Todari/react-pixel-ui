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
  try {
    return canvasToImage(canvas, prevCss, ref, unitPixel);
  } finally {
    canvas.remove();
  }  
}

const canvasToImage = (canvas: HTMLCanvasElement, prevCss: SerializedStyles, ref: React.RefObject<HTMLElement>, unitPixel: number) => {
  const ctx = canvas.getContext('2d');

  if (!ctx || !ref.current) {
    console.error('Canvas context or ref is not available');
    return prevCss;
  }
  canvas.width = Math.floor(ref.current.clientWidth / unitPixel);
  canvas.height = Math.floor(ref.current.clientHeight / unitPixel);

  const cssString = prevCss.styles;
  const backgroundMatch = /background:\s*([^;]+);/.exec(cssString);
  const borderMatch = /border:\s*([^;]+);/.exec(cssString);
  const borderRadiusMatch = /border-radius:\s*([^;]+);/.exec(cssString);
  
  const borderRadius = Math.floor(convertCSSUnitToPx(borderRadiusMatch?.[1] || '0', ref.current) / unitPixel);
  const borderWidth = Math.floor(getBorderWidth(borderMatch, ref.current, unitPixel) / unitPixel);

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  drawBorderRadiusMask(ctx, borderRadius);
  drawBackground(ctx, backgroundMatch);
  drawBorder(ctx, borderMatch, borderRadius, borderWidth);

  const dataUrl = createPixelatedImage(canvas, unitPixel);

  return css`
    ${prevCss}
    border:none;
    border-radius:0;
    background: url(${dataUrl});
    background-size: 100% 100%;
    image-rendering: pixelated;
  `;
}

function getBorderWidth(borderMatch: RegExpMatchArray | null, element: HTMLElement, unitPixel: number) {
  if (!borderMatch) return 0;
  
  const borderParts = borderMatch[1].split(/\s+/);
  const originWidth = convertCSSUnitToPx(borderParts[0], element);
  return Math.max(originWidth, unitPixel);
}

function drawBorderRadiusMask(ctx: CanvasRenderingContext2D, borderRadius: number) {
  if (borderRadius > 0) {
    ctx.beginPath();
    ctx.moveTo(borderRadius, 0);
    ctx.lineTo(ctx.canvas.width - borderRadius, 0);
    ctx.quadraticCurveTo(ctx.canvas.width, 0, ctx.canvas.width, borderRadius);
    ctx.lineTo(ctx.canvas.width, ctx.canvas.height - borderRadius);
    ctx.quadraticCurveTo(ctx.canvas.width, ctx.canvas.height, ctx.canvas.width - borderRadius, ctx.canvas.height);
    ctx.lineTo(borderRadius, ctx.canvas.height);
    ctx.quadraticCurveTo(0, ctx.canvas.height, 0, ctx.canvas.height - borderRadius);
    ctx.lineTo(0, borderRadius);
    ctx.quadraticCurveTo(0, 0, borderRadius, 0);
    ctx.closePath();
    ctx.clip();
  }
}

function drawBackground(ctx: CanvasRenderingContext2D, backgroundMatch: RegExpMatchArray | null) {
  if (backgroundMatch) {
    const gradient = backgroundMatch[1];
    if (gradient.includes('linear-gradient')) {
      const gradientInfo = (/linear-gradient\((.*?)\)/.exec(gradient))?.[1];
      const linearGradient = createLinearGradient(ctx, gradientInfo);
      ctx.fillStyle = linearGradient;
    } else {
      ctx.fillStyle = backgroundMatch[1];
    }
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  }
}

function drawBorder(ctx: CanvasRenderingContext2D, borderMatch: RegExpMatchArray | null, borderRadius: number, borderWidth: number) {
  if (!borderMatch) return;

  const borderParts = borderMatch[1].split(/\s+/);
  const borderColor = borderParts[borderParts.length - 1];
  
  if (borderRadius === 0 || borderColor === 'none') return;

  ctx.strokeStyle = borderColor;
  ctx.lineWidth = borderWidth;
  drawRoundedRect(ctx, borderRadius, borderWidth);
}

function drawRoundedRect(ctx: CanvasRenderingContext2D, borderRadius: number, borderWidth: number) {
  ctx.beginPath();
  ctx.moveTo(borderRadius + borderWidth / 2, borderWidth / 2);
  ctx.lineTo(ctx.canvas.width - borderRadius - borderWidth / 2, borderWidth / 2);
  ctx.quadraticCurveTo(ctx.canvas.width - borderWidth / 2, borderWidth / 2, ctx.canvas.width - borderWidth / 2, borderRadius + borderWidth / 2);
  ctx.lineTo(ctx.canvas.width - borderWidth / 2, ctx.canvas.height - borderRadius - borderWidth / 2);
  ctx.quadraticCurveTo(ctx.canvas.width - borderWidth / 2, ctx.canvas.height - borderWidth / 2, ctx.canvas.width - borderRadius - borderWidth / 2, ctx.canvas.height - borderWidth / 2);
  ctx.lineTo(borderRadius + borderWidth / 2, ctx.canvas.height - borderWidth / 2);
  ctx.quadraticCurveTo(borderWidth / 2, ctx.canvas.height - borderWidth / 2, borderWidth / 2, ctx.canvas.height - borderRadius - borderWidth / 2);
  ctx.lineTo(borderWidth / 2, borderRadius + borderWidth / 2);
  ctx.quadraticCurveTo(borderWidth / 2, borderWidth / 2, borderRadius + borderWidth / 2, borderWidth / 2);
  ctx.closePath();
  ctx.stroke();
}

function createLinearGradient(ctx: CanvasRenderingContext2D, gradientInfo: string | undefined) {
  let x0 = 0, y0 = 0, x1 = 0, y1 = ctx.canvas.height;
  if (gradientInfo) {
    const parts = gradientInfo.split(',');
    const direction = parts[0].trim();
    ({ x0, y0, x1, y1 } = calculateGradientDirection(ctx,  direction));
    const linearGradient = ctx.createLinearGradient(x0, y0, x1, y1);
    addColorStops(linearGradient, parts.slice(1));
    return linearGradient;
  }
  return ctx.createLinearGradient(x0, y0, x1, y1);
}

function calculateGradientDirection(ctx: CanvasRenderingContext2D, direction: string) {
  let x0 = 0, y0 = 0, x1 = 0, y1 = ctx.canvas.height;
  if (direction.includes('to right')) {
    x1 = ctx.canvas.width;
    y1 = 0;
  } else if (direction.includes('to left')) {
    x0 = ctx.canvas.width;
    y0 = 0;
    x1 = 0;
    y1 = 0;
  } else if (direction.includes('to top')) {
    x1 = 0;
    y1 = 0;
  } else if (direction.includes('deg')) {
    const angle = parseInt(direction);
    const radian = (angle - 90) * Math.PI / 180;
    x1 = ctx.canvas.width * Math.cos(radian);
    y1 = ctx.canvas.height * Math.sin(radian);
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

function createPixelatedImage(canvas: HTMLCanvasElement, unitPixel: number) {
  const extendCanvas = document.createElement('canvas');
  const extendCtx = extendCanvas.getContext('2d');
  if (!extendCtx) {
    return '';
  }

  extendCanvas.width = canvas.width * unitPixel;
  extendCanvas.height = canvas.height * unitPixel;

  extendCtx.imageSmoothingEnabled = false;
  extendCtx.drawImage(
    canvas,
    0, 0, canvas.width, canvas.height,
    0, 0, extendCanvas.width, extendCanvas.height
  );

  return extendCanvas.toDataURL();
}
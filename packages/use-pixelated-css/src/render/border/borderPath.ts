import { BorderRadius, BorderStyles } from "./border";

export function drawBorderPath(
  ctx: CanvasRenderingContext2D,
  borders: BorderStyles,
  radius: BorderRadius
) {
  const canvas = ctx.canvas;
  const width = canvas.width;
  const height = canvas.height;

  // 각 방향별로 border 그리기
  Object.entries(borders).forEach(([direction, border]) => {
    if (border.width <= 0 || border.style === 'none' || border.style === 'hidden') {
      return;
    }

    ctx.beginPath();
    ctx.strokeStyle = border.color;
    ctx.lineWidth = border.width;

    // border 스타일 설정
    switch (border.style) {
      case 'solid':
        ctx.setLineDash([]);
        break;
      case 'dashed':
        ctx.setLineDash([border.width * 3, border.width * 3]);
        break;
      case 'dotted':
        ctx.setLineDash([border.width, border.width]);
        break;
      default:
        ctx.setLineDash([]);
    }

    // border-radius 적용하여 경로 그리기
    const r = radius;
    const w = border.width / 2;

    switch(direction) {
      case 'top':
        ctx.moveTo(r.topLeft + w, w);
        ctx.lineTo(width - r.topRight - w, w);
        if (r.topRight > 0) {
          ctx.arcTo(width - w, w, width - w, r.topRight + w, r.topRight);
        }
        break;
      case 'right':
        ctx.moveTo(width - w, r.topRight + w);
        ctx.lineTo(width - w, height - r.bottomRight - w);
        if (r.bottomRight > 0) {
          ctx.arcTo(width - w, height - w, width - r.bottomRight - w, height - w, r.bottomRight);
        }
        break;
      case 'bottom':
        ctx.moveTo(width - r.bottomRight - w, height - w);
        ctx.lineTo(r.bottomLeft + w, height - w);
        if (r.bottomLeft > 0) {
          ctx.arcTo(w, height - w, w, height - r.bottomLeft - w, r.bottomLeft);
        }
        break;
      case 'left':
        ctx.moveTo(w, height - r.bottomLeft - w);
        ctx.lineTo(w, r.topLeft + w);
        if (r.topLeft > 0) {
          ctx.arcTo(w, w, r.topLeft + w, w, r.topLeft);
        }
        break;
    }

    ctx.stroke();
  });
}
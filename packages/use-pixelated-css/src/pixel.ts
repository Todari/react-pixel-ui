import { css, SerializedStyles } from "@emotion/react";
import { styleMap } from "./util/styles";
import { drawBorder } from "./render/border";
import { drawBackground } from "./render";
import { rectSize } from "./util/spacing";
import { applyBorderRadius } from "./render/clip/borderRadius";

interface Params{
  ref: React.RefObject<HTMLElement>;
  unitPixel: number;
}

export function pixelate({ref, unitPixel}: Params) : SerializedStyles {
  const styles = styleMap(ref);
  const canvas = document.createElement('canvas');
  console.log('styles', styles);

  const {contentWidth, contentHeight, border} = rectSize(styles, ref.current!);
  console.log('contentWidth', contentWidth, contentHeight);


  canvas.width = contentWidth / unitPixel;
  canvas.height = contentHeight / unitPixel;

  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('2D 컨텍스트를 초기화할 수 없습니다');
  ctx.imageSmoothingEnabled = false;

  applyBorderRadius({ctx, styles, element: ref.current!, unitPixel});

  drawBackground({styles, ctx, element: ref.current!, unitPixel});
  drawBorder({styles, ctx, element: ref.current!, unitPixel});

  console.log('canvasSize', canvas.width, canvas.height);
  console.log('clientSize', ref.current?.clientWidth, ref.current?.clientHeight);
  console.log('boundSize', ref.current?.getBoundingClientRect().width, ref.current?.getBoundingClientRect().height);

  return css`
    ${styles}
    position: relative;

    &::before {
      content: '';
      position: absolute;
      top: -${border.top}px;
      left: -${border.left}px;
      width: ${contentWidth}px;
      height: ${contentHeight}px;
      background-image: url(${canvas.toDataURL()});
      background-size: 100% 100%;
      image-rendering: pixelated;
      z-index: 1;
      pointer-events: none;
      transition: all 0s;
    }
  `;
}
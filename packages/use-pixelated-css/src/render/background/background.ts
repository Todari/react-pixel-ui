import { StyleMap } from "../../types/type";
import { parsePosition, parseSize } from "../../util/parse";
import { getCanvasBlendMode } from "./backgroundBlend";
import { drawBackgroundGradient } from "./backgroundGradient";
import { drawBackgroundImage } from "./backgroundImage";
import { applyClipPath } from "./backgroundClip";

interface Params {
  styleMap: StyleMap;
  ctx: CanvasRenderingContext2D;
  element: HTMLElement;
  unitPixel: number;
}   

export interface BackgroundLayer {
  color?: string;
  image?: string;
  position: [string, string];
  size: [string, string];
  repeat: string;
  attachment: string;
  origin: string;
  clip: string;
  blendMode: string;
}

function parseBackgroundLayers(styleMap: StyleMap): BackgroundLayer[] {
  const layers: BackgroundLayer[] = [];
  
  // 이미지 기준으로 레이어 생성
  const image = styleMap['background-image'] || 'none';
  
  // 단일 이미지인 경우 배열로 변환
  const images = Array.isArray(image) ? image : [image];
  
  images.forEach((image, i) => {
    layers.push({
      color: i === images.length - 1 ? styleMap['background-color']?.[0] : undefined,
      image: image === 'none' ? undefined : image,
      position: parsePosition(styleMap['background-position']?.[i] || '0% 0%'),
      size: parseSize(styleMap['background-size']?.[i] || 'auto'),
      repeat: styleMap['background-repeat']?.[i] || 'repeat',
      attachment: styleMap['background-attachment']?.[i] || 'scroll',
      origin: styleMap['background-origin']?.[i] || 'padding-box',
      clip: styleMap['background-clip']?.[i] || 'border-box',
      blendMode: styleMap['background-blend-mode']?.[i] || 'normal'
    });
  });

  return layers.reverse(); // 브라우저 렌더링 순서와 맞추기 위해 역순 정렬
}

export const drawBackground = ({styleMap, ctx, element, unitPixel}: Params) => {
  try {
    const layers = parseBackgroundLayers(styleMap);
    const canvas = ctx.canvas;

    // 1. 기본 배경색 설정
    if (!layers.length) {
      ctx.fillStyle = 'transparent';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      return;
    }

    // 2. 레이어 순서대로 그리기 (뒤에서 앞으로)
    layers.forEach((layer, index) => {
      // 새로운 캔버스 레이어 생성
      const layerCanvas = document.createElement('canvas');
      layerCanvas.width = canvas.width;
      layerCanvas.height = canvas.height;
      const layerCtx = layerCanvas.getContext('2d')!;

      // 배경색 처리
      if (layer.color) {
        layerCtx.fillStyle = layer.color;
        layerCtx.fillRect(0, 0, canvas.width, canvas.height);
      }

      // 배경 이미지 처리
      if (layer.image) {
        if (layer.image.startsWith('linear-gradient') || layer.image.startsWith('radial-gradient')) {
          drawBackgroundGradient({ctx: layerCtx, layer});
        } else {
          drawBackgroundImage({ctx: layerCtx, layer });
        }
      }

      // 클리핑 처리
      if (layer.clip === 'padding-box' || layer.clip === 'content-box') {
        applyClipPath(layerCtx, layer.clip, styleMap, element, unitPixel);
      }

      // 블렌드 모드 적용
      ctx.globalCompositeOperation = getCanvasBlendMode(layer.blendMode);
      
      // 최종 레이어 합성
      ctx.drawImage(layerCanvas, 0, 0);
    });

  } catch (error) {
    console.error('배경 렌더링 중 오류 발생:', error);
    return null;
  }
};
import { StyleMap } from "../../type";
import { parsePosition, parseSize } from "../../util/parse";
import { getCanvasBlendMode } from "./backgroundBlend";
import { drawBackgroundGradient } from "./backgroundGradient";
import { drawBackgroundImage } from "./backgroundImage";
import { applyClipPath } from "./backgroundClip";

interface Params {
  styleMap: StyleMap;
  ctx: CanvasRenderingContext2D;
  ref: HTMLElement;
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
  
  // 각 속성 배열 가져오기
  const colors = styleMap['background-color'] || [];
  const images = styleMap['background-image'] || [];
  const positions = styleMap['background-position'] || [];
  const sizes = styleMap['background-size'] || [];
  const repeats = styleMap['background-repeat'] || [];
  const attachments = styleMap['background-attachment'] || [];
  const origins = styleMap['background-origin'] || [];
  const clips = styleMap['background-clip'] || [];
  const blendModes = styleMap['background-blend-mode'] || [];

  // 가장 긴 배열 길이 찾기
  const maxLength = Math.max(
    images.length,
    positions.length,
    sizes.length,
    repeats.length,
    attachments.length,
    origins.length,
    clips.length,
    blendModes.length
  );

  // 레이어 구성
  for (let i = 0; i < maxLength; i++) {
    layers.push({
      color: i === 0 ? colors[0] : undefined,
      image: images[i % images.length],
      position: parsePosition(positions[i % positions.length]),
      size: parseSize(sizes[i % sizes.length]),
      repeat: repeats[i % repeats.length] || 'repeat',
      attachment: attachments[i % attachments.length] || 'scroll',
      origin: origins[i % origins.length] || 'padding-box',
      clip: clips[i % clips.length] || 'border-box',
      blendMode: blendModes[i % blendModes.length] || 'normal'
    });
  }

  return layers;
}

export const drawBackground = ({styleMap, ctx, ref, unitPixel}: Params) => {
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
        applyClipPath(layerCtx, layer.clip, styleMap, ref, unitPixel);
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
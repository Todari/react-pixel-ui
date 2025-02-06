import { StyleMap } from "../../types/type";
import { parsePosition, parseSize } from "../../util/parse";
import { getCanvasBlendMode } from "./backgroundBlend";
import { drawBackgroundGradient } from "./backgroundGradient";
import { drawBackgroundImage } from "./backgroundImage";

interface Params {
  styles: StyleMap;
  ctx: CanvasRenderingContext2D;
  element: HTMLElement;
  unitPixel: number;
}   

export interface Background {
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

function parseBackground(styles: StyleMap): Background {
  if (!styles || typeof styles !== 'object') {  
    throw new Error('유효하지 않은 styles 객체입니다.');  
  }  
  // 이미지 기준으로 레이어 생성
  const image = styles['background-image'] || 'none';
  
  return {
    color: styles['background-color'],
    image: image && image !== 'none' ? image : undefined, 
    position: parsePosition(styles['background-position'] || '0% 0%'),
    size: parseSize(styles['background-size'] || 'auto'),
    repeat: styles['background-repeat'] || 'repeat',
    attachment: styles['background-attachment'] || 'scroll',
    origin: styles['background-origin'] || 'padding-box',
    clip: styles['background-clip'] || 'border-box',
    blendMode: styles['background-blend-mode'] || 'normal'
  };
}

export const drawBackground = ({styles, ctx, element, unitPixel}: Params) => {
  if (!ctx) {  
    console.error('유효하지 않은 캔버스 컨텍스트입니다.');  
    return null;  
  }  

  try {
    const background = parseBackground(styles);
    const canvas = ctx.canvas;

    // 1. 기본 배경색 설정
    if (!background.color) {
      ctx.fillStyle = 'transparent';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      return;
    }

    // 2. 레이어 순서대로 그리기 (뒤에서 앞으로)
    if (background.image) {
      // 새로운 캔버스 레이어 생성
      const layerCanvas = document.createElement('canvas');
      layerCanvas.width = canvas.width;
      layerCanvas.height = canvas.height;
      const layerCtx = layerCanvas.getContext('2d')!;

      if (!layerCtx) {  
        throw new Error('레이어 캔버스 컨텍스트를 생성할 수 없습니다.');  
      }  

      // 배경색 처리
      if (background.color) {
        layerCtx.fillStyle = background.color;
        layerCtx.fillRect(0, 0, canvas.width, canvas.height);
      }

      // 배경 이미지 처리
      if (background.image) {
        if (background.image.startsWith('linear-gradient') || background.image.startsWith('radial-gradient')) {
          drawBackgroundGradient({ctx: layerCtx, background});
        } else {
          drawBackgroundImage({ctx: layerCtx, background });
        }
      }

      // 클리핑 처리
      // if (background.clip === 'padding-box' || background.clip === 'content-box') {
      //   applyClipPath(layerCtx, background.clip, styleMap, element, unitPixel);
      // }

      // 블렌드 모드 적용
      ctx.globalCompositeOperation = getCanvasBlendMode(background.blendMode);
      
      // 최종 레이어 합성
      ctx.drawImage(layerCanvas, 0, 0);

      // 메모리 해제를 위해 임시 캔버스 참조 제거  
      layerCanvas.width = 0;  
      layerCanvas.height = 0;  
    }

  } catch (error) {
    if (error instanceof Error) {  
      console.error('배경 렌더링 중 오류 발생:', error.message);  
    } else {  
      console.error('알 수 없는 오류 발생');  
    }  
    return null;
  }
};
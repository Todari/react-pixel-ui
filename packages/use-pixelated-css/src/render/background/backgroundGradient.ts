import { BackgroundLayer } from "./background";

interface BackgroundGradientParams {
  ctx: CanvasRenderingContext2D;
  layer: BackgroundLayer;
}

export function drawBackgroundGradient({ ctx, layer }: BackgroundGradientParams) {
  const gradientString = layer.image!;
  const canvas = ctx.canvas;

  if (gradientString.includes('linear-gradient')) {
    drawLinearGradient(ctx, gradientString);
  } else if (gradientString.includes('radial-gradient')) {
    drawRadialGradient(ctx, gradientString); 
  }

  // 그라디언트로 캔버스 채우기
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}

// 선형 그라디언트 그리기
  function drawLinearGradient(ctx: CanvasRenderingContext2D, gradientString: string) {
  const canvas = ctx.canvas;
  const linearMatch = gradientString.match(/linear-gradient\((.*)\)/);
  
  if (linearMatch) {
    // 파라미터 파싱
    const params = linearMatch[1].split(/,(?![^(]*\))/);
    
    // 각도 파싱
    let angle = 180; // 기본값은 to bottom (180도)
    const firstParam = params[0].trim();
    
    if (firstParam.includes('deg')) {
      angle = parseFloat(firstParam);
    } else if (firstParam.startsWith('to')) {
      angle = getAngleFromDirection(firstParam);
    }

    // 색상 파싱
    const colorParams = firstParam.includes('deg') || firstParam.startsWith('to') ? 
      params.slice(1) : params;
      
    const colors = colorParams.map(color => {
      const [colorValue, stop] = color.trim().split(/\s+(?=\d+%)/);
      return {
        color: colorValue.trim(),
        stop: stop ? parseInt(stop) / 100 : null
      };
    });

    // 그라디언트 생성
    const angleRad = (angle - 90) * (Math.PI / 180);
    const gradient = ctx.createLinearGradient(
      canvas.width / 2 - Math.cos(angleRad) * canvas.width / 2,
      canvas.height / 2 - Math.sin(angleRad) * canvas.height / 2,
      canvas.width / 2 + Math.cos(angleRad) * canvas.width / 2,
      canvas.height / 2 + Math.sin(angleRad) * canvas.height / 2
    );

    // 색상 스톱 추가
    colors.forEach((color, index) => {
      const stop = color.stop !== null ? color.stop : index / (colors.length - 1);
      gradient.addColorStop(stop, color.color);
    });

    ctx.fillStyle = gradient;
  }
}

// 방사형 그라디언트 그리기
function drawRadialGradient(ctx: CanvasRenderingContext2D, gradientString: string) {
  const canvas = ctx.canvas;
  const radialMatch = gradientString.match(/radial-gradient\((.*)\)/);
  
  if (radialMatch) {
    // 파라미터 파싱
    const params = radialMatch[1].split(/,(?![^(]*\))/);
    
    // 첫 번째 파라미터에서 모양과 크기 파싱
    const shapeParam = params[0].trim();
    let shape = 'ellipse';
    let size = 'farthest-corner';
    let position = { x: canvas.width / 2, y: canvas.height / 2 };

    if (shapeParam.includes('circle') || shapeParam.includes('ellipse')) {
      const shapeMatch = shapeParam.match(/(circle|ellipse)/);
      if (shapeMatch) shape = shapeMatch[1];

      const sizeMatch = shapeParam.match(/(closest-side|closest-corner|farthest-side|farthest-corner)/);
      if (sizeMatch) size = sizeMatch[1];

      const posMatch = shapeParam.match(/at\s+([^)]+)/);
      if (posMatch) {
        const [x, y] = posMatch[1].trim().split(/\s+/);
        position = parseGradientPosition(x, y, canvas.width, canvas.height);
      }
    }

    // 반지름 계산
    let radiusX, radiusY;
    switch (size) {
      case 'closest-side':
        radiusX = Math.min(position.x, canvas.width - position.x);
        radiusY = Math.min(position.y, canvas.height - position.y);
        break;
      case 'farthest-side':
        radiusX = Math.max(position.x, canvas.width - position.x);
        radiusY = Math.max(position.y, canvas.height - position.y);
        break;
      case 'closest-corner':
        radiusX = radiusY = Math.min(
          Math.hypot(position.x, position.y),
          Math.hypot(canvas.width - position.x, position.y),
          Math.hypot(position.x, canvas.height - position.y),
          Math.hypot(canvas.width - position.x, canvas.height - position.y)
        );
        break;
      case 'farthest-corner':
      default:
        radiusX = radiusY = Math.max(
          Math.hypot(position.x, position.y),
          Math.hypot(canvas.width - position.x, position.y),
          Math.hypot(position.x, canvas.height - position.y),
          Math.hypot(canvas.width - position.x, canvas.height - position.y)
        );
        break;
    }

    if (shape === 'circle') {
      radiusX = radiusY = Math.min(radiusX, radiusY);
    }

    // 색상 파싱
    const colorParams = shapeParam.includes('at') ? params.slice(1) : params;
    const colors = colorParams.map(color => {
      const [colorValue, stop] = color.trim().split(/\s+(?=\d+%)/);
      return {
        color: colorValue.trim(),
        stop: stop ? parseInt(stop) / 100 : null
      };
    });

    // 그라디언트 생성
    const gradient = ctx.createRadialGradient(
      position.x, position.y, 0,
      position.x, position.y, Math.max(radiusX, radiusY)
    );

    // 색상 스톱 추가
    colors.forEach((color, index) => {
      const stop = color.stop !== null ? color.stop : index / (colors.length - 1);
      gradient.addColorStop(stop, color.color);
    });

    ctx.fillStyle = gradient;
  }
}

// 방향 키워드를 각도로 변환하는 헬퍼 함수
function getAngleFromDirection(direction: string): number {
  const directionMap: Record<string, number> = {
    'to top': 0,
    'to right': 90,
    'to bottom': 180,
    'to left': 270,
    'to top right': 45,
    'to bottom right': 135,
    'to bottom left': 225,
    'to top left': 315
  };
  
  return directionMap[direction.trim()] || 180;
}

// 그라디언트 위치 파싱 헬퍼 함수
function parseGradientPosition(x: string, y: string, width: number, height: number) {
  const parseValue = (value: string, size: number) => {
    if (value.endsWith('%')) {
      return (size * parseFloat(value)) / 100;
    }
    switch (value) {
      case 'left': return 0;
      case 'center': return size / 2;
      case 'right': return size;
      case 'top': return 0;
      case 'bottom': return size;
      default: return parseFloat(value);
    }
  };

  return {
    x: parseValue(x, width),
    y: parseValue(y, height)
  };
}

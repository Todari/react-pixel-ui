interface BorderImageParams {
  source: string;
  slice: number[];    // top, right, bottom, left
  width: number[];    // top, right, bottom, left
  outset: number[];   // top, right, bottom, left
  repeat: string;     // stretch | repeat | round | space
}

function drawBorderImage(
  ctx: CanvasRenderingContext2D, 
  borderImage: BorderImageParams, 
  unitPixel: number
) {
  const canvas = ctx.canvas;
  const image = new Image();
  image.src = borderImage.source;

  return new Promise((resolve) => {
    image.onload = () => {
      // 1. 이미지를 9개 영역으로 분할
      const slices = computeSlices(image, borderImage.slice);
      
      // 2. 각 영역의 크기 계산
      const areas = computeAreas(canvas, borderImage.width, unitPixel);
      
      // 3. 각 영역 그리기
      drawImageSlices(ctx, image, slices, areas, borderImage.repeat);
      
      resolve(true);
    };

    image.onerror = () => {
      console.error('Border image loading failed');
      resolve(false);
    };
  });
}

interface Slice {
  sx: number; // source x
  sy: number; // source y
  sw: number; // source width
  sh: number; // source height
}

interface Area {
  dx: number; // destination x
  dy: number; // destination y
  dw: number; // destination width
  dh: number; // destination height
}

function computeSlices(image: HTMLImageElement, sliceValues: number[]): Slice[] {
  const [top, right, bottom, left] = sliceValues;
  const slices: Slice[] = [];
  
  // 모서리 영역
  slices.push(
    // top-left
    {
      sx: 0,
      sy: 0,
      sw: left,
      sh: top
    },
    // top-right
    {
      sx: image.width - right,
      sy: 0,
      sw: right,
      sh: top
    },
    // bottom-right
    {
      sx: image.width - right,
      sy: image.height - bottom,
      sw: right,
      sh: bottom
    },
    // bottom-left
    {
      sx: 0,
      sy: image.height - bottom,
      sw: left,
      sh: bottom
    }
  );

  // 가장자리 영역
  slices.push(
    // top
    {
      sx: left,
      sy: 0,
      sw: image.width - left - right,
      sh: top
    },
    // right
    {
      sx: image.width - right,
      sy: top,
      sw: right,
      sh: image.height - top - bottom
    },
    // bottom
    {
      sx: left,
      sy: image.height - bottom,
      sw: image.width - left - right,
      sh: bottom
    },
    // left
    {
      sx: 0,
      sy: top,
      sw: left,
      sh: image.height - top - bottom
    }
  );

  // 중앙 영역
  slices.push({
    sx: left,
    sy: top,
    sw: image.width - left - right,
    sh: image.height - top - bottom
  });

  return slices;
}

function computeAreas(
  canvas: HTMLCanvasElement, 
  widthValues: number[], 
  unitPixel: number
): Area[] {
  const [top, right, bottom, left] = widthValues;
  const areas: Area[] = [];
  
  // 픽셀 단위로 변환
  const borderWidths = {
    top: top / unitPixel,
    right: right / unitPixel,
    bottom: bottom / unitPixel,
    left: left / unitPixel
  };

  // 모서리 영역
  areas.push(
    // top-left
    {
      dx: 0,
      dy: 0,
      dw: borderWidths.left,
      dh: borderWidths.top
    },
    // top-right
    {
      dx: canvas.width - borderWidths.right,
      dy: 0,
      dw: borderWidths.right,
      dh: borderWidths.top
    },
    // bottom-right
    {
      dx: canvas.width - borderWidths.right,
      dy: canvas.height - borderWidths.bottom,
      dw: borderWidths.right,
      dh: borderWidths.bottom
    },
    // bottom-left
    {
      dx: 0,
      dy: canvas.height - borderWidths.bottom,
      dw: borderWidths.left,
      dh: borderWidths.bottom
    }
  );

  // 가장자리 영역
  areas.push(
    // top
    {
      dx: borderWidths.left,
      dy: 0,
      dw: canvas.width - borderWidths.left - borderWidths.right,
      dh: borderWidths.top
    },
    // right
    {
      dx: canvas.width - borderWidths.right,
      dy: borderWidths.top,
      dw: borderWidths.right,
      dh: canvas.height - borderWidths.top - borderWidths.bottom
    },
    // bottom
    {
      dx: borderWidths.left,
      dy: canvas.height - borderWidths.bottom,
      dw: canvas.width - borderWidths.left - borderWidths.right,
      dh: borderWidths.bottom
    },
    // left
    {
      dx: 0,
      dy: borderWidths.top,
      dw: borderWidths.left,
      dh: canvas.height - borderWidths.top - borderWidths.bottom
    }
  );

  // 중앙 영역
  areas.push({
    dx: borderWidths.left,
    dy: borderWidths.top,
    dw: canvas.width - borderWidths.left - borderWidths.right,
    dh: canvas.height - borderWidths.top - borderWidths.bottom
  });

  return areas;
}

function drawImageSlices(
  ctx: CanvasRenderingContext2D,
  image: HTMLImageElement,
  slices: Slice[],
  areas: Area[],
  repeat: string
) {
  slices.forEach((slice, index) => {
    const area = areas[index];
    
    switch(repeat) {
      case 'stretch':
        ctx.drawImage(
          image,
          slice.sx, slice.sy, slice.sw, slice.sh,
          area.dx, area.dy, area.dw, area.dh
        );
        break;
        
      case 'repeat':
        drawRepeatedSlice(ctx, image, slice, area);
        break;
        
      case 'round':
        drawRoundedSlice(ctx, image, slice, area);
        break;
        
      case 'space':
        drawSpacedSlice(ctx, image, slice, area);
        break;
    }
  });
}

function drawRepeatedSlice(
  ctx: CanvasRenderingContext2D,
  image: HTMLImageElement,
  slice: Slice,
  area: Area
) {
  const pattern = ctx.createPattern(
    createSliceCanvas(image, slice),
    'repeat'
  );
  if (pattern) {
    ctx.save();
    ctx.beginPath();
    ctx.rect(area.dx, area.dy, area.dw, area.dh);
    ctx.fillStyle = pattern;
    ctx.fill();
    ctx.restore();
  }
}

// 헬퍼 함수들...
function createSliceCanvas(image: HTMLImageElement, slice: Slice): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = slice.sw;
  canvas.height = slice.sh;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.drawImage(
      image,
      slice.sx, slice.sy, slice.sw, slice.sh,
      0, 0, slice.sw, slice.sh
    );
  }
  return canvas;
}
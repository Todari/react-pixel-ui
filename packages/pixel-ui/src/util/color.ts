export const hexToRgb = (hex: string) => {
  hex = hex.slice(1);
  if (hex.length === 3) {
    hex = hex
      .split('')
      .reduce<string[]>((acc, a) => {
        acc.push(a + a);
        return acc;
      }, [])
      .join('');
  }

  if (hex.length !== 6) {
    throw new Error(`잘못된 색상값이 입력됐습니다. : ${hex} 3자리(#fff), 6자리(#fe0000)hex 값만 입력 가능합니다.`);
  }

  const regex = new RegExp(`.{1,2}`, 'g');
  const hexArray = hex.match(regex) as string[];

  return `rgb(${hexArray.map(n => parseInt(n, 16)).join(', ')})`;
};

export const rgbToColors = (rgb: string) => {
  if (rgb.slice(0, 3) !== 'rgb') {
    throw new Error('잘못된 색상값이 입력됐습니다. rgb() 값만 입력 가능합니다.');
  }

  return rgb
    .slice(4, -1)
    .split(',')
    .map(a => Number(a.trim()));
};

export const hexToColors = (hex: string) => {
  return rgbToColors(hexToRgb(hex));
};

function intToHex(int: number) {
  const hex = int.toString(16);
  return hex.length === 1 ? `0${hex}` : hex;
}

export const colorsToRgb = (colors: number[]) => {
  return `rgb(${colors.join(', ')})`;
};

export const rgbToHex = (rgb: string) => {
  const colors = rgbToColors(rgb);
  return `#${colors.map((n, i) => intToHex(i === 3 ? Math.round(255 * n) : n)).join('')}`;
};

export const colorsToHex = (colors: number[]) => {
  return rgbToHex(colorsToRgb(colors));
};

export const setDarker = (hex: string, coefficient: number) => {
  const colors = hexToColors(hex);
  const adjustCoefficient = coefficient > 1 ? 1 : coefficient < 0 ? 0 : coefficient;
  const darkerColors = colors.map(color => {
    // 어두운 색상은 HSL 색상 공간에서 밝기(Lightness)를 줄이는 방식으로 계산
    const hslColor = rgbToHsl(color, color, color);
    const newLightness = hslColor[2] * (1 - adjustCoefficient);
    const rgb = hslToRgb(hslColor[0], hslColor[1], newLightness);
    return Math.round(rgb[0]);
  });

  return colorsToHex(darkerColors);
};

export const setLighter = (hex: string, coefficient: number) => {
  const colors = hexToColors(hex);
  const adjustCoefficient = coefficient > 1 ? 1 : coefficient < 0 ? 0 : coefficient;
  const lighterColors = colors.map(color => {
    // 밝은 색상은 HSL 색상 공간에서 채도(Saturation)를 유지하면서 밝기만 증가
    const hslColor = rgbToHsl(color, color, color);
    const newLightness = hslColor[2] + (1 - hslColor[2]) * adjustCoefficient;
    const rgb = hslToRgb(hslColor[0], hslColor[1], newLightness);
    return Math.round(rgb[0]);
  });

  return colorsToHex(lighterColors);
};

function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  r /= 255;
  g /= 255;
  b /= 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0, s = 0, l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }

  return [h, s, l];
}

function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  let r, g, b;

  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    };

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;

    r = hue2rgb(p, q, h + 1/3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1/3);
  }

  return [r * 255, g * 255, b * 255];
}

export const getLuminance = (hex: string) => {
  const colors = hexToColors(hex);
  const values = colors.map(color => {
    const value = color / 255;
    return value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
  });

  return Number((0.2126 * values[0] + 0.7152 * values[1] + 0.0722 * values[2]).toFixed(3));
};

export const setEmphasize = (hex: string, threshold: number, coefficient = 0.15) => {
  return getLuminance(hex) > threshold ? setDarker(hex, coefficient) : setLighter(hex, coefficient);
};

export const setOnTextColor = (hex: string, threshold: number, blackHex: string, whiteHex: string) => {
  return getLuminance(hex) > threshold ? blackHex : whiteHex;
};

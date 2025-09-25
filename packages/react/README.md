# @react-pixel-ui/react

React에서 CSS를 픽셀화된 배경으로 렌더링하는 훅과 유틸을 제공합니다.

## 설치

```bash
pnpm add @react-pixel-ui/react
```

## 빠른 시작

```tsx
import { usePixelCSS } from '@react-pixel-ui/react';

export default function Example() {
  const { pixelStyle } = usePixelCSS(`
    background: linear-gradient(45deg, #667eea, #764ba2);
    border: 2px solid #333;
    border-radius: 12px;
    padding: 16px;
  `, { width: 240, height: 120, pixelSize: 6 });

  return <div style={pixelStyle}>Hello</div>;
}
```

## API

### usePixelCSS

```ts
function usePixelCSS(
  css: string,
  options?: { width?: number; height?: number; pixelSize?: number }
): {
  backgroundImage: string;
  textStyle: React.CSSProperties;
  containerStyle: React.CSSProperties;
  pixelStyle: React.CSSProperties;
}
```

반환된 `pixelStyle`은 컨테이너와 텍스트 스타일을 합친 값으로, 그대로 `style`에 바인딩해 사용할 수 있습니다.

### usePixelPreset

프리셋(`button` | `card` | `badge`)을 빠르게 적용하는 훅입니다.

```tsx
import { usePixelPreset } from '@react-pixel-ui/react';

const style = usePixelPreset('button', undefined, { width: 200, height: 64, pixelSize: 4 });
```

## SSR/Next.js 안내

이 패키지는 Canvas 및 `window`/`document`에 의존합니다. SSR 환경에서는 클라이언트 전용으로 로드하거나 `dynamic(() => import(...), { ssr: false })`를 사용하세요.

## 라이선스

MIT



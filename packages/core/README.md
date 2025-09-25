# @react-pixel-ui/core

픽셀화 렌더링의 코어 로직을 제공합니다. React 없이도 사용할 수 있는 순수 브라우저 API입니다.

> 주의: 내부적으로 Canvas, `document`, `window`에 의존하므로 브라우저 환경에서만 동작합니다.

## 설치

```bash
pnpm add @react-pixel-ui/core
```

## API 개요

### pixelizeCSS(css, options)

```ts
import { pixelizeCSS } from '@react-pixel-ui/core';

const result = pixelizeCSS(`
  background: linear-gradient(45deg, #ff6b6b, #4ecdc4);
  border: 2px solid #333;
  border-radius: 12px;
`, { width: 240, height: 120, pixelSize: 4 });

// result: { backgroundImage, textStyle, containerStyle }
```

### createPixelizedStyle(css, width?, height?, pixelSize?)

컨테이너와 텍스트 스타일을 합친 `CSSProperties` 유사 객체를 반환합니다.

```ts
import { createPixelizedStyle } from '@react-pixel-ui/core';

const style = createPixelizedStyle('background: #333;', 200, 100, 4);
```

### pixelizeCSSProperties(cssProps, options)

React `CSSProperties` 형태를 받아 픽셀화합니다.

```ts
import { pixelizeCSSProperties } from '@react-pixel-ui/core';

const style = pixelizeCSSProperties({
  background: 'linear-gradient(90deg, #667eea, #764ba2)',
  border: '2px solid #333',
  borderRadius: '12px'
}, { width: 240, height: 120, pixelSize: 4 });
```

## 브라우저 전용 안내

`renderPixelatedBackground`는 Canvas를 생성하므로 Node.js 환경에서 사용할 수 없습니다. SSR 프레임워크에서는 클라이언트 사이드에서만 호출되도록 보호하세요.

## 라이선스

MIT



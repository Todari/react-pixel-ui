# React Pixel UI

CSS를 픽셀 스타일로 변환해주는 React 훅/코어 라이브러리입니다. 배경은 픽셀화하고 텍스트는 선명하게 유지합니다.

## 🚀 특징

- **간단한 훅**: `usePixelCSS(css, { width, height, pixelSize })`
- **브라우저 Canvas 기반**: 고품질 픽셀화 배경 데이터 URL 생성
- **TypeScript 지원**: 엄격한 타입과 DX

## 📦 설치

```bash
pnpm add @react-pixel-ui/react
# 또는
npm i @react-pixel-ui/react
```

## 🎯 빠른 시작

```tsx
import { usePixelCSS } from '@react-pixel-ui/react';

export default function Card() {
  const { pixelStyle } = usePixelCSS(`
    background: linear-gradient(45deg, #ff6b6b, #4ecdc4);
    border: 2px solid #333;
    border-radius: 12px;
    padding: 16px;
  `, { width: 260, height: 120, pixelSize: 6 });

  return <div style={pixelStyle}>Pixelated Content</div>;
}
```

## 📚 API

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

- **css**: 픽셀화할 CSS 문자열
- **options.width/height**: 컨테이너 크기(px). 미지정 시 기본값(300×150)
- **options.pixelSize**: 픽셀 블록 크기. 기본 4
- 반환된 **pixelStyle**을 그대로 `style`에 바인딩하면 됩니다.

## 🧭 환경/SSR 가이드 (Next.js 등)

- 내부적으로 Canvas와 `document`/`window`를 사용합니다. 서버 사이드 렌더링(SSR)에서는 클라이언트에서만 실행되도록 보호하세요.
- Next.js 예시: 클라이언트 전용 컴포넌트로 분리하거나 `dynamic(() => import(...), { ssr: false })`를 사용하세요.

## 🏗️ 프로젝트 구조

```
react-pixel-ui/
├── packages/
│   ├── core/   # 코어 픽셀화 로직 (브라우저 전용 API 포함)
│   └── react/  # React 훅 래퍼
└── apps/
    └── demo/   # 데모 앱
```

## 🛠️ 개발

```bash
# 초기셋업
pnpm setup

# 데모 실행
pnpm dev --filter=@react-pixel-ui/demo

# 전체 빌드/검증
pnpm build && pnpm type-check && pnpm lint
```

## 🎨 추가 예시

```tsx
const { pixelStyle } = usePixelCSS(`
  background: radial-gradient(circle, #ff6b6b, #4ecdc4);
  border: 1px solid #666;
  border-radius: 20px;
  padding: 24px;
  color: white;
`, { width: 200, height: 100, pixelSize: 4 });
```

## 🤝 기여

PR 환영합니다. 브랜치를 생성해 변경 후 PR을 올려주세요.

## 📄 라이선스

MIT
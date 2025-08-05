# React Pixel UI

CSS를 pixel화하여 사용할 수 있는 React 라이브러리입니다.

## 🚀 주요 기능

- **간단한 API**: `usePixelCSS(css)` 형태의 직관적인 사용법
- **실시간 렌더링**: CSS 변경 시 자동으로 pixel화된 스타일 적용
- **Canvas 기반**: 고품질의 pixel화된 이미지 생성
- **TypeScript 지원**: 완전한 타입 안정성 제공

## 📦 설치

```bash
npm install @react-pixel-ui/react
# 또는
yarn add @react-pixel-ui/react
# 또는
pnpm add @react-pixel-ui/react
```

## 🎯 사용법

### 기본 사용법

```tsx
import { usePixelCSS } from '@react-pixel-ui/react';

function MyComponent() {
  const pixelCSS = usePixelCSS(`
    background: linear-gradient(45deg, #ff0000, #00ff00);
    border: 2px solid #000;
    border-radius: 8px;
    padding: 16px;
  `);
  
  return <div style={pixelCSS}>Pixelated Content</div>;
}
```

### 옵션과 함께 사용

```tsx
const pixelCSS = usePixelCSS(css, {
  unitPixel: 4,        // pixel 크기 (기본값: 4)
  quality: 'medium',    // 렌더링 품질: 'low' | 'medium' | 'high'
  smooth: false         // 부드러운 렌더링 여부 (기본값: false)
});
```

### Provider와 함께 사용

```tsx
import { PixelCSSProvider } from '@react-pixel-ui/react';

function App() {
  return (
    <PixelCSSProvider defaultOptions={{ unitPixel: 6, smooth: true }}>
      <MyComponent />
    </PixelCSSProvider>
  );
}
```

## 🏗️ 프로젝트 구조

```
react-pixel-ui/
├── packages/
│   ├── core/           # 핵심 pixel화 로직
│   ├── react/          # React 훅과 컴포넌트
│   └── demo/           # 데모 앱
├── apps/
│   └── storybook/      # 스토리북
└── package.json
```

## 🛠️ 개발

### 프로젝트 설정

```bash
# 처음 설정 (의존성 설치 + 설정 동기화 + 빌드)
pnpm setup

# 설정만 업데이트
pnpm config:update

# 설정 동기화 (설정 업데이트 + 의존성 설치 + 타입 체크)
pnpm config:sync
```

### 개발 서버 실행

```bash
# 데모 앱 실행
pnpm dev --filter=demo

# 스토리북 실행
pnpm storybook --filter=storybook
```

### 빌드 및 검증

```bash
# 전체 프로젝트 빌드
pnpm build

# 타입 체크
pnpm type-check

# 린트 검사
pnpm lint

# 린트 자동 수정
pnpm lint:fix

# 코드 포맷팅
pnpm format
```

### 설정 관리

이 프로젝트는 중앙집중식 설정 관리를 사용합니다:

- **TypeScript 설정**: `packages/typescript-config/`
- **ESLint 설정**: `packages/eslint-config/`
- **설정 동기화**: `scripts/update-configs.js`

설정을 변경한 후에는 다음 명령어로 전체 프로젝트에 적용하세요:

```bash
pnpm config:update
```

## 📚 API 문서

### usePixelCSS

CSS 문자열을 pixel화된 스타일로 변환하는 React 훅입니다.

```tsx
function usePixelCSS(
  css: string,
  options?: PixelOptions
): React.CSSProperties
```

#### 매개변수

- `css` (string): pixel화할 CSS 문자열
- `options` (PixelOptions, 선택사항): pixel화 옵션

#### 반환값

- `React.CSSProperties`: pixel화된 스타일 객체

### PixelOptions

```tsx
interface PixelOptions {
  unitPixel?: number;     // pixel 크기 (기본값: 4)
  quality?: 'low' | 'medium' | 'high';  // 렌더링 품질 (기본값: 'medium')
  smooth?: boolean;       // 부드러운 렌더링 여부 (기본값: false)
}
```

## 🎨 예제

### 그라디언트 배경

```tsx
const pixelCSS = usePixelCSS(`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: 3px solid #333;
  border-radius: 12px;
  padding: 30px;
  color: white;
  font-size: 18px;
  font-weight: bold;
  width: 250px;
  height: 120px;
`);
```

### 복잡한 스타일

```tsx
const pixelCSS = usePixelCSS(`
  background: radial-gradient(circle, #ff6b6b, #4ecdc4);
  border: 1px solid #666;
  border-radius: 20px;
  padding: 25px;
  color: white;
  font-size: 14px;
  width: 180px;
  height: 90px;
`, {
  unitPixel: 3,
  smooth: true
});
```

## 🤝 기여하기

1. 이 저장소를 포크합니다
2. 기능 브랜치를 생성합니다 (`git checkout -b feature/amazing-feature`)
3. 변경사항을 커밋합니다 (`git commit -m 'Add some amazing feature'`)
4. 브랜치에 푸시합니다 (`git push origin feature/amazing-feature`)
5. Pull Request를 생성합니다

## 📄 라이선스

MIT License - 자세한 내용은 [LICENSE](LICENSE) 파일을 참조하세요.
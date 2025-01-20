# React Pixel UI

React Pixel UI는 픽셀화된 UI 컴포넌트를 제공하는 React 디자인 시스템입니다.

## 주요 기능

- 🎨 픽셀화된 UI 컴포넌트 제공
- 🎮 레트로 게임 스타일의 디자인 시스템
- 🛠 커스터마이징 가능한 픽셀화 설정
- 📦 모듈화된 패키지 구조

## 기술 스택

- 🏎 [Turborepo](https://turbo.build/repo) - 모노레포 빌드 시스템
- ⚛️ [React](https://reactjs.org/) - UI 라이브러리
- 💅 [@emotion/react](https://emotion.sh/) - CSS-in-JS 스타일링
- 📚 [Storybook](https://storybook.js.org/) - UI 컴포넌트 문서화

## 패키지 구조

- `apps/docs`: Storybook 기반의 컴포넌트 문서 사이트
- `packages/pixel-ui`: 핵심 React 컴포넌트
- `packages/use-pixelated-css`: 픽셀화 CSS 변환 Hook
- `packages/typescript-config`: 공유 TypeScript 설정
- `packages/eslint-config`: 공유 ESLint 설정

## 시작하기

- 의존성 설치
```bash
pnpm install
```

- storybook 실행
```bash
turbo dev
```

- 빌드
```bash
turbo build
```

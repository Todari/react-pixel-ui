# @react-pixel-ui/core

## 2.0.2

### Patch Changes

- - Composite BMP: border + gradient baked into single image with staircase corners
  - Fix box-sizing handling (border-box vs content-box)
  - Clamp borderRadius to min(width/2, height/2)
  - Validate pixelSize (min 1), clamp borderWidth
  - Support modern CSS rgb() space syntax
  - Support repeating-linear/radial-gradient
  - Fix isApplyingRef error recovery
  - Clear background shorthand before applying pixel styles
  - Fix Pixel component artState reset on pixelSize change

## 2.0.1

### Patch Changes

- 패키지 description 및 keywords 개선. canvas 키워드 제거, CSS 기반 설명으로 변경.

## 2.0.0

### Major Changes

- v2.0: Canvas 기반 프리렌더링을 완전히 제거하고 순수 CSS 기반으로 전면 재설계.
  - clip-path polygon으로 계단식 모서리 (Bresenham 알고리즘)
  - BMP data URL + image-rendering: pixelated로 2D 픽셀 그라데이션
  - filter: drop-shadow(blur=0)로 하드 픽셀 그림자
  - Wrapper div 구조로 픽셀 테두리
  - html2canvas 의존성 제거
  - SSR 완전 호환 (브라우저 API 불필요)
  - PixelBox, PixelButton 컴포넌트
  - PixelConfigProvider 전역 설정
  - usePixelArt, useStaircaseClip, useSteppedGradient, useResponsiveSize 훅

  BREAKING CHANGE: usePixelCSS 제거, API 전면 변경

## 1.0.3

### Patch Changes

- 951f04e: 패키지 메타데이터(keywords, homepage, repository, bugs) 추가.

## 1.0.2

### Patch Changes

- 초기 Changesets 설정 및 릴리즈 스크립트 추가.

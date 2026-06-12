# @react-pixel-ui/react

## 2.2.0

### Minor Changes

- [#6](https://github.com/Todari/react-pixel-ui/pull/6) [`911fbb0`](https://github.com/Todari/react-pixel-ui/commit/911fbb0448c849451a5e697373ceb8767380d239) Thanks [@Todari](https://github.com/Todari)! - React layer fixes: stable DOM across re-measures, resize awareness, StrictMode-safe observers, working responsive mode, and API hardening.

  **`<Pixel>`**
  - The drop-shadow wrapper no longer remounts the child DOM node on every re-measure (theme toggle, style change). Once a shadow wrapper exists it stays in the tree (`display: contents` while measuring), so uncontrolled `<input>` values, focus, and selection survive.
  - A `ResizeObserver` now watches the child: responsive/percentage-width elements re-measure when their size changes (stale absolute-px clip-paths are regenerated), and elements that mount at zero size (inside `display: none` tabs/accordions) get pixel art as soon as they become visible — previously they never did.
  - Backgrounds the engine can't pixelate (`url()` images, `conic-gradient()`) are left untouched instead of being replaced with `background: none` + a transparent PNG (elements no longer go invisible or flash solid red).
  - Author `box-shadow` is only cleared when it is actually replaced by a pixel shadow — inset-only shadows are preserved.

  **`usePixelRef`**
  - The style observer is created inside an effect instead of the ref callback. Under React 18 StrictMode (the Vite/Next dev default) the simulated remount previously disconnected the observer permanently, freezing all hover/focus/resize updates in development.
  - Borderless elements with a `box-shadow` get their pixelated drop-shadow again — the hook only read `wrapperStyle.filter`, which the composer only sets when a border wrapper is needed, so shadows were silently deleted. When the element has no clip-path the filter now applies to the element itself instead of its parent.
  - Same graceful-degradation behavior as `<Pixel>` for unparseable backgrounds.

  **`<PixelBox>`**
  - `responsive` mode actually works now: the component no longer pins its own measured fallback (`200×100`) as inline px width/height, which made the ResizeObserver only ever read back the forced size. Size the box with your own CSS (`style={{ width: '100%', height: 120 }}`) and the pixel art follows it. Measurement uses the border box.
  - `className`, `style`, and other HTML props now consistently land on the **root** element (previously `style` landed on the inner content div when a border was used, so `margin` etc. silently did nothing).

  **`<PixelButton>`**
  - Unknown `variant` values fall back to `primary` with a dev warning instead of crashing with a `TypeError`.
  - The rendered `<button>` defaults to `type="button"` so dropping it into a form no longer submits the form; an explicit `type` prop still wins.

  **Misc**
  - `PixelConfigProvider` no longer crashes when rendered without a `config` prop (it is now optional).
  - `usePixelArt` memoizes by the radius values, so inline per-corner arrays (`borderRadius={[8,8,0,0]}`) no longer regenerate the art on every parent re-render; it also skips generating the unused composite PNG.
  - `PixelBox`/`PixelButton` expose proper `displayName`s in React DevTools (no more `PixelBox2`).
  - ESM consumers under `moduleResolution: node16/nodenext` get the ESM declaration file via per-condition `exports` types, and the `"use client"` banner no longer shifts source maps by one line.

### Patch Changes

- Updated dependencies [[`911fbb0`](https://github.com/Todari/react-pixel-ui/commit/911fbb0448c849451a5e697373ceb8767380d239)]:
  - @react-pixel-ui/core@2.2.0

## 2.1.1

### Patch Changes

- d6078ef: fix(react): shadow wrapper collapses width when child uses `min(Xpx, 100%)`

  When a child element had both `box-shadow` and a responsive width
  (e.g., `width: min(260px, 100%)`), the pixel art would collapse to a
  tiny, nearly-zero width. Moving the shadow slider in the demo
  Playground was the easiest reproduction.

  **Root cause:** `<Pixel>` wraps the child in an extra
  `display: inline-block` div carrying the `filter: drop-shadow(...)` so
  the shadow is not clipped by the sibling `clip-path`. That wrapper
  has no explicit width, making it shrink-to-fit. The child's `100%`
  then resolved against a shrink-to-fit parent, which under CSS rules
  can collapse to zero, creating a circular size-resolution loop where
  both wrapper and child ended up near-zero width.

  **Fix:** the shadow wrapper now pins its own width / height to the
  child's measured dimensions (from `artState`) and adds
  `max-width: 100%` so it still shrinks on narrow viewports. This
  breaks the circular resolution while preserving the
  shrink-to-container-width behavior on mobile.

  Added a regression test asserting the wrapper's `width`, `height`,
  and `max-width` inline style.

## 2.1.0

### Minor Changes

- 5732058: Robustness, correctness, and modern CSS support pass

  ### `@react-pixel-ui/react`

  **Fixes**
  - **Next.js App Router**: the published bundle now starts with `"use client"`, so importing `<Pixel>` / `usePixelRef` from a server component works out of the box. Previously the package would throw `"You're importing a component that needs useState..."`.
  - **Dynamic style changes are now reflected**: `<Pixel>` re-measures when the child's `className` or `style` prop changes, so state-driven color/radius/border updates actually repaint the pixel art (instead of being frozen at the first measurement).
  - **Tailwind dark mode**: `<Pixel>` observes `class` / `data-theme` toggles on `<html>` and `<body>`, re-rendering pixel art with the new computed colors automatically.
  - **No more content-box layout shift**: instead of stripping the border (`border: none`), we now preserve the border width and set `border-color: transparent` + `background-origin: border-box`. The element's outer box stays the same regardless of `box-sizing`.
  - **`usePixelRef` parent filter leak**: when `usePixelRef` writes `filter: drop-shadow(...)` to the parent element (to escape clip-path), the original value is snapshotted and restored on ref detach / unmount / option change. Previously the parent stayed permanently modified.
  - **`usePixelRef` style observer**: inline `style` attribute mutations are now observed too. A `pause()` primitive on the observer prevents self-mutation loops.
  - **Function-component child warning**: `<Pixel>` logs a dev-only warning when its child doesn't accept a ref (e.g., a function component without `forwardRef`), instead of silently doing nothing.
  - **React 19 ref access**: ref-merging now reads `element.props.ref` first (React 19) and falls back to `element.ref` (React 18). `peerDependencies` now accepts `react ^19`.

  **Performance**
  - **BMP memoization**: `<Pixel>` wraps `generatePixelArt()` in `useMemo`, eliminating the per-frame image regeneration that happened on unrelated parent re-renders.
  - **`PixelConfigProvider`**: context value is memoized so consumers don't re-render on every provider render.

  **Packaging**
  - `"exports"` map, `"sideEffects": false`, and proper dual ESM/CJS entry points.
  - `peerDependencies`: `react ^18 || ^19`.

  ### `@react-pixel-ui/core`

  **Fixes**
  - **Alpha channel preservation**: the internal image encoder switched from 24-bit BMP to 32-bit RGBA PNG. `rgba()`, `transparent` gradient stops, and translucent backgrounds now render correctly instead of being flattened to opaque (or worse, solid black).
  - **Correct outside-shape pixels**: pixels outside the staircase clip are now fully transparent instead of black, eliminating edge bleed at non-integer pixel alignments.
  - **`parseColor("#xyz")` fix**: invalid hex strings now return `null` instead of `{r: NaN, g: NaN, b: NaN, a: 1}`.

  **Features**
  - **`hsl()` / `hsla()` parsing**: comma, space, and slash syntax; `deg`/`rad`/`grad`/`turn` hue units; negative hue wrap-around.
  - **`oklch()` / `oklab()` parsing**: full CSS Color 4 perceptual color space support with the standard oklab → linear sRGB → sRGB gamma-corrected pipeline. Out-of-gamut values are clamped.
  - **`hsl()` / `oklch()` / `oklab()` gradient stops**: all accepted in `linear-gradient`, `radial-gradient`, and the `repeating-*` variants.

  **Packaging**
  - `"exports"` map, `"sideEffects": false`, proper dual ESM/CJS entry points.

  ### Test coverage
  - New **vitest** test suite: **122 tests** across core (98) and react (24).
  - Covers PNG encoder round-trip via Node `zlib`, gradient parsing, color parsing (including hsl/oklch), composer, `<Pixel>` / `usePixelRef` behavior, and the new fixes above.

  ### CI
  - New `.github/workflows/ci.yml` runs lint, type-check, test, and build on every PR and push to `main`, on Node 20 and 22.

### Patch Changes

- Updated dependencies [5732058]
  - @react-pixel-ui/core@2.1.0

## 2.0.4

### Patch Changes

- Include updated README in npm package (was showing old v1 docs).

## 2.0.3

### Patch Changes

- Updated dependencies
  - @react-pixel-ui/core@2.0.3

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
- Updated dependencies
  - @react-pixel-ui/core@2.0.2

## 2.0.1

### Patch Changes

- 패키지 description 및 keywords 개선. canvas 키워드 제거, CSS 기반 설명으로 변경.
- Updated dependencies
  - @react-pixel-ui/core@2.0.1

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

### Patch Changes

- Updated dependencies
  - @react-pixel-ui/core@2.0.0

## 1.0.2

### Patch Changes

- 951f04e: 패키지 메타데이터(keywords, homepage, repository, bugs) 추가.
- Updated dependencies [951f04e]
  - @react-pixel-ui/core@1.0.3

## 1.0.1

### Patch Changes

- 초기 Changesets 설정 및 릴리즈 스크립트 추가.
- Updated dependencies
  - @react-pixel-ui/core@1.0.2

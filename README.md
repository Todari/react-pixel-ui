# React Pixel UI

[![npm](https://img.shields.io/npm/v/@react-pixel-ui/react)](https://www.npmjs.com/package/@react-pixel-ui/react)
[![npm](https://img.shields.io/npm/v/@react-pixel-ui/core)](https://www.npmjs.com/package/@react-pixel-ui/core)

Any CSS to pixel art. Use your existing styles — Tailwind, inline, CSS modules — and wrap with `<Pixel>`. No Canvas, SSR compatible.

## Install

```bash
npm install @react-pixel-ui/react
```

## Quick Start

```tsx
import { Pixel } from '@react-pixel-ui/react';

// Tailwind
<Pixel size={4}>
  <div className="bg-gradient-to-r from-red-500 to-blue-500 rounded-xl border-2 border-black p-4">
    Automatically pixelated!
  </div>
</Pixel>

// Inline styles
<Pixel size={6}>
  <div style={{ background: 'linear-gradient(45deg, #ff6b6b, #4ecdc4)', borderRadius: 16, border: '3px solid #333' }}>
    Works too!
  </div>
</Pixel>
```

The `<Pixel>` component reads the child's computed CSS and converts it to pixel art automatically.

## API

### `<Pixel>` — Auto-pixelate any element

Wrap any single element. Its CSS styles are automatically converted to pixel art.

```tsx
<Pixel size={4}>
  <button className="bg-purple-500 rounded-lg border-2 border-purple-800 px-6 py-3 text-white">
    Click me
  </button>
</Pixel>
```

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `size` | `number` | `4` | Pixel block size |
| `enabled` | `boolean` | `true` | Toggle pixelation on/off |
| `observeHover` | `boolean` | `true` | Re-compute on hover state change |
| `observeFocus` | `boolean` | `true` | Re-compute on focus state change |
| `observeActive` | `boolean` | `true` | Re-compute on active state change |

Supports: `background-color`, `background-image` (gradients), `border-radius`, `border`, `box-shadow`.

### `usePixelRef` — Ref-based hook

For maximum flexibility. Attach to any element without a wrapper component.

```tsx
import { usePixelRef } from '@react-pixel-ui/react';

function MyComponent() {
  const pixelRef = usePixelRef({ pixelSize: 4 });

  return (
    <div ref={pixelRef} className="bg-red-500 rounded-xl border-2 border-black">
      Any element works
    </div>
  );
}
```

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `pixelSize` | `number` | `4` | Pixel block size |
| `enabled` | `boolean` | `true` | Toggle pixelation |
| `observeHover` | `boolean` | `true` | Watch hover changes |
| `observeFocus` | `boolean` | `true` | Watch focus changes |
| `observeActive` | `boolean` | `true` | Watch active changes |

### `PixelBox` — Explicit prop-based component

When you prefer explicit configuration over CSS reading.

```tsx
import { PixelBox } from '@react-pixel-ui/react';

<PixelBox
  width={280} height={120} pixelSize={4}
  borderRadius={16} borderWidth={3} borderColor="#333"
  background="linear-gradient(45deg, #ff6b6b, #4ecdc4)"
  shadow={{ x: 4, y: 4, color: 'rgba(0,0,0,0.3)' }}
>
  Pixel Art!
</PixelBox>
```

<details>
<summary>PixelBox Props</summary>

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `width` | `number` | `200` | Width in px |
| `height` | `number` | `100` | Height in px |
| `pixelSize` | `number` | `4` | Pixel block size |
| `borderRadius` | `number \| [tl, tr, br, bl]` | — | Corner radius |
| `borderWidth` | `number` | — | Border thickness (snapped to pixelSize) |
| `borderColor` | `string` | — | Border color |
| `background` | `string` | — | Color or CSS gradient |
| `shadow` | `{ x, y, color }` | — | Hard pixel shadow |
| `responsive` | `boolean` | `false` | Auto-detect size via ResizeObserver |

</details>

### `PixelButton` — Pre-styled button

```tsx
<PixelButton variant="primary">Primary</PixelButton>
<PixelButton variant="secondary">Secondary</PixelButton>
<PixelButton variant="danger">Danger</PixelButton>
```

### `PixelConfigProvider` — Global defaults

```tsx
<PixelConfigProvider config={{ pixelSize: 6 }}>
  <App />
</PixelConfigProvider>
```

## How It Works

| Feature | Technique |
|---------|-----------|
| Staircase corners | `clip-path: polygon()` via Bresenham circle algorithm |
| Pixel gradients | Tiny BMP data URL + `image-rendering: pixelated` |
| Pixel borders | Wrapper div with outer/inner clip-path differential |
| Hard shadows | `filter: drop-shadow(blur=0)` following clip-path contour |
| Auto-detection | `getComputedStyle()` + MutationObserver + ResizeObserver |

## Browser Compatibility

| Feature | Chrome | Firefox | Safari | Edge |
|---------|--------|---------|--------|------|
| `clip-path: polygon()` | 55+ | 54+ | 10+ | 79+ |
| `image-rendering: pixelated` | 41+ | 56+ | 10+ | 79+ |
| `filter: drop-shadow()` | 18+ | 35+ | 6+ | 79+ |

## License

MIT

---

# React Pixel UI (한국어)

CSS 스타일을 자동으로 픽셀아트로 변환하는 React 라이브러리.

```tsx
import { Pixel } from '@react-pixel-ui/react';

<Pixel size={4}>
  <div className="bg-red-500 rounded-xl border-2 border-black p-4">
    자동으로 픽셀화!
  </div>
</Pixel>
```

Tailwind, 인라인 스타일, CSS 모듈 모두 지원. 자세한 API는 영어 섹션 참고.

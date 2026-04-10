# React Pixel UI

[![npm version](https://img.shields.io/npm/v/@react-pixel-ui/react)](https://www.npmjs.com/package/@react-pixel-ui/react)
[![bundle size](https://img.shields.io/bundlephobia/minzip/@react-pixel-ui/react)](https://bundlephobia.com/package/@react-pixel-ui/react)
[![license](https://img.shields.io/npm/l/@react-pixel-ui/react)](https://github.com/Todari/react-pixel-ui/blob/main/LICENSE)

Any CSS to pixel art. Wrap your element with `<Pixel>` — Tailwind, inline styles, CSS modules all work. No Canvas, SSR compatible.

[Demo](https://react-pixel-ui.vercel.app) | [npm](https://www.npmjs.com/package/@react-pixel-ui/react) | [GitHub](https://github.com/Todari/react-pixel-ui)

## Install

```bash
npm install @react-pixel-ui/react
# or
pnpm add @react-pixel-ui/react
# or
yarn add @react-pixel-ui/react
```

Requires **React 18+**. `@react-pixel-ui/core` is installed automatically.

## Quick Start

```tsx
import { Pixel } from '@react-pixel-ui/react';

function App() {
  return (
    <Pixel size={6}>
      <div style={{
        background: 'linear-gradient(135deg, #ff6b6b, #4ecdc4)',
        borderRadius: 16,
        border: '3px solid #333',
        padding: 20,
      }}>
        Pixel Art!
      </div>
    </Pixel>
  );
}
```

That's it. `<Pixel>` reads your CSS and converts `background`, `border-radius`, `border`, and `box-shadow` into pixel art.

## APIs

### `<Pixel>` — Wrap any element (Recommended)

```tsx
import { Pixel } from '@react-pixel-ui/react';

// Tailwind
<Pixel size={6}>
  <div className="bg-gradient-to-r from-red-500 to-blue-500 rounded-xl border-2 border-black">
    Works with Tailwind
  </div>
</Pixel>

// Inline styles
<Pixel size={6}>
  <div style={{ background: '#ff6b6b', borderRadius: 12, border: '2px solid #333' }}>
    Works with inline styles
  </div>
</Pixel>
```

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `size` | `number` | `4` | Pixel block size in CSS px. Larger = blockier. |
| `enabled` | `boolean` | `true` | Toggle pixelation on/off |
| `children` | `ReactElement` | required | Single child element to pixelate |

**Supported CSS properties:**
- `background` / `background-color` — solid colors and gradients (`linear-gradient`, `radial-gradient`, `repeating-*`). Alpha-preserving.
- `border-radius` — converted to staircase corners (supports per-corner `[tl, tr, br, bl]`)
- `border` — pixel art border with staircase corners. Box size is preserved via `border-color: transparent` (no layout shift, even with `box-sizing: content-box`).
- `box-shadow` — converted to hard drop-shadow (no blur)
- **Reactive updates**: the child's `className` / `style` props and theme classes on `<html>` / `<body>` (Tailwind dark mode, etc.) are automatically observed — no manual re-render needed.

### `usePixelRef` — Ref-based hook

Attach to any element without wrapping. Best for third-party components or when you can't use a wrapper.

```tsx
import { usePixelRef } from '@react-pixel-ui/react';

function MyComponent() {
  const pixelRef = usePixelRef({ pixelSize: 6 });

  return (
    <div
      ref={pixelRef}
      style={{
        background: 'linear-gradient(135deg, #fd79a8, #e84393)',
        borderRadius: 20,
        border: '3px solid #b8256e',
        padding: 16,
      }}
    >
      Pixelated via ref
    </div>
  );
}
```

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `pixelSize` | `number` | `4` | Pixel block size |
| `enabled` | `boolean` | `true` | Toggle pixelation |
| `observeHover` | `boolean` | `true` | Re-compute on `:hover` |
| `observeFocus` | `boolean` | `true` | Re-compute on `:focus` |
| `observeActive` | `boolean` | `true` | Re-compute on `:active` |

### `PixelConfigProvider` — Global defaults

Set default `pixelSize` for all `<Pixel>` and `usePixelRef` instances in the tree.

```tsx
import { PixelConfigProvider } from '@react-pixel-ui/react';

function App() {
  return (
    <PixelConfigProvider config={{ pixelSize: 6 }}>
      {/* All <Pixel> components default to size 6 */}
      <MyPage />
    </PixelConfigProvider>
  );
}
```

| Config Key | Type | Default | Description |
|------------|------|---------|-------------|
| `pixelSize` | `number` | `4` | Default pixel block size |
| `borderColor` | `string` | — | Default border color |

### `PixelBox` — Explicit props

Use when you want direct control instead of auto-reading CSS.

```tsx
import { PixelBox } from '@react-pixel-ui/react';

<PixelBox
  width={280}
  height={120}
  pixelSize={6}
  borderRadius={16}
  borderWidth={3}
  borderColor="#333"
  background="linear-gradient(45deg, #ff6b6b, #4ecdc4)"
  shadow={{ x: 4, y: 4, color: 'rgba(0,0,0,0.3)' }}
>
  Content
</PixelBox>
```

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `width` | `number` | `200` | Element width in px |
| `height` | `number` | `100` | Element height in px |
| `pixelSize` | `number` | `4` | Pixel block size |
| `borderRadius` | `number \| [number, number, number, number]` | — | Corner radius. Array = `[topLeft, topRight, bottomRight, bottomLeft]` |
| `borderWidth` | `number` | — | Border thickness (auto-snapped to pixelSize grid) |
| `borderColor` | `string` | — | Any CSS color |
| `background` | `string` | — | CSS color or gradient string |
| `shadow` | `{ x: number, y: number, color: string }` | — | Hard pixel shadow |
| `responsive` | `boolean` | `false` | Auto-detect size via ResizeObserver |

### `PixelButton` — Pre-styled button

```tsx
import { PixelButton } from '@react-pixel-ui/react';

<PixelButton variant="primary" width={160} height={48}>Click me</PixelButton>
```

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | `'primary' \| 'secondary' \| 'danger'` | `'primary'` | Color theme |
| `width` | `number` | `160` | Button width |
| `height` | `number` | `48` | Button height |
| `borderRadius` | `number` | `8` | Corner radius |
| `pixelSize` | `number` | from context | Pixel block size |
| `shadow` | `{ x, y, color }` | auto | Pixel shadow |

## When to use what

| Use case | API | Why |
|----------|-----|-----|
| Existing styled elements | `<Pixel>` | Reads CSS automatically, zero config |
| Third-party components | `usePixelRef` | Attach via ref, no wrapper div |
| Full manual control | `PixelBox` | Explicit props, no CSS reading |
| Pre-built buttons | `PixelButton` | Ready-to-use with variants |

## How It Works

| Feature | CSS Technique |
|---------|---------------|
| Staircase corners | `clip-path: polygon()` — Bresenham circle algorithm generates stepped polygon |
| Pixel gradients | Composite PNG data URL + `image-rendering: pixelated` — 2D grid sampling per block with full RGBA alpha |
| Pixel borders | Border color + gradient baked into single PNG with staircase shapes |
| Hard shadows | `filter: drop-shadow(blur=0)` — follows clip-path contour |
| Auto-detection | `getComputedStyle()` reads any CSS → converted to pixel art config |

## Recipes

### Dynamic pixel size

```tsx
function PixelSlider() {
  const [size, setSize] = useState(6);

  return (
    <>
      <input type="range" min={2} max={16} value={size} onChange={e => setSize(+e.target.value)} />
      <Pixel size={size}>
        <div style={{ background: '#ff6b6b', borderRadius: 12, border: '2px solid #333' }}>
          Size: {size}px
        </div>
      </Pixel>
    </>
  );
}
```

### Per-corner radius

```tsx
<Pixel size={6}>
  <div style={{
    background: '#ffeaa7',
    borderRadius: '24px 4px 24px 4px', // TL TR BR BL
    border: '3px solid #e17055',
    width: 200, height: 80,
  }}>
    Asymmetric corners
  </div>
</Pixel>
```

### Modern color spaces (oklch / hsl)

```tsx
// Gradient stops can use any supported color form.
<Pixel size={6}>
  <div style={{
    background: 'linear-gradient(135deg, oklch(0.75 0.2 30), oklch(0.6 0.25 280))',
    borderRadius: 16,
    border: '3px solid hsl(220 40% 20%)',
    padding: 20,
  }}>
    oklch + hsl
  </div>
</Pixel>
```

### Translucent gradients

```tsx
// Alpha is preserved end-to-end via the RGBA composite PNG.
<Pixel size={6}>
  <div style={{
    background: 'linear-gradient(to right, rgba(255,107,107,0.2), rgba(78,205,196,1))',
    borderRadius: 12,
  }}>
    Fades from translucent to opaque
  </div>
</Pixel>
```

### Tailwind dark mode

```tsx
// <Pixel> watches <html> / <body> class changes automatically.
// Toggle a `.dark` class on <html> and the pixel art re-renders
// with the new computed colors.
<Pixel size={6}>
  <div className="bg-white dark:bg-gray-900 border-2 border-black dark:border-white rounded-xl px-4 py-3">
    Auto-adapts to theme
  </div>
</Pixel>
```

### Next.js (App Router)

```tsx
// app/page.tsx — server component importing <Pixel> works out of the box
import { Pixel } from '@react-pixel-ui/react';

export default function Page() {
  return (
    <Pixel size={6}>
      <div style={{ background: '#6c5ce7', borderRadius: 12, padding: 20, color: '#fff' }}>
        SSR compatible
      </div>
    </Pixel>
  );
}
```

> The published bundle starts with `"use client"`, so Next.js treats `@react-pixel-ui/react`
> as a client module automatically — you don't need to add the directive yourself.
> `<Pixel>` renders its child on the server and upgrades to pixel art after hydration.

## FAQ

**Q: Why does my gradient look smooth instead of pixelated?**
A: Check that `pixelSize` is large enough to see distinct blocks. At `size={2}`, blocks are 2x2 CSS pixels — very small on high-DPI screens. Try `size={6}` or higher.

**Q: Why is the border missing at diagonal corners?**
A: Make sure you're using `<Pixel>` or `usePixelRef` (v2.0.1+). These use composite PNG rendering where border + gradient are baked together with correct staircase shapes.

**Q: Does it work with Tailwind CSS?**
A: Yes. `<Pixel>` reads `getComputedStyle` which resolves Tailwind classes into final CSS values. Tailwind dark mode toggling a class on `<html>` is detected automatically and the pixel art re-renders.

**Q: What CSS properties are supported?**
A: `background-color`, `background-image` (linear/radial/repeating gradients), `border-radius`, `border`, `box-shadow`. Other properties (color, font, padding, etc.) are preserved as-is.

**Q: Is it SSR compatible?**
A: Yes. The core package uses pure math (no Canvas, no DOM APIs). Elements render normally on the server and get pixelated on hydration.

## Supported CSS values

- **Colors**: named colors, `#rgb[a]` / `#rrggbb[aa]`, `rgb[a]()` (comma or
  modern slash syntax), `hsl[a]()` (comma or slash), and `oklch()` / `oklab()`
  are all parsed natively. `color-mix()` and `var(--token)` rely on the
  browser normalizing them to `rgb()` via `getComputedStyle` — which works
  transparently on the `<Pixel>` / `usePixelRef` path since those read
  computed styles from the DOM.
- **Gradients**: `linear-gradient`, `radial-gradient`, and their
  `repeating-*` variants. Stops may use any supported color form including
  `oklch()`.
- **`box-shadow`**: the *first* non-inset shadow is converted into a hard
  pixel `drop-shadow`. Additional shadows and inset shadows are ignored by
  design (pixel art uses a single hard shadow).
- **Alpha**: translucent colors and gradient stops are preserved end-to-end
  via the composite PNG RGBA encoder.

## Known limitations

- **`<PixelBox>` explicit `background` prop**: unlike `<Pixel>` which reads
  computed styles, `<PixelBox>` takes the raw string you pass. It understands
  hex, named, `rgb()`, `hsl()`, and `oklch()` but not `color-mix()` or
  `var(--token)` (there's no DOM resolution step).
- **Dynamic children via ancestor selectors**: `<Pixel>` observes the child's
  React props (`className`, `style`) and the `<html>` / `<body>` theme
  classes. If an unrelated *middle* ancestor toggles a class that changes
  the child via descendant selectors, trigger a parent re-render or use
  `usePixelRef`, which listens to `style` mutations on the managed element
  directly in addition to hover / focus / active / resize.

## Browser Compatibility

| Feature | Chrome | Firefox | Safari | Edge |
|---------|--------|---------|--------|------|
| `clip-path: polygon()` | 55+ | 54+ | 10+ | 79+ |
| `image-rendering: pixelated` | 41+ | 56+ (`crisp-edges`) | 10+ | 79+ |
| `filter: drop-shadow()` | 18+ | 35+ | 6+ | 79+ |

**Overall: 97%+** global browser coverage.

## TypeScript

Fully typed. All components, hooks, and config objects have TypeScript definitions.

```tsx
import type {
  PixelArtConfig,
  PixelArtStyles,
  PixelShadowConfig,
  BorderRadii,
} from '@react-pixel-ui/react';
```

## Project Structure

```
packages/
  core/     # Pure CSS generators (zero browser dependency, SSR safe)
  react/    # React hooks & components
apps/
  demo/     # Interactive demo + documentation site
```

## Development

```bash
pnpm setup                              # Install + build
pnpm dev --filter=@react-pixel-ui/demo  # Run demo at localhost:3000
pnpm build && pnpm type-check           # Build & verify
```

## Contributing

PRs welcome. Please open an issue first to discuss larger changes.

## License

MIT

---

# React Pixel UI (한국어)

CSS 스타일을 자동으로 픽셀아트로 변환하는 React 라이브러리.

```bash
npm install @react-pixel-ui/react
```

```tsx
import { Pixel } from '@react-pixel-ui/react';

// 어떤 스타일이든 <Pixel>로 감싸면 픽셀 아트로 변환
<Pixel size={6}>
  <div style={{
    background: 'linear-gradient(135deg, #ff6b6b, #4ecdc4)',
    borderRadius: 16,
    border: '3px solid #333',
  }}>
    자동으로 픽셀화!
  </div>
</Pixel>
```

Tailwind, 인라인 스타일, CSS 모듈 모두 지원. Canvas 없음, SSR 호환.

자세한 API 문서는 영어 섹션을 참고하세요.

# @react-pixel-ui/core

[![npm version](https://img.shields.io/npm/v/@react-pixel-ui/core)](https://www.npmjs.com/package/@react-pixel-ui/core)
[![license](https://img.shields.io/npm/l/@react-pixel-ui/core)](https://github.com/Todari/react-pixel-ui/blob/main/LICENSE)

Framework-agnostic pixel-art style engine used by
[`@react-pixel-ui/react`](https://www.npmjs.com/package/@react-pixel-ui/react).
It generates staircase polygons, pixelated gradients, composite RGBA PNG data
URLs, and hard shadows without Canvas or runtime dependencies.

Use the React package when you want components and hooks. Install this package
directly when you are building another framework adapter or applying the
generated styles yourself.

## Install

```bash
npm install @react-pixel-ui/core
# or
pnpm add @react-pixel-ui/core
```

## Quick start

```ts
import { generatePixelArt } from "@react-pixel-ui/core";

const result = generatePixelArt(
  240,
  120,
  {
    pixelSize: 6,
    borderRadius: 18,
    borderWidth: 3,
    borderColor: "#2d3436",
    backgroundColor: "linear-gradient(135deg, #ff6b6b, #4ecdc4)",
    shadow: { x: 6, y: 6, color: "rgba(0, 0, 0, 0.35)" },
  },
  { want: "composite" },
);

element.style.clipPath = result.clipPath;

if (result.compositeImage) {
  element.style.backgroundImage = `url("${result.compositeImage}")`;
  element.style.backgroundSize = "100% 100%";
  element.style.imageRendering = "pixelated";
}
```

`generatePixelArt()` is pure and keeps a small internal LRU cache. Treat the
returned style objects as immutable.

## Main API

```ts
generatePixelArt(
  width: number,
  height: number,
  config: PixelArtConfig,
  options?: { want?: 'styles' | 'composite' | 'both' }
): PixelArtStyles
```

`want` lets adapters skip PNG work they do not need:

- `styles`: `wrapperStyle` and `contentStyle`
- `composite`: one border/background PNG plus fallback styles
- `both`: all outputs; the default for backward compatibility

`PixelArtConfig` supports:

| Field             | Type                                         | Description                           |
| ----------------- | -------------------------------------------- | ------------------------------------- |
| `pixelSize`       | `number`                                     | CSS-pixel grid size                   |
| `borderRadius`    | `number \| [number, number, number, number]` | Uniform or per-corner radii           |
| `borderWidth`     | `number`                                     | Border width, snapped to the grid     |
| `borderColor`     | `string`                                     | Supported CSS color                   |
| `backgroundColor` | `string`                                     | Supported color or gradient           |
| `shadow`          | `{ x, y, color }`                            | Hard shadow with grid-snapped offsets |

The result includes `wrapperStyle`, `contentStyle`, `needsWrapper`,
`clipPath`, `innerClipPath`, and `compositeImage`.

## Tree-shakeable utilities

```ts
import {
  generateStaircasePolygon,
  generatePolygonPoints,
  parseBorderRadius,
  generateSteppedGradient,
  generatePixelGradient,
  generateCompositePixelImage,
  generatePixelShadow,
  parseComputedStyles,
  parseColor,
  interpolateColor,
  colorToCSS,
  parseGradient,
  resolveGradientAngle,
  snapToGrid,
  snapToGridCeil,
  sanitizePixelSize,
} from "@react-pixel-ui/core";
```

The individual exports cover:

- staircase `clip-path` generation and radius parsing
- CSS stepped gradients or compressed RGBA PNG gradient data URLs
- a composite PNG containing background, border, and transparent corners
- zero-blur `drop-shadow()` values
- CSS color and gradient parsing/interpolation
- pixel-grid math

`parseComputedStyles()` accepts a `CSSStyleDeclaration` supplied by a browser
adapter. The core package itself does not read `window`, `document`, or
`getComputedStyle`.

```ts
const config = parseComputedStyles(
  getComputedStyle(element),
  6,
  element.getBoundingClientRect(),
);
```

## Supported CSS values

- named colors, hex, modern and legacy `rgb()` / `hsl()`
- `oklab()`, `oklch()`, and `color()` for supported color spaces
- linear, radial, and repeating gradients
- angle units, corner directions, interpolation hints, and RGBA alpha

Unsupported backgrounds such as `url()`, `conic-gradient()`, and unresolved
custom properties return no generated image. Adapters should retain the
original background so the element degrades gracefully.

Only the first non-inset box shadow is represented by the high-level engine.
The generated shadow has no blur by design.

## Runtime and TypeScript

- ESM and CommonJS builds
- bundled TypeScript declarations
- no React dependency
- no Canvas dependency
- no runtime dependency on browser globals
- safe to import during SSR

## Related links

- [React components and hooks](https://www.npmjs.com/package/@react-pixel-ui/react)
- [Interactive demo](https://react-pixel-ui.vercel.app)
- [Source and issues](https://github.com/Todari/react-pixel-ui)

## License

[MIT](./LICENSE) © [Todari](https://github.com/Todari)

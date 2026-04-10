---
"@react-pixel-ui/react": minor
"@react-pixel-ui/core": minor
---

Robustness, correctness, and modern CSS support pass

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

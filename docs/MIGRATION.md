# v1 → v2 Migration Guide

v2.0.0 (2026-04-03) was a full rewrite. This guide covers what changed
and how to migrate. For ongoing release notes, see the per-package
changelogs:

- [`@react-pixel-ui/react` CHANGELOG](../packages/react/CHANGELOG.md)
- [`@react-pixel-ui/core` CHANGELOG](../packages/core/CHANGELOG.md)

## What changed in 2.0.0

### Breaking Changes

- **Removed Canvas-based rendering** — No more `html2canvas` dependency, no `document.createElement('canvas')` calls
- **Removed `usePixelCSS` hook** — Replaced by `usePixelArt` hook and `PixelBox` component
- **Removed CSS string input** — New API uses explicit props instead of CSS string parsing
- **New API surface** — All exports changed (see Migration Guide below)

### New Features

- **DOM/CSS output** — Uses `clip-path: polygon()`, PNG data URL gradients, and `filter: drop-shadow()` without Canvas
- **SSR compatible** — All computation is pure math, zero browser API dependency
- **`PixelBox` component** — Drop-in pixel art container with automatic wrapper div for borders
- **`PixelButton` component** — Pre-styled button with `primary`, `secondary`, `danger` variants
- **`usePixelArt` hook** — Low-level hook returning `wrapperStyle`, `contentStyle`, `needsWrapper`
- **`useStaircaseClip` hook** — Generate clip-path polygon for staircase corners only
- **`useSteppedGradient` hook** — Convert CSS gradient to stepped bands only
- **`useResponsiveSize` hook** — ResizeObserver-based auto-sizing with pixel grid snapping
- **`PixelConfigProvider`** — React context for global defaults (pixelSize, borderColor)
- **Per-corner border radius** — `borderRadius={[tl, tr, br, bl]}` array syntax
- **Pixel grid snapping** — `borderWidth` and `borderRadius` auto-snap to `pixelSize` multiples
- **2D pixel gradients** — RGBA PNG data URL with `image-rendering: pixelated` for true square blocks
- **Hard pixel shadows** — `drop-shadow(blur=0)` follows clip-path contour

### Migration from v1.x

**Before (v1):**
```tsx
import { usePixelCSS } from '@react-pixel-ui/react';

const { pixelStyle } = usePixelCSS(`
  background: linear-gradient(45deg, #ff6b6b, #4ecdc4);
  border: 2px solid #333;
  border-radius: 12px;
`, { width: 280, height: 120, pixelSize: 4 });

<div style={pixelStyle}>Content</div>
```

**After (v2):**
```tsx
import { PixelBox } from '@react-pixel-ui/react';

<PixelBox
  width={280} height={120} pixelSize={4}
  borderRadius={12} borderWidth={2} borderColor="#333"
  background="linear-gradient(45deg, #ff6b6b, #4ecdc4)"
>
  Content
</PixelBox>
```

Or with the hook:
```tsx
import { usePixelArt } from '@react-pixel-ui/react';

const { wrapperStyle, contentStyle, needsWrapper } = usePixelArt(280, 120, {
  pixelSize: 4, borderRadius: 12, borderWidth: 2,
  borderColor: '#333', backgroundColor: 'linear-gradient(45deg, #ff6b6b, #4ecdc4)',
});
```

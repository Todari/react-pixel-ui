---
"@react-pixel-ui/core": minor
---

Core engine overhaul: real PNG compression, full CSS color support, gradient correctness, and graceful degradation.

**Performance**

- The PNG encoder now uses a built-in dependency-free DEFLATE (fixed Huffman + LZ77) instead of uncompressed stored blocks — generated data URLs are **30–100× smaller** (e.g. a 600×400 card went from ~78 KB to ~2.4 KB), with a stored-block fallback for incompressible data.
- `generatePixelArt` accepts `options.want: 'styles' | 'composite' | 'both'` so consumers skip generating the PNG they discard (~2× faster for gradient cases). Default `'both'` keeps backward compatibility.
- `generatePixelArt` results are cached in a small LRU keyed by inputs — hover/theme/re-render churn no longer regenerates identical art. Treat returned objects as immutable.

**Color parsing**

- All 148 CSS named colors are now supported (previously 14 — `lime`, `navy`, `teal`, `tomato`, `gold`, `rebeccapurple`, … no longer fail to parse).
- New: `color(srgb … )`, `color(srgb-linear …)`, and `color(display-p3 …)` — Chromium serializes computed `color-mix()` results as `color(srgb …)`, so `color-mix()` now works end-to-end through `<Pixel>`/`usePixelRef`.
- `rgb()`/`rgba()` patterns are anchored, so colors embedded in unsupported values (e.g. `conic-gradient(rgb(255,0,0), …)`) are no longer misparsed as a solid color.

**Gradients**

- Tailwind v4 interpolation hints are handled: `linear-gradient(to right in oklab, …)` no longer silently falls back to `to bottom`.
- Angle units `turn`, `rad`, and `grad` are converted correctly (previously only `deg` worked).
- Corner keywords (`to top right`, …) now resolve to the aspect-ratio-dependent "magic corner" angle per CSS spec via the new `resolveGradientAngle(gradient, width, height)` export, instead of a fixed 45° multiple.
- Double-position stops (`red 0% 50%`) expand into two stops, preserving hard color edges.
- Stops with `px` positions or one unparseable stop no longer corrupt the whole gradient (the `-1` position sentinel can no longer leak into sampling).

**Correctness & safety**

- `generatePixelShadow` no longer forces zero offsets to `pixelSize` — `box-shadow: 0 4px 0` stays a straight shadow instead of turning diagonal. Offsets snap to the nearest grid line; all-zero shadows are skipped entirely.
- `generateCompositePixelImage` keeps the interior **transparent** for border-only elements (previously it filled the content area with the border color), and returns `null` when a background is present but unparseable (`url()`, `conic-gradient()`, …) so consumers can leave the original styling untouched.
- `parseComputedStyles` resolves percentage `border-radius` (e.g. `border-radius: 50%` avatars) against the element size via a new optional `size` parameter, and handles elliptical two-value radii.
- `parseBoxShadow` detects the `inset` keyword anywhere in the serialization — real browsers put it at the END in computed styles, so inset shadows were previously converted into outer drop-shadows. Multiple shadows are split correctly and the first non-inset one is used.
- Every exported generator sanitizes `pixelSize` — `pixelSize: 0` no longer hangs the tab (infinite loop) or throws `RangeError`.

**Packaging**

- ESM consumers under `moduleResolution: node16/nodenext` now get the ESM declaration file (`index.d.mts`) via per-condition `exports` types — fixes the attw "Masquerading as CJS" failure and wrong CJS-interop type errors.

---
"@react-pixel-ui/react": patch
---

fix(react): shadow wrapper collapses width when child uses `min(Xpx, 100%)`

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

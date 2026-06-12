---
"@react-pixel-ui/react": minor
---

React layer fixes: stable DOM across re-measures, resize awareness, StrictMode-safe observers, working responsive mode, and API hardening.

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

---
name: known-gaps
description: RVST features that are not yet implemented or have known limitations.
---

# Known Gaps & Limitations

## Not Implemented

| Feature | Notes |
|---------|-------|
| CSS animations / transitions | No `@keyframes`, `transition`, or `animation` support |
| CSS grid | Taffy supports it but not fully wired in layout.rs |
| position: sticky | Not implemented |
| position: fixed | Partial — collected and drawn in a second pass, but edge cases exist |
| Pseudo-elements (`::before`, `::after`) | Not implemented — no generated content |
| CSS counters | Not implemented |
| `<canvas>` / `<video>` / `<iframe>` | Not applicable (native renderer, not a browser) |
| Scroll snap | Not implemented |
| CSS `clip-path` | Not implemented |
| CSS `mask` / `mask-image` | Not implemented |
| CSS `filter` (blur, brightness, etc.) | Not implemented (box-shadow blur uses a different path) |
| SVG `<use>`, `<clipPath>`, `<defs>` | Not implemented |
| SVG `<circle>`, `<rect>`, `<line>`, `<ellipse>` | Not implemented (only `<path>` and `<polygon>`) |
| `dvh`, `svh`, `lvh` units | Not implemented |
| `ch`, `ex` units | Not implemented |
| Complex `calc()` | Only `calc(Npx + Mpx)` — no nested calc, no mixed units |

## Partial / Approximate

| Feature | Status |
|---------|--------|
| Box-shadow blur | Uses Vello Gaussian blur with σ = blur × 0.71. Very close but not identical to Chrome |
| CSS transforms | `translate()` works and propagates to children. `rotate()`, `scale()`, `skew()` are visual-only (no layout effect) |
| position: absolute | Works but containing block resolution is approximate for deeply nested cases |
| SVG rendering | `<path d>` and `<polygon points>` work. ViewBox scaling works. Nested `<g>` transforms accumulate. But complex SVG features (gradients, filters, masks) are not supported |
| Font rendering | ~1-2% pixel difference from Chrome due to different rasterizer (Vello/Parley vs Skia) |
| Inline layout | Treated as inline-block. True inline text flow (wrapping around floats) not implemented |
| `overflow: auto/scroll` | Scroll containers work but scrollbar rendering is custom (not native-looking) |

## Known Crashes

| App | Error | Cause |
|-----|-------|-------|
| Launcher template | `effect_orphan` | Svelte 5 runtime error — likely a DOM stub gap in event timing |

## Rendering Accuracy

Current pixel-match baseline (todo template vs Chrome):
- **98.75%** match at tolerance=2
- Remaining 1.25%: font rasterization (~50%), layout rounding (~15%), SVG precision (~35%)

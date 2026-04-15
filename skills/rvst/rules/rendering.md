---
name: rendering
description: How RVST renders elements — Vello scene building, box-shadow, SVG, text, transforms, borders, gradients.
---

# Rendering (composite.rs)

All rendering happens in `crates/rvst-engine/src/composite.rs` via the `draw_node_inner()` function, which recursively walks the tree and builds a Vello `Scene`.

## Render Order Per Node

1. **Skip checks**: visibility:hidden, display:none, opacity:0, viewport culling
2. **CSS transform**: `translate(X,Y)` applied as visual offset. Propagates to children via `child_fixed_offset` — EXCEPT inside SVG subtrees (detected by `viewBox` on self or ancestor)
3. **Opacity layer**: if opacity < 1.0, push a Vello compositing layer
4. **Background**: `background-color` or `background-image` (linear/radial gradients)
5. **Box-shadow**: Vello `draw_blurred_rounded_rect()` for real GPU Gaussian blur
6. **Border**: per-side filled rectangles (top/right/bottom/left), supports individual widths/colors
7. **SVG path**: `<path d="...">` rendered via `parse_svg_path()` with viewBox scaling
8. **SVG polygon**: `<polygon points="...">` with accumulated `<g>` transforms
9. **Children**: recursive draw for each child node
10. **Text**: Parley layout → Vello `draw_glyphs()` with inherited color/size/weight

## Box-Shadow

Uses Vello's native `draw_blurred_rounded_rect()` — actual GPU Gaussian blur, not an approximation.

```
CSS: box-shadow: offsetX offsetY blur spread color
     ↓
Shadow rect = element rect + offset + spread (negative spread contracts)
σ = blur × 0.71 (empirically matched to Chrome's rendering)
     ↓
scene.draw_blurred_rounded_rect(transform, shadow_rect, color, radius, σ)
```

For zero-blur shadows (like Tailwind rings `ring-2`), falls through to direct fill.

### Tailwind Rings

`ring-2 ring-gray-200` compiles to `box-shadow: 0 0 0 calc(2px + 0px) rgb(229 231 235 / 1)`. Rendered as a 2px stroke OUTSIDE the element boundary. The `calc()` is parsed from the box-shadow value.

## SVG

### Path elements (`<path d="...">`)
Full SVG path command support: M, L, C, S, Q, T, A, Z, H, V (absolute and relative).

Color resolution: `fill` attr → `currentColor` ancestor walk → default black. `fill="none"` triggers stroke mode instead.

ViewBox: parsed from self, parent, or grandparent. Default 24×24 (common icon size).

### Polygon elements (`<polygon points="...">`)
Points parsed as coordinate pairs, converted to a closed BezPath. Accumulated `<g transform="translate(...)">` offsets from ancestors (up to the nearest `viewBox` element) are applied to coordinates in viewBox space.

### SVG vs CSS transforms
SVG `<g>` transforms are NOT applied as visual pixel offsets. They modify path/polygon coordinates in viewBox space. The `in_svg` detection (line ~208) checks for `viewBox` on self or ancestors to skip the CSS transform code path.

## Text

- Color: inherits from ancestors, default **black** (#000000)
- Font-size: inherits from parent, default 16px
- Font-weight: inherits from parent
- Text-transform: uppercase/lowercase/capitalize supported
- Text-align: left/center/right
- Rendering: Parley for shaping → Vello `draw_glyphs()` with `Affine::translate()`

Text rendering will always differ ~1-2% from Chrome due to different rasterizers (Vello vs Skia).

## CSS Transforms

`transform: translate(X,Y)` — visual offset applied to element AND propagated to all children. Supports px, rem, %, and bare numbers. `rotate()`, `scale()`, `skew()` are parsed but visual-only (no layout effect).

## Borders

Per-side rendering with global style fallback:
- `border-bottom-width: 1px` + global `border-style: solid` → renders bottom border
- Falls back to `border-color` when per-side color isn't set
- Border-bottom draws OUTSIDE the element edge (at y = element_bottom)
- Border-top draws at the element's top edge

## Gradients

`linear-gradient()` and `radial-gradient()` supported. Color stops parsed via `parse_css_color()`. Direction keywords (`to right`, `to bottom`) and angles (`135deg`) supported.

## Opacity

Full support via Vello compositing layers. `opacity: 0` skips rendering entirely.

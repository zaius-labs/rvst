# RVST CSS Property Gap Audit for Zaius

Audited: 2026-04-13
Source files: `rvst-engine/src/layout.rs`, `rvst-engine/src/composite.rs`, `rvst-engine/src/css.rs`, `rvst-shell/src/lib.rs`

## Summary

| Status | Count |
|--------|-------|
| Fully supported | 38 |
| Partially supported | 9 |
| Not supported | 11 |
| **Total Zaius requirements** | **58** |

## Layout Properties

| Property | Status | Notes |
|----------|--------|-------|
| `display` (flex/block) | ✓ | flex, inline-flex, grid, inline-grid, block, inline, contents, none |
| `width` | ✓ | px, %, auto, calc() |
| `height` | ✓ | px, %, auto, calc() |
| `min-width` | ✓ | |
| `min-height` | ✓ | |
| `max-width` | ✓ | |
| `max-height` | ✓ | |
| `padding` (shorthand) | ✓ | shorthand + all sides + logical (inline/block) |
| `padding-top/right/bottom/left` | ✓ | + block-start/end, inline-start/end |
| `margin` (shorthand) | ✓ | shorthand + all sides + logical (inline/block) |
| `margin-top/right/bottom/left` | ✓ | + block-start/end, inline-start/end |
| `gap` | ✓ | row-gap + column-gap from single value |
| `border` | ◇ | width/style/color parsed; per-side borders (top/right/bottom/left) supported; no individual `border-top-left-radius` etc. |
| `border-radius` | ✓ | single value, 4-value shorthand, %, 50% for circles |
| `position` | ✓ | relative, absolute, fixed, sticky (partial) |
| `top` / `left` / `right` / `bottom` | ✓ | px values for positioned elements |
| `flex-direction` | ✓ | row, column, row-reverse, column-reverse |
| `flex-wrap` | ✓ | wrap, nowrap, wrap-reverse |
| `flex-grow` | ✓ | |
| `flex-shrink` | ✓ | |
| `flex-basis` | ✓ | |
| `flex` (shorthand) | ✓ | "1", "0 0 auto", etc. |
| `align-items` | ✓ | center, flex-start, flex-end, stretch, baseline |
| `align-self` | ✓ | |
| `align-content` | ✓ | |
| `justify-content` | ✓ | center, flex-start, flex-end, space-between, space-around, space-evenly |
| `justify-self` | ✓ | |
| `z-index` | ✓ | used for paint ordering in composite.rs |
| `aspect-ratio` | ✓ | numeric ratio |
| `order` | ✗ | not handled — P2 |

## Overflow

| Property | Status | Notes |
|----------|--------|-------|
| `overflow` | ✓ | hidden, scroll, auto mapped to Taffy overflow |
| `overflow-x` | ✓ | |
| `overflow-y` | ◇ | Taffy value set correctly; scroll containers work with trackpad/wheel delta; but no scrollbar rendering, no programmatic `scrollTop` API from JS. Rubber-band snap-back animation exists. |

## Transitions & Animations

| Property | Status | Notes |
|----------|--------|-------|
| `transition` | ✗ | **Not implemented.** No property interpolation system exists. P0 blocker. |
| `@keyframes` | ✗ | CSS parser explicitly skips `@keyframes` rules (line 277 css.rs). P1. |
| `animation` | ✗ | No animation runtime. `requestAnimationFrame` exists in shell but not CSS animations. P1. |

## Colors & Visual

| Property | Status | Notes |
|----------|--------|-------|
| `background-color` | ✓ | hex, rgb(), rgba(), hsl(), named colors (50+ names) |
| `background-image` | ◇ | `linear-gradient()` supported (with direction + color stops). No `radial-gradient`, no `url()` images. |
| `color` | ✓ | full cascade inheritance, ancestor walk for unresolvable values |
| `border-color` | ✓ | per-side + shorthand |
| `opacity` | ✓ | 0.0-1.0, applied in composite pass |
| `visibility` | ✓ | hidden skips rendering |

## Typography

| Property | Status | Notes |
|----------|--------|-------|
| `font-family` | ✓ | system-ui, sans-serif, monospace, serif + custom names |
| `font-size` | ✓ | px, rem, em, inherited |
| `font-weight` | ✓ | numeric (100-900) + bold/normal |
| `font-style` | ✗ | **Not implemented.** No italic/oblique support. P1. |
| `line-height` | ✓ | numeric multiplier + px |
| `text-align` | ✓ | left, center, right (via Parley) |
| `text-decoration` | ✓ | underline, line-through via `text-decoration-line` |
| `text-transform` | ✓ | uppercase, lowercase, capitalize |
| `white-space` | ✓ | normal, nowrap, pre, pre-wrap; inherited |
| `text-overflow` | ✗ | **Not implemented.** No ellipsis truncation. P1. |
| `letter-spacing` | ✓ | px value, inherited from parent |

## Box Model

| Property | Status | Notes |
|----------|--------|-------|
| `box-shadow` | ✓ | offsetX, offsetY, blur, spread, color; Tailwind ring shadows |
| `outline` | ◇ | Focus ring drawn automatically (2px blue) on focused elements, but no CSS `outline` property parsing. P1. |
| `border-width` | ✓ | shorthand + per-side |
| `border-style` | ◇ | parsed but only `solid` renders; `dashed`, `dotted` not drawn. P2. |

## Interactions

| Property | Status | Notes |
|----------|--------|-------|
| `cursor` | ◇ | Automatic based on node type (button=pointer, input=text, default otherwise). No CSS `cursor` property parsing — always inferred from element type. P1. |
| `user-select` | ✗ | **Not implemented.** No text selection control. P2. |
| `pointer-events` | ✓ | `none` checked in hit-testing (inspector.rs, snapshot.rs) |

## Pseudo-classes & Pseudo-elements

| Property | Status | Notes |
|----------|--------|-------|
| `:hover` | ✓ | Tracked via `hovered_node`; CSS rules matched; visual overlay on buttons |
| `:focus` | ✓ | Tracked via `focused_node`; CSS rules matched; focus ring drawn |
| `:active` | ◇ | Parsed and detected in selectors, but `matches_pseudo_conditions` always returns false ("Not tracked yet"). P1. |
| `::before` | ✓ | `pseudo_element_content()` resolves content property with full cascade |
| `::after` | ✓ | Same as ::before |
| `::placeholder` | ◇ | Placeholder text rendered with dimmed color for inputs/textareas, but no CSS `::placeholder` style rules applied. P2. |

## Transform

| Property | Status | Notes |
|----------|--------|-------|
| `transform` | ✓ | `translate(x,y)`, `rotate(deg)`, `scale(x,y)`, `skew(x,y)` all parsed and applied as Vello Affine |

## Priority Ranking

### P0 — Blocking for Zaius (must fix before app work)

1. **`transition`** — Zaius needs smooth hover/focus/panel transitions. Without this, the app feels broken. No interpolation system exists at all.

### P1 — Important (fix during early development)

2. **`@keyframes` / `animation`** — loading spinners, pulse effects, skeleton screens
3. **`:active`** — button press feedback (currently always returns false)
4. **`font-style`** — italic text for emphasis, code comments
5. **`text-overflow`** — ellipsis for truncated file names, long lines
6. **`outline`** — custom focus styles (current auto-ring is not controllable)
7. **`cursor`** — needs CSS property parsing, not just node-type inference
8. **`overflow-y` scroll UX** — needs visible scrollbar rendering + JS `scrollTop` API

### P2 — Nice to have (fix as needed)

9. **`order`** — flex item reordering
10. **`user-select`** — prevent text selection on UI chrome
11. **`::placeholder`** — custom placeholder styling
12. **`border-style`** — dashed/dotted borders
13. **`radial-gradient`** — background-image extension

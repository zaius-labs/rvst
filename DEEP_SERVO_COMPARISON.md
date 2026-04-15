# Deep Servo vs RVST Comparison

Servo commit: HEAD at /tmp/servo. RVST: packages/rvst/ in zaius-app.
Target workload: desktop document editor with panels, modals, scrolling content.

---

## 1. Event System

### RVST Today

**Event objects** (`stubs.js:2748-2850`): All major UI event types are polyfilled — `MouseEvent`, `KeyboardEvent`, `InputEvent`, `PointerEvent`, `FocusEvent`, `WheelEvent`, `TouchEvent`, `DragEvent`, `CompositionEvent`, `ClipboardEvent`, `TransitionEvent`, `AnimationEvent`. Each is a plain object produced by `__rvst_ui_event()` with correct properties (clientX/Y, key, code, modifiers, etc.).

**Bubbling** (`stubs.js:728-764`): `dispatchEvent()` walks from target up through `__parent` chain. Respects `event.bubbles`, `stopPropagation()`, and `stopImmediatePropagation()`. After the element chain, fires document-level then window-level handlers if still bubbling.

**preventDefault** (`stubs.js:731-732`): Wraps the original `preventDefault`, sets a `prevented` flag, and returns `!prevented` from `dispatchEvent()`. The shell checks `beforeinput` prevention at `lib.rs:972-1040`.

**Listener registration** (`stubs.js:877-899`): Supports `once`, `signal` (AbortSignal), and stores `capture` flag. Listeners tracked per-element in `__rvst_listeners`.

**Shell event routing** (`lib.rs:262-970`): Winit `WindowEvent` variants mapped to JS dispatch. Mouse click → `__rvst_dispatch_pointer('pointerdown')` + `mousedown` + click handler. Keyboard → `keydown`/`keyup` dispatched on window then focused element. Scroll → `dispatch_scroll_event`. Context menu → `dispatch_contextmenu`.

### Servo

Full W3C DOM Events spec (`event/event.rs:311-406`): Three-phase dispatch — capture phase (root→target), at-target, bubble phase (target→root). Builds an event path via `append_to_path()`. Handles retargeting across shadow DOM boundaries. Activation behavior for click events. `stopPropagation`, `stopImmediatePropagation`, `preventDefault` all per-spec.

Full event type hierarchy (`event/mouseevent.rs`, `keyboardevent.rs`, `focusevent.rs`, etc.): Proper class inheritance via IDL bindings. `instanceof` works. `relatedTarget` on mouse/focus events. `composedPath()` respects shadow roots.

### Gap Assessment

| Feature | RVST | Servo | Impact |
|---------|------|-------|--------|
| Bubbling phase | **`✓`** works | full spec | low |
| Capture phase | **`✗`** stored but never invoked | full spec | **high** |
| `stopPropagation` | **`✓`** | full spec | low |
| `preventDefault` | **`◇`** works for dispatchEvent + beforeinput | full spec | medium |
| `composedPath()` | **`◇`** built manually in `__rvst_dispatch_pointer` only | per-spec with shadow DOM | medium |
| Event inheritance / `instanceof` | **`✗`** plain objects | IDL bindings | medium |
| `relatedTarget` on focus/mouse | **`✗`** always null | full spec | medium |
| Pointer capture (`setPointerCapture`) | **`✗`** missing | full spec | **high** |

**Capture phase** (`stubs.js:894`): The `capture` flag is recorded on listener entries but `dispatchEvent()` always walks bottom-up (target→root). It never does a top-down capture pass. Svelte 5 uses `|capture` for some patterns (e.g., focus trapping in modals). Drag libraries and portal overlays rely on capture-phase listeners.

**Pointer capture**: No `setPointerCapture`/`releasePointerCapture`. Drag-and-drop that crosses element boundaries will lose the pointer. Critical for resize handles, slider thumbs, and panel dividers.

- **Impact on Zaius**: HIGH — modal overlays and drag resize handles will break
- **Fix complexity**: M (capture phase ~50 LOC in dispatchEvent; pointer capture ~100 LOC in shell)

---

## 2. Focus Management

### RVST Today

**`focus()`/`blur()`** (`stubs.js:693-700`): `focus()` calls `__host.op_set_focus(id)` which sets `tree.focused` in Rust. `blur()` sets focus to 0.

**Tab cycling** (`rvst-tree/src/lib.rs:437-489`): `focusable_nodes()` collects Input, Textarea, Button, and anything with `tabindex` attribute in DFS order. `advance_focus()` cycles through them. Supports forward (Tab) and reverse (Shift+Tab).

**Click-to-focus** (`lib.rs:485-505, 1641-1690`): Mouse click on an element walks up ancestors looking for Input/Textarea/Button and sets `tree.focused`. Dispatches `FocusEvent('focus', { bubbles: false })`.

**Keyboard routing** (`lib.rs:789-970`): When a focused element exists, keyboard events are dispatched to it. Editor-type nodes get special routing through `rvst-editor`.

### Servo

Full W3C focus spec (`node/focus.rs`): `find_click_focusable_area()` walks inclusive ancestors looking for focusable areas. `get_the_focusable_area()` handles elements, scrollable regions, area elements, and the document viewport. `FocusableAreaKind` distinguishes click vs. sequential (Tab) vs. programmatic focus.

Full `tabindex` processing: negative tabindex (focusable but not in tab order), zero (in tab order at document position), positive (explicit tab order). Sequential focus navigation respects `tabindex` ordering.

Focus delegation, shadow DOM focus, dialog focus trapping, `autofocus` attribute handling.

### Gap Assessment

| Feature | RVST | Servo | Impact |
|---------|------|-------|--------|
| Tab cycling (forward/reverse) | **`✓`** | full spec | low |
| `focus()`/`blur()` programmatic | **`✓`** | full spec | low |
| Click-to-focus | **`✓`** | full spec | low |
| `tabindex` negative (focusable, not tabbable) | **`✗`** treated same as positive | full spec | medium |
| `tabindex` positive ordering | **`✗`** always DFS order | full spec | medium |
| Focus trapping (dialog/modal) | **`✗`** no `inert` or trap | `<dialog>` + `inert` | **high** |
| `blur`/`focusout` events on focus change | **`✗`** no blur dispatch on old element | full spec | **high** |
| `activeElement` tracking | **`✗`** `document.activeElement` not synced to focused | full spec | medium |
| `autofocus` attribute | **`✗`** | full spec | low |
| `relatedTarget` on focus events | **`✗`** | full spec | medium |

**Focus trapping**: Modal dialogs need `inert` on background content or manual trap. RVST has no mechanism for this — Tab will cycle through elements behind the modal.

**Blur dispatch**: When focus moves from element A to B, RVST sets `tree.focused = B` but never fires `blur`/`focusout` on A or `focusin` on B. Svelte `on:blur` handlers will not fire.

- **Impact on Zaius**: HIGH — modal focus trapping and blur handlers are essential for forms
- **Fix complexity**: M (blur dispatch ~30 LOC; focus trapping needs `inert` or trap flag ~100 LOC)

---

## 3. Text Layout Edge Cases

### RVST Today

**Text engine** (`rvst-text/src/lib.rs`): Dual backend — cosmic-text for pixel rasterization, Parley for glyph shaping and measurement. Parley is the primary path. Uses `layout.break_all_lines(Some(max_width))` for word wrapping.

**white-space** (`layout.rs:378-389`): Reads `white-space` from own styles or parent. Maps `nowrap` and `pre` to `nowrap=true`. In text measurement (`layout.rs:1675-1687`), `nowrap=true` sets `max_w = f32::MAX` (prevents wrapping).

**pre-wrap/pre-line** (`layout.rs:1141-1142`): `preserve_newlines` flag set for `pre`, `pre-wrap`, `pre-line` — used to preserve `\n` in text content. But this only controls newline preservation, not the full `white-space` behavior (space collapsing, wrapping).

**Word wrapping**: Parley's `break_all_lines()` handles word-level break opportunities. No explicit `overflow-wrap: break-word` or `word-break: break-all` support found.

**Text alignment** (`rvst-text/src/lib.rs:244-249`): `TextAlign::Left`, `Center`, `Right` mapped to Parley alignment.

### Servo

Full CSS Text spec via Stylo: `white-space` shorthand decomposed into `white-space-collapse` and `text-wrap-mode`. `overflow-wrap: break-word` / `anywhere`. `word-break: break-all` / `keep-all`. `text-overflow: ellipsis` with overflow clipping. `hyphens: auto` with language-aware hyphenation.

### Gap Assessment

| Feature | RVST | Servo | Impact |
|---------|------|-------|--------|
| `white-space: normal` (collapse + wrap) | **`✓`** via Parley default | full spec | low |
| `white-space: nowrap` | **`✓`** | full spec | low |
| `white-space: pre` | **`◇`** nowrap=true + preserve newlines | full spec | low |
| `white-space: pre-wrap` | **`◇`** preserves newlines but wrapping behavior untested | full spec | medium |
| `white-space: pre-line` | **`◇`** preserves newlines, collapses spaces | full spec | low |
| `overflow-wrap: break-word` | **`✗`** no support | full spec | **high** |
| `word-break: break-all` | **`✗`** no support | full spec | medium |
| `text-overflow: ellipsis` | **`✗`** no support | full spec | **high** |
| `hyphens` | **`✗`** | full spec | low |
| Bidirectional text (RTL) | **`◇`** Parley has bidi support, unused | full spec | medium |

**`text-overflow: ellipsis`**: No search results anywhere in rvst-engine. Long text in constrained containers (sidebar labels, table cells) will just clip without any visual indication. This is very visible in a document editor.

**`overflow-wrap: break-word`**: Without this, long URLs or continuous strings in a document editor will overflow their container rather than wrapping at character boundaries.

- **Impact on Zaius**: HIGH — ellipsis and word-breaking are visible in every list/sidebar
- **Fix complexity**: M (ellipsis needs overflow detection + glyph truncation; `overflow-wrap` needs Parley's word-break config)

---

## 4. CSS `calc()` and Complex Values

### RVST Today

**calc() parser** (`layout.rs:45-141`): Custom implementation. Handles:
- Binary operators: `+`, `-`, `*`, `/`
- Unit types: `px`, `rem`, `em`, `ch`, `pt`, `vw`, `vh`, `%`
- `%` resolves against `vw` (horizontal context assumed)
- Multiplication handles mixed dimensioned × dimensionless: `calc(0.25rem * 4)`
- Commutative: `calc(8 * 0.25rem)` works

**Tests** (`layout.rs:1727-1776`): Verified examples:
- `calc(100% - 200px)` with vw=800 → 600 ✓
- `calc(50% + 20px)` → 220 ✓
- `calc(4rem - 8px)` → 56 ✓
- `calc(0.25rem * 4)` → 16 ✓
- `calc(48px / 2)` → 24 ✓

**Limitations**: Single binary expression only. No nested `calc()`. No `min()`/`max()`/`clamp()`. `%` always resolves against viewport width, not the property's actual percentage basis (e.g., `padding: calc(50% - 10px)` should resolve `%` against containing block width, not viewport).

### Servo

Full CSS Values spec via Stylo: `calc()` with arbitrary nesting, `min()`, `max()`, `clamp()`, `round()`, `mod()`, `rem()`, `sign()`, `abs()`. Percentage resolution context-aware (width vs. height vs. font-size). Nested `calc(calc(...) + ...)` flattened.

### Gap Assessment

| Feature | RVST | Servo | Impact |
|---------|------|-------|--------|
| Basic `calc(A op B)` | **`✓`** | full spec | low |
| All CSS units in calc | **`✓`** px/rem/em/ch/pt/vw/vh/% | full spec | low |
| Nested `calc()` | **`✗`** | full spec | low |
| `min()`/`max()`/`clamp()` | **`✗`** | full spec | **high** |
| `%` context-aware resolution | **`✗`** always vw | full spec | medium |
| Multi-operator expressions | **`✗`** only binary | full spec | medium |

**`clamp()` missing**: Tailwind v4 generates `clamp()` for fluid typography and responsive spacing. `font-size: clamp(1rem, 2.5vw, 2rem)` is common. Without it, responsive text sizing breaks silently.

- **Impact on Zaius**: HIGH — `clamp()` is used in modern CSS frameworks
- **Fix complexity**: M (add `min`/`max`/`clamp` parsing + evaluation, ~150 LOC)

---

## 5. Stacking Contexts / z-index

### RVST Today

**z-index sorting** (`composite.rs:264-290`): During painting, children are sorted by `z-index` parsed as `i32`. Fast path skips sort when all children have `z-index: 0` or `auto`.

**position:fixed** (`composite.rs:18-54`): Fixed nodes collected in a thread-local during Pass 1, then drawn on top of everything in Pass 2. They ignore scroll offset and stacking context.

**No stacking context creation logic**: RVST does not create isolated stacking contexts. All z-index values compete in the same space. A `z-index: 1` on a deeply nested element will sort against `z-index: 1` on a sibling subtree's child — which is wrong per spec.

### Servo

Full CSS 2.1 + CSS Positioned Layout stacking context rules (`style_ext.rs:693-751`):
- `z-index` non-auto on positioned elements → creates stacking context
- `position: fixed/sticky` → always creates stacking context
- `opacity < 1` → creates stacking context
- `transform`/`perspective`/`transform-style: preserve-3d` → creates stacking context
- `will-change` with stacking-context-relevant properties → creates stacking context
- `filter`, `clip-path`, `mask` → creates stacking context
- `mix-blend-mode` non-normal → creates stacking context
- `isolation: isolate` → creates stacking context

Within a stacking context, paint order is: background → negative z-index → flow content → non-positioned floats → positioned descendants with z-index 0/auto → positive z-index.

### Gap Assessment

| Feature | RVST | Servo | Impact |
|---------|------|-------|--------|
| z-index sorting among siblings | **`✓`** | full spec | low |
| Stacking context creation | **`✗`** no isolation | full spec | **high** |
| z-index scoping to stacking context | **`✗`** global competition | full spec | **high** |
| `position:fixed` above everything | **`✓`** (two-pass) | full spec | low |
| `opacity < 1` creates stacking context | **`✗`** opacity layer exists but no z-scope | full spec | medium |
| Paint order (negative z / flow / positive z) | **`✗`** only sorts by z-index value | full spec | medium |

**Stacking context scoping**: This is the critical gap. In a document editor with a sidebar panel (`z-index: 10`) and a modal overlay (`z-index: 50`), elements inside the sidebar with `z-index: 9999` should still paint below the modal. Without stacking contexts, they will paint on top. This breaks every modal/dropdown/tooltip/popover pattern.

- **Impact on Zaius**: HIGH — modals, dropdowns, and popovers will render incorrectly
- **Fix complexity**: L (requires tracking stacking context boundaries, restructuring paint order in composite.rs, ~300 LOC)

---

## 6. Reflow/Relayout Performance

### RVST Today

**Dirty tracking** (`rvst-tree/src/lib.rs:552-573`): Two boolean flags — `dirty_layout` and `dirty_paint`. Global, not per-node. `mark_needs_layout()` sets `dirty_layout = true`. `mark_needs_paint()` sets `dirty_paint = true`.

**Layout gating** (`lib.rs:1241-1261, 1544-1546`): Layout only runs when `needs_layout()` is true. Paint only runs when `needs_paint()` is true. After processing all ops in `about_to_wait`, checks dirty flags once and runs layout + paint if needed.

**Full Taffy rebuild** (`layout.rs`): When layout runs, it builds the entire Taffy tree from scratch — `build_taffy_tree()` allocates new Taffy nodes for every RVST node. No incremental layout. No node-level dirty tracking.

**Virtual scrolling** (`layout.rs:1020`): For scroll containers, only children within/near the visible viewport get Taffy nodes built. This is the main optimization.

**Text measurement**: `measure_cached()` currently just delegates to `measure()` with no cache (`rvst-text/src/lib.rs:155-164`).

### Servo

Incremental layout: style recalc marks dirty nodes. Layout only recomputes subtrees whose styles changed. Fragment tree caches layout results. Text shaping results cached. Parallel layout via Rayon for independent subtrees.

### Gap Assessment

| Feature | RVST | Servo | Impact |
|---------|------|-------|--------|
| Skip layout when clean | **`✓`** | yes | low |
| Per-node dirty tracking | **`✗`** global boolean | per-node | **high** |
| Incremental Taffy rebuild | **`✗`** full rebuild every time | incremental | **high** |
| Text measurement cache | **`✗`** no cache | cached | **high** |
| Virtual scroll children | **`✓`** | N/A (different arch) | low |
| Parallel layout | **`✗`** | Rayon parallel | medium |

**Full rebuild cost**: Every layout-triggering change (panel resize, typing, scroll container resize) rebuilds the entire Taffy tree. For a document editor with 500+ nodes, this means allocating hundreds of Taffy nodes and measuring all text every frame. At 60fps with typing, this will cause jank.

**Text measurement cache**: `measure_cached()` is a placeholder. Parley layout is expensive (shaping, line breaking). A document with 100 text nodes will re-shape all of them on every layout pass.

- **Impact on Zaius**: HIGH — typing in a document editor will lag
- **Fix complexity**: L (Taffy node cache + text measurement cache ~200 LOC; per-node dirty tracking ~150 LOC)

---

## 7. CSS Custom Properties (`var()`)

### RVST Today

**Dual resolution**: Both JS-side (`stubs.js:52-220`) and Rust-side (`css.rs:370-600`).

**JS-side** (`stubs.js:143-175`): `__rvst_resolve_var()` resolves `var(--name)` and `var(--name, fallback)` against `__rvst_css_vars` dictionary. Supports nested var in fallback. Depth limit of 20. Tailwind v4 `:root` tokens pre-populated (`stubs.js:52`).

**Rust-side** (`css.rs:374-475`): `resolve_var_inherited()` walks ancestor chain to find custom property definitions. Phase 1 collects `--*` properties per node from CSS matches and inline styles. Phase 2 resolves `var()` references. Handles nested `var()` in fallback (`css.rs:690`). Falls back to `:root` variables.

**Inheritance**: Custom properties inherit through the tree via ancestor walk (`css.rs:583-600`).

### Servo

Full CSS Custom Properties spec via Stylo: `var()` resolution during style computation. Proper inheritance through cascade. Cycle detection. `@property` at-rule (typed custom properties with initial values, syntax, inheritance). `env()` function. Substitution in shorthand properties.

### Gap Assessment

| Feature | RVST | Servo | Impact |
|---------|------|-------|--------|
| `var(--name)` basic resolution | **`✓`** | full spec | low |
| `var(--name, fallback)` | **`✓`** | full spec | low |
| Inheritance through ancestor chain | **`✓`** | full cascade | low |
| `:root` variables | **`✓`** | full spec | low |
| Nested `var()` in fallback | **`✓`** | full spec | low |
| `@property` (typed custom props) | **`✗`** | full spec | medium |
| Cycle detection | **`✗`** depth limit only | full spec | low |
| `env()` (safe area insets) | **`✗`** | full spec | low |

**`@property`**: Tailwind v4 uses `@property` rules to define custom properties with initial values and syntax. Without `@property`, properties that rely on `initial-value` (e.g., Tailwind's `--tw-font-weight`) may not have correct defaults. RVST works around this with hardcoded defaults in `stubs.js:50-51` but this is fragile.

- **Impact on Zaius**: MEDIUM — Tailwind v4 workaround exists but brittle
- **Fix complexity**: M (parse `@property` in CSS engine, use initial-value as fallback ~100 LOC)

---

## 8. Media Queries / Viewport Units

### RVST Today

**`vw`/`vh` units** (`layout.rs:19-34`): `parse_len_px()` resolves `vw` and `vh` against passed viewport dimensions. Works in `calc()` too.

**`@media` evaluation** (`css.rs:489-550`): `evaluate_media()` handles:
- `min-width`, `max-width`, `min-height`, `max-height`
- `prefers-color-scheme`
- `not` prefix
- `and` combinator
- Comma-separated OR branches
- Range syntax from lightningcss (`width >= 768px`)
- Bare media types (`screen`, `all`, `print`)

**Viewport update on resize** (`lib.rs:273, 303`): `WindowEvent::Resized` updates CSS engine viewport dimensions and fires `matchMedia` listeners.

**`matchMedia`** (`stubs.js:2696-2697`): Stub implementation exists for window.matchMedia.

### Servo

Full CSS Media Queries Level 4 via Stylo: all media features (resolution, aspect-ratio, orientation, hover, pointer, color-gamut, dynamic-range, forced-colors, prefers-reduced-motion, prefers-contrast). Range syntax. `matchMedia()` with live updates. Container queries (`@container`).

### Gap Assessment

| Feature | RVST | Servo | Impact |
|---------|------|-------|--------|
| `vw`/`vh` units | **`✓`** | full spec | low |
| `@media (min-width)` / `(max-width)` | **`✓`** | full spec | low |
| `prefers-color-scheme` | **`✓`** | full spec | low |
| Resize → re-evaluate queries | **`✓`** | full spec | low |
| `matchMedia()` | **`◇`** stub exists | full spec + live updates | medium |
| `@media (hover)` / `(pointer)` | **`✗`** | full spec | low |
| `@media (prefers-reduced-motion)` | **`✗`** | full spec | medium |
| `@container` queries | **`✗`** | full spec | **high** |
| `svw`/`svh`/`dvw`/`dvh` viewport units | **`✗`** only `vw`/`vh` | full spec | low |
| `cqw`/`cqh` container units | **`✗`** | full spec | medium |

**Container queries**: Tailwind v4 and modern component libraries use `@container` for responsive components that adapt to their container size, not the viewport. Without this, a sidebar panel won't adapt its layout when resized. This is the biggest gap here.

- **Impact on Zaius**: MEDIUM-HIGH — container queries increasingly common but workaround with JS resize observers
- **Fix complexity**: L (container queries require layout-aware query evaluation ~400 LOC)

---

## Priority Summary

### Must Fix Before Real App (HIGH impact)

| # | Gap | Area | Fix Size |
|---|-----|------|----------|
| 1 | Capture phase in event dispatch | Events | M |
| 2 | `setPointerCapture` for drag operations | Events | M |
| 3 | Stacking context creation + z-index scoping | z-index | L |
| 4 | Focus trap for modals (blur/focusout dispatch) | Focus | M |
| 5 | `text-overflow: ellipsis` | Text | M |
| 6 | `overflow-wrap: break-word` | Text | S |
| 7 | `min()`/`max()`/`clamp()` CSS functions | calc() | M |
| 8 | Text measurement cache | Performance | M |
| 9 | Incremental Taffy rebuild / per-node dirty | Performance | L |

### Should Fix (MEDIUM impact)

| # | Gap | Area | Fix Size |
|---|-----|------|----------|
| 10 | `tabindex` ordering (negative / positive) | Focus | S |
| 11 | `@property` rule parsing | var() | M |
| 12 | `%` context-aware resolution in calc() | calc() | M |
| 13 | `relatedTarget` on focus/mouse events | Events | S |
| 14 | `activeElement` sync on document | Focus | S |
| 15 | `@container` queries | Media | L |
| 16 | Multi-operator calc() expressions | calc() | S |
| 17 | Event `instanceof` (class hierarchy) | Events | M |

### Low Priority

| # | Gap | Area |
|---|-----|------|
| 18 | `hyphens` | Text |
| 19 | `env()` safe area insets | var() |
| 20 | `@media (hover)` / `(pointer)` | Media |
| 21 | `autofocus` attribute | Focus |
| 22 | Nested `calc()` | calc() |
| 23 | Small viewport units (`svw`, `dvh`) | Media |

# Stylo CSS Engine Integration Design

## Status: Scaffolding Complete, Implementation Pending

## 1. Why Stylo

RVST currently uses lightningcss for parsing + a hand-written selector matcher + manual
property application. This works for simple cases but breaks on:

- Complex selectors (`:is()`, `:where()`, `:has()`, nested selectors)
- Proper cascade layers (`@layer`)
- CSS custom property inheritance across shadow-like boundaries
- Container queries (`@container`)
- Incremental restyle (currently re-matches all rules on every change)
- Specificity edge cases in Svelte-generated CSS

Stylo is Firefox's production CSS engine, extracted as a standalone crate. Dioxus Blitz
already uses it successfully with Taffy for layout. It gives us browser-grade correctness
for free.

## 2. Stylo Architecture Overview

Stylo is a workspace of ~12 crates. The key ones for integration:

| Crate | crates.io name | Purpose |
|-------|---------------|---------|
| `style/` | `stylo` (lib name: `style`) | Main engine: parsing, cascade, computed values |
| `selectors/` | `selectors` | Selector parsing + matching (generic over DOM) |
| `style_traits/` | `stylo_traits` | Shared types (ToCss, etc) |
| `stylo_dom/` | `stylo_dom` | ElementState, DocumentState bitflags |
| `stylo_atoms/` | `stylo_atoms` | Interned strings (Atom) for CSS/HTML names |
| `servo_arc/` | `servo_arc` | Arc variant with thin-arc and copy-on-write |
| `malloc_size_of/` | `stylo_malloc_size_of` | Heap measurement (required dep) |

Current published version: **0.16.0** (workspace version).

Feature flag: `servo` (not `gecko`). The `servo` feature enables the standalone path
without Firefox/Gecko bindings.

## 3. Adapter Trait Design

### 3.1 The Problem

Stylo operates on its own DOM trait hierarchy:

```
TDocument  -- owns SharedRwLock, quirks mode
  TNode    -- parent/child/sibling traversal, Copy + Clone + Debug
    TElement -- selector matching, style data storage, class/id/attr access
    TShadowRoot -- shadow DOM (can be a no-op stub)
```

Key constraint: **TNode and TElement must be `Copy + Clone`**. They are lightweight
handles (pointers/indices), not owned data. Stylo traverses the tree by copying these
handles around.

RVST's tree is a `HashMap<NodeId, Node>` with `NodeId = u32`. This maps naturally to
Stylo's handle model: our adapter types will be `(NodeId, &Tree)` pairs.

### 3.2 Adapter Types

```rust
// Lightweight Copy handle -- satisfies TNode's Copy requirement
#[derive(Clone, Copy, Debug, PartialEq, Eq, Hash)]
pub struct RvstNode<'a> {
    id: NodeId,
    tree: &'a TreeData,  // shared ref to tree + style data
}

// Same type serves as both TNode and TElement
// (RVST has no distinction -- all nodes can have styles)
// TElement is only returned for element nodes (not text nodes)
pub type RvstElement<'a> = RvstNode<'a>;

// Stub -- RVST has no shadow DOM
#[derive(Clone, Copy, Debug, PartialEq)]
pub struct RvstShadowRoot;

// Document handle
#[derive(Clone, Copy, Debug, PartialEq)]
pub struct RvstDocument<'a> {
    tree: &'a TreeData,
}
```

### 3.3 TreeData -- Shared State

Stylo's `TElement::ensure_data()` needs somewhere to store `ElementData` per node.
We cannot put it inside `rvst_tree::Node` without coupling rvst-tree to Stylo.
Instead, rvst-stylo maintains a parallel map:

```rust
pub struct TreeData {
    pub tree: Tree,                                    // the rvst-tree
    pub element_data: HashMap<NodeId, AtomicRefCell<ElementData>>,
    pub lock: SharedRwLock,                            // Stylo's shared lock
}
```

This is the Blitz pattern: store Stylo's `ElementData` alongside (not inside) the DOM.

### 3.4 Critical TElement Methods

| Method | RVST mapping |
|--------|-------------|
| `local_name()` | `NodeType` -> atom: View="div", Button="button", Input="input", etc |
| `has_namespace()` | Always HTML namespace |
| `id()` | `node.styles.get("id")` |
| `each_class()` | Parse `node.styles.get("class")` by whitespace |
| `style_attribute()` | Build `PropertyDeclarationBlock` from `node.styles` (inline styles) |
| `parent_element()` | `tree.nodes[node.parent]` |
| `prev_sibling_element()` / `next_sibling_element()` | Walk parent's children list |
| `has_dirty_descendants()` | Check `node.dirty` flag |
| `ensure_data()` | Insert into `TreeData::element_data` |
| `borrow_data()` / `mutate_data()` | Borrow from `AtomicRefCell` |
| `state()` | Map hovered/focused to `ElementState::HOVER`/`ElementState::FOCUS` |
| `animation_rule()` / `transition_rule()` | Return None initially (animations come later) |

## 4. CSS Input Pipeline

### Current flow:
```
op_load_css(text) -> lightningcss::StyleSheet::parse() -> CssEngine.rules (Vec<ParsedRule>)
```

### Stylo flow:
```
op_load_css(text) -> style::stylesheets::Stylesheet::from_str()
                  -> stylist.append_stylesheet()
                  -> stylist.flush()  // rebuilds cascade data
```

Stylo's `Stylesheet::from_str()` takes CSS text, a URL origin, and a `SharedRwLock`.
The `Stylist` manages the full cascade (UA + user + author origins).

```rust
use style::stylesheets::{Stylesheet, Origin, DocumentStyleSheet};
use style::shared_lock::SharedRwLock;

pub fn load_css(stylist: &mut Stylist, css_text: &str, lock: &SharedRwLock) {
    let sheet = Stylesheet::from_str(
        css_text,
        UrlExtraData::from(...),  // base URL
        Origin::Author,
        Arc::new(lock.wrap(MediaList::empty())),
        lock.clone(),
        /* loader */ None,
        /* error_reporter */ None,
        QuirksMode::NoQuirks,
        AllowImportRules::Yes,
    );
    let doc_sheet = DocumentStyleSheet(Arc::new(sheet));
    stylist.append_stylesheet(doc_sheet, &guards);
    stylist.flush(&guards);
}
```

## 5. Style Query -- Computed Values

### Current flow:
```
CssEngine::match_node(tree, node_id) -> HashMap<String, String>
  then layout.rs parses strings manually: "16px" -> 16.0f32
```

### Stylo flow:
```
// After traversal, each element has computed styles:
let data = element.borrow_data().unwrap();
let style = data.styles.primary();  // Arc<ComputedValues>

// Access typed values directly:
let display = style.get_box().display;          // Display enum
let width = style.get_position().width;         // Size<LengthPercentageAuto>
let color = style.get_color().color;            // AbsoluteColor
let margin = style.get_margin().margin_top;     // LengthPercentageOrAuto
let padding = style.get_padding().padding_top;  // LengthPercentage
let font_size = style.get_font().font_size;     // FontSize
```

No string parsing. Stylo gives us typed, resolved, inherited computed values.

## 6. Layout Integration (Stylo -> Taffy)

The `values.rs` module converts Stylo's computed values to Taffy's layout types.
This is the same pattern Blitz uses in their `stylo_to_taffy` module.

Key conversions:

```rust
// Display
style.get_box().display -> taffy::Display { Flex, Grid, Block, None }

// Dimensions
style.get_position().width -> taffy::Dimension { Length, Percent, Auto }
style.get_position().height -> same

// Margin/Padding/Border
style.get_margin().margin_* -> taffy::LengthPercentageAuto
style.get_padding().padding_* -> taffy::LengthPercentage
style.get_border().border_*_width -> taffy::LengthPercentage

// Flex
style.get_position().flex_direction -> taffy::FlexDirection
style.get_position().flex_wrap -> taffy::FlexWrap
style.get_position().flex_grow/shrink -> f32
style.get_position().flex_basis -> taffy::Dimension
style.get_position().justify_content -> taffy::JustifyContent
style.get_position().align_items -> taffy::AlignItems
style.get_position().gap -> taffy::Size<LengthPercentage>

// Grid
style.get_position().grid_template_columns -> taffy::TrackSizingFunction
style.get_position().grid_template_rows -> same
```

The `values.rs` module will provide:

```rust
pub fn computed_to_taffy_style(computed: &ComputedValues) -> taffy::Style { ... }
pub fn computed_to_paint_props(computed: &ComputedValues) -> PaintProps { ... }
```

`PaintProps` is a new struct holding color, background, border-radius, opacity, etc.
for the compositor -- replacing the current string-based property extraction in composite.rs.

## 7. Incremental Restyle

Stylo has built-in incremental restyle via its invalidation system:

1. When a node's class changes: call `element.note_state_change()` or mark snapshot
2. When a node is added/removed: mark parent dirty
3. Call `style::traversal::recalc_style_at()` which only recomputes dirty subtrees

The `TreeData` wrapper exposes:

```rust
pub fn mark_node_dirty(&mut self, id: NodeId) { ... }
pub fn restyle(&mut self) { ... }  // runs Stylo's incremental traversal
```

For the initial implementation, we can do full restyle on every frame (same as current
behavior). Incremental optimization comes in a follow-up.

## 8. Dependencies

### Required crates (from crates.io):

```toml
[dependencies]
stylo = { version = "0.16", default-features = false, features = ["servo"] }
selectors = "0.37"
servo_arc = "0.4"
stylo_atoms = "0.16"
stylo_dom = "0.16"
stylo_traits = "0.16"
stylo_static_prefs = "0.16"
stylo_malloc_size_of = "0.16"
```

### Potential conflicts with existing deps:

| RVST dep | Stylo dep | Conflict? |
|----------|-----------|-----------|
| lightningcss 1.0.0-alpha.71 | cssparser 0.36 | No conflict (different crates) |
| taffy 0.9 | (none) | No conflict |
| serde 1 | serde 1 | Compatible |

lightningcss and Stylo use different CSS parsers (lightningcss has its own; Stylo uses
cssparser). They can coexist during migration. After migration, lightningcss is removed
from rvst-engine.

### Build concerns:

- Stylo is large (~200 source files). Expect 30-60s added compile time.
- The `servo` feature pulls in `string_cache`, `encoding_rs`, `url` -- moderate dep tree.
- Stylo requires a build script that generates property tables. This is self-contained.

## 9. Migration Path

### Phase 1: Parallel operation (this PR)
- Create rvst-stylo crate with adapter skeleton
- rvst-engine keeps lightningcss-based css.rs untouched
- No behavior changes

### Phase 2: Style computation via Stylo
- Implement TElement/TNode fully
- Wire `op_load_css` to feed Stylo's Stylist
- Run Stylo traversal to produce ComputedValues per node
- Write `values.rs` to convert ComputedValues to Taffy styles
- Keep css.rs as fallback (feature-gated)

### Phase 3: Layout integration
- Replace layout.rs string parsing with `computed_to_taffy_style()`
- Replace composite.rs string parsing with `computed_to_paint_props()`
- Remove manual `parse_abs_len_px()` and friends

### Phase 4: Incremental restyle
- Hook node mutations (class change, add/remove) to Stylo's invalidation
- Use `RecalcStyle::pre_traverse()` for dirty checking
- Only restyle changed subtrees

### Phase 5: Cleanup
- Remove lightningcss dependency from rvst-engine
- Remove css.rs (ParsedRule, SelectorChain, manual matcher)
- Remove layout.rs string parsing functions

### What to keep from css.rs:
- Nothing. Stylo replaces the entire pipeline: parsing, matching, cascade, computed values.
- The transition logic (`transition.rs`) stays -- it operates on computed value changes.

### What to adapt:
- `rvst-shell/src/css.rs` has a duplicate CssEngine -- same migration applies
- `rvst-web/src/lib.rs` uses CssEngine -- will switch to rvst-stylo API
- Node's `styles: HashMap<String, String>` remains for inline styles (JS-set props)
  but is read by the Stylo adapter instead of the manual matcher

## 10. Reference Implementation

Blitz (DioxusLabs/blitz) is the primary reference. Their `blitz-dom` crate:
- Stores `ElementData` in a `StyloData` field on each node
- Implements TElement/TNode on `&Node` (borrowed reference)
- Converts Stylo computed values to Taffy in a `stylo_to_taffy` module
- Uses `SharedRwLock` + `StylesheetGuards` for thread-safe style data access
- Runs Stylo's parallel traversal via Rayon

Key difference: Blitz owns a full HTML DOM (slab-allocated). RVST has a simpler
`HashMap<NodeId, Node>` tree driven by Svelte 5 ops. Our adapter is thinner.

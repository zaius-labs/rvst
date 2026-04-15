---
name: architecture
description: RVST crate map, pipeline stages, and key source file locations.
---

# Architecture

## Pipeline

```
Svelte 5 source
    ↓ Vite build (with @rvst/vite-plugin)
JS bundle + CSS
    ↓ QuickJS runtime
DOM stubs intercept Svelte's DOM calls → emit Ops
    ↓
Op stream: CreateNode, SetStyle, SetAttr, SetText, Insert, Remove, ...
    ↓
Rust Tree (rvst-tree) — stores nodes + styles
    ↓
lightningcss parses CSS → selector matching → cascade → var() resolution
    ↓
Taffy computes layout (flex, block, absolute)
    ↓
Vello builds GPU scene (composite.rs)
    ↓
wgpu renders to winit window (or headless framebuffer → PNG)
```

## Crate Map

| Crate | Location | Purpose |
|-------|----------|---------|
| `rvst-engine` | `crates/rvst-engine/` | Core: rendering (composite.rs), layout (layout.rs), CSS (css.rs), diff (diff.rs) |
| `rvst-shell` | `crates/rvst-shell/` | App shell: windowed mode (lib.rs), CLI entry (main.rs) |
| `rvst-quickjs` | `crates/rvst-quickjs/` | JS runtime: DOM stubs (stubs.js), host ops bridge (ops.rs) |
| `rvst-tree` | `crates/rvst-tree/` | Tree data structure, op application, dirty tracking |
| `rvst-core` | `crates/rvst-core/` | Shared types: NodeType, Rect, NodeId |
| `rvst-text` | `crates/rvst-text/` | Text measurement + shaping via Parley |
| `rvst-render-wgpu` | `crates/rvst-render-wgpu/` | wgpu surface setup, headless pixel readback |
| `rvst-snapshot` | `crates/rvst-snapshot/` | Scene snapshot → JSON serialization |
| `rvst-analyze` | `crates/rvst-analyze/` | Diagnostic analysis: contrast, layout, a11y, heatmap |

## Key Source Files

| File | Lines | What it does |
|------|-------|-------------|
| `rvst-engine/src/composite.rs` | ~3000 | Vello scene building — backgrounds, borders, box-shadow (Gaussian blur), gradients, SVG paths + polygons, text rendering, opacity, transforms |
| `rvst-engine/src/layout.rs` | ~2700 | Taffy layout config — flex, block, inline, absolute positioning, CSS value parsing, unit conversion |
| `rvst-engine/src/css.rs` | ~2000 | CSS engine — lightningcss parsing, selector matching, specificity cascade, var() resolution, @media evaluation |
| `rvst-engine/src/diff.rs` | ~190 | Pixel-level RGBA image diffing with tolerance, overlay generation, delta maps |
| `rvst-shell/src/main.rs` | ~600 | CLI — all flags, subcommands (diff, analyze, snapshot, render-png, ascii, a11y) |
| `rvst-shell/src/lib.rs` | ~1500 | Windowed app shell — event loop, keyboard/mouse dispatch, resize, focus |
| `rvst-quickjs/src/stubs.js` | ~1500 | DOM stubs — full browser API surface that Svelte expects in QuickJS |
| `rvst-quickjs/src/ops.rs` | ~200 | Host ops bridge — JS calls like op_create_node, op_set_style flow to Rust Ops |
| `rvst-tree/src/lib.rs` | ~1400 | Tree storage, Op::apply(), dirty tracking, scroll state |

## Where to Look

- **Rendering bug** → `composite.rs` first, then `layout.rs`
- **CSS not applied** → `css.rs` (selector matching or cascade)
- **Layout wrong** → `layout.rs` (Taffy config or CSS value parsing)
- **Svelte crash** → `stubs.js` (missing DOM API) or `ops.rs` (bridge gap)
- **CLI issue** → `main.rs`
- **Text rendering** → `composite.rs` (text section) + `rvst-text/src/lib.rs`

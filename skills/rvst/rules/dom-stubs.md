---
name: dom-stubs
description: QuickJS DOM stubs — the browser API surface that Svelte runs against, and the op bridge to Rust.
---

# DOM Stubs & QuickJS Runtime

## How It Works

Svelte 5 expects browser DOM APIs. RVST provides fake implementations in QuickJS that:
1. Look like real DOM nodes to Svelte
2. Intercept mutations (createElement, setAttribute, appendChild, etc.)
3. Emit Op messages to Rust (CreateNode, SetStyle, SetAttr, Insert, SetText, etc.)

## Key Files

- `crates/rvst-quickjs/src/stubs.js` (~1500 lines) — DOM stubs
- `crates/rvst-quickjs/src/ops.rs` (~200 lines) — Rust-side op handler

## Stubs Architecture

```javascript
// Each "element" is a JS object with:
{
  __rvst_id: number,       // Maps to NodeId in Rust tree
  __rvst_tag: string,      // "div", "span", "svg", etc.
  _attrs: {},              // Attribute store
  style: { __raw: {} },    // Inline style proxy
  childNodes: [],          // Child references
  parentNode: null,        // Parent reference
}
```

When Svelte calls `element.setAttribute("class", "foo")`:
1. Stubs store it in `_attrs`
2. Call `__host.op_set_attr(id, "class", "foo")` → Rust
3. Rust applies `Op::SetAttr` to tree
4. CSS engine re-matches selectors for that node

## Common Issues

### Svelte Runtime Error
If Svelte throws `effect_orphan`, `state_unsafe_mutation`, etc.:
- The DOM stub is missing an API Svelte expects
- Check what Svelte is calling in the error stack
- Add the missing property/method to the element prototype in stubs.js

### Missing Browser API
If `TypeError: X is not a function`:
- Add a stub for X in stubs.js
- Most stubs can be no-ops or return sensible defaults
- Key: Svelte must not crash, even if the stub doesn't do anything useful

### Event Handling
Events flow: winit → Rust event dispatch → QuickJS callback → Svelte event handler → DOM mutations → Ops → Rust tree update → re-layout → re-render

### Op Types (ops.rs)

| Op | JS trigger | Effect |
|----|-----------|--------|
| `CreateNode` | `document.createElement(tag)` | Add node to tree |
| `SetStyle` | `element.style.X = Y` | Set inline style |
| `SetAttr` | `element.setAttribute(k, v)` | Set attribute (stored in styles HashMap) |
| `SetText` | `textNode.data = "..."` | Update text content |
| `Insert` | `parent.appendChild(child)` | Insert into tree |
| `Remove` | `parent.removeChild(child)` | Remove from tree |

## CSS Application

When `class` attribute changes via `op_set_attr`:
1. The `__rvst_apply_css(element)` function runs in stubs.js
2. It re-applies all matched CSS rules to the element
3. This triggers `op_set_style` for each matched property

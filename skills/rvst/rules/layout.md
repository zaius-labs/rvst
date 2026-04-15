---
name: layout
description: RVST layout engine — Taffy integration, flex/block, absolute positioning, CSS unit parsing.
---

# Layout Engine (layout.rs)

## How It Works

Layout uses [Taffy](https://github.com/DioxusLabs/taffy), a Rust flexbox/block layout engine. Each node's CSS styles are converted to Taffy `Style` structs, then Taffy computes absolute positions (x, y, w, h) for every node.

## Supported Layout Modes

- **Flexbox**: `display: flex` — direction, wrap, justify-content, align-items, gap, flex-grow/shrink/basis
- **Block**: `display: block` — normal flow
- **Inline**: `display: inline` — treated as inline-block for layout purposes
- **Absolute**: `position: absolute` — positioned relative to nearest positioned ancestor's content-box origin

## CSS Units

| Unit | Supported | Conversion |
|------|-----------|-----------|
| `px` | Yes | Direct |
| `rem` | Yes | × 16 (base font size) |
| `em` | Yes | × parent font-size |
| `%` | Yes | × parent dimension |
| `vh` | Yes | × viewport height |
| `vw` | Yes | × viewport width |
| `dvh`, `svh`, `lvh` | No | — |
| `ch`, `ex` | No | — |
| `calc()` | Partial | Simple `calc(Npx + Mpx)` only |

## Absolute Positioning

`position: absolute` elements:
- Removed from normal flow
- Positioned relative to nearest `position: relative` ancestor
- Default to `top: 0; left: 0` when both are `auto`
- Support `top`, `right`, `bottom`, `left` insets

## Common Layout Issues

| Symptom | Check |
|---------|-------|
| Element has wrong width | Is the CSS unit supported? Check `parse_dimension()` in layout.rs |
| Element not visible (w=0 or h=0) | Check if `display` value is being set. Check if content exists (text nodes need measurement) |
| Flex children not spacing | Check `gap` parsing. Check `justify-content` / `align-items` |
| Absolute element mispositioned | Check if parent has `position: relative`. Check inset values |
| `min-height: 100vh` not working | Check viewport height passed to layout (default 768) |

## Text Measurement

Text nodes get their dimensions from Parley (font shaping). If a text node has w=0 h=0:
1. Check if the font loaded
2. Check if font-size is being inherited (walk parent chain)
3. Check Parley measurement in `rvst-text/src/lib.rs`

## Layout Debugging

```bash
# Check all elements with zero size
./target/release/rvst analyze diagnostics <bundle.js>

# Check a specific element's layout
./target/release/rvst --snapshot <bundle.js> 2>/dev/null | python3 -c "
import json, sys
for n in json.loads(sys.stdin.read())['nodes']:
    ly = n.get('layout') or {}
    s = n.get('styles') or {}
    if n['id'] == TARGET_ID:
        print(f'x={ly.get(\"x\")} y={ly.get(\"y\")} w={ly.get(\"w\")} h={ly.get(\"h\")}')
        for k in ('display','width','height','min-height','max-width','flex-direction','gap','padding'):
            print(f'  {k}: {s.get(k, \"(not set)\")}')
"
```

---
name: css
description: RVST CSS engine — selector matching, cascade, var() resolution, Tailwind debugging.
---

# CSS Engine (css.rs)

## Pipeline

```
CSS text (from bundle or explicit file)
    ↓ lightningcss parse
Rule list (selectors + declarations)
    ↓
For each element: selector_matches(element, selector) → matched rules
    ↓
Cascade: sort by specificity, then source order (later wins at same specificity)
    ↓
Merge into element's styles HashMap
    ↓
var() resolution: walk ancestors for custom property values
    ↓
Final computed styles used by layout + rendering
```

## Selector Matching

The selector matcher in `css.rs` handles:
- Class selectors (`.foo`)
- ID selectors (`#bar`)
- Tag selectors (`div`, `span`)
- Descendant (`.a .b`), child (`.a > .b`), sibling (`.a + .b`, `.a ~ .b`)
- Attribute selectors (`[data-x]`, `[data-x="y"]`)
- `:where()`, `:is()` — inner selectors extracted and matched
- `:not()` — negation
- Tailwind escape sequences (`\[`, `\/`, `\:`)

### Common Selector Issues

| Problem | Cause | Fix |
|---------|-------|-----|
| Tailwind class not matching | CSS escapes like `h-\[80vh\]` not unescaped | Check escape handling in `selector_matches()` |
| Pseudo-element rule applied | `::before`, `::after`, `::-webkit-*` should be skipped | Check pseudo-element filter |
| Vendor pseudo matched | `:-moz-*`, `:-webkit-*` should be skipped entirely | Check vendor prefix filter |
| Wrong rule wins | Specificity or source order bug | Check cascade sort |
| `:where()` not working | Inner selectors not extracted | Check `:where()` handling |

## var() Resolution

Custom properties (`--custom-prop`) are stored in element styles and inherited via ancestor walk:

```
var(--color, fallback)
    ↓
Walk ancestors: does any ancestor have --color in styles?
    ↓ yes → use that value
    ↓ no → use fallback value
```

Tailwind v3 uses var() extensively: `rgb(var(--tw-color) / alpha)`.

## @media Queries

Evaluated against viewport dimensions. Supports: `min-width`, `max-width`, `min-height`, `max-height`, `prefers-color-scheme`.

## Debugging

### Check what styles an element has
```bash
./target/release/rvst --snapshot "$JS" 2>/dev/null | python3 -c "
import json, sys
for n in json.loads(sys.stdin.read())['nodes']:
    s = n.get('styles') or {}
    if 'your-class' in s.get('class', ''):
        for k, v in sorted(s.items()):
            if not k.startswith('-'): print(f'  {k}: {v}')
"
```

### Check for unresolved var()
```bash
./target/release/rvst --snapshot "$JS" 2>/dev/null | grep -o 'var([^)]*)'
```

### Check which CSS rules match an element
Add temporary debug logging in `css.rs` → `apply_css_to_tree()` to print matched selectors for a specific node ID.

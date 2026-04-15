---
name: templates
description: RVST template apps — what each tests, how to rebuild, how to use for validation.
---

# Template Apps

All templates live in `packages/create-rvst/templates/`. Each has a pre-built `dist/` directory with the JS bundle.

## Available Templates

| Template | Path | What it tests |
|----------|------|---------------|
| **todo** | `templates/todo/` | Tailwind v3, gradient backgrounds, box-shadow, SVG icons (path + polygon), border-b dividers, floating labels (absolute + transform), input rings |
| **chat** | `templates/chat/` | Scroll containers, click events, context menus, message bubbles, SVG icons, overflow:hidden |
| **editor** | `templates/editor/` | highlight.js code highlighting, inline text layout, monospace fonts, large DOM trees |
| **launcher** | `templates/launcher/` | Keyboard navigation, search input, frameless window, focus management. **Currently crashes** (`effect_orphan` Svelte error) |
| **dashboard** | `templates/dashboard/` | Custom titlebar, routing, dark/light theme, icons, multi-panel layout |
| **default** | `templates/default/` | Minimal counter app, scoped CSS |
| **tailwind** | `templates/tailwind/` | Tailwind v4 utility classes |
| **shadcn** | `templates/shadcn/` | bits-ui component primitives, Tailwind |
| **calendar** | `templates/calendar/` | Date grid layout, interactive cells |
| **finance** | `templates/finance/` | Charts, tables, number formatting |

## Rebuilding a Template

```bash
cd packages/create-rvst/templates/todo
npm install
npm run build
# Bundle appears in dist/
```

## Running a Template

```bash
JS=$(ls packages/create-rvst/templates/todo/dist/*.js | head -1)
./target/release/rvst "$JS"           # Windowed
./target/release/rvst --snapshot "$JS" # JSON snapshot
./target/release/rvst --render-png=out.png "$JS"  # Headless PNG
```

## Validation Target

The **todo** template is the primary validation target (98.75% pixel match). It exercises the most rendering features: Tailwind CSS, gradients, box-shadow, SVG, borders, transforms, and text styling.

## Adding a New Template

1. Create `packages/create-rvst/templates/<name>/`
2. Add `src/App.svelte`, `src/entry.js`, `vite.config.js`, `package.json`
3. Build: `npm install && npm run build`
4. Add to the template list in `packages/create-rvst/index.js` and `packages/npm/bin/cli.js`

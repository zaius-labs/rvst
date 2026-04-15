---
name: rvst
description: Use when working with RVST — a native desktop engine that renders Svelte 5 apps without a browser. Covers architecture, rendering pipeline, CSS engine, validation, debugging, and template apps.
metadata:
  tags: rvst, svelte, desktop, native, rust, vello, rendering
---

# RVST Development Skill

RVST renders Svelte 5 apps natively: `Svelte → Vite → JS bundle → QuickJS (DOM stubs) → Op stream → Rust Tree → lightningcss → Taffy layout → Vello GPU → winit window`.

No browser. No WebView. No Electron.

## When to use

Use this skill for ANY work on the RVST codebase — rendering fixes, CSS engine changes, layout work, template apps, validation, or npm packaging.

## Architecture

Load [./rules/architecture.md](./rules/architecture.md) for the full crate map, key files, and pipeline details.

## Rendering

When fixing or adding rendering features (backgrounds, borders, shadows, SVG, text, gradients, transforms), load [./rules/rendering.md](./rules/rendering.md).

## CSS Engine

When debugging CSS issues — selectors not matching, colors wrong, var() unresolved, Tailwind classes missing — load [./rules/css.md](./rules/css.md).

## Layout

When fixing layout issues — wrong sizes, bad positioning, flex/block problems — load [./rules/layout.md](./rules/layout.md).

## Validation Pipeline

When verifying rendering accuracy or after making rendering changes, load [./rules/validation.md](./rules/validation.md). This covers the pixel-diff pipeline that compares RVST renders against Chrome screenshots.

## DOM Stubs & QuickJS

When Svelte runtime errors occur or browser APIs are missing, load [./rules/dom-stubs.md](./rules/dom-stubs.md).

## Template Apps

When working with template apps (todo, chat, editor, launcher, dashboard), load [./rules/templates.md](./rules/templates.md).

## npm Packages

When working with `@rvst/cli` or `@rvst/create`, load [./rules/npm.md](./rules/npm.md).

## Quick Reference

```bash
# Build
cargo build --release
cargo test -p rvst-engine --lib

# Run an app
./target/release/rvst <bundle.js>

# Headless snapshot
./target/release/rvst --snapshot <bundle.js>

# Pixel sample
./target/release/rvst --snapshot --pixel-at=X,Y <bundle.js>

# Headless PNG
./target/release/rvst --render-png=out.png <bundle.js>

# Pixel diff
./target/release/rvst diff a.png b.png --out=diff.png --tolerance=2

# Validate (full pipeline)
node scripts/validate.mjs packages/create-rvst/templates/todo

# Cross-app regression
for app in chat editor launcher todo; do
  js=$(ls packages/create-rvst/templates/$app/dist/*.js 2>/dev/null | head -1)
  [ -n "$js" ] && echo "$app: $(./target/release/rvst --snapshot "$js" 2>/dev/null | python3 -c "import json,sys;print(len(json.load(sys.stdin)['nodes']))" 2>/dev/null || echo CRASH)"
done
```

## Rules

- [rules/architecture.md](rules/architecture.md) — Crate map, pipeline, key source files
- [rules/rendering.md](rules/rendering.md) — Vello scene building, box-shadow, SVG, text, transforms, borders
- [rules/css.md](rules/css.md) — Selector matching, cascade, var() resolution, Tailwind debugging
- [rules/layout.md](rules/layout.md) — Taffy integration, flex/block, absolute positioning, CSS units
- [rules/validation.md](rules/validation.md) — Pixel-diff pipeline, cross-app regression, image analysis
- [rules/dom-stubs.md](rules/dom-stubs.md) — QuickJS DOM stubs, browser API surface, op bridge
- [rules/templates.md](rules/templates.md) — Template apps, what each tests, how to rebuild
- [rules/npm.md](rules/npm.md) — @rvst/cli, @rvst/create, binary distribution
- [rules/known-gaps.md](rules/known-gaps.md) — What's not implemented, current limitations

---
name: validation
description: RVST visual validation pipeline — pixel-diff desktop render vs Chrome, cross-app regression, diff analysis.
---

# Validation Pipeline

## What It Does

Compares RVST's headless desktop render against a real Chrome screenshot of the same Svelte app, pixel-by-pixel.

## Running

```bash
# Requires: cargo build --release (rvst binary), npm deps (vite, svelte, tailwindcss, playwright)
node scripts/validate.mjs packages/create-rvst/templates/todo
```

Output in `/tmp/rvst-validate/todo/`:
- `desktop.png` — RVST headless render
- `browser.png` — Playwright Chrome screenshot
- `diff.png` — pixel diff overlay (green = match, red = mismatch)

Options:
```bash
--width=1280          # Viewport width (default 1024)
--height=960          # Viewport height (default 768)
--tolerance=0         # Per-channel tolerance (default 2)
--out-dir=/tmp/foo    # Custom output directory
```

## Viewing Results

Claude Code can't always display PNGs. Convert to JPEG:
```bash
sips -s format jpeg /tmp/rvst-validate/todo/diff.png --out /tmp/diff.jpg
sips -s format jpeg /tmp/rvst-validate/todo/desktop.png --out /tmp/desktop.jpg
sips -s format jpeg /tmp/rvst-validate/todo/browser.png --out /tmp/browser.jpg
```

## Analyzing Diffs

### Row-by-row analysis (find which rows have the most differences)
```python
import png
def load(path):
    reader = png.Reader(filename=path)
    w, h, rows, info = reader.asRGBA8()
    return w, h, [list(row) for row in rows]
w, _, desk = load('/tmp/rvst-validate/todo/desktop.png')
_, _, brow = load('/tmp/rvst-validate/todo/browser.png')
for y in range(768):
    diff = sum(1 for x in range(w) if max(
        abs(desk[y][x*4]-brow[y][x*4]),
        abs(desk[y][x*4+1]-brow[y][x*4+1]),
        abs(desk[y][x*4+2]-brow[y][x*4+2])) > 2)
    if diff > 50:
        print(f"y={y}: {diff} differing pixels")
```

### Pixel comparison at specific coordinates
```bash
# RVST pixel values
./target/release/rvst --snapshot --pixel-at=500,120 --pixel-at=500,130 <bundle.js> 2>&1 | grep pixel

# Browser pixel values (requires pypng)
python3 -c "
import png
r = png.Reader(filename='/tmp/rvst-validate/todo/browser.png')
w, h, rows, info = r.asRGBA8()
rows = list(rows)
for y in [120, 130]:
    row = list(rows[y])
    idx = 500 * 4
    print(f'browser y={y}: rgb({row[idx]},{row[idx+1]},{row[idx+2]})')
"
```

### Crop regions for side-by-side comparison
```bash
sips --cropToHeightWidth 80 1024 --cropOffset 70 0 /tmp/rvst-validate/todo/desktop.png --out /tmp/crop_d.png
sips --cropToHeightWidth 80 1024 --cropOffset 70 0 /tmp/rvst-validate/todo/browser.png --out /tmp/crop_b.png
sips -s format jpeg /tmp/crop_d.png --out /tmp/crop_d.jpg
sips -s format jpeg /tmp/crop_b.png --out /tmp/crop_b.jpg
```

## Cross-App Regression

**MANDATORY after any rendering/layout/CSS change:**

```bash
for app in chat editor launcher todo; do
  js=$(ls packages/create-rvst/templates/$app/dist/*.js 2>/dev/null | head -1)
  if [ -n "$js" ]; then
    count=$(./target/release/rvst --snapshot "$js" 2>/dev/null | python3 -c "
import json,sys; print(len(json.load(sys.stdin)['nodes']))" 2>/dev/null || echo "CRASH")
    echo "$app: $count nodes"
  fi
done
```

All apps must render. Launcher currently crashes (known `effect_orphan` Svelte issue).

## Manual Diff Tool

```bash
./target/release/rvst diff a.png b.png --out=diff.png --tolerance=2
# Reports: match %, differing pixels, max delta
# Exits non-zero if differences found (for CI)
```

## Current Baseline

- **Todo**: 98.75% pixel match (2026-04-08)
- Remaining diff: font rasterization (~50%), layout rounding (~15%), SVG precision (~35%)

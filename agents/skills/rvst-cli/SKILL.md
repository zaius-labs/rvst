---
name: rvst-cli
description: Reference for every RVST CLI mode and test-harness command. Use whenever you need to validate layout, drive a user interaction, or investigate a render bug without a visible window.
type: reference
---

# RVST CLI — every tool the agent has

RVST hosts (typeaway, rvst-app, any downstream app) ship four headless
modes. Every one is a way to see what the user sees without opening a
window. Prefer them over manual launches.

## The four modes

### `--dump` · DOM + layout tree

```bash
target/blitz/release/<bin> --dump path/to/app.js path/to/app.css
```

Prints every Blitz DOM node: id, tag, class/id attributes, computed
width/height/position, display mode, bg/fg colors, padding. Text nodes
show their content preview.

Use when:
- A component is the wrong size (grep for the id or class, check `WxH @ (x,y)`)
- Computed styles look wrong (colors, padding are printed per-node)
- You need to confirm a DOM mutation landed (before/after)

Viewport is fixed at 640×400 in dump mode. That's fine for layout
sanity; use `--ascii` for realistic viewports.

### `--snapshot` · structured JSON

```bash
target/blitz/release/<bin> --snapshot app.js app.css
```

Prints a `SceneSnapshot` as JSON. Same info as `--dump` but machine-readable —
the shape is `rvst_snapshot::SceneSnapshot`. Pipe through `jq` to extract:

```bash
... --snapshot | jq '.nodes[] | select(.attrs.id=="typeaway-editor")'
```

Use for automated tests and diffing.

### `--ascii` · rendered layout visualization

```bash
target/blitz/release/<bin> --ascii app.js app.css
target/blitz/release/<bin> --ascii --view=a11y app.js app.css
```

Runs the resolver at 1280×800 and prints a 120×40 ASCII art rendering of
the node boxes, plus a compact tree. `--view=` options include `semantic`
(default), `a11y`, `tag`, `text`.

Use when:
- You want a quick "does this look roughly right"
- Checking for obvious layout overflow / missing elements
- Capturing in a bug report

### `--test` · interactive JSON protocol

```bash
echo '{"cmd":"snapshot"}' | target/blitz/release/<bin> --test app.js app.css
```

This is the workhorse. Reads one JSON command per line from stdin, prints
one JSON result per line on stdout. Starts with `{"ready":true,"node_count":N}`.
Handles everything interactive.

## Test-harness command reference

All commands take `cmd` (name) + `params` (object). Listed by category.

### State inspection
| cmd | params | returns |
|---|---|---|
| `snapshot` | — | `{node_count, viewport_w, viewport_h, diagnostics_count, nodes}` |
| `find` | `{text?, role?, class?}` | matching nodes |
| `query` | `{selector}` | nodes matching CSS selector |
| `explain` | `{id}` | computed style + layout box |
| `computed_styles` | `{id}` | just the styles |
| `input_state` | `{id}` | value, selection, cursor for form fields |

### Interaction
| cmd | params |
|---|---|
| `click` | `{id, x?, y?}` |
| `scroll` | `{id, dx?, dy?}` |
| `hover` | `{id, x?, y?}` |
| `type` | `{id, text}` — fires keypress events |
| `focus` | `{id}` |
| `navigate` | `{url}` |

### Runtime event injection (HMR / doc events)
| cmd | params |
|---|---|
| `dispatch_event` | `{type, extra?}` — fires a synthetic document-level event |
| `eval` | `{script}` — executes JS in the QuickJS runtime; set `globalThis.__rvst_test_result` to return data |

### Visualization
| cmd | params |
|---|---|
| `ascii` | `{view?, width?, height?}` |
| `screenshot` | `{path}` — renders to PNG |
| `compare_pixels` | `{a, b, tolerance?}` |

### Analysis
| cmd | params |
|---|---|
| `analyze` | — runs visual-audit + spacing-audit bundle |
| `suggest_fixes` | — heuristic fixes for common issues |
| `visual_audit` | — contrast, alignment, overflow |
| `spacing_audit` | — margin/padding consistency |
| `stacking_order` | `{id}` |
| `compare_layout` | `{mark}` |

### Assertions (exit non-zero on failure if you care)
| cmd | params |
|---|---|
| `assert_visible` | `{id}` |
| `assert_clickable` | `{id}` |
| `why_not_visible` | `{id}` — explains why a node is hidden |
| `hit_test` | `{x, y}` — what node is at these coords |
| `list_handlers` | `{id}` — what events does this node listen to |

### Diff workflow
| cmd | params |
|---|---|
| `snapshot_mark` | `{name}` — save current state under a label |
| `diff` | `{mark}` — compare current to a saved mark |

### Session
| cmd | params |
|---|---|
| `wait` | `{ms}` |
| `close` | — |

### Dev-harness only (internal use)
| cmd | params |
|---|---|
| `__test_panic` | — deliberately panics; used to exercise the panic overlay |

## Canonical workflows

### "Does my CSS change produce the right layout?"

```bash
# Snapshot the baseline
target/blitz/release/<bin> --snapshot app.js app.css > /tmp/before.json
# Change the CSS, rebuild
npm run build
target/blitz/release/<bin> --snapshot app.js app.css > /tmp/after.json
# Diff (jq is the easy approach)
diff <(jq -S '.nodes[] | {id,tag,layout}' /tmp/before.json) \
     <(jq -S '.nodes[] | {id,tag,layout}' /tmp/after.json)
```

### "Does my click handler fire?"

```bash
(
  cat <<'CMD'
{"cmd":"eval","params":{"script":"globalThis.__clicked=0;document.addEventListener('click',()=>{globalThis.__clicked++})"}}
CMD
  cat <<'CMD'
{"cmd":"click","params":{"id":<rvst-id>}}
CMD
  cat <<'CMD'
{"cmd":"eval","params":{"script":"globalThis.__rvst_test_result=String(globalThis.__clicked)"}}
CMD
  echo '{"cmd":"close"}'
) | target/blitz/release/<bin> --test app.js app.css
```

Expect `"result":"1"` — otherwise the handler is not wired.

### "What's preventing this button from being clickable?"

```bash
echo '{"cmd":"why_not_visible","params":{"id":<rvst-id>}}' \
  | target/blitz/release/<bin> --test app.js app.css
```

### "Did the HMR event reach the DOM?"

```bash
(
  echo '{"cmd":"snapshot_mark","params":{"name":"pre"}}'
  echo '{"cmd":"dispatch_event","params":{"type":"rvst:hmr-message","extra":{"data":"{\"type\":\"update\",\"updates\":[]}"}}}'
  echo '{"cmd":"diff","params":{"mark":"pre"}}'
  echo '{"cmd":"close"}'
) | target/blitz/release/<bin> --test app.js app.css
```

## Anti-patterns

- **Launching the windowed app to "see if it worked"** when `--ascii` or
  `--test` would answer the same question in 200ms. You can't see the
  window. The validation tools are how you see it.
- **Ignoring a crash because it "still looks ok"** — check `~/Library/Caches/typeaway/last-panic.log`.
  A silent abort is not a passing test.
- **Testing with a single viewport** for a layout change — run `--dump`
  (640×400) and `--ascii` (1280×800) both. Responsive bugs hide in the gap.

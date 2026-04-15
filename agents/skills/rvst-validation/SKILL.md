---
name: rvst-validation
description: Discipline for confirming an RVST rendering / layout / event change actually works. Use before marking any RVST task complete or before committing a render-affecting change.
type: workflow
---

# RVST validation discipline

## The rule

**You cannot see the window. Every claim about visual or layout behavior
has to be backed by a tool output. No eyeball, no vibe check, no "looks
good."**

This document exists because the failure mode is real and repeats: agent
makes a change, launches the app, sees "something," declares victory, moves
on. Meanwhile the user sees a white screen, or text overflowing, or a
button that doesn't actually click. The discipline below prevents that.

## The four levels

Every RVST change should clear as many of these as apply:

### 1. Unit test
Does the logic compile and its pure behavior round-trip? For parsers,
converters, op handlers — this is where drift gets caught cheapest.
Run: `cargo test --release`

### 2. Snapshot test (`--snapshot` / `--dump`)
Does the resolved DOM + layout look right? For layout-sized changes,
this is the strongest non-interactive signal.
Run: `target/blitz/release/<bin> --snapshot app.js app.css | jq ...`

### 3. Interactive test (`--test` + assertions)
Does the interaction produce the expected state change? Click a button,
dispatch an event, verify the DOM or a JS global updated.
Run: command pipeline into `--test`

### 4. Windowed check (last resort)
User launches the app and confirms it looks right. This is NOT sufficient
on its own — the user doesn't see what you think you changed; they see
whatever happened after. Use it to confirm after 1–3 pass, not to skip them.

## The five-step change template

Every non-trivial RVST change follows these five steps. Skip any and you
are guessing.

```
Step 1 — HYPOTHESIS
  Write down, in words, what measurable thing will be different after the
  change. Example: "Node #95 will have height >= 300px (currently 0)."

Step 2 — BASELINE
  Run the tool that measures the thing. Save output.
  Example: `--dump | grep 'node-95'` → "420x0"

Step 3 — CHANGE
  Make the smallest possible code change. One file ideally.

Step 4 — REMEASURE
  Rerun the same tool on the rebuilt binary. Compare to baseline.
  Example: "420x362" — hypothesis confirmed.

Step 5 — COMMIT or ITERATE
  If confirmed: commit with the hypothesis/measurement in the message.
  If not: the hypothesis was wrong — update your understanding, don't
  keep fiddling.
```

## Anti-patterns that produce bad work

### ❌ "Let me just launch the app to see"

When the fix concerns layout or computed styles, the windowed app is
the **least** informative surface. You can't inspect computed boxes. You
can't compare to the prior state. Use `--dump` or `--snapshot`.

### ❌ "I made a change, it seems to work"

"Seems" is not a measurement. If the baseline was "canvas is 0px tall"
and you can't produce a tool output showing "canvas is 362px tall," you
haven't confirmed the change.

### ❌ "Let me disable the broken thing"

Gating off a code path is a workaround, not a fix. If you have to do it
(pre-existing bug, out of scope), file a beads issue, leave a comment
that says "gated off because <specific problem>, tracked in <id>," and
don't describe it as "fixed."

### ❌ "The log says the event fired, so it worked"

An `eprintln!` firing means the Rust code ran. It does not mean the
Svelte handler got called, the DOM mutated, the paint surface updated,
or the user would see the change. Confirm downstream via `--test` + diff.

### ❌ "The test harness doesn't have a command for this"

It almost certainly does, or can be extended in 10 lines. Check
`rvst-cli/SKILL.md` first; `test_harness.rs` is ~500 lines and easy to add to.

## When you genuinely need a windowed check

Some cases only make sense in a real window:
- Vello GPU paint correctness at target DPI
- Animation / frame pacing
- Font metrics under hidpi
- winit window decoration / OS chrome

For those: ask the user to launch and report back. Do not guess.

## The recovery path when things go sideways

If an RVST change produces unexpected behavior:

1. **Don't undo.** Keep the change; the information is more useful than
   the fear of breaking more.
2. **Snapshot the broken state.** `--dump` and `--snapshot` both — layout
   + structure.
3. **Form a specific hypothesis** about why the observed behavior differs
   from expected. Which tool output first shows the deviation?
4. **Bisect** — if you made three edits, revert two, confirm which one is
   responsible. Don't "fix in aggregate."
5. **Write the learning into AGENTS.md** (or the relevant skill) so the
   next agent doesn't make the same mistake.

## Worked example — the canvas-was-0px-tall bug

(This is a real bug we hit during HMR work. Shipped as the fix pattern.)

1. **Hypothesis**: `<canvas>` elements with no intrinsic size inside a
   flex column should resolve to parent height via `height:100%`.
2. **Baseline**: `--dump` showed node #103 as `<div>` 420×0 — not canvas,
   and zero height.
3. **First finding**: Svelte template `<canvas>` was being mapped to
   `NodeType::View` → rendered as `<div>` by the bridge. Fix: add
   `NodeType::Canvas`.
4. **Remeasure**: `<canvas>` now. Still 420×0.
5. **Second hypothesis**: Blitz's `replaced_measure_function` was doing
   `aspect_ratio = 0 / 0 = NaN` and propagating it into the declared
   size, zeroing the height.
6. **Fix**: Fall back to 1:1 aspect when inherent is zero.
7. **Remeasure**: 420×362. Confirmed via `--dump` and `--ascii`.

None of those steps involved opening a window. Every hypothesis was
confirmed or disproven against a tool output.

## Pointer to the tool reference

`rvst-cli/SKILL.md` — every `--test` command, every flag, every canonical
workflow.

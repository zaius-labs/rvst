# RVST — agent working guide

> You are working in the RVST subtree. RVST is the desktop rendering stack:
> forked Blitz DOM engine + Vello painter + Stylo styling + Taffy layout +
> QuickJS sandbox running Svelte. This document is your contract for how to
> do work here. Read it before you make a change.

## The rule that overrides everything else

**Before you claim a render / layout / paint change is working, you must
validate it with the RVST CLI — never by "it looks right in my head."**

The drift failure mode is: make a change → launch the app → see something
wrong → make another change → repeat. You cannot see the window. The
validation tools below *are* how you see it. They are not optional.

## Your tools

The RVST host (`typeaway`/`rvst-app`/any consumer) ships four headless modes
plus a JSON command protocol. Treat them as first-class instruments.

| Mode | What it gives you | When to use |
|---|---|---|
| `--dump` | Full Blitz DOM tree with every node's computed layout, bg color, display mode, padding | Debugging layout sizing / "why is this 0×0?" / inspecting computed styles |
| `--snapshot` | Machine-readable JSON of the post-resolve scene | Diffing a state before/after an op; automated tests |
| `--ascii` | ASCII visualization of the rendered layout at a known viewport | Quick "does this look right?" check without opening a window |
| `--test` | Headless interactive JSON-over-stdin protocol | Driving clicks, typing, HMR dispatches, etc. — the workhorse |

See `agents/skills/rvst-cli/SKILL.md` for the full command reference.
When this repo is installed as a Claude Code plugin (via `/plugin`), the
skills become invokable as `rvst:rvst-cli` and `rvst:rvst-validation`.

## The workflow (not negotiable)

Every RVST change follows this shape:

1. **Hypothesis**. Write down what you expect to be different after the
   change. "Canvas will be 1024×600 instead of 420×0." Specific. Measurable.
2. **Baseline snapshot**. Run `--dump` or `--snapshot` on the current build
   and save the output. This is the "before."
3. **Make the change.**
4. **Rebuild and re-snapshot**. Same tool, same viewport.
5. **Diff.** Compare. Does the observed change match the hypothesis?
   - If yes, commit.
   - If no, you've learned something — update the hypothesis, don't just
     fiddle more knobs.

If you find yourself adjusting a CSS value, relaunching the window, squinting
at the output, and adjusting again — stop. That loop is what `--test` +
`snapshot_mark` + `diff` is for, and it's faster.

## Common tasks, canonical approach

**Layout / sizing bug**
```bash
# 1. Inspect computed layout
target/blitz/release/<app> --dump path/to/app.js path/to/app.css \
  | grep -A 3 "#<node-id>\|<selector>"
# 2. Change code
# 3. Re-dump, confirm the box changed
```

**Click / event dispatch not firing**
```bash
# Drive the event headlessly; inspect result; no visual guessing
echo '{"cmd":"click","params":{"id":<rvst_id>,"x":10,"y":10}}' \
  | target/blitz/release/<app> --test app.js app.css
# Then `snapshot` and/or `diff` to see what changed
```

**Regression hunt**
```bash
# Mark state, do something, compare
(
  echo '{"cmd":"snapshot_mark","params":{"name":"before"}}'
  echo '{"cmd":"<thing that changes DOM>"}'
  echo '{"cmd":"diff","params":{"mark":"before"}}'
  echo '{"cmd":"close"}'
) | target/blitz/release/<app> --test app.js app.css
```

**Crash investigation**
- Check `~/Library/Caches/typeaway/last-panic.log` (panic overlay writes the
  full trace there).
- On next launch, the overlay auto-injects so you see it in-window.
- For a catchable panic, wrap with `std::panic::catch_unwind` — but know
  that burn's parallel kernels abort and don't unwind.

## What "done" looks like

You are done with an RVST task only when:

- [ ] Hypothesis recorded.
- [ ] `--dump` or `--snapshot` confirms the change at the layout/scene level.
- [ ] If user-visible, one of: `--ascii` output attached, OR a `--test`
      assertion (`assert_visible`, `assert_clickable`, `hit_test`, etc.) passes.
- [ ] If CSS/Svelte, verified under `--dev` with HMR (CSS hot-swap or Tier 2
      reload — don't kill-and-relaunch).
- [ ] Release build also works: `cargo build --release --no-default-features`
      compiles (dev-hmr feature is off).

If you're tempted to stop before these steps because "it looks fine" —
that's exactly the failure mode this document exists to prevent.

## Conventions

- **Feature flags**: `dev-hmr` on by default; anything dev-only hides behind
  this cfg so release builds stay lean. If you add a dev tool, gate it.
- **No new runtime primitives** for JS→host communication. Use the existing
  op stream (`Op::*` + `push_op` + `op_hmr_send`-style host functions)
  + host-to-JS via `runtime.dispatch_document_event`. This is an IPC
  boundary — keep it narrow.
- **Bridge ops are typed.** Don't stringify everything. New functionality
  means a new `Op` variant in `rvst-core` + handler in `rvst-blitz-bridge` +
  match arm in `rvst-tree`.
- **Svelte is a consumer, not the owner.** The Rust side drives layout,
  paint, and event routing. The sandbox reacts.

## Pointers

- `agents/skills/rvst-cli/SKILL.md` — every test-harness command with
  examples. Loadable as the `rvst:rvst-cli` Claude Code skill.
- `agents/skills/rvst-validation/SKILL.md` — the validation discipline
  expanded, with anti-patterns to avoid. Loadable as the
  `rvst:rvst-validation` Claude Code skill.
- `.claude-plugin/marketplace.json` — marketplace entry so this repo can
  be added via `/plugin marketplace add <path-or-url>`.
- `../AGENTS.md` (root) — monorepo-wide rules (branch = `dev`, no worktrees,
  beads for planning).
- `../CLAUDE.md` — deprecated; content lives in `../AGENTS.md`.

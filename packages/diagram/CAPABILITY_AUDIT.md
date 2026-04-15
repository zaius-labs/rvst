# RVST Capability Audit for Diagram Rendering

Every major claim needs a green/red status. Source code confidence is not proof.

## Rendering
- [ ] Can render a static scene reliably (not just sometimes)
- [ ] Can export PNG deterministically (same input → same output)
- [ ] Headless mode works on this machine (macOS ARM)
- [ ] No visual glitches at target sizes (1200x675, 1080x1080, 1080x1350)

## Layout (Taffy)
- [ ] Can place nested cards/groups as needed for diagrams
- [ ] Spacing, padding, wrapping, alignment, sizing are predictable
- [ ] Can re-run layout cleanly when dimensions change (no stale state)
- [ ] CSS Grid works (not just flexbox)
- [ ] `auto-fit` / `minmax` works for adaptive column counts

## Text (Parley)
- [ ] Text measurement is accurate (measured width/height match rendered)
- [ ] Can inspect text bounds after layout/render
- [ ] Min/max font size rules can be enforced
- [ ] Custom font (TTF) actually loads via Fontique
- [ ] Font fallback works when custom font is missing
- [ ] Multi-line text wrapping measurement is correct

## Inspection
- [ ] Inspector API gives final node rects after layout
- [ ] Inspector API gives text metrics (font size, bounds)
- [ ] Measurements are usable to drive a second layout pass
- [ ] Can detect: overflow, clipping, truncation

## Edges
- [ ] Can get enough geometry from final layout to compute arrow paths
- [ ] SVG overlay approach is viable (embed SVG in scene or composite)
- [ ] Center-to-center connection works as MVP

## Headless / CI
- [ ] wgpu initializes in headless mode (no window)
- [ ] Software fallback renders stable output
- [ ] Fonts load correctly in headless mode
- [ ] PNG output is usable (not blank, not corrupted)

## Status Key
- [ ] = untested
- [x] = proven (test exists and passes)
- [!] = broken or unreliable (needs fix before proceeding)

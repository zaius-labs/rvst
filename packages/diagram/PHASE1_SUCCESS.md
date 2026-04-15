# Phase 1 Success Criteria

Phase 1 is done when ALL of the following are true:

## Input
- Manual JSON with nodes, groups, edges, labels, and target canvas size

## Output
- PNG render at fixed dimensions

## Requirements
- [ ] All node labels render (no missing text)
- [ ] Layout stays within canvas bounds (zero overflow)
- [ ] Text remains above minimum readable size (≥10px at output resolution)
- [ ] At least one edge rendering approach works (even ugly)
- [ ] Same topology can render in 2 different aspect ratios (1200x675 AND 1080x1080)
- [ ] Render can run locally in headless mode
- [ ] Readability score computed and logged
- [ ] At least one re-layout pass or split decision works

## Not Included (Explicitly Deferred)
- Full D2 support
- Sophisticated edge routing
- Sketch/hand-drawn polish
- Animation export
- CI pipeline
- Custom font (nice to have, not blocking)

# Servo Reference Implementations for RVST CSS Gaps

Audit of Servo (https://github.com/servo/servo) and Stylo (https://github.com/servo/stylo)
for reference implementations relevant to RVST's CSS property gaps.

---

## 1. CSS Transitions (P0)

### Servo/Stylo File Paths

- **Core animation types**: `stylo/style/servo/animation.rs` — `PropertyAnimation`, `Transition`, `Animation`, `AnimationState`, `ElementAnimationSet`, `KeyframesIterationState`
- **Animate trait**: `stylo/style/values/animated/mod.rs` — `Animate` trait, `Procedure` enum, `ToAnimatedValue`, `ToAnimatedZero`
- **Bezier curves**: `stylo/style/bezier.rs` — `Bezier` struct (cubic bezier solver via Newton's method + bisection fallback)
- **Timing functions**: `stylo/style/values/generics/easing.rs` — `TimingFunction` enum (Keyword, CubicBezier, Steps, LinearFunction), `TimingKeyword`, `StepPosition`
- **Computed easing**: `stylo/style/values/computed/easing.rs` — `ComputedTimingFunction::calculate_output()` dispatches to bezier/steps/linear/keyword
- **Color interpolation**: `stylo/style/values/animated/color.rs` — `Animate` impl for `AbsoluteColor` using color space mixing
- **AnimationValue (per-property enum)**: `stylo/style/properties/helpers/animated_properties.mako.rs` — auto-generated enum with one variant per animatable CSS property
- **Script-side orchestration**: `servo/components/script/animations.rs` — `Animations` struct, event dispatch, timeline ticking

### Key Data Structures

```
PropertyAnimation {
    from: AnimationValue,      // start value
    to: AnimationValue,        // end value
    timing_function: TimingFunction,
    duration: f64,             // seconds
}

Transition {
    start_time: f64,
    delay: f64,
    property_animation: PropertyAnimation,
    state: AnimationState,     // Pending | Running | Paused(f64) | Finished | Canceled
    is_new: bool,
    reversing_adjusted_start_value: AnimationValue,
    reversing_shortening_factor: f64,
}

ElementAnimationSet {
    animations: Vec<Animation>,
    transitions: Vec<Transition>,
    dirty: bool,
}

// The Animate trait — the core abstraction
trait Animate: Sized {
    fn animate(&self, other: &Self, procedure: Procedure) -> Result<Self, ()>;
}

enum Procedure {
    Interpolate { progress: f64 },  // standard interpolation
    Add,                            // additive
    Accumulate { count: u64 },      // accumulate
}
```

### How It Works

1. **Style change detection**: `ElementAnimationSet::update_transitions_for_new_style()` compares old computed style vs new computed style. For each property with a `transition-property` match, calls `start_transition_if_applicable()`.

2. **Transition creation**: Creates a `Transition` with `from`/`to` `AnimationValue`s extracted from the old and new computed styles, plus timing function and duration from the CSS.

3. **Per-frame tick**: `Animations::update_for_new_timeline_value()` iterates all transitions. For each running transition, calculates progress = `(now - start_time) / duration`, passes it through `PropertyAnimation::timing_function_output()` to get eased progress, then calls `from.animate(&to, Procedure::Interpolate { progress })` to get the interpolated value.

4. **Bezier solving**: `Bezier::calculate_bezier_output()` uses Newton's method (8 iterations) with bisection fallback. Handles extrapolation for progress outside [0, 1]. The five keywords map to fixed control points (e.g., ease = `(0.25, 0.1, 0.25, 1.0)`).

5. **Interpolation dispatch**: The `Animate` trait is implemented for primitive types (`f32`, `f64`, `i32`), colors (`AbsoluteColor`), and derived for all animatable CSS value types. The `AnimationValue` enum dispatches to the correct type's `Animate::animate()`.

6. **Reversed transitions**: When a transition is reversed mid-flight, Servo calculates `reversing_shortening_factor` from the current progress and adjusts the new transition's duration proportionally.

### RVST Implementation Approach

RVST is much simpler than Servo (no full CSS computed values system), so we can simplify:

1. **TransitionState per node**: Store `HashMap<PropertyId, ActiveTransition>` on each RVST node.
   ```rust
   struct ActiveTransition {
       from: AnimatableValue,  // f32 for lengths, [f32; 4] for colors
       to: AnimatableValue,
       start_time: f64,
       duration: f64,
       timing_fn: TimingFunction,
       state: TransitionState,  // Running | Finished
   }
   ```

2. **Property change detection**: On each style reconciliation (Svelte diff), compare old vs new for each property that has `transition-property` set. If changed, create an `ActiveTransition`.

3. **Per-frame tick**: In the existing `winit` event loop's `RedrawRequested`, iterate all active transitions, compute progress, apply easing, interpolate, and write interpolated values into the node's resolved style before layout.

4. **Bezier solver**: Port `stylo/style/bezier.rs` directly (177 lines, self-contained, no dependencies). Support the 5 keywords + `cubic-bezier()`.

5. **Animatable properties**: Start with the properties RVST actually uses: `opacity`, `background-color`, `color`, `width`, `height`, `padding-*`, `margin-*`, `border-radius`, `transform` (translate/scale). Each needs a simple interpolation impl (lerp for f32, color space mix for colors).

**Estimated complexity**: M (1 week) — bezier solver is a direct port, main work is the transition state machine and per-property interpolation.

---

## 2. CSS Animations / @keyframes (P1)

### Servo/Stylo File Paths

- **@keyframes rule parsing**: `stylo/style/stylesheets/keyframes_rule.rs` — `KeyframesRule`, `Keyframe`, `KeyframeSelector`, `KeyframesStep`, `KeyframesStepValue`, `KeyframesAnimation`
- **Animation state machine**: `stylo/style/servo/animation.rs` — `Animation` struct (lines 525-565), `ComputedKeyframe`, `IntermediateComputedKeyframe`, `KeyframesIterationState`
- **Script-side keyframes DOM**: `servo/components/script/dom/css/csskeyframesrule.rs`, `csskeyframerule.rs`
- **Animation events**: `servo/components/script/dom/event/animationevent.rs`

### Key Data Structures

```
KeyframesRule {
    name: KeyframesName,
    keyframes: Vec<Arc<Locked<Keyframe>>>,
    vendor_prefix: Option<VendorPrefix>,
}

KeyframesStep {
    start_percentage: KeyframePercentage(f32),  // 0.0 to 1.0
    value: KeyframesStepValue,  // ComputedValues | Declarations { block }
    declared_timing_function: bool,
}

Animation {
    name: Atom,
    computed_steps: Box<[ComputedKeyframe]>,
    started_at: f64,
    duration: f64,
    delay: f64,
    fill_mode: AnimationFillMode,        // None | Forwards | Backwards | Both
    iteration_state: KeyframesIterationState,  // Infinite(f64) | Finite(f64, f64)
    state: AnimationState,
    direction: AnimationDirection,        // Normal | Reverse | Alternate | AlternateReverse
    current_direction: AnimationDirection, // Normal | Reverse (resolved per iteration)
}

ComputedKeyframe {
    timing_function: TimingFunction,
    start_percentage: f32,
    values: Box<[AnimationValueOrReference]>,
}
```

### How It Works

1. **Parsing**: `keyframes_rule.rs` parses `@keyframes name { from { ... } to { ... } }` into a `KeyframesRule` containing a list of `Keyframe`s. Each keyframe has a selector (percentage list) and a property declaration block.

2. **Preprocessing**: `IntermediateComputedKeyframe::generate_for_keyframes()` collapses multiple declarations at the same percentage into single keyframes, resolves styles, and produces `ComputedKeyframe`s with pre-resolved `AnimationValue`s.

3. **Per-property interpolation**: For each property, the animation finds the surrounding keyframes (preceding/following that declare the property) and interpolates between them. Uses `AnimationValueOrReference` to avoid redundant lookups via `PropertyDeclarationOffsets`.

4. **Direction handling**: Each iteration can be forward or reverse based on `animation-direction`. `Animation::current_direction` is resolved per-iteration for `alternate` modes.

5. **Fill modes**: `forwards` holds the final value after completion, `backwards` applies the first keyframe value during delay, `both` does both.

6. **Events**: `animationstart`, `animationiteration`, `animationend`, `animationcancel` are queued and dispatched via `Animations::send_pending_events()`.

### RVST Implementation Approach

1. **Parse @keyframes in CSS parser**: Add `@keyframes` rule parsing to RVST's lightningcss-based parser. Extract keyframe percentages and property values into:
   ```rust
   struct KeyframesDefinition {
       name: String,
       steps: Vec<KeyframeStep>,  // sorted by percentage
   }
   struct KeyframeStep {
       percentage: f32,
       properties: Vec<(PropertyId, AnimatableValue)>,
       timing_function: Option<TimingFunction>,
   }
   ```

2. **Animation runtime**: Similar to transitions but with multi-step interpolation. For each frame, calculate which two keyframes bracket the current progress, interpolate between them.

3. **Reuse transition infrastructure**: The `Animate` trait and `Bezier` solver from transitions apply directly. Animations are essentially multi-segment transitions with iteration/direction logic on top.

**Estimated complexity**: M (1 week) — depends on transitions being done first. The state machine (iteration, direction, fill mode) is the main additional work.

---

## 3. Overflow Scroll (P1)

### Servo File Paths

- **ScrollTree**: `servo/components/shared/paint/display_list.rs` — `ScrollTree`, `ScrollTreeNode`, `ScrollableNodeInfo`, `SpatialTreeNodeInfo`
- **Scroll state management**: `servo/components/layout/layout_impl.rs` — `set_scroll_offsets_from_renderer()`, `scroll_offset()`, `set_scroll_offset_from_script()`
- **Display list scroll frames**: `servo/components/layout/display_list/mod.rs` — scroll frame creation during display list building
- **Stacking context overflow**: `servo/components/layout/display_list/stacking_context.rs` — overflow clip handling, scroll container detection
- **Style extension**: `servo/components/layout/style_ext.rs` — `effective_overflow()`, `establishes_scroll_container()`, `OverflowDirection`
- **JS scrollTop API**: `servo/components/script/dom/element/element.rs` — `ScrollTop()`, `SetScrollTop()`, `ScrollLeft()`, `SetScrollLeft()`, `Scroll()`, `ScrollBy()`
- **Scrolling box**: `servo/components/script/dom/scrolling_box.rs`
- **Fragment tree**: `servo/components/layout/fragment_tree/box_fragment.rs` — overflow tracking per fragment

### Key Data Structures

```
ScrollTree {
    nodes: Vec<ScrollTreeNode>,
}

ScrollTreeNode {
    parent: Option<ScrollTreeNodeId>,
    children: Vec<ScrollTreeNodeId>,
    webrender_id: Option<SpatialId>,
    info: SpatialTreeNodeInfo,
}

enum SpatialTreeNodeInfo {
    ReferenceFrame(ReferenceFrameNodeInfo),
    Scroll(ScrollableNodeInfo),
    Sticky(StickyNodeInfo),
}

ScrollableNodeInfo {
    external_id: ExternalScrollId,
    content_rect: LayoutRect,    // full content size (may exceed clip)
    clip_rect: LayoutRect,       // visible viewport
    scroll_sensitivity: AxesScrollSensitivity,
    offset: LayoutVector2D,      // current scroll position
    offset_changed: Cell<bool>,
}
```

### How It Works

1. **Scroll container detection**: During layout, `establishes_scroll_container()` checks if `overflow-x` or `overflow-y` is `scroll`, `hidden`, or `auto`. If so, the element gets a scroll frame node in the `ScrollTree`.

2. **Content vs clip rect**: The `content_rect` holds the full size of all children (the scrollable area). The `clip_rect` is the element's own box (the viewport). The difference is the scrollable extent.

3. **Scroll offset clamping**: `ScrollableNodeInfo::scroll_to_offset()` clamps the new offset to `[0, scrollable_size]` where `scrollable_size = content_rect.size - clip_rect.size` per axis, respecting `scroll_sensitivity` (which axis is scrollable).

4. **Scroll from input**: Mouse wheel events are routed through the compositor to `ScrollTree::scroll_node_or_ancestor()`, which walks up the tree to find a scrollable ancestor. The offset is applied and propagated to WebRender.

5. **Scroll from JS**: `Element::SetScrollTop()` calculates the new offset and sends a `ReflowGoal::UpdateScrollNode` message to layout, which calls `set_scroll_offset_from_script()`.

6. **Display list clipping**: Scroll containers create both a clip (to restrict visible area) and a spatial node (to offset children). Children are rendered at their full positions; the clip + offset combination creates the scrolling effect.

7. **Scrollbar rendering**: Servo delegates scrollbar rendering to WebRender/the compositor. Servo itself does not draw scrollbars in its layout/paint code. This is different from what RVST needs.

### RVST Implementation Approach

RVST already has basic scroll containers via Taffy layout. The gaps are: scrollbar rendering, JS `scrollTop` API, and smooth scroll.

1. **Scroll offset per node**: Add `scroll_offset: Vec2` to RVST's node state. On wheel events, update the offset (clamped to `[0, content_size - viewport_size]`).

2. **Render clipping**: Before rendering children of a scroll container, push a Vello clip rect matching the container's layout box. Translate all children by `-scroll_offset`. This is what Servo does conceptually via its ScrollTree + WebRender spatial nodes.

3. **Scrollbar rendering**: Since RVST uses Vello (not WebRender), we must draw scrollbars ourselves. Render a thin track + thumb rectangle. Thumb position = `scroll_offset / max_scroll * track_height`. Thumb size = `viewport_height / content_height * track_height`. Use overlay rendering (draw on top of clipped content).

4. **JS scrollTop bridge**: Expose `element.scrollTop` getter/setter in the QuickJS polyfill. Getter reads from node's `scroll_offset.y`. Setter updates it and triggers re-render.

5. **Smooth scroll**: Optional — apply an easing function to scroll offset changes over ~300ms (reuse the bezier solver from transitions).

**Estimated complexity**: M (1 week) — scroll offset + clipping is straightforward with Vello. Scrollbar rendering is the most work (hit testing for drag, hover states, auto-hide).

---

## 4. Clipboard JS Bridge (P1)

### Servo File Paths

- **Clipboard DOM object**: `servo/components/script/dom/clipboard/clipboard.rs` — `Clipboard` struct, `ReadText()`, `WriteText()` implementations
- **ClipboardItem**: `servo/components/script/dom/clipboard/clipboarditem.rs`
- **ClipboardEvent**: `servo/components/script/dom/clipboard/clipboardevent.rs`
- **Navigator.clipboard**: `servo/components/script/dom/navigator.rs` — `clipboard: MutNullableDom<Clipboard>` field
- **Embedder message bridge**: `servo/components/servo/servo.rs` — `EmbedderMsg::GetClipboardText`, `EmbedderMsg::SetClipboardText`
- **Clipboard provider (legacy sync)**: `servo/components/script/clipboard_provider.rs`

### How It Works

Servo's clipboard follows the W3C Clipboard API spec:

1. **JS API surface**: `navigator.clipboard` returns a `Clipboard` object with:
   - `readText()` -> `Promise<string>`
   - `writeText(data: string)` -> `Promise<void>`
   - `read()` -> `Promise<ClipboardItems>`
   - `write(items: ClipboardItems)` -> `Promise<void>`

2. **Read flow**: `Clipboard::ReadText()` creates a `Promise`, sends `EmbedderMsg::GetClipboardText` to the embedder (which uses arboard internally), and resolves the promise when the response arrives via `RoutedPromiseListener`.

3. **Write flow**: `Clipboard::WriteText()` creates a Blob from the string, queues a clipboard task that calls `write_blobs_and_option_to_the_clipboard()`, which sends `EmbedderMsg::SetClipboardText` to the embedder.

4. **Embedder bridge**: The actual clipboard access is in the embedder layer. Servo uses arboard (same crate RVST uses). The key pattern is: JS -> Promise -> embedder message -> arboard -> resolve promise.

5. **Permissions**: Servo has TODO stubs for clipboard permission checks but currently allows all access.

### RVST Implementation Approach

RVST already has arboard in its Rust dependencies. The missing piece is the QuickJS polyfill.

1. **QuickJS polyfill**: Register `navigator.clipboard` object in the QuickJS runtime with two methods:
   ```javascript
   navigator.clipboard = {
     readText: () => __rvst_clipboard_read(),
     writeText: (text) => __rvst_clipboard_write(text),
   };
   ```

2. **Rust bridge functions**: Register `__rvst_clipboard_read` and `__rvst_clipboard_write` as native QuickJS functions that call arboard synchronously:
   ```rust
   fn clipboard_read(ctx: &QuickJsContext) -> JsValue {
       let clipboard = arboard::Clipboard::new().unwrap();
       match clipboard.get_text() {
           Ok(text) => JsValue::String(text),
           Err(_) => JsValue::String(String::new()),
       }
   }
   ```

3. **Promise wrapping**: For spec compliance, wrap the synchronous result in a resolved Promise. Since RVST's QuickJS runs single-threaded and arboard is fast, synchronous access is fine (Servo's async pattern is needed because its embedder runs on a different thread).

4. **ClipboardEvent**: Optional for later — `copy`/`cut`/`paste` events. Not needed for basic functionality.

**Estimated complexity**: S (2-3 days) — arboard already works, just need the QuickJS function registration and a small polyfill.

---

## Summary

| Gap | Servo Reference | RVST Approach | Complexity |
|-----|----------------|---------------|------------|
| CSS Transitions | `stylo/style/servo/animation.rs` + `bezier.rs` + `values/animated/` | Per-node transition state, port bezier solver, per-frame interpolation | M (1 week) |
| @keyframes/Animation | `stylo/style/stylesheets/keyframes_rule.rs` + Animation struct | Parse @keyframes, multi-step interpolation, reuse transition infra | M (1 week) |
| Overflow Scroll | `servo/components/shared/paint/display_list.rs` ScrollTree | Scroll offset per node, Vello clip rects, custom scrollbar rendering | M (1 week) |
| Clipboard Bridge | `servo/components/script/dom/clipboard/clipboard.rs` | QuickJS polyfill calling arboard synchronously | S (2-3 days) |

### Key Takeaway

Servo/Stylo's architecture is heavily layered (Stylo for style computation, WebRender for rendering, embedder for platform). RVST is much simpler (QuickJS -> Rust node tree -> Taffy -> Vello), so we can take the core algorithms (bezier solver, interpolation trait, scroll offset clamping) while discarding the IPC/threading/WebRender plumbing. The `Animate` trait pattern and `Bezier` solver from Stylo are directly portable.

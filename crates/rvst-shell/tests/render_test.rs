//! Headless GPU rendering tests — prove Vello produces non-background output.
//!
//! These tests render a real Svelte component tree through the full stack:
//!   Svelte JS → Deno runtime → DOM ops → Rust tree → Taffy layout → Vello scene → wgpu GPU → pixels
//!
//! Prior tests validated the logical tree and layout layers. This file validates
//! that wgpu + Vello actually rasterize visible content into pixel memory.

use rvst_shell::HeadlessSession;

const COUNTER_JS: &str = include_str!("../../../examples/counter/dist/counter.js");

/// Full end-to-end render test: counter component → RGBA pixels.
///
/// Validates:
/// 1. wgpu produces a correctly-sized pixel buffer
/// 2. The output contains pixels that differ from the background fill colour
///    (at least 2% of pixels must differ from the background — proves shapes are rasterised)
///
/// If no GPU adapter is available (CI without GPU, headless Linux with no Vulkan/Metal),
/// the test prints a SKIP message and exits cleanly rather than failing.
#[test]
fn counter_renders_nonblack_pixels() {
    let mut s = HeadlessSession::new(COUNTER_JS, 400, 300);

    // render_pixels() returns None when no GPU adapter is available — skip gracefully.
    let Some(pixels) = s.render_pixels() else {
        eprintln!("SKIP: no GPU adapter available for headless rendering");
        return;
    };

    // 1. Correct buffer size: width × height × 4 bytes (RGBA8).
    assert_eq!(
        pixels.len(),
        400 * 300 * 4,
        "pixel buffer should be exactly 400×300 RGBA (got {} bytes)",
        pixels.len()
    );

    // 2. Count pixels that differ from the background fill colour.
    // Use the top-left corner pixel as the background sample (it is always the base_color fill).
    // This is robust: if the base_color ever changes the test still works correctly.
    let bg = [pixels[0], pixels[1], pixels[2]];
    let non_bg_pixels = pixels
        .chunks(4)
        .filter(|px| {
            (px[0] as i32 - bg[0] as i32).abs() > 10
                || (px[1] as i32 - bg[1] as i32).abs() > 10
                || (px[2] as i32 - bg[2] as i32).abs() > 10
        })
        .count();
    let total_pixels = (400 * 300) as usize;
    assert!(
        non_bg_pixels > total_pixels / 50,
        "only {}/{} pixels differ from background [{},{},{}] — Vello may not be drawing shapes",
        non_bg_pixels,
        total_pixels,
        bg[0],
        bg[1],
        bg[2],
    );
}

/// After a click, the counter increments.  Render both before and after states and
/// confirm the pixel buffers differ — proving reactive re-render produces new visual output.
#[test]
fn counter_pixels_change_after_click() {
    let mut s = HeadlessSession::new(COUNTER_JS, 400, 300);

    // Render initial state — skip if no GPU adapter.
    let Some(before) = s.render_pixels() else {
        eprintln!("SKIP: no GPU adapter available for headless rendering");
        return;
    };

    // Click the counter button.
    s.click("Count: 0").expect("click should succeed");

    // Verify the DOM state changed (belt-and-suspenders alongside pixel diff).
    let dom_check = s.inspector().find("Count: 1").is_visible();
    assert!(
        dom_check.ok,
        "DOM should show 'Count: 1' after click: {}",
        dom_check.reason
    );

    // Render post-click state.
    let Some(after) = s.render_pixels() else {
        eprintln!("SKIP: no GPU adapter available for post-click render");
        return;
    };

    // The two pixel buffers should differ — text changed from "Count: 0" to "Count: 1".
    let differ = before.iter().zip(after.iter()).any(|(a, b)| *a != *b);
    assert!(
        differ,
        "pixel buffer did not change after incrementing counter — reactive re-render may be broken"
    );
}

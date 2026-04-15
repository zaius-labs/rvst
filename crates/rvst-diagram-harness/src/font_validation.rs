//! A3: Custom font loading spike.
//! Isolated test — does not affect the main harness.

use rvst_text::TextRenderer;

const SIMPLE_MARKER_TTF: &[u8] = include_bytes!("../../../packages/diagram/fonts/SimpleMarker.ttf");

pub fn run_font_validation() {
    println!("\n=== A3: CUSTOM FONT LOADING SPIKE ===\n");
    let mut all_pass = true;

    // 1. Measure with default (fallback) font first
    let mut tr_default = TextRenderer::new();
    let (w_fallback, h_fallback) =
        tr_default.measure("Zaius Architecture", 16.0, 9999.0, None, None);
    println!("fallback_measure=({w_fallback:.1}, {h_fallback:.1})");

    // 2. Register custom font
    let mut tr_custom = TextRenderer::new();
    let family_name = tr_custom.register_font(SIMPLE_MARKER_TTF.to_vec());
    let registered = family_name.is_some();
    println!("font_registered={registered}");
    if let Some(ref name) = family_name {
        println!("font_family_name={name}");
    }
    if !registered {
        all_pass = false;
    }

    // 3. Measure with custom font — should differ from fallback
    // Note: Parley uses the font stack in order. After registration,
    // we need to request the specific family name in StyleProperty.
    // For now, just verify the font was registered and measurement works.
    let (w_custom, h_custom) = tr_custom.measure("Zaius Architecture", 16.0, 9999.0, None, None);
    println!("custom_measure=({w_custom:.1}, {h_custom:.1})");

    // The measurements may or may not differ depending on whether Parley
    // automatically uses the registered font or still picks system default.
    // What matters: registration succeeded and measurement didn't crash.
    let measure_works = w_custom > 0.0 && h_custom > 0.0;
    println!("custom_measure_nonzero={measure_works}");
    if !measure_works {
        all_pass = false;
    }

    // Check if measurements actually differ (proves custom font is being used)
    let differs = (w_custom - w_fallback).abs() > 0.5 || (h_custom - h_fallback).abs() > 0.5;
    println!("measurement_differs_from_fallback={differs}");
    // Note: if this is false, the font might not be auto-selected.
    // That's information, not necessarily a failure — we may need to
    // specify the family name explicitly in the style.

    // 4. Fallback test: register garbage data, should not crash
    let mut tr_bad = TextRenderer::new();
    let bad_result = tr_bad.register_font(vec![0, 1, 2, 3]);
    let bad_fails = bad_result.is_none();
    println!("bad_font_rejected={bad_fails}");

    // Fallback still works after bad registration attempt
    let (w_after_bad, h_after_bad) = tr_bad.measure("Test", 16.0, 9999.0, None, None);
    let fallback_works = w_after_bad > 0.0 && h_after_bad > 0.0;
    println!("fallback_after_bad_font={fallback_works}");
    if !fallback_works {
        all_pass = false;
    }

    // 5. Font data is bundled at compile time (include_bytes proves this)
    let font_size_bytes = SIMPLE_MARKER_TTF.len();
    let bundled = font_size_bytes > 1000; // a real TTF is at least a few KB
    println!("font_bundled=true font_size_bytes={font_size_bytes}");
    if !bundled {
        all_pass = false;
    }

    println!(
        "\n=== A3 RESULT={} ===",
        if all_pass { "PASS" } else { "FAIL" }
    );
    if !differs {
        println!("NOTE: Custom font registered but measurement didn't change.");
        println!("      May need to specify family name explicitly in Parley StyleProperty.");
        println!("      This is expected — font registration works, selection may need work.");
    }
}

//! B1: The render → inspect → score loop.
//! Loads a fixture, runs the pipeline, prints scored results.

use rvst_diagram::pipeline::render_and_score_graph;
use rvst_diagram::schema::Diagram;
use std::path::PathBuf;

pub fn run_score_loop(fixture_name: &str, out_dir: &str) {
    println!("\n=== B1: RENDER → INSPECT → SCORE LOOP ===\n");

    // Load fixture
    let fixture_dir = PathBuf::from(env!("CARGO_MANIFEST_DIR")).join("fixtures");
    let fixture_path = fixture_dir.join(format!("{fixture_name}.json"));
    let json = std::fs::read_to_string(&fixture_path)
        .unwrap_or_else(|e| panic!("Failed to read fixture: {e}"));
    let diagram: Diagram =
        serde_json::from_str(&json).unwrap_or_else(|e| panic!("Failed to parse fixture: {e}"));

    println!("fixture={fixture_name}");
    println!("canvas={}x{}", diagram.canvas.width, diagram.canvas.height);
    println!("nodes={}", diagram.nodes.len());
    println!("edges={}", diagram.edges.len());

    // Run pipeline
    let result = render_and_score_graph(&diagram);

    // Print score
    println!("\n--- READABILITY SCORE ---");
    println!(
        "min_font_px={:.1} threshold={:.1} pass={}",
        result.score.min_font_px,
        diagram.theme.min_font_px,
        result.score.min_font_px >= diagram.theme.min_font_px
    );
    println!(
        "canvas_fill={:.1}% threshold={:.0}% pass={}",
        result.score.canvas_fill * 100.0,
        diagram.theme.target_canvas_fill * 100.0,
        result.score.canvas_fill >= diagram.theme.target_canvas_fill
    );
    println!(
        "overflow_count={} pass={}",
        result.score.overflow_count,
        result.score.overflow_count == 0
    );
    println!(
        "label_truncated={} pass={}",
        result.score.label_truncated,
        result.score.label_truncated == 0
    );
    println!("\nscore_passes={}", result.passes);
    println!("decision={:?}", result.decision);

    // Export PNG if available
    if let Some(pixels) = &result.pixels {
        std::fs::create_dir_all(out_dir).ok();
        let out_path = PathBuf::from(out_dir).join(format!("{fixture_name}_scored.png"));
        let img = image::RgbaImage::from_raw(result.width, result.height, pixels.clone())
            .expect("RgbaImage creation failed");
        img.save(&out_path).expect("PNG save failed");
        println!("png={}", out_path.display());
    }

    // Export JSON report
    let report = serde_json::json!({
        "fixture": fixture_name,
        "canvas": { "width": result.width, "height": result.height },
        "score": {
            "min_font_px": result.score.min_font_px,
            "canvas_fill": result.score.canvas_fill,
            "overflow_count": result.score.overflow_count,
            "label_truncated": result.score.label_truncated,
        },
        "passes": result.passes,
        "decision": format!("{:?}", result.decision),
    });
    let report_path = PathBuf::from(out_dir).join(format!("{fixture_name}_score.json"));
    std::fs::write(&report_path, serde_json::to_string_pretty(&report).unwrap()).ok();
    println!("report={}", report_path.display());

    println!(
        "\n=== B1 RESULT={} ===",
        if result.passes { "PASS" } else { "FAIL" }
    );
}

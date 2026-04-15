//! RVST Diagram Harness — capability proof for diagram rendering.
//!
//! Loads a fixture JSON, builds a tree via ops, runs Taffy layout,
//! renders headless to PNG, and outputs a machine-readable report.
//!
//! Usage:
//!   cargo run -p rvst-diagram-harness -- --fixture basic_group --out /tmp/out.png

mod animate;
mod edges_validation;
mod fixture_suite;
mod font_validation;
mod graph_build_validation;
mod graph_validation;
mod headless_validation;
mod inspector_validation;
mod layout_validation;
mod phase1_gate;
mod retry_validation;
mod score_loop;
mod split_validation;
mod text_validation;

use rvst_diagram::schema::Diagram;
use std::path::PathBuf;

fn main() {
    let args: Vec<String> = std::env::args().collect();

    // Subcommands
    match args.get(1).map(|s| s.as_str()) {
        Some("validate-text") => {
            text_validation::run_text_validation();
            return;
        }
        Some("validate-font") => {
            font_validation::run_font_validation();
            return;
        }
        Some("validate-layout") => {
            layout_validation::run_layout_validation();
            return;
        }
        Some("validate-headless") => {
            headless_validation::run_headless_validation();
            return;
        }
        Some("validate-inspector") => {
            inspector_validation::run_inspector_validation();
            return;
        }
        Some("validate-retry") => {
            retry_validation::run_retry_validation();
            return;
        }
        Some("validate-edges") => {
            edges_validation::run_edges_validation();
            return;
        }
        Some("render") => {
            // Full pipeline: load → retry loop → export PNG + report
            let fixture = args.get(2).map(|s| s.as_str()).unwrap_or("basic_group");
            let out_dir = args
                .get(3)
                .map(|s| s.as_str())
                .unwrap_or("/tmp/diagram-harness");
            run_full_render(fixture, out_dir);
            return;
        }
        Some("phase1") => {
            phase1_gate::run_phase1_gate();
            return;
        }
        Some("validate-graph") => {
            graph_validation::run_graph_validation();
            return;
        }
        Some("validate-graph-build") => {
            graph_build_validation::run_graph_build_validation();
            return;
        }
        Some("fixture-suite") => {
            fixture_suite::run_fixture_suite();
            return;
        }
        Some("validate-split") => {
            split_validation::run_split_validation();
            return;
        }
        Some("animate") => {
            let fixture = args.get(2).map(|s| s.as_str()).unwrap_or("large_12");
            let out = args
                .get(3)
                .map(|s| s.as_str())
                .unwrap_or("/tmp/diagram-harness/animated.gif");
            animate::run_animate(fixture, out);
            return;
        }
        Some("snapshot-test") => {
            // Render two fixtures, verify deterministic output
            run_snapshot_test();
            return;
        }
        Some("score") => {
            let fixture = args.get(2).map(|s| s.as_str()).unwrap_or("basic_group");
            let out = args
                .get(3)
                .map(|s| s.as_str())
                .unwrap_or("/tmp/diagram-harness");
            score_loop::run_score_loop(fixture, out);
            return;
        }
        Some("validate-all") => {
            text_validation::run_text_validation();
            font_validation::run_font_validation();
            layout_validation::run_layout_validation();
            headless_validation::run_headless_validation();
            inspector_validation::run_inspector_validation();
            return;
        }
        _ => {}
    }

    let fixture_name = args
        .iter()
        .position(|a| a == "--fixture")
        .and_then(|i| args.get(i + 1))
        .map(|s| s.as_str())
        .unwrap_or("basic_group");

    let out_path = args
        .iter()
        .position(|a| a == "--out")
        .and_then(|i| args.get(i + 1))
        .map(PathBuf::from)
        .unwrap_or_else(|| PathBuf::from(format!("/tmp/diagram-harness/{fixture_name}.png")));

    // Load fixture
    let fixture_dir = PathBuf::from(env!("CARGO_MANIFEST_DIR")).join("fixtures");
    let fixture_path = fixture_dir.join(format!("{fixture_name}.json"));
    let fixture_json = std::fs::read_to_string(&fixture_path)
        .unwrap_or_else(|e| panic!("Failed to read fixture {}: {e}", fixture_path.display()));
    let diagram: Diagram = serde_json::from_str(&fixture_json)
        .unwrap_or_else(|e| panic!("Failed to parse fixture JSON: {e}"));

    // Use unified graph pipeline
    let result = rvst_diagram::pipeline::render_and_score_graph(&diagram);

    println!("fixture={fixture_name}");
    println!("canvas_w={}", diagram.canvas.width);
    println!("canvas_h={}", diagram.canvas.height);
    println!("node_count={}", diagram.nodes.len());
    println!("edge_count={}", diagram.edges.len());
    println!("layout_completed=true");
    println!("score_passes={}", result.passes);
    println!("min_font={:.0}", result.score.min_font_px);
    println!("canvas_fill={:.0}%", result.score.canvas_fill * 100.0);

    // Export PNG
    let png_written = if let Some(pixels) = &result.pixels {
        if let Some(parent) = out_path.parent() {
            std::fs::create_dir_all(parent).ok();
        }
        let img = image::RgbaImage::from_raw(result.width, result.height, pixels.clone())
            .expect("Failed to create image");
        img.save(&out_path).expect("Failed to save PNG");
        println!("png_path={}", out_path.display());
        true
    } else {
        eprintln!("WARN: no GPU adapter — PNG export skipped");
        false
    };
    println!("png_written={png_written}");

    // Write JSON report
    let report_path = out_path.with_extension("json");
    let report = serde_json::json!({
        "fixture": fixture_name,
        "canvas": { "width": diagram.canvas.width, "height": diagram.canvas.height },
        "score": {
            "min_font_px": result.score.min_font_px,
            "canvas_fill": result.score.canvas_fill,
            "overflow_count": result.score.overflow_count,
            "label_truncated": result.score.label_truncated,
        },
        "passes": result.passes,
        "decision": format!("{:?}", result.decision),
    });
    std::fs::write(&report_path, serde_json::to_string_pretty(&report).unwrap()).ok();
    println!("report_path={}", report_path.display());
    println!("RESULT={}", if result.passes { "PASS" } else { "FAIL" });
}

/// Full render pipeline: load fixture → retry loop → export PNG + JSON report.
fn run_full_render(fixture_name: &str, out_dir: &str) {
    use rvst_diagram::retry::retry_loop;
    use rvst_diagram::schema::Diagram;

    let fixture_dir = std::path::PathBuf::from(env!("CARGO_MANIFEST_DIR")).join("fixtures");
    let json = std::fs::read_to_string(fixture_dir.join(format!("{fixture_name}.json")))
        .unwrap_or_else(|e| panic!("Fixture not found: {e}"));
    let diagram: Diagram = serde_json::from_str(&json).unwrap();

    let result = retry_loop(&diagram);

    println!("fixture={fixture_name}");
    println!("passes_attempted={}", result.passes);
    println!("score_passes={}", result.render.passes);
    println!("decision={:?}", result.render.decision);

    for entry in &result.log {
        println!(
            "  pass={} adj=\"{}\" font={:.0} fill={:.0}% overflow={} trunc={} ok={}",
            entry.pass,
            entry.adjustment,
            entry.score.min_font_px,
            entry.score.canvas_fill * 100.0,
            entry.score.overflow_count,
            entry.score.label_truncated,
            entry.passed
        );
    }

    std::fs::create_dir_all(out_dir).ok();
    if let Some(pixels) = &result.render.pixels {
        let path = std::path::PathBuf::from(out_dir).join(format!("{fixture_name}.png"));
        let img =
            image::RgbaImage::from_raw(result.render.width, result.render.height, pixels.clone())
                .unwrap();
        img.save(&path).unwrap();
        println!("png={}", path.display());
    }
}

/// Snapshot test: render same fixture twice, verify deterministic output.
fn run_snapshot_test() {
    use rvst_diagram::pipeline::render_and_score_graph;
    use rvst_diagram::schema::Diagram;

    println!("\n=== SNAPSHOT TEST ===\n");

    let fixture_dir = std::path::PathBuf::from(env!("CARGO_MANIFEST_DIR")).join("fixtures");
    let json = std::fs::read_to_string(fixture_dir.join("basic_group.json")).unwrap();
    let diagram: Diagram = serde_json::from_str(&json).unwrap();

    let r1 = render_and_score_graph(&diagram);
    let r2 = render_and_score_graph(&diagram);

    let (Some(px1), Some(px2)) = (&r1.pixels, &r2.pixels) else {
        println!("SKIP: no GPU adapter");
        return;
    };

    let identical = px1 == px2;
    println!("deterministic={identical}");
    println!("buffer_size={}", px1.len());

    if !identical {
        let max_diff: u8 = px1
            .iter()
            .zip(px2.iter())
            .map(|(&a, &b)| (a as i16 - b as i16).unsigned_abs() as u8)
            .max()
            .unwrap_or(0);
        let mse: f64 = px1
            .iter()
            .zip(px2.iter())
            .map(|(&a, &b)| (a as f64 - b as f64).powi(2))
            .sum::<f64>()
            / px1.len() as f64;
        println!("max_channel_diff={max_diff}");
        println!("mse={mse:.4}");
        let within = max_diff < 3 && mse < 0.5;
        println!("within_tolerance={within}");
        println!("SNAPSHOT_TEST={}", if within { "PASS" } else { "FAIL" });
    } else {
        println!("SNAPSHOT_TEST=PASS");
    }
}

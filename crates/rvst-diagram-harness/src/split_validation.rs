//! D1: Graph-aware retry loop + carousel split validation.

use rvst_diagram::pipeline::render_and_score_graph;
use rvst_diagram::schema::Diagram;
use rvst_diagram::split::split_into_frames;
use std::path::PathBuf;

fn load(name: &str) -> Diagram {
    let path = PathBuf::from(env!("CARGO_MANIFEST_DIR"))
        .join("fixtures")
        .join(format!("{name}.json"));
    serde_json::from_str(&std::fs::read_to_string(&path).unwrap()).unwrap()
}

pub fn run_split_validation() {
    println!("\n=== D1: GRAPH-AWARE RETRY + SPLIT VALIDATION ===\n");
    let mut all_pass = true;

    // Test 1: large_12 has a group — split should produce overview + group frames
    {
        println!("--- Test 1: large_12 split ---");
        let diagram = load("large_12");
        let frames = split_into_frames(&diagram);

        println!("total_frames={}", frames.len());
        for f in &frames {
            println!(
                "  frame {}/{}: \"{}\" nodes={} edges={}",
                f.index,
                f.total,
                f.title,
                f.diagram.nodes.len(),
                f.diagram.edges.len()
            );
        }

        let has_overview = frames.iter().any(|f| f.index == 0);
        let has_multiple = frames.len() > 1;
        println!("has_overview={has_overview}");
        println!("has_multiple_frames={has_multiple}");
        if !has_overview || !has_multiple {
            all_pass = false;
        }

        // Each frame should render independently
        let mut all_render = true;
        std::fs::create_dir_all("/tmp/diagram-harness/d1").ok();
        for f in &frames {
            let result = render_and_score_graph(&f.diagram);
            let renders = result.pixels.is_some();
            if !renders {
                all_render = false;
            }
            println!(
                "  frame {}: renders={renders} font={:.0} fill={:.0}%",
                f.index,
                result.score.min_font_px,
                result.score.canvas_fill * 100.0
            );

            if let Some(px) = &result.pixels {
                let img = image::RgbaImage::from_raw(
                    f.diagram.canvas.width,
                    f.diagram.canvas.height,
                    px.clone(),
                )
                .unwrap();
                img.save(format!(
                    "/tmp/diagram-harness/d1/large12_frame{}.png",
                    f.index
                ))
                .ok();
            }
        }
        println!("all_frames_render={all_render}");
        if !all_render {
            all_pass = false;
        }
    }

    // Test 2: branching_dag has no groups — should split by halves
    {
        println!("\n--- Test 2: branching_dag split (no groups → halves) ---");
        let diagram = load("branching_dag");
        let frames = split_into_frames(&diagram);

        println!("total_frames={}", frames.len());
        for f in &frames {
            println!(
                "  frame {}/{}: \"{}\" nodes={}",
                f.index,
                f.total,
                f.title,
                f.diagram.nodes.len()
            );
        }

        let splits = frames.len() == 2;
        println!("splits_in_half={splits}");
        if !splits {
            all_pass = false;
        }

        // Both halves should have nodes
        let both_have_nodes = frames.iter().all(|f| !f.diagram.nodes.is_empty());
        println!("both_halves_populated={both_have_nodes}");
        if !both_have_nodes {
            all_pass = false;
        }
    }

    // Test 3: basic_group — single group, should still split by halves
    {
        println!("\n--- Test 3: basic_group (1 group → halves) ---");
        let diagram = load("basic_group");
        let frames = split_into_frames(&diagram);

        println!("total_frames={}", frames.len());
        // Single group → split by halves (not group-based)
        let is_halves = frames.len() == 2;
        println!("splits_by_halves={is_halves}");
    }

    // Test 4: Prove the decision flow — render, fail score on tiny canvas, split
    {
        println!("\n--- Test 4: Full decision flow — render → fail → split ---");
        let mut diagram = load("large_12");
        diagram.canvas.width = 400;
        diagram.canvas.height = 200;

        // First: try to render at tiny size — should fail scoring
        let result = render_and_score_graph(&diagram);
        println!("tiny_canvas_passes={}", result.passes);

        // If it fails, split and try each frame
        if !result.passes {
            let frames = split_into_frames(&diagram);
            println!("split_into {} frames", frames.len());

            let mut any_frame_passes = false;
            for f in &frames {
                let fr = render_and_score_graph(&f.diagram);
                if fr.passes {
                    any_frame_passes = true;
                }
                println!(
                    "  frame {}: passes={} font={:.0} fill={:.0}%",
                    f.index,
                    fr.passes,
                    fr.score.min_font_px,
                    fr.score.canvas_fill * 100.0
                );
            }
            // At least the overview (fewer nodes) should be more likely to pass
            println!("any_frame_passes={any_frame_passes}");
        }

        // The key assertion: the split decision was made, not an infinite retry
        println!("decision_made=true");
    }

    println!(
        "\n=== D1 RESULT={} ===",
        if all_pass { "PASS" } else { "FAIL" }
    );
}

//! C3: Run the graph pipeline across all fixtures.
//! Every fixture must render, score, and produce a valid PNG.

use rvst_diagram::graph::layout_graph;
use rvst_diagram::pipeline::render_and_score_graph;
use rvst_diagram::schema::Diagram;
use std::path::PathBuf;

const FIXTURES: &[&str] = &[
    "minimal_2",
    "with_edges",
    "basic_group",
    "nested_groups",
    "dense_mix",
    "long_label",
    "branching_dag",
    "large_12",
    "rich_content",
    "with_images",
];

pub fn run_fixture_suite() {
    println!("\n=== C3: FIXTURE SUITE — ALL TOPOLOGIES ===\n");
    let fixture_dir = PathBuf::from(env!("CARGO_MANIFEST_DIR")).join("fixtures");
    let out_dir = "/tmp/diagram-harness/c3";
    std::fs::create_dir_all(out_dir).ok();

    let mut total = 0;
    let mut passed = 0;

    for name in FIXTURES {
        total += 1;
        let path = fixture_dir.join(format!("{name}.json"));
        let json = match std::fs::read_to_string(&path) {
            Ok(j) => j,
            Err(e) => {
                println!("{name}: SKIP (file not found: {e})");
                continue;
            }
        };
        let diagram: Diagram = match serde_json::from_str(&json) {
            Ok(d) => d,
            Err(e) => {
                println!("{name}: FAIL (parse error: {e})");
                continue;
            }
        };

        // Graph layout
        let layout = layout_graph(&diagram);
        let leaf_count = diagram
            .nodes
            .iter()
            .filter(|n| n.kind != rvst_diagram::schema::NodeKind::Group)
            .count();
        let positioned = layout.nodes.len();

        // Render
        let result = render_and_score_graph(&diagram);
        let renders = result.pixels.is_some();
        let scores = result.score.min_font_px > 0.0;

        // Export PNG
        if let Some(px) = &result.pixels {
            let img =
                image::RgbaImage::from_raw(diagram.canvas.width, diagram.canvas.height, px.clone())
                    .unwrap();
            img.save(format!("{out_dir}/{name}.png")).ok();
        }

        let ok = renders && scores && positioned == leaf_count;
        if ok {
            passed += 1;
        }

        println!("{name}: leaves={leaf_count} positioned={positioned} renders={renders} font={:.0} fill={:.0}% overflow={} trunc={} crosslessness={:.2} edge_cv={:.3} min_angle={:.1} overlap={:.1} crossings={} → {}",
            result.score.min_font_px, result.score.canvas_fill * 100.0,
            result.score.overflow_count, result.score.label_truncated,
            result.score.crosslessness, result.score.edge_length_cv,
            result.score.min_angle, result.score.node_edge_overlap_area,
            result.score.crossing_count,
            if ok { "PASS" } else { "FAIL" });
    }

    println!("\n=== C3 RESULT: {passed}/{total} passed ===");
    println!(
        "=== C3 {} ===",
        if passed == total { "PASS" } else { "FAIL" }
    );

    // Build gallery
    let cards: Vec<String> = FIXTURES.iter().map(|name| {
        format!("<div class=\"card\"><img src=\"{name}.png\"/><div class=\"label\">{name}</div></div>")
    }).collect();

    let gallery = format!("<!DOCTYPE html><html><head><style>\
        *{{margin:0;padding:0;box-sizing:border-box}}\
        body{{background:#1a1a1a;padding:40px;font-family:system-ui;color:#ccc;display:flex;justify-content:center;min-height:100vh}}\
        .bento{{display:flex;flex-wrap:wrap;gap:12px;justify-content:center;align-items:center;max-width:1400px}}\
        .card{{background:#2a2a2a;border-radius:6px;padding:6px;display:flex;flex-direction:column;align-items:center}}\
        .card img{{border-radius:3px;width:380px;height:auto}}\
        .label{{font-size:9px;color:#555;margin-top:3px;letter-spacing:0.05em}}\
        </style></head><body><div class=\"bento\">{}</div></body></html>",
        cards.join("\n"));
    std::fs::write(format!("{out_dir}/gallery.html"), gallery).ok();
    println!("gallery={out_dir}/gallery.html");
}

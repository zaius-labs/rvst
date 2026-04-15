//! B3: Validate SVG edge overlay using Inspector rects.

use rvst_diagram::build_graph::build_tree_with_graph;
use rvst_diagram::edges::{edges_to_svg, position_edges};
use rvst_diagram::schema::Diagram;
use std::path::PathBuf;

pub fn run_edges_validation() {
    println!("\n=== B3: SVG EDGE OVERLAY VALIDATION ===\n");
    let mut all_pass = true;

    let path = PathBuf::from(env!("CARGO_MANIFEST_DIR")).join("fixtures/with_edges.json");
    let json = std::fs::read_to_string(&path).unwrap();
    let diagram: Diagram = serde_json::from_str(&json).unwrap();

    // Build and layout
    let built = build_tree_with_graph(&diagram);
    let mut tree = built.tree;
    let mut tr = rvst_text::TextRenderer::new();
    let roots = tree.root_children.clone();
    rvst_shell::layout::flow(
        &mut tree,
        &roots,
        &mut tr,
        diagram.canvas.width as f32,
        diagram.canvas.height as f32,
        1.0,
        None,
    );

    // Position edges
    let positioned = position_edges(&diagram, &tree, &built.id_map);

    println!("edges_in_schema={}", diagram.edges.len());
    println!("edges_positioned={}", positioned.len());

    let all_positioned = positioned.len() == diagram.edges.len();
    if !all_positioned {
        all_pass = false;
    }
    println!("all_edges_positioned={all_positioned}");

    // Check each edge has valid coordinates
    for (i, edge) in positioned.iter().enumerate() {
        let valid = edge.from_edge.0.is_finite()
            && edge.from_edge.1.is_finite()
            && edge.to_edge.0.is_finite()
            && edge.to_edge.1.is_finite()
            && (edge.from_edge.0 - edge.to_edge.0).abs() > 1.0; // not same point

        println!(
            "  edge_{i}: from=({:.0},{:.0}) to=({:.0},{:.0}) label={:?} valid={valid}",
            edge.from_edge.0, edge.from_edge.1, edge.to_edge.0, edge.to_edge.1, edge.label
        );
        if !valid {
            all_pass = false;
        }
    }

    // Generate SVG
    let svg = edges_to_svg(&positioned);
    let has_lines = svg.contains("<line");
    let has_marker = svg.contains("<marker");
    let has_labels = svg.contains("feed") && svg.contains("emit");

    println!("svg_has_lines={has_lines}");
    println!("svg_has_arrow_marker={has_marker}");
    println!("svg_has_labels={has_labels}");

    if !has_lines || !has_marker {
        all_pass = false;
    }

    // Write SVG overlay to file for visual inspection
    let out = format!(
        "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"{}\" height=\"{}\">\
         <rect width=\"100%\" height=\"100%\" fill=\"#fafafa\"/>\n{}</svg>",
        diagram.canvas.width, diagram.canvas.height, svg
    );
    let out_path = "/tmp/diagram-harness/edges_overlay.svg";
    std::fs::create_dir_all("/tmp/diagram-harness").ok();
    std::fs::write(out_path, &out).ok();
    println!("svg_written={out_path}");

    println!(
        "\n=== B3 RESULT={} ===",
        if all_pass { "PASS" } else { "FAIL" }
    );
}

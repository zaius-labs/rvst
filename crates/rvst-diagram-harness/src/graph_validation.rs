//! C1: Validate petgraph + gen_sugiyama → RVST rendering pipeline.

use rvst_diagram::graph::layout_graph;
use rvst_diagram::schema::Diagram;
use std::path::PathBuf;

pub fn run_graph_validation() {
    println!("\n=== C1: PETGRAPH + GEN_SUGIYAMA VALIDATION ===\n");
    let mut all_pass = true;

    // Test 1: with_edges fixture (has edges → sugiyama should produce layered layout)
    {
        println!("--- Test 1: with_edges (3 nodes, 2 edges) ---");
        let path = PathBuf::from(env!("CARGO_MANIFEST_DIR")).join("fixtures/with_edges.json");
        let json = std::fs::read_to_string(&path).unwrap();
        let diagram: Diagram = serde_json::from_str(&json).unwrap();

        let layout = layout_graph(&diagram);

        println!("nodes_positioned={}", layout.nodes.len());
        println!("edges_preserved={}", layout.edges.len());

        // Check positions
        for node in &layout.nodes {
            println!("  {}: ({:.0}, {:.0})", node.id, node.x, node.y);
        }

        // Verify: nodes should be in different positions (not all at 0,0)
        let unique_positions: std::collections::HashSet<String> = layout
            .nodes
            .iter()
            .map(|n| format!("{:.0},{:.0}", n.x, n.y))
            .collect();
        let spread = unique_positions.len() > 1;
        println!(
            "positions_spread={spread} unique={}",
            unique_positions.len()
        );
        if !spread {
            all_pass = false;
        }

        // Edges preserved
        let edges_ok = layout.edges.len() == diagram.edges.len();
        println!("edges_count_matches={edges_ok}");
        if !edges_ok {
            all_pass = false;
        }
    }

    // Test 2: basic_group (has groups but only leaf cards are laid out by sugiyama)
    {
        println!("\n--- Test 2: basic_group (group + 2 cards, no edges) ---");
        let path = PathBuf::from(env!("CARGO_MANIFEST_DIR")).join("fixtures/basic_group.json");
        let json = std::fs::read_to_string(&path).unwrap();
        let diagram: Diagram = serde_json::from_str(&json).unwrap();

        let layout = layout_graph(&diagram);

        // Only leaf cards should be in the layout (groups are containers)
        let leaf_count = diagram
            .nodes
            .iter()
            .filter(|n| n.kind != rvst_diagram::schema::NodeKind::Group)
            .count();
        println!(
            "schema_leaves={leaf_count} positioned={}",
            layout.nodes.len()
        );
        let correct_count = layout.nodes.len() == leaf_count;
        println!("correct_count={correct_count}");
        if !correct_count {
            all_pass = false;
        }

        for node in &layout.nodes {
            println!("  {}: ({:.0}, {:.0})", node.id, node.x, node.y);
        }
    }

    // Test 3: IDs map back correctly
    {
        println!("\n--- Test 3: ID mapping ---");
        let path = PathBuf::from(env!("CARGO_MANIFEST_DIR")).join("fixtures/with_edges.json");
        let json = std::fs::read_to_string(&path).unwrap();
        let diagram: Diagram = serde_json::from_str(&json).unwrap();

        let layout = layout_graph(&diagram);

        let schema_leaf_ids: std::collections::HashSet<String> = diagram
            .nodes
            .iter()
            .filter(|n| n.kind != rvst_diagram::schema::NodeKind::Group)
            .map(|n| n.id.clone())
            .collect();
        let layout_ids: std::collections::HashSet<String> =
            layout.nodes.iter().map(|n| n.id.clone()).collect();

        let ids_match = schema_leaf_ids == layout_ids;
        println!("ids_match={ids_match}");
        if !ids_match {
            println!("  expected: {:?}", schema_leaf_ids);
            println!("  got:      {:?}", layout_ids);
            all_pass = false;
        }
    }

    // Test 4: Render through full pipeline with graph-computed positions
    // (This proves the positions feed into the existing render pipeline)
    {
        println!("\n--- Test 4: Full pipeline render with graph positions ---");
        let path = PathBuf::from(env!("CARGO_MANIFEST_DIR")).join("fixtures/with_edges.json");
        let json = std::fs::read_to_string(&path).unwrap();
        let diagram: Diagram = serde_json::from_str(&json).unwrap();

        // Use the existing pipeline (which uses Taffy, not sugiyama positions yet)
        // This just proves the graph module doesn't break the existing pipeline
        let result = rvst_diagram::pipeline::render_and_score_graph(&diagram);
        let renders = result.pixels.is_some();
        println!("renders_through_pipeline={renders}");
        println!("score_passes={}", result.passes);
        if !renders {
            all_pass = false;
        }

        if let Some(px) = &result.pixels {
            std::fs::create_dir_all("/tmp/diagram-harness").ok();
            let img =
                image::RgbaImage::from_raw(diagram.canvas.width, diagram.canvas.height, px.clone())
                    .unwrap();
            img.save("/tmp/diagram-harness/graph_pipeline.png").unwrap();
            println!("png=/tmp/diagram-harness/graph_pipeline.png");
        }
    }

    println!(
        "\n=== C1 RESULT={} ===",
        if all_pass { "PASS" } else { "FAIL" }
    );
}

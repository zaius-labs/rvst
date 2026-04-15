//! The render → inspect → score pipeline.
//! Takes a Diagram, produces a scored render result.

use crate::build_graph::build_tree_with_graph;
use crate::schema::{Diagram, LayoutDecision, ReadabilityScore};
use crate::score::score_tree;
use crate::sketch;

/// Result of a single render pass.
pub struct RenderResult {
    /// The rendered RGBA pixels (if GPU available)
    pub pixels: Option<Vec<u8>>,
    /// Readability score
    pub score: ReadabilityScore,
    /// Whether the score passes all thresholds
    pub passes: bool,
    /// Layout decision
    pub decision: LayoutDecision,
    /// Canvas dimensions used
    pub width: u32,
    pub height: u32,
}

/// Run the full pipeline: build tree → layout → render → inspect → score.
/// Sugiyama determines layer/rank, CSS flex handles sizing within canvas.
pub fn render_and_score_graph(diagram: &Diagram) -> RenderResult {
    let mut tr = rvst_text::TextRenderer::new();

    // Register custom font if available
    const SIMPLE_MARKER_TTF: &[u8] =
        include_bytes!("../../../packages/diagram/fonts/SimpleMarker.ttf");
    if !diagram.theme.font.is_empty() {
        tr.register_font(SIMPLE_MARKER_TTF.to_vec());
    }

    let w = diagram.canvas.width;
    let h = diagram.canvas.height;

    let padding = diagram.canvas.padding as f32;

    // Compute post-scale fill for a given tree
    let compute_fill = |tree: &rvst_tree::Tree| -> f32 {
        if let Some((min_x, min_y, max_x, max_y)) = crate::scale::content_bounds(tree) {
            let content_w = (max_x - min_x).max(1.0);
            let content_h = (max_y - min_y).max(1.0);
            let avail_w = w as f32 - padding * 2.0;
            let avail_h = h as f32 - padding * 2.0;
            let scale = (avail_w / content_w).min(avail_h / content_h).max(1.0);
            let scaled_area = (content_w * scale) * (content_h * scale);
            let canvas_area = w as f32 * h as f32;
            if canvas_area > 0.0 {
                (scaled_area / canvas_area).min(1.0)
            } else {
                0.0
            }
        } else {
            0.0
        }
    };

    // Try default direction (horizontal rows)
    let built_h = build_tree_with_graph(diagram);
    let mut tree_h = built_h.tree;
    let roots_h = tree_h.root_children.clone();
    rvst_shell::layout::flow(&mut tree_h, &roots_h, &mut tr, w as f32, h as f32, 1.0, None);
    let fill_h = compute_fill(&tree_h);

    // Try vertical direction
    let built_v = crate::build_graph::build_tree_with_graph_direction(diagram, true);
    let mut tree_v = built_v.tree;
    let roots_v = tree_v.root_children.clone();
    rvst_shell::layout::flow(&mut tree_v, &roots_v, &mut tr, w as f32, h as f32, 1.0, None);
    let fill_v = compute_fill(&tree_v);

    // Pick the direction with better fill (5% threshold to prefer default)
    let (mut tree, built_id_map) = if fill_v > fill_h + 0.05 {
        (tree_v, built_v.id_map)
    } else {
        (tree_h, built_h.id_map)
    };

    let roots = tree.root_children.clone();

    // Root is transparent — graph paper is the background (drawn in scale-to-fill)
    tree.apply(rvst_core::ops::Op::SetStyle {
        id: rvst_core::node::NodeId(1),
        key: "background-color".into(),
        value: "transparent".into(),
    });

    // Apply sketch aesthetics
    let card_ids: Vec<_> = built_id_map.values().copied().collect();
    sketch::apply_sketch_style(&mut tree, &card_ids, &[]);

    // Build content scene at natural layout size
    let mut content_scene = rvst_shell::composite::build_scene(&tree, &roots, &mut tr, w, h, 1.0);

    // Draw edges with obstacle avoidance (hoist for metrics reuse)
    let positioned_edges = if !diagram.edges.is_empty() {
        let positioned = crate::edges::position_edges(diagram, &tree, &built_id_map);
        let obstacles = crate::edges::collect_obstacles(&tree);
        crate::draw_edges::draw_edges_vello(&mut content_scene, &positioned, &obstacles);
        Some((positioned, obstacles))
    } else {
        None
    };

    // Scale-to-fill: zoom content to fill canvas
    let final_scene = if let Some(bounds) = crate::scale::content_bounds(&tree) {
        let transform = crate::scale::scale_to_fill_transform(
            bounds,
            w as f32,
            h as f32,
            diagram.canvas.padding as f32,
        );

        let mut scene = vello::Scene::new();
        // Background
        scene.fill(
            vello::peniko::Fill::NonZero,
            vello::kurbo::Affine::IDENTITY,
            vello::peniko::Color::from_rgba8(250, 250, 250, 255),
            None,
            &vello::kurbo::Rect::new(0.0, 0.0, w as f64, h as f64),
        );
        // Graph paper grid lines on background (before content)
        if diagram.theme.graph_paper {
            sketch::draw_graph_paper(&mut scene, w, h, 20.0, 100.0);
        }
        // Scaled content on top of grid
        scene.append(&content_scene, Some(transform));
        scene
    } else {
        content_scene
    };

    let pixels = rvst_render_wgpu::render_to_rgba(&final_scene, w, h);

    let root_children = &tree.root_children;
    let mut score = score_tree(&tree, root_children, w as f32, h as f32, &mut tr);

    // Override canvas_fill with post-scale measurement
    if let Some((min_x, min_y, max_x, max_y)) = crate::scale::content_bounds(&tree) {
        let content_w = max_x - min_x;
        let content_h = max_y - min_y;
        let canvas_area = w as f32 * h as f32;
        let avail_w = w as f32 - padding * 2.0;
        let avail_h = h as f32 - padding * 2.0;

        if content_w > 0.0 && content_h > 0.0 && canvas_area > 0.0 {
            // Scale factor (same as scale_to_fill_transform computes)
            let scale = (avail_w / content_w).min(avail_h / content_h).max(1.0);
            let scaled_area = (content_w * scale) * (content_h * scale);
            score.canvas_fill = (scaled_area / canvas_area).min(1.0);
        }
    }

    // Compute graph readability metrics from positioned edges
    if let Some((ref positioned, ref obstacles)) = positioned_edges {
        let gm = crate::graph_metrics::compute_metrics(positioned, obstacles);
        score.crosslessness = gm.crosslessness;
        score.edge_length_cv = gm.edge_length_cv;
        score.min_angle = gm.min_angle;
        score.node_edge_overlap_area = gm.node_edge_overlap_area;
        score.crossing_count = gm.crossing_count;
    } else {
        score.crosslessness = 1.0;
        score.min_angle = 90.0;
    }

    let leaf_count = diagram
        .nodes
        .iter()
        .filter(|n| n.kind != crate::schema::NodeKind::Group)
        .count();
    let has_edges = !diagram.edges.is_empty();
    let ctx = crate::schema::ScoreContext {
        leaf_count,
        has_edges,
        display_width: None, // No display target specified — use render dims
        render_width: w,
    };
    let passes = score.passes_smart(&diagram.theme, &ctx);

    let decision = if passes {
        LayoutDecision::Accept
    } else {
        LayoutDecision::Retry {
            pass: 0,
            adjustment: "graph layout failed".into(),
        }
    };

    RenderResult {
        pixels,
        score,
        passes,
        decision,
        width: w,
        height: h,
    }
}

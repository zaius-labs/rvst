//! Sketch aesthetics — graph paper background + hand-drawn card styling.
//! Adds visual style ops to a tree to create the Post-it-on-graph-paper look.

use rvst_core::node::NodeId;
use rvst_core::ops::Op;
use rvst_tree::Tree;

/// Apply sketch aesthetics to the tree.
/// - Adds box-shadow to cards for depth
/// - Adds subtle rotation via CSS transform
/// - Sets rounded corners
/// - Makes group borders hand-drawn-feeling (dashed)
pub fn apply_sketch_style(tree: &mut Tree, card_ids: &[NodeId], group_ids: &[NodeId]) {
    // Deterministic "random" rotation per card
    for (i, &id) in card_ids.iter().enumerate() {
        let rotation = ((i as f32 * 2.7).sin() * 1.5) as i32; // ±1-2 degrees
        if rotation != 0 {
            tree.apply(Op::SetStyle {
                id,
                key: "transform".into(),
                value: "translate(0px, 0px)".to_string(), // Vello only supports translate for now
            });
        }
        // Box shadow for depth
        tree.apply(Op::SetStyle {
            id,
            key: "box-shadow".into(),
            value: "2px 3px 8px rgba(0,0,0,0.12)".into(),
        });
        // Rounded corners
        tree.apply(Op::SetStyle {
            id,
            key: "border-radius".into(),
            value: "4px".into(),
        });
    }

    // Groups get subtle border
    for &id in group_ids {
        tree.apply(Op::SetStyle {
            id,
            key: "border-radius".into(),
            value: "6px".into(),
        });
        tree.apply(Op::SetStyle {
            id,
            key: "box-shadow".into(),
            value: "0 1px 4px rgba(0,0,0,0.06)".into(),
        });
    }
}

/// Draw graph paper grid lines on a Vello scene.
/// Call this BEFORE drawing the tree nodes.
pub fn draw_graph_paper(
    scene: &mut vello::Scene,
    width: u32,
    height: u32,
    grid_small: f32,
    grid_large: f32,
) {
    use vello::kurbo::{Line, Rect, Stroke};
    use vello::peniko::{Color, Fill};

    let w = width as f64;
    let h = height as f64;

    // Background
    scene.fill(
        Fill::NonZero,
        vello::kurbo::Affine::IDENTITY,
        Color::from_rgba8(250, 250, 250, 255),
        None,
        &Rect::new(0.0, 0.0, w, h),
    );

    // Small grid lines
    let small_stroke = Stroke::new(0.5);
    let small_color = Color::from_rgba8(0, 0, 0, 25); // subtle but visible

    let mut x = 0.0;
    while x <= w {
        scene.stroke(
            &small_stroke,
            vello::kurbo::Affine::IDENTITY,
            small_color,
            None,
            &Line::new((x, 0.0), (x, h)),
        );
        x += grid_small as f64;
    }
    let mut y = 0.0;
    while y <= h {
        scene.stroke(
            &small_stroke,
            vello::kurbo::Affine::IDENTITY,
            small_color,
            None,
            &Line::new((0.0, y), (w, y)),
        );
        y += grid_small as f64;
    }

    // Large grid lines
    let large_stroke = Stroke::new(1.0);
    let large_color = Color::from_rgba8(0, 0, 0, 45); // clearly visible major grid

    let mut x = 0.0;
    while x <= w {
        scene.stroke(
            &large_stroke,
            vello::kurbo::Affine::IDENTITY,
            large_color,
            None,
            &Line::new((x, 0.0), (x, h)),
        );
        x += grid_large as f64;
    }
    let mut y = 0.0;
    while y <= h {
        scene.stroke(
            &large_stroke,
            vello::kurbo::Affine::IDENTITY,
            large_color,
            None,
            &Line::new((0.0, y), (w, y)),
        );
        y += grid_large as f64;
    }
}

//! Scale-to-fill: compute content bounding box after layout,
//! then create a scene that scales the content to fill the canvas.

use rvst_tree::Tree;

/// Compute the bounding box of all non-root laid-out nodes.
/// Returns (min_x, min_y, max_x, max_y) or None if no nodes have layout.
pub fn content_bounds(tree: &Tree) -> Option<(f32, f32, f32, f32)> {
    let mut min_x = f32::MAX;
    let mut min_y = f32::MAX;
    let mut max_x = f32::MIN;
    let mut max_y = f32::MIN;
    let mut found = false;

    for (&id, node) in &tree.nodes {
        // Skip the virtual root (NodeId(0)) and the layout root (NodeId(1))
        if id.0 <= 1 {
            continue;
        }

        if let Some(r) = &node.layout {
            // Include any node that has visible content (background, text, or border).
            // Skip only pure layout wrappers (row containers with no visual style).
            let has_bg = node.styles.contains_key("background-color");
            let has_border = node.styles.contains_key("border");
            let is_text = node.node_type == rvst_core::NodeType::Text;
            let bg_val = node
                .styles
                .get("background-color")
                .map(|s| s.as_str())
                .unwrap_or("");
            let is_root_bg = bg_val == "#fafafa" || bg_val == "transparent";
            if !has_bg && !has_border && !is_text {
                continue;
            }
            if is_root_bg && !has_border {
                continue;
            } // skip root background

            if r.w > 0.0 && r.h > 0.0 {
                min_x = min_x.min(r.x);
                min_y = min_y.min(r.y);
                max_x = max_x.max(r.x + r.w);
                max_y = max_y.max(r.y + r.h);
                found = true;
            }
        }
    }

    if found {
        Some((min_x, min_y, max_x, max_y))
    } else {
        None
    }
}

/// Compute the Vello affine transform that scales and centers
/// the content bounding box to fill the canvas with padding.
pub fn scale_to_fill_transform(
    content_bounds: (f32, f32, f32, f32),
    canvas_w: f32,
    canvas_h: f32,
    padding: f32,
) -> vello::kurbo::Affine {
    let (min_x, min_y, max_x, max_y) = content_bounds;
    let content_w = max_x - min_x;
    let content_h = max_y - min_y;

    if content_w <= 0.0 || content_h <= 0.0 {
        return vello::kurbo::Affine::IDENTITY;
    }

    let avail_w = canvas_w - padding * 2.0;
    let avail_h = canvas_h - padding * 2.0;

    if avail_w <= 0.0 || avail_h <= 0.0 {
        return vello::kurbo::Affine::IDENTITY;
    }

    // Scale uniformly to fit
    let scale = (avail_w / content_w).min(avail_h / content_h);

    // Don't scale down below 1.0 — only scale up
    let scale = scale.max(1.0);

    let scaled_w = content_w * scale;
    let scaled_h = content_h * scale;

    // Center in canvas
    let offset_x = padding + (avail_w - scaled_w) / 2.0;
    let offset_y = padding + (avail_h - scaled_h) / 2.0;

    // Transform: translate to origin, scale, translate to center
    vello::kurbo::Affine::translate((offset_x as f64, offset_y as f64))
        * vello::kurbo::Affine::scale(scale as f64)
        * vello::kurbo::Affine::translate((-(min_x as f64), -(min_y as f64)))
}

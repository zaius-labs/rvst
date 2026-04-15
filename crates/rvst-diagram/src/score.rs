//! Readability scoring — inspect a rendered tree and compute pass/fail metrics.

use crate::schema::ReadabilityScore;
use rvst_core::{NodeId, NodeType};
use rvst_tree::Tree;

/// Compute a ReadabilityScore by inspecting the tree after layout.
pub fn score_tree(
    tree: &Tree,
    root_children: &[NodeId],
    canvas_w: f32,
    canvas_h: f32,
    tr: &mut rvst_text::TextRenderer,
) -> ReadabilityScore {
    let mut min_font_px = f32::MAX;
    let mut overflow_count = 0u32;
    let mut label_truncated = 0u32;
    let mut content_area = 0.0f32;

    // Walk all nodes
    for (&id, node) in &tree.nodes {
        let rect = match &node.layout {
            Some(r) => r,
            None => continue,
        };

        // Check overflow: node extends beyond canvas
        if rect.x + rect.w > canvas_w + 1.0
            || rect.y + rect.h > canvas_h + 1.0
            || rect.x < -1.0
            || rect.y < -1.0
        {
            overflow_count += 1;
        }

        // For text nodes: check font size + truncation
        if node.node_type == NodeType::Text {
            // Extract font size from styles
            let font_size: f32 = node
                .styles
                .get("font-size")
                .and_then(|s| s.strip_suffix("px"))
                .and_then(|s| s.parse().ok())
                .unwrap_or(16.0);

            if font_size < min_font_px {
                min_font_px = font_size;
            }

            // Check if label text fits in the node's parent container
            if let Some(label) = &node.text {
                if !label.is_empty() {
                    let parent_w = node
                        .parent
                        .and_then(|pid| tree.nodes.get(&pid))
                        .and_then(|p| p.layout.as_ref())
                        .map(|r| r.w)
                        .unwrap_or(canvas_w);

                    // Measure natural text width at this font size
                    let (text_w, _) = tr.measure(label, font_size, 9999.0, None, None);

                    // Account for padding in parent (rough estimate: 32px total)
                    let available_w = parent_w - 32.0;
                    if text_w > available_w && available_w > 0.0 {
                        label_truncated += 1;
                    }
                }
            }
        }

        // Content area: sum area of direct children of root (top-level cards/groups)
        if root_children.iter().any(|&rc| {
            tree.nodes
                .get(&rc)
                .map(|root_node| root_node.children.contains(&id))
                .unwrap_or(false)
        }) {
            content_area += rect.w * rect.h;
        }
    }

    // If no text nodes found, min_font is 0 (not MAX)
    if min_font_px == f32::MAX {
        min_font_px = 0.0;
    }

    let canvas_area = canvas_w * canvas_h;
    let canvas_fill = if canvas_area > 0.0 {
        content_area / canvas_area
    } else {
        0.0
    };

    ReadabilityScore {
        min_font_px,
        canvas_fill,
        overflow_count,
        label_truncated,
        ..Default::default()
    }
}

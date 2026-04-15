//! Simple edge rendering — SVG-style arrows between positioned nodes.
//! Uses node rects from layout to compute center-to-center paths.
//! Phase 1: ugly but functional. Vello paths come later.

use crate::schema::Diagram;
use rvst_core::NodeId;
use rvst_tree::Tree;
use std::collections::HashMap;

/// A positioned edge ready for rendering.
#[derive(Debug, Clone)]
pub struct PositionedEdge {
    pub from_center: (f32, f32),
    pub to_center: (f32, f32),
    pub from_edge: (f32, f32),
    pub to_edge: (f32, f32),
    pub from_rect: (f32, f32, f32, f32), // x, y, w, h of source node
    pub to_rect: (f32, f32, f32, f32),   // x, y, w, h of target node
    pub to_id: String,                   // target node ID for fan-in grouping
    pub label: Option<String>,
}

/// All node rectangles for obstacle avoidance.
pub type ObstacleList = Vec<(f32, f32, f32, f32)>;

/// Compute positioned edges from diagram edges + laid-out tree.
pub fn position_edges(
    diagram: &Diagram,
    tree: &Tree,
    id_map: &HashMap<String, NodeId>,
) -> Vec<PositionedEdge> {
    let mut result = Vec::new();

    for edge in &diagram.edges {
        let from_nid = match id_map.get(&edge.from) {
            Some(id) => id,
            None => continue,
        };
        let to_nid = match id_map.get(&edge.to) {
            Some(id) => id,
            None => continue,
        };

        let from_rect = match tree.nodes.get(from_nid).and_then(|n| n.layout.as_ref()) {
            Some(r) => r,
            None => continue,
        };
        let to_rect = match tree.nodes.get(to_nid).and_then(|n| n.layout.as_ref()) {
            Some(r) => r,
            None => continue,
        };

        let from_cx = from_rect.x + from_rect.w / 2.0;
        let from_cy = from_rect.y + from_rect.h / 2.0;
        let to_cx = to_rect.x + to_rect.w / 2.0;
        let to_cy = to_rect.y + to_rect.h / 2.0;

        // Compute edge points on node borders (simple: pick closest side center)
        let from_edge = border_point(from_rect, to_cx, to_cy);
        let to_edge = border_point(to_rect, from_cx, from_cy);

        result.push(PositionedEdge {
            from_center: (from_cx, from_cy),
            to_center: (to_cx, to_cy),
            from_rect: (from_rect.x, from_rect.y, from_rect.w, from_rect.h),
            to_rect: (to_rect.x, to_rect.y, to_rect.w, to_rect.h),
            to_id: edge.to.clone(),
            from_edge,
            to_edge,
            label: edge.label.clone(),
        });
    }

    result
}

/// Collect ONLY card/leaf node rects as obstacles for edge routing.
/// Excludes: group containers, row containers, text nodes, root.
/// Only nodes with a non-group background color count as obstacles.
pub fn collect_obstacles(tree: &Tree) -> ObstacleList {
    tree.nodes.values()
        .filter(|n| {
            // Must have layout
            n.layout.is_some()
            // Must have a colored background (cards have Post-it colors)
            && n.styles.get("background-color")
                .map(|bg| bg != "#f5f0e8" && bg != "#fafafa" && bg != "transparent" && bg != "#e0e0e0")
                .unwrap_or(false)
            // Must not be a text node
            && n.node_type != rvst_core::NodeType::Text
            // Must be reasonably sized (not a tiny element)
            && n.layout.as_ref().map(|r| r.w > 20.0 && r.h > 20.0).unwrap_or(false)
        })
        .filter_map(|n| n.layout.as_ref().map(|r| (r.x, r.y, r.w, r.h)))
        .collect()
}

/// Find the point on the border of `rect` closest to (tx, ty).
fn border_point(rect: &rvst_core::Rect, tx: f32, ty: f32) -> (f32, f32) {
    let cx = rect.x + rect.w / 2.0;
    let cy = rect.y + rect.h / 2.0;
    let dx = tx - cx;
    let dy = ty - cy;

    if dx.abs() < 0.001 && dy.abs() < 0.001 {
        return (cx, rect.y); // degenerate: same center, pick top
    }

    // Check which side the line from center→target crosses first
    let t_right = if dx > 0.0 {
        (rect.w / 2.0) / dx
    } else {
        f32::MAX
    };
    let t_left = if dx < 0.0 {
        (-rect.w / 2.0) / dx
    } else {
        f32::MAX
    };
    let t_bottom = if dy > 0.0 {
        (rect.h / 2.0) / dy
    } else {
        f32::MAX
    };
    let t_top = if dy < 0.0 {
        (-rect.h / 2.0) / dy
    } else {
        f32::MAX
    };

    let t = t_right.min(t_left).min(t_bottom).min(t_top);
    (cx + dx * t, cy + dy * t)
}

/// Render positioned edges as SVG string (for overlay or embedding).
pub fn edges_to_svg(edges: &[PositionedEdge]) -> String {
    let mut svg = String::new();
    svg.push_str("<defs><marker id=\"arrow\" markerWidth=\"10\" markerHeight=\"7\" refX=\"10\" refY=\"3.5\" orient=\"auto\">");
    svg.push_str("<polygon points=\"0 0, 10 3.5, 0 7\" fill=\"#333\"/></marker></defs>\n");

    for edge in edges {
        let (x1, y1) = edge.from_edge;
        let (x2, y2) = edge.to_edge;
        svg.push_str(&format!(
            "<line x1=\"{x1:.0}\" y1=\"{y1:.0}\" x2=\"{x2:.0}\" y2=\"{y2:.0}\" \
             stroke=\"#333\" stroke-width=\"2\" marker-end=\"url(#arrow)\"/>\n"
        ));

        if let Some(label) = &edge.label {
            let mx = (x1 + x2) / 2.0;
            let my = (y1 + y2) / 2.0 - 8.0;
            svg.push_str(&format!(
                "<text x=\"{mx:.0}\" y=\"{my:.0}\" text-anchor=\"middle\" \
                 font-size=\"12\" fill=\"#666\">{label}</text>\n"
            ));
        }
    }

    svg
}

//! GLAM-inspired graph readability metrics + Sprawlter overlap measurement.
//! Computed from positioned edges and obstacle (node) rectangles.

use crate::edges::{ObstacleList, PositionedEdge};

/// Graph-level readability metrics.
#[derive(Debug, Clone, Default)]
pub struct GraphMetrics {
    /// 1.0 = no crossings, 0.0 = maximum crossings. Formula: 1 - (crossings / max_possible)
    pub crosslessness: f32,
    /// Coefficient of variation of edge lengths (stddev/mean). Lower = more uniform. 0.0 if <2 edges.
    pub edge_length_cv: f32,
    /// Minimum angle (degrees) between any two edges incident to the same node. Higher = better.
    /// 90.0 if no shared nodes. 0.0 if edges overlap.
    pub min_angle: f32,
    /// Total area of node-edge overlap (Sprawlter). Non-incident edges crossing through node rects.
    /// 0.0 = no overlap (ideal).
    pub node_edge_overlap_area: f32,
    /// Number of edge-edge crossings (absolute count)
    pub crossing_count: u32,
}

/// Compute all graph metrics from positioned edges and obstacles.
pub fn compute_metrics(edges: &[PositionedEdge], obstacles: &ObstacleList) -> GraphMetrics {
    if edges.is_empty() {
        return GraphMetrics {
            crosslessness: 1.0,
            min_angle: 90.0,
            ..Default::default()
        };
    }

    let crossing_count = count_crossings(edges);
    let max_crossings = (edges.len() * (edges.len().saturating_sub(1))) / 2;
    let crosslessness = if max_crossings > 0 {
        1.0 - (crossing_count as f32 / max_crossings as f32).min(1.0)
    } else {
        1.0
    };

    let edge_length_cv = compute_edge_length_cv(edges);
    let min_angle = compute_min_angle(edges);
    let node_edge_overlap_area = compute_node_edge_overlap(edges, obstacles);

    GraphMetrics {
        crosslessness,
        edge_length_cv,
        min_angle,
        node_edge_overlap_area,
        crossing_count,
    }
}

/// Count edge-edge crossings using line segment intersection test.
/// Uses the from_edge->to_edge straight-line segments (not A* routed paths).
fn count_crossings(edges: &[PositionedEdge]) -> u32 {
    let mut count = 0;
    for i in 0..edges.len() {
        for j in (i + 1)..edges.len() {
            if segments_intersect(
                edges[i].from_edge,
                edges[i].to_edge,
                edges[j].from_edge,
                edges[j].to_edge,
            ) {
                count += 1;
            }
        }
    }
    count
}

/// Check if two line segments (p1->p2) and (p3->p4) intersect.
fn segments_intersect(p1: (f32, f32), p2: (f32, f32), p3: (f32, f32), p4: (f32, f32)) -> bool {
    let d1 = cross_2d(p3, p4, p1);
    let d2 = cross_2d(p3, p4, p2);
    let d3 = cross_2d(p1, p2, p3);
    let d4 = cross_2d(p1, p2, p4);

    if ((d1 > 0.0 && d2 < 0.0) || (d1 < 0.0 && d2 > 0.0))
        && ((d3 > 0.0 && d4 < 0.0) || (d3 < 0.0 && d4 > 0.0))
    {
        return true;
    }

    // Collinear cases (treat as non-crossing for scoring purposes)
    false
}

fn cross_2d(a: (f32, f32), b: (f32, f32), c: (f32, f32)) -> f32 {
    (b.0 - a.0) * (c.1 - a.1) - (b.1 - a.1) * (c.0 - a.0)
}

/// Coefficient of variation of edge lengths.
fn compute_edge_length_cv(edges: &[PositionedEdge]) -> f32 {
    if edges.len() < 2 {
        return 0.0;
    }

    let lengths: Vec<f32> = edges
        .iter()
        .map(|e| {
            let dx = e.to_edge.0 - e.from_edge.0;
            let dy = e.to_edge.1 - e.from_edge.1;
            (dx * dx + dy * dy).sqrt()
        })
        .collect();

    let mean = lengths.iter().sum::<f32>() / lengths.len() as f32;
    if mean < 0.001 {
        return 0.0;
    }

    let variance = lengths.iter().map(|l| (l - mean).powi(2)).sum::<f32>() / lengths.len() as f32;
    variance.sqrt() / mean
}

/// Minimum angle between any two edges sharing a node.
fn compute_min_angle(edges: &[PositionedEdge]) -> f32 {
    if edges.len() < 2 {
        return 90.0;
    }

    let mut min_angle = 180.0_f32;

    // Group edges by shared endpoints (using rect positions)
    for i in 0..edges.len() {
        for j in (i + 1)..edges.len() {
            // Check if edges share a source or target node
            let shared = edges_share_node(&edges[i], &edges[j]);
            if !shared {
                continue;
            }

            // Compute angle between the two edge directions
            let dir_i = (
                edges[i].to_edge.0 - edges[i].from_edge.0,
                edges[i].to_edge.1 - edges[i].from_edge.1,
            );
            let dir_j = (
                edges[j].to_edge.0 - edges[j].from_edge.0,
                edges[j].to_edge.1 - edges[j].from_edge.1,
            );

            let len_i = (dir_i.0 * dir_i.0 + dir_i.1 * dir_i.1).sqrt();
            let len_j = (dir_j.0 * dir_j.0 + dir_j.1 * dir_j.1).sqrt();
            if len_i < 0.001 || len_j < 0.001 {
                continue;
            }

            let cos_angle = (dir_i.0 * dir_j.0 + dir_i.1 * dir_j.1) / (len_i * len_j);
            let angle = cos_angle.clamp(-1.0, 1.0).acos().to_degrees();
            min_angle = min_angle.min(angle);
        }
    }

    min_angle
}

/// Check if two edges share a source or target node (by comparing rect positions).
fn edges_share_node(a: &PositionedEdge, b: &PositionedEdge) -> bool {
    let close = |p1: (f32, f32, f32, f32), p2: (f32, f32, f32, f32)| -> bool {
        (p1.0 - p2.0).abs() < 2.0 && (p1.1 - p2.1).abs() < 2.0
    };
    close(a.from_rect, b.from_rect) // same source
        || close(a.to_rect, b.to_rect)   // same target
        || close(a.from_rect, b.to_rect) // a's source = b's target
        || close(a.to_rect, b.from_rect) // a's target = b's source
}

/// Sprawlter: total area of non-incident edge segments overlapping node rects.
fn compute_node_edge_overlap(edges: &[PositionedEdge], obstacles: &ObstacleList) -> f32 {
    let mut total_overlap = 0.0_f32;

    for edge in edges {
        for &(ox, oy, ow, oh) in obstacles {
            // Skip if this obstacle IS the source or target node
            let is_source =
                (ox - edge.from_rect.0).abs() < 2.0 && (oy - edge.from_rect.1).abs() < 2.0;
            let is_target = (ox - edge.to_rect.0).abs() < 2.0 && (oy - edge.to_rect.1).abs() < 2.0;
            if is_source || is_target {
                continue;
            }

            // Compute overlap of edge line segment with obstacle rect
            let overlap = segment_rect_overlap(edge.from_edge, edge.to_edge, ox, oy, ow, oh);
            total_overlap += overlap;
        }
    }

    total_overlap
}

/// Compute the length of a line segment that passes through a rectangle.
/// Returns overlap length * rect height as an area proxy (Sprawlter-style).
fn segment_rect_overlap(p1: (f32, f32), p2: (f32, f32), rx: f32, ry: f32, rw: f32, rh: f32) -> f32 {
    // Liang-Barsky clipping to find segment inside rect
    let clip = clip_segment(p1, p2, rx, ry, rx + rw, ry + rh);
    match clip {
        Some((a, b)) => {
            let dx = b.0 - a.0;
            let dy = b.1 - a.1;
            let len = (dx * dx + dy * dy).sqrt();
            // Area proxy: clipped length * minimum dimension (Sprawlter approach)
            len * rh.min(rw)
        }
        None => 0.0,
    }
}

/// Clip a line segment to a rectangle using Liang-Barsky. Returns the clipped segment or None.
fn clip_segment(
    p1: (f32, f32),
    p2: (f32, f32),
    xmin: f32,
    ymin: f32,
    xmax: f32,
    ymax: f32,
) -> Option<((f32, f32), (f32, f32))> {
    let dx = p2.0 - p1.0;
    let dy = p2.1 - p1.1;

    let p = [-dx, dx, -dy, dy];
    let q = [p1.0 - xmin, xmax - p1.0, p1.1 - ymin, ymax - p1.1];

    let mut t0 = 0.0_f32;
    let mut t1 = 1.0_f32;

    for i in 0..4 {
        if p[i].abs() < 0.0001 {
            if q[i] < 0.0 {
                return None;
            }
        } else {
            let t = q[i] / p[i];
            if p[i] < 0.0 {
                t0 = t0.max(t);
            } else {
                t1 = t1.min(t);
            }
        }
    }

    if t0 > t1 {
        return None;
    }

    let cx1 = p1.0 + t0 * dx;
    let cy1 = p1.1 + t0 * dy;
    let cx2 = p1.0 + t1 * dx;
    let cy2 = p1.1 + t1 * dy;

    Some(((cx1, cy1), (cx2, cy2)))
}

//! Orthogonal edge routing using A* on a Hanan grid.
//! 1. Build grid lines from rectangle boundaries + margins
//! 2. Create graph nodes at grid intersections (excluding inside obstacles)
//! 3. A* pathfind with turn penalty to minimize bends
//! 4. Simplify collinear segments, draw orthogonal path

use crate::edges::{ObstacleList, PositionedEdge};
use pathfinding::prelude::astar;
use std::collections::HashMap;
use std::collections::HashSet;
use vello::kurbo::{BezPath, Stroke};
use vello::peniko::{Blob, Brush, Color, Fill, FontData};

const MARGIN: f32 = 16.0;
const TURN_PENALTY: i32 = 80;

#[derive(Clone, Debug, Eq, Hash, PartialEq)]
struct GridPos {
    xi: usize,
    yi: usize,
}

pub fn draw_edges_vello(
    scene: &mut vello::Scene,
    edges: &[PositionedEdge],
    obstacles: &ObstacleList,
) {
    if edges.is_empty() {
        return;
    }

    // Text renderer for edge labels (created once, reused)
    let mut label_tr = rvst_text::TextRenderer::new();

    // 1. Collect grid coordinates from obstacle boundaries + margins + endpoints
    let mut xs: Vec<f32> = Vec::new();
    let mut ys: Vec<f32> = Vec::new();

    for &(ox, oy, ow, oh) in obstacles {
        xs.extend_from_slice(&[ox, ox + ow, ox - MARGIN, ox + ow + MARGIN]);
        ys.extend_from_slice(&[oy, oy + oh, oy - MARGIN, oy + oh + MARGIN]);
    }

    // Add midpoints between all pairs of adjacent obstacle boundaries.
    // These create explicit routing channels in the gaps between rows/columns.
    let mut all_bottoms: Vec<f32> = obstacles.iter().map(|&(_, oy, _, oh)| oy + oh).collect();
    let mut all_tops: Vec<f32> = obstacles.iter().map(|&(_, oy, _, _)| oy).collect();
    let mut all_rights: Vec<f32> = obstacles.iter().map(|&(ox, _, ow, _)| ox + ow).collect();
    let mut all_lefts: Vec<f32> = obstacles.iter().map(|&(ox, _, _, _)| ox).collect();
    all_bottoms.sort_by(|a, b| a.partial_cmp(b).unwrap());
    all_tops.sort_by(|a, b| a.partial_cmp(b).unwrap());
    all_rights.sort_by(|a, b| a.partial_cmp(b).unwrap());
    all_lefts.sort_by(|a, b| a.partial_cmp(b).unwrap());

    // For each bottom edge, find the nearest top edge below it and add midpoint
    for &bot in &all_bottoms {
        for &top in &all_tops {
            if top > bot + 4.0 {
                ys.push((bot + top) / 2.0); // midpoint of the gap
                break;
            }
        }
    }
    for &right in &all_rights {
        for &left in &all_lefts {
            if left > right + 4.0 {
                xs.push((right + left) / 2.0);
                break;
            }
        }
    }

    for edge in edges {
        xs.extend_from_slice(&[
            edge.from_edge.0,
            edge.to_edge.0,
            edge.from_center.0,
            edge.to_center.0,
        ]);
        ys.extend_from_slice(&[
            edge.from_edge.1,
            edge.to_edge.1,
            edge.from_center.1,
            edge.to_center.1,
        ]);
    }

    xs.sort_by(|a, b| a.partial_cmp(b).unwrap());
    ys.sort_by(|a, b| a.partial_cmp(b).unwrap());
    xs.dedup_by(|a, b| (*a - *b).abs() < 0.5);
    ys.dedup_by(|a, b| (*a - *b).abs() < 0.5);

    // 2. Mark blocked grid points (inside obstacles)
    let blocked: HashSet<(usize, usize)> = {
        let mut set = HashSet::new();
        for (xi, &px) in xs.iter().enumerate() {
            for (yi, &py) in ys.iter().enumerate() {
                for &(ox, oy, ow, oh) in obstacles {
                    // Point strictly inside obstacle interior (generous boundary allowance)
                    if px > ox + 8.0 && px < ox + ow - 8.0 && py > oy + 8.0 && py < oy + oh - 8.0 {
                        set.insert((xi, yi));
                        break;
                    }
                }
            }
        }
        set
    };

    // Also check if a segment between two adjacent grid points crosses an obstacle
    let segment_blocked = |xi1: usize, yi1: usize, xi2: usize, yi2: usize| -> bool {
        // Only check horizontal or vertical segments
        let x1 = xs[xi1];
        let y1 = ys[yi1];
        let x2 = xs[xi2];
        let y2 = ys[yi2];
        let inset = 6.0; // allow routing near boundaries
        for &(ox, oy, ow, oh) in obstacles {
            if (x1 - x2).abs() < 0.5 {
                // Vertical segment
                if x1 > ox + inset && x1 < ox + ow - inset {
                    let min_y = y1.min(y2);
                    let max_y = y1.max(y2);
                    if max_y > oy + inset && min_y < oy + oh - inset {
                        return true;
                    }
                }
            } else {
                // Horizontal segment
                if y1 > oy + inset && y1 < oy + oh - inset {
                    let min_x = x1.min(x2);
                    let max_x = x1.max(x2);
                    if max_x > ox + inset && min_x < ox + ow - inset {
                        return true;
                    }
                }
            }
        }
        false
    };

    let stub_len: f32 = MARGIN;

    // 2b. Pre-pass: assign spread ports for fan-out (shared source) and fan-in (shared target)
    //     Spread exit points along the source side, entry points along the target side
    let mut from_ports: Vec<(f32, f32)> = edges.iter().map(|e| e.from_edge).collect();
    let mut to_ports: Vec<(f32, f32)> = edges.iter().map(|e| e.to_edge).collect();

    // Group by source node (same from_rect)
    let mut source_groups: HashMap<String, Vec<usize>> = HashMap::new();
    for (i, edge) in edges.iter().enumerate() {
        let key = format!("{:.0},{:.0}", edge.from_rect.0, edge.from_rect.1);
        source_groups.entry(key).or_default().push(i);
    }
    for indices in source_groups.values() {
        if indices.len() <= 1 {
            continue;
        }
        let (rx, ry, rw, rh) = edges[indices[0]].from_rect;
        let n = indices.len();
        // Spread along the side that most edges exit from
        // For simplicity, spread along the right side (most common exit)
        let spacing = 8.0_f32;
        let total = (n as f32 - 1.0) * spacing;
        let start_y = ry + rh / 2.0 - total / 2.0;
        for (slot, &ei) in indices.iter().enumerate() {
            from_ports[ei] = (rx + rw, start_y + slot as f32 * spacing);
        }
    }

    // Group by target node
    let mut target_groups: HashMap<String, Vec<usize>> = HashMap::new();
    for (i, edge) in edges.iter().enumerate() {
        target_groups.entry(edge.to_id.clone()).or_default().push(i);
    }
    for indices in target_groups.values() {
        if indices.len() <= 1 {
            continue;
        }
        let (rx, ry, _rw, rh) = edges[indices[0]].to_rect;
        let n = indices.len();
        let spacing = 8.0_f32;
        let total = (n as f32 - 1.0) * spacing;
        // Spread along the left side (most common entry for left-to-right flow)
        let start_y = ry + rh / 2.0 - total / 2.0;
        for (slot, &ei) in indices.iter().enumerate() {
            to_ports[ei] = (rx, start_y + slot as f32 * spacing);
        }
    }

    // 3. Phase 1 — Route all edges via A*, collect waypoint paths (don't draw yet)
    let mut routed_paths: Vec<Option<Vec<(f64, f64)>>> = Vec::with_capacity(edges.len());

    for (edge_idx, edge) in edges.iter().enumerate() {
        let (fx, fy, fw, fh) = edge.from_rect;
        let (tx, ty, tw, th) = edge.to_rect;

        let (fe_x, fe_y) = from_ports[edge_idx];
        let from_stub = if (fe_x - fx).abs() < 1.0 {
            (fe_x - stub_len, fe_y)
        } else if (fe_x - (fx + fw)).abs() < 1.0 {
            (fe_x + stub_len, fe_y)
        } else if (fe_y - fy).abs() < 1.0 {
            (fe_x, fe_y - stub_len)
        } else {
            (fe_x, fe_y + stub_len)
        };

        let (te_x, te_y) = to_ports[edge_idx];
        let to_stub = if (te_x - tx).abs() < 1.0 {
            (te_x - stub_len, te_y)
        } else if (te_x - (tx + tw)).abs() < 1.0 {
            (te_x + stub_len, te_y)
        } else if (te_y - ty).abs() < 1.0 {
            (te_x, te_y - stub_len)
        } else {
            (te_x, te_y + stub_len)
        };

        let start = nearest_grid(&xs, &ys, from_stub.0, from_stub.1);
        let goal = nearest_grid(&xs, &ys, to_stub.0, to_stub.1);
        if start == goal {
            routed_paths.push(None);
            continue;
        }

        // Unblock grid points inside source/target rects + stub zones
        let mut local_blocked = blocked.clone();
        for (xi, &px) in xs.iter().enumerate() {
            for (yi, &py) in ys.iter().enumerate() {
                let in_from = px >= fx - MARGIN
                    && px <= fx + fw + MARGIN
                    && py >= fy - MARGIN
                    && py <= fy + fh + MARGIN;
                let in_to = px >= tx - MARGIN
                    && px <= tx + tw + MARGIN
                    && py >= ty - MARGIN
                    && py <= ty + th + MARGIN;
                if in_from || in_to {
                    local_blocked.remove(&(xi, yi));
                }
            }
        }

        let result = astar(
            &(start.clone(), 255u8),
            |&(ref pos, last_dir)| {
                let mut neighbors = Vec::new();
                let dirs: [(i32, i32, u8); 4] = [(0, -1, 0), (0, 1, 1), (-1, 0, 2), (1, 0, 3)];
                for &(dxi, dyi, dir) in &dirs {
                    let nxi = pos.xi as i32 + dxi;
                    let nyi = pos.yi as i32 + dyi;
                    if nxi < 0 || nyi < 0 || nxi >= xs.len() as i32 || nyi >= ys.len() as i32 {
                        continue;
                    }
                    let next = GridPos {
                        xi: nxi as usize,
                        yi: nyi as usize,
                    };
                    if local_blocked.contains(&(next.xi, next.yi)) {
                        continue;
                    }
                    if segment_blocked(pos.xi, pos.yi, next.xi, next.yi) {
                        continue;
                    }

                    let dx = (xs[next.xi] - xs[pos.xi]).abs() as i32;
                    let dy = (ys[next.yi] - ys[pos.yi]).abs() as i32;
                    let turn = if last_dir != 255 && last_dir != dir {
                        TURN_PENALTY
                    } else {
                        0
                    };
                    neighbors.push(((next, dir), dx + dy + turn));
                }
                neighbors
            },
            |(pos, _)| {
                (xs[pos.xi] - xs[goal.xi]).abs() as i32 + (ys[pos.yi] - ys[goal.yi]).abs() as i32
            },
            |(pos, _)| *pos == goal,
        );

        if let Some((path_nodes, _)) = result {
            let points: Vec<(f64, f64)> = path_nodes
                .iter()
                .map(|(pos, _)| (xs[pos.xi] as f64, ys[pos.yi] as f64))
                .collect();
            let simplified = simplify(&points);

            // Build full path: source port -> A* waypoints -> target port
            let mut full_path = vec![(fe_x as f64, fe_y as f64)];
            full_path.extend_from_slice(&simplified);
            full_path.push((te_x as f64, te_y as f64));
            routed_paths.push(Some(full_path));
        } else {
            // Fallback: straight line between spread ports
            routed_paths.push(Some(vec![
                (fe_x as f64, fe_y as f64),
                (te_x as f64, te_y as f64),
            ]));
        }
    }

    // 4. Phase 2 — Pupyrev ink-gain edge bundling (fan-in convergence)
    //    For each group of edges sharing a target node, find the longest common
    //    suffix of their routed paths and mark it as a shared trunk.
    let mut bundle_target_groups: HashMap<String, Vec<usize>> = HashMap::new();
    for (i, edge) in edges.iter().enumerate() {
        bundle_target_groups
            .entry(edge.to_id.clone())
            .or_default()
            .push(i);
    }

    // edge_idx -> draw path up to this index (exclusive); trunk handles the rest
    let mut merge_info: HashMap<usize, usize> = HashMap::new();
    // (trunk_points, stroke_width) — shared trunks to draw
    let mut trunks: Vec<(Vec<(f64, f64)>, f64)> = Vec::new();

    for indices in bundle_target_groups.values() {
        if indices.len() < 2 {
            continue;
        }

        // Collect routed paths for this fan-in group
        let paths: Vec<(usize, &Vec<(f64, f64)>)> = indices
            .iter()
            .filter_map(|&i| routed_paths[i].as_ref().map(|p| (i, p)))
            .collect();
        if paths.len() < 2 {
            continue;
        }

        // Find longest common suffix: walk backward from the end of each path.
        // Two points are "close enough" to merge if within 5px on both axes.
        let min_len = paths.iter().map(|(_, p)| p.len()).min().unwrap_or(0);
        let mut common_suffix_len = 0;
        for offset in 0..min_len {
            let ref_pt = paths[0].1[paths[0].1.len() - 1 - offset];
            let all_close = paths.iter().all(|(_, p)| {
                let pt = p[p.len() - 1 - offset];
                (pt.0 - ref_pt.0).abs() < 5.0 && (pt.1 - ref_pt.1).abs() < 5.0
            });
            if all_close {
                common_suffix_len = offset + 1;
            } else {
                break;
            }
        }

        // Only bundle if we share at least 2 points (a real segment, not just the endpoint)
        if common_suffix_len >= 2 {
            // Compute ink gain: total individual ink vs trunk ink
            // Individual ink = sum of suffix lengths for each path
            // Trunk ink = one copy of the suffix length
            // Only bundle if gain is positive (it always is when suffix >= 2 and paths >= 2)
            let first_path = paths[0].1;
            let trunk_start = first_path.len() - common_suffix_len;
            let trunk: Vec<(f64, f64)> = first_path[trunk_start..].to_vec();

            // Compute trunk ink length
            let trunk_ink: f64 = trunk
                .windows(2)
                .map(|w| ((w[1].0 - w[0].0).powi(2) + (w[1].1 - w[0].1).powi(2)).sqrt())
                .sum();

            // Total individual ink saved = (N-1) * trunk_ink (we still draw one trunk)
            let ink_gain = (paths.len() as f64 - 1.0) * trunk_ink;

            // Only bundle if ink gain exceeds a minimum threshold (avoid bundling trivial stubs)
            if ink_gain > 10.0 {
                for &(idx, path) in &paths {
                    let cut = path.len().saturating_sub(common_suffix_len);
                    // Keep at least 1 point so we can still draw the individual segment
                    merge_info.insert(idx, cut.max(1));
                }

                // Trunk stroke: slightly thicker, capped at 4px
                let trunk_width = 2.0 + (paths.len() as f64 - 1.0) * 0.5;
                trunks.push((trunk, trunk_width.min(4.0)));
            }
        }
    }

    // 5. Phase 3 — Draw individual paths (truncated at merge point if bundled)
    let stroke_normal = Stroke::new(2.0);
    let color = Color::from_rgba8(90, 90, 90, 200);

    for (edge_idx, edge) in edges.iter().enumerate() {
        if let Some(full_path) = &routed_paths[edge_idx] {
            let draw_until = merge_info
                .get(&edge_idx)
                .copied()
                .unwrap_or(full_path.len());
            let points_to_draw = &full_path[..draw_until];

            if points_to_draw.len() >= 2 {
                let mut path = BezPath::new();
                path.move_to(points_to_draw[0]);
                for &pt in &points_to_draw[1..] {
                    path.line_to(pt);
                }
                scene.stroke(
                    &stroke_normal,
                    vello::kurbo::Affine::IDENTITY,
                    color,
                    None,
                    &path,
                );
            }

            // Arrowhead: only draw on non-bundled edges (trunks get their own arrowhead)
            if !merge_info.contains_key(&edge_idx) && full_path.len() >= 2 {
                let last = full_path[full_path.len() - 2];
                let target = *full_path.last().unwrap();
                arrowhead(scene, last, target, color);
            }

            // Render edge label at midpoint of the full path
            if let Some(label_text) = &edge.label {
                if !label_text.is_empty() {
                    let mid_idx = full_path.len() / 2;
                    let (mx, my) = if full_path.len() >= 2 {
                        let a = full_path[mid_idx.saturating_sub(1)];
                        let b = full_path[mid_idx.min(full_path.len() - 1)];
                        ((a.0 + b.0) / 2.0, (a.1 + b.1) / 2.0)
                    } else {
                        let src = full_path[0];
                        let tgt = *full_path.last().unwrap();
                        ((src.0 + tgt.0) / 2.0, (src.1 + tgt.1) / 2.0)
                    };

                    let font_size = 11.0_f32;
                    let (tw_px, th_px) = label_tr.measure(label_text, font_size, 999.0, None, None);
                    let pad = 3.0_f64;
                    let bg_x = mx - tw_px as f64 / 2.0 - pad;
                    let bg_y = my - th_px as f64 / 2.0 - pad - 2.0;
                    let bg_w = tw_px as f64 + pad * 2.0;
                    let bg_h = th_px as f64 + pad * 2.0;

                    scene.fill(
                        Fill::NonZero,
                        vello::kurbo::Affine::IDENTITY,
                        Color::from_rgba8(250, 250, 250, 230),
                        None,
                        &vello::kurbo::Rect::new(bg_x, bg_y, bg_x + bg_w, bg_y + bg_h),
                    );

                    let shaped = label_tr.shape_to_glyphs(label_text, font_size, 999.0, None, None);
                    if !shaped.glyphs.is_empty() && !shaped.font_data.is_empty() {
                        let blob: Blob<u8> = Blob::from(shaped.font_data);
                        let font_data = FontData::new(blob, 0);
                        let text_x = mx - tw_px as f64 / 2.0;
                        let text_y = my - th_px as f64 / 2.0 - 2.0;
                        let label_color = Color::from_rgba8(100, 100, 100, 255);
                        scene
                            .draw_glyphs(&font_data)
                            .font_size(font_size)
                            .transform(vello::kurbo::Affine::translate((text_x, text_y)))
                            .brush(&Brush::Solid(label_color))
                            .draw(
                                Fill::NonZero,
                                shaped.glyphs.iter().map(|g| vello::Glyph {
                                    id: g.id,
                                    x: g.x,
                                    y: g.y,
                                }),
                            );
                    }
                }
            }
        }
    }

    // 6. Phase 4 — Draw bundled trunk segments (slightly thicker, with arrowhead)
    for (trunk_points, width) in &trunks {
        if trunk_points.len() >= 2 {
            let trunk_stroke = Stroke::new(*width);
            let mut path = BezPath::new();
            path.move_to(trunk_points[0]);
            for &pt in &trunk_points[1..] {
                path.line_to(pt);
            }
            scene.stroke(
                &trunk_stroke,
                vello::kurbo::Affine::IDENTITY,
                color,
                None,
                &path,
            );

            // Arrowhead at the trunk endpoint (the shared target)
            let last = trunk_points[trunk_points.len() - 2];
            let target = *trunk_points.last().unwrap();
            arrowhead(scene, last, target, color);
        }
    }
}

fn nearest_grid(xs: &[f32], ys: &[f32], px: f32, py: f32) -> GridPos {
    let xi = xs
        .iter()
        .enumerate()
        .min_by(|(_, a), (_, b)| ((**a - px).abs()).partial_cmp(&((**b - px).abs())).unwrap())
        .map(|(i, _)| i)
        .unwrap_or(0);
    let yi = ys
        .iter()
        .enumerate()
        .min_by(|(_, a), (_, b)| ((**a - py).abs()).partial_cmp(&((**b - py).abs())).unwrap())
        .map(|(i, _)| i)
        .unwrap_or(0);
    GridPos { xi, yi }
}

fn simplify(pts: &[(f64, f64)]) -> Vec<(f64, f64)> {
    if pts.len() <= 2 {
        return pts.to_vec();
    }
    let mut r = vec![pts[0]];
    for i in 1..pts.len() - 1 {
        let prev = r.last().unwrap();
        let curr = &pts[i];
        let next = &pts[i + 1];
        let same_x = (prev.0 - curr.0).abs() < 0.5 && (curr.0 - next.0).abs() < 0.5;
        let same_y = (prev.1 - curr.1).abs() < 0.5 && (curr.1 - next.1).abs() < 0.5;
        if !same_x || !same_y {
            r.push(*curr);
        }
    }
    r.push(*pts.last().unwrap());
    r
}

fn arrowhead(scene: &mut vello::Scene, from: (f64, f64), to: (f64, f64), color: Color) {
    let dx = to.0 - from.0;
    let dy = to.1 - from.1;
    let len = (dx * dx + dy * dy).sqrt();
    if len < 1.0 {
        return;
    }
    let ux = dx / len;
    let uy = dy / len;
    let al = 9.0;
    let aw = 4.5;
    let mut a = BezPath::new();
    a.move_to(to);
    a.line_to((to.0 - ux * al - uy * aw, to.1 - uy * al + ux * aw));
    a.line_to((to.0 - ux * al + uy * aw, to.1 - uy * al - ux * aw));
    a.close_path();
    scene.fill(
        Fill::NonZero,
        vello::kurbo::Affine::IDENTITY,
        color,
        None,
        &a,
    );
}

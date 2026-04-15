use crate::report::{AnalysisReport, Finding, Severity};
use owo_colors::OwoColorize;
use rvst_snapshot::SceneSnapshot;

/// Report containing density heatmap analysis findings.
#[derive(Debug)]
pub struct HeatmapReport {
    pub findings_list: Vec<Finding>,
    /// Normalized 0.0-1.0 density per cell, indexed as grid[row][col].
    pub grid: Vec<Vec<f32>>,
    pub cols: usize,
    pub rows: usize,
    /// Top 5 hotspot cells (col, row, density), sorted descending by density.
    pub hotspots: Vec<(usize, usize, f32)>,
    /// Max node overlap count before normalization.
    pub max_raw_density: usize,
}

/// Linearly interpolate between two RGB colors.
pub fn lerp_rgb(a: (u8, u8, u8), b: (u8, u8, u8), t: f32) -> (u8, u8, u8) {
    (
        (a.0 as f32 + (b.0 as f32 - a.0 as f32) * t) as u8,
        (a.1 as f32 + (b.1 as f32 - a.1 as f32) * t) as u8,
        (a.2 as f32 + (b.2 as f32 - a.2 as f32) * t) as u8,
    )
}

/// Map a density value (0.0-1.0) to an RGB color on a gradient.
///
/// Stops:
/// - t=0.0: (26, 26, 46)    dark blue (empty)
/// - t=0.3: (22, 83, 126)   blue (sparse)
/// - t=0.6: (246, 211, 101)  yellow (moderate)
/// - t=1.0: (255, 107, 107)  red (dense)
pub fn density_to_rgb(t: f32) -> (u8, u8, u8) {
    let t = t.clamp(0.0, 1.0);
    if t <= 0.3 {
        lerp_rgb((26, 26, 46), (22, 83, 126), t / 0.3)
    } else if t <= 0.6 {
        lerp_rgb((22, 83, 126), (246, 211, 101), (t - 0.3) / 0.3)
    } else {
        lerp_rgb((246, 211, 101), (255, 107, 107), (t - 0.6) / 0.4)
    }
}

/// Analyze node density across a grid overlaid on the viewport.
pub fn analyze_heatmap(snap: &SceneSnapshot, cols: usize, rows: usize) -> HeatmapReport {
    let mut findings = Vec::new();

    // Step 1: Create raw counter grid
    let mut raw: Vec<Vec<usize>> = vec![vec![0usize; cols]; rows];

    let cell_w = if cols > 0 { snap.viewport_w / cols as f32 } else { snap.viewport_w };
    let cell_h = if rows > 0 { snap.viewport_h / rows as f32 } else { snap.viewport_h };

    // Step 3: For each node with a layout rect, find overlapping cells
    for node in &snap.nodes {
        if let Some(ref rect) = node.layout {
            // Compute the range of cells this rect overlaps
            let left = rect.x;
            let top = rect.y;
            let right = rect.x + rect.w;
            let bottom = rect.y + rect.h;

            let col_start = ((left / cell_w).floor() as isize).max(0) as usize;
            let col_end = ((right / cell_w).ceil() as usize).min(cols);
            let row_start = ((top / cell_h).floor() as isize).max(0) as usize;
            let row_end = ((bottom / cell_h).ceil() as usize).min(rows);

            for r in row_start..row_end {
                for c in col_start..col_end {
                    raw[r][c] += 1;
                }
            }
        }
    }

    // Step 4: Find max cell value
    let max_raw = raw.iter().flat_map(|row| row.iter()).copied().max().unwrap_or(0);

    // Step 5: Normalize
    let grid: Vec<Vec<f32>> = raw
        .iter()
        .map(|row| {
            row.iter()
                .map(|&v| {
                    if max_raw > 0 {
                        v as f32 / max_raw as f32
                    } else {
                        0.0
                    }
                })
                .collect()
        })
        .collect();

    // Step 6: Find top 5 hotspots (col, row, density), sorted descending
    let mut cells: Vec<(usize, usize, f32)> = Vec::new();
    for (r, row) in grid.iter().enumerate() {
        for (c, &val) in row.iter().enumerate() {
            cells.push((c, r, val));
        }
    }
    cells.sort_by(|a, b| b.2.partial_cmp(&a.2).unwrap_or(std::cmp::Ordering::Equal));
    let hotspots: Vec<(usize, usize, f32)> = cells.into_iter().take(5).collect();

    // Step 7: Generate findings
    if let Some(&(col, row, _)) = hotspots.first() {
        findings.push(Finding {
            severity: Severity::Info,
            category: "heatmap",
            message: format!("Peak density: {} nodes at ({}, {})", max_raw, col, row),
            node_ids: vec![],
            evidence: vec![],
        });
    }

    if max_raw > 20 {
        findings.push(Finding {
            severity: Severity::Warning,
            category: "heatmap",
            message: format!("UI density hotspot: {} overlapping elements", max_raw),
            node_ids: vec![],
            evidence: vec![],
        });
    }

    findings.push(Finding {
        severity: Severity::Info,
        category: "heatmap",
        message: format!("Grid resolution: {}x{}", cols, rows),
        node_ids: vec![],
        evidence: vec![],
    });

    HeatmapReport {
        findings_list: findings,
        grid,
        cols,
        rows,
        hotspots,
        max_raw_density: max_raw,
    }
}

impl AnalysisReport for HeatmapReport {
    fn findings(&self) -> &[Finding] {
        &self.findings_list
    }

    fn to_colored_string(&self) -> String {
        let mut out = String::new();
        out.push_str(&format!("\n{}\n\n", "━━ Density Heatmap ━━".bold()));

        // Render grid using half-block chars (▀) to pack 2 rows per terminal line
        let mut r = 0;
        while r < self.rows {
            out.push_str("  ");
            for c in 0..self.cols {
                let top_density = self.grid[r][c];
                let top_rgb = density_to_rgb(top_density);

                if r + 1 < self.rows {
                    let bot_density = self.grid[r + 1][c];
                    let bot_rgb = density_to_rgb(bot_density);
                    // Top row as foreground, bottom row as background, half-block
                    out.push_str(&format!(
                        "\x1b[38;2;{};{};{}m\x1b[48;2;{};{};{}m\u{2580}\x1b[0m",
                        top_rgb.0, top_rgb.1, top_rgb.2,
                        bot_rgb.0, bot_rgb.1, bot_rgb.2,
                    ));
                } else {
                    // Odd last row: just foreground half-block on default bg
                    out.push_str(&format!(
                        "\x1b[38;2;{};{};{}m\u{2580}\x1b[0m",
                        top_rgb.0, top_rgb.1, top_rgb.2,
                    ));
                }
            }
            out.push('\n');
            r += 2;
        }

        // Legend
        let empty_rgb = density_to_rgb(0.0);
        let sparse_rgb = density_to_rgb(0.3);
        let moderate_rgb = density_to_rgb(0.6);
        let dense_rgb = density_to_rgb(1.0);

        out.push_str(&format!(
            "\n  Legend: \x1b[38;2;{};{};{}m\u{2588}\u{2588}\x1b[0m empty  \
             \x1b[38;2;{};{};{}m\u{2588}\u{2588}\x1b[0m sparse  \
             \x1b[38;2;{};{};{}m\u{2588}\u{2588}\x1b[0m moderate  \
             \x1b[38;2;{};{};{}m\u{2588}\u{2588}\x1b[0m dense\n",
            empty_rgb.0, empty_rgb.1, empty_rgb.2,
            sparse_rgb.0, sparse_rgb.1, sparse_rgb.2,
            moderate_rgb.0, moderate_rgb.1, moderate_rgb.2,
            dense_rgb.0, dense_rgb.1, dense_rgb.2,
        ));

        // Hotspots
        if !self.hotspots.is_empty() {
            out.push_str("\n  Hotspots:\n");
            for &(col, row, density) in &self.hotspots {
                out.push_str(&format!("    ({}, {}) density {:.2}\n", col, row, density));
            }
        }

        // Peak density
        out.push_str(&format!(
            "\n  Peak density: {} overlapping nodes\n",
            self.max_raw_density
        ));

        out
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use rvst_snapshot::{NodeSnapshot, RectSnapshot, SceneSnapshot};

    fn make_snap(viewport_w: f32, viewport_h: f32, nodes: Vec<NodeSnapshot>) -> SceneSnapshot {
        SceneSnapshot {
            node_count: nodes.len(),
            root_children: nodes.iter().map(|n| n.id).collect(),
            focused_id: None,
            viewport_w,
            viewport_h,
            diagnostics: vec![],
            nodes,
        }
    }

    fn make_node(id: u32, layout: Option<RectSnapshot>) -> NodeSnapshot {
        NodeSnapshot {
            id,
            node_type: "div".to_string(),
            text: None,
            parent: None,
            children: vec![],
            styles: Default::default(),
            layout,
            scroll_y: 0.0,
            focused: false,
            has_handlers: false,
            semantic_id: String::new(),
            role: "generic".to_string(),
            name: None,
        }
    }

    #[test]
    fn grid_dimensions() {
        let snap = make_snap(100.0, 100.0, vec![
            make_node(1, Some(RectSnapshot { x: 10.0, y: 10.0, w: 20.0, h: 20.0 })),
        ]);
        let report = analyze_heatmap(&snap, 10, 10);
        assert_eq!(report.cols, 10);
        assert_eq!(report.rows, 10);
        assert_eq!(report.grid.len(), 10);
        assert_eq!(report.grid[0].len(), 10);
    }

    #[test]
    fn density_normalized_0_to_1() {
        let snap = make_snap(100.0, 100.0, vec![
            make_node(1, Some(RectSnapshot { x: 0.0, y: 0.0, w: 50.0, h: 50.0 })),
            make_node(2, Some(RectSnapshot { x: 25.0, y: 25.0, w: 50.0, h: 50.0 })),
        ]);
        let report = analyze_heatmap(&snap, 10, 10);
        for row in &report.grid {
            for &val in row {
                assert!(val >= 0.0 && val <= 1.0, "density out of range: {}", val);
            }
        }
    }

    #[test]
    fn empty_snap_all_zeros() {
        let snap = make_snap(100.0, 100.0, vec![]);
        let report = analyze_heatmap(&snap, 5, 5);
        assert!(report.grid.iter().all(|row| row.iter().all(|&v| v == 0.0)));
        assert_eq!(report.max_raw_density, 0);
    }

    #[test]
    fn hotspots_sorted_descending() {
        let snap = make_snap(100.0, 100.0, vec![
            make_node(1, Some(RectSnapshot { x: 0.0, y: 0.0, w: 30.0, h: 30.0 })),
            make_node(2, Some(RectSnapshot { x: 10.0, y: 10.0, w: 30.0, h: 30.0 })),
            make_node(3, Some(RectSnapshot { x: 50.0, y: 50.0, w: 20.0, h: 20.0 })),
        ]);
        let report = analyze_heatmap(&snap, 10, 10);
        for w in report.hotspots.windows(2) {
            assert!(w[0].2 >= w[1].2, "hotspots not sorted: {} < {}", w[0].2, w[1].2);
        }
    }

    #[test]
    fn lerp_rgb_endpoints() {
        assert_eq!(lerp_rgb((0, 0, 0), (255, 255, 255), 0.0), (0, 0, 0));
        assert_eq!(lerp_rgb((0, 0, 0), (255, 255, 255), 1.0), (255, 255, 255));
    }

    #[test]
    fn density_to_rgb_endpoints() {
        assert_eq!(density_to_rgb(0.0), (26, 26, 46));
        assert_eq!(density_to_rgb(1.0), (255, 107, 107));
    }

    #[test]
    fn colored_output_contains_legend() {
        let snap = make_snap(100.0, 100.0, vec![
            make_node(1, Some(RectSnapshot { x: 0.0, y: 0.0, w: 50.0, h: 50.0 })),
        ]);
        let report = analyze_heatmap(&snap, 5, 5);
        let output = report.to_colored_string();
        assert!(output.contains("Legend:"));
        assert!(output.contains("Hotspots:"));
        assert!(output.contains("Peak density:"));
    }

    #[test]
    fn warning_on_high_density() {
        // Create many overlapping nodes to exceed threshold of 20
        let nodes: Vec<NodeSnapshot> = (0..25)
            .map(|i| make_node(i, Some(RectSnapshot { x: 0.0, y: 0.0, w: 10.0, h: 10.0 })))
            .collect();
        let snap = make_snap(100.0, 100.0, nodes);
        let report = analyze_heatmap(&snap, 10, 10);
        assert!(report.max_raw_density > 20);
        assert!(report.findings_list.iter().any(|f| {
            matches!(f.severity, Severity::Warning) && f.message.contains("UI density hotspot")
        }));
    }

    #[test]
    fn nodes_without_layout_are_skipped() {
        let snap = make_snap(100.0, 100.0, vec![
            make_node(1, None),
            make_node(2, None),
        ]);
        let report = analyze_heatmap(&snap, 5, 5);
        assert!(report.grid.iter().all(|row| row.iter().all(|&v| v == 0.0)));
        assert_eq!(report.max_raw_density, 0);
    }
}

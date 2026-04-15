use crate::report::{AnalysisReport, Finding, Severity};
use owo_colors::OwoColorize;
use rvst_snapshot::SceneSnapshot;
use std::collections::HashMap;

/// Report containing layout analysis findings.
#[derive(Debug)]
pub struct LayoutReport {
    pub findings_list: Vec<Finding>,
    pub node_count: usize,
    pub max_depth: usize,
    pub nodes_by_depth: Vec<(usize, usize)>,
    pub viewport_utilization: f32,
    pub whitespace_ratio: f32,
    pub largest_nodes: Vec<(u32, f32, f32)>,
    pub smallest_nodes: Vec<(u32, f32, f32)>,
    pub flex_row_count: usize,
    pub flex_col_count: usize,
}

/// Analyze the layout of a scene snapshot.
pub fn analyze_layout(snap: &SceneSnapshot) -> LayoutReport {
    let node_count = snap.nodes.len();

    // Build id -> node index map
    let id_to_idx: HashMap<u32, usize> = snap
        .nodes
        .iter()
        .enumerate()
        .map(|(i, n)| (n.id, i))
        .collect();

    // BFS from root_children to compute depth per node
    let mut depth_map: HashMap<u32, usize> = HashMap::new();
    let mut queue: std::collections::VecDeque<(u32, usize)> = std::collections::VecDeque::new();

    for &root_id in &snap.root_children {
        depth_map.insert(root_id, 0);
        queue.push_back((root_id, 0));
    }

    while let Some((node_id, depth)) = queue.pop_front() {
        if let Some(&idx) = id_to_idx.get(&node_id) {
            let node = &snap.nodes[idx];
            for &child_id in &node.children {
                if !depth_map.contains_key(&child_id) {
                    depth_map.insert(child_id, depth + 1);
                    queue.push_back((child_id, depth + 1));
                }
            }
        }
    }

    // Max depth
    let max_depth = depth_map.values().copied().max().unwrap_or(0);

    // Count nodes at each depth level
    let mut depth_counts: HashMap<usize, usize> = HashMap::new();
    for &d in depth_map.values() {
        *depth_counts.entry(d).or_insert(0) += 1;
    }
    let mut nodes_by_depth: Vec<(usize, usize)> = depth_counts.into_iter().collect();
    nodes_by_depth.sort_by_key(|&(d, _)| d);

    // Compute viewport utilization: sum area of leaf nodes / viewport area
    let viewport_area = snap.viewport_w * snap.viewport_h;
    let leaf_area: f32 = snap
        .nodes
        .iter()
        .filter(|n| n.children.is_empty())
        .filter_map(|n| n.layout.as_ref())
        .map(|r| r.w * r.h)
        .sum();

    let viewport_utilization = if viewport_area > 0.0 {
        (leaf_area / viewport_area * 100.0).min(100.0)
    } else {
        0.0
    };
    let whitespace_ratio = 100.0 - viewport_utilization;

    // Collect nodes with their areas for sorting
    let mut nodes_with_area: Vec<(u32, f32, f32, f32)> = snap
        .nodes
        .iter()
        .filter_map(|n| {
            n.layout
                .as_ref()
                .map(|r| (n.id, r.w, r.h, r.w * r.h))
        })
        .collect();

    // Largest top 5
    nodes_with_area.sort_by(|a, b| b.3.partial_cmp(&a.3).unwrap_or(std::cmp::Ordering::Equal));
    let largest_nodes: Vec<(u32, f32, f32)> = nodes_with_area
        .iter()
        .take(5)
        .map(|&(id, w, h, _)| (id, w, h))
        .collect();

    // Smallest top 5 non-zero
    let smallest_nodes: Vec<(u32, f32, f32)> = nodes_with_area
        .iter()
        .rev()
        .filter(|&&(_, _, _, area)| area > 0.0)
        .take(5)
        .map(|&(id, w, h, _)| (id, w, h))
        .collect();

    // Count flex-direction
    let mut flex_row_count = 0usize;
    let mut flex_col_count = 0usize;
    for node in &snap.nodes {
        if let Some(dir) = node.styles.get("flex-direction") {
            match dir.as_str() {
                "row" => flex_row_count += 1,
                "column" => flex_col_count += 1,
                _ => {}
            }
        }
    }

    // Generate findings
    let mut findings_list = Vec::new();

    if max_depth > 10 {
        findings_list.push(Finding {
            severity: Severity::Warning,
            category: "layout",
            message: format!(
                "Deep nesting: {} levels \u{2014} consider flattening",
                max_depth
            ),
            node_ids: vec![],
            evidence: vec![],
        });
    }

    findings_list.push(Finding {
        severity: Severity::Info,
        category: "layout",
        message: format!("Viewport utilization: {:.1}%", viewport_utilization),
        node_ids: vec![],
        evidence: vec![],
    });

    if whitespace_ratio > 70.0 {
        findings_list.push(Finding {
            severity: Severity::Warning,
            category: "layout",
            message: format!("Low utilization: {:.1}% whitespace", whitespace_ratio),
            node_ids: vec![],
            evidence: vec![],
        });
    }

    findings_list.push(Finding {
        severity: Severity::Info,
        category: "layout",
        message: format!(
            "Flex distribution: {} row, {} column",
            flex_row_count, flex_col_count
        ),
        node_ids: vec![],
        evidence: vec![],
    });

    LayoutReport {
        findings_list,
        node_count,
        max_depth,
        nodes_by_depth,
        viewport_utilization,
        whitespace_ratio,
        largest_nodes,
        smallest_nodes,
        flex_row_count,
        flex_col_count,
    }
}

impl AnalysisReport for LayoutReport {
    fn findings(&self) -> &[Finding] {
        &self.findings_list
    }

    fn to_colored_string(&self) -> String {
        let mut out = String::new();
        out.push_str(&format!("{}\n\n", "\u{2501}\u{2501} Layout \u{2501}\u{2501}".bold()));

        // Stats table
        out.push_str(&format!(
            "  {:<15}{}\n",
            "Nodes",
            self.node_count
        ));
        out.push_str(&format!(
            "  {:<15}{}\n",
            "Max depth",
            self.max_depth
        ));

        // Utilization colored
        let util_str = format!("{:.1}%", self.viewport_utilization);
        let colored_util = if self.viewport_utilization > 50.0 {
            util_str.green().to_string()
        } else if self.viewport_utilization >= 30.0 {
            util_str.yellow().to_string()
        } else {
            util_str.red().to_string()
        };
        out.push_str(&format!("  {:<15}{}\n", "Utilization", colored_util));

        out.push_str(&format!(
            "  {:<15}{:.1}%\n",
            "Whitespace", self.whitespace_ratio
        ));
        out.push_str(&format!(
            "  {:<15}{}\n",
            "Flex row", self.flex_row_count
        ));
        out.push_str(&format!(
            "  {:<15}{}\n",
            "Flex column", self.flex_col_count
        ));

        // Depth distribution histogram
        if !self.nodes_by_depth.is_empty() {
            out.push_str(&format!(
                "\n  {}:\n",
                "Depth distribution".dimmed()
            ));

            let max_count = self
                .nodes_by_depth
                .iter()
                .map(|&(_, c)| c)
                .max()
                .unwrap_or(1);

            for &(depth, count) in &self.nodes_by_depth {
                let bar_len = if max_count > 0 {
                    (count as f32 / max_count as f32 * 40.0).ceil() as usize
                } else {
                    0
                };
                let bar: String = "\u{2588}".repeat(bar_len);
                out.push_str(&format!(
                    "    {:>2} \u{2502}{} {}\n",
                    depth,
                    bar.blue(),
                    count
                ));
            }
        }

        // Largest nodes
        if !self.largest_nodes.is_empty() {
            out.push_str(&format!("\n  {}:\n", "Largest".dimmed()));
            for &(id, w, h) in &self.largest_nodes {
                out.push_str(&format!(
                    "    #{:<4} {}×{}\n",
                    id,
                    w as u32,
                    h as u32
                ));
            }
        }

        // Findings count
        out.push_str(&format!("\n  {} findings\n", self.findings_list.len()));

        out
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use rvst_snapshot::{NodeSnapshot, RectSnapshot};
    use rvst_snapshot::SceneSnapshot;
    use std::collections::HashMap;

    fn empty_snapshot() -> SceneSnapshot {
        SceneSnapshot {
            nodes: vec![],
            root_children: vec![],
            focused_id: None,
            node_count: 0,
            viewport_w: 800.0,
            viewport_h: 600.0,
            diagnostics: vec![],
        }
    }

    fn make_node(id: u32, parent: Option<u32>, children: Vec<u32>, layout: Option<RectSnapshot>, styles: HashMap<String, String>) -> NodeSnapshot {
        NodeSnapshot {
            id,
            node_type: "view".to_string(),
            text: None,
            parent,
            children,
            styles,
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
    fn empty_snapshot_returns_sensible_defaults() {
        let snap = empty_snapshot();
        let report = analyze_layout(&snap);
        assert_eq!(report.node_count, 0);
        assert_eq!(report.max_depth, 0);
        assert!(report.nodes_by_depth.is_empty());
        assert_eq!(report.viewport_utilization, 0.0);
        assert_eq!(report.whitespace_ratio, 100.0);
        assert!(report.largest_nodes.is_empty());
        assert!(report.smallest_nodes.is_empty());
        assert_eq!(report.flex_row_count, 0);
        assert_eq!(report.flex_col_count, 0);
    }

    #[test]
    fn three_level_depth() {
        // root(0) -> child(1) -> grandchild(2)
        let snap = SceneSnapshot {
            nodes: vec![
                make_node(0, None, vec![1], Some(RectSnapshot { x: 0.0, y: 0.0, w: 800.0, h: 600.0 }), HashMap::new()),
                make_node(1, Some(0), vec![2], Some(RectSnapshot { x: 0.0, y: 0.0, w: 400.0, h: 300.0 }), HashMap::new()),
                make_node(2, Some(1), vec![], Some(RectSnapshot { x: 0.0, y: 0.0, w: 200.0, h: 150.0 }), HashMap::new()),
            ],
            root_children: vec![0],
            focused_id: None,
            node_count: 3,
            viewport_w: 800.0,
            viewport_h: 600.0,
            diagnostics: vec![],
        };

        let report = analyze_layout(&snap);
        assert_eq!(report.max_depth, 2);
        assert_eq!(report.node_count, 3);
        // Depths: 0->0, 1->1, 2->2
        assert_eq!(report.nodes_by_depth.len(), 3);
    }

    #[test]
    fn viewport_utilization_bounded() {
        // Single leaf node that fills the viewport
        let snap = SceneSnapshot {
            nodes: vec![
                make_node(0, None, vec![], Some(RectSnapshot { x: 0.0, y: 0.0, w: 800.0, h: 600.0 }), HashMap::new()),
            ],
            root_children: vec![0],
            focused_id: None,
            node_count: 1,
            viewport_w: 800.0,
            viewport_h: 600.0,
            diagnostics: vec![],
        };

        let report = analyze_layout(&snap);
        assert!(report.viewport_utilization >= 0.0);
        assert!(report.viewport_utilization <= 100.0);
        // Full coverage
        assert!((report.viewport_utilization - 100.0).abs() < 0.01);
    }

    #[test]
    fn flex_direction_counts() {
        let mut row_styles = HashMap::new();
        row_styles.insert("flex-direction".to_string(), "row".to_string());
        let mut col_styles = HashMap::new();
        col_styles.insert("flex-direction".to_string(), "column".to_string());

        let snap = SceneSnapshot {
            nodes: vec![
                make_node(0, None, vec![1, 2, 3], Some(RectSnapshot { x: 0.0, y: 0.0, w: 800.0, h: 600.0 }), row_styles.clone()),
                make_node(1, Some(0), vec![], Some(RectSnapshot { x: 0.0, y: 0.0, w: 200.0, h: 100.0 }), row_styles.clone()),
                make_node(2, Some(0), vec![], Some(RectSnapshot { x: 200.0, y: 0.0, w: 200.0, h: 100.0 }), col_styles.clone()),
                make_node(3, Some(0), vec![], Some(RectSnapshot { x: 400.0, y: 0.0, w: 200.0, h: 100.0 }), col_styles),
            ],
            root_children: vec![0],
            focused_id: None,
            node_count: 4,
            viewport_w: 800.0,
            viewport_h: 600.0,
            diagnostics: vec![],
        };

        let report = analyze_layout(&snap);
        assert_eq!(report.flex_row_count, 2);
        assert_eq!(report.flex_col_count, 2);
    }
}

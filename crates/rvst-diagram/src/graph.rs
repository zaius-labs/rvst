//! Graph layout using petgraph + gen_sugiyama.
//! Converts Diagram schema → petgraph DiGraph → sugiyama layout → positioned nodes.

use crate::schema::{Diagram, Node, NodeKind};
use gen_sugiyama::{assign_coordinates, run_sugiyama_algorithm, Config, Edge as SugEdge, Vertex};
use petgraph::stable_graph::{NodeIndex, StableDiGraph};
use std::collections::HashMap;

/// A node with its computed layout position from sugiyama.
#[derive(Debug, Clone)]
pub struct PositionedNode {
    pub id: String,
    pub label: String,
    pub kind: NodeKind,
    pub parent: Option<String>,
    pub fill: Option<String>,
    /// Position from sugiyama (layer-based coordinates)
    pub x: f64,
    pub y: f64,
}

/// Result of graph layout computation.
pub struct GraphLayout {
    pub nodes: Vec<PositionedNode>,
    /// Edges with from/to IDs (positions come from nodes)
    pub edges: Vec<(String, String, Option<String>)>,
}

/// Build a petgraph DiGraph from a Diagram and run sugiyama layout.
/// Returns positioned nodes with (x, y) coordinates.
pub fn layout_graph(diagram: &Diagram) -> GraphLayout {
    // Separate grouped vs ungrouped leaf nodes.
    // Grouped nodes get simple grid positioning (within their group).
    // Ungrouped nodes (+ groups themselves as proxies) go through sugiyama.
    let leaf_nodes: Vec<&Node> = diagram
        .nodes
        .iter()
        .filter(|n| n.kind != NodeKind::Group)
        .collect();

    let grouped: Vec<&Node> = leaf_nodes
        .iter()
        .filter(|n| n.parent.is_some())
        .copied()
        .collect();
    let ungrouped: Vec<&Node> = leaf_nodes
        .iter()
        .filter(|n| n.parent.is_none())
        .copied()
        .collect();

    if leaf_nodes.is_empty() {
        return GraphLayout {
            nodes: vec![],
            edges: vec![],
        };
    }

    let edge_list: Vec<_> = diagram
        .edges
        .iter()
        .map(|e| (e.from.clone(), e.to.clone(), e.label.clone()))
        .collect();

    let mut positioned = Vec::new();

    // 1. Position grouped nodes as a simple grid within their group (y=0 for all)
    //    These get laid out by Taffy within their group container — sugiyama isn't needed.
    for (i, node) in grouped.iter().enumerate() {
        positioned.push(PositionedNode {
            id: node.id.clone(),
            label: node.label.clone(),
            kind: node.kind.clone(),
            parent: node.parent.clone(),
            fill: node.fill.clone(),
            x: i as f64,
            y: 0.0, // all same y — build_graph merges into one row per parent
        });
    }

    // 2. Position ungrouped nodes via sugiyama (or linear if no edges)
    if ungrouped.is_empty() {
        return GraphLayout {
            nodes: positioned,
            edges: edge_list,
        };
    }

    // Build petgraph for ungrouped nodes only
    let mut graph: StableDiGraph<Vertex, SugEdge> = StableDiGraph::new();
    let mut id_to_idx: HashMap<String, NodeIndex> = HashMap::new();
    let mut idx_to_id: HashMap<NodeIndex, String> = HashMap::new();

    for node in &ungrouped {
        let idx = graph.add_node(Vertex::new(NodeIndex::new(0)));
        id_to_idx.insert(node.id.clone(), idx);
        idx_to_id.insert(idx, node.id.clone());
    }
    for &idx in id_to_idx.values() {
        graph[idx] = Vertex::new(idx);
    }

    // Add edges between ungrouped nodes only
    for edge in &diagram.edges {
        if let (Some(&from_idx), Some(&to_idx)) =
            (id_to_idx.get(&edge.from), id_to_idx.get(&edge.to))
        {
            let sug_edge = SugEdge::default().with_label((from_idx, to_idx));
            graph.add_edge(from_idx, to_idx, sug_edge);
        }
    }

    if graph.edge_count() == 0 {
        // No edges between ungrouped nodes — linear positioning
        for (i, node) in ungrouped.iter().enumerate() {
            positioned.push(PositionedNode {
                id: node.id.clone(),
                label: node.label.clone(),
                kind: node.kind.clone(),
                parent: node.parent.clone(),
                fill: node.fill.clone(),
                x: i as f64,
                y: 100.0, // separate y from grouped nodes
            });
        }
    } else {
        // Run sugiyama on ungrouped nodes
        let config = Config {
            vertex_spacing: 2.0,
            ..Config::default()
        };

        let mut layers = run_sugiyama_algorithm(&mut graph, &config);
        let coordinates = assign_coordinates(&mut layers, &mut graph);

        let mut coord_map: HashMap<String, (i64, i64)> = HashMap::new();
        for (idx, (x, y)) in &coordinates {
            if graph
                .node_weight(*idx)
                .map(|v| v.is_dummy())
                .unwrap_or(true)
            {
                continue;
            }
            if let Some(id) = idx_to_id.get(idx) {
                coord_map.insert(id.clone(), (*x, *y));
            }
        }

        // Offset ungrouped y-coordinates below grouped nodes
        let y_offset = if grouped.is_empty() { 0 } else { 100 };
        for node in &ungrouped {
            let (x, y) = coord_map.get(&node.id).copied().unwrap_or((0, 0));
            positioned.push(PositionedNode {
                id: node.id.clone(),
                label: node.label.clone(),
                kind: node.kind.clone(),
                parent: node.parent.clone(),
                fill: node.fill.clone(),
                x: x as f64,
                y: (y + y_offset) as f64,
            });
        }
    }

    GraphLayout {
        nodes: positioned,
        edges: edge_list,
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::schema::*;

    fn test_diagram() -> Diagram {
        Diagram {
            canvas: Canvas {
                width: 1200,
                height: 630,
                padding: 40,
            },
            nodes: vec![
                Node {
                    id: "a".into(),
                    label: "Input".into(),
                    kind: NodeKind::Card,
                    parent: None,
                    fill: None,
                    priority: 1,
                    description: None,
                    metadata: None,
                    image: None,
                },
                Node {
                    id: "b".into(),
                    label: "Process".into(),
                    kind: NodeKind::Card,
                    parent: None,
                    fill: None,
                    priority: 1,
                    description: None,
                    metadata: None,
                    image: None,
                },
                Node {
                    id: "c".into(),
                    label: "Output".into(),
                    kind: NodeKind::Card,
                    parent: None,
                    fill: None,
                    priority: 1,
                    description: None,
                    metadata: None,
                    image: None,
                },
            ],
            edges: vec![
                Edge {
                    from: "a".into(),
                    to: "b".into(),
                    label: Some("feed".into()),
                    style: EdgeStyle::default(),
                },
                Edge {
                    from: "b".into(),
                    to: "c".into(),
                    label: Some("emit".into()),
                    style: EdgeStyle::default(),
                },
            ],
            theme: Theme::default(),
            title: Some("Test".into()),
        }
    }

    #[test]
    fn builds_graph_and_produces_positions() {
        let d = test_diagram();
        let layout = layout_graph(&d);
        assert_eq!(layout.nodes.len(), 3);
        assert_eq!(layout.edges.len(), 2);

        // All nodes should have positions
        for node in &layout.nodes {
            assert!(node.x.is_finite(), "node {} has non-finite x", node.id);
            assert!(node.y.is_finite(), "node {} has non-finite y", node.id);
        }
    }

    #[test]
    fn positions_map_back_to_schema_ids() {
        let d = test_diagram();
        let layout = layout_graph(&d);
        let ids: Vec<&str> = layout.nodes.iter().map(|n| n.id.as_str()).collect();
        assert!(ids.contains(&"a"));
        assert!(ids.contains(&"b"));
        assert!(ids.contains(&"c"));
    }

    #[test]
    fn handles_no_edges() {
        let mut d = test_diagram();
        d.edges.clear();
        let layout = layout_graph(&d);
        assert_eq!(layout.nodes.len(), 3);
        // Linear fallback: x should increase
        assert!(layout.nodes[1].x > layout.nodes[0].x);
    }
}

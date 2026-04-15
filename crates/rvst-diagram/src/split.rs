//! Split a Diagram into multiple frames when it's too complex for one image.
//! Strategy: one frame per top-level group, plus an overview frame.

use crate::schema::{Diagram, Edge, Node, NodeKind};

/// A frame is a self-contained Diagram that can be rendered independently.
#[derive(Debug, Clone)]
pub struct Frame {
    pub index: usize,
    pub total: usize,
    pub title: String,
    pub diagram: Diagram,
    /// Titles of all frames (for inter-slide context: "1/3: Overview | 2/3: Canopy | 3/3: Agents")
    pub siblings: Vec<String>,
    /// IDs of edges that cross out of this frame (connect to nodes in other frames)
    pub outgoing_cross_edges: Vec<String>,
    /// IDs of edges that cross into this frame (from nodes in other frames)
    pub incoming_cross_edges: Vec<String>,
}

/// Split a diagram into carousel frames.
/// Strategy: overview + one per top-level group.
pub fn split_into_frames(diagram: &Diagram) -> Vec<Frame> {
    let top_groups: Vec<&Node> = diagram
        .nodes
        .iter()
        .filter(|n| n.kind == NodeKind::Group && n.parent.is_none())
        .collect();

    // If no groups or only one group, split by halving the node list
    if top_groups.len() <= 1 {
        return split_by_halves(diagram);
    }

    let mut frames = Vec::new();
    let total = top_groups.len() + 1; // overview + one per group

    // Frame 0: Overview — top-level groups as cards (no children details)
    {
        let overview_nodes: Vec<Node> = top_groups
            .iter()
            .map(|g| {
                Node {
                    id: g.id.clone(),
                    label: g.label.clone(),
                    kind: NodeKind::Card, // render groups as cards in overview
                    parent: None,
                    fill: g.fill.clone(),
                    priority: g.priority,
                    description: None,
                    metadata: None,
                    image: None,
                }
            })
            .collect();

        // Inter-group edges
        let group_ids: std::collections::HashSet<&str> =
            top_groups.iter().map(|g| g.id.as_str()).collect();
        let overview_edges: Vec<Edge> = diagram
            .edges
            .iter()
            .filter(|e| {
                let from_group = find_top_group(&diagram.nodes, &e.from, &group_ids);
                let to_group = find_top_group(&diagram.nodes, &e.to, &group_ids);
                from_group != to_group && from_group.is_some() && to_group.is_some()
            })
            .map(|e| {
                let from_group = find_top_group(&diagram.nodes, &e.from, &group_ids).unwrap();
                let to_group = find_top_group(&diagram.nodes, &e.to, &group_ids).unwrap();
                Edge {
                    from: from_group.to_string(),
                    to: to_group.to_string(),
                    label: e.label.clone(),
                    style: e.style.clone(),
                }
            })
            .collect();

        // Deduplicate edges
        let mut seen = std::collections::HashSet::new();
        let dedup_edges: Vec<Edge> = overview_edges
            .into_iter()
            .filter(|e| seen.insert(format!("{}→{}", e.from, e.to)))
            .collect();

        frames.push(Frame {
            index: 0,
            total,
            title: diagram.title.clone().unwrap_or_else(|| "Overview".into()),
            siblings: vec![], // populated later
            outgoing_cross_edges: vec![],
            incoming_cross_edges: vec![],
            diagram: Diagram {
                canvas: diagram.canvas.clone(),
                nodes: overview_nodes,
                edges: dedup_edges,
                theme: diagram.theme.clone(),
                title: Some("Overview".into()),
            },
        });
    }

    // One frame per top-level group
    for (i, group) in top_groups.iter().enumerate() {
        let prefix = format!("{}.", group.id);
        let group_nodes: Vec<Node> = diagram
            .nodes
            .iter()
            .filter(|n| {
                n.id == group.id
                    || n.parent.as_deref() == Some(&group.id)
                    || n.id.starts_with(&prefix)
            })
            .cloned()
            .collect();

        let group_node_ids: std::collections::HashSet<&str> =
            group_nodes.iter().map(|n| n.id.as_str()).collect();

        let group_edges: Vec<Edge> = diagram
            .edges
            .iter()
            .filter(|e| {
                group_node_ids.contains(e.from.as_str()) && group_node_ids.contains(e.to.as_str())
            })
            .cloned()
            .collect();

        frames.push(Frame {
            index: i + 1,
            total,
            title: group.label.clone(),
            siblings: vec![], // populated later
            outgoing_cross_edges: vec![],
            incoming_cross_edges: vec![],
            diagram: Diagram {
                canvas: diagram.canvas.clone(),
                nodes: group_nodes,
                edges: group_edges,
                theme: diagram.theme.clone(),
                title: Some(group.label.clone()),
            },
        });
    }

    // Update total and sibling titles in all frames
    let total = frames.len();
    let titles: Vec<String> = frames.iter().map(|f| f.title.clone()).collect();
    for f in &mut frames {
        f.total = total;
        f.siblings = titles.clone();

        // Compute cross-edges: edges in original diagram that connect nodes
        // inside this frame to nodes outside this frame
        let frame_node_ids: std::collections::HashSet<&str> =
            f.diagram.nodes.iter().map(|n| n.id.as_str()).collect();

        f.outgoing_cross_edges = diagram
            .edges
            .iter()
            .filter(|e| {
                frame_node_ids.contains(e.from.as_str()) && !frame_node_ids.contains(e.to.as_str())
            })
            .map(|e| format!("{}→{}", e.from, e.to))
            .collect();

        f.incoming_cross_edges = diagram
            .edges
            .iter()
            .filter(|e| {
                !frame_node_ids.contains(e.from.as_str()) && frame_node_ids.contains(e.to.as_str())
            })
            .map(|e| format!("{}→{}", e.from, e.to))
            .collect();
    }

    frames
}

/// Fallback: split node list in half when there are no groups.
fn split_by_halves(diagram: &Diagram) -> Vec<Frame> {
    let leaves: Vec<&Node> = diagram
        .nodes
        .iter()
        .filter(|n| n.kind != NodeKind::Group)
        .collect();

    let mid = leaves.len() / 2;
    let (first_half, second_half) = leaves.split_at(mid.max(1));

    let make_diagram = |nodes: &[&Node], title: &str| -> Diagram {
        let node_ids: std::collections::HashSet<&str> =
            nodes.iter().map(|n| n.id.as_str()).collect();
        Diagram {
            canvas: diagram.canvas.clone(),
            nodes: nodes.iter().map(|n| (*n).clone()).collect(),
            edges: diagram
                .edges
                .iter()
                .filter(|e| node_ids.contains(e.from.as_str()) && node_ids.contains(e.to.as_str()))
                .cloned()
                .collect(),
            theme: diagram.theme.clone(),
            title: Some(title.into()),
        }
    };

    let titles = vec!["Part 1".to_string(), "Part 2".to_string()];
    vec![
        Frame {
            index: 0,
            total: 2,
            title: "Part 1".into(),
            diagram: make_diagram(first_half, "Part 1"),
            siblings: titles.clone(),
            outgoing_cross_edges: vec![],
            incoming_cross_edges: vec![],
        },
        Frame {
            index: 1,
            total: 2,
            title: "Part 2".into(),
            diagram: make_diagram(second_half, "Part 2"),
            siblings: titles,
            outgoing_cross_edges: vec![],
            incoming_cross_edges: vec![],
        },
    ]
}

/// Find which top-level group a node belongs to.
fn find_top_group<'a>(
    nodes: &'a [Node],
    node_id: &'a str,
    group_ids: &std::collections::HashSet<&str>,
) -> Option<&'a str> {
    // Direct match
    if group_ids.contains(node_id) {
        return Some(node_id);
    }
    // Check parent chain
    let node = nodes.iter().find(|n| n.id == node_id)?;
    if let Some(parent) = &node.parent {
        if group_ids.contains(parent.as_str()) {
            return Some(parent.as_str());
        }
        // Recurse one level
        return find_top_group(nodes, parent, group_ids);
    }
    None
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::schema::*;

    #[test]
    fn splits_by_groups() {
        let d = Diagram {
            canvas: Canvas {
                width: 1200,
                height: 630,
                padding: 40,
            },
            nodes: vec![
                Node {
                    id: "g1".into(),
                    label: "Group 1".into(),
                    kind: NodeKind::Group,
                    parent: None,
                    fill: None,
                    priority: 1,
                    description: None,
                    metadata: None,
                    image: None,
                },
                Node {
                    id: "a".into(),
                    label: "A".into(),
                    kind: NodeKind::Card,
                    parent: Some("g1".into()),
                    fill: None,
                    priority: 1,
                    description: None,
                    metadata: None,
                    image: None,
                },
                Node {
                    id: "g2".into(),
                    label: "Group 2".into(),
                    kind: NodeKind::Group,
                    parent: None,
                    fill: None,
                    priority: 1,
                    description: None,
                    metadata: None,
                    image: None,
                },
                Node {
                    id: "b".into(),
                    label: "B".into(),
                    kind: NodeKind::Card,
                    parent: Some("g2".into()),
                    fill: None,
                    priority: 1,
                    description: None,
                    metadata: None,
                    image: None,
                },
            ],
            edges: vec![Edge {
                from: "a".into(),
                to: "b".into(),
                label: None,
                style: EdgeStyle::default(),
            }],
            theme: Theme::default(),
            title: Some("Test".into()),
        };

        let frames = split_into_frames(&d);
        assert_eq!(frames.len(), 3); // overview + 2 groups
        assert_eq!(frames[0].title, "Test"); // uses diagram.title
        assert_eq!(frames[1].title, "Group 1");
        assert_eq!(frames[2].title, "Group 2");
    }

    #[test]
    fn splits_by_halves_when_no_groups() {
        let d = Diagram {
            canvas: Canvas {
                width: 1200,
                height: 630,
                padding: 40,
            },
            nodes: vec![
                Node {
                    id: "a".into(),
                    label: "A".into(),
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
                    label: "B".into(),
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
                    label: "C".into(),
                    kind: NodeKind::Card,
                    parent: None,
                    fill: None,
                    priority: 1,
                    description: None,
                    metadata: None,
                    image: None,
                },
                Node {
                    id: "d".into(),
                    label: "D".into(),
                    kind: NodeKind::Card,
                    parent: None,
                    fill: None,
                    priority: 1,
                    description: None,
                    metadata: None,
                    image: None,
                },
            ],
            edges: vec![],
            theme: Theme::default(),
            title: None,
        };

        let frames = split_into_frames(&d);
        assert_eq!(frames.len(), 2);
    }
}

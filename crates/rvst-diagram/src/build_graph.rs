//! Build an RVST tree from a Diagram schema using graph-computed positions.
//! Sugiyama positions determine the visual order of cards.

use crate::graph::{layout_graph, PositionedNode};
use crate::schema::{Diagram, NodeKind};
use rvst_core::node::{NodeId, NodeType};
use rvst_core::ops::Op;
use std::collections::HashMap;

pub struct BuiltGraphTree {
    pub tree: rvst_tree::Tree,
    pub id_map: HashMap<String, NodeId>,
    pub root_id: NodeId,
}

/// Build an RVST tree using graph-computed positions for node ordering.
/// Sugiyama positions determine row/column placement in CSS grid.
/// Build with default direction (column = horizontal rows of cards).
pub fn build_tree_with_graph(diagram: &Diagram) -> BuiltGraphTree {
    build_tree_with_graph_direction(diagram, false)
}

/// Build with explicit direction control.
/// `vertical`: if true, root flows right (columns of cards instead of rows).
pub fn build_tree_with_graph_direction(diagram: &Diagram, vertical: bool) -> BuiltGraphTree {
    let graph_layout = layout_graph(diagram);

    let mut tree = rvst_tree::Tree::new();
    let mut next_id: u32 = 100;
    let mut id_map: HashMap<String, NodeId> = HashMap::new();

    // Root container — centers content, leaves room for arrows between rows
    let root_id = NodeId(1);
    tree.apply(Op::CreateNode {
        id: root_id,
        node_type: NodeType::View,
    });
    tree.apply(Op::SetStyle {
        id: root_id,
        key: "display".into(),
        value: "flex".into(),
    });
    let root_dir = if vertical { "row" } else { "column" };
    tree.apply(Op::SetStyle {
        id: root_id,
        key: "flex-direction".into(),
        value: root_dir.into(),
    });
    // Larger gap between rows = arrow routing channels
    // Gap between rows must be large enough for orthogonal routing (diagramma needs ~32px clearance)
    tree.apply(Op::SetStyle {
        id: root_id,
        key: "gap".into(),
        value: format!("{}px", (diagram.theme.gap * 4).max(48)),
    });
    tree.apply(Op::SetStyle {
        id: root_id,
        key: "padding".into(),
        value: format!("{}px", diagram.canvas.padding),
    });
    // NO width/height: 100% — root shrink-wraps content. Scale-to-fill zooms to canvas.
    tree.apply(Op::SetStyle {
        id: root_id,
        key: "align-items".into(),
        value: "center".into(),
    });
    tree.apply(Op::SetStyle {
        id: root_id,
        key: "background-color".into(),
        value: "#fafafa".into(),
    });
    tree.apply(Op::Insert {
        parent: NodeId(0),
        child: root_id,
        anchor: None,
    });

    // Group positioned nodes by y-coordinate (sugiyama layer = row)
    let mut layers: HashMap<i64, Vec<&PositionedNode>> = HashMap::new();
    for node in &graph_layout.nodes {
        let layer = node.y as i64;
        layers.entry(layer).or_default().push(node);
    }

    // Sort layers by y, then nodes within each layer by x
    let mut sorted_layers: Vec<(i64, Vec<&PositionedNode>)> = layers.into_iter().collect();
    sorted_layers.sort_by_key(|(y, _)| *y);
    for (_, nodes) in &mut sorted_layers {
        nodes.sort_by(|a, b| a.x.partial_cmp(&b.x).unwrap_or(std::cmp::Ordering::Equal));
    }

    // Merge adjacent layers where all nodes share the same parent.
    // This handles fan-in patterns: Intent, Space, Inertia all → MoE
    // should be ONE row, not three separate rows.
    let mut merged: Vec<Vec<&PositionedNode>> = Vec::new();
    for (_, nodes) in sorted_layers {
        let this_parent: Option<&str> = if nodes.iter().all(|n| n.parent == nodes[0].parent) {
            nodes[0].parent.as_deref()
        } else {
            None // mixed parents — don't merge
        };

        let should_merge = if let (Some(last), Some(tp)) = (merged.last(), this_parent) {
            // Merge if previous layer also has same parent
            last.iter().all(|n| n.parent.as_deref() == Some(tp))
        } else {
            false
        };

        if should_merge {
            merged.last_mut().unwrap().extend(nodes);
        } else {
            merged.push(nodes);
        }
    }

    // Re-sort merged layers by x
    for row in &mut merged {
        row.sort_by(|a, b| a.x.partial_cmp(&b.x).unwrap_or(std::cmp::Ordering::Equal));
    }

    // Detect single-row layouts that waste vertical space.
    // If all content is in one row and canvas has lots of unused height,
    // split into 2+ rows to use the vertical space.
    let canvas_ar = diagram.canvas.width as f32 / diagram.canvas.height as f32;
    let total_leaf_nodes: usize = merged.iter().map(|r| r.len()).sum();

    let has_edges = !diagram.edges.is_empty();
    if !has_edges && merged.len() == 1 && total_leaf_nodes >= 3 && canvas_ar < 2.0 {
        // Edgeless single row with 3+ nodes in a non-ultra-wide canvas.
        // Split into multiple rows to use vertical space: ceil(sqrt(n)) per row.
        let cols = (total_leaf_nodes as f32).sqrt().ceil() as usize;
        let flat_nodes: Vec<&PositionedNode> = merged.into_iter().flatten().collect();
        let mut new_merged: Vec<Vec<&PositionedNode>> = Vec::new();
        for chunk in flat_nodes.chunks(cols) {
            new_merged.push(chunk.to_vec());
        }
        merged = new_merged;
    } else if has_edges && merged.len() == 1 && total_leaf_nodes <= 4 {
        // Graph with edges but only one row (simple chain like a→b→c).
        // Don't restructure — the flow direction IS the topology.
        // Scale-to-fill will handle the vertical centering.
    }

    let sorted_layers: Vec<(i64, Vec<&PositionedNode>)> = merged
        .into_iter()
        .enumerate()
        .map(|(i, nodes)| (i as i64, nodes))
        .collect();

    // Also handle groups — groups that contain graph-positioned children
    let groups: Vec<_> = diagram
        .nodes
        .iter()
        .filter(|n| n.kind == NodeKind::Group)
        .collect();

    // Create groups first
    for node in &groups {
        next_id += 1;
        let nid = NodeId(next_id);
        id_map.insert(node.id.clone(), nid);

        tree.apply(Op::CreateNode {
            id: nid,
            node_type: NodeType::View,
        });
        tree.apply(Op::SetStyle {
            id: nid,
            key: "display".into(),
            value: "flex".into(),
        });
        tree.apply(Op::SetStyle {
            id: nid,
            key: "flex-direction".into(),
            value: "column".into(),
        });
        tree.apply(Op::SetStyle {
            id: nid,
            key: "gap".into(),
            value: format!("{}px", diagram.theme.gap),
        });
        tree.apply(Op::SetStyle {
            id: nid,
            key: "padding".into(),
            value: "16px".into(),
        });
        tree.apply(Op::SetStyle {
            id: nid,
            key: "border".into(),
            value: "1px solid #c4b99a".into(),
        });
        tree.apply(Op::SetStyle {
            id: nid,
            key: "background-color".into(),
            value: "#f5f0e8".into(),
        });
        // Groups don't stretch — they wrap their content

        // Group label
        next_id += 1;
        let label_id = NodeId(next_id);
        tree.apply(Op::CreateNode {
            id: label_id,
            node_type: NodeType::Text,
        });
        tree.apply(Op::SetText {
            id: label_id,
            value: node.label.clone(),
        });
        tree.apply(Op::SetStyle {
            id: label_id,
            key: "font-size".into(),
            value: "14px".into(),
        });
        tree.apply(Op::SetStyle {
            id: label_id,
            key: "color".into(),
            value: "#888".into(),
        });
        tree.apply(Op::Insert {
            parent: nid,
            child: label_id,
            anchor: None,
        });

        let parent_nid = node
            .parent
            .as_ref()
            .and_then(|p| id_map.get(p).copied())
            .unwrap_or(root_id);
        tree.apply(Op::Insert {
            parent: parent_nid,
            child: nid,
            anchor: None,
        });
    }

    // Create row containers per sugiyama layer, split by parent group.
    // Cards go inside their actual parent group, not a shared row.
    let color_cycle = &diagram.theme.colors;
    let mut card_idx = 0usize;

    for (_layer_y, layer_nodes) in &sorted_layers {
        // Split this layer's nodes by parent
        let mut by_parent: HashMap<Option<String>, Vec<&&PositionedNode>> = HashMap::new();
        for pnode in layer_nodes {
            by_parent
                .entry(pnode.parent.clone())
                .or_default()
                .push(pnode);
        }

        // Create one row per parent group in this layer
        for (parent_key, nodes) in &by_parent {
            next_id += 1;
            let row_id = NodeId(next_id);
            tree.apply(Op::CreateNode {
                id: row_id,
                node_type: NodeType::View,
            });
            tree.apply(Op::SetStyle {
                id: row_id,
                key: "display".into(),
                value: "flex".into(),
            });
            let row_dir = if vertical { "column" } else { "row" };
            tree.apply(Op::SetStyle {
                id: row_id,
                key: "flex-direction".into(),
                value: row_dir.into(),
            });
            // Space between cards for arrow routing
            tree.apply(Op::SetStyle {
                id: row_id,
                key: "gap".into(),
                value: format!("{}px", (diagram.theme.gap * 3).max(36)),
            });
            tree.apply(Op::SetStyle {
                id: row_id,
                key: "flex-wrap".into(),
                value: "wrap".into(),
            });
            tree.apply(Op::SetStyle {
                id: row_id,
                key: "justify-content".into(),
                value: "center".into(),
            });

            // Insert row into the parent group (or root if no parent)
            let insert_parent = parent_key
                .as_ref()
                .and_then(|p| id_map.get(p).copied())
                .unwrap_or(root_id);
            tree.apply(Op::Insert {
                parent: insert_parent,
                child: row_id,
                anchor: None,
            });

            // Add cards
            for pnode in nodes {
                next_id += 1;
                let card_id = NodeId(next_id);
                id_map.insert(pnode.id.clone(), card_id);

                let fill = pnode
                    .fill
                    .as_deref()
                    .unwrap_or(&color_cycle[card_idx % color_cycle.len()]);

                // Look up full node for rich content + adaptive sizing
                let full_node = diagram.nodes.iter().find(|n| n.id == pnode.id);
                let has_desc = !full_node
                    .and_then(|n| n.description.as_deref())
                    .unwrap_or("")
                    .is_empty();

                tree.apply(Op::CreateNode {
                    id: card_id,
                    node_type: NodeType::View,
                });
                tree.apply(Op::SetStyle {
                    id: card_id,
                    key: "display".into(),
                    value: "flex".into(),
                });
                tree.apply(Op::SetStyle {
                    id: card_id,
                    key: "flex-direction".into(),
                    value: "column".into(),
                });
                tree.apply(Op::SetStyle {
                    id: card_id,
                    key: "gap".into(),
                    value: "4px".into(),
                });
                tree.apply(Op::SetStyle {
                    id: card_id,
                    key: "padding".into(),
                    value: "14px 20px".into(),
                });
                tree.apply(Op::SetStyle {
                    id: card_id,
                    key: "border-radius".into(),
                    value: "6px".into(),
                });
                tree.apply(Op::SetStyle {
                    id: card_id,
                    key: "background-color".into(),
                    value: fill.to_string(),
                });
                // Adaptive sizing
                // has_desc already computed above
                let has_meta = full_node
                    .and_then(|n| n.metadata.as_ref())
                    .map(|m| m.len())
                    .unwrap_or(0)
                    > 0;
                let has_image = !full_node
                    .and_then(|n| n.image.as_deref())
                    .unwrap_or("")
                    .is_empty();
                let content_richness = 1 + has_desc as u32 + has_meta as u32 + has_image as u32;
                let min_w = 100 + content_richness * 40; // wider for richer cards
                let min_h = 40 + content_richness * 20; // taller for richer cards
                tree.apply(Op::SetStyle {
                    id: card_id,
                    key: "min-width".into(),
                    value: format!("{min_w}px"),
                });
                tree.apply(Op::SetStyle {
                    id: card_id,
                    key: "min-height".into(),
                    value: format!("{min_h}px"),
                });

                // Card title (always present)
                next_id += 1;
                let label_id = NodeId(next_id);
                tree.apply(Op::CreateNode {
                    id: label_id,
                    node_type: NodeType::Text,
                });
                tree.apply(Op::SetText {
                    id: label_id,
                    value: pnode.label.clone(),
                });
                tree.apply(Op::SetStyle {
                    id: label_id,
                    key: "font-size".into(),
                    value: "18px".into(),
                });
                tree.apply(Op::SetStyle {
                    id: label_id,
                    key: "color".into(),
                    value: "#1a1a1a".into(),
                });
                tree.apply(Op::SetStyle {
                    id: label_id,
                    key: "font-weight".into(),
                    value: "700".into(),
                });
                if !diagram.theme.font.is_empty() {
                    tree.apply(Op::SetStyle {
                        id: label_id,
                        key: "font-family".into(),
                        value: diagram.theme.font.clone(),
                    });
                }
                tree.apply(Op::Insert {
                    parent: card_id,
                    child: label_id,
                    anchor: None,
                });

                // Description (optional — smaller body text below title)
                if let Some(desc) = full_node.and_then(|n| n.description.as_deref()) {
                    if !desc.is_empty() {
                        next_id += 1;
                        let desc_id = NodeId(next_id);
                        tree.apply(Op::CreateNode {
                            id: desc_id,
                            node_type: NodeType::Text,
                        });
                        tree.apply(Op::SetText {
                            id: desc_id,
                            value: desc.to_string(),
                        });
                        tree.apply(Op::SetStyle {
                            id: desc_id,
                            key: "font-size".into(),
                            value: "13px".into(),
                        });
                        tree.apply(Op::SetStyle {
                            id: desc_id,
                            key: "color".into(),
                            value: "#1a1a1a".into(),
                        });
                        tree.apply(Op::SetStyle {
                            id: desc_id,
                            key: "margin-top".into(),
                            value: "4px".into(),
                        });
                        tree.apply(Op::Insert {
                            parent: card_id,
                            child: desc_id,
                            anchor: None,
                        });
                    }
                }

                // Metadata (optional — key:value pairs as muted small text)
                if let Some(meta) = full_node.and_then(|n| n.metadata.as_ref()) {
                    for (key, val) in meta {
                        next_id += 1;
                        let meta_id = NodeId(next_id);
                        tree.apply(Op::CreateNode {
                            id: meta_id,
                            node_type: NodeType::Text,
                        });
                        tree.apply(Op::SetText {
                            id: meta_id,
                            value: format!("{key}: {val}"),
                        });
                        tree.apply(Op::SetStyle {
                            id: meta_id,
                            key: "font-size".into(),
                            value: "11px".into(),
                        });
                        tree.apply(Op::SetStyle {
                            id: meta_id,
                            key: "color".into(),
                            value: "#333".into(),
                        });
                        tree.apply(Op::SetStyle {
                            id: meta_id,
                            key: "margin-top".into(),
                            value: "2px".into(),
                        });
                        tree.apply(Op::Insert {
                            parent: card_id,
                            child: meta_id,
                            anchor: None,
                        });
                    }
                }

                // Image placeholder (colored rect with dimensions hint)
                if let Some(img) = full_node.and_then(|n| n.image.as_deref()) {
                    if !img.is_empty() {
                        next_id += 1;
                        let img_id = NodeId(next_id);
                        tree.apply(Op::CreateNode {
                            id: img_id,
                            node_type: NodeType::View,
                        });
                        tree.apply(Op::SetStyle {
                            id: img_id,
                            key: "width".into(),
                            value: "100%".into(),
                        });
                        tree.apply(Op::SetStyle {
                            id: img_id,
                            key: "height".into(),
                            value: "60px".into(),
                        });
                        tree.apply(Op::SetStyle {
                            id: img_id,
                            key: "background-color".into(),
                            value: "#e0e0e0".into(),
                        });
                        tree.apply(Op::SetStyle {
                            id: img_id,
                            key: "border-radius".into(),
                            value: "4px".into(),
                        });
                        tree.apply(Op::SetStyle {
                            id: img_id,
                            key: "margin-top".into(),
                            value: "6px".into(),
                        });
                        tree.apply(Op::Insert {
                            parent: card_id,
                            child: img_id,
                            anchor: None,
                        });

                        // Image label
                        next_id += 1;
                        let img_label = NodeId(next_id);
                        tree.apply(Op::CreateNode {
                            id: img_label,
                            node_type: NodeType::Text,
                        });
                        tree.apply(Op::SetText {
                            id: img_label,
                            value: format!("[{}]", img),
                        });
                        tree.apply(Op::SetStyle {
                            id: img_label,
                            key: "font-size".into(),
                            value: "9px".into(),
                        });
                        tree.apply(Op::SetStyle {
                            id: img_label,
                            key: "color".into(),
                            value: "#999".into(),
                        });
                        tree.apply(Op::Insert {
                            parent: img_id,
                            child: img_label,
                            anchor: None,
                        });
                    }
                }

                tree.apply(Op::Insert {
                    parent: row_id,
                    child: card_id,
                    anchor: None,
                });
                card_idx += 1;
            }
        }
    }

    BuiltGraphTree {
        tree,
        id_map,
        root_id,
    }
}

//! Pure tree-inspection utilities that depend only on rvst_tree / rvst_core.
//! HeadlessSession-dependent types (RvstInspector, VisualQuery, QueryResult)
//! remain in rvst-shell.

use rvst_core::{NodeId, NodeType};

/// DFS text-content collector. Text nodes return their data; elements concatenate children.
pub fn node_text_content(tree: &rvst_tree::Tree, id: NodeId) -> String {
    let Some(node) = tree.nodes.get(&id) else {
        return String::new();
    };
    if matches!(node.node_type, NodeType::Text) {
        return node.text.clone().unwrap_or_default();
    }
    node.children
        .iter()
        .map(|&cid| node_text_content(tree, cid))
        .collect::<Vec<_>>()
        .join("")
}

/// Post-order (children-first) DFS text search with two-tier priority.
///
/// Tier 1: exact match — node whose text content equals `needle` exactly.
/// Tier 2: substring match — node whose text content contains `needle`.
///
/// Exact matches take priority over substring matches regardless of tree depth.
/// Within each tier, the deepest (most specific) match wins.
pub fn find_node_by_text(
    tree: &rvst_tree::Tree,
    roots: &[NodeId],
    needle: &str,
) -> Option<NodeId> {
    // Pass 1: exact match (post-order DFS)
    if let Some(id) = find_node_by_text_exact(tree, roots, needle) {
        return Some(id);
    }
    // Pass 2: substring match (post-order DFS)
    find_node_by_text_substr(tree, roots, needle)
}

fn find_node_by_text_exact(
    tree: &rvst_tree::Tree,
    roots: &[NodeId],
    needle: &str,
) -> Option<NodeId> {
    for &id in roots {
        let Some(node) = tree.nodes.get(&id) else {
            continue;
        };
        if let Some(found) = find_node_by_text_exact(tree, &node.children, needle) {
            return Some(found);
        }
        if node_text_content(tree, id) == needle {
            return Some(id);
        }
    }
    None
}

fn find_node_by_text_substr(
    tree: &rvst_tree::Tree,
    roots: &[NodeId],
    needle: &str,
) -> Option<NodeId> {
    for &id in roots {
        let Some(node) = tree.nodes.get(&id) else {
            continue;
        };
        if let Some(found) = find_node_by_text_substr(tree, &node.children, needle) {
            return Some(found);
        }
        if node_text_content(tree, id).contains(needle) {
            return Some(id);
        }
    }
    None
}

/// Check whether a single node is visible based on its own styles (display, visibility, opacity).
pub fn is_node_self_visible(node: &rvst_tree::Node) -> bool {
    if node.styles.get("display").map(|s| s.as_str()) == Some("none") {
        return false;
    }
    if node.styles.get("visibility").map(|s| s.as_str()) == Some("hidden") {
        return false;
    }
    let opacity = node
        .styles
        .get("opacity")
        .and_then(|v| v.trim().parse::<f32>().ok())
        .unwrap_or(1.0);
    opacity > 0.0
}

/// Check whether a node is visible considering its own styles, layout rect,
/// and all ancestors' visibility.
pub fn is_node_visible(tree: &rvst_tree::Tree, id: NodeId) -> (bool, String) {
    let Some(node) = tree.nodes.get(&id) else {
        return (false, "node not found in tree".into());
    };
    let Some(rect) = node.layout else {
        return (false, "node has no layout rect (layout not run?)".into());
    };
    if rect.w <= 0.0 || rect.h <= 0.0 {
        return (false, format!("rect is {}x{} (zero size)", rect.w, rect.h));
    }
    if !is_node_self_visible(node) {
        return (
            false,
            "node has display:none, visibility:hidden, or opacity:0".into(),
        );
    }
    // Walk ancestors
    let mut cur = node.parent;
    while let Some(pid) = cur {
        let Some(p) = tree.nodes.get(&pid) else { break };
        if !is_node_self_visible(p) {
            return (false, format!("ancestor {:?} is not visible", pid));
        }
        cur = p.parent;
    }
    (
        true,
        format!("visible at ({},{}) {}x{}", rect.x, rect.y, rect.w, rect.h),
    )
}

#[cfg(test)]
mod tests {
    use super::*;

    use std::collections::HashMap;

    fn make_node(id: NodeId, node_type: NodeType) -> rvst_tree::Node {
        rvst_tree::Node {
            id,
            node_type,
            text: None,
            children: Vec::new(),
            parent: None,
            layout: None,
            styles: HashMap::new(),
            scroll_y: 0.0,
            virtual_content_height: None,
            caret: None,
            dirty: false,
        }
    }

    fn make_text_tree() -> (rvst_tree::Tree, NodeId, NodeId) {
        let mut tree = rvst_tree::Tree::default();
        let div_id = NodeId(1);
        let text_id = NodeId(2);

        let mut div_node = make_node(div_id, NodeType::View);
        div_node.children.push(text_id);

        let mut text_node = make_node(text_id, NodeType::Text);
        text_node.text = Some("Hello world".to_string());
        text_node.parent = Some(div_id);

        tree.nodes.insert(div_id, div_node);
        tree.nodes.insert(text_id, text_node);
        tree.root_children.push(div_id);

        (tree, div_id, text_id)
    }

    #[test]
    fn text_content_of_text_node() {
        let (tree, _, text_id) = make_text_tree();
        assert_eq!(node_text_content(&tree, text_id), "Hello world");
    }

    #[test]
    fn text_content_of_element_concatenates_children() {
        let (tree, div_id, _) = make_text_tree();
        assert_eq!(node_text_content(&tree, div_id), "Hello world");
    }

    #[test]
    fn find_by_text_exact() {
        let (tree, _, text_id) = make_text_tree();
        let found = find_node_by_text(&tree, &tree.root_children, "Hello world");
        assert_eq!(found, Some(text_id));
    }

    #[test]
    fn find_by_text_substring() {
        let (tree, _, _) = make_text_tree();
        let found = find_node_by_text(&tree, &tree.root_children, "Hello");
        assert!(found.is_some());
    }

    #[test]
    fn find_by_text_missing() {
        let (tree, _, _) = make_text_tree();
        let found = find_node_by_text(&tree, &tree.root_children, "Goodbye");
        assert!(found.is_none());
    }
}

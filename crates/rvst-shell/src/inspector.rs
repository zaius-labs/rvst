use crate::HeadlessSession;
use rvst_core::{NodeId, NodeType};

/// Structured result returned by all VisualQuery checks.
/// Both .ok and .reason are readable by AI agents and Rust test assertions.
#[derive(Debug)]
pub struct QueryResult<T> {
    pub value: T,
    pub ok: bool,
    pub reason: String,
}

impl<T: std::fmt::Debug> QueryResult<T> {
    pub fn pass(value: T) -> Self {
        let reason = format!("{:?}", value);
        Self {
            value,
            ok: true,
            reason,
        }
    }
    pub fn fail(value: T, reason: impl Into<String>) -> Self {
        Self {
            value,
            ok: false,
            reason: reason.into(),
        }
    }
}

/// Entry point — borrow a HeadlessSession, issue queries.
pub struct RvstInspector<'a> {
    pub(crate) session: &'a HeadlessSession,
}

/// Chainable query targeting a specific node (or not-found).
pub struct VisualQuery<'a> {
    pub(crate) session: &'a HeadlessSession,
    pub(crate) node_id: Option<NodeId>,
    pub(crate) selector: String,
}

/// DFS text-content collector. Text nodes return their data; elements concatenate children.
pub(crate) fn node_text_content(tree: &rvst_tree::Tree, id: NodeId) -> String {
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
/// This prevents `find("Tick")` from hitting "Ticks: 0" when a button with
/// exactly "Tick" exists elsewhere in the tree.
pub(crate) fn find_node_by_text(
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

fn is_node_self_visible(node: &rvst_tree::Node) -> bool {
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

fn is_node_visible(tree: &rvst_tree::Tree, id: NodeId) -> (bool, String) {
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

impl<'a> RvstInspector<'a> {
    /// Find first node whose text content contains needle (substring, case-sensitive).
    pub fn find(&self, text: &str) -> VisualQuery<'a> {
        let roots = &self.session.tree.root_children;
        let node_id = find_node_by_text(&self.session.tree, roots, text);
        VisualQuery {
            session: self.session,
            node_id,
            selector: format!("find({:?})", text),
        }
    }

    /// Find first node where styles[key] == value.
    pub fn find_by_attr(&self, key: &str, value: &str) -> VisualQuery<'a> {
        let node_id = self
            .session
            .tree
            .nodes
            .values()
            .find(|n| n.styles.get(key).map(|v| v == value).unwrap_or(false))
            .map(|n| n.id);
        VisualQuery {
            session: self.session,
            node_id,
            selector: format!("find_by_attr({:?}={:?})", key, value),
        }
    }

    /// Find first node of the given NodeType.
    pub fn find_by_type(&self, node_type: NodeType) -> VisualQuery<'a> {
        let node_id = self
            .session
            .tree
            .nodes
            .values()
            .find(|n| n.node_type == node_type)
            .map(|n| n.id);
        VisualQuery {
            session: self.session,
            node_id,
            selector: format!("find_by_type({:?})", node_type),
        }
    }

    /// Find node whose layout rect contains (x, y).
    pub fn at(&self, x: f32, y: f32) -> VisualQuery<'a> {
        let node_id = self
            .session
            .tree
            .nodes
            .values()
            .find(|n| {
                if let Some(r) = n.layout {
                    x >= r.x && x < r.x + r.w && y >= r.y && y < r.y + r.h
                } else {
                    false
                }
            })
            .map(|n| n.id);
        VisualQuery {
            session: self.session,
            node_id,
            selector: format!("at({}, {})", x, y),
        }
    }
}

impl<'a> VisualQuery<'a> {
    fn not_found(&self) -> String {
        format!("selector '{}' matched no node", self.selector)
    }

    pub fn is_visible(&self) -> QueryResult<bool> {
        let Some(id) = self.node_id else {
            return QueryResult::fail(false, self.not_found());
        };
        let (vis, reason) = is_node_visible(&self.session.tree, id);
        if vis {
            QueryResult::pass(true)
        } else {
            QueryResult::fail(false, reason)
        }
    }

    pub fn rect(&self) -> QueryResult<Option<rvst_core::Rect>> {
        let Some(id) = self.node_id else {
            return QueryResult::fail(None, self.not_found());
        };
        match self.session.tree.nodes.get(&id).and_then(|n| n.layout) {
            Some(r) => QueryResult::pass(Some(r)),
            None => QueryResult::fail(None, "node has no layout rect".to_string()),
        }
    }

    pub fn is_hittable(&self) -> QueryResult<bool> {
        let Some(id) = self.node_id else {
            return QueryResult::fail(false, self.not_found());
        };
        let (vis, reason) = is_node_visible(&self.session.tree, id);
        if !vis {
            return QueryResult::fail(false, reason);
        }
        let node = self
            .session
            .tree
            .nodes
            .get(&id)
            .expect("node existence guaranteed by is_node_visible");
        if node.styles.get("pointer-events").map(|s| s.as_str()) == Some("none") {
            return QueryResult::fail(false, "pointer-events:none".to_string());
        }
        QueryResult::pass(true)
    }

    /// Check that this node (or any ancestor) has a registered event handler for the given event name.
    /// Walking up to ancestors handles the text-inside-button case where find() resolves the Text node
    /// but the handler is registered on the parent Button node.
    pub fn has_handler(&self, event: &str) -> QueryResult<bool> {
        let Some(id) = self.node_id else {
            return QueryResult::fail(false, self.not_found());
        };
        // Check the node itself and walk up to find a handler (handles text-inside-button case)
        let mut cur = Some(id);
        while let Some(check_id) = cur {
            let found = self
                .session
                .tree
                .handlers
                .iter()
                .any(|(nid, ev, _)| *nid == check_id && ev == event);
            if found {
                return QueryResult::pass(true);
            }
            cur = self
                .session
                .tree
                .nodes
                .get(&check_id)
                .and_then(|n| n.parent);
        }
        QueryResult::fail(
            false,
            format!(
                "no '{}' handler on node {:?} or its ancestors (selector: '{}')",
                event, id, self.selector
            ),
        )
    }

    /// Check that styles[key] == expected_value (case-sensitive, exact match).
    /// If the selected node is a Text node, the parent element is checked — styles
    /// are set on the element, not its text children.
    pub fn has_style(&self, key: &str, expected: &str) -> QueryResult<bool> {
        let Some(id) = self.node_id else {
            return QueryResult::fail(false, self.not_found());
        };
        let node = self
            .session
            .tree
            .nodes
            .get(&id)
            .expect("node existence guaranteed by selector");
        // Text nodes don't carry styles — walk up to the nearest element parent.
        let check_id = if matches!(node.node_type, NodeType::Text) {
            node.parent.unwrap_or(id)
        } else {
            id
        };
        let check_node = self
            .session
            .tree
            .nodes
            .get(&check_id)
            .expect("parent node existence guaranteed");
        match check_node.styles.get(key) {
            Some(v) if v == expected => QueryResult::pass(true),
            Some(v) => QueryResult::fail(
                false,
                format!("styles['{}'] = {:?}, expected {:?}", key, v, expected),
            ),
            None => QueryResult::fail(
                false,
                format!(
                    "styles['{}'] not set on node {:?} (selector: '{}')",
                    key, check_id, self.selector
                ),
            ),
        }
    }

    /// Check that the node has an attribute/style `key` containing `expected` as a
    /// whitespace-delimited token (handles space-separated class lists).
    /// If the selected node is a Text node, the parent element is checked — text nodes
    /// inherit attributes like `class` from their containing element.
    pub fn has_attr(&self, key: &str, expected: &str) -> QueryResult<bool> {
        let Some(id) = self.node_id else {
            return QueryResult::fail(false, self.not_found());
        };
        let node = self
            .session
            .tree
            .nodes
            .get(&id)
            .expect("node existence guaranteed by selector");
        // Text nodes don't carry class/attrs — walk up to the nearest element parent.
        let check_id = if matches!(node.node_type, NodeType::Text) {
            node.parent.unwrap_or(id)
        } else {
            id
        };
        let check_node = self
            .session
            .tree
            .nodes
            .get(&check_id)
            .expect("parent node existence guaranteed");
        match check_node.styles.get(key) {
            Some(v) if v.split_whitespace().any(|tok: &str| tok == expected) => {
                QueryResult::pass(true)
            }
            Some(v) => QueryResult::fail(
                false,
                format!(
                    "styles['{}'] = {:?}, does not contain token {:?}",
                    key, v, expected
                ),
            ),
            None => QueryResult::fail(
                false,
                format!(
                    "styles['{}'] not set on node {:?} (selector: '{}')",
                    key, check_id, self.selector
                ),
            ),
        }
    }

    /// Return the concatenated text content of this node and all descendants.
    pub fn text_content(&self) -> QueryResult<String> {
        let Some(id) = self.node_id else {
            return QueryResult::fail(String::new(), self.not_found());
        };
        let text = node_text_content(&self.session.tree, id);
        if text.is_empty() {
            QueryResult::fail(
                text,
                format!(
                    "node {:?} has no text content (selector: '{}')",
                    id, self.selector
                ),
            )
        } else {
            QueryResult::pass(text)
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn query_result_pass_is_ok() {
        let r = QueryResult::pass(true);
        assert!(r.ok);
        assert!(r.value);
    }
    #[test]
    fn query_result_fail_is_not_ok() {
        let r: QueryResult<bool> = QueryResult::fail(false, "not found");
        assert!(!r.ok);
        assert_eq!(r.reason, "not found");
    }

    use crate::HeadlessSession;
    const BUNDLE: &str = "function rvst_mount(target) {
    const div = document.createElement('div');
    const t = document.createTextNode('Hello world');
    div.appendChild(t);
    target.appendChild(div);
}";

    #[test]
    fn find_by_text_resolves_node() {
        let s = HeadlessSession::new(BUNDLE, 400, 300);
        let insp = s.inspector();
        let q = insp.find("Hello");
        assert!(
            q.node_id.is_some(),
            "expected to find node with text 'Hello'"
        );
    }

    #[test]
    fn find_missing_text_returns_none_node() {
        let s = HeadlessSession::new(BUNDLE, 400, 300);
        let insp = s.inspector();
        let q = insp.find("Goodbye");
        assert!(q.node_id.is_none());
    }

    const RED_DIV: &str = "function rvst_mount(target) {
    const d = document.createElement('div');
    d.style.backgroundColor = 'red';
    d.style.width = '200px';
    d.style.height = '100px';
    target.appendChild(d);
}";

    const HIDDEN_DIV: &str = "function rvst_mount(target) {
    const d = document.createElement('div');
    d.style.display = 'none';
    d.style.width = '200px';
    d.style.height = '100px';
    target.appendChild(d);
}";

    #[test]
    fn visible_div_is_visible() {
        let s = HeadlessSession::new(RED_DIV, 400, 300);
        let r = s.inspector().find_by_type(NodeType::View).is_visible();
        assert!(r.ok, "expected visible: {}", r.reason);
    }

    #[test]
    fn display_none_div_is_not_visible() {
        let s = HeadlessSession::new(HIDDEN_DIV, 400, 300);
        let r = s.inspector().find_by_type(NodeType::View).is_visible();
        assert!(!r.ok, "expected not visible: {}", r.reason);
    }

    #[test]
    fn missing_selector_is_not_visible() {
        let s = HeadlessSession::new(RED_DIV, 400, 300);
        let r = s.inspector().find("nonexistent").is_visible();
        assert!(!r.ok);
        assert!(r.reason.contains("matched no node"), "reason: {}", r.reason);
    }

    const BTN_BUNDLE: &str = "function rvst_mount(target) {
    const btn = document.createElement('button');
    btn.textContent = 'Click me';
    btn.addEventListener('click', () => {});
    target.appendChild(btn);
}";

    #[test]
    fn button_has_click_handler() {
        let s = HeadlessSession::new(BTN_BUNDLE, 400, 300);
        let r = s.inspector().find("Click me").has_handler("click");
        assert!(r.ok, "expected click handler: {}", r.reason);
    }

    #[test]
    fn button_does_not_have_input_handler() {
        let s = HeadlessSession::new(BTN_BUNDLE, 400, 300);
        let r = s.inspector().find("Click me").has_handler("input");
        assert!(!r.ok);
    }

    #[test]
    fn text_content_returns_button_label() {
        let s = HeadlessSession::new(BTN_BUNDLE, 400, 300);
        let r = s.inspector().find("Click me").text_content();
        assert!(r.ok, "{}", r.reason);
        assert!(r.value.contains("Click me"));
    }
}

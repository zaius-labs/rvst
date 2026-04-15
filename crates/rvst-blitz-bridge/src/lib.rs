use std::collections::HashMap;

use blitz_dom::{Attribute, BaseDocument, DocumentMutator, LocalName, QualName, local_name, ns};
use rvst_core::{NodeDescriptor, NodeId, NodeType, Op};

/// Maps RVST NodeType to an HTML element QualName.
fn node_type_to_qualname(nt: &NodeType) -> QualName {
    let local = match nt {
        NodeType::View => local_name!("div"),
        NodeType::Button => local_name!("button"),
        NodeType::Input => local_name!("input"),
        NodeType::Textarea => local_name!("textarea"),
        NodeType::Scroll => local_name!("div"),
        NodeType::Form => local_name!("form"),
        NodeType::Canvas => local_name!("canvas"),
        NodeType::Img => local_name!("img"),
        NodeType::Text => unreachable!("text nodes use create_text_node"),
    };
    QualName::new(None, ns!(html), local)
}

/// Makes a QualName for an attribute name (no namespace).
fn attr_qualname(name: &str) -> QualName {
    QualName::new(None, ns!(), LocalName::from(name))
}

/// Ops that need to be handled by the windowing layer, not the DOM.
#[derive(Debug, Clone)]
pub enum WindowOp {
    SetDecorations(bool),
    BeginDrag,
    Minimize,
    Maximize(bool),
    Close,
    SetClipboard(String),
    /// Dev-only: outbound HMR WebSocket message. Host forwards to `vite dev`.
    HmrSend(String),
}

/// Bridge between RVST's Op stream and Blitz's DOM engine.
///
/// Maintains the mapping from RVST `NodeId` to Blitz internal node IDs (`usize`),
/// and tracks event listener registrations.
pub struct BlitzBridge {
    /// Maps RVST NodeId -> Blitz node ID (usize).
    id_map: HashMap<NodeId, usize>,
    /// Event listener registrations: (blitz_id, event_name, handler_id).
    listeners: Vec<(usize, String, u32)>,
    /// Deferred insertions: (child_bid, anchor_bid) — children inserted before
    /// their anchor was parented. Will be re-ordered when the anchor gets a parent.
    deferred_inserts: Vec<(usize, usize)>,
    /// Override for the mount root node. If set, Insert ops with unmapped parents
    /// will append to this node instead of the document root. Typically set to
    /// the `<body>` element so Blitz gets a proper `<html><body>` structure.
    mount_root: Option<usize>,
}

impl BlitzBridge {
    pub fn new() -> Self {
        Self {
            id_map: HashMap::new(),
            listeners: Vec::new(),
            deferred_inserts: Vec::new(),
            mount_root: None,
        }
    }

    /// Set the Blitz node ID that should be used as the mount target for
    /// RVST content. This is typically the `<body>` element.
    pub fn set_mount_root(&mut self, blitz_id: usize) {
        self.mount_root = Some(blitz_id);
    }

    /// Apply a batch of RVST ops to a Blitz document.
    /// Returns any window-level ops that need shell handling.
    pub fn apply_ops(&mut self, doc: &mut BaseDocument, ops: Vec<Op>) -> Vec<WindowOp> {
        let mut window_ops = Vec::new();

        // Get the mount target: either the explicitly set mount root (e.g. <body>)
        // or fall back to the document root node.
        let mount_target = self.mount_root.unwrap_or_else(|| doc.root_node().id);

        let mut mutator = DocumentMutator::new(doc);

        for op in ops {
            match op {
                Op::CreateNode { id, node_type } => {
                    let blitz_id = if matches!(node_type, NodeType::Text) {
                        mutator.create_text_node("")
                    } else {
                        mutator.create_element(node_type_to_qualname(&node_type), vec![])
                    };
                    self.id_map.insert(id, blitz_id);
                }

                Op::Insert {
                    parent,
                    child,
                    anchor,
                } => {
                    let child_bid = match self.id_map.get(&child) {
                        Some(&id) => id,
                        None => continue,
                    };
                    match anchor {
                        Some(anchor_id) => {
                            if let Some(&anchor_bid) = self.id_map.get(&anchor_id) {
                                // Check if anchor has a parent — Svelte sometimes inserts
                                // children before an anchor that hasn't been appended yet.
                                if mutator.node_has_parent(anchor_bid) {
                                    mutator.insert_nodes_before(anchor_bid, &[child_bid]);
                                } else {
                                    // Anchor not yet in tree — fall back to append to parent
                                    let parent_bid = self
                                        .id_map
                                        .get(&parent)
                                        .copied()
                                        .unwrap_or(mount_target);
                                    mutator.append_children(parent_bid, &[child_bid]);
                                    // Buffer for deferred re-ordering when anchor is inserted
                                    self.deferred_inserts.push((child_bid, anchor_bid));
                                }
                            }
                        }
                        None => {
                            let parent_bid = self
                                .id_map
                                .get(&parent)
                                .copied()
                                .unwrap_or(mount_target);
                            mutator.append_children(parent_bid, &[child_bid]);
                        }
                    }
                }

                Op::Remove { id } => {
                    if let Some(&bid) = self.id_map.get(&id) {
                        mutator.remove_node(bid);
                    }
                }

                Op::SetText { id, value } => {
                    if let Some(&bid) = self.id_map.get(&id) {
                        mutator.set_node_text(bid, &value);
                    }
                }

                Op::SetAttr { id, key, value } => {
                    if let Some(&bid) = self.id_map.get(&id) {
                        mutator.set_attribute(bid, attr_qualname(&key), &value);
                    }
                }

                Op::SetStyle { id, key, value } => {
                    if let Some(&bid) = self.id_map.get(&id) {
                        mutator.set_style_property(bid, &key, &value);
                    }
                }

                Op::Listen {
                    id,
                    event,
                    handler_id,
                } => {
                    if let Some(&bid) = self.id_map.get(&id) {
                        self.listeners.push((bid, event, handler_id));
                    }
                }

                Op::Unlisten {
                    id,
                    event,
                    handler_id,
                } => {
                    if let Some(&bid) = self.id_map.get(&id) {
                        self.listeners
                            .retain(|l| !(l.0 == bid && l.1 == event && l.2 == handler_id));
                    }
                }

                Op::CloneTemplate {
                    start_id,
                    descriptor,
                    ..
                } => {
                    self.clone_template(&mut mutator, start_id, &descriptor);
                }

                // Window ops — pass through to shell
                Op::SetWindowDecorations { decorated } => {
                    window_ops.push(WindowOp::SetDecorations(decorated))
                }
                Op::BeginWindowDrag => window_ops.push(WindowOp::BeginDrag),
                Op::MinimizeWindow => window_ops.push(WindowOp::Minimize),
                Op::MaximizeWindow { maximize } => {
                    window_ops.push(WindowOp::Maximize(maximize))
                }
                Op::CloseWindow => window_ops.push(WindowOp::Close),
                Op::ClipboardWrite { text } => {
                    window_ops.push(WindowOp::SetClipboard(text))
                }
                Op::HmrSend { text } => {
                    window_ops.push(WindowOp::HmrSend(text))
                }

                // Ops handled elsewhere or no-ops for DOM
                Op::QueueMicrotask | Op::Flush => {}
                Op::SetScroll { .. } | Op::SetFocus { .. } | Op::SetCaret { .. } => {
                    // TODO: implement scroll/focus/caret
                }
            }
        }

        window_ops
    }

    /// Recursively create nodes from a template descriptor, assigning sequential IDs
    /// starting from `start_id`.
    fn clone_template(
        &mut self,
        mutator: &mut DocumentMutator,
        start_id: NodeId,
        descriptors: &[NodeDescriptor],
    ) {
        let mut next_id = start_id.0;
        self.clone_template_inner(mutator, &mut next_id, descriptors);
    }

    fn clone_template_inner(
        &mut self,
        mutator: &mut DocumentMutator,
        next_id: &mut u32,
        descriptors: &[NodeDescriptor],
    ) {
        for desc in descriptors {
            let current_id = NodeId(*next_id);
            *next_id += 1;

            let blitz_id = if matches!(desc.node_type, NodeType::Text) {
                mutator.create_text_node(desc.text.as_deref().unwrap_or(""))
            } else {
                let attrs = desc
                    .attrs
                    .iter()
                    .map(|(k, v)| Attribute {
                        name: attr_qualname(k),
                        value: v.clone(),
                    })
                    .collect();
                let bid =
                    mutator.create_element(node_type_to_qualname(&desc.node_type), attrs);
                for (k, v) in &desc.styles {
                    mutator.set_style_property(bid, k, v);
                }
                bid
            };
            self.id_map.insert(current_id, blitz_id);

            if !desc.children.is_empty() {
                self.clone_template_inner(mutator, next_id, &desc.children);
            }
        }
    }

    /// Get the Blitz node ID for an RVST NodeId.
    pub fn blitz_id(&self, rvst_id: NodeId) -> Option<usize> {
        self.id_map.get(&rvst_id).copied()
    }

    /// Get the RVST NodeId for a Blitz node ID (reverse lookup).
    pub fn rvst_id(&self, blitz_id: usize) -> Option<NodeId> {
        self.id_map.iter()
            .find(|(_, &bid)| bid == blitz_id)
            .map(|(&nid, _)| nid)
    }

    /// Iterate all (RVST NodeId, Blitz node ID) mappings.
    pub fn id_mappings(&self) -> impl Iterator<Item = (NodeId, usize)> + '_ {
        self.id_map.iter().map(|(&nid, &bid)| (nid, bid))
    }

    /// Get event listeners registered on a Blitz node.
    pub fn listeners_for(&self, blitz_id: usize) -> Vec<(String, u32)> {
        self.listeners
            .iter()
            .filter(|l| l.0 == blitz_id)
            .map(|l| (l.1.clone(), l.2))
            .collect()
    }
}

impl Default for BlitzBridge {
    fn default() -> Self {
        Self::new()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    fn make_doc() -> BaseDocument {
        BaseDocument::new(Default::default())
    }

    #[test]
    fn test_create_element() {
        let mut doc = make_doc();
        let mut bridge = BlitzBridge::new();
        let ops = vec![Op::CreateNode {
            id: NodeId(1),
            node_type: NodeType::View,
        }];
        bridge.apply_ops(&mut doc, ops);
        assert!(bridge.blitz_id(NodeId(1)).is_some());
    }

    #[test]
    fn test_create_text_and_set_text() {
        let mut doc = make_doc();
        let mut bridge = BlitzBridge::new();
        bridge.apply_ops(
            &mut doc,
            vec![
                Op::CreateNode {
                    id: NodeId(1),
                    node_type: NodeType::Text,
                },
                Op::SetText {
                    id: NodeId(1),
                    value: "Hello".into(),
                },
            ],
        );
        assert!(bridge.blitz_id(NodeId(1)).is_some());
    }

    #[test]
    fn test_insert_child() {
        let mut doc = make_doc();
        let mut bridge = BlitzBridge::new();
        bridge.apply_ops(
            &mut doc,
            vec![
                Op::CreateNode {
                    id: NodeId(1),
                    node_type: NodeType::View,
                },
                Op::CreateNode {
                    id: NodeId(2),
                    node_type: NodeType::View,
                },
                Op::Insert {
                    parent: NodeId(1),
                    child: NodeId(2),
                    anchor: None,
                },
            ],
        );
        assert!(bridge.blitz_id(NodeId(1)).is_some());
        assert!(bridge.blitz_id(NodeId(2)).is_some());
    }

    #[test]
    fn test_remove_node() {
        let mut doc = make_doc();
        let mut bridge = BlitzBridge::new();
        bridge.apply_ops(
            &mut doc,
            vec![
                Op::CreateNode {
                    id: NodeId(1),
                    node_type: NodeType::View,
                },
                // Insert into root so remove has a parent
                Op::Insert {
                    parent: NodeId(0),
                    child: NodeId(1),
                    anchor: None,
                },
                Op::Remove { id: NodeId(1) },
            ],
        );
        // Node still in id_map (just detached from tree)
        assert!(bridge.blitz_id(NodeId(1)).is_some());
    }

    #[test]
    fn test_set_attr() {
        let mut doc = make_doc();
        let mut bridge = BlitzBridge::new();
        bridge.apply_ops(
            &mut doc,
            vec![
                Op::CreateNode {
                    id: NodeId(1),
                    node_type: NodeType::View,
                },
                Op::SetAttr {
                    id: NodeId(1),
                    key: "class".into(),
                    value: "container".into(),
                },
            ],
        );
        assert!(bridge.blitz_id(NodeId(1)).is_some());
    }

    #[test]
    fn test_set_style() {
        let mut doc = make_doc();
        let mut bridge = BlitzBridge::new();
        bridge.apply_ops(
            &mut doc,
            vec![
                Op::CreateNode {
                    id: NodeId(1),
                    node_type: NodeType::View,
                },
                Op::SetStyle {
                    id: NodeId(1),
                    key: "display".into(),
                    value: "flex".into(),
                },
            ],
        );
        assert!(bridge.blitz_id(NodeId(1)).is_some());
    }

    #[test]
    fn test_listen_and_unlisten() {
        let mut doc = make_doc();
        let mut bridge = BlitzBridge::new();
        bridge.apply_ops(
            &mut doc,
            vec![
                Op::CreateNode {
                    id: NodeId(1),
                    node_type: NodeType::Button,
                },
                Op::Listen {
                    id: NodeId(1),
                    event: "click".into(),
                    handler_id: 42,
                },
            ],
        );
        let bid = bridge.blitz_id(NodeId(1)).unwrap();
        let listeners = bridge.listeners_for(bid);
        assert_eq!(listeners.len(), 1);
        assert_eq!(listeners[0], ("click".to_string(), 42));

        // Unlisten
        bridge.apply_ops(
            &mut doc,
            vec![Op::Unlisten {
                id: NodeId(1),
                event: "click".into(),
                handler_id: 42,
            }],
        );
        assert!(bridge.listeners_for(bid).is_empty());
    }

    #[test]
    fn test_window_ops_returned() {
        let mut doc = make_doc();
        let mut bridge = BlitzBridge::new();
        let window_ops = bridge.apply_ops(
            &mut doc,
            vec![
                Op::SetWindowDecorations { decorated: false },
                Op::BeginWindowDrag,
                Op::MinimizeWindow,
                Op::MaximizeWindow { maximize: true },
                Op::CloseWindow,
                Op::ClipboardWrite {
                    text: "hello".into(),
                },
            ],
        );
        assert_eq!(window_ops.len(), 6);
    }

    #[test]
    fn test_clone_template() {
        let mut doc = make_doc();
        let mut bridge = BlitzBridge::new();
        let ops = vec![Op::CloneTemplate {
            template_id: 1,
            start_id: NodeId(10),
            descriptor: vec![
                NodeDescriptor {
                    node_type: NodeType::View,
                    text: None,
                    attrs: vec![("class".into(), "wrapper".into())],
                    styles: vec![("display".into(), "flex".into())],
                    children: vec![NodeDescriptor {
                        node_type: NodeType::Text,
                        text: Some("Hello".into()),
                        attrs: vec![],
                        styles: vec![],
                        children: vec![],
                    }],
                },
            ],
        }];
        bridge.apply_ops(&mut doc, ops);
        // Parent div gets NodeId(10), child text gets NodeId(11)
        assert!(bridge.blitz_id(NodeId(10)).is_some());
        assert!(bridge.blitz_id(NodeId(11)).is_some());
    }

    #[test]
    fn test_missing_node_is_noop() {
        let mut doc = make_doc();
        let mut bridge = BlitzBridge::new();
        // These should not panic — just silently skip
        bridge.apply_ops(
            &mut doc,
            vec![
                Op::SetText {
                    id: NodeId(999),
                    value: "ghost".into(),
                },
                Op::SetAttr {
                    id: NodeId(999),
                    key: "x".into(),
                    value: "y".into(),
                },
                Op::SetStyle {
                    id: NodeId(999),
                    key: "x".into(),
                    value: "y".into(),
                },
                Op::Remove { id: NodeId(999) },
                Op::Insert {
                    parent: NodeId(999),
                    child: NodeId(998),
                    anchor: None,
                },
            ],
        );
    }
}

use std::collections::HashMap;
use crate::node::{NodeKey, EditorNode, NodeData};
use crate::selection::Selection;
use peniko::Color;

#[derive(Debug, Clone)]
pub struct TokenColorRange {
    pub start: usize,  // char offset in full document text
    pub end: usize,
    pub color: Color,
}

#[derive(Debug, Clone)]
pub struct InlayHintDecoration {
    pub line: u32,       // 0-indexed line number
    pub label: String,   // e.g. "↪ Define [97%]"
}

#[derive(Debug, Clone)]
pub struct DiagnosticDecoration {
    pub start_line: u32,
    pub start_char: u32,
    pub end_line: u32,
    pub end_char: u32,
    pub color: Color,
}

#[derive(Debug, Clone, Default)]
pub struct EditorDecorations {
    pub token_colors: Vec<TokenColorRange>,
    pub inlay_hints: Vec<InlayHintDecoration>,
    pub diagnostics: Vec<DiagnosticDecoration>,
}

/// A snapshot of editor state for undo/redo.
#[derive(Clone)]
struct Snapshot {
    nodes: HashMap<NodeKey, EditorNode>,
    root_key: NodeKey,
    next_key: NodeKey,
    selection: Option<Selection>,
}

pub struct EditorState {
    nodes: HashMap<NodeKey, EditorNode>,
    root_key: NodeKey,
    next_key: NodeKey,
    pub selection: Option<Selection>,
    pub decorations: EditorDecorations,
    history: Vec<Snapshot>,
    redo_stack: Vec<Snapshot>,
}

impl EditorState {
    pub fn new() -> Self {
        let root_key = 0;
        let mut nodes = HashMap::new();
        nodes.insert(root_key, EditorNode {
            key: root_key,
            data: NodeData::Root,
            parent: None,
            children: vec![],
        });
        Self {
            nodes,
            root_key,
            next_key: 1,
            selection: None,
            decorations: EditorDecorations::default(),
            history: Vec::new(),
            redo_stack: Vec::new(),
        }
    }

    /// Create with an initial empty paragraph (ready for typing).
    pub fn with_paragraph() -> Self {
        let mut state = Self::new();
        let para_key = state.create_node(NodeData::Paragraph);
        let text_key = state.create_node(NodeData::Text {
            content: String::new(),
            format: 0,
        });
        state.append_child(state.root_key, para_key);
        state.append_child(para_key, text_key);
        state
    }

    pub fn root_key(&self) -> NodeKey {
        self.root_key
    }

    pub fn root(&self) -> &EditorNode {
        self.nodes.get(&self.root_key).unwrap()
    }

    pub fn node(&self, key: NodeKey) -> Option<&EditorNode> {
        self.nodes.get(&key)
    }

    pub fn node_mut(&mut self, key: NodeKey) -> Option<&mut EditorNode> {
        self.nodes.get_mut(&key)
    }

    pub fn create_node(&mut self, data: NodeData) -> NodeKey {
        let key = self.next_key;
        self.next_key += 1;
        self.nodes.insert(key, EditorNode {
            key,
            data,
            parent: None,
            children: vec![],
        });
        key
    }

    pub fn append_child(&mut self, parent: NodeKey, child: NodeKey) {
        if let Some(parent_node) = self.nodes.get_mut(&parent) {
            parent_node.children.push(child);
        }
        if let Some(child_node) = self.nodes.get_mut(&child) {
            child_node.parent = Some(parent);
        }
    }

    pub fn remove_node(&mut self, key: NodeKey) {
        // Remove from parent's children list
        if let Some(parent_key) = self.nodes.get(&key).and_then(|n| n.parent) {
            if let Some(parent) = self.nodes.get_mut(&parent_key) {
                parent.children.retain(|&k| k != key);
            }
        }
        self.nodes.remove(&key);
    }

    /// Get all text content by walking the tree in document order.
    pub fn text_content(&self) -> String {
        let mut result = String::new();
        self.collect_text(self.root_key, &mut result);
        result
    }

    fn collect_text(&self, key: NodeKey, out: &mut String) {
        if let Some(node) = self.nodes.get(&key) {
            match &node.data {
                NodeData::Text { content, .. } => out.push_str(content),
                NodeData::Paragraph | NodeData::Heading { .. } => {
                    if !out.is_empty() {
                        out.push('\n');
                    }
                    for &child in &node.children {
                        self.collect_text(child, out);
                    }
                }
                NodeData::Root => {
                    for &child in &node.children {
                        self.collect_text(child, out);
                    }
                }
            }
        }
    }

    /// Find the first text node in document order (for initial cursor placement).
    pub fn first_text_key(&self) -> Option<NodeKey> {
        self.find_first_text(self.root_key)
    }

    fn find_first_text(&self, key: NodeKey) -> Option<NodeKey> {
        let node = self.nodes.get(&key)?;
        if matches!(node.data, NodeData::Text { .. }) {
            return Some(key);
        }
        for &child in &node.children {
            if let Some(found) = self.find_first_text(child) {
                return Some(found);
            }
        }
        None
    }

    /// Find the last text node in document order.
    pub fn last_text_key(&self) -> Option<NodeKey> {
        self.find_last_text(self.root_key)
    }

    fn find_last_text(&self, key: NodeKey) -> Option<NodeKey> {
        let node = self.nodes.get(&key)?;
        for &child in node.children.iter().rev() {
            if let Some(found) = self.find_last_text(child) {
                return Some(found);
            }
        }
        if matches!(node.data, NodeData::Text { .. }) {
            return Some(key);
        }
        None
    }

    pub fn set_selection(&mut self, sel: Selection) {
        self.selection = Some(sel);
    }

    fn take_snapshot(&self) -> Snapshot {
        Snapshot {
            nodes: self.nodes.clone(),
            root_key: self.root_key,
            next_key: self.next_key,
            selection: self.selection.clone(),
        }
    }

    fn restore_snapshot(&mut self, snap: Snapshot) {
        self.nodes = snap.nodes;
        self.root_key = snap.root_key;
        self.next_key = snap.next_key;
        self.selection = snap.selection;
    }

    pub fn push_undo(&mut self) {
        let snap = self.take_snapshot();
        self.history.push(snap);
        if self.history.len() > 100 {
            self.history.remove(0);
        }
        self.redo_stack.clear();
    }

    pub fn undo(&mut self) -> bool {
        if let Some(snap) = self.history.pop() {
            let current = self.take_snapshot();
            self.redo_stack.push(current);
            self.restore_snapshot(snap);
            true
        } else {
            false
        }
    }

    pub fn redo(&mut self) -> bool {
        if let Some(snap) = self.redo_stack.pop() {
            let current = self.take_snapshot();
            self.history.push(current);
            self.restore_snapshot(snap);
            true
        } else {
            false
        }
    }

    pub fn clear_selection(&mut self) {
        self.selection = None;
    }

    /// Place cursor at the start of the first text node.
    pub fn select_start(&mut self) {
        if let Some(key) = self.first_text_key() {
            self.selection = Some(Selection::collapsed(key, 0));
        }
    }

    /// Place cursor at the end of the last text node.
    pub fn select_end(&mut self) {
        if let Some(key) = self.last_text_key() {
            if let Some(node) = self.node(key) {
                let len = node.text_content().chars().count();
                self.selection = Some(Selection::collapsed(key, len));
            }
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn new_state_has_root() {
        let state = EditorState::new();
        assert!(state.root().children.is_empty());
        assert!(matches!(state.root().data, NodeData::Root));
    }

    #[test]
    fn with_paragraph_creates_initial_structure() {
        let state = EditorState::with_paragraph();
        assert_eq!(state.root().children.len(), 1);
        let para_key = state.root().children[0];
        let para = state.node(para_key).unwrap();
        assert!(matches!(para.data, NodeData::Paragraph));
        assert_eq!(para.children.len(), 1);
        let text_key = para.children[0];
        let text = state.node(text_key).unwrap();
        assert!(matches!(text.data, NodeData::Text { .. }));
    }

    #[test]
    fn text_content_single_paragraph() {
        let mut state = EditorState::with_paragraph();
        let text_key = state.first_text_key().unwrap();
        if let Some(node) = state.node_mut(text_key) {
            node.data = NodeData::Text { content: "hello".to_string(), format: 0 };
        }
        assert_eq!(state.text_content(), "hello");
    }

    #[test]
    fn text_content_multiple_paragraphs() {
        let mut state = EditorState::new();
        let p1 = state.create_node(NodeData::Paragraph);
        let t1 = state.create_node(NodeData::Text { content: "first".to_string(), format: 0 });
        state.append_child(state.root_key(), p1);
        state.append_child(p1, t1);

        let p2 = state.create_node(NodeData::Paragraph);
        let t2 = state.create_node(NodeData::Text { content: "second".to_string(), format: 0 });
        state.append_child(state.root_key(), p2);
        state.append_child(p2, t2);

        assert_eq!(state.text_content(), "first\nsecond");
    }

    #[test]
    fn remove_node_removes_from_parent() {
        let mut state = EditorState::with_paragraph();
        let para_key = state.root().children[0];
        state.remove_node(para_key);
        assert!(state.root().children.is_empty());
    }

    #[test]
    fn first_text_key_finds_text_node() {
        let state = EditorState::with_paragraph();
        let key = state.first_text_key().unwrap();
        assert!(matches!(state.node(key).unwrap().data, NodeData::Text { .. }));
    }
}

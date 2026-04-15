use crate::node::NodeKey;
use crate::state::EditorState;

/// A point in the document — node key + character offset within that node.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub struct SelectionPoint {
    pub key: NodeKey,
    pub offset: usize,
}

/// Editor selection — anchor (start of selection) and focus (end/cursor position).
/// When anchor == focus, the selection is collapsed (just a cursor).
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct Selection {
    pub anchor: SelectionPoint,
    pub focus: SelectionPoint,
}

impl Selection {
    /// Create a collapsed selection (cursor) at the given position.
    pub fn collapsed(key: NodeKey, offset: usize) -> Self {
        let point = SelectionPoint { key, offset };
        Self {
            anchor: point,
            focus: point,
        }
    }

    pub fn is_collapsed(&self) -> bool {
        self.anchor == self.focus
    }

    /// Move cursor forward or backward by one character.
    /// Stays within the current text node. Returns None if at boundary.
    pub fn move_by_char(&self, forward: bool, state: &EditorState) -> Option<Selection> {
        let node = state.node(self.focus.key)?;
        if let crate::node::NodeData::Text { ref content, .. } = node.data {
            let chars: Vec<char> = content.chars().collect();
            let new_offset = if forward {
                if self.focus.offset < chars.len() {
                    self.focus.offset + 1
                } else {
                    return None;
                }
            } else {
                if self.focus.offset > 0 {
                    self.focus.offset - 1
                } else {
                    return None;
                }
            };
            Some(Selection::collapsed(self.focus.key, new_offset))
        } else {
            None
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::node::NodeData;
    use crate::state::EditorState;

    #[test]
    fn collapsed_selection() {
        let sel = Selection::collapsed(1, 5);
        assert!(sel.is_collapsed());
        assert_eq!(sel.focus.offset, 5);
    }

    #[test]
    fn range_selection_not_collapsed() {
        let sel = Selection {
            anchor: SelectionPoint { key: 1, offset: 0 },
            focus: SelectionPoint { key: 1, offset: 5 },
        };
        assert!(!sel.is_collapsed());
    }

    #[test]
    fn move_by_char_forward() {
        let mut state = EditorState::with_paragraph();
        let key = state.first_text_key().unwrap();
        state.node_mut(key).unwrap().data = NodeData::Text {
            content: "hello".to_string(),
            format: 0,
        };
        let sel = Selection::collapsed(key, 2);
        let moved = sel.move_by_char(true, &state).unwrap();
        assert_eq!(moved.focus.offset, 3);
    }

    #[test]
    fn move_by_char_backward() {
        let mut state = EditorState::with_paragraph();
        let key = state.first_text_key().unwrap();
        state.node_mut(key).unwrap().data = NodeData::Text {
            content: "hello".to_string(),
            format: 0,
        };
        let sel = Selection::collapsed(key, 2);
        let moved = sel.move_by_char(false, &state).unwrap();
        assert_eq!(moved.focus.offset, 1);
    }

    #[test]
    fn move_at_end_returns_none() {
        let mut state = EditorState::with_paragraph();
        let key = state.first_text_key().unwrap();
        state.node_mut(key).unwrap().data = NodeData::Text {
            content: "hi".to_string(),
            format: 0,
        };
        let sel = Selection::collapsed(key, 2);
        assert!(sel.move_by_char(true, &state).is_none());
    }

    #[test]
    fn move_at_start_returns_none() {
        let state = EditorState::with_paragraph();
        let key = state.first_text_key().unwrap();
        let sel = Selection::collapsed(key, 0);
        assert!(sel.move_by_char(false, &state).is_none());
    }

    #[test]
    fn select_start_places_cursor() {
        let mut state = EditorState::with_paragraph();
        state.select_start();
        let sel = state.selection.as_ref().unwrap();
        assert!(sel.is_collapsed());
        assert_eq!(sel.focus.offset, 0);
    }
}

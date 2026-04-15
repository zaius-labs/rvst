use crate::command::EditorCommand;
use crate::node::NodeData;
use crate::selection::{Selection, SelectionPoint};
use crate::state::EditorState;

pub fn apply_command(state: &mut EditorState, cmd: EditorCommand) {
    // Handle undo/redo first
    match &cmd {
        EditorCommand::Undo => { state.undo(); return; }
        EditorCommand::Redo => { state.redo(); return; }
        _ => {}
    }

    // Push undo for mutating commands (not movement/selection)
    let is_mutation = matches!(&cmd,
        EditorCommand::InsertText(_) | EditorCommand::DeleteBackward | EditorCommand::DeleteForward
        | EditorCommand::InsertParagraph | EditorCommand::FormatBold | EditorCommand::FormatItalic
        | EditorCommand::FormatCode
    );
    if is_mutation {
        state.push_undo();
    }

    match cmd {
        EditorCommand::InsertText(text) => insert_text(state, &text),
        EditorCommand::DeleteBackward => delete_backward(state),
        EditorCommand::DeleteForward => delete_forward(state),
        EditorCommand::InsertParagraph => insert_paragraph(state),
        EditorCommand::MoveLeft => move_cursor(state, false),
        EditorCommand::MoveRight => move_cursor(state, true),
        EditorCommand::MoveToLineStart => move_to_line_start(state),
        EditorCommand::MoveToLineEnd => move_to_line_end(state),
        EditorCommand::SelectLeft => select_move(state, false),
        EditorCommand::SelectRight => select_move(state, true),
        EditorCommand::SelectToLineStart => select_to_line_start(state),
        EditorCommand::SelectToLineEnd => select_to_line_end(state),
        EditorCommand::FormatBold => toggle_format(state, crate::node::FormatFlag::Bold as u32),
        EditorCommand::FormatItalic => toggle_format(state, crate::node::FormatFlag::Italic as u32),
        EditorCommand::FormatCode => toggle_format(state, crate::node::FormatFlag::Code as u32),
        EditorCommand::Undo | EditorCommand::Redo => unreachable!(),
        _ => {}
    }
}

fn delete_selection(state: &mut EditorState) -> bool {
    let sel = match &state.selection {
        Some(s) if !s.is_collapsed() => s.clone(),
        _ => return false,
    };
    // For now, only handle same-node selections (anchor and focus in same text node)
    if sel.anchor.key != sel.focus.key {
        return false;
    }

    let (start, end) = if sel.anchor.offset <= sel.focus.offset {
        (sel.anchor.offset, sel.focus.offset)
    } else {
        (sel.focus.offset, sel.anchor.offset)
    };

    if let Some(node) = state.node_mut(sel.anchor.key) {
        if let NodeData::Text { ref mut content, .. } = node.data {
            let chars: Vec<char> = content.chars().collect();
            let byte_start: usize = chars[..start].iter().map(|c| c.len_utf8()).sum();
            let byte_end: usize = chars[..end].iter().map(|c| c.len_utf8()).sum();
            content.replace_range(byte_start..byte_end, "");
        }
    }
    state.set_selection(Selection::collapsed(sel.anchor.key, start));
    true
}

fn insert_text(state: &mut EditorState, text: &str) {
    // Delete selection first if range
    delete_selection(state);
    let sel = match &state.selection {
        Some(s) if s.is_collapsed() => s.clone(),
        _ => return,
    };
    let node = match state.node_mut(sel.focus.key) {
        Some(n) => n,
        None => return,
    };
    if let NodeData::Text { ref mut content, .. } = node.data {
        let byte_offset = content
            .char_indices()
            .nth(sel.focus.offset)
            .map(|(i, _)| i)
            .unwrap_or(content.len());
        content.insert_str(byte_offset, text);
        let new_offset = sel.focus.offset + text.chars().count();
        state.set_selection(Selection::collapsed(sel.focus.key, new_offset));
    }
}

fn delete_backward(state: &mut EditorState) {
    if delete_selection(state) {
        return;
    }
    let sel = match &state.selection {
        Some(s) if s.is_collapsed() => s.clone(),
        _ => return,
    };
    if sel.focus.offset == 0 {
        return;
    }
    let node = match state.node_mut(sel.focus.key) {
        Some(n) => n,
        None => return,
    };
    if let NodeData::Text { ref mut content, .. } = node.data {
        let chars: Vec<char> = content.chars().collect();
        if sel.focus.offset > 0 && sel.focus.offset <= chars.len() {
            let byte_start: usize = chars[..sel.focus.offset - 1]
                .iter()
                .map(|c| c.len_utf8())
                .sum();
            let byte_end = byte_start + chars[sel.focus.offset - 1].len_utf8();
            content.replace_range(byte_start..byte_end, "");
            state.set_selection(Selection::collapsed(sel.focus.key, sel.focus.offset - 1));
        }
    }
}

fn delete_forward(state: &mut EditorState) {
    let sel = match &state.selection {
        Some(s) if s.is_collapsed() => s.clone(),
        _ => return,
    };
    let node = match state.node_mut(sel.focus.key) {
        Some(n) => n,
        None => return,
    };
    if let NodeData::Text { ref mut content, .. } = node.data {
        let chars: Vec<char> = content.chars().collect();
        if sel.focus.offset < chars.len() {
            let byte_start: usize = chars[..sel.focus.offset]
                .iter()
                .map(|c| c.len_utf8())
                .sum();
            let byte_end = byte_start + chars[sel.focus.offset].len_utf8();
            content.replace_range(byte_start..byte_end, "");
        }
    }
}

fn insert_paragraph(state: &mut EditorState) {
    let sel = match &state.selection {
        Some(s) if s.is_collapsed() => s.clone(),
        _ => return,
    };

    // Get the text content and split it at the cursor
    let (before, after) = {
        let node = match state.node(sel.focus.key) {
            Some(n) => n,
            None => return,
        };
        if let NodeData::Text { ref content, .. } = node.data {
            let chars: Vec<char> = content.chars().collect();
            let before: String = chars[..sel.focus.offset].iter().collect();
            let after: String = chars[sel.focus.offset..].iter().collect();
            (before, after)
        } else {
            return;
        }
    };

    // Get the parent paragraph
    let para_key = match state.node(sel.focus.key).and_then(|n| n.parent) {
        Some(k) => k,
        None => return,
    };
    let root_key = state.root_key();

    // Update current text node to "before" text
    if let Some(node) = state.node_mut(sel.focus.key) {
        if let NodeData::Text { ref mut content, .. } = node.data {
            *content = before;
        }
    }

    // Create new paragraph with "after" text
    let new_para = state.create_node(NodeData::Paragraph);
    let new_text = state.create_node(NodeData::Text {
        content: after,
        format: 0,
    });
    state.append_child(new_para, new_text);

    // Insert new paragraph after current paragraph in root's children
    if let Some(root) = state.node_mut(root_key) {
        let pos = root
            .children
            .iter()
            .position(|&k| k == para_key)
            .map(|p| p + 1)
            .unwrap_or(root.children.len());
        root.children.insert(pos, new_para);
    }
    if let Some(new_para_node) = state.node_mut(new_para) {
        new_para_node.parent = Some(root_key);
    }

    // Move cursor to start of new text node
    state.set_selection(Selection::collapsed(new_text, 0));
}

fn move_cursor(state: &mut EditorState, forward: bool) {
    let sel = match &state.selection {
        Some(s) => s.clone(),
        None => return,
    };
    if let Some(new_sel) = sel.move_by_char(forward, state) {
        state.set_selection(new_sel);
    }
}

fn move_to_line_start(state: &mut EditorState) {
    let sel = match &state.selection {
        Some(s) => s.clone(),
        None => return,
    };
    state.set_selection(Selection::collapsed(sel.focus.key, 0));
}

fn move_to_line_end(state: &mut EditorState) {
    let sel = match &state.selection {
        Some(s) => s.clone(),
        None => return,
    };
    if let Some(node) = state.node(sel.focus.key) {
        let len = node.text_content().chars().count();
        state.set_selection(Selection::collapsed(sel.focus.key, len));
    }
}

fn select_move(state: &mut EditorState, forward: bool) {
    let sel = match &state.selection {
        Some(s) => s.clone(),
        None => return,
    };
    // Move focus but keep anchor — this creates/extends a range selection
    if let Some(node) = state.node(sel.focus.key) {
        if let NodeData::Text { ref content, .. } = node.data {
            let chars_len = content.chars().count();
            let new_offset = if forward {
                if sel.focus.offset < chars_len {
                    sel.focus.offset + 1
                } else {
                    return;
                }
            } else {
                if sel.focus.offset > 0 {
                    sel.focus.offset - 1
                } else {
                    return;
                }
            };
            state.set_selection(Selection {
                anchor: sel.anchor,
                focus: SelectionPoint {
                    key: sel.focus.key,
                    offset: new_offset,
                },
            });
        }
    }
}

fn select_to_line_start(state: &mut EditorState) {
    let sel = match &state.selection {
        Some(s) => s.clone(),
        None => return,
    };
    state.set_selection(Selection {
        anchor: sel.anchor,
        focus: SelectionPoint {
            key: sel.focus.key,
            offset: 0,
        },
    });
}

fn toggle_format(state: &mut EditorState, flag: u32) {
    let sel = match &state.selection {
        Some(s) => s.clone(),
        None => return,
    };
    // Toggle format on the text node at the focus point
    if let Some(node) = state.node_mut(sel.focus.key) {
        if let NodeData::Text { ref mut format, .. } = node.data {
            *format ^= flag; // XOR toggles the bit
        }
    }
}

fn select_to_line_end(state: &mut EditorState) {
    let sel = match &state.selection {
        Some(s) => s.clone(),
        None => return,
    };
    if let Some(node) = state.node(sel.focus.key) {
        let len = node.text_content().chars().count();
        state.set_selection(Selection {
            anchor: sel.anchor,
            focus: SelectionPoint {
                key: sel.focus.key,
                offset: len,
            },
        });
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::input::{key_to_command, KeyEvent};

    fn setup() -> EditorState {
        let mut state = EditorState::with_paragraph();
        state.select_start();
        state
    }

    #[test]
    fn insert_text_at_start() {
        let mut state = setup();
        apply_command(&mut state, EditorCommand::InsertText("hi".into()));
        assert_eq!(state.text_content(), "hi");
        assert_eq!(state.selection.as_ref().unwrap().focus.offset, 2);
    }

    #[test]
    fn insert_text_advances_cursor() {
        let mut state = setup();
        apply_command(&mut state, EditorCommand::InsertText("a".into()));
        apply_command(&mut state, EditorCommand::InsertText("b".into()));
        apply_command(&mut state, EditorCommand::InsertText("c".into()));
        assert_eq!(state.text_content(), "abc");
        assert_eq!(state.selection.as_ref().unwrap().focus.offset, 3);
    }

    #[test]
    fn delete_backward_removes_char() {
        let mut state = setup();
        apply_command(&mut state, EditorCommand::InsertText("abc".into()));
        apply_command(&mut state, EditorCommand::DeleteBackward);
        assert_eq!(state.text_content(), "ab");
        assert_eq!(state.selection.as_ref().unwrap().focus.offset, 2);
    }

    #[test]
    fn delete_backward_at_start_noop() {
        let mut state = setup();
        apply_command(&mut state, EditorCommand::DeleteBackward);
        assert_eq!(state.text_content(), "");
    }

    #[test]
    fn delete_forward_removes_char() {
        let mut state = setup();
        apply_command(&mut state, EditorCommand::InsertText("abc".into()));
        state.set_selection(Selection::collapsed(state.first_text_key().unwrap(), 1));
        apply_command(&mut state, EditorCommand::DeleteForward);
        assert_eq!(state.text_content(), "ac");
    }

    #[test]
    fn insert_paragraph_splits_text() {
        let mut state = setup();
        apply_command(&mut state, EditorCommand::InsertText("abcd".into()));
        state.set_selection(Selection::collapsed(state.first_text_key().unwrap(), 2));
        apply_command(&mut state, EditorCommand::InsertParagraph);
        assert_eq!(state.text_content(), "ab\ncd");
        assert_eq!(state.selection.as_ref().unwrap().focus.offset, 0);
    }

    #[test]
    fn move_left_right() {
        let mut state = setup();
        apply_command(&mut state, EditorCommand::InsertText("abc".into()));
        apply_command(&mut state, EditorCommand::MoveLeft);
        assert_eq!(state.selection.as_ref().unwrap().focus.offset, 2);
        apply_command(&mut state, EditorCommand::MoveRight);
        assert_eq!(state.selection.as_ref().unwrap().focus.offset, 3);
    }

    #[test]
    fn key_to_command_mapping() {
        let event = KeyEvent {
            key: "a".into(),
            ctrl: false,
            shift: false,
            alt: false,
            meta: false,
        };
        assert!(matches!(
            key_to_command(&event),
            Some(EditorCommand::InsertText(_))
        ));

        let event = KeyEvent {
            key: "Backspace".into(),
            ctrl: false,
            shift: false,
            alt: false,
            meta: false,
        };
        assert!(matches!(
            key_to_command(&event),
            Some(EditorCommand::DeleteBackward)
        ));

        let event = KeyEvent {
            key: "z".into(),
            ctrl: false,
            shift: false,
            alt: false,
            meta: true,
        };
        assert!(matches!(key_to_command(&event), Some(EditorCommand::Undo)));
    }

    #[test]
    fn shift_right_creates_selection() {
        let mut state = setup();
        apply_command(&mut state, EditorCommand::InsertText("hello".into()));
        apply_command(&mut state, EditorCommand::MoveToLineStart);
        apply_command(&mut state, EditorCommand::SelectRight);
        apply_command(&mut state, EditorCommand::SelectRight);
        let sel = state.selection.as_ref().unwrap();
        assert!(!sel.is_collapsed());
        assert_eq!(sel.anchor.offset, 0);
        assert_eq!(sel.focus.offset, 2);
    }

    #[test]
    fn typing_replaces_selection() {
        let mut state = setup();
        apply_command(&mut state, EditorCommand::InsertText("hello".into()));
        apply_command(&mut state, EditorCommand::MoveToLineStart);
        apply_command(&mut state, EditorCommand::SelectRight);
        apply_command(&mut state, EditorCommand::SelectRight);
        // Type "HI" to replace "he"
        apply_command(&mut state, EditorCommand::InsertText("HI".into()));
        assert_eq!(state.text_content(), "HIllo");
    }

    #[test]
    fn toggle_bold() {
        let mut state = setup();
        apply_command(&mut state, EditorCommand::InsertText("hello".into()));
        apply_command(&mut state, EditorCommand::FormatBold);
        let key = state.first_text_key().unwrap();
        if let NodeData::Text { format, .. } = state.node(key).unwrap().data {
            assert_ne!(format & 1, 0, "Bold flag should be set");
        } else {
            panic!("expected text node");
        }
    }

    #[test]
    fn toggle_bold_twice_removes() {
        let mut state = setup();
        apply_command(&mut state, EditorCommand::InsertText("hello".into()));
        apply_command(&mut state, EditorCommand::FormatBold);
        apply_command(&mut state, EditorCommand::FormatBold);
        let key = state.first_text_key().unwrap();
        if let NodeData::Text { format, .. } = state.node(key).unwrap().data {
            assert_eq!(format & 1, 0, "Bold flag should be cleared");
        } else {
            panic!("expected text node");
        }
    }

    #[test]
    fn toggle_italic() {
        let mut state = setup();
        apply_command(&mut state, EditorCommand::InsertText("hello".into()));
        apply_command(&mut state, EditorCommand::FormatItalic);
        let key = state.first_text_key().unwrap();
        if let NodeData::Text { format, .. } = state.node(key).unwrap().data {
            assert_ne!(format & 2, 0, "Italic flag should be set");
        } else {
            panic!("expected text node");
        }
    }

    #[test]
    fn bold_and_italic_independent() {
        let mut state = setup();
        apply_command(&mut state, EditorCommand::InsertText("hello".into()));
        apply_command(&mut state, EditorCommand::FormatBold);
        apply_command(&mut state, EditorCommand::FormatItalic);
        let key = state.first_text_key().unwrap();
        if let NodeData::Text { format, .. } = state.node(key).unwrap().data {
            assert_ne!(format & 1, 0, "Bold flag should be set");
            assert_ne!(format & 2, 0, "Italic flag should be set");
        } else {
            panic!("expected text node");
        }
    }

    #[test]
    fn undo_insert() {
        let mut state = setup();
        apply_command(&mut state, EditorCommand::InsertText("hello".into()));
        assert_eq!(state.text_content(), "hello");
        apply_command(&mut state, EditorCommand::Undo);
        assert_eq!(state.text_content(), "");
    }

    #[test]
    fn redo_after_undo() {
        let mut state = setup();
        apply_command(&mut state, EditorCommand::InsertText("hello".into()));
        apply_command(&mut state, EditorCommand::Undo);
        assert_eq!(state.text_content(), "");
        apply_command(&mut state, EditorCommand::Redo);
        assert_eq!(state.text_content(), "hello");
    }

    #[test]
    fn multiple_undos() {
        let mut state = setup();
        apply_command(&mut state, EditorCommand::InsertText("a".into()));
        apply_command(&mut state, EditorCommand::InsertText("b".into()));
        apply_command(&mut state, EditorCommand::InsertText("c".into()));
        assert_eq!(state.text_content(), "abc");
        apply_command(&mut state, EditorCommand::Undo);
        assert_eq!(state.text_content(), "ab");
        apply_command(&mut state, EditorCommand::Undo);
        assert_eq!(state.text_content(), "a");
        apply_command(&mut state, EditorCommand::Undo);
        assert_eq!(state.text_content(), "");
    }

    #[test]
    fn new_edit_clears_redo() {
        let mut state = setup();
        apply_command(&mut state, EditorCommand::InsertText("hello".into()));
        apply_command(&mut state, EditorCommand::Undo);
        apply_command(&mut state, EditorCommand::InsertText("world".into()));
        // Redo should not bring back "hello" — it was cleared
        apply_command(&mut state, EditorCommand::Redo);
        assert_eq!(state.text_content(), "world"); // unchanged, redo stack empty
    }

    #[test]
    fn backspace_deletes_selection() {
        let mut state = setup();
        apply_command(&mut state, EditorCommand::InsertText("hello".into()));
        apply_command(&mut state, EditorCommand::MoveToLineStart);
        apply_command(&mut state, EditorCommand::SelectRight);
        apply_command(&mut state, EditorCommand::SelectRight);
        apply_command(&mut state, EditorCommand::DeleteBackward);
        assert_eq!(state.text_content(), "llo");
    }
}

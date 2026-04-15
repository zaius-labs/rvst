use crate::command::EditorCommand;

pub struct KeyEvent {
    pub key: String,
    pub ctrl: bool,
    pub shift: bool,
    pub alt: bool,
    pub meta: bool,
}

pub fn key_to_command(event: &KeyEvent) -> Option<EditorCommand> {
    let cmd_or_ctrl = event.meta || event.ctrl;
    match event.key.as_str() {
        "Backspace" => Some(EditorCommand::DeleteBackward),
        "Delete" => Some(EditorCommand::DeleteForward),
        "Enter" => Some(EditorCommand::InsertParagraph),
        "ArrowLeft" | "Left" if event.shift => Some(EditorCommand::SelectLeft),
        "ArrowRight" | "Right" if event.shift => Some(EditorCommand::SelectRight),
        "Home" if event.shift => Some(EditorCommand::SelectToLineStart),
        "End" if event.shift => Some(EditorCommand::SelectToLineEnd),
        "ArrowLeft" | "Left" => Some(EditorCommand::MoveLeft),
        "ArrowRight" | "Right" => Some(EditorCommand::MoveRight),
        "Home" => Some(EditorCommand::MoveToLineStart),
        "End" => Some(EditorCommand::MoveToLineEnd),
        "b" if cmd_or_ctrl => Some(EditorCommand::FormatBold),
        "i" if cmd_or_ctrl => Some(EditorCommand::FormatItalic),
        "a" if cmd_or_ctrl => Some(EditorCommand::SelectAll),
        "z" if cmd_or_ctrl && event.shift => Some(EditorCommand::Redo),
        "z" if cmd_or_ctrl => Some(EditorCommand::Undo),
        k if k.len() == 1 && !cmd_or_ctrl => Some(EditorCommand::InsertText(k.to_string())),
        _ => None,
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn regular_char_produces_insert() {
        let e = KeyEvent { key: "x".into(), ctrl: false, shift: false, alt: false, meta: false };
        match key_to_command(&e) {
            Some(EditorCommand::InsertText(s)) => assert_eq!(s, "x"),
            _ => panic!("expected InsertText"),
        }
    }

    #[test]
    fn ctrl_a_produces_select_all() {
        let e = KeyEvent { key: "a".into(), ctrl: true, shift: false, alt: false, meta: false };
        assert!(matches!(key_to_command(&e), Some(EditorCommand::SelectAll)));
    }

    #[test]
    fn cmd_b_maps_to_format_bold() {
        let e = KeyEvent { key: "b".into(), ctrl: false, shift: false, alt: false, meta: true };
        assert!(matches!(key_to_command(&e), Some(EditorCommand::FormatBold)));
    }

    #[test]
    fn cmd_i_maps_to_format_italic() {
        let e = KeyEvent { key: "i".into(), ctrl: false, shift: false, alt: false, meta: true };
        assert!(matches!(key_to_command(&e), Some(EditorCommand::FormatItalic)));
    }

    #[test]
    fn ctrl_char_not_insert() {
        let e = KeyEvent { key: "c".into(), ctrl: true, shift: false, alt: false, meta: false };
        assert!(key_to_command(&e).is_none());
    }
}

use crate::node::{NodeId, NodeType};

/// Descriptor for a single node within a cached template.
/// Produced by JS on first clone, replayed by Rust on subsequent clones.
#[derive(Debug, Clone)]
pub struct NodeDescriptor {
    pub node_type: NodeType,
    pub text: Option<String>,
    pub attrs: Vec<(String, String)>,
    pub styles: Vec<(String, String)>,
    pub children: Vec<NodeDescriptor>,
}

#[derive(Debug, Clone)]
pub enum Op {
    CreateNode {
        id: NodeId,
        node_type: NodeType,
    },
    Insert {
        parent: NodeId,
        child: NodeId,
        anchor: Option<NodeId>,
    },
    Remove {
        id: NodeId,
    },
    SetText {
        id: NodeId,
        value: String,
    },
    SetAttr {
        id: NodeId,
        key: String,
        value: String,
    },
    SetStyle {
        id: NodeId,
        key: String,
        value: String,
    },
    Listen {
        id: NodeId,
        event: String,
        handler_id: u32,
    },
    Unlisten {
        id: NodeId,
        event: String,
        handler_id: u32,
    },
    QueueMicrotask,
    Flush,
    /// Remove or restore native OS window chrome (title bar, resize handles).
    /// `decorated: true` = OS chrome visible (default); `decorated: false` = frameless.
    /// Call once on mount — toggling at runtime is not supported by this system.
    SetWindowDecorations {
        decorated: bool,
    },
    /// Begin an OS-native window drag from the current cursor position.
    /// Translates to winit `Window::drag_window()`. Must be called from a
    /// mousedown handler; ignored outside mouse events.
    BeginWindowDrag,
    /// Minimize the window to the taskbar/dock.
    MinimizeWindow,
    /// Maximize or restore the window.
    /// `maximize: true` → maximize; `maximize: false` → restore to previous size.
    MaximizeWindow {
        maximize: bool,
    },
    /// Request the event loop to exit (equivalent to user clicking × on OS titlebar).
    CloseWindow,
    /// Set scroll offset on a node (from JS scrollTop = value assignment).
    SetScroll {
        id: NodeId,
        scroll_y: f32,
    },
    /// Programmatically set focus to a node (id=0 means clear focus).
    SetFocus {
        id: NodeId,
    },
    /// Write text to the system clipboard (from navigator.clipboard.writeText).
    ClipboardWrite {
        text: String,
    },
    /// Set caret position for a contentEditable node (x, y, height in screen coords).
    SetCaret {
        id: NodeId,
        x: f32,
        y: f32,
        height: f32,
    },
    /// Batch-create a subtree from a cached template descriptor.
    /// `template_id` identifies the cached template (hash of the HTML string).
    /// `start_id` is the first NodeId to assign; subsequent nodes get start_id+1, etc.
    /// `descriptor` is the full tree structure (parsed once from HTML, reused on clones).
    CloneTemplate {
        template_id: u64,
        start_id: NodeId,
        descriptor: Vec<NodeDescriptor>,
    },
}

pub fn op_channel() -> (std::sync::mpsc::Sender<Op>, std::sync::mpsc::Receiver<Op>) {
    std::sync::mpsc::channel()
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn op_create_node_roundtrip() {
        let op = Op::CreateNode {
            id: NodeId(1),
            node_type: NodeType::Text,
        };
        assert!(matches!(op, Op::CreateNode { .. }));
    }

    #[test]
    fn op_channel_sends_and_receives() {
        let (tx, rx) = op_channel();
        tx.send(Op::Flush).unwrap();
        assert!(matches!(rx.recv().unwrap(), Op::Flush));
    }

    #[test]
    fn window_ops_exist() {
        let ops = [
            Op::SetWindowDecorations { decorated: false },
            Op::BeginWindowDrag,
            Op::MinimizeWindow,
            Op::MaximizeWindow { maximize: true },
            Op::CloseWindow,
        ];
        for op in &ops {
            let _ = format!("{op:?}");
        }
    }
}

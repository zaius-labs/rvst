pub type NodeKey = u64;

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum FormatFlag {
    Bold = 1,
    Italic = 2,
    Code = 4,
    Underline = 8,
    Strikethrough = 16,
}

#[derive(Debug, Clone)]
pub enum NodeData {
    Root,
    Paragraph,
    Heading { level: u8 },
    Text { content: String, format: u32 },
}

#[derive(Debug, Clone)]
pub struct EditorNode {
    pub key: NodeKey,
    pub data: NodeData,
    pub parent: Option<NodeKey>,
    pub children: Vec<NodeKey>,
}

impl EditorNode {
    pub fn text_content(&self) -> &str {
        match &self.data {
            NodeData::Text { content, .. } => content.as_str(),
            _ => "",
        }
    }

    pub fn is_block(&self) -> bool {
        matches!(self.data, NodeData::Root | NodeData::Paragraph | NodeData::Heading { .. })
    }

    pub fn is_inline(&self) -> bool {
        matches!(self.data, NodeData::Text { .. })
    }
}

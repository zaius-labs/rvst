//! Internal diagram schema for RVST diagram rendering.
//!
//! This schema is D2-independent. D2 compiles INTO it. Manual JSON compiles INTO it.
//! Future AI-generated diagrams compile INTO it. D2 does not own the architecture.

use serde::{Deserialize, Serialize};

/// Root diagram definition — everything needed to render a diagram.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Diagram {
    /// Target canvas dimensions
    pub canvas: Canvas,
    /// All nodes in the diagram (flat list, grouping via parent field)
    pub nodes: Vec<Node>,
    /// Edges connecting nodes
    pub edges: Vec<Edge>,
    /// Visual theme
    #[serde(default)]
    pub theme: Theme,
    /// Optional title displayed above the diagram
    pub title: Option<String>,
}

/// Target canvas — the fixed dimensions we must fill.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Canvas {
    pub width: u32,
    pub height: u32,
    /// Padding inside the canvas edges (px)
    #[serde(default = "default_padding")]
    pub padding: u32,
}

fn default_padding() -> u32 {
    40
}

/// A node in the diagram — either a leaf or a group (has children).
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Node {
    pub id: String,
    pub label: String,
    /// Node kind — affects rendering style
    #[serde(default)]
    pub kind: NodeKind,
    /// Parent group ID (None = top-level)
    pub parent: Option<String>,
    /// Explicit fill color (hex). If None, assigned from theme cycle.
    pub fill: Option<String>,
    /// Priority for layout — higher priority nodes get more space.
    #[serde(default = "default_priority")]
    pub priority: u8,
    /// Optional description text (rendered below label, smaller font)
    #[serde(default)]
    pub description: Option<String>,
    /// Optional metadata key-value pairs (rendered as small muted text)
    #[serde(default)]
    pub metadata: Option<Vec<(String, String)>>,
    /// Optional image path or embedded data reference
    #[serde(default)]
    pub image: Option<String>,
}

fn default_priority() -> u8 {
    1
}

/// Node kind — determines rendering style.
#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq)]
#[serde(rename_all = "snake_case")]
pub enum NodeKind {
    #[default]
    Card,
    Group,
    Metric,
    Label,
}

/// An edge connecting two nodes.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Edge {
    pub from: String,
    pub to: String,
    pub label: Option<String>,
    #[serde(default)]
    pub style: EdgeStyle,
}

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "snake_case")]
pub enum EdgeStyle {
    #[default]
    Solid,
    Dashed,
    Dotted,
}

/// Visual theme — controls colors, fonts, spacing.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Theme {
    /// Post-it color cycle (hex values)
    #[serde(default = "default_colors")]
    pub colors: Vec<String>,
    /// Font family for labels
    #[serde(default = "default_font")]
    pub font: String,
    /// Minimum readable font size (px at output resolution)
    #[serde(default = "default_min_font")]
    pub min_font_px: f32,
    /// Target canvas fill percentage (0.0-1.0)
    #[serde(default = "default_canvas_fill")]
    pub target_canvas_fill: f32,
    /// Gap between nodes (px)
    #[serde(default = "default_gap")]
    pub gap: u32,
    /// Whether to render graph paper background
    #[serde(default = "default_true")]
    pub graph_paper: bool,
    /// Whether to use sketch/hand-drawn style
    #[serde(default)]
    pub sketch: bool,
}

fn default_colors() -> Vec<String> {
    vec![
        "#f5e642".into(), // yellow
        "#f47b5e".into(), // coral
        "#c9a8d4".into(), // lavender
        "#7ecbb5".into(), // teal
        "#f4a543".into(), // orange
        "#a8d86e".into(), // green
    ]
}
fn default_font() -> String {
    "SimpleMarker".into()
}
fn default_min_font() -> f32 {
    10.0
}
fn default_canvas_fill() -> f32 {
    0.6
}
fn default_gap() -> u32 {
    12
}
fn default_true() -> bool {
    true
}

impl Default for Theme {
    fn default() -> Self {
        Self {
            colors: default_colors(),
            font: default_font(),
            min_font_px: default_min_font(),
            target_canvas_fill: default_canvas_fill(),
            gap: default_gap(),
            graph_paper: true,
            sketch: false,
        }
    }
}

/// Readability score — output of the inspect pass.
#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct ReadabilityScore {
    /// Smallest rendered font size (px)
    pub min_font_px: f32,
    /// Percentage of canvas occupied by content (0.0-1.0)
    pub canvas_fill: f32,
    /// Number of nodes with content overflowing bounds
    pub overflow_count: u32,
    /// Number of labels that were truncated
    pub label_truncated: u32,
    /// GLAM: 1.0 = no crossings, 0.0 = maximum crossings
    #[serde(default)]
    pub crosslessness: f32,
    /// GLAM: coefficient of variation of edge lengths (lower = more uniform)
    #[serde(default)]
    pub edge_length_cv: f32,
    /// GLAM: minimum angle (degrees) between edges sharing a node
    #[serde(default)]
    pub min_angle: f32,
    /// Sprawlter: total area of non-incident node-edge overlap
    #[serde(default)]
    pub node_edge_overlap_area: f32,
    /// Raw crossing count
    #[serde(default)]
    pub crossing_count: u32,
}

/// Context for smart threshold evaluation.
pub struct ScoreContext {
    /// Number of leaf nodes (non-group) in the diagram
    pub leaf_count: usize,
    /// Whether the diagram has edges
    pub has_edges: bool,
    /// Target display width in CSS pixels (the viewport the image will be shown at).
    /// If None, uses render dimensions (no downscaling assumed).
    pub display_width: Option<u32>,
    /// Render width (the actual image dimensions)
    pub render_width: u32,
}

impl ReadabilityScore {
    /// Check if the score passes all thresholds.
    /// Uses fixed thresholds from theme. Delegates to passes_smart with default context.
    pub fn passes(&self, theme: &Theme) -> bool {
        self.passes_with_context(theme, false)
    }

    /// Context-aware scoring (legacy API — delegates to passes_smart).
    /// Diagrams with edges need less fill (space is for arrow routing).
    pub fn passes_with_context(&self, theme: &Theme, has_edges: bool) -> bool {
        let ctx = ScoreContext {
            leaf_count: 10, // assume many nodes for backwards compat (strict fill)
            has_edges,
            display_width: None,
            render_width: 1200,
        };
        self.passes_smart(theme, &ctx)
    }

    /// Smart context-aware scoring.
    pub fn passes_smart(&self, theme: &Theme, ctx: &ScoreContext) -> bool {
        // --- Fill threshold: scales with node count ---
        // 2 nodes can't fill a canvas. 12 nodes should.
        // Linear ramp: 20% at 2 nodes, 60% at 10+ nodes
        let base_fill = if ctx.has_edges {
            // Edge diagrams: routing channels need space
            0.15
        } else {
            let n = ctx.leaf_count.max(1) as f32;
            // Ramp from 20% (1-2 nodes) to 60% (10+ nodes)
            (0.20 + (n - 1.0).min(9.0) * 0.05).min(0.60)
        };

        // --- Font threshold: scales with display downscaling ---
        // If rendering at 1080px but displaying at 350px (mobile),
        // effective font = render_font * (350/1080) = render_font * 0.32
        // We need effective font >= 12px, so render font >= 12/0.32 = 37px
        let min_font = if let Some(display_w) = ctx.display_width {
            let scale_factor = display_w as f32 / ctx.render_width.max(1) as f32;
            // Minimum 12px at display size
            (12.0 / scale_factor).max(theme.min_font_px)
        } else {
            theme.min_font_px // No downscaling — use theme default (10px)
        };

        if self.min_font_px < min_font
            || self.canvas_fill < base_fill
            || self.overflow_count > 0
            || self.label_truncated > 0
        {
            return false;
        }

        // Composite penalty: hard fails for structural issues
        if self.crossing_count > 0 && self.crosslessness < 0.5 {
            return false; // Too many crossings relative to edge count
        }
        if self.node_edge_overlap_area > 50000.0 {
            return false; // Significant edge-through-node overlap (Sprawlter)
        }

        true
    }
}

/// Layout decision after scoring.
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum LayoutDecision {
    /// Score passed — render this layout
    Accept,
    /// Score failed — retry with adjusted parameters
    Retry { pass: u8, adjustment: String },
    /// All retries failed — split into multiple frames
    Split { frame_count: u32 },
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn schema_round_trips_json() {
        let diagram = Diagram {
            canvas: Canvas {
                width: 1200,
                height: 675,
                padding: 40,
            },
            nodes: vec![
                Node {
                    id: "canopy".into(),
                    label: "Canopy ML".into(),
                    kind: NodeKind::Group,
                    parent: None,
                    fill: None,
                    priority: 1,
                    description: None,
                    metadata: None,
                    image: None,
                },
                Node {
                    id: "intent".into(),
                    label: "Intent".into(),
                    kind: NodeKind::Card,
                    parent: Some("canopy".into()),
                    fill: Some("#f5e642".into()),
                    priority: 1,
                    description: None,
                    metadata: None,
                    image: None,
                },
            ],
            edges: vec![Edge {
                from: "intent".into(),
                to: "canopy".into(),
                label: Some("signal".into()),
                style: EdgeStyle::Solid,
            }],
            theme: Theme::default(),
            title: Some("Zaius Architecture".into()),
        };

        let json = serde_json::to_string_pretty(&diagram).unwrap();
        let parsed: Diagram = serde_json::from_str(&json).unwrap();
        assert_eq!(parsed.nodes.len(), 2);
        assert_eq!(parsed.edges.len(), 1);
        assert_eq!(parsed.canvas.width, 1200);
    }

    #[test]
    fn score_passes_with_good_values() {
        let theme = Theme::default();
        let score = ReadabilityScore {
            min_font_px: 14.0,
            canvas_fill: 0.72,
            overflow_count: 0,
            label_truncated: 0,
            ..Default::default()
        };
        assert!(score.passes(&theme));
    }

    #[test]
    fn score_fails_with_small_font() {
        let theme = Theme::default();
        let score = ReadabilityScore {
            min_font_px: 8.0,
            canvas_fill: 0.72,
            overflow_count: 0,
            label_truncated: 0,
            ..Default::default()
        };
        assert!(!score.passes(&theme));
    }

    #[test]
    fn score_fails_with_low_fill() {
        let theme = Theme::default();
        let score = ReadabilityScore {
            min_font_px: 14.0,
            canvas_fill: 0.3,
            overflow_count: 0,
            label_truncated: 0,
            ..Default::default()
        };
        assert!(!score.passes(&theme));
    }

    #[test]
    fn score_fails_with_low_fill_many_nodes() {
        let theme = Theme::default();
        let score = ReadabilityScore {
            min_font_px: 14.0,
            canvas_fill: 0.3,
            overflow_count: 0,
            label_truncated: 0,
            ..Default::default()
        };
        let ctx = ScoreContext {
            leaf_count: 10,
            has_edges: false,
            display_width: None,
            render_width: 1200,
        };
        assert!(!score.passes_smart(&theme, &ctx)); // 30% < 60% for 10 nodes
    }

    #[test]
    fn score_passes_with_low_fill_few_nodes() {
        let theme = Theme::default();
        let score = ReadabilityScore {
            min_font_px: 14.0,
            canvas_fill: 0.3,
            overflow_count: 0,
            label_truncated: 0,
            ..Default::default()
        };
        let ctx = ScoreContext {
            leaf_count: 2,
            has_edges: false,
            display_width: None,
            render_width: 1200,
        };
        assert!(score.passes_smart(&theme, &ctx)); // 30% >= 25% for 2 nodes
    }

    #[test]
    fn font_threshold_scales_with_display_size() {
        let theme = Theme::default();
        let score = ReadabilityScore {
            min_font_px: 18.0,
            canvas_fill: 0.5,
            overflow_count: 0,
            label_truncated: 0,
            ..Default::default()
        };
        // Rendering at 1080, displaying at 350 (mobile)
        // effective font = 18 * (350/1080) = 5.8px — below 12px threshold
        let ctx = ScoreContext {
            leaf_count: 5,
            has_edges: false,
            display_width: Some(350),
            render_width: 1080,
        };
        assert!(!score.passes_smart(&theme, &ctx)); // 18px at render but only 5.8px at display
    }

    #[test]
    fn default_theme_has_six_colors() {
        let theme = Theme::default();
        assert_eq!(theme.colors.len(), 6);
    }
}

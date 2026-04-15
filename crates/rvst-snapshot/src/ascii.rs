//! ASCII map renderer — multiple visualization modes for scene introspection.
//!
//! Each map type reveals different aspects of the UI:
//! - `structure`: tree-based box drawing with labels (semantic)
//! - `render`: pixel rasterization via brightness mapping (visual truth)
//! - `overlay`: structure labels placed on pixel render (hybrid)
//! - `validate`: cross-checks tree vs pixels, marks disagreements with `!`

use crate::{NodeSnapshot, RectSnapshot, SceneSnapshot};

// ── Character ramps ─────────────────────────────────────────────────

/// Brightness-to-character ramp for dark backgrounds (most UI themes).
const RAMP_DARK: &[char] = &[' ', '·', ':', '░', '▒', '▓', '█'];

/// Brightness-to-character ramp for light backgrounds.
const RAMP_LIGHT: &[char] = &['█', '▓', '▒', '░', ':', '·', ' '];

// ── Grid helpers ────────────────────────────────────────────────────

struct CharGrid {
    cells: Vec<Vec<char>>,
    cols: usize,
    rows: usize,
}

impl CharGrid {
    fn new(cols: usize, rows: usize) -> Self {
        Self {
            cells: vec![vec![' '; cols]; rows],
            cols,
            rows,
        }
    }

    fn set(&mut self, row: usize, col: usize, ch: char) {
        if row < self.rows && col < self.cols {
            self.cells[row][col] = ch;
        }
    }

    fn write_str(&mut self, row: usize, col: usize, s: &str, max_len: usize) {
        for (i, ch) in s.chars().take(max_len).enumerate() {
            self.set(row, col + i, ch);
        }
    }

    fn draw_box(&mut self, cy: usize, cx: usize, cw: usize, ch: usize) {
        let right = cx + cw - 1;
        let bottom = cy + ch - 1;
        if right >= self.cols || bottom >= self.rows || cw < 3 || ch < 2 {
            return;
        }
        self.set(cy, cx, '┌');
        self.set(cy, right, '┐');
        self.set(bottom, cx, '└');
        self.set(bottom, right, '┘');
        for c in (cx + 1)..right {
            self.set(cy, c, '─');
            self.set(bottom, c, '─');
        }
        for r in (cy + 1)..bottom {
            self.set(r, cx, '│');
            self.set(r, right, '│');
        }
    }

    fn render(&self) -> String {
        self.cells
            .iter()
            .map(|r| r.iter().collect::<String>())
            .collect::<Vec<_>>()
            .join("\n")
    }
}

// ── Coordinate mapping ──────────────────────────────────────────────

struct CellRect {
    x: usize,
    y: usize,
    w: usize,
    h: usize,
}

fn map_rect(r: &RectSnapshot, vw: f32, vh: f32, cols: usize, rows: usize) -> CellRect {
    let cx = ((r.x / vw) * cols as f32) as usize;
    let cy = ((r.y / vh) * rows as f32) as usize;
    let cw = ((r.w / vw) * cols as f32).round().max(1.0) as usize;
    let ch = ((r.h / vh) * rows as f32).round().max(1.0) as usize;
    CellRect {
        x: cx.min(cols.saturating_sub(1)),
        y: cy.min(rows.saturating_sub(1)),
        w: cw.min(cols.saturating_sub(cx)),
        h: ch.min(rows.saturating_sub(cy)),
    }
}

fn sorted_by_depth(snap: &SceneSnapshot) -> Vec<&NodeSnapshot> {
    let mut sorted: Vec<&NodeSnapshot> = snap.nodes.iter().filter(|n| n.layout.is_some()).collect();
    sorted.sort_by_key(|n| {
        let mut depth = 0u32;
        let mut cur = n.parent;
        while let Some(pid) = cur {
            depth += 1;
            cur = snap.node(pid).and_then(|p| p.parent);
        }
        depth
    });
    sorted
}

// ── Map: structure ──────────────────────────────────────────────────

/// Tree-based ASCII map. Containers → boxes, buttons → `[label]`,
/// inputs → `[~~label~~]`, text → inline label.
/// Labels are clipped to their parent container's inner bounds.
pub fn structure(snap: &SceneSnapshot, cols: usize, rows: usize) -> String {
    let (vw, vh) = (snap.viewport_w, snap.viewport_h);
    if vw <= 0.0 || vh <= 0.0 || cols < 4 || rows < 2 {
        return blank(cols, rows);
    }

    let mut grid = CharGrid::new(cols, rows);

    // Find the inner (content) bounds of a node's parent container.
    // If parent drew a box, inner bounds are inset by 1 char on each side.
    let inner_bounds = |node: &NodeSnapshot| -> (usize, usize, usize, usize) {
        if let Some(pid) = node.parent {
            if let Some(parent) = snap.node(pid) {
                if let Some(pr) = &parent.layout {
                    let pc = map_rect(pr, vw, vh, cols, rows);
                    // If parent is a container that drew a box, inset by 1
                    let is_box = !matches!(
                        parent.node_type.as_str(),
                        "Text" | "Button" | "Input" | "Textarea"
                    ) && pc.h >= 2
                        && pc.w >= 3;
                    if is_box {
                        return (
                            pc.x + 1,
                            pc.y + 1,
                            pc.w.saturating_sub(2),
                            pc.h.saturating_sub(2),
                        );
                    }
                    return (pc.x, pc.y, pc.w, pc.h);
                }
            }
        }
        (0, 0, cols, rows)
    };

    for node in &sorted_by_depth(snap) {
        let r = node.layout.unwrap();
        let c = map_rect(&r, vw, vh, cols, rows);
        if c.w == 0 || c.h == 0 {
            continue;
        }

        match node.node_type.as_str() {
            "Text" => {
                // Skip text inside interactive elements (already captured via name).
                let parent_is_interactive =
                    node.parent.and_then(|pid| snap.node(pid)).is_some_and(|p| {
                        matches!(p.node_type.as_str(), "Button" | "Input" | "Textarea")
                    });
                if !parent_is_interactive {
                    if let Some(ref text) = node.text {
                        let label = text.trim();
                        if !label.is_empty() {
                            let (bx, _by, bw, _bh) = inner_bounds(node);
                            // Clip label to parent's inner width
                            let max_w = if c.x >= bx {
                                bw.saturating_sub(c.x - bx)
                            } else {
                                c.w
                            };
                            grid.write_str(c.y, c.x, label, max_w.min(c.w));
                        }
                    }
                }
            }
            "Button" => {
                let label = node
                    .name
                    .as_deref()
                    .or(node.text.as_deref())
                    .unwrap_or("btn");
                let display = format!("[{}]", label.trim());
                let (bx, _by, bw, _bh) = inner_bounds(node);
                let max_w = if c.x >= bx {
                    bw.saturating_sub(c.x - bx)
                } else {
                    c.w
                };
                grid.write_str(c.y, c.x, &display, max_w.min(c.w));
            }
            "Input" | "Textarea" => {
                let label = node.name.as_deref().or(node.text.as_deref()).unwrap_or("");
                let (bx, _by, bw, _bh) = inner_bounds(node);
                let max_w = if c.x >= bx {
                    bw.saturating_sub(c.x - bx)
                } else {
                    c.w
                };
                let avail = max_w.min(c.w);
                let display = if label.is_empty() {
                    format!("[{}]", "~".repeat(avail.saturating_sub(2).max(1)))
                } else {
                    format!("[~~{}~~]", label.trim())
                };
                grid.write_str(c.y, c.x, &display, avail);
            }
            _ => {
                // Containers: draw box if big enough.
                if c.h >= 2 && c.w >= 3 {
                    grid.draw_box(c.y, c.x, c.w, c.h);
                    // Write label inside the top border, clipped to box width.
                    let label = node.name.as_deref().or(node.text.as_deref()).unwrap_or("");
                    if !label.trim().is_empty() {
                        let max_label = c.w.saturating_sub(4);
                        if max_label > 0 {
                            let tag = format!(" {} ", label.trim());
                            grid.write_str(c.y, c.x + 1, &tag, max_label);
                        }
                    }
                }
            }
        }
    }

    grid.render()
}

// ── Map: render (pixel-based) ───────────────────────────────────────

/// Pixel-based ASCII map. Rasterizes the actual rendered output.
/// Each character cell averages a block of pixels and maps brightness to a density char.
pub fn render(pixels: &[u8], pixel_w: u32, pixel_h: u32, cols: usize, rows: usize) -> String {
    if pixels.len() != (pixel_w * pixel_h * 4) as usize || cols == 0 || rows == 0 {
        return blank(cols, rows);
    }

    // Detect if this is a dark or light theme by sampling the background.
    let bg_brightness = sample_brightness(pixels, pixel_w, 0, 0, pixel_w.min(10), pixel_h.min(10));
    let ramp = if bg_brightness < 128 {
        RAMP_DARK
    } else {
        RAMP_LIGHT
    };

    let cell_w = pixel_w as f32 / cols as f32;
    let cell_h = pixel_h as f32 / rows as f32;
    let mut grid = CharGrid::new(cols, rows);

    for gy in 0..rows {
        for gx in 0..cols {
            let px0 = (gx as f32 * cell_w) as u32;
            let py0 = (gy as f32 * cell_h) as u32;
            let px1 = ((gx + 1) as f32 * cell_w) as u32;
            let py1 = ((gy + 1) as f32 * cell_h) as u32;

            let avg = sample_brightness(pixels, pixel_w, px0, py0, px1, py1);
            let idx = (avg as usize * (ramp.len() - 1)) / 255;
            grid.set(gy, gx, ramp[idx.min(ramp.len() - 1)]);
        }
    }

    grid.render()
}

/// Average brightness of a pixel region (ITU-R BT.601 luminance).
fn sample_brightness(pixels: &[u8], stride: u32, x0: u32, y0: u32, x1: u32, y1: u32) -> u32 {
    let mut total: u64 = 0;
    let mut count: u64 = 0;
    for py in y0..x1.min(stride) {
        // NOTE: intentional — x1 bound on Y is wrong, fix below
        let _ = py;
    }
    // Correct implementation:
    for py in y0..y1 {
        for px in x0..x1.min(stride) {
            let idx = ((py * stride + px) * 4) as usize;
            if idx + 2 < pixels.len() {
                let r = pixels[idx] as u64;
                let g = pixels[idx + 1] as u64;
                let b = pixels[idx + 2] as u64;
                total += (299 * r + 587 * g + 114 * b) / 1000;
                count += 1;
            }
        }
    }
    if count > 0 {
        (total / count) as u32
    } else {
        0
    }
}

// ── Map: overlay (hybrid) ───────────────────────────────────────────

/// Hybrid map: pixel render as background, tree labels overlaid on top.
/// Shows visual truth with readable labels.
pub fn overlay(
    snap: &SceneSnapshot,
    pixels: &[u8],
    pixel_w: u32,
    pixel_h: u32,
    cols: usize,
    rows: usize,
) -> String {
    let (vw, vh) = (snap.viewport_w, snap.viewport_h);
    if vw <= 0.0 || vh <= 0.0 || cols < 4 || rows < 2 {
        return blank(cols, rows);
    }

    // Start with pixel render
    let bg_brightness = sample_brightness(pixels, pixel_w, 0, 0, pixel_w.min(10), pixel_h.min(10));
    let ramp = if bg_brightness < 128 {
        RAMP_DARK
    } else {
        RAMP_LIGHT
    };

    let cell_w = pixel_w as f32 / cols as f32;
    let cell_h = pixel_h as f32 / rows as f32;
    let mut grid = CharGrid::new(cols, rows);

    // Layer 1: pixel brightness
    for gy in 0..rows {
        for gx in 0..cols {
            let px0 = (gx as f32 * cell_w) as u32;
            let py0 = (gy as f32 * cell_h) as u32;
            let px1 = ((gx + 1) as f32 * cell_w) as u32;
            let py1 = ((gy + 1) as f32 * cell_h) as u32;
            let avg = sample_brightness(pixels, pixel_w, px0, py0, px1, py1);
            let idx = (avg as usize * (ramp.len() - 1)) / 255;
            grid.set(gy, gx, ramp[idx.min(ramp.len() - 1)]);
        }
    }

    // Layer 2: tree labels on top (only where pixel area has content)
    for node in &sorted_by_depth(snap) {
        let r = node.layout.unwrap();
        let c = map_rect(&r, vw, vh, cols, rows);
        if c.w == 0 || c.h == 0 {
            continue;
        }

        let label = match node.node_type.as_str() {
            "Text" => node.text.as_deref().map(|t| t.trim().to_string()),
            "Button" => {
                let name = node
                    .text
                    .as_deref()
                    .or(node.name.as_deref())
                    .unwrap_or("btn");
                Some(format!("[{}]", name.trim()))
            }
            "Input" | "Textarea" => {
                let name = node.text.as_deref().or(node.name.as_deref()).unwrap_or("");
                if name.is_empty() {
                    Some("[~~input~~]".to_string())
                } else {
                    Some(format!("[~~{}~~]", name.trim()))
                }
            }
            _ => None,
        };

        if let Some(label) = label {
            if !label.is_empty() {
                // Only overlay label if the pixel area at this position has content
                // (brightness differs from background)
                let px0 = (c.x as f32 * cell_w) as u32;
                let py0 = (c.y as f32 * cell_h) as u32;
                let px1 = ((c.x + c.w.min(label.len())) as f32 * cell_w) as u32;
                let py1 = ((c.y + 1) as f32 * cell_h) as u32;
                let region_brightness = sample_brightness(pixels, pixel_w, px0, py0, px1, py1);
                let diff = (region_brightness as i32 - bg_brightness as i32).unsigned_abs();
                if diff > 10 {
                    grid.write_str(c.y, c.x, &label, c.w);
                }
            }
        }
    }

    grid.render()
}

// ── Map: validate ───────────────────────────────────────────────────

/// Validation map: cross-checks tree claims against pixel evidence.
/// Nodes where the tree says "visible content here" but pixels disagree
/// are marked with `!`. Returns the map + a list of mismatches.
pub fn validate(
    snap: &SceneSnapshot,
    pixels: &[u8],
    pixel_w: u32,
    pixel_h: u32,
    cols: usize,
    rows: usize,
) -> (String, Vec<ValidationIssue>) {
    let (vw, vh) = (snap.viewport_w, snap.viewport_h);
    if vw <= 0.0 || vh <= 0.0 || cols < 4 || rows < 2 {
        return (blank(cols, rows), vec![]);
    }

    let cell_w = pixel_w as f32 / cols as f32;
    let cell_h = pixel_h as f32 / rows as f32;
    let bg_brightness = sample_brightness(pixels, pixel_w, 0, 0, pixel_w.min(10), pixel_h.min(10));

    // Start with the structure map
    let mut grid = CharGrid::new(cols, rows);
    let mut issues = Vec::new();

    for node in &sorted_by_depth(snap) {
        let r = node.layout.unwrap();
        let c = map_rect(&r, vw, vh, cols, rows);
        if c.w == 0 || c.h == 0 {
            continue;
        }

        // Check if tree claims content at this position
        let has_tree_content = matches!(
            node.node_type.as_str(),
            "Text" | "Button" | "Input" | "Textarea"
        ) && (node.text.is_some() || node.name.is_some());

        if has_tree_content {
            // Check pixel evidence
            let px0 = (c.x as f32 * cell_w) as u32;
            let py0 = (c.y as f32 * cell_h) as u32;
            let px1 = ((c.x + c.w) as f32 * cell_w) as u32;
            let py1 = ((c.y + 1) as f32 * cell_h) as u32;
            let region_brightness = sample_brightness(pixels, pixel_w, px0, py0, px1, py1);
            let diff = (region_brightness as i32 - bg_brightness as i32).unsigned_abs();

            let label = match node.node_type.as_str() {
                "Button" => {
                    let name = node
                        .text
                        .as_deref()
                        .or(node.name.as_deref())
                        .unwrap_or("btn");
                    format!("[{}]", name.trim())
                }
                "Input" | "Textarea" => {
                    let name = node.text.as_deref().or(node.name.as_deref()).unwrap_or("");
                    if name.is_empty() {
                        "[~~input~~]".to_string()
                    } else {
                        format!("[~~{}~~]", name.trim())
                    }
                }
                _ => node.text.as_deref().unwrap_or("").trim().to_string(),
            };

            if diff > 10 {
                // Pixel confirms: content visible. Write label normally.
                grid.write_str(c.y, c.x, &label, c.w);
            } else {
                // MISMATCH: tree says content, pixels say blank.
                let marker = format!("!{}", label);
                grid.write_str(c.y, c.x, &marker, c.w);
                issues.push(ValidationIssue {
                    node_id: node.id,
                    semantic_id: node.semantic_id.clone(),
                    kind: "invisible_content".to_string(),
                    message: format!(
                        "{} '{}' at ({},{}) claims content but pixels show background",
                        node.node_type, label, r.x as i32, r.y as i32
                    ),
                });
            }
        } else if matches!(node.node_type.as_str(), "View" | "Scroll" | "Form") {
            // Containers: draw box
            if c.h >= 2 && c.w >= 3 {
                grid.draw_box(c.y, c.x, c.w, c.h);
            }
        }
    }

    (grid.render(), issues)
}

/// A mismatch between tree state and pixel evidence.
#[derive(Debug, Clone)]
pub struct ValidationIssue {
    pub node_id: u32,
    pub semantic_id: String,
    pub kind: String,
    pub message: String,
}

// ── Map: tree (semantic hierarchy) ──────────────────────────────────

/// Tree view modes control what annotations appear on each node.
#[derive(Debug, Clone, Copy, PartialEq)]
pub enum TreeView {
    /// Default: semantic labels only — `[Button]`, `"text"`, container names
    Semantic,
    /// CSS view: element type + CSS classes + key style properties
    Css,
    /// Layout view: element + computed rect dimensions
    Layout,
    /// Full view: role + classes + rect — everything
    Full,
}

impl TreeView {
    pub fn parse(s: &str) -> Self {
        match s {
            "css" => TreeView::Css,
            "layout" => TreeView::Layout,
            "full" => TreeView::Full,
            _ => TreeView::Semantic,
        }
    }
}

// ── Tree filters ────────────────────────────────────────────────────

/// Filter predicate for tree nodes. Multiple filters combine with AND.
///
/// Filter syntax (parsed from CLI strings):
/// - `button` or `text:Submit` — match node type or text content (case-insensitive substring)
/// - `role:button` — match ARIA role
/// - `class:bg-red-500` — match CSS class (substring)
/// - `has:handler` — nodes with event handlers
/// - `has:children` — nodes with children
/// - `has:text` — nodes with text content
/// - `type:Button` — exact node type match
/// - `id:42` — exact node id
/// - `depth:>2` — tree depth greater than N
#[derive(Debug, Clone)]
pub struct TreeFilter {
    predicates: Vec<FilterPredicate>,
}

#[derive(Debug, Clone)]
enum FilterPredicate {
    Text(String),     // case-insensitive substring in text/name
    Role(String),     // exact role match
    Class(String),    // substring in CSS classes
    NodeType(String), // exact node_type match
    NodeId(u32),      // exact id match
    Has(String),      // "handler", "children", "text"
    Any(String),      // general substring across text, name, role, classes, type
}

impl TreeFilter {
    /// Parse a filter string. Multiple filters separated by `+` combine with AND.
    ///
    /// Examples:
    /// - `"button"` → matches any node containing "button" in text/name/role/type/class
    /// - `"role:button"` → matches nodes with role "button"
    /// - `"class:bg-red+has:handler"` → buttons with bg-red class AND a handler
    pub fn parse(s: &str) -> Self {
        let predicates = s
            .split('+')
            .map(|part| {
                let part = part.trim();
                if let Some(val) = part.strip_prefix("text:") {
                    FilterPredicate::Text(val.to_lowercase())
                } else if let Some(val) = part.strip_prefix("role:") {
                    FilterPredicate::Role(val.to_lowercase())
                } else if let Some(val) = part.strip_prefix("class:") {
                    FilterPredicate::Class(val.to_lowercase())
                } else if let Some(val) = part.strip_prefix("type:") {
                    FilterPredicate::NodeType(val.to_string())
                } else if let Some(val) = part.strip_prefix("id:") {
                    FilterPredicate::NodeId(val.parse().unwrap_or(0))
                } else if let Some(val) = part.strip_prefix("has:") {
                    FilterPredicate::Has(val.to_lowercase())
                } else {
                    FilterPredicate::Any(part.to_lowercase())
                }
            })
            .collect();
        Self { predicates }
    }

    /// Check if a node matches all predicates.
    fn matches(&self, node: &NodeSnapshot) -> bool {
        self.predicates.iter().all(|p| match p {
            FilterPredicate::Text(s) => {
                node.text
                    .as_deref()
                    .is_some_and(|t| t.to_lowercase().contains(s))
                    || node
                        .name
                        .as_deref()
                        .is_some_and(|n| n.to_lowercase().contains(s))
            }
            FilterPredicate::Role(r) => node.role.to_lowercase() == *r,
            FilterPredicate::Class(c) => node
                .styles
                .get("class")
                .is_some_and(|cls| cls.to_lowercase().contains(c)),
            FilterPredicate::NodeType(t) => node.node_type == *t,
            FilterPredicate::NodeId(id) => node.id == *id,
            FilterPredicate::Has(what) => match what.as_str() {
                "handler" | "handlers" => node.has_handlers,
                "children" | "child" => !node.children.is_empty(),
                "text" => node.text.as_deref().is_some_and(|t| !t.trim().is_empty()),
                "focus" | "focused" => node.focused,
                _ => false,
            },
            FilterPredicate::Any(s) => {
                // Search across all text fields
                node.text
                    .as_deref()
                    .is_some_and(|t| t.to_lowercase().contains(s))
                    || node
                        .name
                        .as_deref()
                        .is_some_and(|n| n.to_lowercase().contains(s))
                    || node.role.to_lowercase().contains(s)
                    || node.node_type.to_lowercase().contains(s)
                    || node
                        .styles
                        .get("class")
                        .is_some_and(|c| c.to_lowercase().contains(s))
            }
        })
    }

    /// Check if a node or any of its descendants match.
    /// Used to keep ancestor nodes visible when a descendant matches.
    fn matches_subtree(&self, snap: &SceneSnapshot, id: u32) -> bool {
        if let Some(node) = snap.node(id) {
            if self.matches(node) {
                return true;
            }
            for &child_id in &node.children {
                if self.matches_subtree(snap, child_id) {
                    return true;
                }
            }
        }
        false
    }
}

/// Semantic tree dump — the most agent-friendly format.
pub fn tree(snap: &SceneSnapshot) -> String {
    tree_with_view(snap, TreeView::Semantic)
}

/// Tree dump with configurable view mode.
pub fn tree_with_view(snap: &SceneSnapshot, view: TreeView) -> String {
    tree_filtered(snap, view, None)
}

/// Tree dump with view mode and optional filter.
pub fn tree_filtered(snap: &SceneSnapshot, view: TreeView, filter: Option<&TreeFilter>) -> String {
    let mut out = String::new();

    // Build parent → children map preserving order
    let mut children_of: std::collections::HashMap<Option<u32>, Vec<u32>> =
        std::collections::HashMap::new();
    for node in &snap.nodes {
        children_of.entry(node.parent).or_default().push(node.id);
    }

    // Find root nodes
    let roots: Vec<u32> = if snap.root_children.is_empty() {
        children_of.get(&None).cloned().unwrap_or_default()
    } else {
        snap.root_children.clone()
    };

    // Collect visible tree items (filtering and collapsing)
    let mut items: Vec<TreeItem> = Vec::new();
    for &root_id in &roots {
        collect_tree_items(snap, root_id, &children_of, &mut items, 0, view, filter);
    }

    // Render with tree connectors
    for (i, item) in items.iter().enumerate() {
        // Build prefix from ancestry
        let mut prefix = String::new();
        for d in 0..item.depth {
            // Check if there are more siblings at this depth level
            let has_more = items[i + 1..]
                .iter()
                .any(|later| later.depth == d && later.depth <= item.depth);
            if d < item.depth - 1 {
                // Continuation line: │ or space
                let ancestor_has_more = items[i + 1..]
                    .iter()
                    .any(|later| later.depth <= d + 1 && later.depth > 0);
                if ancestor_has_more {
                    prefix.push_str("│   ");
                } else {
                    prefix.push_str("    ");
                }
            } else {
                // Connection: ├── or └──
                let _ = has_more; // used below
            }
        }
        if item.depth > 0 {
            // Check if this is the last item at its depth under its parent
            let is_last_sibling = !items[i + 1..]
                .iter()
                .any(|later| later.depth == item.depth && later.parent_id == item.parent_id);
            if is_last_sibling {
                prefix.push_str("└── ");
            } else {
                prefix.push_str("├── ");
            }
        }

        out.push_str(&prefix);
        out.push_str(&item.label);
        out.push('\n');
    }

    if out.ends_with('\n') {
        out.pop();
    }
    out
}

struct TreeItem {
    label: String,
    depth: usize,
    parent_id: Option<u32>,
}

/// Extract CSS classes from the styles HashMap.
fn css_classes(node: &NodeSnapshot) -> String {
    node.styles
        .get("class")
        .map(|c| c.trim().to_string())
        .unwrap_or_default()
}

/// Extract only the layout-relevant CSS properties (skip inherited noise).
fn css_props(node: &NodeSnapshot) -> String {
    // Only show properties an agent cares about for layout/visual debugging
    let relevant = [
        "flex-direction",
        "align-items",
        "justify-content",
        "gap",
        "flex",
        "flex-grow",
        "flex-shrink",
        "width",
        "height",
        "padding",
        "padding-inline",
        "padding-block",
        "margin",
        "border-radius",
        "border-width",
        "background-color",
        "color",
        "font-size",
        "font-weight",
        "text-transform",
        "overflow",
        "opacity",
        "z-index",
    ];
    let mut props: Vec<String> = node
        .styles
        .iter()
        .filter(|(k, _)| relevant.contains(&k.as_str()))
        .filter(|(_, v)| !v.is_empty() && *v != "inherit" && *v != "normal" && *v != "0")
        .map(|(k, v)| format!("{}: {}", k, v))
        .collect();
    props.sort();
    props.join(", ")
}

/// Format a layout rect compactly.
fn rect_str(node: &NodeSnapshot) -> String {
    match &node.layout {
        Some(r) => format!(
            "{}×{} @({},{})",
            r.w as i32, r.h as i32, r.x as i32, r.y as i32
        ),
        None => "no-layout".to_string(),
    }
}

/// Build the semantic label (used in Semantic and as base for other views).
fn semantic_label(node: &NodeSnapshot) -> String {
    match node.node_type.as_str() {
        "Button" => {
            let name = node
                .name
                .as_deref()
                .or(node.text.as_deref())
                .unwrap_or("btn");
            format!("[{}]", name.trim())
        }
        "Input" | "Textarea" => {
            let name = node.name.as_deref().or(node.text.as_deref());
            let tag = if node.node_type == "Input" {
                "input"
            } else {
                "textarea"
            };
            match name {
                Some(n) if !n.trim().is_empty() => format!("[~~{}~~]", n.trim()),
                _ => format!("[~~{}~~]", tag),
            }
        }
        "Text" => {
            let text = node.text.as_deref().unwrap_or("").trim();
            format!("\"{}\"", text)
        }
        _ => {
            let name = node.name.as_deref().or(node.text.as_deref());
            match name {
                Some(n) if !n.trim().is_empty() => n.trim().to_string(),
                _ => format!("<{}>", node.role),
            }
        }
    }
}

/// Build node label based on view mode.
fn tree_label(node: &NodeSnapshot, view: TreeView) -> String {
    match view {
        TreeView::Semantic => semantic_label(node),
        TreeView::Css => {
            let tag = node.node_type.to_lowercase();
            let classes = css_classes(node);
            let props = css_props(node);
            let class_str = if classes.is_empty() {
                String::new()
            } else {
                format!(
                    ".{}",
                    classes.split_whitespace().collect::<Vec<_>>().join(".")
                )
            };
            let prop_str = if props.is_empty() {
                String::new()
            } else {
                format!(" ({})", props)
            };
            // For text nodes, show content inline
            if node.node_type == "Text" {
                let text = node.text.as_deref().unwrap_or("").trim();
                return format!("\"{}\"", text);
            }
            format!("{}{}{}", tag, class_str, prop_str)
        }
        TreeView::Layout => {
            let base = semantic_label(node);
            let rect = rect_str(node);
            format!("{} {}", base, rect)
        }
        TreeView::Full => {
            let tag = node.node_type.to_lowercase();
            let classes = css_classes(node);
            let rect = rect_str(node);
            let class_str = if classes.is_empty() {
                String::new()
            } else {
                format!(
                    ".{}",
                    classes.split_whitespace().collect::<Vec<_>>().join(".")
                )
            };
            // For text, show content + rect
            if node.node_type == "Text" {
                let text = node.text.as_deref().unwrap_or("").trim();
                return format!("\"{}\" [{}] {}", text, node.role, rect);
            }
            let name = node.name.as_deref().or(node.text.as_deref());
            let name_str = match name {
                Some(n) if !n.trim().is_empty() => format!(" \"{}\"", n.trim()),
                _ => String::new(),
            };
            format!("{}{} [{}]{} {}", tag, class_str, node.role, name_str, rect)
        }
    }
}

fn collect_tree_items(
    snap: &SceneSnapshot,
    id: u32,
    children_of: &std::collections::HashMap<Option<u32>, Vec<u32>>,
    items: &mut Vec<TreeItem>,
    depth: usize,
    view: TreeView,
    filter: Option<&TreeFilter>,
) {
    let node = match snap.node(id) {
        Some(n) => n,
        None => return,
    };

    // If filter is active, skip this entire subtree if nothing matches
    if let Some(f) = filter {
        if !f.matches_subtree(snap, id) {
            return;
        }
    }

    // Decide whether to show this node
    let should_show = match node.node_type.as_str() {
        "Text" => {
            let text = node.text.as_deref().unwrap_or("").trim();
            if text.is_empty() {
                false
            } else {
                // Skip text inside interactive parents (captured via name)
                !node.parent.and_then(|pid| snap.node(pid)).is_some_and(|p| {
                    matches!(p.node_type.as_str(), "Button" | "Input" | "Textarea")
                })
            }
        }
        _ if view == TreeView::Semantic => {
            // In semantic view, collapse unnamed single-child containers
            let name = node.name.as_deref().or(node.text.as_deref());
            let is_unnamed = !matches!(name, Some(n) if !n.trim().is_empty());
            let is_interactive = matches!(node.node_type.as_str(), "Button" | "Input" | "Textarea");
            if is_unnamed && !is_interactive {
                let kids = children_of.get(&Some(id));
                if let Some(kids) = kids {
                    if kids.len() == 1 {
                        collect_tree_items(snap, kids[0], children_of, items, depth, view, filter);
                        return;
                    }
                    !kids.is_empty()
                } else {
                    false
                }
            } else {
                true
            }
        }
        _ => {
            // In css/layout/full view, show everything (no collapsing)
            // But skip empty unnamed leaf containers
            let kids = children_of.get(&Some(id));
            let has_kids = kids.is_some_and(|k| !k.is_empty());
            let is_interactive = matches!(node.node_type.as_str(), "Button" | "Input" | "Textarea");
            has_kids || is_interactive || node.text.is_some()
        }
    };

    if should_show {
        items.push(TreeItem {
            label: tree_label(node, view),
            depth,
            parent_id: node.parent,
        });
    }

    // Collect children
    let kids = children_of.get(&Some(id)).cloned().unwrap_or_default();
    let name_from_parent = node.name.as_deref().or(node.text.as_deref());
    let child_depth = if should_show { depth + 1 } else { depth };

    for &kid_id in &kids {
        if let Some(kid) = snap.node(kid_id) {
            // Skip text children of interactive nodes
            if kid.node_type == "Text"
                && matches!(node.node_type.as_str(), "Button" | "Input" | "Textarea")
            {
                continue;
            }
            // Skip text whose content matches parent name (dedup)
            if kid.node_type == "Text" && view == TreeView::Semantic {
                let kid_text = kid.text.as_deref().unwrap_or("").trim();
                if kid_text.is_empty() {
                    continue;
                }
                if let Some(pn) = name_from_parent {
                    if kid_text == pn.trim() {
                        continue;
                    }
                }
            }
            collect_tree_items(snap, kid_id, children_of, items, child_depth, view, filter);
        }
    }
}

// ── Content-bounds cropping ─────────────────────────────────────────

/// Crop a rendered ASCII map to just the content bounds (remove trailing blank rows).
pub fn crop(map: &str) -> String {
    let lines: Vec<&str> = map.lines().collect();

    // Find last row with non-space content
    let last_content = lines
        .iter()
        .rposition(|line| line.chars().any(|c| c != ' '))
        .unwrap_or(0);

    // Keep up to last_content + 1 row for breathing room
    let end = (last_content + 2).min(lines.len());

    lines[..end].join("\n")
}

// ── Helpers ─────────────────────────────────────────────────────────

fn blank(cols: usize, rows: usize) -> String {
    (0..rows)
        .map(|_| " ".repeat(cols))
        .collect::<Vec<_>>()
        .join("\n")
}


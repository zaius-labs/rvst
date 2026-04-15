//! SceneSnapshot — serializable scene graph state for RenderQuery.
//!
//! Captures the full tree at a point in time: node types, text content,
//! layout rects, styles, visibility, focus, scroll offsets, parent/child
//! relationships. Designed for:
//! - `scene_diff(before, after)` — semantic UI diffs
//! - `why_not_visible(node)` — visibility diagnosis
//! - `hit_test_stack(x, y)` — full candidate chain
//! - JSON export for agent/CI consumption

use rvst_tree::Tree;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;

/// A snapshot of a single node's state.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct NodeSnapshot {
    pub id: u32,
    pub node_type: String,
    pub text: Option<String>,
    pub parent: Option<u32>,
    pub children: Vec<u32>,
    pub styles: HashMap<String, String>,
    pub layout: Option<RectSnapshot>,
    pub scroll_y: f32,
    pub focused: bool,
    /// Whether this node has any registered event handlers.
    pub has_handlers: bool,
    /// Stable semantic ID: hash of role + normalized text + ancestry path.
    pub semantic_id: String,
    /// ARIA role derived from node type and context.
    pub role: String,
    /// Accessible name (text content or concatenated child text).
    pub name: Option<String>,
}

/// Layout rect snapshot.
#[derive(Debug, Clone, Copy, Serialize, Deserialize, PartialEq)]
pub struct RectSnapshot {
    pub x: f32,
    pub y: f32,
    pub w: f32,
    pub h: f32,
}

/// An entry in the hit-test result stack.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct HitTestEntry {
    pub id: u32,
    pub node_type: String,
    /// Tree depth (0 = root child, higher = deeper/frontmost).
    pub depth: u32,
    /// Whether this node has registered event handlers.
    pub has_handlers: bool,
    /// Whether pointer-events: none is set (node is "transparent" to clicks).
    pub pointer_events_none: bool,
    /// Layout rect of this node.
    pub rect: RectSnapshot,
}

/// A diagnostic issue detected in the scene snapshot.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SnapshotDiagnostic {
    /// "error", "warning", or "info"
    pub severity: String,
    /// Issue type: "zero_size", "offscreen", "overlap", "no_handler"
    pub kind: String,
    /// Human-readable description
    pub message: String,
    /// Node IDs involved
    pub node_ids: Vec<u32>,
    /// Evidence strings for agent consumption
    pub evidence: Vec<String>,
}

/// A complete snapshot of the scene graph at one point in time.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SceneSnapshot {
    pub nodes: Vec<NodeSnapshot>,
    pub root_children: Vec<u32>,
    pub focused_id: Option<u32>,
    pub node_count: usize,
    pub viewport_w: f32,
    pub viewport_h: f32,
    /// Auto-detected UI issues.
    pub diagnostics: Vec<SnapshotDiagnostic>,
}

/// Compute a deterministic semantic ID from role, name, and ancestry.
fn compute_semantic_id(
    role: &str,
    name: Option<&str>,
    node: &rvst_tree::Node,
    tree: &Tree,
) -> String {
    use std::collections::hash_map::DefaultHasher;
    use std::hash::{Hash, Hasher};
    let mut hasher = DefaultHasher::new();
    role.hash(&mut hasher);
    if let Some(n) = name {
        n.trim().to_lowercase().hash(&mut hasher);
    }
    // Hash ancestor types (max 4 levels) for disambiguation
    let mut cur = node.parent;
    for _ in 0..4 {
        if let Some(pid) = cur {
            if let Some(p) = tree.nodes.get(&pid) {
                format!("{:?}", p.node_type).hash(&mut hasher);
                cur = p.parent;
            } else {
                break;
            }
        } else {
            break;
        }
    }
    format!("n_{:x}", hasher.finish() & 0xFFFFFFFF)
}

impl SceneSnapshot {
    /// Build a snapshot from the current tree state.
    pub fn from_tree(tree: &Tree, viewport_w: f32, viewport_h: f32) -> Self {
        let focused_id = tree.focused.map(|id| id.0);

        let mut nodes: Vec<NodeSnapshot> = tree
            .nodes
            .values()
            .map(|node| {
                let has_handlers = tree.handlers.iter().any(|(nid, _, _)| *nid == node.id);
                let node_type_str = format!("{:?}", node.node_type);

                // Compute ARIA role from node type
                let role = match node_type_str.as_str() {
                    "Button" => "button".to_string(),
                    "Input" | "Textarea" => "textbox".to_string(),
                    "Scroll" => "region".to_string(),
                    "Form" => "form".to_string(),
                    "View" => node
                        .styles
                        .get("role")
                        .cloned()
                        .unwrap_or_else(|| "group".to_string()),
                    "Text" => "text".to_string(),
                    _ => "generic".to_string(),
                };

                // Compute accessible name
                let name = if let Some(ref text) = node.text {
                    if !text.trim().is_empty() {
                        Some(text.clone())
                    } else {
                        None
                    }
                } else {
                    let child_text: String = node
                        .children
                        .iter()
                        .filter_map(|cid| tree.nodes.get(cid))
                        .filter_map(|c| c.text.as_ref())
                        .filter(|t| !t.trim().is_empty())
                        .cloned()
                        .collect::<Vec<_>>()
                        .join(" ");
                    if child_text.is_empty() {
                        None
                    } else {
                        Some(child_text)
                    }
                };

                let semantic_id = compute_semantic_id(&role, name.as_deref(), node, tree);

                NodeSnapshot {
                    id: node.id.0,
                    node_type: node_type_str,
                    text: node.text.clone(),
                    parent: node.parent.map(|p| p.0),
                    children: node.children.iter().map(|c| c.0).collect(),
                    styles: node.styles.clone(),
                    layout: node.layout.map(|r| RectSnapshot {
                        x: r.x,
                        y: r.y,
                        w: r.w,
                        h: r.h,
                    }),
                    scroll_y: node.scroll_y,
                    focused: tree.focused == Some(node.id),
                    has_handlers,
                    semantic_id,
                    role,
                    name,
                }
            })
            .collect();

        // Sort by id for deterministic output
        nodes.sort_by_key(|n| n.id);

        let mut snap = SceneSnapshot {
            node_count: nodes.len(),
            root_children: tree.root_children.iter().map(|id| id.0).collect(),
            focused_id,
            nodes,
            viewport_w,
            viewport_h,
            diagnostics: vec![],
        };
        snap.diagnostics = snap.diagnose();
        snap
    }

    /// Serialize to JSON string.
    pub fn to_json(&self) -> String {
        serde_json::to_string_pretty(self).unwrap_or_default()
    }

    /// Serialize to compact JSON string.
    pub fn to_json_compact(&self) -> String {
        serde_json::to_string(self).unwrap_or_default()
    }

    /// Find a node by id.
    pub fn node(&self, id: u32) -> Option<&NodeSnapshot> {
        self.nodes.iter().find(|n| n.id == id)
    }

    /// Find all nodes containing the given text.
    pub fn find_text(&self, text: &str) -> Vec<&NodeSnapshot> {
        self.nodes
            .iter()
            .filter(|n| n.text.as_ref().map(|t| t.contains(text)).unwrap_or(false))
            .collect()
    }

    /// Find all nodes at a given point (whose layout rect contains the point).
    pub fn nodes_at(&self, x: f32, y: f32) -> Vec<&NodeSnapshot> {
        self.nodes
            .iter()
            .filter(|n| {
                if let Some(r) = &n.layout {
                    x >= r.x && x < r.x + r.w && y >= r.y && y < r.y + r.h
                } else {
                    false
                }
            })
            .collect()
    }

    /// Full hit-test stack at (x, y): all nodes whose layout contains the point,
    /// ordered by tree depth (deepest/frontmost first). Each entry includes
    /// whether the node is interactive (has handlers) and its pointer-events status.
    pub fn hit_test_stack(&self, x: f32, y: f32) -> Vec<HitTestEntry> {
        let mut entries: Vec<HitTestEntry> = self
            .nodes
            .iter()
            .filter_map(|n| {
                let r = n.layout.as_ref()?;
                if x >= r.x && x < r.x + r.w && y >= r.y && y < r.y + r.h {
                    let pointer_events_none = n
                        .styles
                        .get("pointer-events")
                        .map(|s| s == "none")
                        .unwrap_or(false);
                    let depth = self.node_depth(n.id);
                    Some(HitTestEntry {
                        id: n.id,
                        node_type: n.node_type.clone(),
                        depth,
                        has_handlers: n.has_handlers,
                        pointer_events_none,
                        rect: *r,
                    })
                } else {
                    None
                }
            })
            .collect();
        // Sort deepest first (frontmost in paint order)
        entries.sort_by(|a, b| b.depth.cmp(&a.depth));
        entries
    }

    /// Compute tree depth of a node (0 = root child).
    fn node_depth(&self, id: u32) -> u32 {
        let mut depth = 0;
        let mut current = id;
        while let Some(node) = self.nodes.iter().find(|n| n.id == current) {
            if let Some(parent) = node.parent {
                depth += 1;
                current = parent;
            } else {
                break;
            }
        }
        depth
    }

    /// Get all visible nodes (have non-zero layout rect).
    pub fn visible_nodes(&self) -> Vec<&NodeSnapshot> {
        self.nodes
            .iter()
            .filter(|n| n.layout.map(|r| r.w > 0.0 && r.h > 0.0).unwrap_or(false))
            .collect()
    }

    // -----------------------------------------------------------------------
    // SnapshotDiagnostic — auto-detect UI issues at snapshot time
    // -----------------------------------------------------------------------

    /// Run all diagnostic detectors and return any issues found.
    pub fn diagnose(&self) -> Vec<SnapshotDiagnostic> {
        let mut diags = Vec::new();

        // 1. Zero-size: node with layout w<=0 or h<=0 but has text or children
        for node in &self.nodes {
            if let Some(r) = &node.layout {
                if (r.w <= 0.0 || r.h <= 0.0) && (node.text.is_some() || !node.children.is_empty())
                {
                    diags.push(SnapshotDiagnostic {
                        severity: "warning".into(),
                        kind: "zero_size".into(),
                        message: format!(
                            "node {} ({}) has zero/negative size ({}x{}) but has content",
                            node.id, node.node_type, r.w, r.h
                        ),
                        node_ids: vec![node.id],
                        evidence: vec![format!("w={}, h={}", r.w, r.h)],
                    });
                }
            }
        }

        // 2. Offscreen: node rect entirely outside viewport
        for node in &self.nodes {
            if let Some(r) = &node.layout {
                if r.x + r.w < 0.0
                    || r.y + r.h < 0.0
                    || r.x > self.viewport_w
                    || r.y > self.viewport_h
                {
                    diags.push(SnapshotDiagnostic {
                        severity: "warning".into(),
                        kind: "offscreen".into(),
                        message: format!(
                            "node {} ({}) is entirely offscreen at ({},{} {}x{})",
                            node.id, node.node_type, r.x, r.y, r.w, r.h
                        ),
                        node_ids: vec![node.id],
                        evidence: vec![
                            format!("rect=({},{} {}x{})", r.x, r.y, r.w, r.h),
                            format!("viewport={}x{}", self.viewport_w, self.viewport_h),
                        ],
                    });
                }
            }
        }

        // 3. Overlap: sibling nodes (same parent, both non-Text, both with layout)
        //    whose rects overlap by more than 50% of the smaller rect's area.
        // Build parent → children map
        let mut parent_children: HashMap<u32, Vec<u32>> = HashMap::new();
        for node in &self.nodes {
            if let Some(pid) = node.parent {
                parent_children.entry(pid).or_default().push(node.id);
            }
        }
        for children in parent_children.values() {
            for i in 0..children.len() {
                for j in (i + 1)..children.len() {
                    let a = match self.node(children[i]) {
                        Some(n) => n,
                        None => continue,
                    };
                    let b = match self.node(children[j]) {
                        Some(n) => n,
                        None => continue,
                    };
                    // Skip Text nodes
                    if a.node_type == "Text" || b.node_type == "Text" {
                        continue;
                    }
                    let ar = match &a.layout {
                        Some(r) => r,
                        None => continue,
                    };
                    let br = match &b.layout {
                        Some(r) => r,
                        None => continue,
                    };
                    // Compute intersection
                    let ix0 = ar.x.max(br.x);
                    let iy0 = ar.y.max(br.y);
                    let ix1 = (ar.x + ar.w).min(br.x + br.w);
                    let iy1 = (ar.y + ar.h).min(br.y + br.h);
                    if ix1 > ix0 && iy1 > iy0 {
                        let overlap_area = (ix1 - ix0) * (iy1 - iy0);
                        let area_a = ar.w * ar.h;
                        let area_b = br.w * br.h;
                        let smaller = area_a.min(area_b);
                        if smaller > 0.0 && overlap_area > smaller * 0.5 {
                            diags.push(SnapshotDiagnostic {
                                severity: "warning".into(),
                                kind: "overlap".into(),
                                message: format!(
                                    "siblings {} ({}) and {} ({}) overlap by {:.0}% of smaller rect",
                                    a.id, a.node_type, b.id, b.node_type,
                                    (overlap_area / smaller) * 100.0
                                ),
                                node_ids: vec![a.id, b.id],
                                evidence: vec![
                                    format!("a=({},{} {}x{})", ar.x, ar.y, ar.w, ar.h),
                                    format!("b=({},{} {}x{})", br.x, br.y, br.w, br.h),
                                    format!("overlap_area={:.1}", overlap_area),
                                ],
                            });
                        }
                    }
                }
            }
        }

        // 4. No handler on interactive: Button without handlers
        for node in &self.nodes {
            if node.node_type == "Button" && !node.has_handlers {
                diags.push(SnapshotDiagnostic {
                    severity: "warning".into(),
                    kind: "no_handler".into(),
                    message: format!("button node {} has no event handlers", node.id),
                    node_ids: vec![node.id],
                    evidence: vec!["node_type=Button, has_handlers=false".into()],
                });
            }
        }

        diags
    }

    // -----------------------------------------------------------------------
    // RenderAssert — declarative UI invariant assertions
    // -----------------------------------------------------------------------

    /// Assert a node is visible. Returns Err with explanation if not.
    pub fn assert_visible(&self, id: u32) -> Result<(), String> {
        let verdict = self.why_not_visible(id);
        if verdict.visible {
            Ok(())
        } else {
            Err(format!("node {} is not visible: {:?}", id, verdict.reasons))
        }
    }

    /// Assert a node is clickable: visible, has non-zero rect, no pointer-events:none,
    /// and not occluded by a higher node with pointer-events at the same point.
    pub fn assert_clickable(&self, id: u32) -> Result<(), String> {
        self.assert_visible(id)?;
        let node = self.node(id).ok_or(format!("node {} not found", id))?;
        if node
            .styles
            .get("pointer-events")
            .map(|s| s == "none")
            .unwrap_or(false)
        {
            return Err(format!("node {} has pointer-events: none", id));
        }
        let r = node.layout.ok_or(format!("node {} has no layout", id))?;
        let cx = r.x + r.w / 2.0;
        let cy = r.y + r.h / 2.0;
        let stack = self.hit_test_stack(cx, cy);
        if let Some(top) = stack.first() {
            if top.id != id && !top.pointer_events_none {
                // Check if the top node is a child of our node (children are in front but don't occlude parent)
                let is_descendant = self.is_descendant(top.id, id);
                if !is_descendant {
                    return Err(format!(
                        "node {} is occluded at center by node {} ({})",
                        id, top.id, top.node_type
                    ));
                }
            }
        }
        Ok(())
    }

    /// Assert node A renders above node B (A is deeper or later in paint order at their overlap).
    pub fn assert_above(&self, above_id: u32, below_id: u32) -> Result<(), String> {
        let a = self
            .node(above_id)
            .ok_or(format!("node {} not found", above_id))?;
        let b = self
            .node(below_id)
            .ok_or(format!("node {} not found", below_id))?;
        let ar = a.layout.ok_or(format!("node {} has no layout", above_id))?;
        let br = b.layout.ok_or(format!("node {} has no layout", below_id))?;
        // Find overlap center
        let ox = (ar.x.max(br.x) + (ar.x + ar.w).min(br.x + br.w)) / 2.0;
        let oy = (ar.y.max(br.y) + (ar.y + ar.h).min(br.y + br.h)) / 2.0;
        let stack = self.hit_test_stack(ox, oy);
        let a_pos = stack.iter().position(|e| e.id == above_id);
        let b_pos = stack.iter().position(|e| e.id == below_id);
        match (a_pos, b_pos) {
            (Some(a_i), Some(b_i)) if a_i < b_i => Ok(()), // earlier = frontmost
            (Some(a_i), Some(b_i)) => Err(format!(
                "node {} is at depth position {} but node {} is at {}: not above",
                above_id, a_i, below_id, b_i
            )),
            _ => Err(format!("nodes {} and {} don't overlap", above_id, below_id)),
        }
    }

    /// Assert a node is within the viewport (0,0 to given width/height).
    pub fn assert_within_viewport(&self, id: u32, vp_w: f32, vp_h: f32) -> Result<(), String> {
        let node = self.node(id).ok_or(format!("node {} not found", id))?;
        let r = node.layout.ok_or(format!("node {} has no layout", id))?;
        if r.x < 0.0 || r.y < 0.0 || r.x + r.w > vp_w || r.y + r.h > vp_h {
            Err(format!(
                "node {} at ({},{} {}x{}) is outside viewport ({}x{})",
                id, r.x, r.y, r.w, r.h, vp_w, vp_h
            ))
        } else {
            Ok(())
        }
    }

    /// Assert a node has readable text: non-empty text, non-zero size, visible.
    pub fn assert_text_readable(&self, id: u32) -> Result<(), String> {
        self.assert_visible(id)?;
        let node = self.node(id).ok_or(format!("node {} not found", id))?;
        let text = node
            .text
            .as_ref()
            .ok_or(format!("node {} has no text", id))?;
        if text.is_empty() {
            return Err(format!("node {} has empty text", id));
        }
        Ok(())
    }

    /// Check if `child_id` is a descendant of `ancestor_id`.
    /// Explain the full render chain for a node: styles, layout, paint properties,
    /// clip ancestry, and final composited position. For debugging "why does this look wrong."
    pub fn explain_render(&self, id: u32) -> RenderExplanation {
        let node = match self.node(id) {
            Some(n) => n,
            None => {
                return RenderExplanation {
                    node_id: id,
                    found: false,
                    ..Default::default()
                }
            }
        };

        // Collect clip chain: ancestors with overflow clipping
        let mut clip_chain = Vec::new();
        let mut cursor = node.parent;
        while let Some(pid) = cursor {
            if let Some(ancestor) = self.node(pid) {
                let overflow = ancestor
                    .styles
                    .get("overflow")
                    .map(|s| s.as_str())
                    .unwrap_or("");
                if matches!(overflow, "hidden" | "auto" | "scroll") {
                    clip_chain.push(ClipAncestor {
                        id: pid,
                        overflow: overflow.to_string(),
                        rect: ancestor.layout,
                    });
                }
                cursor = ancestor.parent;
            } else {
                break;
            }
        }

        // Collect ancestor chain for context
        let mut ancestor_chain = Vec::new();
        let mut cursor = node.parent;
        while let Some(pid) = cursor {
            if let Some(a) = self.node(pid) {
                ancestor_chain.push(pid);
                cursor = a.parent;
            } else {
                break;
            }
        }

        // Paint properties
        let bg_color = node
            .styles
            .get("background-color")
            .or_else(|| node.styles.get("background"))
            .cloned();
        let color = node.styles.get("color").cloned();
        let opacity = node
            .styles
            .get("opacity")
            .and_then(|s| s.parse::<f32>().ok())
            .unwrap_or(1.0);
        let display = node.styles.get("display").cloned().unwrap_or_default();

        let visibility = self.why_not_visible(id);

        RenderExplanation {
            node_id: id,
            found: true,
            node_type: node.node_type.clone(),
            text: node.text.clone(),
            layout: node.layout,
            styles_count: node.styles.len(),
            key_styles: KeyStyles {
                display,
                bg_color,
                color,
                opacity,
                overflow: node.styles.get("overflow").cloned(),
                position: node.styles.get("position").cloned(),
                z_index: node.styles.get("z-index").cloned(),
            },
            ancestor_chain,
            clip_chain,
            focused: node.focused,
            has_handlers: node.has_handlers,
            scroll_y: node.scroll_y,
            visibility,
        }
    }

    fn is_descendant(&self, child_id: u32, ancestor_id: u32) -> bool {
        let mut current = child_id;
        loop {
            if let Some(node) = self.node(current) {
                if let Some(parent) = node.parent {
                    if parent == ancestor_id {
                        return true;
                    }
                    current = parent;
                } else {
                    return false;
                }
            } else {
                return false;
            }
        }
    }

    /// Explain why a node is or isn't visible. Returns a structured verdict.
    pub fn why_not_visible(&self, id: u32) -> VisibilityVerdict {
        let node = match self.node(id) {
            Some(n) => n,
            None => {
                return VisibilityVerdict {
                    node_id: id,
                    visible: false,
                    reasons: vec![InvisibilityReason::NotMounted],
                }
            }
        };

        let mut reasons = Vec::new();

        // 1. No layout rect = not mounted or not in tree
        let rect = match &node.layout {
            Some(r) => r,
            None => {
                reasons.push(InvisibilityReason::NoLayout);
                return VisibilityVerdict {
                    node_id: id,
                    visible: false,
                    reasons,
                };
            }
        };

        // 2. Zero size
        if rect.w <= 0.0 || rect.h <= 0.0 {
            reasons.push(InvisibilityReason::ZeroSize {
                width: rect.w,
                height: rect.h,
            });
        }

        // 3. display: none
        if node
            .styles
            .get("display")
            .map(|s| s == "none")
            .unwrap_or(false)
        {
            reasons.push(InvisibilityReason::DisplayNone);
        }

        // 4. opacity: 0
        if node
            .styles
            .get("opacity")
            .and_then(|s| s.parse::<f32>().ok())
            .map(|o| o <= 0.0)
            .unwrap_or(false)
        {
            reasons.push(InvisibilityReason::Transparent);
        }

        // 5. Clipped by ancestor overflow
        if let Some(clip_ancestor) = self.find_clipping_ancestor(id, rect) {
            reasons.push(InvisibilityReason::ClippedByAncestor {
                ancestor_id: clip_ancestor,
            });
        }

        // 6. Offscreen (outside viewport bounds 0,0 → canvas)
        // We don't know canvas size from snapshot alone, so check negative coords
        if rect.x + rect.w < 0.0 || rect.y + rect.h < 0.0 {
            reasons.push(InvisibilityReason::Offscreen);
        }

        VisibilityVerdict {
            node_id: id,
            visible: reasons.is_empty(),
            reasons,
        }
    }

    /// Check if any ancestor with overflow:hidden/auto/scroll clips this node completely.
    fn find_clipping_ancestor(&self, node_id: u32, node_rect: &RectSnapshot) -> Option<u32> {
        let mut current = self.node(node_id)?.parent?;
        loop {
            let ancestor = self.node(current)?;
            let overflow = ancestor
                .styles
                .get("overflow")
                .map(|s| s.as_str())
                .unwrap_or("");
            if matches!(overflow, "hidden" | "auto" | "scroll") {
                if let Some(ar) = &ancestor.layout {
                    // Is the node completely outside the ancestor's rect?
                    if node_rect.x + node_rect.w <= ar.x
                        || node_rect.x >= ar.x + ar.w
                        || node_rect.y + node_rect.h <= ar.y
                        || node_rect.y >= ar.y + ar.h
                    {
                        return Some(current);
                    }
                }
            }
            current = ancestor.parent?;
        }
    }

    // -----------------------------------------------------------------------
    // Accessibility tree — scene graph → semantic a11y representation
    // -----------------------------------------------------------------------

    /// Generate an accessibility tree from the scene snapshot.
    /// Maps RVST node types to ARIA roles and extracts accessible names/values.
    pub fn accessibility_tree(&self) -> Vec<AccessibilityNode> {
        self.nodes
            .iter()
            .filter(|n| n.layout.is_some()) // Only mounted nodes
            .filter_map(|n| {
                let role = match n.node_type.as_str() {
                    "Button" => "button",
                    "Input" => "textbox",
                    "Textarea" => "textbox",
                    "View" => {
                        // Views with specific roles based on context
                        if n.styles.get("role").map(|s| s.as_str()) == Some("navigation") {
                            "navigation"
                        } else if n.children.is_empty() && n.text.is_none() {
                            return None; // Skip empty divs
                        } else {
                            "group"
                        }
                    }
                    "Text" => {
                        // Text nodes are not standalone a11y nodes — their content
                        // contributes to the parent's accessible name
                        return None;
                    }
                    "Scroll" => "region",
                    "Form" => "form",
                    _ => return None,
                };

                // Accessible name: own text, or concatenated child text
                let name = if let Some(ref text) = n.text {
                    if !text.trim().is_empty() {
                        Some(text.clone())
                    } else {
                        None
                    }
                } else {
                    // Collect text from direct children
                    let child_text: String = n
                        .children
                        .iter()
                        .filter_map(|&cid| self.node(cid))
                        .filter_map(|c| c.text.as_ref())
                        .filter(|t| !t.trim().is_empty())
                        .cloned()
                        .collect::<Vec<_>>()
                        .join(" ");
                    if child_text.is_empty() {
                        None
                    } else {
                        Some(child_text)
                    }
                };

                // Value for inputs
                let value = n.styles.get("value").cloned();

                Some(AccessibilityNode {
                    id: n.id,
                    role: role.to_string(),
                    name,
                    value,
                    focused: n.focused,
                    focusable: matches!(n.node_type.as_str(), "Button" | "Input" | "Textarea"),
                    children: n.children.clone(),
                })
            })
            .collect()
    }

    /// Find accessibility nodes by role.
    pub fn a11y_by_role<'a>(
        &'a self,
        tree: &'a [AccessibilityNode],
        role: &str,
    ) -> Vec<&'a AccessibilityNode> {
        tree.iter().filter(|n| n.role == role).collect()
    }
}

/// A node in the accessibility tree.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AccessibilityNode {
    pub id: u32,
    pub role: String,
    pub name: Option<String>,
    pub value: Option<String>,
    pub focused: bool,
    pub focusable: bool,
    pub children: Vec<u32>,
}

/// Structured explanation of why a node is or isn't visible.
#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct VisibilityVerdict {
    pub node_id: u32,
    pub visible: bool,
    pub reasons: Vec<InvisibilityReason>,
}

/// Specific reason a node is not visible.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum InvisibilityReason {
    /// Node ID not found in the tree.
    NotMounted,
    /// Node exists but has no layout rect (not yet laid out).
    NoLayout,
    /// Node has zero width or height.
    ZeroSize { width: f32, height: f32 },
    /// display: none is set.
    DisplayNone,
    /// opacity is 0.
    Transparent,
    /// Completely clipped by an ancestor with overflow:hidden/auto/scroll.
    ClippedByAncestor { ancestor_id: u32 },
    /// Node is outside the viewport bounds.
    Offscreen,
}

/// Full render chain explanation for a node.
#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct RenderExplanation {
    pub node_id: u32,
    pub found: bool,
    #[serde(default)]
    pub node_type: String,
    pub text: Option<String>,
    pub layout: Option<RectSnapshot>,
    pub styles_count: usize,
    #[serde(default)]
    pub key_styles: KeyStyles,
    /// Parent chain from immediate parent to root.
    pub ancestor_chain: Vec<u32>,
    /// Ancestors that clip this node (overflow: hidden/auto/scroll).
    pub clip_chain: Vec<ClipAncestor>,
    pub focused: bool,
    pub has_handlers: bool,
    pub scroll_y: f32,
    #[serde(default)]
    pub visibility: VisibilityVerdict,
}

/// Key style properties relevant to rendering.
#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct KeyStyles {
    pub display: String,
    pub bg_color: Option<String>,
    pub color: Option<String>,
    pub opacity: f32,
    pub overflow: Option<String>,
    pub position: Option<String>,
    pub z_index: Option<String>,
}

/// An ancestor that clips this node.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ClipAncestor {
    pub id: u32,
    pub overflow: String,
    pub rect: Option<RectSnapshot>,
}

/// A single change between two snapshots.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum SceneChange {
    /// Node exists in `after` but not `before`.
    NodeAdded { id: u32, node_type: String },
    /// Node exists in `before` but not `after`.
    NodeRemoved { id: u32, node_type: String },
    /// Node's text content changed.
    TextChanged {
        id: u32,
        before: Option<String>,
        after: Option<String>,
    },
    /// Node's layout rect changed.
    LayoutChanged {
        id: u32,
        before: Option<RectSnapshot>,
        after: Option<RectSnapshot>,
    },
    /// A style property changed.
    StyleChanged {
        id: u32,
        property: String,
        before: String,
        after: String,
    },
    /// Focus moved.
    FocusChanged {
        before: Option<u32>,
        after: Option<u32>,
    },
    /// Node's scroll offset changed.
    ScrollChanged {
        id: u32,
        before_y: f32,
        after_y: f32,
    },
}

/// Result of comparing two scene snapshots.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SceneDiff {
    pub changes: Vec<SceneChange>,
}

impl SceneDiff {
    /// How many changes total.
    pub fn len(&self) -> usize {
        self.changes.len()
    }
    pub fn is_empty(&self) -> bool {
        self.changes.is_empty()
    }

    /// Filter to only text changes.
    pub fn text_changes(&self) -> Vec<&SceneChange> {
        self.changes
            .iter()
            .filter(|c| matches!(c, SceneChange::TextChanged { .. }))
            .collect()
    }
    /// Filter to only added nodes.
    pub fn nodes_added(&self) -> Vec<&SceneChange> {
        self.changes
            .iter()
            .filter(|c| matches!(c, SceneChange::NodeAdded { .. }))
            .collect()
    }
    /// Filter to only removed nodes.
    pub fn nodes_removed(&self) -> Vec<&SceneChange> {
        self.changes
            .iter()
            .filter(|c| matches!(c, SceneChange::NodeRemoved { .. }))
            .collect()
    }
    /// Filter to layout changes.
    pub fn layout_changes(&self) -> Vec<&SceneChange> {
        self.changes
            .iter()
            .filter(|c| matches!(c, SceneChange::LayoutChanged { .. }))
            .collect()
    }
}

/// Trace of a single user interaction: what happened, what changed.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RenderTrace {
    /// What action was performed.
    pub action: String,
    /// Scene state before the action.
    pub before: SceneSnapshot,
    /// Scene state after the action.
    pub after: SceneSnapshot,
    /// Semantic diff between before and after.
    pub diff: SceneDiff,
    /// Number of DOM ops produced by the action.
    pub ops_count: usize,
}

impl RenderTrace {
    /// Did anything change?
    pub fn has_changes(&self) -> bool {
        !self.diff.is_empty()
    }

    /// Summary: action + change count + key changes.
    pub fn summary(&self) -> String {
        let mut parts = vec![format!("action: {}", self.action)];
        parts.push(format!(
            "{} changes, {} ops",
            self.diff.len(),
            self.ops_count
        ));
        let added = self.diff.nodes_added().len();
        let removed = self.diff.nodes_removed().len();
        let text = self.diff.text_changes().len();
        if added > 0 {
            parts.push(format!("{} nodes added", added));
        }
        if removed > 0 {
            parts.push(format!("{} nodes removed", removed));
        }
        if text > 0 {
            parts.push(format!("{} text changes", text));
        }
        if self.before.focused_id != self.after.focused_id {
            parts.push(format!(
                "focus: {:?} → {:?}",
                self.before.focused_id, self.after.focused_id
            ));
        }
        parts.join(", ")
    }
}

/// Compare two scene snapshots and produce a structured diff.
pub fn scene_diff(before: &SceneSnapshot, after: &SceneSnapshot) -> SceneDiff {
    let mut changes = Vec::new();
    let before_ids: std::collections::HashSet<u32> = before.nodes.iter().map(|n| n.id).collect();
    let after_ids: std::collections::HashSet<u32> = after.nodes.iter().map(|n| n.id).collect();

    // Nodes added
    for id in after_ids.difference(&before_ids) {
        if let Some(n) = after.node(*id) {
            changes.push(SceneChange::NodeAdded {
                id: *id,
                node_type: n.node_type.clone(),
            });
        }
    }

    // Nodes removed
    for id in before_ids.difference(&after_ids) {
        if let Some(n) = before.node(*id) {
            changes.push(SceneChange::NodeRemoved {
                id: *id,
                node_type: n.node_type.clone(),
            });
        }
    }

    // Compare nodes present in both
    for id in before_ids.intersection(&after_ids) {
        let b = before.node(*id).unwrap();
        let a = after.node(*id).unwrap();

        // Text change
        if b.text != a.text {
            changes.push(SceneChange::TextChanged {
                id: *id,
                before: b.text.clone(),
                after: a.text.clone(),
            });
        }

        // Layout change
        if b.layout != a.layout {
            changes.push(SceneChange::LayoutChanged {
                id: *id,
                before: b.layout,
                after: a.layout,
            });
        }

        // Style changes (only report properties that differ)
        for (key, bval) in &b.styles {
            let aval = a.styles.get(key).map(|s| s.as_str()).unwrap_or("");
            if bval != aval {
                changes.push(SceneChange::StyleChanged {
                    id: *id,
                    property: key.clone(),
                    before: bval.clone(),
                    after: aval.to_string(),
                });
            }
        }
        for (key, aval) in &a.styles {
            if !b.styles.contains_key(key) {
                changes.push(SceneChange::StyleChanged {
                    id: *id,
                    property: key.clone(),
                    before: String::new(),
                    after: aval.clone(),
                });
            }
        }

        // Scroll change
        if (b.scroll_y - a.scroll_y).abs() > 0.01 {
            changes.push(SceneChange::ScrollChanged {
                id: *id,
                before_y: b.scroll_y,
                after_y: a.scroll_y,
            });
        }
    }

    // Focus change
    if before.focused_id != after.focused_id {
        changes.push(SceneChange::FocusChanged {
            before: before.focused_id,
            after: after.focused_id,
        });
    }

    SceneDiff { changes }
}

#[cfg(test)]
mod tests {
    use super::*;
    use rvst_core::{NodeId, NodeType, Op};

    fn make_test_tree() -> Tree {
        let mut tree = Tree::new();
        tree.apply(Op::CreateNode {
            id: NodeId(1),
            node_type: NodeType::View,
        });
        tree.apply(Op::CreateNode {
            id: NodeId(2),
            node_type: NodeType::Text,
        });
        tree.apply(Op::SetText {
            id: NodeId(2),
            value: "Hello".into(),
        });
        tree.apply(Op::Insert {
            parent: NodeId(0),
            child: NodeId(1),
            anchor: None,
        });
        tree.apply(Op::Insert {
            parent: NodeId(1),
            child: NodeId(2),
            anchor: None,
        });
        tree.set_layout(
            NodeId(1),
            rvst_core::Rect {
                x: 0.0,
                y: 0.0,
                w: 200.0,
                h: 40.0,
            },
        );
        tree.set_layout(
            NodeId(2),
            rvst_core::Rect {
                x: 5.0,
                y: 5.0,
                w: 50.0,
                h: 20.0,
            },
        );
        // Button node for semantic tests
        tree.apply(Op::CreateNode {
            id: NodeId(3),
            node_type: NodeType::Button,
        });
        tree.apply(Op::Insert {
            parent: NodeId(1),
            child: NodeId(3),
            anchor: None,
        });
        tree.set_layout(
            NodeId(3),
            rvst_core::Rect {
                x: 60.0,
                y: 5.0,
                w: 80.0,
                h: 30.0,
            },
        );
        tree
    }

    #[test]
    fn snapshot_captures_nodes() {
        let tree = make_test_tree();
        let snap = SceneSnapshot::from_tree(&tree, 1024.0, 768.0);
        assert_eq!(snap.node_count, 3);
        assert!(snap.node(1).is_some());
        assert!(snap.node(2).is_some());
        assert!(snap.node(3).is_some());
    }

    #[test]
    fn snapshot_captures_text() {
        let tree = make_test_tree();
        let snap = SceneSnapshot::from_tree(&tree, 1024.0, 768.0);
        let text_nodes = snap.find_text("Hello");
        assert_eq!(text_nodes.len(), 1);
        assert_eq!(text_nodes[0].id, 2);
    }

    #[test]
    fn snapshot_captures_layout() {
        let tree = make_test_tree();
        let snap = SceneSnapshot::from_tree(&tree, 1024.0, 768.0);
        let node = snap.node(1).unwrap();
        let rect = node.layout.unwrap();
        assert_eq!(rect.w, 200.0);
        assert_eq!(rect.h, 40.0);
    }

    #[test]
    fn snapshot_nodes_at_point() {
        let tree = make_test_tree();
        let snap = SceneSnapshot::from_tree(&tree, 1024.0, 768.0);
        let at_10_10 = snap.nodes_at(10.0, 10.0);
        assert!(
            at_10_10.len() >= 2,
            "both view and text contain point (10,10)"
        );
    }

    #[test]
    fn snapshot_serializes_to_json() {
        let tree = make_test_tree();
        let snap = SceneSnapshot::from_tree(&tree, 1024.0, 768.0);
        let json = snap.to_json();
        assert!(json.contains("\"node_count\": 3"));
        assert!(json.contains("\"Hello\""));
        // Roundtrip
        let parsed: SceneSnapshot = serde_json::from_str(&json).unwrap();
        assert_eq!(parsed.node_count, 3);
    }

    #[test]
    fn snapshot_visible_nodes() {
        let tree = make_test_tree();
        let snap = SceneSnapshot::from_tree(&tree, 1024.0, 768.0);
        let visible = snap.visible_nodes();
        assert_eq!(visible.len(), 3);
    }

    #[test]
    fn hit_test_stack_returns_deepest_first() {
        let tree = make_test_tree();
        let snap = SceneSnapshot::from_tree(&tree, 1024.0, 768.0);
        // Point (10, 10) is inside both nodes (View at 0,0,200,40 and Text at 5,5,50,20)
        let stack = snap.hit_test_stack(10.0, 10.0);
        assert_eq!(stack.len(), 2, "both nodes at this point");
        // Deepest (text, child) should be first
        assert_eq!(stack[0].id, 2, "text node (deeper) first");
        assert_eq!(stack[1].id, 1, "view node (parent) second");
        assert!(
            stack[0].depth > stack[1].depth,
            "deeper node has higher depth"
        );
    }

    #[test]
    fn why_not_visible_present_node_is_visible() {
        let tree = make_test_tree();
        let snap = SceneSnapshot::from_tree(&tree, 1024.0, 768.0);
        let verdict = snap.why_not_visible(1);
        assert!(verdict.visible, "node 1 should be visible");
        assert!(verdict.reasons.is_empty());
    }

    #[test]
    fn why_not_visible_missing_node() {
        let tree = make_test_tree();
        let snap = SceneSnapshot::from_tree(&tree, 1024.0, 768.0);
        let verdict = snap.why_not_visible(999);
        assert!(!verdict.visible);
        assert!(matches!(verdict.reasons[0], InvisibilityReason::NotMounted));
    }

    #[test]
    fn why_not_visible_zero_size() {
        let mut tree = Tree::new();
        tree.apply(Op::CreateNode {
            id: NodeId(1),
            node_type: NodeType::View,
        });
        tree.apply(Op::Insert {
            parent: NodeId(0),
            child: NodeId(1),
            anchor: None,
        });
        tree.set_layout(
            NodeId(1),
            rvst_core::Rect {
                x: 0.0,
                y: 0.0,
                w: 0.0,
                h: 0.0,
            },
        );
        let snap = SceneSnapshot::from_tree(&tree, 1024.0, 768.0);
        let verdict = snap.why_not_visible(1);
        assert!(!verdict.visible);
        assert!(matches!(
            verdict.reasons[0],
            InvisibilityReason::ZeroSize { .. }
        ));
    }

    #[test]
    fn why_not_visible_no_layout() {
        let mut tree = Tree::new();
        tree.apply(Op::CreateNode {
            id: NodeId(1),
            node_type: NodeType::View,
        });
        tree.apply(Op::Insert {
            parent: NodeId(0),
            child: NodeId(1),
            anchor: None,
        });
        // No set_layout → no rect
        let snap = SceneSnapshot::from_tree(&tree, 1024.0, 768.0);
        let verdict = snap.why_not_visible(1);
        assert!(!verdict.visible);
        assert!(matches!(verdict.reasons[0], InvisibilityReason::NoLayout));
    }

    #[test]
    fn hit_test_stack_empty_at_miss() {
        let tree = make_test_tree();
        let snap = SceneSnapshot::from_tree(&tree, 1024.0, 768.0);
        let stack = snap.hit_test_stack(999.0, 999.0);
        assert!(stack.is_empty(), "no nodes at far-away point");
    }

    #[test]
    fn scene_diff_identical_is_empty() {
        let tree = make_test_tree();
        let snap = SceneSnapshot::from_tree(&tree, 1024.0, 768.0);
        let diff = scene_diff(&snap, &snap);
        assert!(diff.is_empty(), "diff of same snapshot should be empty");
    }

    #[test]
    fn scene_diff_detects_text_change() {
        let mut tree = make_test_tree();
        let before = SceneSnapshot::from_tree(&tree, 1024.0, 768.0);
        tree.apply(Op::SetText {
            id: NodeId(2),
            value: "World".into(),
        });
        let after = SceneSnapshot::from_tree(&tree, 1024.0, 768.0);
        let diff = scene_diff(&before, &after);
        let text_changes = diff.text_changes();
        assert_eq!(text_changes.len(), 1);
        if let SceneChange::TextChanged {
            id,
            before: b,
            after: a,
        } = text_changes[0]
        {
            assert_eq!(*id, 2);
            assert_eq!(b.as_deref(), Some("Hello"));
            assert_eq!(a.as_deref(), Some("World"));
        }
    }

    #[test]
    fn scene_diff_detects_node_added_removed() {
        let mut tree = make_test_tree();
        let before = SceneSnapshot::from_tree(&tree, 1024.0, 768.0);
        // Add a new node
        tree.apply(Op::CreateNode {
            id: NodeId(4),
            node_type: NodeType::Button,
        });
        tree.apply(Op::Insert {
            parent: NodeId(1),
            child: NodeId(4),
            anchor: None,
        });
        let after = SceneSnapshot::from_tree(&tree, 1024.0, 768.0);
        let diff = scene_diff(&before, &after);
        assert_eq!(diff.nodes_added().len(), 1);
        // Reverse diff: node 4 is "removed"
        let reverse = scene_diff(&after, &before);
        assert_eq!(reverse.nodes_removed().len(), 1);
    }

    #[test]
    fn assert_visible_works() {
        let tree = make_test_tree();
        let snap = SceneSnapshot::from_tree(&tree, 1024.0, 768.0);
        assert!(snap.assert_visible(1).is_ok());
        assert!(snap.assert_visible(999).is_err()); // not found
    }

    #[test]
    fn assert_clickable_works() {
        let tree = make_test_tree();
        let snap = SceneSnapshot::from_tree(&tree, 1024.0, 768.0);
        // Node 1 (View) is visible and has layout — should be "clickable" in layout terms
        assert!(snap.assert_clickable(1).is_ok());
    }

    #[test]
    fn assert_text_readable_works() {
        let tree = make_test_tree();
        let snap = SceneSnapshot::from_tree(&tree, 1024.0, 768.0);
        // Node 2 has text "Hello" and layout
        assert!(snap.assert_text_readable(2).is_ok());
        // Node 1 has no text
        assert!(snap.assert_text_readable(1).is_err());
    }

    #[test]
    fn assert_within_viewport_works() {
        let tree = make_test_tree();
        let snap = SceneSnapshot::from_tree(&tree, 1024.0, 768.0);
        assert!(snap.assert_within_viewport(1, 400.0, 300.0).is_ok());
        assert!(snap.assert_within_viewport(1, 50.0, 10.0).is_err()); // node wider than viewport
    }

    #[test]
    fn scene_diff_detects_layout_change() {
        let mut tree = make_test_tree();
        let before = SceneSnapshot::from_tree(&tree, 1024.0, 768.0);
        tree.set_layout(
            NodeId(1),
            rvst_core::Rect {
                x: 10.0,
                y: 20.0,
                w: 300.0,
                h: 60.0,
            },
        );
        let after = SceneSnapshot::from_tree(&tree, 1024.0, 768.0);
        let diff = scene_diff(&before, &after);
        let layout_changes = diff.layout_changes();
        assert!(!layout_changes.is_empty(), "should detect layout change");
    }

    #[test]
    fn explain_render_found_node() {
        let tree = make_test_tree();
        let snap = SceneSnapshot::from_tree(&tree, 1024.0, 768.0);
        let expl = snap.explain_render(1);
        assert!(expl.found);
        assert_eq!(expl.node_type, "View");
        assert!(expl.layout.is_some());
        assert!(expl.visibility.visible);
        assert_eq!(expl.styles_count, 0); // test tree has no styles
        assert!(expl.ancestor_chain.is_empty()); // node 1 is a root child
    }

    #[test]
    fn explain_render_child_node() {
        let tree = make_test_tree();
        let snap = SceneSnapshot::from_tree(&tree, 1024.0, 768.0);
        let expl = snap.explain_render(2);
        assert!(expl.found);
        assert_eq!(expl.node_type, "Text");
        assert_eq!(expl.text.as_deref(), Some("Hello"));
        assert_eq!(expl.ancestor_chain, vec![1]); // parent is node 1
    }

    #[test]
    fn explain_render_missing_node() {
        let tree = make_test_tree();
        let snap = SceneSnapshot::from_tree(&tree, 1024.0, 768.0);
        let expl = snap.explain_render(999);
        assert!(!expl.found);
    }

    #[test]
    fn explain_render_serializes() {
        let tree = make_test_tree();
        let snap = SceneSnapshot::from_tree(&tree, 1024.0, 768.0);
        let expl = snap.explain_render(1);
        let json = serde_json::to_string(&expl).unwrap();
        assert!(json.contains("\"found\":true"));
        assert!(json.contains("\"View\""));
    }

    #[test]
    fn diagnose_detects_no_handler_button() {
        let mut tree = make_test_tree();
        // Remove any handlers for the button
        tree.handlers.clear();
        let snap = SceneSnapshot::from_tree(&tree, 1024.0, 768.0);
        assert!(
            snap.diagnostics.iter().any(|d| d.kind == "no_handler"),
            "should detect button without handler: {:?}",
            snap.diagnostics
        );
    }

    #[test]
    fn diagnose_detects_zero_size() {
        let mut tree = Tree::new();
        tree.apply(Op::CreateNode {
            id: NodeId(1),
            node_type: NodeType::View,
        });
        tree.apply(Op::CreateNode {
            id: NodeId(2),
            node_type: NodeType::Text,
        });
        tree.apply(Op::SetText {
            id: NodeId(2),
            value: "Hidden".into(),
        });
        tree.apply(Op::Insert {
            parent: NodeId(0),
            child: NodeId(1),
            anchor: None,
        });
        tree.apply(Op::Insert {
            parent: NodeId(1),
            child: NodeId(2),
            anchor: None,
        });
        tree.set_layout(
            NodeId(1),
            rvst_core::Rect {
                x: 0.0,
                y: 0.0,
                w: 100.0,
                h: 0.0,
            },
        );
        tree.set_layout(
            NodeId(2),
            rvst_core::Rect {
                x: 0.0,
                y: 0.0,
                w: 50.0,
                h: 20.0,
            },
        );
        let snap = SceneSnapshot::from_tree(&tree, 1024.0, 768.0);
        assert!(
            snap.diagnostics.iter().any(|d| d.kind == "zero_size"),
            "should detect zero-size node with children: {:?}",
            snap.diagnostics
        );
    }

    #[test]
    fn diagnose_detects_offscreen() {
        let mut tree = Tree::new();
        tree.apply(Op::CreateNode {
            id: NodeId(1),
            node_type: NodeType::View,
        });
        tree.apply(Op::Insert {
            parent: NodeId(0),
            child: NodeId(1),
            anchor: None,
        });
        tree.set_layout(
            NodeId(1),
            rvst_core::Rect {
                x: 2000.0,
                y: 0.0,
                w: 100.0,
                h: 50.0,
            },
        );
        let snap = SceneSnapshot::from_tree(&tree, 1024.0, 768.0);
        assert!(
            snap.diagnostics.iter().any(|d| d.kind == "offscreen"),
            "should detect offscreen node: {:?}",
            snap.diagnostics
        );
    }

    #[test]
    fn semantic_fields_populated() {
        let tree = make_test_tree();
        let snap = SceneSnapshot::from_tree(&tree, 1024.0, 768.0);
        // Button node should have role="button"
        let btn = snap.nodes.iter().find(|n| n.node_type == "Button");
        assert!(btn.is_some(), "should have a button node");
        let btn = btn.unwrap();
        assert_eq!(btn.role, "button");
        assert!(!btn.semantic_id.is_empty());
        assert!(btn.semantic_id.starts_with("n_"));

        // View node should have role="group"
        let view = snap.node(1).unwrap();
        assert_eq!(view.role, "group");
        assert!(view.semantic_id.starts_with("n_"));
        // View's name comes from child text
        assert_eq!(view.name.as_deref(), Some("Hello"));

        // Text node should have role="text" and name from its text
        let text = snap.node(2).unwrap();
        assert_eq!(text.role, "text");
        assert_eq!(text.name.as_deref(), Some("Hello"));
    }
}

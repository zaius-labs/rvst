use rvst_core::{NodeDescriptor, NodeId, NodeType, Op, Rect};
use std::collections::HashMap;

#[derive(Debug, Clone)]
pub struct Node {
    pub id: NodeId,
    pub node_type: NodeType,
    pub text: Option<String>,
    pub children: Vec<NodeId>,
    pub parent: Option<NodeId>,
    pub layout: Option<Rect>,
    pub styles: HashMap<String, String>,
    /// Vertical scroll offset (pixels scrolled from top). Only meaningful for Scroll nodes.
    pub scroll_y: f32,
    /// Caret position for contentEditable nodes (x, y, height in screen coords).
    pub caret: Option<(f32, f32, f32)>,
    /// Virtual content height for scroll containers (set by layout).
    pub virtual_content_height: Option<f32>,
    /// Per-node dirty flag for incremental layout. When true, this node (or a descendant)
    /// needs relayout. Propagated up to ancestors so the layout engine can skip clean subtrees.
    pub dirty: bool,
}

#[derive(Debug, Default, Clone)]
pub struct Tree {
    pub nodes: HashMap<NodeId, Node>,
    pub root_children: Vec<NodeId>,
    pub handlers: Vec<(NodeId, String, u32)>, // (node_id, event, handler_id)
    /// Currently focused node (receives keyboard events, Tab cycles from here).
    pub focused: Option<NodeId>,
    /// Currently hovered node (for visual hover feedback in windowed mode).
    pub hovered: Option<NodeId>,
    /// Deferred insertions: when `insert(parent, child, anchor)` arrives but anchor is not yet
    /// a child of parent, we buffer the intent here. When the anchor is later appended to parent,
    /// all buffered children are inserted before it. Key = anchor NodeId.
    pending_before: HashMap<NodeId, Vec<(NodeId, NodeId)>>, // anchor → [(parent, child)]
    /// Dirty flags for layout/paint.
    pub dirty_layout: bool,
    pub dirty_paint: bool,
    /// Count of no-op skips (value-equal ops) for benchmarking.
    pub skipped_ops: u64,
    /// Flat spatial index: (NodeId, Rect) for hit testing, rebuilt after layout.
    pub spatial_index: Vec<(NodeId, Rect)>,
}

impl Tree {
    pub fn new() -> Self {
        Self::default()
    }

    pub fn apply(&mut self, op: Op) {
        match op {
            Op::CreateNode { id, node_type } => {
                self.nodes.insert(
                    id,
                    Node {
                        id,
                        node_type,
                        text: None,
                        children: vec![],
                        parent: None,
                        layout: None,
                        styles: HashMap::new(),
                        scroll_y: 0.0,
                        caret: None,
                        virtual_content_height: None,
                        dirty: true,
                    },
                );
                self.dirty_layout = true;
            }
            Op::Insert {
                parent,
                child,
                anchor,
            } => {
                // Insert child before anchor in parent's children list.
                // Svelte 5 inserts {#each} items before an anchor node BEFORE the anchor itself
                // has been added to the parent (the items are inserted via `anchor.before(child)`
                // while the subtree is still a detached JS fragment). We detect this by checking
                // whether the anchor is already a child of parent. If not, we defer: when the
                // anchor is later appended (anchor=None), we flush all deferred children before it.

                // Helper: does `target` appear in the given children list?
                let find_pos = |children: &[NodeId], target: NodeId| -> Option<usize> {
                    children.iter().position(|&c| c == target)
                };

                match anchor {
                    Some(a) => {
                        // Check if anchor is already in parent's children
                        let anchor_in_parent = if let Some(p) = self.nodes.get(&parent) {
                            find_pos(&p.children, a).is_some()
                        } else {
                            find_pos(&self.root_children, a).is_some()
                        };

                        if anchor_in_parent {
                            // Normal case: insert before the anchor
                            if let Some(p) = self.nodes.get_mut(&parent) {
                                let pos = find_pos(&p.children, a).unwrap_or(p.children.len());
                                p.children.insert(pos, child);
                            } else {
                                let pos = find_pos(&self.root_children, a)
                                    .unwrap_or(self.root_children.len());
                                self.root_children.insert(pos, child);
                            }
                        } else {
                            // Anchor not yet in parent — defer until anchor is appended
                            self.pending_before
                                .entry(a)
                                .or_default()
                                .push((parent, child));
                            // Still wire up parent pointer so JS-side traversal works
                            if let Some(c) = self.nodes.get_mut(&child) {
                                c.parent = Some(parent);
                            }
                            return; // skip the parent-wiring below (already done)
                        }
                    }
                    None => {
                        // Append at end
                        if let Some(p) = self.nodes.get_mut(&parent) {
                            p.children.push(child);
                        } else {
                            self.root_children.push(child);
                        }
                        // Flush any children that were waiting to be inserted before `child`
                        if let Some(deferred) = self.pending_before.remove(&child) {
                            for (def_parent, def_child) in deferred {
                                // Insert def_child before child (which was just appended)
                                if def_parent == parent {
                                    if let Some(p) = self.nodes.get_mut(&def_parent) {
                                        let pos = find_pos(&p.children, child)
                                            .unwrap_or(p.children.len());
                                        p.children.insert(pos, def_child);
                                    } else {
                                        let pos = find_pos(&self.root_children, child)
                                            .unwrap_or(self.root_children.len());
                                        self.root_children.insert(pos, def_child);
                                    }
                                } else {
                                    // Deferred child belongs to a different parent — just append there
                                    if let Some(p) = self.nodes.get_mut(&def_parent) {
                                        p.children.push(def_child);
                                    }
                                }
                            }
                        }
                    }
                }
                if let Some(c) = self.nodes.get_mut(&child) {
                    c.parent = Some(parent);
                }
                self.mark_dirty(child);
            }
            Op::Remove { id } => {
                // Mark parent dirty before removing the node
                let parent_id = self.nodes.get(&id).and_then(|n| n.parent);
                if let Some(pid) = parent_id {
                    self.mark_dirty(pid);
                } else {
                    self.dirty_layout = true;
                }
                // Remove from parent's children list before dropping the node
                if let Some(node) = self.nodes.get(&id) {
                    if let Some(parent_id) = node.parent {
                        if let Some(parent) = self.nodes.get_mut(&parent_id) {
                            parent.children.retain(|&c| c != id);
                        }
                    } else {
                        self.root_children.retain(|&c| c != id);
                    }
                }
                self.nodes.remove(&id);
            }
            Op::SetText { id, value } => {
                if let Some(node) = self.nodes.get(&id) {
                    if node.text.as_deref() == Some(&value) {
                        self.skipped_ops += 1;
                        return;
                    }
                }
                if let Some(node) = self.nodes.get_mut(&id) {
                    node.text = Some(value);
                }
                self.mark_dirty(id);
            }
            Op::SetAttr { id, key, value } => {
                if let Some(node) = self.nodes.get(&id) {
                    if node.styles.get(&key).map(|v| v.as_str()) == Some(&value) {
                        self.skipped_ops += 1;
                        return;
                    }
                }
                if let Some(node) = self.nodes.get_mut(&id) {
                    node.styles.insert(key, value);
                }
                self.mark_dirty(id);
            }
            Op::SetStyle { id, key, value } => {
                if let Some(node) = self.nodes.get(&id) {
                    if node.styles.get(&key).map(|v| v.as_str()) == Some(&value) {
                        self.skipped_ops += 1;
                        return;
                    }
                }
                if let Some(node) = self.nodes.get_mut(&id) {
                    node.styles.insert(key, value);
                }
                self.mark_dirty(id);
            }
            Op::Listen {
                id,
                event,
                handler_id,
            } => {
                self.handlers.push((id, event, handler_id));
            }
            Op::Unlisten {
                id,
                event,
                handler_id,
            } => {
                self.handlers
                    .retain(|(nid, ev, hid)| !(*nid == id && ev == &event && *hid == handler_id));
            }
            Op::QueueMicrotask | Op::Flush => {}
            // Window-level ops are handled by the shell, not the tree.
            Op::SetWindowDecorations { .. }
            | Op::BeginWindowDrag
            | Op::MinimizeWindow
            | Op::MaximizeWindow { .. }
            | Op::CloseWindow
            | Op::ClipboardWrite { .. }
            | Op::HmrSend { .. } => {}
            Op::SetScroll { id, scroll_y } => {
                if let Some(n) = self.nodes.get_mut(&id) {
                    n.scroll_y = scroll_y;
                }
            }
            Op::SetFocus { id } => {
                self.focused = if id.0 == 0 { None } else { Some(id) };
            }
            Op::SetCaret { id, x, y, height } => {
                if let Some(n) = self.nodes.get_mut(&id) {
                    n.caret = Some((x, y, height));
                }
            }
            Op::CloneTemplate {
                template_id: _,
                start_id,
                descriptor,
            } => {
                // Batch-create all nodes from the template descriptor.
                // Assigns sequential NodeIds starting from start_id.
                let mut next_id = start_id.0;
                for desc in &descriptor {
                    self.instantiate_descriptor(desc, &mut next_id);
                }
                self.dirty_layout = true;
            }
        }
    }

    /// Recursively create nodes from a NodeDescriptor, assigning sequential IDs.
    fn instantiate_descriptor(&mut self, desc: &NodeDescriptor, next_id: &mut u32) {
        let id = NodeId(*next_id);
        *next_id += 1;

        let mut styles = HashMap::new();
        for (k, v) in &desc.attrs {
            styles.insert(k.clone(), v.clone());
        }
        for (k, v) in &desc.styles {
            styles.insert(k.clone(), v.clone());
        }

        self.nodes.insert(
            id,
            Node {
                id,
                node_type: desc.node_type.clone(),
                text: desc.text.clone(),
                children: vec![],
                parent: None,
                layout: None,
                styles,
                scroll_y: 0.0,
                caret: None,
                virtual_content_height: None,
                dirty: true,
            },
        );

        for child_desc in &desc.children {
            let child_id = NodeId(*next_id);
            self.instantiate_descriptor(child_desc, next_id);
            // Wire parent-child relationship
            if let Some(child_node) = self.nodes.get_mut(&child_id) {
                child_node.parent = Some(id);
            }
            if let Some(parent_node) = self.nodes.get_mut(&id) {
                parent_node.children.push(child_id);
            }
        }
    }

    /// Returns the handler_id for the first handler registered for the given event.
    /// Used by ShellApp to dispatch click events into the JS runtime.
    pub fn find_handler(&self, event: &str) -> Option<u32> {
        self.handlers
            .iter()
            .find(|(_, ev, _)| ev == event)
            .map(|(_, _, hid)| *hid)
    }

    /// Returns the handler_id for the handler registered on a specific node for the given event.
    pub fn find_handler_on_node(&self, node_id: NodeId, event: &str) -> Option<u32> {
        self.handlers
            .iter()
            .find(|(nid, ev, _)| *nid == node_id && ev == event)
            .map(|(_, _, hid)| *hid)
    }

    /// If node_id is a submit button (type="submit"), walk up the parent chain to find the
    /// nearest Form ancestor, and return (form_node_id, submit_handler_id) if one has a
    /// "submit" handler registered.
    pub fn find_form_submit_handler(&self, button_node_id: NodeId) -> Option<(NodeId, u32)> {
        let node = self.nodes.get(&button_node_id)?;
        // Only propagate if this is a submit button
        if node.node_type != NodeType::Button {
            return None;
        }
        let btn_type = node.styles.get("type").map(|s| s.as_str());
        if btn_type != Some("submit") && btn_type.is_some() {
            // Has an explicit type that isn't "submit" — don't propagate
            // (None = default type for button, which IS submit in HTML)
            return None;
        }
        // Walk up the parent chain to find a Form node
        let mut current = node.parent?;
        loop {
            let n = self.nodes.get(&current)?;
            if n.node_type == NodeType::Form {
                if let Some(hid) = self.find_handler_on_node(current, "submit") {
                    return Some((current, hid));
                }
                return None; // Found form but no submit handler
            }
            current = n.parent?;
        }
    }

    /// Returns the NodeId of the innermost clickable element under (x, y), or None.
    /// "Clickable" means: NodeType::Button, or any View-type element that has a
    /// registered "click" handler (e.g. <th onclick>, <div onclick>).
    /// Svelte 5 registers a single delegation handler on body; we hit-test for
    /// the actual clicked element separately so dispatch can build the correct composedPath.
    /// Find the deepest (frontmost) node at a point. Walks children depth-first,
    /// returning the last child that contains the point (deepest in paint order).
    pub fn hit_test_deepest(&self, x: f32, y: f32) -> Option<NodeId> {
        let mut best = None;
        for &id in &self.root_children {
            self.hit_deepest_rec(id, x, y, &mut best);
        }
        best
    }

    fn hit_deepest_rec(&self, id: NodeId, x: f32, y: f32, best: &mut Option<NodeId>) {
        let node = match self.nodes.get(&id) {
            Some(n) => n,
            None => return,
        };
        if node
            .styles
            .get("pointer-events")
            .map(|s| s == "none")
            .unwrap_or(false)
        {
            return;
        }
        let rect = match node.layout {
            Some(r) => r,
            None => return,
        };
        if x >= rect.x && x < rect.x + rect.w && y >= rect.y && y < rect.y + rect.h {
            // This node contains the point — it's a candidate
            // Skip pure text nodes and template/fragment nodes
            if !matches!(node.node_type, NodeType::Text) {
                *best = Some(id);
            }
            // Check children (deeper = frontmost in paint order)
            for &child in &node.children {
                self.hit_deepest_rec(child, x, y, best);
            }
        }
    }

    pub fn hit_test_button(&self, x: f32, y: f32) -> Option<NodeId> {
        for &id in &self.root_children {
            if let Some(hit) = self.hit_any_button(id, x, y) {
                return Some(hit);
            }
        }
        None
    }

    /// Returns true if the given node has a registered "click" handler.
    fn has_click_handler(&self, id: NodeId) -> bool {
        self.handlers
            .iter()
            .any(|(nid, ev, _)| *nid == id && ev == "click")
    }

    // NOTE: Returns the first hittable ancestor, not the deepest child.
    // This is intentionally reversed from browser event bubbling (where the
    // deepest element is targeted first). For rvst's use case (Svelte compiles
    // onclick to the element itself, not a wrapper), this is correct — but
    // wrapping a Button inside a div-with-onclick would return the div, not the button.
    fn hit_any_button(&self, id: NodeId, x: f32, y: f32) -> Option<NodeId> {
        let node = self.nodes.get(&id)?;
        if node
            .styles
            .get("pointer-events")
            .map(|s| s == "none")
            .unwrap_or(false)
        {
            return None;
        }
        let rect = node.layout?;
        if x >= rect.x && x < rect.x + rect.w && y >= rect.y && y < rect.y + rect.h {
            // Button elements are always hittable. View elements are hittable if they
            // have a direct "click" handler (e.g. <th onclick>, <div onclick>).
            if matches!(node.node_type, NodeType::Button)
                || (node.node_type == NodeType::View && self.has_click_handler(id))
            {
                return Some(id);
            }
            for &child in node.children.clone().iter() {
                if let Some(hit) = self.hit_any_button(child, x, y) {
                    return Some(hit);
                }
            }
        }
        None
    }

    /// Returns the handler_id of the first node that: (a) has a handler for `event`,
    /// (b) has a layout rect that contains point (x, y). Walks root_children in order.
    /// NOTE: only useful when handler and element are co-located (not Svelte delegation).
    pub fn find_handler_at(&self, event: &str, x: f32, y: f32) -> Option<u32> {
        for &id in &self.root_children {
            if let Some(hid) = self.hit_test_node(id, event, x, y) {
                return Some(hid);
            }
        }
        None
    }

    fn hit_test_node(&self, id: NodeId, event: &str, x: f32, y: f32) -> Option<u32> {
        let node = self.nodes.get(&id)?;
        if node
            .styles
            .get("pointer-events")
            .map(|s| s == "none")
            .unwrap_or(false)
        {
            return None;
        }
        let rect = node.layout?;
        if x >= rect.x && x < rect.x + rect.w && y >= rect.y && y < rect.y + rect.h {
            if let Some(hid) = self
                .handlers
                .iter()
                .find(|(nid, ev, _)| *nid == id && ev == event)
                .map(|(_, _, hid)| *hid)
            {
                return Some(hid);
            }
            for &child in &node.children {
                if let Some(hid) = self.hit_test_node(child, event, x, y) {
                    return Some(hid);
                }
            }
        }
        None
    }

    pub fn root_children(&self) -> &[NodeId] {
        &self.root_children
    }

    pub fn set_layout(&mut self, id: NodeId, rect: Rect) {
        if let Some(node) = self.nodes.get_mut(&id) {
            node.layout = Some(rect);
        }
    }

    pub fn get_layout(&self, id: NodeId) -> Option<Rect> {
        self.nodes.get(&id)?.layout
    }

    pub fn collect_text(&self) -> String {
        let mut parts: Vec<&str> = Vec::new();
        for &root_child in &self.root_children {
            self.collect_text_dfs(root_child, &mut parts);
        }
        parts.join("")
    }

    fn collect_text_dfs<'a>(&'a self, id: NodeId, out: &mut Vec<&'a str>) {
        let Some(node) = self.nodes.get(&id) else {
            return;
        };
        if matches!(node.node_type, NodeType::Text) {
            if let Some(text) = &node.text {
                if !text.is_empty() {
                    out.push(text.as_str());
                }
            }
        }
        for &child in &node.children {
            self.collect_text_dfs(child, out);
        }
    }

    /// Returns all focusable node IDs in document order (DFS of root_children).
    /// Focusable = Input, Textarea, Button, or any node with tabindex attr.
    pub fn focusable_nodes(&self) -> Vec<NodeId> {
        let mut result = Vec::new();
        let roots = self.root_children.clone();
        for root in &roots {
            self.collect_focusable(*root, &mut result);
        }
        result
    }

    fn collect_focusable(&self, id: NodeId, out: &mut Vec<NodeId>) {
        if let Some(node) = self.nodes.get(&id) {
            match node.node_type {
                NodeType::Input | NodeType::Textarea | NodeType::Button => out.push(id),
                _ => {
                    if node.styles.contains_key("tabindex") {
                        out.push(id);
                    }
                }
            }
            for &child in &node.children {
                self.collect_focusable(child, out);
            }
        }
    }

    /// Advance focus to next focusable element (Tab) or previous (Shift+Tab).
    /// Returns the newly focused NodeId, or None if no focusable elements.
    pub fn advance_focus(&mut self, reverse: bool) -> Option<NodeId> {
        let focusable = self.focusable_nodes();
        if focusable.is_empty() {
            return None;
        }
        let current_idx = self
            .focused
            .and_then(|f| focusable.iter().position(|&id| id == f));
        let next_idx = match current_idx {
            Some(idx) => {
                if reverse {
                    if idx == 0 {
                        focusable.len() - 1
                    } else {
                        idx - 1
                    }
                } else {
                    (idx + 1) % focusable.len()
                }
            }
            None => {
                if reverse {
                    focusable.len() - 1
                } else {
                    0
                }
            }
        };
        self.focused = Some(focusable[next_idx]);
        self.focused
    }
    /// Find the innermost scrollable node whose layout rect contains (x, y).
    /// A node is scrollable if it is NodeType::Scroll or has overflow: auto/scroll.
    pub fn find_scroll_container_at(&self, x: f32, y: f32) -> Option<NodeId> {
        let mut best: Option<NodeId> = None;
        for node in self.nodes.values() {
            let is_scrollable = node.node_type == NodeType::Scroll
                || node
                    .styles
                    .get("overflow")
                    .map(|s| s == "auto" || s == "scroll")
                    .unwrap_or(false)
                || node
                    .styles
                    .get("overflow-y")
                    .map(|s| s == "auto" || s == "scroll")
                    .unwrap_or(false);
            if !is_scrollable {
                continue;
            }
            if let Some(r) = node.layout {
                if x >= r.x && x < r.x + r.w && y >= r.y && y < r.y + r.h {
                    // Prefer deeper (higher id as heuristic for depth)
                    best = Some(match best {
                        Some(prev) if prev.0 > node.id.0 => prev,
                        _ => node.id,
                    });
                }
            }
        }
        best
    }

    /// Scroll a node by `delta_y` pixels, clamping to [0, max_scroll].
    /// `max_scroll` = total content height - container height. Returns new scroll_y.
    pub fn scroll_by(&mut self, id: NodeId, delta_y: f32) -> f32 {
        // Gather info from immutable borrows first
        let (container_h, children, current_scroll) = match self.nodes.get(&id) {
            Some(n) => (
                n.layout.map(|r| r.h).unwrap_or(0.0),
                n.children.clone(),
                n.scroll_y,
            ),
            None => return 0.0,
        };
        let content_h = children
            .iter()
            .filter_map(|c| self.nodes.get(c).and_then(|n| n.layout))
            .map(|r| r.y + r.h)
            .fold(0.0f32, f32::max);
        let max_scroll = (content_h - container_h).max(0.0);
        let new_scroll = (current_scroll + delta_y).clamp(0.0, max_scroll);
        if let Some(node) = self.nodes.get_mut(&id) {
            node.scroll_y = new_scroll;
        }
        new_scroll
    }

    // --- Dirty tracking ---

    /// Mark a node dirty and propagate up to ancestors. Also sets the global
    /// `dirty_layout` flag so the frame loop knows layout is needed.
    pub fn mark_dirty(&mut self, id: NodeId) {
        self.dirty_layout = true;
        let mut current = Some(id);
        while let Some(nid) = current {
            if let Some(node) = self.nodes.get_mut(&nid) {
                if node.dirty {
                    // Already dirty — ancestors must be dirty too, stop early
                    break;
                }
                node.dirty = true;
                current = node.parent;
            } else {
                break;
            }
        }
    }

    /// Check if a specific node is dirty (needs relayout).
    pub fn is_dirty(&self, id: NodeId) -> bool {
        self.nodes.get(&id).map(|n| n.dirty).unwrap_or(false)
    }

    pub fn mark_needs_layout(&mut self, id: NodeId) {
        self.mark_dirty(id);
        self.dirty_layout = true;
    }

    pub fn mark_needs_paint(&mut self, _id: NodeId) {
        self.dirty_paint = true;
    }

    pub fn needs_layout(&self) -> bool {
        self.dirty_layout
    }

    pub fn needs_paint(&self) -> bool {
        self.dirty_paint
    }

    /// Clear all dirty flags (global + per-node).
    pub fn clear_dirty(&mut self) {
        self.dirty_layout = false;
        self.dirty_paint = false;
        for node in self.nodes.values_mut() {
            node.dirty = false;
        }
    }

    // --- Spatial index ---

    pub fn rebuild_spatial_index(&mut self) {
        self.spatial_index.clear();
        let mut index = Vec::new();
        fn collect(nodes: &HashMap<NodeId, Node>, children: &[NodeId], index: &mut Vec<(NodeId, Rect)>) {
            for &child_id in children {
                if let Some(node) = nodes.get(&child_id) {
                    if let Some(rect) = &node.layout {
                        index.push((child_id, rect.clone()));
                    }
                    let kids = node.children.clone();
                    collect(nodes, &kids, index);
                }
            }
        }
        let roots = self.root_children.clone();
        collect(&self.nodes, &roots, &mut index);
        self.spatial_index = index;
    }

    // --- Scroll dimensions ---

    pub fn compute_max_scroll(&self, id: NodeId) -> f32 {
        if let Some(node) = self.nodes.get(&id) {
            let container_h = node.layout.as_ref().map(|r| r.h).unwrap_or(0.0);
            let content_h = node.virtual_content_height.unwrap_or_else(|| {
                node.children.iter().filter_map(|c| {
                    self.nodes.get(c).and_then(|n| n.layout.as_ref()).map(|r| r.y + r.h)
                }).fold(0.0f32, f32::max) - node.layout.as_ref().map(|r| r.y).unwrap_or(0.0)
            });
            (content_h - container_h).max(0.0)
        } else {
            0.0
        }
    }

    pub fn set_scroll(&mut self, id: NodeId, scroll_y: f32) {
        if let Some(n) = self.nodes.get_mut(&id) {
            n.scroll_y = scroll_y;
        }
    }

    pub fn compute_scroll_dims(&self, id: NodeId) -> (f32, f32) {
        if let Some(node) = self.nodes.get(&id) {
            if let Some(rect) = &node.layout {
                return (rect.w, rect.h);
            }
        }
        (0.0, 0.0)
    }

    pub fn compute_scroll_dims_all(&self) -> Vec<(NodeId, f32, f32)> {
        let mut dims = Vec::new();
        for (&id, node) in &self.nodes {
            let overflow = node.styles.get("overflow").map(|s| s.as_str()).unwrap_or("visible");
            if overflow == "auto" || overflow == "scroll" || overflow == "hidden" {
                if let Some(rect) = &node.layout {
                    dims.push((id, rect.w, rect.h));
                }
            }
        }
        dims
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use rvst_core::{NodeId, NodeType, Op};

    #[test]
    fn apply_create_and_set_text() {
        let mut tree = Tree::new();
        tree.apply(Op::CreateNode {
            id: NodeId(1),
            node_type: NodeType::Text,
        });
        tree.apply(Op::SetText {
            id: NodeId(1),
            value: "Count: 0".into(),
        });
        tree.apply(Op::Insert {
            parent: NodeId(0),
            child: NodeId(1),
            anchor: None,
        });
        assert_eq!(tree.collect_text(), "Count: 0");
    }

    #[test]
    fn apply_insert_wires_parent_child() {
        let mut tree = Tree::new();
        tree.apply(Op::CreateNode {
            id: NodeId(1),
            node_type: NodeType::View,
        });
        tree.apply(Op::CreateNode {
            id: NodeId(2),
            node_type: NodeType::Text,
        });
        tree.apply(Op::Insert {
            parent: NodeId(1),
            child: NodeId(2),
            anchor: None,
        });
        assert_eq!(tree.nodes[&NodeId(1)].children, vec![NodeId(2)]);
        assert_eq!(tree.nodes[&NodeId(2)].parent, Some(NodeId(1)));
    }

    #[test]
    fn collect_text_skips_empty() {
        let mut tree = Tree::new();
        tree.apply(Op::CreateNode {
            id: NodeId(1),
            node_type: NodeType::Text,
        });
        tree.apply(Op::SetText {
            id: NodeId(1),
            value: "".into(),
        });
        tree.apply(Op::CreateNode {
            id: NodeId(2),
            node_type: NodeType::Text,
        });
        tree.apply(Op::SetText {
            id: NodeId(2),
            value: "Count: 0".into(),
        });
        tree.apply(Op::Insert {
            parent: NodeId(0),
            child: NodeId(1),
            anchor: None,
        });
        tree.apply(Op::Insert {
            parent: NodeId(0),
            child: NodeId(2),
            anchor: None,
        });
        assert_eq!(tree.collect_text(), "Count: 0");
    }

    #[test]
    fn collect_text_preserves_insertion_order() {
        let mut tree = Tree::new();
        // Create nodes
        tree.apply(Op::CreateNode {
            id: NodeId(1),
            node_type: NodeType::View,
        });
        tree.apply(Op::CreateNode {
            id: NodeId(2),
            node_type: NodeType::Text,
        });
        tree.apply(Op::CreateNode {
            id: NodeId(3),
            node_type: NodeType::Text,
        });
        tree.apply(Op::CreateNode {
            id: NodeId(4),
            node_type: NodeType::Text,
        });
        // Set text on the three text nodes
        tree.apply(Op::SetText {
            id: NodeId(2),
            value: "Count:".into(),
        });
        tree.apply(Op::SetText {
            id: NodeId(3),
            value: " ".into(),
        });
        tree.apply(Op::SetText {
            id: NodeId(4),
            value: "0".into(),
        });
        // Insert node 1 as a root (parent NodeId(0) doesn't exist → goes into root_children)
        tree.apply(Op::Insert {
            parent: NodeId(0),
            child: NodeId(1),
            anchor: None,
        });
        // Insert text nodes under node 1 in order
        tree.apply(Op::Insert {
            parent: NodeId(1),
            child: NodeId(2),
            anchor: None,
        });
        tree.apply(Op::Insert {
            parent: NodeId(1),
            child: NodeId(3),
            anchor: None,
        });
        tree.apply(Op::Insert {
            parent: NodeId(1),
            child: NodeId(4),
            anchor: None,
        });
        // Must come out in insertion order via DFS
        assert_eq!(tree.collect_text(), "Count: 0");
    }

    #[test]
    fn listen_stores_handler() {
        let mut tree = Tree::new();
        tree.apply(Op::CreateNode {
            id: NodeId(10),
            node_type: NodeType::Button,
        });
        tree.apply(Op::Listen {
            id: NodeId(10),
            event: "click".into(),
            handler_id: 42,
        });
        assert_eq!(tree.find_handler("click"), Some(42));
    }

    #[test]
    fn unlisten_removes_handler() {
        let mut tree = Tree::new();
        tree.apply(Op::CreateNode {
            id: NodeId(10),
            node_type: NodeType::Button,
        });
        tree.apply(Op::Listen {
            id: NodeId(10),
            event: "click".into(),
            handler_id: 42,
        });
        tree.apply(Op::Unlisten {
            id: NodeId(10),
            event: "click".into(),
            handler_id: 42,
        });
        assert_eq!(tree.find_handler("click"), None);
    }

    #[test]
    fn layout_defaults_to_none() {
        let mut tree = Tree::new();
        tree.apply(Op::CreateNode {
            id: NodeId(1),
            node_type: NodeType::Button,
        });
        assert_eq!(tree.get_layout(NodeId(1)), None);
    }

    #[test]
    fn set_and_get_layout() {
        use rvst_core::Rect;
        let mut tree = Tree::new();
        tree.apply(Op::CreateNode {
            id: NodeId(1),
            node_type: NodeType::Button,
        });
        tree.set_layout(
            NodeId(1),
            Rect {
                x: 10.0,
                y: 20.0,
                w: 100.0,
                h: 40.0,
            },
        );
        let r = tree.get_layout(NodeId(1)).unwrap();
        assert_eq!(
            r,
            rvst_core::Rect {
                x: 10.0,
                y: 20.0,
                w: 100.0,
                h: 40.0
            }
        );
    }

    #[test]
    fn root_children_exposes_inserted_roots() {
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
        assert!(tree.root_children().contains(&NodeId(1)));
    }

    #[test]
    fn set_layout_on_nonexistent_node_does_not_panic() {
        let mut tree = Tree::new();
        // NodeId(99) was never created — should silently do nothing
        tree.set_layout(
            NodeId(99),
            rvst_core::Rect {
                x: 0.0,
                y: 0.0,
                w: 50.0,
                h: 20.0,
            },
        );
        assert_eq!(tree.get_layout(NodeId(99)), None);
    }

    #[test]
    fn hit_test_button_returns_true_inside_rect() {
        use rvst_core::Rect;
        let mut tree = Tree::new();
        tree.apply(Op::CreateNode {
            id: NodeId(1),
            node_type: NodeType::Button,
        });
        tree.apply(Op::Insert {
            parent: NodeId(0),
            child: NodeId(1),
            anchor: None,
        });
        tree.set_layout(
            NodeId(1),
            Rect {
                x: 0.0,
                y: 0.0,
                w: 800.0,
                h: 54.0,
            },
        );
        assert!(tree.hit_test_button(400.0, 27.0).is_some(), "inside button");
        assert!(
            tree.hit_test_button(400.0, 0.0).is_some(),
            "inclusive lower boundary"
        );
        assert!(tree.hit_test_button(400.0, 100.0).is_none(), "below button");
        assert!(
            tree.hit_test_button(400.0, 54.0).is_none(),
            "exclusive upper boundary"
        );
    }

    #[test]
    fn hit_test_finds_handler_within_rect() {
        use rvst_core::Rect;
        let mut tree = Tree::new();
        tree.apply(Op::CreateNode {
            id: NodeId(1),
            node_type: NodeType::Button,
        });
        tree.apply(Op::Insert {
            parent: NodeId(0),
            child: NodeId(1),
            anchor: None,
        });
        tree.apply(Op::Listen {
            id: NodeId(1),
            event: "click".into(),
            handler_id: 42,
        });
        tree.set_layout(
            NodeId(1),
            Rect {
                x: 10.0,
                y: 10.0,
                w: 100.0,
                h: 50.0,
            },
        );
        // Inside the rect
        assert_eq!(tree.find_handler_at("click", 50.0, 30.0), Some(42));
        // Outside the rect
        assert_eq!(tree.find_handler_at("click", 5.0, 5.0), None);
        assert_eq!(tree.find_handler_at("click", 150.0, 30.0), None);
    }

    #[test]
    fn root_children_excludes_non_root_nodes() {
        let mut tree = Tree::new();
        tree.apply(Op::CreateNode {
            id: NodeId(1),
            node_type: NodeType::View,
        });
        tree.apply(Op::CreateNode {
            id: NodeId(2),
            node_type: NodeType::Text,
        });
        // Insert 1 as root, 2 as child of 1 (not root)
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
        let roots = tree.root_children();
        assert!(roots.contains(&NodeId(1)), "node 1 should be a root");
        assert!(!roots.contains(&NodeId(2)), "node 2 is a child, not a root");
    }

    #[test]
    fn hit_test_view_with_click_handler() {
        use rvst_core::Rect;
        let mut tree = Tree::new();
        // Create a View node with a click handler and a layout rect
        tree.apply(Op::CreateNode {
            id: NodeId(1),
            node_type: NodeType::View,
        });
        tree.apply(Op::Insert {
            parent: NodeId(0),
            child: NodeId(1),
            anchor: None,
        });
        tree.apply(Op::Listen {
            id: NodeId(1),
            event: "click".into(),
            handler_id: 42,
        });
        tree.set_layout(
            NodeId(1),
            Rect {
                x: 10.0,
                y: 10.0,
                w: 100.0,
                h: 50.0,
            },
        );

        // Hit inside the view rect (x=60, y=35 is within 10..110, 10..60)
        let result = tree.hit_test_button(60.0, 35.0);
        assert_eq!(
            result,
            Some(NodeId(1)),
            "View with click handler should be hittable"
        );

        // Miss outside the rect
        let miss = tree.hit_test_button(5.0, 5.0);
        assert_eq!(miss, None, "Hit outside rect should return None");
    }

    #[test]
    fn value_caching_skips_identical_set_text() {
        let mut tree = Tree::new();
        tree.apply(Op::CreateNode {
            id: NodeId(1),
            node_type: NodeType::Text,
        });
        tree.apply(Op::SetText {
            id: NodeId(1),
            value: "hello".into(),
        });
        // Clear dirty flags after initial setup
        tree.clear_dirty();
        assert!(!tree.dirty_layout);
        assert!(!tree.dirty_paint);
        assert_eq!(tree.skipped_ops, 0);

        // Apply same text again — should be skipped
        tree.apply(Op::SetText {
            id: NodeId(1),
            value: "hello".into(),
        });
        assert!(!tree.dirty_layout, "dirty_layout should NOT be set for identical text");
        assert!(!tree.dirty_paint, "dirty_paint should NOT be set for identical text");
        assert_eq!(tree.skipped_ops, 1, "should have skipped one op");

        // Apply different text — should go through
        tree.apply(Op::SetText {
            id: NodeId(1),
            value: "world".into(),
        });
        assert!(tree.dirty_layout, "dirty_layout should be set for changed text");
        assert_eq!(tree.skipped_ops, 1, "skip count should not increase for changed text");
        assert_eq!(tree.nodes[&NodeId(1)].text.as_deref(), Some("world"));
    }

    #[test]
    fn value_caching_skips_identical_set_attr() {
        let mut tree = Tree::new();
        tree.apply(Op::CreateNode {
            id: NodeId(1),
            node_type: NodeType::View,
        });
        tree.apply(Op::SetAttr {
            id: NodeId(1),
            key: "class".into(),
            value: "active".into(),
        });
        tree.clear_dirty();

        // Same attr — skip
        tree.apply(Op::SetAttr {
            id: NodeId(1),
            key: "class".into(),
            value: "active".into(),
        });
        assert!(!tree.dirty_layout);
        assert_eq!(tree.skipped_ops, 1);

        // Different attr — apply
        tree.apply(Op::SetAttr {
            id: NodeId(1),
            key: "class".into(),
            value: "inactive".into(),
        });
        assert!(tree.dirty_layout);
        assert_eq!(tree.skipped_ops, 1);
    }

    #[test]
    fn value_caching_skips_identical_set_style() {
        let mut tree = Tree::new();
        tree.apply(Op::CreateNode {
            id: NodeId(1),
            node_type: NodeType::View,
        });
        tree.apply(Op::SetStyle {
            id: NodeId(1),
            key: "color".into(),
            value: "red".into(),
        });
        tree.clear_dirty();

        // Same style — skip
        tree.apply(Op::SetStyle {
            id: NodeId(1),
            key: "color".into(),
            value: "red".into(),
        });
        assert!(!tree.dirty_layout);
        assert_eq!(tree.skipped_ops, 1);
    }

    #[test]
    fn clone_template_creates_subtree() {
        use rvst_core::NodeDescriptor;
        let mut tree = Tree::new();
        // Template: <button>Click</button>  (button with text child)
        let desc = vec![NodeDescriptor {
            node_type: NodeType::Button,
            text: None,
            attrs: vec![("type".into(), "submit".into())],
            styles: vec![],
            children: vec![NodeDescriptor {
                node_type: NodeType::Text,
                text: Some("Click".into()),
                attrs: vec![],
                styles: vec![],
                children: vec![],
            }],
        }];
        tree.apply(Op::CloneTemplate {
            template_id: 12345,
            start_id: NodeId(100),
            descriptor: desc,
        });
        // Button node should exist at id 100
        assert!(tree.nodes.contains_key(&NodeId(100)));
        assert_eq!(tree.nodes[&NodeId(100)].node_type, NodeType::Button);
        assert_eq!(
            tree.nodes[&NodeId(100)].styles.get("type").map(|s| s.as_str()),
            Some("submit")
        );
        // Text child at id 101
        assert!(tree.nodes.contains_key(&NodeId(101)));
        assert_eq!(tree.nodes[&NodeId(101)].node_type, NodeType::Text);
        assert_eq!(tree.nodes[&NodeId(101)].text.as_deref(), Some("Click"));
        // Parent-child wiring
        assert_eq!(tree.nodes[&NodeId(100)].children, vec![NodeId(101)]);
        assert_eq!(tree.nodes[&NodeId(101)].parent, Some(NodeId(100)));
        assert!(tree.dirty_layout);
    }
}

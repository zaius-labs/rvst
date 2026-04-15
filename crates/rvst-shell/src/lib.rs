pub mod ascii;
pub use rvst_engine::composite;
pub use rvst_engine::css;
pub(crate) mod inspector; // will be created in Task 2
pub use rvst_engine::layout;
pub mod renderquery_benchmark;
pub mod spacing_analyzer;
pub mod test_harness;
pub use rvst_snapshot as snapshot;
pub use inspector::{QueryResult, RvstInspector, VisualQuery};
pub use snapshot::{scene_diff, RenderTrace, SceneDiff, SceneSnapshot};

use rvst_quickjs as js_runtime;

use std::sync::Arc;

/// Return a per-user directory for RVST session files with restricted permissions.
fn session_dir() -> std::path::PathBuf {
    // Prefer XDG_RUNTIME_DIR (Linux, per-user, mode 0700)
    if let Ok(dir) = std::env::var("XDG_RUNTIME_DIR") {
        let path = std::path::PathBuf::from(dir).join("rvst-sessions");
        let _ = std::fs::create_dir_all(&path);
        return path;
    }
    // Fallback: system temp dir with restricted permissions
    let mut path = std::env::temp_dir();
    path.push("rvst-sessions");
    let _ = std::fs::create_dir_all(&path);
    #[cfg(unix)]
    {
        use std::os::unix::fs::PermissionsExt;
        let _ = std::fs::set_permissions(&path, std::fs::Permissions::from_mode(0o700));
    }
    path
}
use winit::application::ApplicationHandler;
use winit::event::WindowEvent;
use winit::event_loop::{ActiveEventLoop, ControlFlow, EventLoop};
use winit::window::{Window, WindowId};

pub struct ShellApp {
    pub window: Option<Arc<Window>>,
    pub renderer: Option<rvst_render_wgpu::Renderer>,
    pub runtime: Option<js_runtime::RvstRuntime>,
    pub tree: rvst_tree::Tree,
    pub text_renderer: rvst_text::TextRenderer,
    pub cursor_pos: Option<(f32, f32)>,
    pub hovered_node: Option<rvst_core::NodeId>,
    pub scale_factor: f32,
    pub last_scene: vello::Scene,
    /// Decoration state requested during initial mount (before window exists).
    /// Applied in `resumed()` when the window is created.
    pub want_decorations: bool,
    /// Modifier key state (updated on each key event).
    pub modifiers: winit::keyboard::ModifiersState,
    /// System clipboard via arboard.
    pub clipboard: Option<arboard::Clipboard>,
    /// Persisted Stylo engine for pseudo-class re-application on hover/focus changes.
    pub stylo_engine: Option<rvst_stylo::StyloEngine>,
    /// Currently active scroll container (for rubber-band snap-back animation).
    pub active_scroll_container: Option<rvst_core::NodeId>,
    /// Test harness command queue (populated by stdin reader thread).
    pub command_queue: Option<test_harness::CommandQueue>,
    /// Whether the app is running in test harness mode.
    pub test_mode: bool,
    /// Named snapshots for diff comparisons (test harness `snapshot_mark` / `diff` commands).
    pub marked_snapshots: std::collections::HashMap<String, rvst_snapshot::SceneSnapshot>,
    /// Timestamp of the last mouse click (for double/triple-click detection).
    pub last_click_time: std::time::Instant,
    /// Click count within the multi-click window (1=single, 2=double, 3=triple).
    pub click_count: u32,
    /// Timing: last layout pass duration in milliseconds.
    pub last_layout_ms: f64,
    /// Timing: last scene build duration in milliseconds.
    pub last_scene_build_ms: f64,
    /// Timing: last full frame duration in milliseconds.
    pub last_frame_ms: f64,
    /// Total frames rendered.
    pub frame_count: u64,
    /// Path to the session file written at startup (test mode).
    pub session_file: Option<String>,
    /// Whether the streaming watch is active.
    pub watch_active: bool,
    /// Optional filter for watch events (role/text/class substring).
    pub watch_filter: Option<String>,
    /// Non-blocking wait: commands pause until this instant.
    pub test_wait_until: Option<std::time::Instant>,
    /// Native editor states keyed by node ID (for nodes with data-rvst-editor="true").
    pub editors: std::collections::HashMap<rvst_core::NodeId, rvst_editor::EditorState>,
    /// Which editor node is being dragged in (mouse held down).
    pub editor_dragging: Option<rvst_core::NodeId>,
    /// Cached pointer capture node (mirrors js_runtime::get_pointer_capture).
    pub pointer_capture: Option<rvst_core::NodeId>,
    /// CSS transition manager — tracks active interpolations per-node.
    pub transition_manager: rvst_engine::transition::TransitionManager,
    /// Pre-computed Taffy layout styles from Stylo CSS engine.
    /// When populated, layout::flow() uses these directly instead of parsing node.styles strings.
    pub taffy_styles: std::collections::HashMap<rvst_core::NodeId, taffy::Style>,
    /// Pre-computed paint properties from Stylo CSS engine.
    /// Stored for future direct pipeline; currently still written to node.styles for composite.rs.
    pub paint_props: std::collections::HashMap<rvst_core::NodeId, rvst_stylo::values::PaintProps>,
}

impl Default for ShellApp {
    fn default() -> Self {
        Self::new()
    }
}

impl ShellApp {
    pub fn new() -> Self {
        Self {
            window: None,
            renderer: None,
            runtime: None,
            tree: rvst_tree::Tree::new(),
            text_renderer: rvst_text::TextRenderer::new(),
            cursor_pos: None,
            hovered_node: None,
            scale_factor: 1.0,
            last_scene: vello::Scene::new(),
            want_decorations: true,
            modifiers: winit::keyboard::ModifiersState::empty(),
            clipboard: arboard::Clipboard::new().ok(),
            stylo_engine: None,
            active_scroll_container: None,
            command_queue: None,
            test_mode: false,
            marked_snapshots: std::collections::HashMap::new(),
            last_click_time: std::time::Instant::now(),
            click_count: 0,
            last_layout_ms: 0.0,
            last_scene_build_ms: 0.0,
            last_frame_ms: 0.0,
            frame_count: 0,
            session_file: None,
            watch_active: false,
            watch_filter: None,
            test_wait_until: None,
            editors: std::collections::HashMap::new(),
            editor_dragging: None,
            pointer_capture: None,
            transition_manager: rvst_engine::transition::TransitionManager::new(),
            taffy_styles: std::collections::HashMap::new(),
            paint_props: std::collections::HashMap::new(),
        }
    }

    /// Re-apply Stylo styles and update side maps. Convenience method that
    /// avoids borrow-checker issues with `self.stylo_engine` + `self.tree` + side maps.
    fn reapply_stylo_styles(&mut self) {
        if let Some(mut engine) = self.stylo_engine.take() {
            engine.restyle(&mut self.tree);
            apply_stylo_to_node_styles(&engine, &mut self.tree, &mut self.taffy_styles, &mut self.paint_props);
            self.stylo_engine = Some(engine);
        }
    }

    /// Canvas width in physical pixels.
    pub fn canvas_w(&self) -> u32 {
        self.renderer.as_ref().map(|r| r.size.width.max(1)).unwrap_or(1024)
    }

    /// Canvas height in physical pixels.
    pub fn canvas_h(&self) -> u32 {
        self.renderer.as_ref().map(|r| r.size.height.max(1)).unwrap_or(768)
    }

    /// Find a node by text and click its center. Used by the test harness.
    pub fn click_by_text(&mut self, text: &str) -> Result<(), String> {
        let vp_w = self.canvas_w() as f32;
        let vp_h = self.canvas_h() as f32;
        let snap = rvst_snapshot::SceneSnapshot::from_tree(&self.tree, vp_w, vp_h);
        let matches = snap.find_text(text);

        // Prefer interactive nodes (Button/Input) over plain text/views
        let node = matches.iter()
            .find(|n| n.node_type == "Button" && n.layout.is_some())
            .or_else(|| matches.iter().find(|n| n.layout.is_some()))
            .ok_or_else(|| format!("no clickable node with text '{}'", text))?;

        let layout = node.layout.as_ref().ok_or("node has no layout")?;

        // Validate the node is actually visible in the viewport
        let cx = layout.x + layout.w / 2.0;
        let cy = layout.y + layout.h / 2.0;
        let scale = self.scale_factor;
        let logical_w = vp_w / scale;
        let logical_h = vp_h / scale;

        if cx < 0.0 || cy < 0.0 || cx > logical_w || cy > logical_h {
            return Err(format!(
                "node '{}' (id={}) exists but is off-screen at ({:.0}, {:.0}), viewport is {}x{}",
                text, node.id, cx, cy, logical_w as u32, logical_h as u32
            ));
        }

        if layout.w <= 0.0 || layout.h <= 0.0 {
            return Err(format!(
                "node '{}' (id={}) has zero size ({}x{})",
                text, node.id, layout.w, layout.h
            ));
        }

        self.click_at(cx, cy)
    }

    /// Dispatch a click at (x, y). Finds the handler at that point, fires it,
    /// applies resulting ops and CSS. Layout/paint deferred to about_to_wait.
    pub fn click_at(&mut self, x: f32, y: f32) -> Result<(), String> {
        let hit_node = self.tree.hit_test_deepest(x, y)
            .or_else(|| self.tree.hit_test_button(x, y));
        let hit_id = hit_node.ok_or_else(|| format!("no hittable element at ({}, {})", x, y))?;

        // Focus input/textarea on click
        if let Some(n) = self.tree.nodes.get(&hit_id) {
            if matches!(n.node_type, rvst_core::NodeType::Input | rvst_core::NodeType::Textarea) {
                self.tree.focused = Some(hit_id);
            }
        }

        if let Some(runtime) = &mut self.runtime {
            if let Some(handler_id) = self.tree.find_handler("click") {
                let new_ops = runtime.dispatch_event(handler_id, hit_id.0)
                    .map_err(|e| format!("dispatch_event error: {:?}", e))?;
                let did_change = !new_ops.is_empty();
                for op in new_ops {
                    apply_op(op, &mut self.tree, self.window.as_deref(), None);
                }
                if did_change {
                    self.reapply_stylo_styles();
                }
            }
        }
        Ok(())
    }

    /// Scroll at (x, y) by delta_y pixels. Used by the test harness.
    pub fn scroll_at(&mut self, x: f32, y: f32, delta_y: f32) -> Result<(), String> {
        let scroll_id = self.tree.find_scroll_container_at(x, y)
            .ok_or_else(|| format!("no scroll container at ({}, {})", x, y))?;
        let new_scroll = self.tree.scroll_by(scroll_id, delta_y);
        // Dispatch scroll event to any registered "scroll" handlers
        let handler_ids: Vec<u32> = self.tree.handlers.iter()
            .filter(|(nid, ev, _)| *nid == scroll_id && ev == "scroll")
            .map(|(_, _, h)| *h)
            .collect();
        if let Some(runtime) = &mut self.runtime {
            if !handler_ids.is_empty() {
                if let Ok(new_ops) = runtime.dispatch_scroll_event(scroll_id.0, new_scroll, &handler_ids) {
                    for op in new_ops {
                        apply_op(op, &mut self.tree, self.window.as_deref(), None);
                    }
                }
            }
        }
        self.tree.mark_needs_paint(scroll_id);
        Ok(())
    }
}

impl ApplicationHandler for ShellApp {
    fn resumed(&mut self, event_loop: &ActiveEventLoop) {
        let attrs = Window::default_attributes()
            .with_title("rvst")
            .with_inner_size(winit::dpi::LogicalSize::new(1024.0, 768.0))
            .with_maximized(true)
            .with_decorations(self.want_decorations);
        let window = Arc::new(event_loop.create_window(attrs).unwrap());
        let renderer = rvst_render_wgpu::Renderer::new(window.clone());

        let size = window.inner_size();
        let cw = size.width.max(1);
        let ch = size.height.max(1);
        self.scale_factor = window.scale_factor() as f32;
        let cw_logical = (cw as f32 / self.scale_factor) as u32;
        let ch_logical = (ch as f32 / self.scale_factor) as u32;
        let roots = self.tree.root_children.clone();
        let precomputed = if self.taffy_styles.is_empty() { None } else { Some(&self.taffy_styles) };
        layout::flow(
            &mut self.tree,
            &roots,
            &mut self.text_renderer,
            cw_logical as f32,
            ch_logical as f32,
            self.scale_factor,
            precomputed,
        );
        self.tree.rebuild_spatial_index();
        let scene = composite::build_scene(
            &self.tree,
            &roots,
            &mut self.text_renderer,
            cw,
            ch,
            self.scale_factor,
        );
        self.last_scene = scene;
        self.tree.clear_dirty();

        self.window = Some(window.clone());
        self.renderer = Some(renderer);
        window.request_redraw();
        // render_scene is called in RedrawRequested
    }

    fn window_event(&mut self, event_loop: &ActiveEventLoop, _id: WindowId, event: WindowEvent) {
        match event {
            WindowEvent::CloseRequested => event_loop.exit(),
            WindowEvent::Resized(size) => {
                if let Some(r) = &mut self.renderer {
                    r.resize(size);
                }
                let cw = size.width.max(1);
                let ch = size.height.max(1);
                let cw_logical = (cw as f32 / self.scale_factor) as u32;
                let ch_logical = (ch as f32 / self.scale_factor) as u32;
                // Update viewport for @media query evaluation
                if let Some(engine) = &mut self.stylo_engine {
                    engine.set_viewport(cw_logical as f32, ch_logical as f32);
                }
                self.reapply_stylo_styles();
                let roots = self.tree.root_children.clone();
                let precomputed = if self.taffy_styles.is_empty() { None } else { Some(&self.taffy_styles) };
                layout::flow(
                    &mut self.tree,
                    &roots,
                    &mut self.text_renderer,
                    cw_logical as f32,
                    ch_logical as f32,
                    self.scale_factor,
                    precomputed,
                );
                self.tree.rebuild_spatial_index();
                let scene = composite::build_scene(
                    &self.tree,
                    &roots,
                    &mut self.text_renderer,
                    cw,
                    ch,
                    self.scale_factor,
                );
                self.last_scene = scene;
                self.tree.clear_dirty();
                // Dispatch JS resize events — update innerWidth/innerHeight, viewport
                // tracking variable, and fire window 'resize' listeners + matchMedia
                // change callbacks for responsive Svelte components.
                if let Some(runtime) = &mut self.runtime {
                    let js = format!(
                        r#"
globalThis.innerWidth = {cw_logical};
globalThis.innerHeight = {ch_logical};
globalThis.__rvst_viewport_w = {cw_logical};
// Fire window.addEventListener('resize', ...) handlers
if (typeof _win_handlers !== 'undefined' && _win_handlers.resize) {{
  const evt = {{ type: 'resize', target: globalThis }};
  for (const fn of _win_handlers.resize) {{ try {{ fn(evt); }} catch(e) {{}} }}
}}
"#
                    );
                    let _ = runtime.eval(&js);
                }
                if let Some(window) = &self.window {
                    window.request_redraw();
                }
            }
            WindowEvent::RedrawRequested => {
                if let Some(r) = &mut self.renderer {
                    match r.render_scene(&self.last_scene) {
                        Ok(_) => {}
                        Err(
                            rvst_render_wgpu::SurfaceError::Lost
                            | rvst_render_wgpu::SurfaceError::Outdated,
                        ) => {
                            let size = r.size;
                            r.resize(size);
                        }
                        Err(e) => eprintln!("render error: {e:?}"),
                    }
                }
            }
            WindowEvent::CursorMoved { position, .. } => {
                let cx = position.x as f32 / self.scale_factor;
                let cy = position.y as f32 / self.scale_factor;
                self.cursor_pos = Some((cx, cy));
                // Editor drag selection — update selection while mouse is held down
                if let Some(drag_node_id) = self.editor_dragging {
                    if let Some(editor) = self.editors.get_mut(&drag_node_id) {
                        if let Some(rect) = self.tree.nodes.get(&drag_node_id).and_then(|n| n.layout.as_ref()) {
                            let padding: f32 = self.tree.nodes.get(&drag_node_id)
                                .and_then(|n| n.styles.get("padding"))
                                .and_then(|p| p.trim_end_matches("px").parse().ok())
                                .unwrap_or(0.0);
                            let rel_x = cx - rect.x - padding;
                            let rel_y = cy - rect.y - padding;
                            let layout = rvst_editor::layout_editor(
                                editor, &mut self.text_renderer,
                                rect.w - padding * 2.0, 16.0, 25.6,
                            );
                            if let Some(point) = rvst_editor::hit_test_position(
                                rel_x, rel_y, &layout, editor, &mut self.text_renderer, 16.0, rect.w - padding * 2.0,
                            ) {
                                // Keep anchor from mousedown, update focus to current position
                                if let Some(sel) = &editor.selection {
                                    editor.set_selection(rvst_editor::Selection {
                                        anchor: sel.anchor,
                                        focus: point,
                                    });
                                }
                            }
                            self.tree.mark_needs_paint(drag_node_id);
                            if let Some(w) = &self.window {
                                w.request_redraw();
                            }
                        }
                    }
                }
                // Only do hit testing if tree is small enough to be responsive.
                // Large trees (>2000 nodes) skip per-move hit testing to avoid
                // O(n) scans on every mouse move event.
                if self.tree.nodes.len() > 2000 {
                    return;
                }
                let hit = self.tree.hit_test_deepest(cx, cy);
                // Sync pointer capture state from JS runtime
                self.pointer_capture = js_runtime::get_pointer_capture()
                    .map(rvst_core::NodeId);
                // Dispatch pointermove — use captured element if pointer capture is active,
                // otherwise use hit test result. This ensures drag interactions work even
                // when the cursor moves outside the element boundary.
                let move_target = self.pointer_capture.or(hit);
                if let Some(target_id) = move_target {
                    if let Some(runtime) = &mut self.runtime {
                        let js = format!(
                            r#"
if (typeof __rvst_dispatch_pointer !== 'undefined') {{
  __rvst_dispatch_pointer('pointermove', {target_id}, {cx}, {cy});
}}
"#,
                            target_id = target_id.0,
                            cx = cx,
                            cy = cy,
                        );
                        let _ = runtime.eval(&js);
                    }
                }
                let hit_node_type = hit
                    .and_then(|id| self.tree.nodes.get(&id))
                    .map(|n| n.node_type.clone());
                if let Some(window) = &self.window {
                    let icon = match hit_node_type {
                        Some(rvst_core::NodeType::Button) => winit::window::CursorIcon::Pointer,
                        Some(rvst_core::NodeType::Input) | Some(rvst_core::NodeType::Textarea) => {
                            winit::window::CursorIcon::Text
                        }
                        _ => winit::window::CursorIcon::Default,
                    };
                    window.set_cursor(icon);
                    // Track hover for visual feedback — only redraw if hover target changed
                    let new_hover = hit.filter(|id| {
                        self.tree
                            .nodes
                            .get(id)
                            .map(|n| matches!(n.node_type, rvst_core::NodeType::Button))
                            .unwrap_or(false)
                    });
                    if new_hover != self.hovered_node {
                        // Dispatch mouseleave + pointerleave on old hover target
                        if let Some(old_id) = self.hovered_node {
                            let leave_hid = self.tree.find_handler_on_node(old_id, "mouseleave");
                            if let (Some(hid), Some(runtime)) = (leave_hid, &mut self.runtime) {
                                let _ = runtime.dispatch_event(hid, old_id.0);
                            }
                            // Dispatch pointerleave alongside mouseleave
                            let ptr_leave_hid = self.tree.find_handler_on_node(old_id, "pointerleave");
                            if let (Some(hid), Some(runtime)) = (ptr_leave_hid, &mut self.runtime) {
                                let _ = runtime.dispatch_event(hid, old_id.0);
                            }
                        }
                        // Dispatch mouseenter + pointerenter on new hover target
                        if let Some(new_id) = new_hover {
                            let enter_hid = self.tree.find_handler_on_node(new_id, "mouseenter");
                            if let (Some(hid), Some(runtime)) = (enter_hid, &mut self.runtime) {
                                let _ = runtime.dispatch_event(hid, new_id.0);
                            }
                            // Dispatch pointerenter alongside mouseenter
                            let ptr_enter_hid = self.tree.find_handler_on_node(new_id, "pointerenter");
                            if let (Some(hid), Some(runtime)) = (ptr_enter_hid, &mut self.runtime) {
                                let _ = runtime.dispatch_event(hid, new_id.0);
                            }
                        }

                        self.hovered_node = new_hover;
                        self.tree.hovered = new_hover;
                        // Update Stylo engine hover state and re-apply styles
                        if let Some(mut engine) = self.stylo_engine.take() {
                            engine.hovered_node = new_hover;
                            reapply_stylo_with_transitions(
                                &mut engine,
                                &mut self.tree,
                                &mut self.transition_manager,
                                &mut self.taffy_styles,
                                &mut self.paint_props,
                            );
                            self.stylo_engine = Some(engine);
                        }
                        // Mark needs_paint so about_to_wait picks up the hover change.
                        // CSS reapply above may already set dirty flags; ensure paint is marked
                        // even if no :hover rules matched.
                        self.tree.mark_needs_paint(rvst_core::NodeId(0));
                    }
                }
            }
            WindowEvent::MouseInput {
                state: winit::event::ElementState::Pressed,
                button: winit::event::MouseButton::Left,
                ..
            } => {
                // Multi-click detection (double-click = word select, triple = line)
                let now = std::time::Instant::now();
                if now.duration_since(self.last_click_time).as_millis() < 400 {
                    self.click_count += 1;
                } else {
                    self.click_count = 1;
                }
                self.last_click_time = now;

                if let Some((cx, cy)) = self.cursor_pos {
                    // Focus input/textarea/contenteditable if clicked.
                    // For contenteditable, the click target may be a child node —
                    // walk up to find the contenteditable ancestor.
                    if let Some(deep_id) = self.tree.hit_test_deepest(cx, cy) {
                        let mut focus_id = None;
                        let mut check_id = Some(deep_id);
                        while let Some(nid) = check_id {
                            if let Some(n) = self.tree.nodes.get(&nid) {
                                let is_editable = matches!(
                                    n.node_type,
                                    rvst_core::NodeType::Input | rvst_core::NodeType::Textarea
                                ) || n.styles.get("contenteditable").map(|v| v == "true" || v == "").unwrap_or(false)
                                   || n.styles.get("data-rvst-editor").map(|v| v == "true").unwrap_or(false);
                                if is_editable {
                                    focus_id = Some(nid);
                                    break;
                                }
                                check_id = n.parent;
                            } else {
                                break;
                            }
                        }
                        if let Some(fid) = focus_id {
                            self.tree.focused = Some(fid);
                            self.tree.mark_needs_paint(fid);

                            // For native editor nodes, position cursor via hit testing
                            if self.editors.contains_key(&fid) {
                                if let Some(node) = self.tree.nodes.get(&fid) {
                                    if let Some(rect) = node.layout.clone() {
                                        let padding: f32 = node
                                            .styles
                                            .get("padding")
                                            .and_then(|p| p.trim_end_matches("px").parse().ok())
                                            .unwrap_or(0.0);
                                        let rel_x = cx - rect.x - padding;
                                        let rel_y = cy - rect.y - padding;
                                        let content_width = rect.w - padding * 2.0;
                                        if let Some(editor) = self.editors.get_mut(&fid) {
                                            let layout = rvst_editor::layout_editor(
                                                editor,
                                                &mut self.text_renderer,
                                                content_width,
                                                16.0,
                                                25.6,
                                            );
                                            if let Some(point) = rvst_editor::hit_test_position(
                                                rel_x,
                                                rel_y,
                                                &layout,
                                                editor,
                                                &mut self.text_renderer,
                                                16.0,
                                                content_width,
                                            ) {
                                                match self.click_count {
                                                    2 => {
                                                        // Double click — select word
                                                        if let Some(enode) = editor.node(point.key) {
                                                            let text = enode.text_content();
                                                            let (start, end) = rvst_editor::word_boundaries(text, point.offset);
                                                            editor.set_selection(rvst_editor::Selection {
                                                                anchor: rvst_editor::SelectionPoint { key: point.key, offset: start },
                                                                focus: rvst_editor::SelectionPoint { key: point.key, offset: end },
                                                            });
                                                        }
                                                    }
                                                    3 => {
                                                        // Triple click — select entire line/paragraph
                                                        if let Some(enode) = editor.node(point.key) {
                                                            let len = enode.text_content().chars().count();
                                                            editor.set_selection(rvst_editor::Selection {
                                                                anchor: rvst_editor::SelectionPoint { key: point.key, offset: 0 },
                                                                focus: rvst_editor::SelectionPoint { key: point.key, offset: len },
                                                            });
                                                        }
                                                    }
                                                    _ => {
                                                        // Single click (or 4+ resets) — position cursor
                                                        if self.click_count > 3 {
                                                            self.click_count = 1;
                                                        }
                                                        editor.set_selection(
                                                            rvst_editor::Selection::collapsed(
                                                                point.key,
                                                                point.offset,
                                                            ),
                                                        );
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                                // Start drag tracking for editor nodes
                                self.editor_dragging = Some(fid);
                            } else {
                                // Update JS Selection state and document.activeElement.
                                // Lexical needs a valid selection to know where to insert text.
                                if let Some(runtime) = &mut self.runtime {
                                    let js = format!(
                                        r#"(function() {{
                                            const el = __rvst_elements.get({fid});
                                            if (el) {{
                                                document._activeElement = el;
                                                __rvst_update_selection_from_click(el, {cx});
                                                // Dispatch focus event on element
                                                if (el.dispatchEvent) {{
                                                    el.dispatchEvent(new FocusEvent('focus', {{ bubbles: false }}));
                                                }}
                                                // Dispatch selectionchange on document — Lexical uses this
                                                // to sync DOM selection to its internal selection model.
                                                const docHandlers = _doc_handlers['selectionchange'];
                                                if (docHandlers) {{
                                                    const evt = {{ type: 'selectionchange', target: document }};
                                                    for (const h of docHandlers) {{ h(evt); }}
                                                }}
                                            }}
                                        }})();"#,
                                        fid = fid.0, cx = cx,
                                    );
                                    if let Ok(ops) = runtime.eval(&js) {
                                        for op in ops {
                                            apply_op(op, &mut self.tree, self.window.as_deref(), Some(event_loop));
                                        }
                                    }
                                }
                            }
                        }
                    }
                    // Dispatch pointerdown + mousedown before click.
                    // pointerdown: needed by drag libraries (svelte-dnd-action, @neodrag/svelte)
                    // mousedown: needed by Svelte onmousedown handlers (e.g. window dragging)
                    if let Some(target_id) = self.tree.hit_test_deepest(cx, cy) {
                        if let Some(runtime) = &mut self.runtime {
                            let js = format!(
                                "if (typeof __rvst_dispatch_pointer !== 'undefined') {{ __rvst_dispatch_pointer('pointerdown', {}, {}, {}); __rvst_dispatch_pointer('mousedown', {}, {}, {}); }}",
                                target_id.0, cx, cy, target_id.0, cx, cy,
                            );
                            if let Ok(ops) = runtime.eval(&js) {
                                for op in ops {
                                    apply_op(op, &mut self.tree, self.window.as_deref(), Some(event_loop));
                                }
                            }
                        }
                    }
                    // Sync pointer capture — pointerdown handlers may call setPointerCapture
                    self.pointer_capture = js_runtime::get_pointer_capture()
                        .map(rvst_core::NodeId);
                    // Fire gotpointercapture on the captured element
                    if let Some(cap_id) = self.pointer_capture {
                        if let Some(runtime) = &mut self.runtime {
                            let js = format!(
                                "if (typeof __rvst_dispatch_pointer !== 'undefined') {{ __rvst_dispatch_pointer('gotpointercapture', {}, 0, 0); }}",
                                cap_id.0,
                            );
                            let _ = runtime.eval(&js);
                        }
                    }
                    // Dispatch click to the DEEPEST node at the click point.
                    // Svelte 5's event delegation walks composedPath from the
                    // target up through parents to find the element with the
                    // handler — any element can have onclick, not just buttons.
                    if let Some(target_id) = self.tree.hit_test_deepest(cx, cy)
                        .or_else(|| self.tree.hit_test_button(cx, cy))
                    {
                        if let Some(handler_id) = self.tree.find_handler("click") {
                            if let Some(runtime) = &mut self.runtime {
                                if let Ok(ops) = runtime.dispatch_event(handler_id, target_id.0) {
                                    for op in ops {
                                        apply_op(op, &mut self.tree, self.window.as_deref(), Some(event_loop));
                                    }
                                }
                            }
                        }
                    }
                    // Re-apply CSS after every click
                    self.reapply_stylo_styles();
                    // Force repaint
                    self.tree.mark_needs_layout(rvst_core::NodeId(0));
                    if let Some(w) = &self.window {
                        w.request_redraw();
                    }
                }
            }
            // Right-click → dispatch "contextmenu" event
            WindowEvent::MouseInput {
                state: winit::event::ElementState::Pressed,
                button: winit::event::MouseButton::Right,
                ..
            } => {
                if let Some((cx, cy)) = self.cursor_pos {
                    if let Some(target_id) = self.tree.hit_test_deepest(cx, cy)
                        .or_else(|| self.tree.hit_test_button(cx, cy))
                    {
                        if let Some(handler_id) = self.tree.find_handler("contextmenu") {
                            if let Some(runtime) = &mut self.runtime {
                                if let Ok(ops) = runtime.dispatch_contextmenu(handler_id, target_id.0, cx, cy) {
                                    for op in ops {
                                        apply_op(op, &mut self.tree, self.window.as_deref(), Some(event_loop));
                                    }
                                }
                            }
                        }
                    }
                    self.reapply_stylo_styles();
                    self.tree.mark_needs_layout(rvst_core::NodeId(0));
                    if let Some(w) = &self.window {
                        w.request_redraw();
                    }
                }
            }
            // Mouse button released → dispatch pointerup for drag libraries
            WindowEvent::MouseInput {
                state: winit::event::ElementState::Released,
                button: winit::event::MouseButton::Left,
                ..
            } => {
                self.editor_dragging = None;
                // Sync pointer capture state
                self.pointer_capture = js_runtime::get_pointer_capture()
                    .map(rvst_core::NodeId);
                if let Some((cx, cy)) = self.cursor_pos {
                    // Route pointerup to captured element if active, otherwise hit test
                    let up_target = self.pointer_capture
                        .or_else(|| self.tree.hit_test_deepest(cx, cy));
                    if let Some(target_id) = up_target {
                        if let Some(runtime) = &mut self.runtime {
                            let js = format!(
                                "if (typeof __rvst_dispatch_pointer !== 'undefined') {{ __rvst_dispatch_pointer('pointerup', {}, {}, {}); }}",
                                target_id.0, cx, cy,
                            );
                            if let Ok(ops) = runtime.eval(&js) {
                                for op in ops {
                                    apply_op(op, &mut self.tree, self.window.as_deref(), Some(event_loop));
                                }
                            }
                        }
                    }
                }
                // Implicit release on mouseup (per W3C Pointer Events spec)
                if let Some(cap_id) = self.pointer_capture.take() {
                    js_runtime::release_pointer_capture();
                    // Dispatch lostpointercapture on the element that had capture
                    if let Some(runtime) = &mut self.runtime {
                        let js = format!(
                            "if (typeof __rvst_dispatch_pointer !== 'undefined') {{ __rvst_dispatch_pointer('lostpointercapture', {}, 0, 0); }}",
                            cap_id.0,
                        );
                        let _ = runtime.eval(&js);
                        // Clear __pointer_captured on the JS element
                        let clear_js = format!(
                            "var __el = __rvst_elements.get({}); if (__el) delete __el.__pointer_captured;",
                            cap_id.0,
                        );
                        let _ = runtime.eval(&clear_js);
                    }
                }
            }
            WindowEvent::MouseWheel { delta, .. } => {
                // Negate: trackpad/wheel reports negative-y for "scroll down",
                // but scroll_by treats positive delta as "increase scroll offset".
                let delta_y = match delta {
                    winit::event::MouseScrollDelta::LineDelta(_, y) => -y * 40.0,
                    winit::event::MouseScrollDelta::PixelDelta(pos) => -pos.y as f32,
                };
                if let Some((cx, cy)) = self.cursor_pos {
                    if let Some(scroll_id) = self.tree.find_scroll_container_at(cx, cy) {
                        let new_scroll = self.tree.scroll_by(scroll_id, delta_y);
                        self.active_scroll_container = Some(scroll_id);
                        // Dispatch scroll event to JS handlers
                        let handler_ids: Vec<u32> = self
                            .tree
                            .handlers
                            .iter()
                            .filter(|(nid, ev, _)| *nid == scroll_id && ev == "scroll")
                            .map(|(_, _, h)| *h)
                            .collect();
                        if let Some(runtime) = &mut self.runtime {
                            if !handler_ids.is_empty() {
                                if let Ok(new_ops) = runtime.dispatch_scroll_event(
                                    scroll_id.0,
                                    new_scroll,
                                    &handler_ids,
                                ) {
                                    for op in new_ops {
                                        apply_op(
                                            op,
                                            &mut self.tree,
                                            self.window.as_deref(),
                                            Some(event_loop),
                                        );
                                    }
                                }
                            }
                        }
                        // Scroll only changes visual offset — mark needs_paint so
                        // about_to_wait rebuilds the scene.
                        self.tree.mark_needs_paint(scroll_id);
                    }
                }
            }
            WindowEvent::ModifiersChanged(mods) => {
                self.modifiers = mods.state();
            }
            WindowEvent::KeyboardInput {
                event:
                    winit::event::KeyEvent {
                        logical_key, state, ..
                    },
                ..
            } => {
                let event_type = match state {
                    winit::event::ElementState::Pressed => "keydown",
                    winit::event::ElementState::Released => "keyup",
                };
                let (key, code) = match &logical_key {
                    winit::keyboard::Key::Character(c) => {
                        (c.to_string(), format!("Key{}", c.to_uppercase()))
                    }
                    winit::keyboard::Key::Named(named) => {
                        let k = format!("{:?}", named);
                        (k.clone(), k)
                    }
                    _ => return,
                };
                eprintln!("[RUST] {} key={} focused={:?}", event_type, key, self.tree.focused);
                let mods = self.modifiers;
                let ctrl_or_cmd = mods.control_key() || mods.super_key();
                let extra = format!(
                    r#"{{"key":"{}","code":"{}","ctrlKey":{},"shiftKey":{},"altKey":{},"metaKey":{},"repeat":false}}"#,
                    key,
                    code,
                    mods.control_key(),
                    mods.shift_key(),
                    mods.alt_key(),
                    mods.super_key()
                );
                let mut needs_redraw = false;

                // Check if focused node is an editor — if so, route to rvst-editor
                if let Some(focused_id) = self.tree.focused {
                    if self.editors.contains_key(&focused_id) {
                        if matches!(state, winit::event::ElementState::Pressed) {
                            let key_event = rvst_editor::KeyEvent {
                                key: key.clone(),
                                ctrl: self.modifiers.control_key(),
                                shift: self.modifiers.shift_key(),
                                alt: self.modifiers.alt_key(),
                                meta: self.modifiers.super_key(),
                            };
                            if let Some(cmd) = rvst_editor::key_to_command(&key_event) {
                                if let Some(editor) = self.editors.get_mut(&focused_id) {
                                    rvst_editor::apply_command(editor, cmd);
                                }
                                needs_redraw = true;
                            }
                        }
                        // Skip ALL other keyboard handling for editor nodes
                        if needs_redraw {
                            self.tree.mark_needs_paint(focused_id);
                        }
                        if let Some(w) = &self.window {
                            w.request_redraw();
                        }
                        return;
                    }
                }

                // Handle clipboard shortcuts (Ctrl/Cmd + C/V/X) on key press
                if matches!(state, winit::event::ElementState::Pressed) && ctrl_or_cmd {
                    if let Some(focused_id) = self.tree.focused {
                        let is_text_input = self
                            .tree
                            .nodes
                            .get(&focused_id)
                            .map(|n| {
                                matches!(
                                    n.node_type,
                                    rvst_core::NodeType::Input | rvst_core::NodeType::Textarea
                                )
                            })
                            .unwrap_or(false);
                        if is_text_input {
                            match key.as_str() {
                                "c" => {
                                    let val = self
                                        .tree
                                        .nodes
                                        .get(&focused_id)
                                        .and_then(|n| n.styles.get("value").cloned())
                                        .unwrap_or_default();
                                    if let Some(cb) = &mut self.clipboard {
                                        let _ = cb.set_text(&val);
                                    }
                                    // Sync to JS clipboard buffer so navigator.clipboard.readText() works
                                    js_runtime::set_clipboard(val);
                                }
                                "v" => {
                                    let pasted = self
                                        .clipboard
                                        .as_mut()
                                        .and_then(|cb| cb.get_text().ok())
                                        .unwrap_or_default();
                                    // Sync OS clipboard contents to JS buffer
                                    if !pasted.is_empty() {
                                        js_runtime::set_clipboard(pasted.clone());
                                    }
                                    if !pasted.is_empty() {
                                        let current = self
                                            .tree
                                            .nodes
                                            .get(&focused_id)
                                            .and_then(|n| n.styles.get("value").cloned())
                                            .unwrap_or_default();
                                        let new_val = format!("{}{}", current, pasted);
                                        if let (Some(runtime), Some(hid)) = (
                                            &mut self.runtime,
                                            self.tree
                                                .handlers
                                                .iter()
                                                .find(|(nid, ev, _)| {
                                                    *nid == focused_id && ev == "input"
                                                })
                                                .map(|(_, _, h)| *h),
                                        ) {
                                            if let Ok(new_ops) = runtime.dispatch_input_event(
                                                hid,
                                                focused_id.0,
                                                new_val,
                                            ) {
                                                for op in new_ops {
                                                    apply_op(
                                                        op,
                                                        &mut self.tree,
                                                        self.window.as_deref(),
                                                        Some(event_loop),
                                                    );
                                                }
                                                needs_redraw = true;
                                            }
                                        }
                                    }
                                }
                                "x" => {
                                    let val = self
                                        .tree
                                        .nodes
                                        .get(&focused_id)
                                        .and_then(|n| n.styles.get("value").cloned())
                                        .unwrap_or_default();
                                    if let Some(cb) = &mut self.clipboard {
                                        let _ = cb.set_text(&val);
                                    }
                                    // Sync to JS clipboard buffer
                                    js_runtime::set_clipboard(val.clone());
                                    if let (Some(runtime), Some(hid)) = (
                                        &mut self.runtime,
                                        self.tree
                                            .handlers
                                            .iter()
                                            .find(|(nid, ev, _)| {
                                                *nid == focused_id && ev == "input"
                                            })
                                            .map(|(_, _, h)| *h),
                                    ) {
                                        if let Ok(new_ops) = runtime.dispatch_input_event(
                                            hid,
                                            focused_id.0,
                                            String::new(),
                                        ) {
                                            for op in new_ops {
                                                apply_op(
                                                    op,
                                                    &mut self.tree,
                                                    self.window.as_deref(),
                                                    Some(event_loop),
                                                );
                                            }
                                            needs_redraw = true;
                                        }
                                    }
                                }
                                _ => {}
                            }
                        }
                    }
                }
                if let Some(runtime) = &mut self.runtime {
                    let is_clipboard_shortcut = ctrl_or_cmd && matches!(key.as_str(), "c" | "v" | "x" | "a" | "z");
                    let mut beforeinput_prevented = false;
                    let mut bi_input_type = String::new();
                    let mut bi_data_js = String::new();

                    // ── Step 1: keydown / keyup on window, then on focused element ──
                    // Browser order: keydown → beforeinput → input
                    if let Ok(new_ops) = runtime.dispatch_window_event(event_type, &extra) {
                        if !new_ops.is_empty() {
                            for op in new_ops {
                                apply_op(op, &mut self.tree, self.window.as_deref(), Some(event_loop));
                            }
                            needs_redraw = true;
                        }
                    }
                    if let Some(focused_id) = self.tree.focused {
                        let escaped_key = key.replace('\\', "\\\\").replace('\'', "\\'");
                        let dispatch_js = format!(
                            "if (typeof __rvst_dispatch_pointer !== 'undefined') {{ __rvst_dispatch_pointer('{etype}', {fid}, 0, 0, {{ key: '{key}', ctrlKey: {ctrl}, shiftKey: {shift}, altKey: {alt}, metaKey: {meta} }}); }}",
                            etype = event_type,
                            fid = focused_id.0,
                            key = escaped_key,
                            ctrl = if self.modifiers.control_key() { "true" } else { "false" },
                            shift = if self.modifiers.shift_key() { "true" } else { "false" },
                            alt = if self.modifiers.alt_key() { "true" } else { "false" },
                            meta = if self.modifiers.super_key() { "true" } else { "false" },
                        );
                        if let Ok(ops) = runtime.eval(&dispatch_js) {
                            for op in ops {
                                apply_op(op, &mut self.tree, self.window.as_deref(), Some(event_loop));
                            }
                            needs_redraw = true;
                        }
                    }

                    // ── Step 2: beforeinput on focused editable element (after keydown) ──
                    if matches!(state, winit::event::ElementState::Pressed) && !is_clipboard_shortcut {
                        if let Some(focused_id) = self.tree.focused {
                            let is_editable = self
                                .tree
                                .nodes
                                .get(&focused_id)
                                .map(|n| {
                                    matches!(
                                        n.node_type,
                                        rvst_core::NodeType::Input | rvst_core::NodeType::Textarea
                                    ) || n.styles.get("contenteditable").map(|v| v == "true" || v == "").unwrap_or(false)
                                })
                                .unwrap_or(false);
                            if is_editable {
                                let shift = mods.shift_key();
                                let alt = mods.alt_key();
                                let (input_type, data) = match key.as_str() {
                                    "Backspace" if ctrl_or_cmd => ("deleteSoftLineBackward", String::new()),
                                    "Backspace" if alt => ("deleteWordBackward", String::new()),
                                    "Backspace" => ("deleteContentBackward", String::new()),
                                    "Delete" if ctrl_or_cmd => ("deleteSoftLineForward", String::new()),
                                    "Delete" if alt => ("deleteWordForward", String::new()),
                                    "Delete" => ("deleteContentForward", String::new()),
                                    "Enter" if shift => ("insertLineBreak", String::new()),
                                    "Enter" => ("insertParagraph", String::new()),
                                    k if k.len() == 1 => ("insertText", k.to_string()),
                                    _ => ("", String::new()),
                                };
                                let _ = (shift, alt);
                                if !input_type.is_empty() {
                                    let data_js = if data.is_empty() {
                                        "null".to_string()
                                    } else {
                                        let escaped = data.replace('\\', "\\\\").replace('\'', "\\'");
                                        format!("'{}'", escaped)
                                    };
                                    bi_input_type = input_type.to_string();
                                    bi_data_js = data_js.clone();
                                    let beforeinput_js = format!(
                                        r#"(function() {{
                                            const el = __rvst_elements.get({fid});
                                            if (el) {{
                                                const ev = new InputEvent('beforeinput', {{
                                                    data: {data_js},
                                                    inputType: '{input_type}',
                                                    isComposing: false,
                                                    cancelable: true,
                                                    bubbles: true,
                                                }});
                                                el.dispatchEvent(ev);
                                                globalThis.__rvst_last_default_prevented = ev.defaultPrevented;
                                            }}
                                        }})();"#,
                                        fid = focused_id.0,
                                        data_js = data_js,
                                        input_type = input_type,
                                    );
                                    if let Ok(bi_ops) = runtime.eval(&beforeinput_js) {
                                        for op in bi_ops {
                                            apply_op(op, &mut self.tree, self.window.as_deref(), Some(event_loop));
                                        }
                                        needs_redraw = true;
                                    }
                                    if let Ok(val) = runtime.eval_string("globalThis.__rvst_last_default_prevented === true") {
                                        beforeinput_prevented = val == "true";
                                    }
                                    let _ = runtime.eval("globalThis.__rvst_last_default_prevented = false;");
                                }
                            }
                        }
                    }
                    // If a text-editable element is focused, perform native mutation + dispatch "input".
                    // Skip if this was a clipboard shortcut or if beforeinput was preventDefault()'d.
                    if matches!(state, winit::event::ElementState::Pressed) && !is_clipboard_shortcut && !beforeinput_prevented {
                        if let Some(focused_id) = self.tree.focused {
                            let is_contenteditable = self.tree.nodes.get(&focused_id)
                                .map(|n| n.styles.get("contenteditable").map(|v| v == "true" || v == "").unwrap_or(false))
                                .unwrap_or(false);
                            let is_input_textarea = self.tree.nodes.get(&focused_id)
                                .map(|n| matches!(n.node_type, rvst_core::NodeType::Input | rvst_core::NodeType::Textarea))
                                .unwrap_or(false);

                            if is_contenteditable && !bi_input_type.is_empty() {
                                // ── Contenteditable: use JS-side DOM mutation ──
                                let ce_js = format!(
                                    "__rvst_apply_contenteditable_input({fid}, '{input_type}', {data_js});",
                                    fid = focused_id.0,
                                    input_type = bi_input_type,
                                    data_js = bi_data_js,
                                );
                                if let Ok(ops) = runtime.eval(&ce_js) {
                                    for op in ops {
                                        apply_op(op, &mut self.tree, self.window.as_deref(), Some(event_loop));
                                    }
                                    needs_redraw = true;
                                }
                                // Dispatch 'input' InputEvent so contenteditable listeners receive it
                                let input_js = format!(
                                    r#"(function() {{
                                        const el = __rvst_elements.get({fid});
                                        if (el) {{
                                            const ev = new InputEvent('input', {{
                                                data: {data_js},
                                                inputType: '{input_type}',
                                                isComposing: false,
                                                cancelable: false,
                                                bubbles: true,
                                            }});
                                            el.dispatchEvent(ev);
                                        }}
                                    }})();"#,
                                    fid = focused_id.0,
                                    data_js = bi_data_js,
                                    input_type = bi_input_type,
                                );
                                if let Ok(input_ops) = runtime.eval(&input_js) {
                                    for op in input_ops {
                                        apply_op(op, &mut self.tree, self.window.as_deref(), Some(event_loop));
                                    }
                                    needs_redraw = true;
                                }
                            } else if is_input_textarea {
                                // ── Input/Textarea: existing value mutation path ──
                                let current_val = self
                                    .tree
                                    .nodes
                                    .get(&focused_id)
                                    .and_then(|n| n.styles.get("value").cloned())
                                    .unwrap_or_default();
                                let new_val = match key.as_str() {
                                    "Backspace" => {
                                        let mut chars: Vec<char> = current_val.chars().collect();
                                        chars.pop();
                                        chars.into_iter().collect()
                                    }
                                    "Enter" | "Tab" | "Escape" | "Shift" | "Control" | "Alt"
                                    | "Meta" | "CapsLock" => current_val.clone(),
                                    k if k.len() == 1 => format!("{}{}", current_val, k),
                                    _ => current_val.clone(),
                                };
                                if new_val != current_val {
                                    // Dispatch to registered "input" handler (Svelte bind:value)
                                    if let Some(hid) = self
                                        .tree
                                        .handlers
                                        .iter()
                                        .find(|(nid, ev, _)| *nid == focused_id && ev == "input")
                                        .map(|(_, _, h)| *h)
                                    {
                                        if let Ok(new_ops) =
                                            runtime.dispatch_input_event(hid, focused_id.0, new_val)
                                        {
                                            for op in new_ops {
                                                apply_op(
                                                    op,
                                                    &mut self.tree,
                                                    self.window.as_deref(),
                                                    Some(event_loop),
                                                );
                                            }
                                            needs_redraw = true;
                                        }
                                    }
                                    // Also dispatch 'input' InputEvent on the element
                                    let input_type_after = match key.as_str() {
                                        "Backspace" => "deleteContentBackward",
                                        "Delete" => "deleteContentForward",
                                        k if k.len() == 1 => "insertText",
                                        _ => "",
                                    };
                                    if !input_type_after.is_empty() {
                                        let data_js_after = match key.as_str() {
                                            k if k.len() == 1 => {
                                                let escaped = k.replace('\\', "\\\\").replace('\'', "\\'");
                                                format!("'{}'", escaped)
                                            }
                                            _ => "null".to_string(),
                                        };
                                        let input_js = format!(
                                            r#"(function() {{
                                                const el = __rvst_elements.get({fid});
                                                if (el) {{
                                                    const ev = new InputEvent('input', {{
                                                        data: {data_js},
                                                        inputType: '{input_type}',
                                                        isComposing: false,
                                                        cancelable: false,
                                                        bubbles: true,
                                                    }});
                                                    el.dispatchEvent(ev);
                                                }}
                                            }})();"#,
                                            fid = focused_id.0,
                                            data_js = data_js_after,
                                            input_type = input_type_after,
                                        );
                                        if let Ok(input_ops) = runtime.eval(&input_js) {
                                            for op in input_ops {
                                                apply_op(op, &mut self.tree, self.window.as_deref(), Some(event_loop));
                                            }
                                            needs_redraw = true;
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
                // Layout + paint deferred to about_to_wait; dirty flags set by apply_op.
                let _ = needs_redraw;
            }
            WindowEvent::Focused(false) => {
                // SEC.8: Clear clipboard buffer when the window loses focus to avoid
                // leaking copied content to other applications via the simulated buffer.
                js_runtime::set_clipboard(String::new());
            }
            _ => {}
        }
    }

    fn about_to_wait(&mut self, event_loop: &ActiveEventLoop) {
        // Fire any timers that are due, collect their ops.
        let fired = js_runtime::check_and_drain_timers();
        for handler_id in fired {
            if let Some(runtime) = &mut self.runtime {
                if let Ok(new_ops) = runtime.dispatch_timer(handler_id) {
                    for op in new_ops {
                        apply_op(op, &mut self.tree, self.window.as_deref(), Some(event_loop));
                    }
                }
            }
        }

        // Fire pending requestAnimationFrame callbacks (CM6, animations, etc.)
        if let Some(runtime) = &mut self.runtime {
            let raf_ops = runtime.fire_raf();
            for op in raf_ops {
                apply_op(op, &mut self.tree, self.window.as_deref(), Some(event_loop));
            }
        }

        // Drain pending microtasks/Promises (Promise chains, etc.)
        if let Some(runtime) = &mut self.runtime {
            let micro_ops = runtime.drain_microtasks();
            if !micro_ops.is_empty() {
                for op in micro_ops {
                    apply_op(op, &mut self.tree, self.window.as_deref(), Some(event_loop));
                }
            }
        }

        // Rubber-band snap-back: if a scroll container is overscrolled (past 0 or
        // max_scroll), ease it back towards the valid range each frame.
        if let Some(scroll_id) = self.active_scroll_container {
            if let Some(node) = self.tree.nodes.get(&scroll_id) {
                let current = node.scroll_y;
                let max_scroll = self.tree.compute_max_scroll(scroll_id);
                if current < 0.0 || current > max_scroll {
                    let target = current.clamp(0.0, max_scroll);
                    let eased = current + (target - current) * 0.25;
                    if (eased - target).abs() < 0.5 {
                        // Close enough — snap to exact boundary
                        self.tree.set_scroll(scroll_id, target);
                        self.active_scroll_container = None;
                    } else {
                        self.tree.set_scroll(scroll_id, eased);
                    }
                    self.tree.mark_needs_paint(scroll_id);
                }
            }
        }

        // Tick CSS transitions: apply interpolated values to the tree.
        // This runs every frame when transitions are active.
        if self.transition_manager.has_active() {
            let now = std::time::Instant::now();
            let updates = self.transition_manager.tick_all(now);
            for (node_id, property, value) in updates {
                let css_value = rvst_engine::transition::animatable_to_css(&property, &value);
                self.tree.apply(rvst_core::Op::SetStyle {
                    id: node_id,
                    key: property,
                    value: css_value,
                });
            }
            // Ensure we keep redrawing while transitions are running
            if self.transition_manager.has_active() {
                self.tree.mark_needs_paint(rvst_core::NodeId(0));
            }
        }

        // CONSOLIDATED LAYOUT + PAINT: all event handlers and timer/microtask
        // processing above only apply ops and set dirty flags. We do the single
        // layout+paint pass here, once per event-loop iteration.
        let nl = self.tree.needs_layout();
        let np = self.tree.needs_paint();
        if nl || np {
            let frame_start = std::time::Instant::now();
            let cw = self
                .renderer
                .as_ref()
                .map(|r| r.size.width.max(1))
                .unwrap_or(800);
            let ch = self
                .renderer
                .as_ref()
                .map(|r| r.size.height.max(1))
                .unwrap_or(600);
            let cw_logical = (cw as f32 / self.scale_factor) as u32;
            let ch_logical = (ch as f32 / self.scale_factor) as u32;
            let roots = self.tree.root_children.clone();

            if self.tree.needs_layout() {
                let layout_start = std::time::Instant::now();
                let precomputed = if self.taffy_styles.is_empty() { None } else { Some(&self.taffy_styles) };
                layout::flow(
                    &mut self.tree,
                    &roots,
                    &mut self.text_renderer,
                    cw_logical as f32,
                    ch_logical as f32,
                    self.scale_factor,
                    precomputed,
                );
                // Fixup position:fixed nodes: override their layout rects with CSS
                // left/top values so hit testing matches the rendered position.
                // Also propagate the offset delta to all descendant nodes.
                let fixed_ids: Vec<rvst_core::NodeId> = self.tree.nodes.iter()
                    .filter(|(_, n)| n.styles.get("position").map(|s| s == "fixed").unwrap_or(false))
                    .map(|(id, _)| *id)
                    .collect();
                for fid in fixed_ids {
                    let (old_x, old_y) = self.tree.nodes.get(&fid)
                        .and_then(|n| n.layout.map(|r| (r.x, r.y)))
                        .unwrap_or((0.0, 0.0));
                    let css_x = self.tree.nodes.get(&fid)
                        .and_then(|n| n.styles.get("left"))
                        .and_then(|v| v.trim().trim_end_matches("px").parse::<f32>().ok())
                        .unwrap_or(old_x);
                    let css_y = self.tree.nodes.get(&fid)
                        .and_then(|n| n.styles.get("top"))
                        .and_then(|v| v.trim().trim_end_matches("px").parse::<f32>().ok())
                        .unwrap_or(old_y);
                    let dx = css_x - old_x;
                    let dy = css_y - old_y;
                    if dx.abs() > 0.01 || dy.abs() > 0.01 {
                        // Shift the fixed node and all its descendants
                        let mut stack = vec![fid];
                        while let Some(nid) = stack.pop() {
                            if let Some(node) = self.tree.nodes.get_mut(&nid) {
                                if let Some(ref mut r) = node.layout {
                                    r.x += dx;
                                    r.y += dy;
                                }
                                stack.extend(node.children.iter().copied());
                            }
                        }
                    }
                }
                self.tree.rebuild_spatial_index();
                // Populate the JS-visible layout cache so getBoundingClientRect returns real rects.
                let rects: Vec<(u32, f32, f32, f32, f32)> = self.tree.nodes.iter()
                    .filter_map(|(id, node)| {
                        node.layout.map(|r| (id.0, r.x, r.y, r.w, r.h))
                    })
                    .collect();
                js_runtime::update_layout_cache(&rects);
                // Populate scroll dimensions cache so JS scrollHeight/scrollWidth return real values.
                let scroll_dims: Vec<(u32, f32, f32)> = self.tree.nodes.keys()
                    .map(|id| {
                        let (sw, sh) = self.tree.compute_scroll_dims(*id);
                        (id.0, sw, sh)
                    })
                    .collect();
                js_runtime::update_scroll_dims_cache(&scroll_dims);
                self.last_layout_ms = layout_start.elapsed().as_secs_f64() * 1000.0;

                // Fire ResizeObserver callbacks for elements whose size changed.
                // Layout cache is now up-to-date, so the JS check function can
                // read correct sizes via op_get_layout.
                if let Some(runtime) = &mut self.runtime {
                    if let Ok(resize_ops) = runtime.eval("if(globalThis.__rvst_check_resize_observers) __rvst_check_resize_observers()") {
                        for op in resize_ops {
                            apply_op(op, &mut self.tree, self.window.as_deref(), Some(event_loop));
                        }
                    }
                }
            }

            // Detect editor nodes: create EditorState for any node with data-rvst-editor="true"
            let editor_nodes: Vec<rvst_core::NodeId> = self.tree.nodes.iter()
                .filter(|(_, n)| n.styles.get("data-rvst-editor").map(|v| v == "true").unwrap_or(false))
                .map(|(id, _)| *id)
                .collect();
            for node_id in editor_nodes {
                if !self.editors.contains_key(&node_id) {
                    let mut editor = rvst_editor::EditorState::with_paragraph();
                    editor.select_start();
                    self.editors.insert(node_id, editor);
                }
            }

            let scene_start = std::time::Instant::now();
            let scene = composite::build_scene(
                &self.tree,
                &roots,
                &mut self.text_renderer,
                cw,
                ch,
                self.scale_factor,
            );
            self.last_scene_build_ms = scene_start.elapsed().as_secs_f64() * 1000.0;
            self.last_scene = scene;

            // Render editor content on top of the base scene
            for (&node_id, editor_state) in &self.editors {
                if let Some(node) = self.tree.nodes.get(&node_id) {
                    if let Some(rect) = &node.layout {
                        let padding: f32 = node.styles.get("padding")
                            .and_then(|p| p.trim_end_matches("px").parse().ok())
                            .unwrap_or(0.0);
                        let layout = rvst_editor::layout_editor(
                            editor_state,
                            &mut self.text_renderer,
                            rect.w - padding * 2.0,
                            16.0,
                            25.6,
                        );
                        rvst_editor::render_editor(
                            &layout,
                            &mut self.last_scene,
                            rect.x + padding,
                            rect.y + padding,
                        );
                    }
                }
            }

            self.tree.clear_dirty();
            self.last_frame_ms = frame_start.elapsed().as_secs_f64() * 1000.0;
            self.frame_count += 1;
            // Present immediately — don't wait for RedrawRequested
            if let Some(r) = &mut self.renderer {
                let _ = r.render_scene(&self.last_scene);
            }
            if let Some(window) = &self.window {
                window.request_redraw();
            }
        }
        // Process test harness commands (stdin JSON commands in test mode).
        if let Some(ref queue) = self.command_queue {
            let queue = queue.clone();
            test_harness::process_commands(&queue, self);
        }

        // Wake at the next timer's fire time (or wait indefinitely if no timers).
        // We also request_redraw when timers are pending so the event loop stays
        // active — on macOS, WaitUntil alone can fail to wake the loop reliably,
        // causing setTimeout callbacks registered from Svelte $effect to never fire.
        // When CSS transitions are active, always poll for continuous animation.
        if self.transition_manager.has_active() {
            event_loop.set_control_flow(ControlFlow::Poll);
            if let Some(window) = &self.window {
                window.request_redraw();
            }
        } else {
            match js_runtime::next_timer_wake() {
                Some(wake_at) => {
                    event_loop.set_control_flow(ControlFlow::WaitUntil(wake_at));
                    if let Some(window) = &self.window {
                        window.request_redraw();
                    }
                }
                None => event_loop.set_control_flow(ControlFlow::Poll),
            }
        }
    }
}

/// Route a single op: window ops go to winit; all others go to the tree.
/// Both `window` and `event_loop` are `Option` so this can be called from
/// `HeadlessSession` (which has neither) as well as from `ShellApp`.
fn apply_op(
    op: rvst_core::Op,
    tree: &mut rvst_tree::Tree,
    window: Option<&Window>,
    event_loop: Option<&ActiveEventLoop>,
) {
    use rvst_core::Op;
    match op {
        Op::SetWindowDecorations { decorated } => {
            if let Some(w) = window {
                w.set_decorations(decorated);
            }
        }
        Op::BeginWindowDrag => {
            if let Some(w) = window {
                let _ = w.drag_window();
            }
        }
        Op::MinimizeWindow => {
            if let Some(w) = window {
                w.set_minimized(true);
            }
        }
        Op::MaximizeWindow { maximize } => {
            if let Some(w) = window {
                w.set_maximized(maximize);
            }
        }
        Op::CloseWindow => {
            if let Some(el) = event_loop {
                el.exit();
            }
        }
        Op::ClipboardWrite { text } => {
            // Try to write to the OS clipboard via arboard; ignore errors in headless mode.
            if let Ok(mut cb) = arboard::Clipboard::new() {
                let _ = cb.set_text(&text);
            }
        }
        other => {
            tree.apply(other);
        }
    }
}

pub fn run() {
    let event_loop = EventLoop::new().unwrap();
    let mut app = ShellApp::new();
    event_loop.run_app(&mut app).unwrap();
}

pub struct HeadlessSession {
    pub runtime: js_runtime::RvstRuntime,
    pub tree: rvst_tree::Tree,
    pub tr: rvst_text::TextRenderer,
    pub canvas_w: u32,
    pub canvas_h: u32,
    pub scale_factor: f32,
    /// Simulated clipboard for headless testing (no system clipboard needed).
    pub clipboard: String,
}

impl HeadlessSession {
    pub fn new(bundle_js: &str, canvas_w: u32, canvas_h: u32) -> Self {
        let mut runtime =
            js_runtime::RvstRuntime::new(bundle_js.to_string()).expect("RvstRuntime init failed");
        let initial_ops = runtime.take_ops();
        let mut tree = rvst_tree::Tree::new();
        for op in initial_ops {
            tree.apply(op);
        }

        // Fire pending rAF callbacks — libraries like CodeMirror 6 defer initial
        // rendering to requestAnimationFrame, so we must run at least one rAF cycle
        // after mount to populate content.
        let raf_ops = runtime.fire_raf();
        for op in raf_ops {
            tree.apply(op);
        }
        // Drain any additional ops produced by microtasks during rAF (e.g. Lexical's
        // $commitPendingUpdates creates DOM nodes inside onMount which fires in rAF).
        let deferred_ops = runtime.take_ops();
        for op in deferred_ops {
            tree.apply(op);
        }
        // Second rAF cycle — some libraries (Lexical) queue additional work via
        // queueMicrotask/setTimeout during the first rAF.
        let raf_ops2 = runtime.fire_raf();
        for op in raf_ops2 {
            tree.apply(op);
        }
        let deferred_ops2 = runtime.take_ops();
        for op in deferred_ops2 {
            tree.apply(op);
        }

        // Apply CSS rules from Stylo engine (loaded via op_load_css during JS execution)
        let mut taffy_styles = std::collections::HashMap::new();
        let mut paint_props_map = std::collections::HashMap::new();
        apply_css_to_tree(&mut tree, 1024.0, 768.0, &mut taffy_styles, &mut paint_props_map);

        let mut tr = rvst_text::TextRenderer::new();
        let roots = tree.root_children.clone();
        let precomputed = if taffy_styles.is_empty() { None } else { Some(&taffy_styles) };
        layout::flow(
            &mut tree,
            &roots,
            &mut tr,
            canvas_w as f32,
            canvas_h as f32,
            1.0,
            precomputed,
        );
        tree.rebuild_spatial_index();
        tree.clear_dirty();
        Self {
            runtime,
            tree,
            tr,
            canvas_w,
            canvas_h,
            scale_factor: 1.0,
            clipboard: String::new(),
        }
    }

    /// Re-run layout after ops are applied or fonts are registered.
    /// Skips layout if no nodes are dirty.
    pub fn relayout(&mut self) {
        if self.tree.needs_layout() {
            let roots = self.tree.root_children.clone();
            layout::flow(
                &mut self.tree,
                &roots,
                &mut self.tr,
                self.canvas_w as f32,
                self.canvas_h as f32,
                self.scale_factor,
                None, // HeadlessSession: no persistent precomputed styles
            );
            self.tree.rebuild_spatial_index();
        }
    }

    /// Render current tree state to RGBA pixels.
    /// Returns `None` if no GPU adapter is available (CI without GPU, headless Linux).
    pub fn render_pixels(&mut self) -> Option<Vec<u8>> {
        let roots = self.tree.root_children.clone();
        let scene = composite::build_scene(
            &self.tree,
            &roots,
            &mut self.tr,
            self.canvas_w,
            self.canvas_h,
            self.scale_factor,
        );
        rvst_render_wgpu::render_to_rgba(&scene, self.canvas_w, self.canvas_h)
    }

    /// Borrow an inspector for query operations.
    pub fn inspector(&self) -> crate::inspector::RvstInspector<'_> {
        crate::inspector::RvstInspector { session: self }
    }

    /// Capture a complete scene snapshot for RenderQuery operations.
    pub fn snapshot(&self) -> SceneSnapshot {
        SceneSnapshot::from_tree(&self.tree, self.canvas_w as f32, self.canvas_h as f32)
    }

    /// Perform a click and return a RenderTrace: snapshot before, click, snapshot after, diff.
    pub fn traced_click(&mut self, text: &str) -> Result<snapshot::RenderTrace, String> {
        let before = self.snapshot();
        self.click(text)?;
        let after = self.snapshot();
        let diff = snapshot::scene_diff(&before, &after);
        // Count ops by comparing node counts + text changes as proxy
        let ops_count = diff.len();
        Ok(snapshot::RenderTrace {
            action: format!("click(\"{}\")", text),
            before,
            after,
            diff,
            ops_count,
        })
    }

    /// Perform a type_text and return a RenderTrace.
    pub fn traced_type_text(
        &mut self,
        placeholder: &str,
        value: &str,
    ) -> Result<snapshot::RenderTrace, String> {
        let before = self.snapshot();
        self.type_text(placeholder, value)?;
        let after = self.snapshot();
        let diff = snapshot::scene_diff(&before, &after);
        let ops_count = diff.len();
        Ok(snapshot::RenderTrace {
            action: format!("type_text(\"{}\", \"{}\")", placeholder, value),
            before,
            after,
            diff,
            ops_count,
        })
    }

    /// Perform a navigate and return a RenderTrace.
    pub fn traced_navigate(&mut self, path: &str) -> Result<snapshot::RenderTrace, String> {
        let before = self.snapshot();
        self.navigate(path)?;
        let after = self.snapshot();
        let diff = snapshot::scene_diff(&before, &after);
        let ops_count = diff.len();
        Ok(snapshot::RenderTrace {
            action: format!("navigate(\"{}\")", path),
            before,
            after,
            diff,
            ops_count,
        })
    }

    /// Dispatch a click at (x, y). Finds the button or input under that point, fires its handler,
    /// applies resulting ops, re-runs layout. Returns Err if no clickable target found.
    /// If the clicked button is type="submit" inside a <form>, also fires the form's submit handler.
    /// Clicking on an Input/Textarea focuses it (no click handler needed).
    pub fn click_at(&mut self, x: f32, y: f32) -> Result<(), String> {
        // First try button/clickable hit test
        if let Some(hit) = self.tree.hit_test_button(x, y) {
            self.tree.focused = Some(hit);
            let handler_id = self
                .tree
                .find_handler("click")
                .ok_or_else(|| format!("no 'click' handler found (hit node {})", hit.0))?;
            let new_ops = self
                .runtime
                .dispatch_event(handler_id, hit.0)
                .map_err(|e| format!("dispatch_event error: {:?}", e))?;
            for op in new_ops {
                apply_op(op, &mut self.tree, None, None);
            }
            // If this was a submit button inside a form, also fire the form's submit event.
            if let Some((form_id, submit_hid)) = self.tree.find_form_submit_handler(hit) {
                let submit_ops = self
                    .runtime
                    .dispatch_event(submit_hid, form_id.0)
                    .map_err(|e| format!("form submit dispatch error: {:?}", e))?;
                for op in submit_ops {
                    apply_op(op, &mut self.tree, None, None);
                }
            }
            self.relayout();
            return Ok(());
        }
        // Fall back to Input/Textarea focus-on-click
        let input_hit = self
            .tree
            .nodes
            .values()
            .find(|n| {
                matches!(
                    n.node_type,
                    rvst_core::NodeType::Input | rvst_core::NodeType::Textarea
                ) && n
                    .layout
                    .map(|r| x >= r.x && x < r.x + r.w && y >= r.y && y < r.y + r.h)
                    .unwrap_or(false)
            })
            .map(|n| n.id);
        if let Some(id) = input_hit {
            self.tree.focused = Some(id);
            self.tree.mark_needs_paint(id);
            return Ok(());
        }
        Err(format!("no hittable element at ({}, {})", x, y))
    }

    /// Simulate typing `value` into the first Input or Textarea node whose `placeholder` style matches.
    /// Dispatches Svelte's "input" event handler so `bind:value` updates reactive state.
    pub fn type_text(&mut self, placeholder: &str, value: &str) -> Result<(), String> {
        // Find the first Input or Textarea node with a matching placeholder attribute.
        let (node_id, handler_id) = self
            .tree
            .nodes
            .values()
            .find(|n| {
                matches!(
                    n.node_type,
                    rvst_core::NodeType::Input | rvst_core::NodeType::Textarea
                ) && n.styles.get("placeholder").map(|s| s.as_str()) == Some(placeholder)
            })
            .and_then(|n| {
                self.tree
                    .handlers
                    .iter()
                    .find(|(nid, ev, _)| *nid == n.id && ev == "input")
                    .map(|(_, _, hid)| (n.id, *hid))
            })
            .ok_or_else(|| {
                format!(
                    "no Input/Textarea with placeholder {:?} and 'input' handler",
                    placeholder
                )
            })?;
        self.tree.focused = Some(node_id);
        let new_ops = self
            .runtime
            .dispatch_input_event(handler_id, node_id.0, value.to_string())
            .map_err(|e| format!("dispatch_input_event error: {:?}", e))?;
        for op in new_ops {
            apply_op(op, &mut self.tree, None, None);
        }
        self.relayout();
        Ok(())
    }

    /// Type a value into an Input or Textarea whose class attribute contains `class_name` as a
    /// word token (e.g. `type_in_class("field-input", "Bob")`).  Use this for inputs that lack
    /// a placeholder but carry a distinctive CSS class.
    pub fn type_in_class(&mut self, class_name: &str, value: &str) -> Result<(), String> {
        let (node_id, handler_id) = self
            .tree
            .nodes
            .values()
            .find(|n| {
                matches!(
                    n.node_type,
                    rvst_core::NodeType::Input | rvst_core::NodeType::Textarea
                ) && n
                    .styles
                    .get("class")
                    .map(|cls| cls.split_whitespace().any(|t| t == class_name))
                    .unwrap_or(false)
            })
            .and_then(|n| {
                self.tree
                    .handlers
                    .iter()
                    .find(|(nid, ev, _)| *nid == n.id && ev == "input")
                    .map(|(_, _, hid)| (n.id, *hid))
            })
            .ok_or_else(|| {
                format!(
                    "no Input/Textarea with class {:?} and 'input' handler",
                    class_name
                )
            })?;
        let new_ops = self
            .runtime
            .dispatch_input_event(handler_id, node_id.0, value.to_string())
            .map_err(|e| format!("dispatch_input_event error: {:?}", e))?;
        for op in new_ops {
            apply_op(op, &mut self.tree, None, None);
        }
        self.relayout();
        Ok(())
    }

    /// Select a radio button by value: sets `checked=true` on the radio whose
    /// `value` attribute matches, clears others in the group, fires "change".
    pub fn select_radio(&mut self, value: &str) -> Result<(), String> {
        // Find Input[type=radio] whose value attr matches
        let (node_id, handler_id) = self
            .tree
            .nodes
            .values()
            .find(|n| {
                n.node_type == rvst_core::NodeType::Input
                    && n.styles.get("type").map(|s| s.as_str()) == Some("radio")
                    && n.styles.get("value").map(|s| s.as_str()) == Some(value)
            })
            .and_then(|n| {
                self.tree
                    .handlers
                    .iter()
                    .find(|(nid, ev, _)| *nid == n.id && ev == "change")
                    .map(|(_, _, hid)| (n.id, *hid))
            })
            .ok_or_else(|| format!("no radio Input with value={:?} and 'change' handler", value))?;
        let new_ops = self
            .runtime
            .dispatch_change_event(handler_id, node_id.0, true)
            .map_err(|e| format!("dispatch_change_event (radio) error: {:?}", e))?;
        for op in new_ops {
            apply_op(op, &mut self.tree, None, None);
        }
        self.relayout();
        Ok(())
    }

    /// Toggle a checkbox: set `checked` state and fire its "change" handler.
    /// Finds the first Input node of type "checkbox" (by NodeId order, which matches
    /// DOM source order — avoids nondeterministic HashMap iteration choosing the wrong
    /// checkbox when multiple checkboxes share the same "change" event type).
    pub fn toggle_checkbox(&mut self, checked: bool) -> Result<(), String> {
        let mut candidates: Vec<_> = self
            .tree
            .nodes
            .values()
            .filter(|n| {
                n.node_type == rvst_core::NodeType::Input
                    && n.styles.get("type").map(|s| s.as_str()) == Some("checkbox")
            })
            .collect();
        candidates.sort_by_key(|n| n.id.0);
        let (node_id, handler_id) = candidates
            .into_iter()
            .find_map(|n| {
                self.tree
                    .handlers
                    .iter()
                    .find(|(nid, ev, _)| *nid == n.id && ev == "change")
                    .map(|(_, _, hid)| (n.id, *hid))
            })
            .ok_or_else(|| "no checkbox Input with 'change' handler".to_string())?;
        let new_ops = self
            .runtime
            .dispatch_change_event(handler_id, node_id.0, checked)
            .map_err(|e| format!("dispatch_change_event error: {:?}", e))?;
        for op in new_ops {
            apply_op(op, &mut self.tree, None, None);
        }
        self.relayout();
        Ok(())
    }

    /// Toggle a specific checkbox by its `value` attribute (for bind:group checkbox arrays).
    pub fn toggle_checkbox_value(&mut self, value: &str, checked: bool) -> Result<(), String> {
        let (node_id, handler_id) = self
            .tree
            .nodes
            .values()
            .find(|n| {
                n.node_type == rvst_core::NodeType::Input
                    && n.styles.get("type").map(|s| s.as_str()) == Some("checkbox")
                    && n.styles.get("value").map(|s| s.as_str()) == Some(value)
            })
            .and_then(|n| {
                self.tree
                    .handlers
                    .iter()
                    .find(|(nid, ev, _)| *nid == n.id && ev == "change")
                    .map(|(_, _, hid)| (n.id, *hid))
            })
            .ok_or_else(|| format!("no checkbox with value={:?} and 'change' handler", value))?;
        let new_ops = self
            .runtime
            .dispatch_change_event(handler_id, node_id.0, checked)
            .map_err(|e| format!("dispatch_change_event error: {:?}", e))?;
        for op in new_ops {
            apply_op(op, &mut self.tree, None, None);
        }
        self.relayout();
        Ok(())
    }

    /// Simulate selecting an option in a `<select>` by option value string.
    /// Finds the select element (View with "change" handler), then finds the child option
    /// whose text content matches `value`, calls dispatch_select_event.
    pub fn select_option(&mut self, value: &str) -> Result<(), String> {
        // Find the select node: a View that has a "change" handler registered
        let (select_id, handler_id) = self
            .tree
            .handlers
            .iter()
            .find(|(_, ev, _)| ev == "change")
            .map(|(nid, _, hid)| (*nid, *hid))
            .ok_or_else(|| "no element with 'change' handler found".to_string())?;

        // Find a child option node whose `value` attribute matches, or whose text content matches.
        let select_node = self
            .tree
            .nodes
            .get(&select_id)
            .ok_or_else(|| format!("select node {:?} not found", select_id))?;
        let children = select_node.children.clone();
        let option_id = children
            .iter()
            .find(|&&cid| {
                // Prefer matching by value attribute (e.g. <option value="green">Green</option>)
                if let Some(n) = self.tree.nodes.get(&cid) {
                    if n.styles.get("value").map(|v| v.as_str()) == Some(value) {
                        return true;
                    }
                }
                // Fall back to text content match
                crate::inspector::node_text_content(&self.tree, cid).trim() == value
            })
            .copied()
            .ok_or_else(|| format!("no option with value/text {:?} in select node", value))?;

        let new_ops = self
            .runtime
            .dispatch_select_event(handler_id, select_id.0, option_id.0)
            .map_err(|e| format!("dispatch_select_event error: {:?}", e))?;
        for op in new_ops {
            apply_op(op, &mut self.tree, None, None);
        }
        self.relayout();
        Ok(())
    }

    /// Fire all interval/timeout callbacks registered by this session's runtime (for testing).
    /// Simulates the passage of time — each timer handler is dispatched once.
    /// Returns the number of timers fired.
    pub fn fire_intervals(&mut self) -> Result<usize, String> {
        let handler_ids = js_runtime::all_timer_handler_ids(self.runtime.runtime_id);
        let count = handler_ids.len();
        for handler_id in handler_ids {
            let new_ops = self
                .runtime
                .dispatch_timer(handler_id)
                .map_err(|e| format!("dispatch_timer error: {:?}", e))?;
            for op in new_ops {
                apply_op(op, &mut self.tree, None, None);
            }
        }
        self.relayout();
        Ok(count)
    }

    /// Simulate a keyboard event (keydown, keyup, keypress).
    /// `key` is the key value (e.g. "Enter", "a", "Escape").
    /// `code` is the physical key code (e.g. "KeyA", "Enter", "Escape").
    pub fn fire_key(&mut self, event_type: &str, key: &str, code: &str) -> Result<(), String> {
        let extra = format!(
            r#"{{"key":"{}","code":"{}","ctrlKey":false,"shiftKey":false,"altKey":false,"metaKey":false,"repeat":false}}"#,
            key, code
        );
        self.fire_window_event(event_type, &extra)
    }

    /// Fire all `window.addEventListener(event_type, ...)` handlers with a synthetic event.
    /// `extra_fields_json` is a JSON object string merged into the event, e.g. `{"key":"a","ctrlKey":false}`.
    pub fn fire_window_event(
        &mut self,
        event_type: &str,
        extra_fields_json: &str,
    ) -> Result<(), String> {
        let new_ops = self
            .runtime
            .dispatch_window_event(event_type, extra_fields_json)
            .map_err(|e| format!("dispatch_window_event error: {:?}", e))?;
        for op in new_ops {
            apply_op(op, &mut self.tree, None, None);
        }
        self.relayout();
        Ok(())
    }

    /// Fire all `document.addEventListener(event_type, ...)` handlers with a synthetic event.
    pub fn fire_document_event(
        &mut self,
        event_type: &str,
        extra_fields_json: &str,
    ) -> Result<(), String> {
        let new_ops = self
            .runtime
            .dispatch_document_event(event_type, extra_fields_json)
            .map_err(|e| format!("dispatch_document_event error: {:?}", e))?;
        for op in new_ops {
            apply_op(op, &mut self.tree, None, None);
        }
        self.relayout();
        Ok(())
    }

    /// Set focus to a specific node by finding it by text content.
    pub fn focus(&mut self, text: &str) -> Result<(), String> {
        let roots = self.tree.root_children.clone();
        let node_id = crate::inspector::find_node_by_text(&self.tree, &roots, text)
            .ok_or_else(|| format!("no node with text {:?} found", text))?;
        self.tree.focused = Some(node_id);
        self.tree.mark_needs_paint(node_id);
        Ok(())
    }

    /// Type a string into the currently focused input, character by character.
    /// Each character is inserted at the current cursor position and dispatches
    /// an "input" event with the updated value. The cursor advances after each char.
    pub fn type_into_focused(&mut self, text: &str) -> Result<(), String> {
        let focused_id = self.tree.focused.ok_or("no element is focused")?;
        let node = self
            .tree
            .nodes
            .get(&focused_id)
            .ok_or("focused node not found")?;
        if !matches!(
            node.node_type,
            rvst_core::NodeType::Input | rvst_core::NodeType::Textarea
        ) {
            return Err("focused element is not an Input or Textarea".to_string());
        }
        let mut current = node.styles.get("value").cloned().unwrap_or_default();
        // Read cursor from JS-side selectionStart (reflects set_cursor calls)
        let mut cursor: usize = self
            .runtime
            .get_element_selection(focused_id.0)
            .map(|(s, _)| s)
            .unwrap_or(current.chars().count());
        for ch in text.chars() {
            // Insert at cursor position (char index, not byte index)
            let byte_pos = current
                .char_indices()
                .nth(cursor)
                .map(|(i, _)| i)
                .unwrap_or(current.len());
            current.insert(byte_pos, ch);
            cursor += 1;
            let hid = self
                .tree
                .handlers
                .iter()
                .find(|(nid, ev, _)| *nid == focused_id && ev == "input")
                .map(|(_, _, h)| *h)
                .ok_or("no 'input' handler on focused element")?;
            let new_ops = self
                .runtime
                .dispatch_input_event_with_cursor(hid, focused_id.0, current.clone(), Some(cursor))
                .map_err(|e| format!("dispatch_input_event error: {:?}", e))?;
            for op in new_ops {
                apply_op(op, &mut self.tree, None, None);
            }
        }
        self.relayout();
        Ok(())
    }

    /// Delete one character before the cursor in the focused input's value.
    /// If cursor is at position 0, this is a no-op (like a real browser).
    pub fn backspace(&mut self) -> Result<(), String> {
        let focused_id = self.tree.focused.ok_or("no element is focused")?;
        let node = self
            .tree
            .nodes
            .get(&focused_id)
            .ok_or("focused node not found")?;
        if !matches!(
            node.node_type,
            rvst_core::NodeType::Input | rvst_core::NodeType::Textarea
        ) {
            return Err("focused element is not an Input or Textarea".to_string());
        }
        let current = node.styles.get("value").cloned().unwrap_or_default();
        if current.is_empty() {
            return Ok(());
        }
        let chars: Vec<char> = current.chars().collect();
        // Cursor defaults to end of value (backwards compat)
        let cursor = chars.len();
        if cursor == 0 {
            return Ok(());
        }
        let new_cursor = cursor - 1;
        let mut new_chars = chars;
        new_chars.remove(new_cursor);
        let new_val: String = new_chars.into_iter().collect();
        let hid = self
            .tree
            .handlers
            .iter()
            .find(|(nid, ev, _)| *nid == focused_id && ev == "input")
            .map(|(_, _, h)| *h)
            .ok_or("no 'input' handler on focused element")?;
        let new_ops = self
            .runtime
            .dispatch_input_event_with_cursor(hid, focused_id.0, new_val, Some(new_cursor))
            .map_err(|e| format!("dispatch_input_event error: {:?}", e))?;
        for op in new_ops {
            apply_op(op, &mut self.tree, None, None);
        }
        self.relayout();
        Ok(())
    }

    /// Copy the focused input's value to the simulated clipboard.
    pub fn copy(&mut self) -> Result<String, String> {
        let focused_id = self.tree.focused.ok_or("no element is focused")?;
        let node = self
            .tree
            .nodes
            .get(&focused_id)
            .ok_or("focused node not found")?;
        if !matches!(
            node.node_type,
            rvst_core::NodeType::Input | rvst_core::NodeType::Textarea
        ) {
            return Err("focused element is not an Input or Textarea".to_string());
        }
        let value = node.styles.get("value").cloned().unwrap_or_default();
        self.clipboard = value.clone();
        Ok(value)
    }

    /// Paste text from the simulated clipboard into the focused input.
    pub fn paste(&mut self) -> Result<(), String> {
        let text = self.clipboard.clone();
        if text.is_empty() {
            return Ok(());
        }
        let focused_id = self.tree.focused.ok_or("no element is focused")?;
        let node = self
            .tree
            .nodes
            .get(&focused_id)
            .ok_or("focused node not found")?;
        if !matches!(
            node.node_type,
            rvst_core::NodeType::Input | rvst_core::NodeType::Textarea
        ) {
            return Err("focused element is not an Input or Textarea".to_string());
        }
        let current = node.styles.get("value").cloned().unwrap_or_default();
        let new_val = format!("{}{}", current, text);
        let hid = self
            .tree
            .handlers
            .iter()
            .find(|(nid, ev, _)| *nid == focused_id && ev == "input")
            .map(|(_, _, h)| *h)
            .ok_or("no 'input' handler on focused element")?;
        let new_ops = self
            .runtime
            .dispatch_input_event(hid, focused_id.0, new_val)
            .map_err(|e| format!("dispatch_input_event error: {:?}", e))?;
        for op in new_ops {
            apply_op(op, &mut self.tree, None, None);
        }
        self.relayout();
        Ok(())
    }

    /// Cut the focused input's value: copy to clipboard and clear the input.
    pub fn cut(&mut self) -> Result<String, String> {
        let focused_id = self.tree.focused.ok_or("no element is focused")?;
        let node = self
            .tree
            .nodes
            .get(&focused_id)
            .ok_or("focused node not found")?;
        if !matches!(
            node.node_type,
            rvst_core::NodeType::Input | rvst_core::NodeType::Textarea
        ) {
            return Err("focused element is not an Input or Textarea".to_string());
        }
        let value = node.styles.get("value").cloned().unwrap_or_default();
        self.clipboard = value.clone();
        // Clear the input
        let hid = self
            .tree
            .handlers
            .iter()
            .find(|(nid, ev, _)| *nid == focused_id && ev == "input")
            .map(|(_, _, h)| *h)
            .ok_or("no 'input' handler on focused element")?;
        let new_ops = self
            .runtime
            .dispatch_input_event(hid, focused_id.0, String::new())
            .map_err(|e| format!("dispatch_input_event error: {:?}", e))?;
        for op in new_ops {
            apply_op(op, &mut self.tree, None, None);
        }
        self.relayout();
        Ok(value)
    }

    /// Simulate a mouse wheel scroll at (x, y) by delta_y pixels.
    /// Finds the innermost Scroll container at that point and scrolls it.
    pub fn scroll_at(&mut self, x: f32, y: f32, delta_y: f32) -> Result<(), String> {
        let scroll_id = self
            .tree
            .find_scroll_container_at(x, y)
            .ok_or_else(|| format!("no scroll container at ({}, {})", x, y))?;
        let new_scroll = self.tree.scroll_by(scroll_id, delta_y);
        self.relayout();
        // Dispatch scroll event to any registered "scroll" handlers
        let handler_ids: Vec<u32> = self
            .tree
            .handlers
            .iter()
            .filter(|(nid, ev, _)| *nid == scroll_id && ev == "scroll")
            .map(|(_, _, h)| *h)
            .collect();
        if !handler_ids.is_empty() {
            let new_ops = self
                .runtime
                .dispatch_scroll_event(scroll_id.0, new_scroll, &handler_ids)
                .map_err(|e| format!("dispatch_scroll_event error: {:?}", e))?;
            for op in new_ops {
                apply_op(op, &mut self.tree, None, None);
            }
        }
        Ok(())
    }

    /// Advance focus via Tab (forward) or Shift+Tab (reverse).
    pub fn tab(&mut self, reverse: bool) -> Result<(), String> {
        self.tree
            .advance_focus(reverse)
            .map(|_| ())
            .ok_or_else(|| "no focusable elements".to_string())
    }

    /// Set the cursor position (selectionStart = selectionEnd = pos) on the focused input.
    pub fn set_cursor(&mut self, pos: usize) -> Result<(), String> {
        let focused_id = self.tree.focused.ok_or("no element is focused")?;
        self.runtime
            .set_element_selection(focused_id.0, pos, pos)
            .map_err(|e| format!("set_element_selection error: {:?}", e))
    }

    /// Get the cursor position (selectionStart, selectionEnd) from the focused input.
    pub fn get_cursor(&mut self) -> Result<(usize, usize), String> {
        let focused_id = self.tree.focused.ok_or("no element is focused")?;
        self.runtime
            .get_element_selection(focused_id.0)
            .map_err(|e| format!("get_element_selection error: {:?}", e))
    }

    /// Find the node containing text, use its center point to click_at.
    pub fn click(&mut self, text: &str) -> Result<(), String> {
        let roots = self.tree.root_children.clone();
        let node_id = crate::inspector::find_node_by_text(&self.tree, &roots, text)
            .ok_or_else(|| format!("no node with text {:?} found", text))?;
        let rect = self
            .tree
            .nodes
            .get(&node_id)
            .and_then(|n| n.layout)
            .ok_or_else(|| format!("node {:?} has no layout rect", node_id))?;
        let cx = rect.x + rect.w / 2.0;
        let cy = rect.y + rect.h / 2.0;
        self.click_at(cx, cy)
    }

    /// Navigate via history.pushState and apply any resulting ops.
    pub fn navigate(&mut self, path: &str) -> Result<(), String> {
        let js = format!(
            "history.pushState(null, '', '{}');",
            path.replace('\'', "\\'")
        );
        let ops = self
            .runtime
            .eval(&js)
            .map_err(|e| format!("navigate eval error: {:?}", e))?;
        for op in ops {
            apply_op(op, &mut self.tree, None, None);
        }
        self.relayout();
        Ok(())
    }

    /// Go back in history (triggers popstate) and apply resulting ops.
    pub fn go_back(&mut self) -> Result<(), String> {
        let ops = self
            .runtime
            .eval("history.back();")
            .map_err(|e| format!("go_back eval error: {:?}", e))?;
        for op in ops {
            apply_op(op, &mut self.tree, None, None);
        }
        self.relayout();
        Ok(())
    }

    /// Read the current location.pathname from JS.
    pub fn pathname(&mut self) -> Result<String, String> {
        self.runtime
            .eval_string("globalThis.location.pathname")
            .map_err(|e| format!("pathname eval error: {:?}", e))
    }
}

/// Render a JS bundle headlessly and return raw RGBA8 pixels (width × height × 4 bytes).
/// The bundle is executed exactly as `run_with_bundle` would, but instead of opening a
/// window the result is rendered offscreen and returned for inspection.
///
/// Returns `None` if no GPU adapter is available (CI without GPU, headless Linux).
/// Use in tests to assert on rendered output without a display or user interaction.
pub fn render_bundle_headless(bundle_js: &str, width: u32, height: u32) -> Option<Vec<u8>> {
    HeadlessSession::new(bundle_js, width, height).render_pixels()
}

/// Drain any CSS texts stored via `op_load_css` and apply them to the tree
/// using Stylo. Called after ops are applied to the tree but before layout,
/// so class-based styles are resolved into node styles.
/// Returns the StyloEngine if any CSS was loaded, for persistent pseudo-class support.
fn apply_css_to_tree(
    tree: &mut rvst_tree::Tree,
    viewport_w: f32,
    viewport_h: f32,
    taffy_styles: &mut std::collections::HashMap<rvst_core::NodeId, taffy::Style>,
    paint_props: &mut std::collections::HashMap<rvst_core::NodeId, rvst_stylo::values::PaintProps>,
) -> Option<rvst_stylo::StyloEngine> {
    let css_texts = js_runtime::drain_css_texts();
    if css_texts.is_empty() {
        return None;
    }

    let mut engine = rvst_stylo::StyloEngine::new(viewport_w, viewport_h);
    for css in &css_texts {
        engine.load_css(css);
    }
    engine.restyle(tree);

    // Populate side maps: taffy styles for direct layout, paint props to node.styles for composite.
    apply_stylo_to_node_styles(&engine, tree, taffy_styles, paint_props);

    Some(engine)
}

/// Re-apply Stylo styles to the tree. Used when hover/focus/class state changes.
fn reapply_stylo(
    engine: &mut rvst_stylo::StyloEngine,
    tree: &mut rvst_tree::Tree,
    taffy_styles: &mut std::collections::HashMap<rvst_core::NodeId, taffy::Style>,
    paint_props: &mut std::collections::HashMap<rvst_core::NodeId, rvst_stylo::values::PaintProps>,
) {
    engine.restyle(tree);
    apply_stylo_to_node_styles(engine, tree, taffy_styles, paint_props);
}

/// Transition-aware Stylo re-application. Captures old style values before
/// applying new CSS, then registers transitions for animatable properties
/// that changed and have a transition spec defined.
fn reapply_stylo_with_transitions(
    engine: &mut rvst_stylo::StyloEngine,
    tree: &mut rvst_tree::Tree,
    transition_mgr: &mut rvst_engine::transition::TransitionManager,
    taffy_styles: &mut std::collections::HashMap<rvst_core::NodeId, taffy::Style>,
    paint_props: &mut std::collections::HashMap<rvst_core::NodeId, rvst_stylo::values::PaintProps>,
) {
    use rvst_engine::transition::parse_animatable;

    // Snapshot current animatable styles for all nodes before re-applying
    let mut old_styles: std::collections::HashMap<
        rvst_core::NodeId,
        std::collections::HashMap<String, String>,
    > = std::collections::HashMap::new();
    for (&node_id, node) in &tree.nodes {
        old_styles.insert(node_id, node.styles.clone());
    }

    // Collect transition specs per node BEFORE re-applying (the transition
    // property itself is part of the node's styles).
    let mut transition_specs: std::collections::HashMap<
        rvst_core::NodeId,
        rvst_engine::transition::TransitionSpec,
    > = std::collections::HashMap::new();
    for (&node_id, node) in &tree.nodes {
        if let Some(spec) = transition_spec_from_node_styles(&node.styles) {
            transition_specs.insert(node_id, spec);
        }
    }

    // Re-apply styles the normal way (updates tree styles)
    reapply_stylo(engine, tree, taffy_styles, paint_props);

    // Now diff old vs new and register transitions for changed animatable properties
    for (&node_id, node) in &tree.nodes {
        let spec = match transition_specs.get(&node_id) {
            Some(s) => s,
            None => continue,
        };
        let old = match old_styles.get(&node_id) {
            Some(o) => o,
            None => continue,
        };

        for (key, new_val) in &node.styles {
            if !spec.matches_property(key) {
                continue;
            }
            let old_val = old.get(key).map(|s| s.as_str()).unwrap_or("");
            if old_val == new_val {
                continue;
            }
            if let (Some(old_anim), Some(new_anim)) =
                (parse_animatable(key, old_val), parse_animatable(key, new_val))
            {
                transition_mgr.on_style_change(node_id, key, old_anim, new_anim, spec);
            }
        }

        // Check properties that were removed (old had it, new doesn't)
        for (key, old_val) in old {
            if !spec.matches_property(key) {
                continue;
            }
            if node.styles.contains_key(key) {
                continue; // already handled above
            }
            if let Some(old_anim) = parse_animatable(key, old_val) {
                let default_anim = match &old_anim {
                    rvst_engine::transition::AnimatableValue::Float(_) => {
                        rvst_engine::transition::AnimatableValue::Float(0.0)
                    }
                    rvst_engine::transition::AnimatableValue::Color(_) => {
                        rvst_engine::transition::AnimatableValue::Color([0.0, 0.0, 0.0, 0.0])
                    }
                };
                transition_mgr.on_style_change(node_id, key, old_anim, default_anim, spec);
            }
        }
    }
}

/// Extract a TransitionSpec from a node's resolved styles (after Stylo bridge writes them).
fn transition_spec_from_node_styles(
    styles: &std::collections::HashMap<String, String>,
) -> Option<rvst_engine::transition::TransitionSpec> {
    // Check shorthand first
    if let Some(val) = styles.get("transition") {
        let specs = rvst_engine::transition::parse_transition_shorthand(val);
        if !specs.is_empty() {
            return Some(merge_transition_specs(&specs));
        }
    }
    // Check longhand properties
    let prop = styles.get("transition-property");
    let dur = styles.get("transition-duration");
    if let (Some(prop_val), Some(dur_val)) = (prop, dur) {
        let properties: Vec<String> = prop_val
            .split(',')
            .map(|s| s.trim().to_string())
            .filter(|s| !s.is_empty() && s != "none")
            .collect();
        if properties.is_empty() {
            return None;
        }
        let duration_ms = rvst_engine::transition::parse_duration_ms(dur_val);
        let timing = styles
            .get("transition-timing-function")
            .map(|s| rvst_engine::transition::TimingFunction::parse(s))
            .unwrap_or(rvst_engine::transition::TimingFunction::Ease);
        let delay_ms = styles
            .get("transition-delay")
            .map(|s| rvst_engine::transition::parse_duration_ms(s))
            .unwrap_or(0.0);
        return Some(rvst_engine::transition::TransitionSpec {
            properties,
            duration_ms,
            timing,
            delay_ms,
        });
    }
    None
}

/// Merge multiple transition specs into one.
fn merge_transition_specs(specs: &[rvst_engine::transition::TransitionSpec]) -> rvst_engine::transition::TransitionSpec {
    let mut merged = rvst_engine::transition::TransitionSpec {
        properties: Vec::new(),
        duration_ms: 0.0,
        timing: rvst_engine::transition::TimingFunction::Ease,
        delay_ms: 0.0,
    };
    for spec in specs {
        merged.properties.extend(spec.properties.clone());
        // Use the last spec's timing values (CSS behavior: last wins for shared properties)
        merged.duration_ms = spec.duration_ms;
        merged.timing = spec.timing.clone();
        merged.delay_ms = spec.delay_ms;
    }
    merged
}

/// Populate pre-computed side maps from Stylo's computed values.
///
/// Layout styles go into `taffy_styles` — used directly by layout::flow(),
/// bypassing the lossy Stylo→string→Taffy round-trip.
///
/// Paint props are written to `node.styles` as strings for composite.rs
/// backward compatibility (phase 2 will pass PaintProps directly).
fn apply_stylo_to_node_styles(
    engine: &rvst_stylo::StyloEngine,
    tree: &mut rvst_tree::Tree,
    taffy_styles: &mut std::collections::HashMap<rvst_core::NodeId, taffy::Style>,
    paint_props: &mut std::collections::HashMap<rvst_core::NodeId, rvst_stylo::values::PaintProps>,
) {
    use rvst_stylo::values;

    taffy_styles.clear();
    paint_props.clear();

    let node_ids: Vec<rvst_core::NodeId> = tree.nodes.keys().cloned().collect();
    for node_id in node_ids {
        if let Some(node) = tree.nodes.get(&node_id) {
            if matches!(node.node_type, rvst_core::NodeType::Text) { continue; }
        }

        let computed = match engine.computed_style(node_id) {
            Some(cv) => cv,
            None => continue,
        };

        let taffy_style = values::computed_to_taffy_style(&computed);
        let paint = values::computed_to_paint_props(&computed);

        // Store taffy style in side map — layout::flow() reads this directly.
        // If JS set display:none inline, override the Stylo-computed style to respect it.
        let mut taffy_style = taffy_style;
        if let Some(node) = tree.nodes.get(&node_id) {
            if node.styles.get("display").map(|s| s.as_str()) == Some("none") {
                taffy_style.display = taffy::Display::None;
            }
        }
        taffy_styles.insert(node_id, taffy_style.clone());

        // Write paint props + minimal layout properties to node.styles for
        // composite.rs backward compatibility. Full layout strings are NOT written
        // — layout reads from the side map instead.
        if let Some(node) = tree.nodes.get_mut(&node_id) {
            // Preserve inline styles set by JS that must not be overwritten by CSS.
            // Same logic as the old string bridge: display:none, z-index, position offsets.
            let preserve_keys: Vec<(String, String)> = node.styles.iter()
                .filter(|(k, v)| {
                    if k.as_str() == "display" && v.as_str() == "none" { return true; }
                    if k.as_str() == "z-index" { return true; }
                    if matches!(k.as_str(), "left" | "top" | "right" | "bottom") && v.contains("px") { return true; }
                    false
                })
                .map(|(k, v)| (k.clone(), v.clone()))
                .collect();

            write_paint_props_to_node(&paint, &mut node.styles);
            write_composite_bridge_props(&taffy_style, &mut node.styles);

            // Restore preserved inline styles (highest cascade priority)
            for (k, v) in preserve_keys {
                node.styles.insert(k, v);
            }
        }

        paint_props.insert(node_id, paint);
    }
}

/// Write the minimal set of layout properties that composite.rs needs from
/// node.styles for rendering (position, display, overflow). These are NOT
/// used for layout (that reads from the precomputed taffy::Style side map).
fn write_composite_bridge_props(style: &taffy::Style, styles: &mut std::collections::HashMap<String, String>) {
    // Display — composite.rs checks for "none"
    match style.display {
        taffy::Display::None => { styles.insert("display".into(), "none".into()); }
        taffy::Display::Flex => { styles.insert("display".into(), "flex".into()); }
        _ => {} // block is default, don't write
    }

    // Position: NOT written here. Taffy's Position::Absolute conflates CSS
    // absolute and fixed. The original position value from JS/SetStyle ops stays
    // in node.styles, which composite.rs reads for fixed/absolute distinction.

    // Overflow — composite.rs checks for scroll container rendering
    match style.overflow.x {
        taffy::Overflow::Hidden => { styles.insert("overflow".into(), "hidden".into()); }
        taffy::Overflow::Scroll => { styles.insert("overflow".into(), "auto".into()); }
        _ => {}
    }

    // Border widths — composite.rs reads these for border rendering
    fn lp_px(lp: &taffy::LengthPercentage) -> f32 {
        use taffy::CompactLength;
        let raw = (*lp).into_raw();
        if raw.tag() == CompactLength::LENGTH_TAG { raw.value() } else { 0.0 }
    }
    let bw_top = lp_px(&style.border.top);
    let bw_right = lp_px(&style.border.right);
    let bw_bottom = lp_px(&style.border.bottom);
    let bw_left = lp_px(&style.border.left);
    if bw_top > 0.0 || bw_right > 0.0 || bw_bottom > 0.0 || bw_left > 0.0 {
        // Use the max as a uniform border-width (most common case)
        let max_bw = bw_top.max(bw_right).max(bw_bottom).max(bw_left);
        styles.insert("border-width".into(), format!("{}px", max_bw));
    }
}

fn write_paint_props_to_node(paint: &rvst_stylo::values::PaintProps, styles: &mut std::collections::HashMap<String, String>) {
    let to_hex = |c: &[f32; 4]| -> String {
        let r = (c[0].clamp(0.0, 1.0) * 255.0) as u8;
        let g = (c[1].clamp(0.0, 1.0) * 255.0) as u8;
        let b = (c[2].clamp(0.0, 1.0) * 255.0) as u8;
        let a = (c[3].clamp(0.0, 1.0) * 255.0) as u8;
        if a == 255 { format!("#{:02x}{:02x}{:02x}", r, g, b) }
        else { format!("#{:02x}{:02x}{:02x}{:02x}", r, g, b, a) }
    };

    styles.insert("color".into(), to_hex(&paint.color));
    if paint.background_color[3] > 0.001 {
        styles.insert("background-color".into(), to_hex(&paint.background_color));
    }

    // Border colors
    if paint.border_top_width > 0.0 { styles.insert("border-top-color".into(), to_hex(&paint.border_top_color)); }
    if paint.border_right_width > 0.0 { styles.insert("border-right-color".into(), to_hex(&paint.border_right_color)); }
    if paint.border_bottom_width > 0.0 { styles.insert("border-bottom-color".into(), to_hex(&paint.border_bottom_color)); }
    if paint.border_left_width > 0.0 { styles.insert("border-left-color".into(), to_hex(&paint.border_left_color)); }

    // Border radius
    if paint.border_top_left_radius.0 > 0.0 {
        styles.insert("border-top-left-radius".into(), format!("{}px", paint.border_top_left_radius.0));
    }
    if paint.border_top_right_radius.0 > 0.0 {
        styles.insert("border-top-right-radius".into(), format!("{}px", paint.border_top_right_radius.0));
    }
    if paint.border_bottom_right_radius.0 > 0.0 {
        styles.insert("border-bottom-right-radius".into(), format!("{}px", paint.border_bottom_right_radius.0));
    }
    if paint.border_bottom_left_radius.0 > 0.0 {
        styles.insert("border-bottom-left-radius".into(), format!("{}px", paint.border_bottom_left_radius.0));
    }

    // Font
    styles.insert("font-size".into(), format!("{}px", paint.font_size));
    styles.insert("font-weight".into(), format!("{}", paint.font_weight));
    if paint.line_height > 0.0 { styles.insert("line-height".into(), format!("{}", paint.line_height)); }

    // Opacity
    if paint.opacity < 1.0 { styles.insert("opacity".into(), format!("{}", paint.opacity)); }

    // Text align
    match paint.text_align {
        rvst_stylo::values::TextAlign::Left => {}
        rvst_stylo::values::TextAlign::Center => { styles.insert("text-align".into(), "center".into()); }
        rvst_stylo::values::TextAlign::Right => { styles.insert("text-align".into(), "right".into()); }
        rvst_stylo::values::TextAlign::Justify => { styles.insert("text-align".into(), "justify".into()); }
    }
}

/// Launch a windowed app from a JS bundle + optional CSS.
/// CSS is parsed by Stylo and applied before first layout.
pub fn run_with_bundle(bundle: String) {
    run_with_bundle_and_css(bundle, None);
}

/// Launch a windowed app from a JS bundle + CSS text + optional font files.
pub fn run_with_bundle_and_css(bundle: String, css: Option<String>) {
    run_with_bundle_css_fonts(bundle, css, vec![]);
}

/// Launch with explicit font files to register.
pub fn run_with_bundle_css_fonts(bundle: String, css: Option<String>, fonts: Vec<Vec<u8>>) {
    // Initialize persistent runtime (sync via pollster internally)
    let mut runtime = js_runtime::RvstRuntime::new(bundle).expect("RvstRuntime init failed");

    // Drain mount ops and build initial tree.
    // Window-level ops (decorations, etc.) can't be applied yet — the winit
    // window doesn't exist until ApplicationHandler::resumed() fires. We scan
    // for SetWindowDecorations so resumed() can create the window with the
    // correct decoration setting from the very first frame.
    let initial_ops = runtime.take_ops();
    let mut tree = rvst_tree::Tree::new();
    let mut want_decorations = true; // OS default: decorated
    for op in initial_ops {
        if let rvst_core::Op::SetWindowDecorations { decorated } = op {
            want_decorations = decorated;
        } else {
            tree.apply(op);
        }
    }

    // Load explicit CSS (from file) via Stylo before applying tree CSS
    if let Some(css_text) = css {
        // Push CSS text into the op_load_css store so apply_css_to_tree picks it up
        js_runtime::push_css_text(css_text);
    }

    // Apply CSS rules from Stylo engine (loaded via op_load_css during JS execution + explicit CSS)
    let mut taffy_styles = std::collections::HashMap::new();
    let mut paint_props_map = std::collections::HashMap::new();
    let stylo_engine = apply_css_to_tree(&mut tree, 1024.0, 768.0, &mut taffy_styles, &mut paint_props_map);

    let event_loop = EventLoop::new().unwrap();
    let mut text_renderer = rvst_text::TextRenderer::new();
    for font_data in &fonts {
        text_renderer.register_font(font_data.clone());
    }
    let mut app = ShellApp {
        window: None,
        renderer: None,
        runtime: Some(runtime),
        tree,
        text_renderer,
        cursor_pos: None,
        hovered_node: None,
        scale_factor: 1.0,
        last_scene: vello::Scene::new(),
        want_decorations,
        modifiers: winit::keyboard::ModifiersState::empty(),
        clipboard: arboard::Clipboard::new().ok(),
        stylo_engine,
        active_scroll_container: None,
        command_queue: None,
        test_mode: false,
        marked_snapshots: std::collections::HashMap::new(),
        last_layout_ms: 0.0,
        last_scene_build_ms: 0.0,
        last_frame_ms: 0.0,
        frame_count: 0,
        session_file: None,
        watch_active: false,
        watch_filter: None,
        test_wait_until: None,
        editors: std::collections::HashMap::new(),
        editor_dragging: None,
        transition_manager: rvst_engine::transition::TransitionManager::new(),
        pointer_capture: None,
        last_click_time: std::time::Instant::now(),
        click_count: 0,
        taffy_styles,
        paint_props: paint_props_map,
    };
    event_loop.run_app(&mut app).unwrap();
}

/// Run the app in test harness mode: same windowed rendering as normal,
/// but reads JSON commands from stdin and writes JSON responses to stdout.
pub fn run_test_mode(bundle: String, css: Option<String>, fonts: Vec<Vec<u8>>) {
    let mut runtime = js_runtime::RvstRuntime::new(bundle).expect("RvstRuntime init failed");
    let initial_ops = runtime.take_ops();
    let mut tree = rvst_tree::Tree::new();
    let mut want_decorations = true;
    for op in initial_ops {
        if let rvst_core::Op::SetWindowDecorations { decorated } = op {
            want_decorations = decorated;
        } else {
            tree.apply(op);
        }
    }

    if let Some(css_text) = css {
        js_runtime::push_css_text(css_text);
    }
    let mut taffy_styles = std::collections::HashMap::new();
    let mut paint_props_map = std::collections::HashMap::new();
    let stylo_engine = apply_css_to_tree(&mut tree, 1024.0, 768.0, &mut taffy_styles, &mut paint_props_map);

    let event_loop = EventLoop::new().unwrap();
    let proxy = event_loop.create_proxy();
    let command_queue = test_harness::start_stdin_reader(proxy);

    // Print session metadata as the first stdout line.
    let session_id = format!("rvst-test-{}", std::process::id());
    let pid = std::process::id();
    let started_at = std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .unwrap()
        .as_secs();
    println!("{}", serde_json::json!({
        "session": session_id,
        "pid": pid,
        "nodes": tree.nodes.len(),
        "viewport": [1024, 768],
    }));

    // Write session file so `rvst test list` / `rvst test kill` can find us.
    let sessions_dir = session_dir();
    let session_file = sessions_dir.join(format!("{}.json", pid)).to_string_lossy().into_owned();
    let session_info = serde_json::json!({
        "session": session_id,
        "pid": pid,
        "started_at": started_at,
        "bundle": "app.js",
    });
    let _ = std::fs::write(&session_file, serde_json::to_string(&session_info).unwrap());
    // Restrict session file permissions to owner-only on Unix
    #[cfg(unix)]
    {
        use std::os::unix::fs::PermissionsExt;
        let _ = std::fs::set_permissions(&session_file, std::fs::Permissions::from_mode(0o600));
    }

    let mut text_renderer = rvst_text::TextRenderer::new();
    for font_data in &fonts {
        text_renderer.register_font(font_data.clone());
    }
    let mut app = ShellApp {
        window: None,
        renderer: None,
        runtime: Some(runtime),
        tree,
        text_renderer,
        cursor_pos: None,
        hovered_node: None,
        scale_factor: 1.0,
        last_scene: vello::Scene::new(),
        want_decorations,
        modifiers: winit::keyboard::ModifiersState::empty(),
        clipboard: arboard::Clipboard::new().ok(),
        stylo_engine,
        active_scroll_container: None,
        command_queue: Some(command_queue),
        test_mode: true,
        marked_snapshots: std::collections::HashMap::new(),
        last_layout_ms: 0.0,
        last_scene_build_ms: 0.0,
        last_frame_ms: 0.0,
        frame_count: 0,
        session_file: Some(session_file),
        watch_active: false,
        watch_filter: None,
        test_wait_until: None,
        editors: std::collections::HashMap::new(),
        editor_dragging: None,
        transition_manager: rvst_engine::transition::TransitionManager::new(),
        pointer_capture: None,
        last_click_time: std::time::Instant::now(),
        click_count: 0,
        taffy_styles,
        paint_props: paint_props_map,
    };
    event_loop.run_app(&mut app).unwrap();
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn shell_app_constructs() {
        let app = ShellApp::new();
        assert!(app.window.is_none());
        assert!(app.renderer.is_none());
        assert!(app.runtime.is_none());
    }
}

#[cfg(test)]
mod session_tests {
    use super::*;
    #[test]
    fn headless_session_constructs() {
        let s = HeadlessSession::new("function rvst_mount(target) {}", 400, 300);
        assert_eq!(s.canvas_w, 400);
        assert_eq!(s.canvas_h, 300);
    }

    const COUNTER_BUNDLE: &str = r#"
function rvst_mount(target) {
    let count = 0;
    const btn = document.createElement('button');
    const label = document.createTextNode('Count: 0');
    btn.appendChild(label);
    btn.addEventListener('click', () => {
        count++;
        label.data = 'Count: ' + count;
        __host.op_set_text(label.__rvst_id, 'Count: ' + count);
    });
    target.appendChild(btn);
}
"#;

    #[test]
    fn click_increments_counter() {
        let mut s = HeadlessSession::new(COUNTER_BUNDLE, 400, 300);
        // Before click
        assert!(
            s.inspector().find("Count: 0").is_visible().ok,
            "expected 'Count: 0' to be visible before click"
        );
        // Click
        s.click("Count: 0").expect("click should succeed");
        // After click
        assert!(
            s.inspector().find("Count: 1").is_visible().ok,
            "expected 'Count: 1' after click"
        );
    }
}

// ---------------------------------------------------------------------------
// A2: rAF / timer stress tests — validates M1 timing model is sound
// ---------------------------------------------------------------------------
#[cfg(test)]
mod raf_stress_tests {
    use super::*;

    /// Deeply nested rAF chain (100 frames). Must complete, not hang.
    const NESTED_RAF_JS: &str = r#"
function rvst_mount(target) {
    let frames = 0;
    const label = document.createTextNode('Frames: 0');
    const div = document.createElement('div');
    div.appendChild(label);
    target.appendChild(div);

    function tick(ts) {
        frames++;
        label.data = 'Frames: ' + frames;
        __host.op_set_text(label.__rvst_id, 'Frames: ' + frames);
        if (frames < 100) {
            requestAnimationFrame(tick);
        }
    }
    requestAnimationFrame(tick);
}
"#;

    /// Infinite rAF loop — MUST be bounded by depth cap (1000), not hang.
    const INFINITE_RAF_JS: &str = r#"
function rvst_mount(target) {
    let frames = 0;
    const label = document.createTextNode('Frames: 0');
    const div = document.createElement('div');
    div.appendChild(label);
    target.appendChild(div);

    function tick(ts) {
        frames++;
        label.data = 'Frames: ' + frames;
        __host.op_set_text(label.__rvst_id, 'Frames: ' + frames);
        requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
}
"#;

    /// rAF fires during mount — verifies microtask execution order.
    const RAF_ON_MOUNT_JS: &str = r#"
function rvst_mount(target) {
    let state = 'init';
    const label = document.createTextNode('State: init');
    const div = document.createElement('div');
    div.appendChild(label);
    target.appendChild(div);

    requestAnimationFrame(() => {
        state = 'raf1';
        label.data = 'State: raf1';
        __host.op_set_text(label.__rvst_id, 'State: raf1');
    });
}
"#;

    /// Animation using performance.now() — verifies clock alignment.
    const PERF_NOW_ANIMATION_JS: &str = r#"
function rvst_mount(target) {
    const startTime = performance.now();
    const duration = 160;
    let done = false;
    const label = document.createTextNode('Done: false');
    const div = document.createElement('div');
    div.appendChild(label);
    target.appendChild(div);

    function step(now) {
        const elapsed = now - startTime;
        if (elapsed >= duration) {
            done = true;
            label.data = 'Done: true';
            __host.op_set_text(label.__rvst_id, 'Done: true');
        } else {
            requestAnimationFrame(step);
        }
    }
    requestAnimationFrame(step);
}
"#;

    #[test]
    #[ignore = "rAF stress test — too slow for CI, run locally with --include-ignored"]
    fn nested_raf_chain_completes_in_100_frames() {
        let s = HeadlessSession::new(NESTED_RAF_JS, 400, 300);
        assert!(
            s.inspector().find("Frames: 100").is_visible().ok,
            "nested rAF chain should complete all 100 frames"
        );
    }

    #[test]
    #[ignore = "rAF stress test — too slow for CI, run locally with --include-ignored"]
    fn infinite_raf_bounded_by_depth_cap() {
        // MUST complete (not hang). Depth cap stops at 1000 frames.
        let s = HeadlessSession::new(INFINITE_RAF_JS, 400, 300);
        assert!(
            s.inspector().find("Frames: 1000").is_visible().ok,
            "infinite rAF should be bounded at 1000 frames by depth cap"
        );
    }

    #[test]
    fn raf_fires_during_mount() {
        let s = HeadlessSession::new(RAF_ON_MOUNT_JS, 400, 300);
        assert!(
            s.inspector().find("State: raf1").is_visible().ok,
            "rAF callback should fire during mount microtask drain"
        );
    }

    #[test]
    #[ignore = "rAF stress test — too slow for CI, run locally with --include-ignored"]
    fn perf_now_animation_completes() {
        // 160ms duration / 16ms per frame = 10 frames needed.
        let s = HeadlessSession::new(PERF_NOW_ANIMATION_JS, 400, 300);
        assert!(
            s.inspector().find("Done: true").is_visible().ok,
            "performance.now() based animation should complete within depth cap"
        );
    }

    #[test]
    #[ignore = "rAF stress test — too slow for CI, run locally with --include-ignored"]
    fn repeated_session_creation_no_hang() {
        // Create and drop 20 sessions — tests no leaked global state.
        for i in 0..20 {
            let s = HeadlessSession::new(NESTED_RAF_JS, 400, 300);
            assert!(
                s.inspector().find("Frames: 100").is_visible().ok,
                "session {} should complete rAF chain",
                i
            );
        }
    }
}

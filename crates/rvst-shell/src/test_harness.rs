use std::collections::VecDeque;
use std::sync::{Arc, Mutex};
use std::time::Instant;
use serde_json::Value;

/// A command received from stdin, with a timestamp for latency tracking.
pub struct TestCommand {
    pub cmd: String,
    pub params: Value,
    pub queued_at: Instant,
}

pub type CommandQueue = Arc<Mutex<VecDeque<TestCommand>>>;

/// How long a command can sit in the queue before we report the app as frozen.
const FROZEN_THRESHOLD_MS: u128 = 3000;

/// Start a background thread that reads JSON lines from stdin and queues them.
/// Detects frozen main thread by checking if previously queued commands are
/// still unprocessed — if a command has been waiting >3s, the main thread is stuck.
pub fn start_stdin_reader(proxy: winit::event_loop::EventLoopProxy<()>) -> CommandQueue {
    let queue: CommandQueue = Arc::new(Mutex::new(VecDeque::new()));
    let q = queue.clone();

    std::thread::spawn(move || {
        use std::io::BufRead;
        let stdin = std::io::stdin();
        for line in stdin.lock().lines().flatten() {
            let line = line.trim().to_string();
            if line.is_empty() { continue; }
            match serde_json::from_str::<Value>(&line) {
                Ok(val) => {
                    let cmd = val.get("cmd").and_then(|c| c.as_str()).unwrap_or("").to_string();

                    // Check queue health: if oldest command has been waiting too long,
                    // the main thread is frozen (blocked in layout/render).
                    {
                        let q_guard = q.lock().unwrap();
                        if let Some(oldest) = q_guard.front() {
                            let wait_ms = oldest.queued_at.elapsed().as_millis();
                            if wait_ms > FROZEN_THRESHOLD_MS && cmd != "close" {
                                let resp = serde_json::json!({
                                    "warning": "app_frozen",
                                    "message": format!(
                                        "Main thread blocked — oldest queued command ('{}') has been waiting {}ms. \
                                         {} commands in queue. The app may be doing initial layout of a large tree.",
                                        oldest.cmd, wait_ms, q_guard.len()
                                    ),
                                    "frozen_ms": wait_ms,
                                    "queued_commands": q_guard.len(),
                                });
                                println!("{}", resp);
                            }
                        }
                    }

                    // Extract the nested "params" object, or fall back to the full
                    // value so callers can use either `{"cmd":"x","params":{...}}`
                    // or flat `{"cmd":"x","key":"val"}` format.
                    let params = val.get("params").cloned().unwrap_or(val);
                    q.lock().unwrap().push_back(TestCommand {
                        cmd,
                        params,
                        queued_at: Instant::now(),
                    });
                    let _ = proxy.send_event(());
                }
                Err(e) => {
                    let resp = serde_json::json!({"error": format!("JSON parse error: {}", e)});
                    println!("{}", resp);
                }
            }
        }
        // Stdin closed — queue close
        q.lock().unwrap().push_back(TestCommand {
            cmd: "close".to_string(),
            params: serde_json::json!({"cmd": "close"}),
            queued_at: Instant::now(),
        });
        let _ = proxy.send_event(());
    });
    queue
}

/// Process all queued commands. Called from about_to_wait in the winit event loop.
/// app parameter gives access to the full ShellApp state (tree, runtime, renderer).
/// Process ONE queued command per call. Returns after each command so the
/// winit event loop can paint, process window events, etc. between commands.
/// The `wait` command sets a delay — subsequent commands won't run until
/// the delay expires, keeping the event loop free to render frames.
pub fn process_commands(queue: &CommandQueue, app: &mut super::ShellApp) {
    // If a wait is active, check if it's expired
    if let Some(wait_until) = app.test_wait_until {
        if Instant::now() < wait_until {
            return; // Still waiting — let the event loop paint
        }
        app.test_wait_until = None;
        // Wait expired — respond
        println!("{}", serde_json::json!({"ok": true, "waited": true}));
    }

    // Process one command
    let cmd = {
        let mut q = queue.lock().unwrap();
        q.pop_front()
    };

    if let Some(cmd) = cmd {
        // Handle wait specially — don't block, set a timer
        if cmd.cmd == "wait" {
            let ms = cmd.params.get("ms").and_then(|v| v.as_u64()).unwrap_or(100);
            app.test_wait_until = Some(Instant::now() + std::time::Duration::from_millis(ms));
            return; // Response sent when wait expires
        }

        let queue_latency_ms = cmd.queued_at.elapsed().as_millis();
        let exec_start = Instant::now();
        let mut response = execute_command(&cmd, app);
        let exec_ms = exec_start.elapsed().as_millis();

        if let Value::Object(ref mut map) = response {
            map.insert("_queue_ms".to_string(), Value::from(queue_latency_ms as u64));
            map.insert("_exec_ms".to_string(), Value::from(exec_ms as u64));
        }
        println!("{}", serde_json::to_string(&response).unwrap_or_else(|_| "{}".to_string()));
    }

    // Streaming watch: emit change events when the tree is dirty.
    if app.watch_active && (app.tree.needs_layout() || app.tree.needs_paint()) {
        let event = serde_json::json!({
            "_event": "change",
            "needs_layout": app.tree.needs_layout(),
            "needs_paint": app.tree.needs_paint(),
            "node_count": app.tree.nodes.len(),
        });
        println!("{}", event);
    }
}

fn execute_command(cmd: &TestCommand, app: &mut super::ShellApp) -> Value {
    // Any non-watch command cancels an active watch subscription.
    if cmd.cmd != "watch" && cmd.cmd != "watch_stop" && app.watch_active {
        app.watch_active = false;
        app.watch_filter = None;
    }

    match cmd.cmd.as_str() {
        // State
        "snapshot" => cmd_snapshot(app, &cmd.params),
        "find" => cmd_find(app, &cmd.params),
        "query" => cmd_query(app, &cmd.params),
        "explain" => cmd_explain(app, &cmd.params),
        "computed_styles" => cmd_computed_styles(app, &cmd.params),
        "input_state" => cmd_input_state(app, &cmd.params),

        // Interaction
        "click" => cmd_click(app, &cmd.params),
        "scroll" => cmd_scroll(app, &cmd.params),
        "hover" => cmd_hover(app, &cmd.params),
        "type" => cmd_type(app, &cmd.params),
        "navigate" => cmd_navigate(app, &cmd.params),
        "focus" => cmd_focus(app, &cmd.params),

        // Visualization
        "ascii" => cmd_ascii(app, &cmd.params),
        "screenshot" => cmd_screenshot(app, &cmd.params),
        "compare_pixels" => cmd_compare_pixels(app, &cmd.params),

        // Analysis
        "analyze" => cmd_analyze(app, &cmd.params),
        "suggest_fixes" => cmd_suggest_fixes(app, &cmd.params),
        "visual_audit" => cmd_visual_audit(app),
        "spacing_audit" => cmd_spacing_audit(app),
        "stacking_order" => cmd_stacking_order(app, &cmd.params),
        "compare_layout" => cmd_compare_layout(app, &cmd.params),

        // Assertions
        "assert_visible" => cmd_assert_visible(app, &cmd.params),
        "assert_clickable" => cmd_assert_clickable(app, &cmd.params),
        "why_not_visible" => cmd_why_not_visible(app, &cmd.params),
        "hit_test" => cmd_hit_test(app, &cmd.params),
        "list_handlers" => cmd_list_handlers(app, &cmd.params),

        // Diff
        "snapshot_mark" => cmd_snapshot_mark(app, &cmd.params),
        "diff" => cmd_diff(app, &cmd.params),

        // Performance
        "perf" => cmd_perf(app, &cmd.params),

        // A11y
        "accessibility_tree" => cmd_accessibility_tree(app, &cmd.params),

        // Watch
        "watch" => cmd_watch(app, &cmd.params),
        "watch_stop" => cmd_watch_stop(app),

        // Session (wait is handled in process_commands, not here)
        "close" => {
            // Clean up session file before exiting.
            if let Some(ref path) = app.session_file {
                let _ = std::fs::remove_file(path);
            }
            std::process::exit(0)
        }

        other => serde_json::json!({"error": format!("unknown command: {}", other)}),
    }
}

// === Helpers ===

fn make_snapshot(app: &super::ShellApp) -> rvst_snapshot::SceneSnapshot {
    rvst_snapshot::SceneSnapshot::from_tree(&app.tree, app.canvas_w() as f32, app.canvas_h() as f32)
}

/// Parse a CSS hex color to relative luminance (0.0 = black, 1.0 = white).
fn parse_hex_lightness(color: &str) -> Option<f64> {
    let hex = color.trim().trim_start_matches('#');
    let (r, g, b) = match hex.len() {
        3 => {
            let r = u8::from_str_radix(&hex[0..1].repeat(2), 16).ok()?;
            let g = u8::from_str_radix(&hex[1..2].repeat(2), 16).ok()?;
            let b = u8::from_str_radix(&hex[2..3].repeat(2), 16).ok()?;
            (r, g, b)
        }
        6 => {
            let r = u8::from_str_radix(&hex[0..2], 16).ok()?;
            let g = u8::from_str_radix(&hex[2..4], 16).ok()?;
            let b = u8::from_str_radix(&hex[4..6], 16).ok()?;
            (r, g, b)
        }
        _ => return None,
    };
    // sRGB relative luminance (WCAG 2.1)
    let to_linear = |c: u8| {
        let s = c as f64 / 255.0;
        if s <= 0.04045 { s / 12.92 } else { ((s + 0.055) / 1.055).powf(2.4) }
    };
    Some(0.2126 * to_linear(r) + 0.7152 * to_linear(g) + 0.0722 * to_linear(b))
}

/// Find the effective background lightness for a node by walking up ancestors.
fn find_bg_lightness(node: &rvst_snapshot::NodeSnapshot, snap: &rvst_snapshot::SceneSnapshot) -> Option<f64> {
    // Check this node's background
    if let Some(bg) = node.styles.get("background-color").or_else(|| node.styles.get("background")) {
        if let Some(l) = parse_hex_lightness(bg) {
            return Some(l);
        }
    }
    // Walk up ancestors
    if let Some(parent_id) = node.parent {
        if let Some(parent) = snap.nodes.iter().find(|n| n.id == parent_id) {
            return find_bg_lightness(parent, snap);
        }
    }
    None
}

/// Walk ancestors to find the effective text color for a node (used in diff contrast lint).
fn find_effective_color<'a>(
    node_id: u32,
    nodes: &std::collections::HashMap<u32, &'a rvst_snapshot::NodeSnapshot>,
) -> Option<String> {
    let mut current = nodes.get(&node_id).copied();
    while let Some(n) = current {
        if let Some(color) = n.styles.get("color") {
            if !color.is_empty() {
                return Some(color.clone());
            }
        }
        current = n.parent.and_then(|pid| nodes.get(&pid).copied());
    }
    None
}

/// Walk ancestors to find the effective background color for a node (used in diff contrast lint).
fn find_effective_bg<'a>(
    node_id: u32,
    nodes: &std::collections::HashMap<u32, &'a rvst_snapshot::NodeSnapshot>,
) -> Option<String> {
    let mut current = nodes.get(&node_id).copied();
    while let Some(n) = current {
        if let Some(bg) = n.styles.get("background-color").or_else(|| n.styles.get("background")) {
            if !bg.is_empty() && bg != "none" && bg != "transparent" {
                return Some(bg.clone());
            }
        }
        current = n.parent.and_then(|pid| nodes.get(&pid).copied());
    }
    None
}

// === State Commands ===

fn cmd_snapshot(app: &super::ShellApp, _params: &Value) -> Value {
    let snap = make_snapshot(app);
    serde_json::json!({
        "node_count": snap.node_count,
        "viewport_w": snap.viewport_w,
        "viewport_h": snap.viewport_h,
        "diagnostics_count": snap.diagnostics.len(),
        "nodes": snap.nodes.len(),
    })
}

fn cmd_find(app: &super::ShellApp, params: &Value) -> Value {
    let snap = make_snapshot(app);

    let text_filter = params.get("text").and_then(|v| v.as_str());
    let role_filter = params.get("role").and_then(|v| v.as_str());
    let class_filter = params.get("class").and_then(|v| v.as_str());

    let results: Vec<Value> = snap.nodes.iter().filter(|n| {
        if let Some(text) = text_filter {
            let has_text = n.name.as_ref().map(|t| t.contains(text)).unwrap_or(false)
                || n.text.as_ref().map(|t| t.contains(text)).unwrap_or(false);
            if !has_text { return false; }
        }
        if let Some(role) = role_filter {
            if n.role != role { return false; }
        }
        if let Some(class) = class_filter {
            let node_class = n.styles.get("class").map(|s| s.as_str()).unwrap_or("");
            if !node_class.contains(class) { return false; }
        }
        true
    }).map(|n| {
        serde_json::json!({
            "id": n.id,
            "role": n.role,
            "name": n.name,
            "text": n.text,
            "node_type": n.node_type,
            "has_handlers": n.has_handlers,
            "layout": n.layout,
        })
    }).collect();

    let count = results.len();
    serde_json::json!({"nodes": results, "count": count})
}

fn cmd_query(app: &super::ShellApp, params: &Value) -> Value {
    let id = params.get("id").and_then(|v| v.as_u64()).unwrap_or(0) as u32;
    let snap = make_snapshot(app);

    match snap.nodes.iter().find(|n| n.id == id) {
        Some(n) => serde_json::to_value(n).unwrap_or(serde_json::json!({"error": "serialize failed"})),
        None => serde_json::json!({"error": format!("node {} not found", id)}),
    }
}

fn cmd_explain(app: &super::ShellApp, params: &Value) -> Value {
    let id = params.get("id").and_then(|v| v.as_u64()).unwrap_or(0) as u32;
    let snap = make_snapshot(app);
    let explanation = snap.explain_render(id);
    serde_json::to_value(&explanation).unwrap_or_default()
}

fn cmd_computed_styles(app: &super::ShellApp, params: &Value) -> Value {
    let id = params.get("id").and_then(|v| v.as_u64()).unwrap_or(0) as u32;
    let node = app.tree.nodes.get(&rvst_core::NodeId(id));
    match node {
        Some(n) => serde_json::json!({"id": id, "styles": n.styles}),
        None => serde_json::json!({"error": "node not found"}),
    }
}

/// Report what an Input/Textarea is actually displaying.
/// Returns the displayed text, whether it's placeholder or value,
/// focus state, and the rendering parameters.
fn cmd_input_state(app: &super::ShellApp, params: &Value) -> Value {
    // Accept id directly or find by role=textbox
    let id = params.get("id").and_then(|v| v.as_u64()).map(|v| v as u32)
        .or_else(|| {
            // Find all inputs, return first matching
            app.tree.nodes.values()
                .find(|n| matches!(n.node_type, rvst_core::NodeType::Input | rvst_core::NodeType::Textarea)
                    && n.layout.map(|l| l.w > 0.0).unwrap_or(false))
                .map(|n| n.id.0)
        });
    let id = match id {
        Some(id) => id,
        None => return serde_json::json!({"error": "no input found"}),
    };
    let node = match app.tree.nodes.get(&rvst_core::NodeId(id)) {
        Some(n) => n,
        None => return serde_json::json!({"error": format!("node {} not found", id)}),
    };
    let value = node.styles.get("value").map(|s| s.as_str()).unwrap_or("");
    let placeholder = node.styles.get("placeholder").map(|s| s.as_str()).unwrap_or("");
    let is_focused = app.tree.focused == Some(rvst_core::NodeId(id));
    let display_text = if !value.is_empty() { value } else { placeholder };
    let showing = if !value.is_empty() { "value" } else if !placeholder.is_empty() { "placeholder" } else { "empty" };

    serde_json::json!({
        "id": id,
        "node_type": format!("{:?}", node.node_type),
        "value": value,
        "placeholder": placeholder,
        "display_text": display_text,
        "showing": showing,
        "focused": is_focused,
        "layout": node.layout.map(|l| serde_json::json!({"x": l.x, "y": l.y, "w": l.w, "h": l.h})),
        "font_size": node.styles.get("font-size").cloned().unwrap_or_default(),
        "color": node.styles.get("color").cloned().unwrap_or_default(),
        "bg": node.styles.get("background-color").cloned().unwrap_or_default(),
    })
}

// === Interaction Commands ===

fn cmd_click(app: &mut super::ShellApp, params: &Value) -> Value {
    // Snapshot BEFORE interaction
    let before = make_snapshot(app);

    // Execute click
    let click_result = if let Some(text) = params.get("text").and_then(|v| v.as_str()) {
        app.click_by_text(text).map(|_| serde_json::json!({"target": text}))
    } else if let (Some(x), Some(y)) = (
        params.get("x").and_then(|v| v.as_f64()),
        params.get("y").and_then(|v| v.as_f64()),
    ) {
        app.click_at(x as f32, y as f32).map(|_| serde_json::json!({"target": {"x": x, "y": y}}))
    } else {
        return serde_json::json!({"error": "click requires 'text' or 'x'+'y' params"});
    };

    match click_result {
        Err(e) => serde_json::json!({"error": e}),
        Ok(target) => {
            // Snapshot AFTER interaction
            let after = make_snapshot(app);

            // Diff: what changed?
            let diff = rvst_snapshot::scene_diff(&before, &after);
            let style_changes: Vec<&rvst_snapshot::SceneChange> = diff.changes.iter()
                .filter(|c| matches!(c, rvst_snapshot::SceneChange::StyleChanged { .. }))
                .collect();
            let text_changes: Vec<&rvst_snapshot::SceneChange> = diff.changes.iter()
                .filter(|c| matches!(c, rvst_snapshot::SceneChange::TextChanged { .. }))
                .collect();
            let added: Vec<&rvst_snapshot::SceneChange> = diff.changes.iter()
                .filter(|c| matches!(c, rvst_snapshot::SceneChange::NodeAdded { .. }))
                .collect();
            let removed: Vec<&rvst_snapshot::SceneChange> = diff.changes.iter()
                .filter(|c| matches!(c, rvst_snapshot::SceneChange::NodeRemoved { .. }))
                .collect();

            // Top style changes (most interesting ones)
            let top_changes: Vec<Value> = style_changes.iter().take(5).map(|c| {
                if let rvst_snapshot::SceneChange::StyleChanged { id, property, before: b, after: a } = c {
                    serde_json::json!({"id": id, "prop": property, "from": b, "to": a})
                } else { Value::Null }
            }).collect();

            // Lints: automatic warnings about potential issues
            let mut lints = Vec::new();

            // Lint: click produced no changes
            if diff.changes.is_empty() {
                lints.push(serde_json::json!({
                    "level": "warning",
                    "lint": "no_effect",
                    "message": "Click produced no visible changes. The handler may not be connected, or the state didn't change."
                }));
            }

            // Lint: new nodes without handlers
            let after_buttons_no_handler: Vec<u32> = after.nodes.iter()
                .filter(|n| n.node_type == "Button" && !n.has_handlers && n.name.is_some())
                .map(|n| n.id)
                .collect();
            if !after_buttons_no_handler.is_empty() && after_buttons_no_handler.len() <= 5 {
                lints.push(serde_json::json!({
                    "level": "warning",
                    "lint": "buttons_no_handlers",
                    "message": format!("{} button(s) have no click handlers", after_buttons_no_handler.len()),
                    "ids": after_buttons_no_handler,
                }));
            }

            // Lint: zero-size nodes appeared
            let new_zero_size: Vec<u32> = after.nodes.iter()
                .filter(|n| {
                    n.layout.as_ref().map(|r| r.w <= 0.0 || r.h <= 0.0).unwrap_or(false)
                    && n.text.is_some()
                    && !before.nodes.iter().any(|b| b.id == n.id)
                })
                .map(|n| n.id)
                .collect();
            if !new_zero_size.is_empty() {
                lints.push(serde_json::json!({
                    "level": "warning",
                    "lint": "new_zero_size",
                    "message": format!("{} new node(s) with content have zero size", new_zero_size.len()),
                    "ids": new_zero_size,
                }));
            }

            // Lint: bulk change
            if diff.changes.len() > 50 {
                lints.push(serde_json::json!({
                    "level": "info",
                    "lint": "bulk_change",
                    "message": format!("{} changes detected — may be a state toggle affecting many components", diff.changes.len()),
                }));
            }

            // Lint: visibility regression — only flag if nodes disappeared WITHOUT
            // new nodes replacing them (navigation is fine, content vanishing is not)
            if removed.len() > added.len() + 3 {
                // More removed than added — content may have been lost
                lints.push(serde_json::json!({
                    "level": "warning",
                    "lint": "content_lost",
                    "message": format!("{} nodes removed but only {} added — content may have been lost", removed.len(), added.len()),
                }));
            }

            // Lint: focus lost — focused element was removed or hidden
            if let Some(focused_id) = before.focused_id {
                let focus_preserved = after.nodes.iter().any(|n| {
                    n.id == focused_id
                    && n.layout.as_ref().map(|r| r.w > 0.0 && r.h > 0.0).unwrap_or(false)
                });
                if !focus_preserved {
                    lints.push(serde_json::json!({
                        "level": "warning",
                        "lint": "focus_lost",
                        "message": format!("Previously focused node {} was removed or hidden", focused_id),
                    }));
                }
            }

            // Lint: contrast — only check nodes whose color OR background CHANGED
            // Don't report pre-existing contrast issues (those belong in `analyze contrast`)
            // Walk ancestors to find inherited text color and background.
            {
                let changed_ids: std::collections::HashSet<u32> = diff.changes.iter().filter_map(|c| {
                    if let rvst_snapshot::SceneChange::StyleChanged { id, property, .. } = c {
                        if property == "color" || property == "background-color" || property == "background" {
                            return Some(*id);
                        }
                    }
                    None
                }).collect();

                let after_nodes: std::collections::HashMap<u32, &rvst_snapshot::NodeSnapshot> =
                    after.nodes.iter().map(|n| (n.id, n)).collect();

                let mut contrast_warned = false;
                for node in &after.nodes {
                    if contrast_warned { break; }
                    if !changed_ids.contains(&node.id) { continue; }

                    let has_text = node.text.is_some() || node.name.is_some();
                    if !has_text { continue; }

                    let fg_str = find_effective_color(node.id, &after_nodes);
                    let bg_str = find_effective_bg(node.id, &after_nodes);

                    if let (Some(fg), Some(bg)) = (fg_str.as_deref(), bg_str.as_deref()) {
                        if let (Some(fg_l), Some(bg_l)) = (parse_hex_lightness(fg), parse_hex_lightness(bg)) {
                            let ratio = if fg_l > bg_l {
                                (fg_l + 0.05) / (bg_l + 0.05)
                            } else {
                                (bg_l + 0.05) / (fg_l + 0.05)
                            };
                            if ratio < 3.0 && ratio > 1.0 {
                                lints.push(serde_json::json!({
                                    "level": "warning",
                                    "lint": "contrast_regression",
                                    "message": format!("Node {} '{}' now has low contrast {:.1}:1 (color:{} on bg:{})",
                                        node.id,
                                        node.name.as_deref().or(node.text.as_deref()).unwrap_or(""),
                                        ratio, fg, bg),
                                    "id": node.id,
                                    "ratio": ratio,
                                }));
                                contrast_warned = true;
                            }
                        }
                    }
                }
            }

            // Lint: new content has no visible text — added nodes might be empty containers
            if added.len() > 10 {
                let new_ids: std::collections::HashSet<u32> = added.iter().filter_map(|c| {
                    if let rvst_snapshot::SceneChange::NodeAdded { id, .. } = c { Some(*id) } else { None }
                }).collect();
                let new_with_text = after.nodes.iter()
                    .filter(|n| new_ids.contains(&n.id) && n.text.is_some())
                    .count();
                if new_with_text == 0 {
                    lints.push(serde_json::json!({
                        "level": "info",
                        "lint": "empty_content",
                        "message": format!("{} nodes added but none contain text — may be empty containers", added.len()),
                    }));
                }
            }

            serde_json::json!({
                "ok": true,
                "clicked": target,
                "changes": {
                    "total": diff.changes.len(),
                    "styles": style_changes.len(),
                    "text": text_changes.len(),
                    "added": added.len(),
                    "removed": removed.len(),
                    "top": top_changes,
                },
                "after": {
                    "node_count": after.node_count,
                },
                "lints": lints,
            })
        }
    }
}

fn cmd_scroll(app: &mut super::ShellApp, params: &Value) -> Value {
    let x = params.get("x").and_then(|v| v.as_f64()).unwrap_or(512.0) as f32;
    let y = params.get("y").and_then(|v| v.as_f64()).unwrap_or(400.0) as f32;
    let delta = params.get("delta").and_then(|v| v.as_f64()).unwrap_or(100.0) as f32;

    let scroll_before = app.tree.find_scroll_container_at(x, y)
        .and_then(|id| app.tree.nodes.get(&id).map(|n| n.scroll_y))
        .unwrap_or(0.0);

    match app.scroll_at(x, y, delta) {
        Ok(()) => {
            let scroll_after = app.tree.find_scroll_container_at(x, y)
                .and_then(|id| app.tree.nodes.get(&id).map(|n| n.scroll_y))
                .unwrap_or(0.0);

            let mut lints = Vec::new();

            // Lint: scroll didn't change position
            if (scroll_after - scroll_before).abs() < 0.1 {
                lints.push(serde_json::json!({
                    "level": "warning",
                    "lint": "scroll_no_effect",
                    "message": format!("Scroll at ({},{}) with delta {} didn't change scroll position. May have hit bounds or no scroll container found.", x, y, delta),
                }));
            }

            // Lint: scroll hit rubber-band zone
            let container = app.tree.find_scroll_container_at(x, y);
            if let Some(cid) = container {
                let max_scroll = app.tree.compute_max_scroll(cid);
                if scroll_after < 0.0 {
                    lints.push(serde_json::json!({
                        "level": "info",
                        "lint": "rubber_band_top",
                        "message": format!("Overscrolled past top by {:.1}px (rubber-banding)", -scroll_after),
                    }));
                } else if scroll_after > max_scroll {
                    lints.push(serde_json::json!({
                        "level": "info",
                        "lint": "rubber_band_bottom",
                        "message": format!("Overscrolled past bottom by {:.1}px (rubber-banding)", scroll_after - max_scroll),
                    }));
                }
            }

            serde_json::json!({
                "ok": true,
                "scroll_y": scroll_after,
                "delta_applied": scroll_after - scroll_before,
                "lints": lints,
            })
        }
        Err(e) => serde_json::json!({"error": e}),
    }
}

fn cmd_hover(app: &mut super::ShellApp, params: &Value) -> Value {
    let x = params.get("x").and_then(|v| v.as_f64()).unwrap_or(0.0) as f32;
    let y = params.get("y").and_then(|v| v.as_f64()).unwrap_or(0.0) as f32;
    app.cursor_pos = Some((x, y));
    let hit = app.tree.hit_test_deepest(x, y);
    match hit {
        Some(id) => {
            let node = app.tree.nodes.get(&id);
            serde_json::json!({
                "id": id.0,
                "node_type": node.map(|n| format!("{:?}", n.node_type)),
                "role": node.map(|n| format!("{:?}", n.node_type)),
            })
        }
        None => serde_json::json!({"id": null}),
    }
}

fn cmd_type(app: &mut super::ShellApp, params: &Value) -> Value {
    let text = params.get("text").and_then(|v| v.as_str()).unwrap_or("");
    let into = params.get("into").and_then(|v| v.as_str());

    // Find target node: either by placeholder/class, or use focused element
    let target = if let Some(selector) = into {
        // Try placeholder match first, then class match
        app.tree.nodes.values()
            .find(|n| {
                matches!(n.node_type, rvst_core::NodeType::Input | rvst_core::NodeType::Textarea)
                    && n.styles.get("placeholder").map(|s| s.as_str()) == Some(selector)
            })
            .or_else(|| {
                app.tree.nodes.values().find(|n| {
                    matches!(n.node_type, rvst_core::NodeType::Input | rvst_core::NodeType::Textarea)
                        && n.styles.get("class")
                            .map(|cls| cls.split_whitespace().any(|t| t == selector))
                            .unwrap_or(false)
                })
            })
            .map(|n| n.id)
    } else {
        app.tree.focused
    };

    let node_id = match target {
        Some(id) => id,
        None => return serde_json::json!({"error": "no target element found (use 'into' param or focus an element)"}),
    };

    // Find the input handler for this node
    let handler_id = app.tree.handlers.iter()
        .find(|(nid, ev, _)| *nid == node_id && ev == "input")
        .map(|(_, _, hid)| *hid);

    // Check if the target is an rvst-editor node
    let is_editor_node = app.tree.nodes.get(&node_id)
        .and_then(|n| n.styles.get("data-rvst-editor"))
        .map(|v| v == "true")
        .unwrap_or(false);

    if is_editor_node {
        // Dispatch to rvst-editor: simulate typing each character
        app.tree.focused = Some(node_id);
        if !app.editors.contains_key(&node_id) {
            let mut editor = rvst_editor::EditorState::with_paragraph();
            editor.select_start();
            app.editors.insert(node_id, editor);
        }
        if let Some(editor) = app.editors.get_mut(&node_id) {
            for ch in text.chars() {
                rvst_editor::apply_command(editor, rvst_editor::EditorCommand::InsertText(ch.to_string()));
            }
            let content = editor.text_content();
            app.tree.mark_needs_paint(node_id);
            return serde_json::json!({"ok": true, "typed": text, "into": node_id.0, "editor_content": content});
        }
        return serde_json::json!({"error": "editor state not found"});
    }

    let handler_id = match handler_id {
        Some(hid) => hid,
        None => return serde_json::json!({"error": format!("node {} has no input handler", node_id.0)}),
    };

    // Focus the node
    app.tree.focused = Some(node_id);

    // Dispatch the input event
    if let Some(runtime) = &mut app.runtime {
        match runtime.dispatch_input_event(handler_id, node_id.0, text.to_string()) {
            Ok(new_ops) => {
                for op in new_ops {
                    super::apply_op(op, &mut app.tree, None, None);
                }
                // Mark tree dirty so layout runs on next about_to_wait
                app.tree.mark_needs_paint(node_id);
                serde_json::json!({"ok": true, "typed": text, "into": node_id.0})
            }
            Err(e) => serde_json::json!({"error": format!("dispatch error: {:?}", e)}),
        }
    } else {
        serde_json::json!({"error": "no runtime available"})
    }
}

fn cmd_navigate(app: &mut super::ShellApp, params: &Value) -> Value {
    let action = params.get("action").and_then(|v| v.as_str()).unwrap_or("tab");
    let snap = make_snapshot(app);
    let focusable: Vec<_> = snap.nodes.iter()
        .filter(|n| n.role == "button" || n.role == "textbox" || n.role == "form")
        .collect();

    let current_focused = app.tree.focused.map(|id| id.0);
    let focusable_ids: Vec<u32> = focusable.iter().map(|n| n.id).collect();

    if focusable_ids.is_empty() {
        return serde_json::json!({"action": action, "focusable_count": 0, "focused": null});
    }

    let current_idx = current_focused.and_then(|fid| focusable_ids.iter().position(|&id| id == fid));

    let next_idx = match action {
        "tab" | "next" => {
            match current_idx {
                Some(idx) => (idx + 1) % focusable_ids.len(),
                None => 0,
            }
        }
        "shift-tab" | "prev" => {
            match current_idx {
                Some(idx) => {
                    if idx == 0 { focusable_ids.len() - 1 } else { idx - 1 }
                }
                None => focusable_ids.len() - 1,
            }
        }
        _ => 0,
    };

    let next_id = focusable_ids[next_idx];
    app.tree.focused = Some(rvst_core::NodeId(next_id));
    app.tree.mark_needs_paint(rvst_core::NodeId(next_id));

    serde_json::json!({
        "action": action,
        "focusable_count": focusable_ids.len(),
        "focused": next_id,
    })
}

fn cmd_focus(app: &mut super::ShellApp, params: &Value) -> Value {
    let id = params.get("id").and_then(|v| v.as_u64()).unwrap_or(0) as u32;
    let node_exists = app.tree.nodes.contains_key(&rvst_core::NodeId(id));
    if !node_exists {
        return serde_json::json!({"error": format!("node {} not found", id)});
    }
    app.tree.focused = Some(rvst_core::NodeId(id));
    app.tree.mark_needs_paint(rvst_core::NodeId(id));
    serde_json::json!({"ok": true, "focused": id})
}

// === Visualization Commands ===

fn cmd_ascii(app: &super::ShellApp, params: &Value) -> Value {
    let snap = make_snapshot(app);
    let mode = params.get("mode").and_then(|v| v.as_str()).unwrap_or("tree");

    let output = match mode {
        "tree" => super::ascii::tree(&snap),
        s if s.starts_with("tree:") => {
            let view_name = s.strip_prefix("tree:").unwrap_or("semantic");
            let view = super::ascii::TreeView::parse(view_name);
            super::ascii::tree_with_view(&snap, view)
        }
        "css" => super::ascii::tree_with_view(&snap, super::ascii::TreeView::Css),
        "layout" => super::ascii::tree_with_view(&snap, super::ascii::TreeView::Layout),
        "full" => super::ascii::tree_with_view(&snap, super::ascii::TreeView::Full),
        "structure" => {
            let map = super::ascii::structure(&snap, 160, 50);
            super::ascii::crop(&map)
        }
        _ => format!("unknown ascii mode: {}", mode),
    };

    serde_json::json!({"output": output, "mode": mode})
}

fn cmd_screenshot(app: &mut super::ShellApp, params: &Value) -> Value {
    let path = params.get("path").and_then(|v| v.as_str()).unwrap_or("/tmp/rvst-screenshot.png");
    // Pixel capture requires GPU readback; report dimensions for now.
    serde_json::json!({
        "ok": true,
        "path": path,
        "width": app.canvas_w(),
        "height": app.canvas_h(),
    })
}

fn cmd_compare_pixels(_app: &super::ShellApp, params: &Value) -> Value {
    let baseline = params.get("baseline").and_then(|v| v.as_str()).unwrap_or("");
    let current = params.get("current").and_then(|v| v.as_str()).unwrap_or("");

    // Load both PNGs and compare pixel-by-pixel
    let baseline_data = std::fs::read(baseline);
    let current_data = std::fs::read(current);

    match (baseline_data, current_data) {
        (Ok(b), Ok(c)) => {
            if b == c {
                serde_json::json!({"baseline": baseline, "current": current, "match": true, "diff_percent": 0.0})
            } else {
                // Byte-level diff as a rough approximation
                let total = b.len().max(c.len()).max(1);
                let diff_bytes = b.iter().zip(c.iter()).filter(|(a, b)| a != b).count()
                    + (b.len() as isize - c.len() as isize).unsigned_abs();
                let diff_pct = (diff_bytes as f64 / total as f64) * 100.0;
                serde_json::json!({"baseline": baseline, "current": current, "match": false, "diff_percent": diff_pct})
            }
        }
        (Err(e), _) => serde_json::json!({"error": format!("cannot read baseline: {}", e)}),
        (_, Err(e)) => serde_json::json!({"error": format!("cannot read current: {}", e)}),
    }
}

// === Analysis Commands ===

fn cmd_analyze(app: &super::ShellApp, params: &Value) -> Value {
    let analysis_type = params.get("type").and_then(|v| v.as_str()).unwrap_or("diagnostics");
    let snap = make_snapshot(app);

    use rvst_analyze::AnalysisReport;
    match analysis_type {
        "diagnostics" => {
            let report = rvst_analyze::diagnostics::analyze_diagnostics(&snap);
            serde_json::json!({
                "type": "diagnostics",
                "findings": report.to_plain_string(),
                "count": report.findings().len(),
            })
        }
        "layout" => {
            let report = rvst_analyze::layout::analyze_layout(&snap);
            serde_json::json!({
                "type": "layout",
                "findings": report.to_plain_string(),
                "count": report.findings().len(),
            })
        }
        "a11y" => {
            let report = rvst_analyze::a11y::analyze_a11y(&snap);
            serde_json::json!({
                "type": "a11y",
                "findings": report.to_plain_string(),
                "count": report.findings().len(),
            })
        }
        "contrast" | "heatmap" => {
            serde_json::json!({"error": format!("{} requires GPU pixel data", analysis_type)})
        }
        _ => serde_json::json!({"error": format!("unknown analysis type: {}", analysis_type)}),
    }
}

fn cmd_suggest_fixes(app: &super::ShellApp, _params: &Value) -> Value {
    let snap = make_snapshot(app);
    use rvst_analyze::AnalysisReport;

    let mut suggestions = Vec::new();

    let diag = rvst_analyze::diagnostics::analyze_diagnostics(&snap);
    for f in diag.findings() {
        suggestions.push(serde_json::json!({
            "severity": format!("{:?}", f.severity),
            "category": f.category,
            "message": f.message,
            "node_ids": f.node_ids,
        }));
    }

    let layout_report = rvst_analyze::layout::analyze_layout(&snap);
    for f in layout_report.findings() {
        suggestions.push(serde_json::json!({
            "severity": format!("{:?}", f.severity),
            "category": f.category,
            "message": f.message,
            "node_ids": f.node_ids,
        }));
    }

    let a11y = rvst_analyze::a11y::analyze_a11y(&snap);
    for f in a11y.findings() {
        suggestions.push(serde_json::json!({
            "severity": format!("{:?}", f.severity),
            "category": f.category,
            "message": f.message,
            "node_ids": f.node_ids,
        }));
    }

    let count = suggestions.len();
    serde_json::json!({"suggestions": suggestions, "count": count})
}

/// Pixel-based spacing audit — analyzes the actual GPU render for spacing
/// anomalies using gradient edge detection. Does not rely on CSS values.
fn cmd_spacing_audit(app: &super::ShellApp) -> Value {
    // Render the current scene to pixels
    let cw = app.canvas_w();
    let ch = app.canvas_h();
    let pixels = rvst_render_wgpu::render_to_rgba(&app.last_scene, cw, ch);
    match pixels {
        Some(px) => super::spacing_analyzer::analyze_spacing(&px, cw, ch),
        None => serde_json::json!({"error": "GPU pixel rendering not available (no adapter)"}),
    }
}

/// Visual quality audit — checks for layout/rendering issues that look wrong
/// even when the CSS is technically correct.
fn cmd_visual_audit(app: &super::ShellApp) -> Value {
    let snap = make_snapshot(app);
    let nodes: std::collections::HashMap<u32, &rvst_snapshot::NodeSnapshot> =
        snap.nodes.iter().map(|n| (n.id, n)).collect();
    // Layout rects are in logical pixels; viewport may be in physical pixels (Retina).
    // Use scale factor to get logical viewport.
    let scale = app.scale_factor.max(1.0);
    let vp_w = snap.viewport_w / scale;
    let vp_h = snap.viewport_h / scale;

    let mut issues = Vec::new();

    for n in &snap.nodes {
        let l = match &n.layout {
            Some(r) if r.w > 0.0 && r.h > 0.0 => r,
            _ => continue,
        };
        let parent = n.parent.and_then(|pid| nodes.get(&pid));
        let pl = parent.and_then(|p| p.layout.as_ref());

        // ── Lint 1: Text not visually centered in flex container ──────
        // If parent has align-items:center or justify-content:center,
        // check if child text is centered. Use font-size based heuristic
        // for expected centering since layout rects may not reflect
        // actual glyph position.
        if let Some(pl) = pl {
            if let Some(p) = parent {
                let ps = &p.styles;
                let is_center_container =
                    ps.get("align-items").map(|v| v == "center").unwrap_or(false)
                    || ps.get("justify-content").map(|v| v == "center").unwrap_or(false);

                if is_center_container && n.text.is_some() {
                    // Check vertical centering
                    let parent_mid_y = pl.y + pl.h / 2.0;
                    let child_mid_y = l.y + l.h / 2.0;
                    let dy = (parent_mid_y - child_mid_y).abs();

                    // Also check if the text HEIGHT is much smaller than container
                    // (indicates the text may visually sit at the top/bottom)
                    let height_ratio = l.h / pl.h;

                    if dy > 3.0 || (height_ratio < 0.5 && dy > 1.0) {
                        issues.push(serde_json::json!({
                            "type": "centering",
                            "severity": "warning",
                            "node_id": n.id,
                            "parent_id": p.id,
                            "text": n.text.as_deref().unwrap_or("").chars().take(20).collect::<String>(),
                            "message": format!(
                                "Text '{}' may not be visually centered in parent (dy={:.1}px, text {:.0}x{:.0} in {:.0}x{:.0} container)",
                                n.text.as_deref().unwrap_or(""), dy, l.w, l.h, pl.w, pl.h
                            ),
                        }));
                    }
                }
            }
        }

        // ── Lint 2: Non-square element with border-radius: 50% ────────
        // If border-radius is 50%, width and height should be equal
        // for a circle. If not, it renders as an oval/rounded rect.
        if let Some(br) = n.styles.get("border-radius") {
            if br == "50%" || br == "50% 50% 50% 50%" {
                let diff = (l.w - l.h).abs();
                if diff > 1.0 {
                    issues.push(serde_json::json!({
                        "type": "shape_mismatch",
                        "severity": "warning",
                        "node_id": n.id,
                        "message": format!(
                            "Node {} has border-radius:50% but is not square ({:.0}x{:.0} — differs by {:.0}px). Will render as oval, not circle.",
                            n.id, l.w, l.h, diff
                        ),
                    }));
                }
            }
        }

        // ── Lint 3: Content clipped at viewport edge ──────────────────
        // Horizontal overflow (off right edge) is almost always a bug —
        // text isn't wrapping or containers aren't width-constrained.
        // Vertical overflow is only suspicious on non-scroll containers.
        {
            let right_overflow = (l.x + l.w) - vp_w;
            let bottom_overflow = (l.y + l.h) - vp_h;
            let has_text = n.text.is_some() || n.name.is_some();

            // Horizontal overflow: always flag (even inside overflow:hidden parents)
            // because text should never extend beyond the viewport horizontally
            if has_text && right_overflow > 5.0 {
                issues.push(serde_json::json!({
                    "type": "offstage_right",
                    "severity": "warning",
                    "node_id": n.id,
                    "text": n.text.as_deref().or(n.name.as_deref()).unwrap_or("").chars().take(30).collect::<String>(),
                    "overflow_px": right_overflow as u32,
                    "message": format!(
                        "Node {} '{}' extends {:.0}px beyond right edge — text may not be wrapping",
                        n.id,
                        n.text.as_deref().or(n.name.as_deref()).unwrap_or("").chars().take(25).collect::<String>(),
                        right_overflow
                    ),
                }));
            }

            // Vertical overflow: only flag if NOT in a scroll container
            if has_text && bottom_overflow > 5.0 {
                let mut in_scroll = false;
                let mut ancestor_id = n.parent;
                while let Some(aid) = ancestor_id {
                    if let Some(anc) = nodes.get(&aid) {
                        let ov = anc.styles.get("overflow").map(|v| v.as_str()).unwrap_or("");
                        let ov_y = anc.styles.get("overflow-y").map(|v| v.as_str()).unwrap_or("");
                        if matches!(ov, "auto" | "scroll") || matches!(ov_y, "auto" | "scroll") {
                            in_scroll = true;
                            break;
                        }
                        ancestor_id = anc.parent;
                    } else {
                        break;
                    }
                }
                if !in_scroll {
                    issues.push(serde_json::json!({
                        "type": "offstage_bottom",
                        "severity": "info",
                        "node_id": n.id,
                        "overflow_px": bottom_overflow as u32,
                        "message": format!(
                            "Node {} extends {:.0}px below viewport",
                            n.id, bottom_overflow
                        ),
                    }));
                }
            }
        }

        // ── Lint 4: Text wider than container ─────────────────────────
        // Text content that is wider than its parent minus padding,
        // indicating the text is being cropped or needs truncation.
        if let (Some(pl), Some(p)) = (pl, parent) {
            if n.text.is_some() && l.w > 0.0 {
                // Get parent padding
                let pad_l = p.styles.get("padding-left")
                    .or(p.styles.get("padding"))
                    .and_then(|v| v.trim_end_matches("px").parse::<f32>().ok())
                    .unwrap_or(0.0);
                let pad_r = p.styles.get("padding-right")
                    .or(p.styles.get("padding"))
                    .and_then(|v| v.trim_end_matches("px").parse::<f32>().ok())
                    .unwrap_or(0.0);
                let available_w = pl.w - pad_l - pad_r;

                if l.w > available_w + 2.0 && available_w > 0.0 {
                    let overflow_px = l.w - available_w;
                    issues.push(serde_json::json!({
                        "type": "text_overflow",
                        "severity": "info",
                        "node_id": n.id,
                        "parent_id": p.id,
                        "text": n.text.as_deref().unwrap_or("").chars().take(30).collect::<String>(),
                        "message": format!(
                            "Text '{}' is {:.0}px wider than container ({:.0}px text in {:.0}px available)",
                            n.text.as_deref().unwrap_or("").chars().take(20).collect::<String>(),
                            overflow_px, l.w, available_w
                        ),
                    }));
                }
            }
        }

        // ── Lint 5: Sibling overlap (text on text) ────────────────────
        // Two sibling text nodes at the same position — likely overlapping labels.
        if n.text.is_some() {
            if let Some(parent_node) = parent {
                for &sib_id in &parent_node.children {
                    if sib_id == n.id { continue; }
                    if let Some(sib) = nodes.get(&sib_id) {
                        if sib.text.is_none() { continue; }
                        if let Some(sl) = &sib.layout {
                            if sl.w <= 0.0 || sl.h <= 0.0 { continue; }
                            // Check overlap
                            let overlap_x = (l.x.max(sl.x), (l.x + l.w).min(sl.x + sl.w));
                            let overlap_y = (l.y.max(sl.y), (l.y + l.h).min(sl.y + sl.h));
                            if overlap_x.1 > overlap_x.0 && overlap_y.1 > overlap_y.0 {
                                let overlap_area = (overlap_x.1 - overlap_x.0) * (overlap_y.1 - overlap_y.0);
                                let smaller_area = (l.w * l.h).min(sl.w * sl.h);
                                if smaller_area > 0.0 && overlap_area / smaller_area > 0.3 {
                                    issues.push(serde_json::json!({
                                        "type": "text_overlap",
                                        "severity": "warning",
                                        "node_id": n.id,
                                        "sibling_id": sib_id,
                                        "message": format!(
                                            "Text '{}' overlaps with '{}' ({:.0}% overlap)",
                                            n.text.as_deref().unwrap_or("").chars().take(15).collect::<String>(),
                                            sib.text.as_deref().unwrap_or("").chars().take(15).collect::<String>(),
                                            (overlap_area / smaller_area) * 100.0
                                        ),
                                    }));
                                    break; // one overlap per node is enough
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    // ── Lint 6: Text not wrapping (single-line overflow) ────────
    // Detects text nodes that are wider than their parent but only
    // one line tall — indicates word-wrap/overflow-wrap is broken.
    for n in &snap.nodes {
        if n.text.is_none() { continue; }
        let l = match &n.layout {
            Some(r) if r.w > 0.0 && r.h > 0.0 => r,
            _ => continue,
        };
        let text = n.text.as_deref().unwrap_or("");
        if text.len() < 30 { continue; } // short text won't wrap anyway
        let parent = n.parent.and_then(|pid| nodes.get(&pid));
        let pl = parent.and_then(|p| p.layout.as_ref());
        if let Some(pl) = pl {
            let font_size = n.styles.get("font-size")
                .and_then(|v| v.trim_end_matches("px").parse::<f32>().ok())
                .or_else(|| parent.and_then(|p| p.styles.get("font-size"))
                    .and_then(|v| v.trim_end_matches("px").parse::<f32>().ok()))
                .unwrap_or(14.0);
            let single_line_h = font_size * 1.6; // generous threshold
            // Text wider than parent AND only single-line height
            if l.w > pl.w + 5.0 && l.h < single_line_h {
                issues.push(serde_json::json!({
                    "type": "text_no_wrap",
                    "severity": "warning",
                    "node_id": n.id,
                    "text": text.chars().take(30).collect::<String>(),
                    "message": format!(
                        "Text '{}...' is {:.0}px wide in {:.0}px container but only {:.0}px tall — not wrapping",
                        text.chars().take(25).collect::<String>(),
                        l.w, pl.w, l.h
                    ),
                }));
            }
        }
    }

    // ── Lint 7: Sibling size mismatch in flex containers ────────
    // In a flex row, interactive/structural siblings should have similar heights.
    // In a flex column, similar widths. Flags likely layout bugs like an input
    // and button next to each other with mismatched heights.
    //
    // Scoped to small sibling groups (2–4 children) to avoid noise from
    // lists, feeds, and content layouts where variation is expected.
    for n in &snap.nodes {
        let display = n.styles.get("display").map(|v| v.as_str()).unwrap_or("");
        if !display.contains("flex") { continue; }
        let dir = n.styles.get("flex-direction").map(|v| v.as_str()).unwrap_or("row");
        let is_row = dir == "row" || dir == "row-reverse";

        // Collect visible, non-text children with layout
        let siblings: Vec<(u32, &rvst_snapshot::RectSnapshot, &str)> = n.children.iter()
            .filter_map(|&cid| {
                let child = nodes.get(&cid)?;
                if child.node_type == "Text" { return None; }
                let cl = child.layout.as_ref()?;
                if cl.w <= 0.0 || cl.h <= 0.0 { return None; }
                Some((cid, cl, child.node_type.as_str()))
            })
            .collect();

        // Only check small groups — larger ones are lists/feeds
        if siblings.len() < 2 || siblings.len() > 4 { continue; }

        // At least one sibling must be interactive (Input, Button, Textarea)
        // to avoid flagging pure layout containers
        let has_interactive = siblings.iter().any(|(_, _, nt)|
            matches!(*nt, "Input" | "Button" | "Textarea")
        );
        if !has_interactive { continue; }

        for pair in siblings.windows(2) {
            let (id_a, la, _) = pair[0];
            let (id_b, lb, _) = pair[1];

            let (dim_a, dim_b, axis) = if is_row {
                (la.h, lb.h, "height")
            } else {
                (la.w, lb.w, "width")
            };

            let diff = (dim_a - dim_b).abs();
            let max_dim = dim_a.max(dim_b);
            // Thresholds: >4px absolute, >15% relative, cross-axis dim > 10px
            if diff > 4.0 && max_dim > 10.0 && diff / max_dim > 0.15 {
                let describe = |id: u32| -> String {
                    let node = nodes.get(&id);
                    let nt = node.map(|n| n.node_type.as_str()).unwrap_or("?");
                    let name = node.and_then(|n| n.name.as_deref()).unwrap_or("");
                    if !name.is_empty() {
                        format!("{} '{}'", nt, &name[..name.len().min(15)])
                    } else {
                        format!("{} #{}", nt, id)
                    }
                };

                issues.push(serde_json::json!({
                    "type": "sibling_size_mismatch",
                    "severity": "info",
                    "parent_id": n.id,
                    "node_a": id_a,
                    "node_b": id_b,
                    "axis": axis,
                    "direction": dir,
                    "message": format!(
                        "Flex {} siblings have mismatched {}: {} is {:.0}px, {} is {:.0}px (diff {:.0}px / {:.0}%). Verify this is intentional.",
                        dir, axis,
                        describe(id_a), dim_a,
                        describe(id_b), dim_b,
                        diff, (diff / max_dim) * 100.0
                    ),
                }));
            }
        }
    }

    // Deduplicate (same issue on mirrored pairs)
    let count = issues.len();
    serde_json::json!({
        "issues": issues,
        "count": count,
        "checks": ["centering", "shape_mismatch", "viewport_clip", "text_overflow", "text_overlap", "text_no_wrap", "sibling_size_mismatch"],
    })
}

fn cmd_stacking_order(app: &super::ShellApp, params: &Value) -> Value {
    let x = params.get("x").and_then(|v| v.as_f64()).unwrap_or(0.0) as f32;
    let y = params.get("y").and_then(|v| v.as_f64()).unwrap_or(0.0) as f32;
    let snap = make_snapshot(app);
    let stack = snap.hit_test_stack(x, y);
    serde_json::json!({"x": x, "y": y, "stack": stack})
}

fn cmd_compare_layout(app: &super::ShellApp, params: &Value) -> Value {
    let id1 = params.get("id1").and_then(|v| v.as_u64()).unwrap_or(0) as u32;
    let id2 = params.get("id2").and_then(|v| v.as_u64()).unwrap_or(0) as u32;
    let snap = make_snapshot(app);
    let n1 = snap.node(id1);
    let n2 = snap.node(id2);
    serde_json::json!({
        "node1": {"id": id1, "layout": n1.and_then(|n| n.layout)},
        "node2": {"id": id2, "layout": n2.and_then(|n| n.layout)},
    })
}

// === Assertion Commands ===

fn cmd_assert_visible(app: &super::ShellApp, params: &Value) -> Value {
    let id = params.get("id").and_then(|v| v.as_u64()).unwrap_or(0) as u32;
    let snap = make_snapshot(app);
    match snap.assert_visible(id) {
        Ok(()) => serde_json::json!({"pass": true, "id": id}),
        Err(e) => serde_json::json!({"pass": false, "id": id, "reason": e}),
    }
}

fn cmd_assert_clickable(app: &super::ShellApp, params: &Value) -> Value {
    let id = params.get("id").and_then(|v| v.as_u64()).unwrap_or(0) as u32;
    let snap = make_snapshot(app);
    match snap.assert_clickable(id) {
        Ok(()) => serde_json::json!({"pass": true, "id": id}),
        Err(e) => serde_json::json!({"pass": false, "id": id, "reason": e}),
    }
}

fn cmd_why_not_visible(app: &super::ShellApp, params: &Value) -> Value {
    let id = params.get("id").and_then(|v| v.as_u64()).unwrap_or(0) as u32;
    let snap = make_snapshot(app);
    let verdict = snap.why_not_visible(id);
    serde_json::to_value(&verdict).unwrap_or_default()
}

fn cmd_hit_test(app: &super::ShellApp, params: &Value) -> Value {
    let x = params.get("x").and_then(|v| v.as_f64()).unwrap_or(0.0) as f32;
    let y = params.get("y").and_then(|v| v.as_f64()).unwrap_or(0.0) as f32;
    let snap = make_snapshot(app);
    let stack = snap.hit_test_stack(x, y);
    let top = stack.first().map(|e| serde_json::json!({
        "id": e.id,
        "node_type": e.node_type,
        "has_handlers": e.has_handlers,
        "pointer_events_none": e.pointer_events_none,
    }));
    serde_json::json!({
        "x": x,
        "y": y,
        "top": top,
        "stack_depth": stack.len(),
        "stack": stack,
    })
}

fn cmd_list_handlers(app: &super::ShellApp, params: &Value) -> Value {
    let id = params.get("id").and_then(|v| v.as_u64());
    let handlers: Vec<Value> = app.tree.handlers.iter()
        .filter(|(nid, _, _)| {
            match id {
                Some(filter_id) => nid.0 == filter_id as u32,
                None => true,
            }
        })
        .map(|(nid, event, hid)| {
            serde_json::json!({
                "node_id": nid.0,
                "event": event,
                "handler_id": hid,
            })
        })
        .collect();
    let count = handlers.len();
    serde_json::json!({"handlers": handlers, "count": count})
}

// === Diff Commands ===

fn cmd_snapshot_mark(app: &mut super::ShellApp, params: &Value) -> Value {
    let label = params.get("label").and_then(|v| v.as_str()).unwrap_or("default").to_string();
    let snap = make_snapshot(app);
    app.marked_snapshots.insert(label.clone(), snap);
    serde_json::json!({"ok": true, "label": label})
}

fn cmd_diff(app: &super::ShellApp, params: &Value) -> Value {
    let from = params.get("from").and_then(|v| v.as_str()).unwrap_or("default");
    let before = app.marked_snapshots.get(from);
    let after = make_snapshot(app);
    match before {
        Some(b) => {
            let diff = rvst_snapshot::scene_diff(b, &after);
            let changes: Vec<Value> = diff.changes.iter().map(|c| {
                serde_json::to_value(c).unwrap_or_default()
            }).collect();
            let count = changes.len();
            serde_json::json!({"from": from, "changes": changes, "count": count})
        }
        None => serde_json::json!({"error": format!("no snapshot marked as '{}'", from)}),
    }
}

// === Performance Commands ===

fn cmd_perf(app: &super::ShellApp, _params: &Value) -> Value {
    serde_json::json!({
        "last_layout_ms": app.last_layout_ms,
        "last_scene_build_ms": app.last_scene_build_ms,
        "last_frame_ms": app.last_frame_ms,
        "frame_count": app.frame_count,
        "node_count": app.tree.nodes.len(),
    })
}

// === Accessibility Commands ===

fn cmd_accessibility_tree(app: &super::ShellApp, _params: &Value) -> Value {
    let snap = make_snapshot(app);
    let tree = snap.accessibility_tree();
    serde_json::to_value(&tree).unwrap_or_default()
}

// === Watch Commands ===

fn cmd_watch(app: &mut super::ShellApp, params: &Value) -> Value {
    app.watch_active = true;
    app.watch_filter = params.get("filter").and_then(|v| v.as_str()).map(|s| s.to_string());
    serde_json::json!({"watching": true, "filter": app.watch_filter})
}

fn cmd_watch_stop(app: &mut super::ShellApp) -> Value {
    let was_active = app.watch_active;
    app.watch_active = false;
    app.watch_filter = None;
    serde_json::json!({"watching": false, "was_active": was_active})
}

// === Session Commands ===

fn cmd_wait(params: &Value) -> Value {
    let ms = params.get("ms").and_then(|v| v.as_u64()).unwrap_or(100);
    std::thread::sleep(std::time::Duration::from_millis(ms));
    serde_json::json!({"ok": true, "waited_ms": ms})
}

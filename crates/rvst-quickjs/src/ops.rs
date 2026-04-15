use rquickjs::{Ctx, Function, Object};
use rvst_core::{NodeDescriptor, NodeId, NodeType, Op};
use std::fs::OpenOptions;
use std::io::{Read as _, Write as _};
use std::path::Path;
use std::time::Duration;

use crate::{OP_LOG, OP_STREAM};

/// Maximum response body size: 10 MB.
const FETCH_MAX_BODY_BYTES: usize = 10 * 1024 * 1024;

/// Validate that `path` resolves to a location within the FS sandbox.
/// For existing files, canonicalizes the path itself.
/// For new files, canonicalizes the parent directory and joins the filename.
/// Returns the safe canonical path or an error message.
pub(crate) fn validate_sandbox_path(path: &str) -> Result<std::path::PathBuf, String> {
    let sandbox_root = crate::get_fs_sandbox_root()
        .ok_or_else(|| "filesystem access denied: no sandbox configured".to_string())?;

    let p = Path::new(path);

    // Try to canonicalize the full path (works for existing files)
    let canonical = if p.exists() {
        std::fs::canonicalize(p)
            .map_err(|e| format!("failed to resolve path: {e}"))?
    } else {
        // For new files: canonicalize parent, join filename
        let parent = p.parent()
            .ok_or_else(|| "invalid path: no parent directory".to_string())?;
        let filename = p.file_name()
            .ok_or_else(|| "invalid path: no filename".to_string())?;
        let canonical_parent = std::fs::canonicalize(parent)
            .map_err(|e| format!("failed to resolve parent directory: {e}"))?;
        canonical_parent.join(filename)
    };

    if !canonical.starts_with(&sandbox_root) {
        return Err("path escapes filesystem sandbox".to_string());
    }

    Ok(canonical)
}

/// Returns `true` if the hostname resolves to a private/internal IP range.
fn is_private_host(host: &str) -> bool {
    let h = host.trim_matches(|c| c == '[' || c == ']');
    if h == "localhost" || h == "::1" {
        return true;
    }
    // IPv4 private ranges
    if h.starts_with("127.") || h.starts_with("10.") || h.starts_with("169.254.") || h.starts_with("192.168.") {
        return true;
    }
    // 172.16.0.0/12
    if h.starts_with("172.") {
        if let Some(second) = h.split('.').nth(1).and_then(|s| s.parse::<u8>().ok()) {
            if (16..=31).contains(&second) {
                return true;
            }
        }
    }
    // IPv6 link-local fe80::/10
    if h.starts_with("fe80:") || h.starts_with("fe80%") {
        return true;
    }
    false
}

/// Perform a restricted outbound HTTP fetch. Returns a JSON string for the JS shim.
fn do_fetch(url_str: &str) -> String {
    // --- 1. Parse URL and enforce scheme allowlist ---
    let parsed = match url::Url::parse(url_str) {
        Ok(u) => u,
        Err(e) => return format!(r#"{{"status":0,"body":"invalid URL: {}","ok":false}}"#, e),
    };

    let scheme = parsed.scheme();
    let allow_http_localhost = std::env::var("RVST_ALLOW_HTTP_LOCALHOST").unwrap_or_default() == "1";

    match scheme {
        "https" => {} // always allowed
        "http" => {
            let host = parsed.host_str().unwrap_or("");
            if !(allow_http_localhost && (host == "localhost" || host == "127.0.0.1" || host == "::1" || host == "[::1]")) {
                return r#"{"status":0,"body":"http scheme blocked — only https allowed","ok":false}"#.to_string();
            }
        }
        _ => {
            return format!(r#"{{"status":0,"body":"scheme '{}' not allowed","ok":false}}"#, scheme);
        }
    }

    // --- 2. Block private/internal IPs ---
    let host = parsed.host_str().unwrap_or("");
    if is_private_host(host) && !(allow_http_localhost && (host == "localhost" || host == "127.0.0.1" || host == "::1" || host == "[::1]")) {
        return r#"{"status":0,"body":"requests to private/internal addresses are blocked","ok":false}"#.to_string();
    }

    // --- 3. Build agent with timeout + redirect cap ---
    let agent = ureq::AgentBuilder::new()
        .timeout(Duration::from_secs(30))
        .redirects(5)
        .build();

    // --- 4. Make the request ---
    let response = match agent.get(url_str).call() {
        Ok(r) => r,
        Err(ureq::Error::Status(code, resp)) => {
            let body = resp.into_string().unwrap_or_default();
            let escaped = body.replace('\\', "\\\\").replace('"', "\\\"");
            return format!(r#"{{"status":{code},"body":"{escaped}","ok":false}}"#);
        }
        Err(e) => {
            let msg = e.to_string().replace('\\', "\\\\").replace('"', "\\\"");
            return format!(r#"{{"status":0,"body":"{msg}","ok":false}}"#);
        }
    };

    let status = response.status();
    let ok = (200..300).contains(&status);

    // --- 5. Read body with size cap ---
    let mut buf = Vec::new();
    match response.into_reader().take(FETCH_MAX_BODY_BYTES as u64 + 1).read_to_end(&mut buf) {
        Ok(n) if n > FETCH_MAX_BODY_BYTES => {
            return format!(r#"{{"status":{status},"body":"response body exceeded 10 MB limit","ok":false}}"#);
        }
        Err(e) => {
            let msg = e.to_string().replace('\\', "\\\\").replace('"', "\\\"");
            return format!(r#"{{"status":{status},"body":"read error: {msg}","ok":false}}"#);
        }
        _ => {}
    }

    let body = String::from_utf8_lossy(&buf);
    let escaped = body.replace('\\', "\\\\").replace('"', "\\\"").replace('\n', "\\n").replace('\r', "\\r");
    format!(r#"{{"status":{status},"body":"{escaped}","ok":{ok}}}"#)
}

fn push_op(op: Op) {
    OP_STREAM.lock().unwrap().push(op);
}

fn push_log(entry: String) {
    OP_LOG.lock().unwrap().push(entry);
}

fn tag_to_node_type(tag: &str) -> NodeType {
    match tag {
        "#text" => NodeType::Text,
        "button" => NodeType::Button,
        "input" => NodeType::Input,
        "textarea" => NodeType::Textarea,
        "form" => NodeType::Form,
        "canvas" => NodeType::Canvas,
        _ => NodeType::View,
    }
}

/// Parse a JSON descriptor array from the JS template cache into NodeDescriptors.
/// Format: [{"t":"div","x":"text","a":[["k","v"]],"s":[["k","v"]],"c":[...children]}]
fn parse_descriptor_json(json: &str) -> Result<Vec<NodeDescriptor>, String> {
    let value: serde_json::Value =
        serde_json::from_str(json).map_err(|e| format!("JSON parse: {e}"))?;
    let arr = value.as_array().ok_or("expected array")?;
    arr.iter().map(parse_one_descriptor).collect()
}

fn parse_one_descriptor(val: &serde_json::Value) -> Result<NodeDescriptor, String> {
    let obj = val.as_object().ok_or("expected object")?;
    let tag = obj
        .get("t")
        .and_then(|v| v.as_str())
        .unwrap_or("div");
    let text = obj.get("x").and_then(|v| v.as_str()).map(String::from);
    let attrs = obj
        .get("a")
        .and_then(|v| v.as_array())
        .map(|arr| {
            arr.iter()
                .filter_map(|pair| {
                    let p = pair.as_array()?;
                    Some((p.first()?.as_str()?.to_string(), p.get(1)?.as_str()?.to_string()))
                })
                .collect()
        })
        .unwrap_or_default();
    let styles = obj
        .get("s")
        .and_then(|v| v.as_array())
        .map(|arr| {
            arr.iter()
                .filter_map(|pair| {
                    let p = pair.as_array()?;
                    Some((p.first()?.as_str()?.to_string(), p.get(1)?.as_str()?.to_string()))
                })
                .collect()
        })
        .unwrap_or_default();
    let children = obj
        .get("c")
        .and_then(|v| v.as_array())
        .map(|arr| arr.iter().map(parse_one_descriptor).collect::<Result<Vec<_>, _>>())
        .transpose()?
        .unwrap_or_default();

    Ok(NodeDescriptor {
        node_type: tag_to_node_type(tag),
        text,
        attrs,
        styles,
        children,
    })
}

/// Register the `__host` global object with all host functions on the given QuickJS context.
pub fn register(ctx: &Ctx<'_>) -> rquickjs::Result<()> {
    let globals = ctx.globals();
    let host = Object::new(ctx.clone())?;

    // ── DOM Mutation ──────────────────────────────────────────────────

    host.set(
        "op_create_node",
        Function::new(ctx.clone(), |id: i32, node_type: String| {
            let id = id as u32;
            push_log(format!("create_node:{id}:{node_type}"));
            push_op(Op::CreateNode {
                id: NodeId(id),
                node_type: tag_to_node_type(&node_type),
            });
        })?,
    )?;

    host.set(
        "op_insert",
        Function::new(ctx.clone(), |parent: i32, child: i32, anchor: i32| {
            let parent = parent as u32;
            let child = child as u32;
            let anchor = anchor as u32;
            push_log(format!("insert:{parent}:{child}:{anchor}"));
            push_op(Op::Insert {
                parent: NodeId(parent),
                child: NodeId(child),
                anchor: if anchor == 0 {
                    None
                } else {
                    Some(NodeId(anchor))
                },
            });
        })?,
    )?;

    host.set(
        "op_remove",
        Function::new(ctx.clone(), |id: i32| {
            let id = id as u32;
            push_log(format!("remove:{id}"));
            push_op(Op::Remove { id: NodeId(id) });
        })?,
    )?;

    host.set(
        "op_set_text",
        Function::new(ctx.clone(), |id: i32, value: String| {
            let id = id as u32;
            push_log(format!("set_text:{id}:{value}"));
            push_op(Op::SetText {
                id: NodeId(id),
                value,
            });
        })?,
    )?;

    host.set(
        "op_set_attr",
        Function::new(ctx.clone(), |id: i32, key: String, value: String| {
            let id = id as u32;
            push_log(format!("set_attr:{id}:{key}:{value}"));
            push_op(Op::SetAttr {
                id: NodeId(id),
                key,
                value,
            });
        })?,
    )?;

    host.set(
        "op_set_style",
        Function::new(ctx.clone(), |id: i32, key: String, value: String| {
            let id = id as u32;
            push_log(format!("set_style:{id}:{key}:{value}"));
            push_op(Op::SetStyle {
                id: NodeId(id),
                key,
                value,
            });
        })?,
    )?;

    // ── Template Cloning ─────────────────────────────────────────────

    host.set(
        "op_clone_template",
        Function::new(ctx.clone(), |template_id: f64, start_id: i32, descriptor_json: String| {
            let template_id = template_id as u64;
            let start_id = start_id as u32;
            push_log(format!("clone_template:{template_id}:{start_id}"));
            match parse_descriptor_json(&descriptor_json) {
                Ok(descriptors) => {
                    push_op(Op::CloneTemplate {
                        template_id,
                        start_id: NodeId(start_id),
                        descriptor: descriptors,
                    });
                }
                Err(e) => {
                    eprintln!("[rvst] clone_template descriptor parse error: {e}");
                }
            }
        })?,
    )?;

    // ── Events ───────────────────────────────────────────────────────

    host.set(
        "op_listen",
        Function::new(ctx.clone(), |id: i32, event: String, handler_id: i32| {
            let id = id as u32;
            let handler_id = handler_id as u32;
            push_log(format!("listen:{id}:{event}:{handler_id}"));
            push_op(Op::Listen {
                id: NodeId(id),
                event,
                handler_id,
            });
        })?,
    )?;

    host.set(
        "op_unlisten",
        Function::new(ctx.clone(), |id: i32, event: String, handler_id: i32| {
            let id = id as u32;
            let handler_id = handler_id as u32;
            push_log(format!("unlisten:{id}:{event}:{handler_id}"));
            push_op(Op::Unlisten {
                id: NodeId(id),
                event,
                handler_id,
            });
        })?,
    )?;

    // ── Logging ──────────────────────────────────────────────────────

    host.set(
        "op_log",
        Function::new(ctx.clone(), |msg: String| {
            eprintln!("[JS] {msg}");
            push_log(format!("console:{msg}"));
        })?,
    )?;

    // ── Control ──────────────────────────────────────────────────────

    host.set(
        "op_flush",
        Function::new(ctx.clone(), || {
            push_log("flush".to_string());
            push_op(Op::Flush);
        })?,
    )?;

    // ── CSS ──────────────────────────────────────────────────────────

    host.set(
        "op_load_css",
        Function::new(ctx.clone(), |css: String| {
            let len = css.len();
            push_log(format!("load_css:{len}"));
            crate::push_css_text(css);
        })?,
    )?;

    // ── Window ───────────────────────────────────────────────────────

    host.set(
        "op_set_window_decorations",
        Function::new(ctx.clone(), |d: i32| {
            let decorated = d != 0;
            push_op(Op::SetWindowDecorations { decorated });
        })?,
    )?;

    host.set(
        "op_begin_window_drag",
        Function::new(ctx.clone(), || {
            push_op(Op::BeginWindowDrag);
        })?,
    )?;

    host.set(
        "op_minimize_window",
        Function::new(ctx.clone(), || {
            push_op(Op::MinimizeWindow);
        })?,
    )?;

    host.set(
        "op_maximize_window",
        Function::new(ctx.clone(), |m: i32| {
            let maximize = m != 0;
            push_op(Op::MaximizeWindow { maximize });
        })?,
    )?;

    host.set(
        "op_close_window",
        Function::new(ctx.clone(), || {
            push_op(Op::CloseWindow);
        })?,
    )?;

    host.set(
        "op_set_scroll",
        Function::new(ctx.clone(), |id: i32, scroll_y: f64| {
            push_op(Op::SetScroll {
                id: NodeId(id as u32),
                scroll_y: scroll_y as f32,
            });
        })?,
    )?;

    // ── File System (sandboxed) ─────────────────────────────────────

    host.set(
        "op_read_text_file",
        Function::new(ctx.clone(), |path: String| -> String {
            let safe_path = match validate_sandbox_path(&path) {
                Ok(p) => p,
                Err(e) => {
                    eprintln!("[rvst-fs] read denied: {e}");
                    return String::new();
                }
            };
            std::fs::read_to_string(&safe_path).unwrap_or_default()
        })?,
    )?;

    host.set(
        "op_write_text_file",
        Function::new(ctx.clone(), |path: String, content: String| -> i32 {
            let safe_path = match validate_sandbox_path(&path) {
                Ok(p) => p,
                Err(e) => {
                    eprintln!("[rvst-fs] write denied: {e}");
                    return 0;
                }
            };

            // Use OpenOptions to avoid TOCTOU race with symlinks.
            // On Unix, O_NOFOLLOW prevents following symlinks at the target.
            let file_result = {
                #[cfg(unix)]
                {
                    use std::os::unix::fs::OpenOptionsExt;
                    OpenOptions::new()
                        .write(true)
                        .create(true)
                        .truncate(true)
                        .custom_flags(libc::O_NOFOLLOW)
                        .open(&safe_path)
                }
                #[cfg(not(unix))]
                {
                    OpenOptions::new()
                        .write(true)
                        .create(true)
                        .truncate(true)
                        .open(&safe_path)
                }
            };

            let mut file = match file_result {
                Ok(f) => f,
                Err(e) => {
                    eprintln!("[rvst-fs] write open failed: {e}");
                    return 0;
                }
            };

            // Post-open verification: canonicalize the actual file on disk
            // and confirm it is still within the sandbox. This closes the
            // TOCTOU window between validate_sandbox_path and open.
            match std::fs::canonicalize(&safe_path) {
                Ok(real_path) => {
                    let sandbox_root = crate::get_fs_sandbox_root().unwrap();
                    if !real_path.starts_with(&sandbox_root) {
                        eprintln!("[rvst-fs] TOCTOU race detected: path escaped sandbox");
                        drop(file);
                        std::fs::remove_file(&safe_path).ok();
                        return 0;
                    }
                }
                Err(e) => {
                    eprintln!("[rvst-fs] post-open canonicalize failed: {e}");
                    drop(file);
                    return 0;
                }
            }

            match file.write_all(content.as_bytes()) {
                Ok(_) => 1,
                Err(e) => {
                    eprintln!("[rvst-fs] write failed: {e}");
                    0
                }
            }
        })?,
    )?;

    // ── Timers ───────────────────────────────────────────────────────

    host.set(
        "op_set_timeout",
        Function::new(ctx.clone(), |handler_id: i32, ms: i32| {
            let rid = *crate::CURRENT_RUNTIME_ID.lock().unwrap();
            crate::TIMER_WHEEL.lock().unwrap().add_timeout(handler_id as u32, ms.max(0) as u64, rid);
        })?,
    )?;

    host.set(
        "op_set_interval",
        Function::new(ctx.clone(), |handler_id: i32, ms: i32| {
            let rid = *crate::CURRENT_RUNTIME_ID.lock().unwrap();
            crate::TIMER_WHEEL.lock().unwrap().add_interval(handler_id as u32, ms.max(0) as u64, rid);
        })?,
    )?;

    host.set(
        "op_clear_timer",
        Function::new(ctx.clone(), |handler_id: i32| {
            crate::TIMER_WHEEL.lock().unwrap().clear_timer(handler_id as u32);
        })?,
    )?;

    // ── rAF ─────────────────────────────────────────────────────────

    host.set(
        "request_animation_frame",
        Function::new(ctx.clone(), |id: i32| {
            crate::TIMER_WHEEL.lock().unwrap().add_raf(id as u32);
        })?,
    )?;

    host.set(
        "cancel_animation_frame",
        Function::new(ctx.clone(), |id: i32| {
            crate::TIMER_WHEEL.lock().unwrap().cancel_raf(id as u32);
        })?,
    )?;

    // ── Commands ────────────────────────────────────────────────────

    host.set(
        "invoke_command",
        Function::new(ctx.clone(), |name: String, payload: String| -> String {
            match crate::commands::invoke(&name, &payload) {
                Ok(result) => result,
                Err(e) => format!("{{\"error\":\"{}\"}}", e),
            }
        })?,
    )?;

    // Async command invocation — returns a numeric resolve_id.
    // JS wraps this in a Promise via __rvst_async_resolvers.
    host.set(
        "invoke_command_async",
        Function::new(ctx.clone(), |name: String, payload: String| -> String {
            match crate::commands::invoke_async(&name, &payload) {
                Ok(resolve_id) => format!("{{\"id\":{resolve_id}}}"),
                Err(e) => {
                    let escaped = e.replace('"', "\\\"");
                    format!("{{\"error\":\"{escaped}\"}}")
                }
            }
        })?,
    )?;

    // Drain completed async results — returns JSON array of [id, ok, result_or_error].
    host.set(
        "drain_async_results",
        Function::new(ctx.clone(), || -> String {
            let resolutions = crate::commands::drain_resolutions();
            if resolutions.is_empty() {
                return "[]".to_string();
            }
            let entries: Vec<String> = resolutions
                .into_iter()
                .map(|(id, result)| match result {
                    Ok(json) => format!("[{id},true,{json}]"),
                    Err(e) => {
                        let escaped = e.replace('\\', "\\\\").replace('"', "\\\"");
                        format!("[{id},false,\"{escaped}\"]")
                    }
                })
                .collect();
            format!("[{}]", entries.join(","))
        })?,
    )?;

    // ── HTTP (stub) ─────────────────────────────────────────────────

    host.set(
        "op_fetch",
        Function::new(ctx.clone(), |url: String| -> String {
            push_log(format!("fetch:{url}"));
            do_fetch(&url)
        })?,
    )?;

    // ── Layout Query ─────────────────────────────────────────────────

    host.set(
        "op_get_layout",
        Function::new(ctx.clone(), |id: i32| -> Vec<f64> {
            let id = id as u32;
            match crate::get_layout_rect(id) {
                Some((x, y, w, h)) => vec![x as f64, y as f64, w as f64, h as f64],
                None => vec![0.0, 0.0, 0.0, 0.0],
            }
        })?,
    )?;

    // ── Scroll Dimensions ────────────────────────────────────────────

    host.set(
        "op_get_scroll_dims",
        Function::new(ctx.clone(), |id: i32| -> Vec<f64> {
            let id = id as u32;
            match crate::get_scroll_dims(id) {
                Some((sw, sh)) => vec![sw as f64, sh as f64],
                None => {
                    // Fall back to layout size if no scroll dims cached
                    match crate::get_layout_rect(id) {
                        Some((_x, _y, w, h)) => vec![w as f64, h as f64],
                        None => vec![0.0, 0.0],
                    }
                }
            }
        })?,
    )?;

    // ── Focus ────────────────────────────────────────────────────────

    host.set(
        "op_set_focus",
        Function::new(ctx.clone(), |id: i32| {
            push_op(Op::SetFocus { id: NodeId(id as u32) });
        })?,
    )?;

    // ── Clipboard ────────────────────────────────────────────────────

    host.set(
        "op_clipboard_write",
        Function::new(ctx.clone(), |text: String| {
            push_log(format!("clipboard_write:{}", text.len()));
            // Store in local buffer (so readText can return it immediately)
            *crate::CLIPBOARD_BUFFER.lock().unwrap() = text.clone();
            // Also push an op so the shell can sync to the OS clipboard
            push_op(Op::ClipboardWrite { text });
        })?,
    )?;

    host.set(
        "op_clipboard_read",
        Function::new(ctx.clone(), || -> String {
            push_log("clipboard_read".to_string());
            crate::get_clipboard()
        })?,
    )?;

    // ── Caret ────────────────────────────────────────────────────────

    host.set(
        "op_set_caret",
        Function::new(ctx.clone(), |id: i32, x: f64, y: f64, height: f64| {
            push_op(Op::SetCaret {
                id: NodeId(id as u32),
                x: x as f32,
                y: y as f32,
                height: height as f32,
            });
        })?,
    )?;

    // ── Pointer Capture ───────────────────────────────────────────────

    host.set(
        "op_set_pointer_capture",
        Function::new(ctx.clone(), |arg: String| {
            // arg format: "nodeId:pointerId"
            if let Some(node_id_str) = arg.split(':').next() {
                if let Ok(node_id) = node_id_str.parse::<u32>() {
                    push_log(format!("set_pointer_capture:{node_id}"));
                    crate::set_pointer_capture(node_id);
                }
            }
        })?,
    )?;

    host.set(
        "op_release_pointer_capture",
        Function::new(ctx.clone(), |arg: String| {
            if let Some(node_id_str) = arg.split(':').next() {
                if let Ok(node_id) = node_id_str.parse::<u32>() {
                    push_log(format!("release_pointer_capture:{node_id}"));
                    // Only release if the same node holds capture
                    if crate::get_pointer_capture() == Some(node_id) {
                        crate::release_pointer_capture();
                    }
                }
            }
        })?,
    )?;

    // ── Subscriptions (push events from Rust → JS) ────────────────────

    host.set(
        "drain_push_events",
        Function::new(ctx.clone(), || -> String {
            let events = crate::subscriptions::drain_events();
            serde_json::to_string(&events).unwrap_or_else(|_| "[]".to_string())
        })?,
    )?;

    // ── Signal Graph (observation) ─────────────────────────────────

    host.set(
        "op_track_signal",
        Function::new(ctx.clone(), |initial_json: String| -> f64 {
            let id = crate::signal_graph::graph()
                .lock()
                .unwrap()
                .track_signal_create(&initial_json);
            id as f64
        })?,
    )?;

    host.set(
        "op_track_effect_start",
        Function::new(ctx.clone(), || -> f64 {
            let id = crate::signal_graph::graph()
                .lock()
                .unwrap()
                .begin_effect();
            id as f64
        })?,
    )?;

    host.set(
        "op_track_signal_read",
        Function::new(ctx.clone(), |signal_id: f64| {
            crate::signal_graph::graph()
                .lock()
                .unwrap()
                .track_signal_read(signal_id as u64);
        })?,
    )?;

    host.set(
        "op_track_dom_op",
        Function::new(ctx.clone(), |op_type: String, node_id: i32, signal_id: f64, key: String| {
            let node_id = node_id as u32;
            let signal_id = signal_id as u64;
            let op = match op_type.as_str() {
                "set_text" => crate::signal_graph::TrackedOp::SetText { node_id, signal_id },
                "set_attr" => crate::signal_graph::TrackedOp::SetAttr { node_id, key, signal_id },
                "set_style" => crate::signal_graph::TrackedOp::SetStyle { node_id, key, signal_id },
                _ => return,
            };
            crate::signal_graph::graph()
                .lock()
                .unwrap()
                .track_dom_op(op);
        })?,
    )?;

    host.set(
        "op_track_effect_end",
        Function::new(ctx.clone(), || {
            crate::signal_graph::graph()
                .lock()
                .unwrap()
                .end_effect();
        })?,
    )?;

    host.set(
        "op_signal_graph_check_stability",
        Function::new(ctx.clone(), || -> i32 {
            let stable = crate::signal_graph::graph()
                .lock()
                .unwrap()
                .check_stability();
            if stable { 1 } else { 0 }
        })?,
    )?;

    host.set(
        "op_signal_graph_stats",
        Function::new(ctx.clone(), || -> String {
            let g = crate::signal_graph::graph().lock().unwrap();
            let s = g.stats();
            format!(
                r#"{{"signals":{},"effects":{},"stable":{},"ops":{}}}"#,
                s.total_signals, s.total_effects, s.stable_effects, s.total_tracked_ops
            )
        })?,
    )?;

    host.set(
        "op_signal_graph_reset",
        Function::new(ctx.clone(), || {
            crate::signal_graph::graph()
                .lock()
                .unwrap()
                .reset();
        })?,
    )?;

    // ── HMR outbound (dev-only; release builds simply never call it) ─
    //
    // The WebSocket shim in stubs.js calls this whenever the HMR client
    // (Svelte/Vite) would normally send a message over its socket. Rust
    // drains the Op stream each tick and, when `dev-hmr` is active,
    // forwards the text to the live `vite dev` WebSocket.
    host.set(
        "op_hmr_send",
        Function::new(ctx.clone(), |text: String| {
            push_op(Op::HmrSend { text });
        })?,
    )?;

    // ── Mount on globalThis ─────────────────────────────────────────

    globals.set("__host", host)?;

    Ok(())
}

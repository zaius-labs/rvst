use std::collections::HashMap;
use std::path::PathBuf;
use std::sync::{Mutex, LazyLock};
use rvst_core::Op;

pub mod commands;
pub mod stubs;
pub mod ops;
pub mod timers;
pub mod event_loop;
pub mod subscriptions;
pub mod builtins;
pub mod signal_graph;
pub mod native_svelte;

// Filesystem sandbox root — when set, all FS ops are confined to this directory.
// Defaults to None (all FS ops denied unless explicitly configured).
static FS_SANDBOX_ROOT: LazyLock<Mutex<Option<PathBuf>>> =
    LazyLock::new(|| Mutex::new(None));

/// Configure the filesystem sandbox root directory. All JS file operations
/// will be restricted to paths within this directory. The path is canonicalized
/// at set-time to prevent symlink tricks on the root itself.
pub fn set_fs_sandbox_root(path: impl Into<PathBuf>) {
    let p = path.into();
    let canonical = std::fs::canonicalize(&p).unwrap_or(p);
    *FS_SANDBOX_ROOT.lock().unwrap() = Some(canonical);
}

/// Get the current sandbox root (canonicalized), if set.
pub(crate) fn get_fs_sandbox_root() -> Option<PathBuf> {
    FS_SANDBOX_ROOT.lock().unwrap().clone()
}

pub fn register_command(name: &str, handler: Box<dyn Fn(&str) -> String + Send + Sync>) {
    commands::register(name, handler);
}

/// Register a command handler for async (non-blocking) invocation from JS.
/// The handler runs on a background thread; JS gets a Promise that resolves when done.
pub fn register_async_command(name: &str, handler: Box<dyn Fn(&str) -> String + Send + Sync + 'static>) {
    commands::register_async(name, handler);
}

/// Push a reactive event from any Rust thread to JS subscribers on the given channel.
/// The event will be delivered on the next event loop tick.
pub fn push_event(channel: &str, data_json: &str) {
    subscriptions::push_event(channel, data_json);
}

// Global op stream — collects DOM ops during JS execution
static OP_STREAM: Mutex<Vec<Op>> = Mutex::new(Vec::new());
static CSS_TEXTS: Mutex<Vec<String>> = Mutex::new(Vec::new());
static OP_LOG: Mutex<Vec<String>> = Mutex::new(Vec::new());

// Clipboard buffer — written by op_clipboard_write, read by op_clipboard_read.
// The shell syncs this with the real OS clipboard via arboard when available.
static CLIPBOARD_BUFFER: Mutex<String> = Mutex::new(String::new());

// Pointer capture — which element (node id) currently has pointer capture.
// Set by JS setPointerCapture(), cleared by releasePointerCapture() or mouseup.
// The shell reads this to redirect pointer/mouse events to the captured element.
static POINTER_CAPTURE: Mutex<Option<u32>> = Mutex::new(None);

// Timer wheel — Rust-native timer storage, accessed from host ops
static TIMER_WHEEL: LazyLock<Mutex<timers::TimerWheel>> =
    LazyLock::new(|| Mutex::new(timers::TimerWheel::new()));
static CURRENT_RUNTIME_ID: Mutex<u64> = Mutex::new(0);

// Layout cache — populated by the shell after each Taffy layout pass,
// read by op_get_layout to return real rects to JS getBoundingClientRect().
// Key: node id (u32), Value: (x, y, w, h) in logical pixels.
static LAYOUT_CACHE: LazyLock<Mutex<HashMap<u32, (f32, f32, f32, f32)>>> =
    LazyLock::new(|| Mutex::new(HashMap::new()));

// Scroll dimensions cache — populated alongside LAYOUT_CACHE.
// Key: node id (u32), Value: (scroll_width, scroll_height) in logical pixels.
static SCROLL_DIMS_CACHE: LazyLock<Mutex<HashMap<u32, (f32, f32)>>> =
    LazyLock::new(|| Mutex::new(HashMap::new()));

pub struct RvstRuntime {
    pub runtime_id: u64,
    pending_ops: Vec<Op>,
    #[allow(dead_code)]
    rt: rquickjs::Runtime,
    ctx: rquickjs::Context,
}

/// Escape a string for safe interpolation into a JS double-quoted string literal.
/// Handles backslashes, quotes, control characters, and Unicode line terminators
/// that could break out of the string or inject code.
fn escape_js_string(s: &str) -> String {
    let mut out = String::with_capacity(s.len() + 16);
    for c in s.chars() {
        match c {
            '\\' => out.push_str("\\\\"),
            '"' => out.push_str("\\\""),
            '\'' => out.push_str("\\'"),
            '\n' => out.push_str("\\n"),
            '\r' => out.push_str("\\r"),
            '\0' => out.push_str("\\0"),
            '`' => out.push_str("\\`"),
            '\u{2028}' => out.push_str("\\u2028"),
            '\u{2029}' => out.push_str("\\u2029"),
            c => out.push(c),
        }
    }
    out
}

impl RvstRuntime {
    pub fn new(bundle: String) -> anyhow::Result<Self> {
        let runtime_id = alloc_runtime_id();
        set_current_runtime_id(runtime_id);

        let rt = rquickjs::Runtime::new()?;
        let ctx = rquickjs::Context::full(&rt)?;

        // Register host functions
        ctx.with(|ctx| {
            crate::ops::register(&ctx)
        })?;

        // Register built-in capability commands (fs, crypto, compress)
        builtins::register_all();

        // Register benchmark echo command (no-op echo for IPC latency tests)
        #[cfg(debug_assertions)]
        commands::register("__bench_echo", Box::new(|payload| payload.to_string()));

        // Execute mount
        let pending_ops = event_loop::mount(&ctx, &bundle)?;

        Ok(Self {
            runtime_id,
            rt,
            ctx,
            pending_ops,
        })
    }

    pub fn take_ops(&mut self) -> Vec<Op> {
        std::mem::take(&mut self.pending_ops)
    }

    pub fn drain_microtasks(&mut self) -> Vec<Op> {
        set_current_runtime_id(self.runtime_id);
        self.tick()
    }

    pub fn tick(&mut self) -> Vec<Op> {
        set_current_runtime_id(self.runtime_id);
        event_loop::tick(&self.ctx)
    }

    /// Update viewport dimensions in JS globals.
    pub fn set_viewport(&mut self, width: u32, height: u32) {
        set_current_runtime_id(self.runtime_id);
        self.ctx.with(|ctx| {
            let script = format!(
                "globalThis.innerWidth={width};globalThis.innerHeight={height};\
                 globalThis.__rvst_viewport_w={width};globalThis.__rvst_viewport_h={height};"
            );
            let _ = ctx.eval::<(), _>(script.as_str());
        });
    }

    /// Evaluate a JS expression and return its string representation.
    /// Intended for the test harness only. The script runs in the global
    /// scope; assign to `globalThis.__rvst_test_result` to return complex
    /// values (since rquickjs returns raw types, not JSON).
    pub fn eval_for_test(&mut self, script: &str) -> anyhow::Result<String> {
        set_current_runtime_id(self.runtime_id);
        self.ctx.with(|ctx| {
            clear_op_stream();
            let wrapped = format!(
                "(function() {{ {script}; return (globalThis.__rvst_test_result === undefined) ? '' : String(globalThis.__rvst_test_result); }})()"
            );
            match ctx.eval::<String, _>(wrapped.as_str()) {
                Ok(s) => Ok(s),
                Err(e) => {
                    let exc = ctx.catch();
                    let msg = exc
                        .as_exception()
                        .map(|e| {
                            format!(
                                "{}: {}",
                                e.message().unwrap_or_default(),
                                e.stack().unwrap_or_default()
                            )
                        })
                        .unwrap_or_else(|| format!("{e}"));
                    Err(anyhow::anyhow!("eval error: {msg}"))
                }
            }
        })
    }

    pub fn has_pending_work(&self) -> bool {
        TIMER_WHEEL.lock().unwrap().has_pending()
            || commands::has_pending_resolutions()
            || subscriptions::has_pending_events()
    }

    /// Fire a JS event handler by handler_id (from a Listen op).
    /// `target_node_id` is the rvst NodeId of the clicked element — used to build
    /// the correct composedPath for Svelte 5's event delegation.
    pub fn dispatch_event(
        &mut self,
        handler_id: u32,
        target_node_id: u32,
    ) -> anyhow::Result<Vec<Op>> {
        set_current_runtime_id(self.runtime_id);
        self.ctx.with(|ctx| {
            clear_op_stream();
            let script = format!(
                r#"
(function() {{
  const __h = __rvst_handlers.get({handler_id});
  if (!__h) {{ console.log('[rvst] handler NOT found for id={handler_id}'); return; }}

  // Find the Symbol("events") key used by Svelte to store per-element handlers.
  let svelteEventsSym = null;
  for (const el of __rvst_elements.values()) {{
    const syms = Object.getOwnPropertySymbols(el);
    for (const sym of syms) {{
      if (sym.toString() === 'Symbol(events)') {{
        svelteEventsSym = sym;
        break;
      }}
    }}
    if (svelteEventsSym) break;
  }}

  // Prefer the element matching the hit-tested rvst NodeId (target_node_id).
  // Fall back to searching for any element with a click handler.
  let targetEl = __rvst_elements.get({target_node_id}) ?? null;
  if (!targetEl && svelteEventsSym) {{
    for (const el of __rvst_elements.values()) {{
      if (el[svelteEventsSym]?.click) {{ targetEl = el; break; }}
    }}
  }}

  if (targetEl) {{
    // Build composedPath: walk from targetEl up via parentNode chain
    const path = [];
    let cur = targetEl;
    while (cur) {{ path.push(cur); cur = cur.parentNode; }}
    if (path.length > 0 && path[path.length - 1] !== document.body) path.push(document.body);

    const evt = {{
      type: 'click',
      bubbles: true,
      cancelBubble: false,
      defaultPrevented: false,
      eventPhase: 3,
      target: targetEl,
      currentTarget: document.body,
      composedPath() {{ return path; }},
      preventDefault() {{}},
      stopPropagation() {{ this.cancelBubble = true; }},
      stopImmediatePropagation() {{ this.cancelBubble = true; }},
    }};
    __h.call(document.body, evt);
  }} else {{
    // Fallback: call handler directly with minimal synthetic event
    __h.call(document.body, {{
      type: 'click',
      target: document.body,
      composedPath() {{ return [document.body]; }},
      preventDefault() {{}},
      stopPropagation() {{}},
      stopImmediatePropagation() {{}},
    }});
  }}

}})();
"#
            );
            ctx.eval::<(), _>(script.as_str())
                .map_err(|e| {
                    let exc = ctx.catch();
                    let msg = exc.as_exception()
                        .map(|e| format!("{}: {}", e.message().unwrap_or_default(), e.stack().unwrap_or_default()))
                        .unwrap_or_else(|| format!("{e}"));
                    anyhow::anyhow!("dispatch failed: {msg}")
                })?;
            event_loop::drain_microtasks_inner(&ctx);
            // Second drain to catch effects from newly-mounted child components
            event_loop::drain_microtasks_inner(&ctx);
            Ok(get_ops())
        })
    }

    /// Dispatch a contextmenu event (right-click) with cursor coordinates.
    pub fn dispatch_contextmenu(
        &mut self,
        handler_id: u32,
        target_node_id: u32,
        client_x: f32,
        client_y: f32,
    ) -> anyhow::Result<Vec<Op>> {
        set_current_runtime_id(self.runtime_id);
        self.ctx.with(|ctx| {
            clear_op_stream();
            let script = format!(
                r#"
(function() {{
  const __h = __rvst_handlers.get({handler_id});
  if (!__h) return;
  let svelteEventsSym = null;
  for (const el of __rvst_elements.values()) {{
    const syms = Object.getOwnPropertySymbols(el);
    for (const sym of syms) {{ if (sym.toString() === 'Symbol(events)') {{ svelteEventsSym = sym; break; }} }}
    if (svelteEventsSym) break;
  }}
  let targetEl = __rvst_elements.get({target_node_id}) ?? null;
  if (!targetEl && svelteEventsSym) {{
    for (const el of __rvst_elements.values()) {{
      if (el[svelteEventsSym]?.contextmenu) {{ targetEl = el; break; }}
    }}
  }}
  if (targetEl) {{
    const path = [];
    let cur = targetEl;
    while (cur) {{ path.push(cur); cur = cur.parentNode; }}
    if (path.length > 0 && path[path.length - 1] !== document.body) path.push(document.body);
    const evt = {{
      type: 'contextmenu', bubbles: true, cancelBubble: false,
      defaultPrevented: false, eventPhase: 3,
      target: targetEl, currentTarget: document.body,
      clientX: {client_x}, clientY: {client_y},
      pageX: {client_x}, pageY: {client_y},
      composedPath() {{ return path; }},
      preventDefault() {{ this.defaultPrevented = true; }},
      stopPropagation() {{ this.cancelBubble = true; }},
      stopImmediatePropagation() {{ this.cancelBubble = true; }},
    }};
    __h.call(document.body, evt);
  }}
}})();
"#
            );
            ctx.eval::<(), _>(script.as_str())
                .map_err(|e| {
                    let exc = ctx.catch();
                    let msg = exc.as_exception()
                        .map(|e| format!("{}: {}", e.message().unwrap_or_default(), e.stack().unwrap_or_default()))
                        .unwrap_or_else(|| format!("{e}"));
                    anyhow::anyhow!("contextmenu dispatch failed: {msg}")
                })?;
            event_loop::drain_microtasks_inner(&ctx);
            event_loop::drain_microtasks_inner(&ctx);
            Ok(get_ops())
        })
    }

    /// Simulate a user typing `value` into an input element.
    pub fn dispatch_input_event(
        &mut self,
        handler_id: u32,
        node_id: u32,
        value: String,
    ) -> anyhow::Result<Vec<Op>> {
        self.dispatch_input_event_with_cursor(handler_id, node_id, value, None)
    }

    /// Like dispatch_input_event but with explicit cursor position.
    pub fn dispatch_input_event_with_cursor(
        &mut self,
        handler_id: u32,
        node_id: u32,
        value: String,
        cursor_pos: Option<usize>,
    ) -> anyhow::Result<Vec<Op>> {
        set_current_runtime_id(self.runtime_id);
        self.ctx.with(|ctx| {
            clear_op_stream();
            let value_escaped = escape_js_string(&value);
            let cursor_js = match cursor_pos {
                Some(pos) => format!("el._selectionStart = {pos}; el._selectionEnd = {pos};"),
                None => String::new(),
            };
            let script = format!(
                r#"
(function() {{
  const el = __rvst_elements.get({node_id});
  if (el) {{ el.value = "{value_escaped}"; {cursor_js} }}
  const __h = __rvst_handlers.get({handler_id});
  if (!__h) return;
  __h();
}})();
"#
            );
            ctx.eval::<(), _>(script.as_str())
                .map_err(|e| anyhow::anyhow!("input dispatch: {e}"))?;
            event_loop::drain_microtasks_inner(&ctx);
            event_loop::drain_microtasks_inner(&ctx);
            Ok(get_ops())
        })
    }

    /// Dispatch a scroll event on an element, updating its scrollTop value.
    pub fn dispatch_scroll_event(
        &mut self,
        node_id: u32,
        scroll_top: f32,
        handler_ids: &[u32],
    ) -> anyhow::Result<Vec<Op>> {
        set_current_runtime_id(self.runtime_id);
        self.ctx.with(|ctx| {
            clear_op_stream();
            let handlers_js: String = handler_ids
                .iter()
                .map(|h| format!("{{ const __h = __rvst_handlers.get({h}); if (__h) __h(evt); }}"))
                .collect::<Vec<_>>()
                .join("\n  ");
            let script = format!(
                r#"
(function() {{
  const el = __rvst_elements.get({node_id});
  if (el) {{ el.scrollTop = {scroll_top}; }}
  const evt = {{ type: "scroll", target: el, currentTarget: el, bubbles: false,
                 composedPath() {{ return el ? [el] : []; }},
                 preventDefault() {{}}, stopPropagation() {{}}, stopImmediatePropagation() {{}} }};
  {handlers_js}
}})();
"#
            );
            ctx.eval::<(), _>(script.as_str())
                .map_err(|e| anyhow::anyhow!("scroll dispatch: {e}"))?;
            event_loop::drain_microtasks_inner(&ctx);
            event_loop::drain_microtasks_inner(&ctx);
            Ok(get_ops())
        })
    }

    /// Simulate selecting an option in a `<select>` element.
    pub fn dispatch_select_event(
        &mut self,
        handler_id: u32,
        select_node_id: u32,
        option_node_id: u32,
    ) -> anyhow::Result<Vec<Op>> {
        set_current_runtime_id(self.runtime_id);
        self.ctx.with(|ctx| {
            clear_op_stream();
            let script = format!(
                r#"
(function() {{
  // Deselect all options first, then select the target one
  const sel = __rvst_elements.get({select_node_id});
  if (sel) {{
    for (const opt of (sel.options ?? [])) {{
      opt.removeAttribute('selected');
      opt.selected = false;
    }}
  }}
  const opt = __rvst_elements.get({option_node_id});
  if (opt) {{
    opt.setAttribute('selected', '');
    opt.selected = true;
  }}
  const __h = __rvst_handlers.get({handler_id});
  if (!__h) return;
  // Pass a truthy event so Svelte uses querySelector("[selected]") path
  __h({{}});
}})();
"#
            );
            ctx.eval::<(), _>(script.as_str())
                .map_err(|e| anyhow::anyhow!("select dispatch: {e}"))?;
            event_loop::drain_microtasks_inner(&ctx);
            event_loop::drain_microtasks_inner(&ctx);
            Ok(get_ops())
        })
    }

    /// Simulate a checkbox toggle or any boolean-valued `change` event.
    pub fn dispatch_change_event(
        &mut self,
        handler_id: u32,
        node_id: u32,
        checked: bool,
    ) -> anyhow::Result<Vec<Op>> {
        set_current_runtime_id(self.runtime_id);
        self.ctx.with(|ctx| {
            clear_op_stream();
            let checked_js = if checked { "true" } else { "false" };
            let script = format!(
                r#"
(function() {{
  const el = __rvst_elements.get({node_id});
  if (el) {{ el.checked = {checked_js}; }}
  const __h = __rvst_handlers.get({handler_id});
  if (!__h) return;
  __h();
}})();
"#
            );
            ctx.eval::<(), _>(script.as_str())
                .map_err(|e| anyhow::anyhow!("change dispatch: {e}"))?;
            event_loop::drain_microtasks_inner(&ctx);
            event_loop::drain_microtasks_inner(&ctx);
            Ok(get_ops())
        })
    }

    /// Dispatch a DOM event (click, pointerdown, etc.) to a specific RVST element.
    /// This triggers Svelte 5's event delegation by walking up from the target element
    /// and checking each element's Symbol("events") map for matching handlers.
    /// Falls back to calling any registered __rvst_handlers for the event type.
    pub fn dispatch_dom_event(
        &mut self,
        event_type: &str,
        target_node_id: u32,
        client_x: f32,
        client_y: f32,
    ) -> anyhow::Result<Vec<Op>> {
        set_current_runtime_id(self.runtime_id);
        let event_type_json = serde_json::to_string(event_type).unwrap();
        self.ctx.with(|ctx| {
            clear_op_stream();
            let script = format!(
                r#"
(function() {{
  const targetEl = __rvst_elements.get({target_node_id});
  if (!targetEl) {{ return; }}

  // Build composedPath from target up to body
  const path = [];
  let cur = targetEl;
  while (cur) {{ path.push(cur); cur = cur.parentNode; }}

  const evt = {{
    type: {event_type_json},
    bubbles: true,
    cancelBubble: false,
    defaultPrevented: false,
    eventPhase: 3,
    target: targetEl,
    currentTarget: targetEl,
    clientX: {client_x},
    clientY: {client_y},
    pageX: {client_x},
    pageY: {client_y},
    composedPath() {{ return path; }},
    preventDefault() {{ this.defaultPrevented = true; }},
    stopPropagation() {{ this.cancelBubble = true; }},
    stopImmediatePropagation() {{ this.cancelBubble = true; }},
  }};

  // Svelte 5 event delegation: walk up from target looking for handlers
  // Svelte stores delegated handlers in Symbol("events") on each element.
  let svelteEventsSym = null;
  for (const el of __rvst_elements.values()) {{
    const syms = Object.getOwnPropertySymbols(el);
    for (const sym of syms) {{
      if (sym.toString() === 'Symbol(events)') {{
        svelteEventsSym = sym;
        break;
      }}
    }}
    if (svelteEventsSym) break;
  }}

  let handled = false;
  if (svelteEventsSym) {{
    // Walk the composedPath (target → ancestors) looking for handlers
    for (const el of path) {{
      if (evt.cancelBubble) break;
      const events = el[svelteEventsSym];
      if (events && events[{event_type_json}]) {{
        evt.currentTarget = el;
        events[{event_type_json}].call(el, evt);
        handled = true;
      }}
    }}
  }}

  // If Svelte's delegated walker already dispatched this event, don't
  // also run the addEventListener bubble path: Svelte registers its own
  // root handler (Mt) on body/document via addEventListener which would
  // re-walk Symbol(events) and re-fire the same handler, causing state
  // to toggle twice on every click.
  if (!handled) {{
    for (const el of path) {{
      if (evt.cancelBubble) break;
      const listeners = el.__rvst_listeners && el.__rvst_listeners[{event_type_json}];
      if (listeners) {{
        evt.currentTarget = el;
        for (const entry of listeners) {{
          if (evt.cancelBubble) break;
          try {{ entry.fn.call(el, evt); }} catch (e) {{}}
        }}
      }}
    }}
  }}
}})();
"#
            );
            ctx.eval::<(), _>(script.as_str())
                .map_err(|e| {
                    let exc = ctx.catch();
                    let msg = exc.as_exception()
                        .map(|e| format!("{}: {}", e.message().unwrap_or_default(), e.stack().unwrap_or_default()))
                        .unwrap_or_else(|| format!("{e}"));
                    anyhow::anyhow!("dom event dispatch failed: {msg}")
                })?;
            event_loop::drain_microtasks_inner(&ctx);
            event_loop::drain_microtasks_inner(&ctx);
            Ok(get_ops())
        })
    }

    /// Fire all `document.addEventListener(event_type, ...)` handlers with a synthetic event.
    pub fn dispatch_document_event(
        &mut self,
        event_type: &str,
        extra_fields_json: &str,
    ) -> anyhow::Result<Vec<Op>> {
        set_current_runtime_id(self.runtime_id);
        let event_type_json = serde_json::to_string(event_type).unwrap();
        let extra = extra_fields_json.to_string();
        self.ctx.with(|ctx| {
            clear_op_stream();
            let script = format!(
                r#"
(function() {{
  const extra = {extra};
  // Update document.visibilityState if provided
  if (extra.visibilityState !== undefined) {{
    document.visibilityState = extra.visibilityState;
  }}
  const handlers = _doc_handlers[{event_type_json}] ?? [];
  const evt = Object.assign({{
    type: {event_type_json},
    target: document,
    composedPath() {{ return [document]; }},
    cancelBubble: false,
    preventDefault() {{}},
    stopPropagation() {{}},
    stopImmediatePropagation() {{}},
  }}, extra);
  for (const h of handlers) {{ h(evt); }}
}})();
"#
            );
            ctx.eval::<(), _>(script.as_str())
                .map_err(|e| anyhow::anyhow!("document event dispatch: {e}"))?;
            event_loop::drain_microtasks_inner(&ctx);
            event_loop::drain_microtasks_inner(&ctx);
            Ok(get_ops())
        })
    }

    /// Fire all `window.addEventListener(event_type, ...)` handlers with a synthetic event.
    pub fn dispatch_window_event(
        &mut self,
        event_type: &str,
        extra_fields_json: &str,
    ) -> anyhow::Result<Vec<Op>> {
        set_current_runtime_id(self.runtime_id);
        let event_type_json = serde_json::to_string(event_type).unwrap();
        let extra = extra_fields_json.to_string();
        self.ctx.with(|ctx| {
            clear_op_stream();
            let script = format!(
                r#"
(function() {{
  const handlers = _win_handlers[{event_type_json}] ?? [];
  const extra = {extra};
  // Set target=window and composedPath=[window] so Svelte's delegation walker
  // sees s === t === window and skips the DOM traversal (avoids assignedSlot crash).
  const evt = Object.assign({{
    type: {event_type_json},
    target: globalThis,
    composedPath() {{ return [globalThis]; }},
    cancelBubble: false,
    preventDefault() {{}},
    stopPropagation() {{}},
    stopImmediatePropagation() {{}},
  }}, extra);
  for (const h of handlers) {{ h(evt); }}
}})();
"#
            );
            ctx.eval::<(), _>(script.as_str())
                .map_err(|e| anyhow::anyhow!("window event dispatch: {e}"))?;
            event_loop::drain_microtasks_inner(&ctx);
            event_loop::drain_microtasks_inner(&ctx);
            Ok(get_ops())
        })
    }

    /// Fire a timer callback by handler_id.
    pub fn dispatch_timer(&mut self, handler_id: u32) -> anyhow::Result<Vec<Op>> {
        set_current_runtime_id(self.runtime_id);
        self.ctx.with(|ctx| {
            clear_op_stream();
            let script = format!(
                r#"
(function() {{
  let __h = __rvst_handlers.get({handler_id});
  if (__h) {{
    __h();
  }} else {{
    const __raf = __rvst_raf_pending.get({handler_id});
    if (__raf) {{
      __rvst_raf_pending.delete({handler_id});
      __rvst_raf_time += 16;
      __raf(__rvst_raf_time);
    }}
  }}
}})();
"#
            );
            ctx.eval::<(), _>(script.as_str())
                .map_err(|e| anyhow::anyhow!("timer dispatch: {e}"))?;
            event_loop::drain_microtasks_inner(&ctx);
            event_loop::drain_microtasks_inner(&ctx);
            Ok(get_ops())
        })
    }

    /// Fire all pending requestAnimationFrame callbacks and return resulting ops.
    pub fn fire_raf(&mut self) -> Vec<Op> {
        set_current_runtime_id(self.runtime_id);
        self.ctx.with(|ctx| {
            clear_op_stream();
            event_loop::fire_pending_raf_inner(&ctx).ok();
            event_loop::drain_microtasks_inner(&ctx);
            get_ops()
        })
    }

    /// Read selectionStart and selectionEnd from a JS element.
    pub fn get_element_selection(&mut self, node_id: u32) -> anyhow::Result<(usize, usize)> {
        set_current_runtime_id(self.runtime_id);
        self.ctx.with(|ctx| {
            clear_op_stream();
            let script = format!(
                r#"
(function() {{
  const el = __rvst_elements.get({node_id});
  const s = el ? (el.selectionStart || 0) : 0;
  const e = el ? (el.selectionEnd || 0) : 0;
  __host.op_set_attr({node_id}, "__rvst_sel", s + "," + e);
}})();
"#
            );
            ctx.eval::<(), _>(script.as_str())
                .map_err(|e| anyhow::anyhow!("get_element_selection: {e}"))?;
            let ops = get_ops();
            for op in &ops {
                if let Op::SetAttr { key, value, .. } = op {
                    if key == "__rvst_sel" {
                        let parts: Vec<&str> = value.split(',').collect();
                        if parts.len() == 2 {
                            let start = parts[0].parse::<usize>().unwrap_or(0);
                            let end = parts[1].parse::<usize>().unwrap_or(0);
                            return Ok((start, end));
                        }
                    }
                }
            }
            Ok((0, 0))
        })
    }

    /// Set selectionStart and selectionEnd on a JS element.
    pub fn set_element_selection(
        &mut self,
        node_id: u32,
        start: usize,
        end: usize,
    ) -> anyhow::Result<()> {
        set_current_runtime_id(self.runtime_id);
        self.ctx.with(|ctx| {
            let script = format!(
                r#"
(function() {{
  const el = __rvst_elements.get({node_id});
  if (el) {{ el._selectionStart = {start}; el._selectionEnd = {end}; }}
}})();
"#
            );
            ctx.eval::<(), _>(script.as_str())
                .map_err(|e| anyhow::anyhow!("set_element_selection: {e}"))?;
            Ok(())
        })
    }

    /// Execute arbitrary JS, drain microtasks, and return resulting ops.
    ///
    /// # Safety
    ///
    /// This method should not be called with user-controlled input.
    /// All strings must be escaped or constructed internally. Used by
    /// the event loop and rvst-shell for dispatching synthetic events.
    pub fn eval(&mut self, js: &str) -> anyhow::Result<Vec<Op>> {
        set_current_runtime_id(self.runtime_id);
        self.ctx.with(|ctx| {
            clear_op_stream();
            let script = format!("(function(){{\n{js}\n}})();");
            ctx.eval::<(), _>(script.as_str())
                .map_err(|e| anyhow::anyhow!("eval failed: {e}"))?;
            event_loop::drain_microtasks_inner(&ctx);
            event_loop::drain_microtasks_inner(&ctx);
            Ok(get_ops())
        })
    }

    /// Execute JS that returns a string value.
    /// In QuickJS we can directly return the value from eval.
    ///
    /// # Safety
    ///
    /// This method should not be called with user-controlled input.
    pub fn eval_string(&mut self, js: &str) -> anyhow::Result<String> {
        set_current_runtime_id(self.runtime_id);
        self.ctx.with(|ctx| {
            let script = format!("(function(){{ return String({js}); }})()");
            let result: String = ctx.eval(script.as_str())
                .map_err(|e| anyhow::anyhow!("eval_string failed: {e}"))?;
            Ok(result)
        })
    }
}

// Module-level functions
static NEXT_RUNTIME_ID: Mutex<u64> = Mutex::new(1);

pub fn alloc_runtime_id() -> u64 {
    let mut id = NEXT_RUNTIME_ID.lock().unwrap();
    let val = *id;
    *id += 1;
    val
}

pub fn push_css_text(text: String) {
    CSS_TEXTS.lock().unwrap().push(text);
}

pub fn drain_css_texts() -> Vec<String> {
    std::mem::take(&mut CSS_TEXTS.lock().unwrap())
}

pub fn clear_css_texts() {
    CSS_TEXTS.lock().unwrap().clear();
}

pub fn clear_op_stream() {
    OP_STREAM.lock().unwrap().clear();
}

pub fn get_ops() -> Vec<Op> {
    std::mem::take(&mut OP_STREAM.lock().unwrap())
}

pub fn clear_op_log() {
    OP_LOG.lock().unwrap().clear();
}

// Timer wheel accessors
pub fn check_and_drain_timers() -> Vec<u32> {
    TIMER_WHEEL.lock().unwrap().drain_due()
}

pub fn drain_raf() -> (Vec<u32>, f64) {
    TIMER_WHEEL.lock().unwrap().drain_raf()
}

pub fn next_timer_wake() -> Option<std::time::Instant> {
    TIMER_WHEEL.lock().unwrap().next_wake()
}

pub fn set_current_runtime_id(id: u64) {
    *CURRENT_RUNTIME_ID.lock().unwrap() = id;
}

pub fn clear_timers_for(runtime_id: u64) {
    TIMER_WHEEL.lock().unwrap().clear_for_runtime(runtime_id);
}

pub fn all_timer_handler_ids(runtime_id: u64) -> Vec<u32> {
    TIMER_WHEEL.lock().unwrap().handler_ids_for_runtime(runtime_id)
}

// Layout cache accessors

/// Replace the entire layout cache with fresh rects from the tree.
/// Called by the shell after each Taffy layout pass.
pub fn update_layout_cache(rects: &[(u32, f32, f32, f32, f32)]) {
    let mut cache = LAYOUT_CACHE.lock().unwrap();
    cache.clear();
    for &(id, x, y, w, h) in rects {
        cache.insert(id, (x, y, w, h));
    }
}

/// Look up a single node's layout rect. Returns (x, y, w, h) or None.
pub(crate) fn get_layout_rect(id: u32) -> Option<(f32, f32, f32, f32)> {
    LAYOUT_CACHE.lock().unwrap().get(&id).copied()
}

/// Replace the scroll dimensions cache with fresh values from the tree.
/// Called by the shell after each Taffy layout pass.
pub fn update_scroll_dims_cache(dims: &[(u32, f32, f32)]) {
    let mut cache = SCROLL_DIMS_CACHE.lock().unwrap();
    cache.clear();
    for &(id, sw, sh) in dims {
        cache.insert(id, (sw, sh));
    }
}

/// Look up a single node's scroll dimensions. Returns (scroll_width, scroll_height) or None.
pub(crate) fn get_scroll_dims(id: u32) -> Option<(f32, f32)> {
    SCROLL_DIMS_CACHE.lock().unwrap().get(&id).copied()
}

// Clipboard buffer accessors

/// Set the clipboard buffer contents (called by the shell to sync OS clipboard state).
pub fn set_clipboard(text: String) {
    *CLIPBOARD_BUFFER.lock().unwrap() = text;
}

/// Read the current clipboard buffer contents.
pub(crate) fn get_clipboard() -> String {
    CLIPBOARD_BUFFER.lock().unwrap().clone()
}

// Pointer capture accessors

/// Get the node ID that currently has pointer capture, if any.
pub fn get_pointer_capture() -> Option<u32> {
    *POINTER_CAPTURE.lock().unwrap()
}

/// Set pointer capture to a node ID (called from JS op_set_pointer_capture).
pub(crate) fn set_pointer_capture(node_id: u32) {
    *POINTER_CAPTURE.lock().unwrap() = Some(node_id);
}

/// Release pointer capture (called from JS op_release_pointer_capture or shell on mouseup).
pub fn release_pointer_capture() {
    *POINTER_CAPTURE.lock().unwrap() = None;
}

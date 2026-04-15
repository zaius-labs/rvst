use rvst_quickjs::RvstRuntime;
use rvst_core::Op;
use std::sync::Mutex;

// RvstRuntime uses global state (OP_STREAM, TIMER_WHEEL) so tests must not overlap.
static TEST_LOCK: Mutex<()> = Mutex::new(());

#[test]
fn basic_mount_produces_ops() {
    let _guard = TEST_LOCK.lock().unwrap();
    let mut rt = RvstRuntime::new(
        "function rvst_mount(t) { var d = document.createElement('div'); t.appendChild(d); }"
            .to_string(),
    )
    .unwrap();
    let ops = rt.take_ops();
    // Should have at least CreateNode + Insert + Flush
    assert!(!ops.is_empty(), "mount should produce ops, got none");
    // Verify we got a Flush op (from __host.op_flush())
    assert!(
        ops.iter().any(|op| matches!(op, Op::Flush)),
        "ops should contain Flush, got: {ops:?}"
    );
}

#[test]
fn mount_with_text_node() {
    let _guard = TEST_LOCK.lock().unwrap();
    let mut rt = RvstRuntime::new(
        r#"function rvst_mount(t) {
            var d = document.createElement('div');
            d.textContent = 'hello';
            t.appendChild(d);
        }"#
        .to_string(),
    )
    .unwrap();
    let ops = rt.take_ops();
    assert!(!ops.is_empty());
    // Should have SetText op for "hello"
    assert!(
        ops.iter().any(|op| matches!(op, Op::SetText { value, .. } if value == "hello")),
        "ops should contain SetText with 'hello', got: {ops:?}"
    );
}

#[test]
fn tick_returns_empty_when_no_work() {
    let _guard = TEST_LOCK.lock().unwrap();
    let mut rt = RvstRuntime::new(
        "function rvst_mount(t) { var d = document.createElement('div'); t.appendChild(d); }"
            .to_string(),
    )
    .unwrap();
    let _ = rt.take_ops();
    // tick with no timers or rAF pending should return empty
    let ops = rt.tick();
    assert!(ops.is_empty(), "tick with no pending work should be empty");
}

#[test]
fn has_pending_work_false_after_mount() {
    let _guard = TEST_LOCK.lock().unwrap();
    let rt = RvstRuntime::new(
        "function rvst_mount(t) { var d = document.createElement('div'); t.appendChild(d); }"
            .to_string(),
    )
    .unwrap();
    // No timers or rAF were requested
    assert!(!rt.has_pending_work());
}

#[test]
fn dispatch_click_produces_ops() {
    let _guard = TEST_LOCK.lock().unwrap();
    let mut rt = RvstRuntime::new(
        r#"
        function rvst_mount(t) {
            var btn = document.createElement('button');
            btn.textContent = 'Click';
            btn.addEventListener('click', function() {
                var d = document.createElement('div');
                d.textContent = 'clicked';
                t.appendChild(d);
            });
            t.appendChild(btn);
        }
    "#
        .to_string(),
    )
    .unwrap();

    let mount_ops = rt.take_ops();
    // Find the Listen op to get handler_id and node_id for the button
    let (handler_id, node_id) = mount_ops
        .iter()
        .find_map(|op| {
            if let Op::Listen {
                id,
                event,
                handler_id,
            } = op
            {
                if event == "click" {
                    return Some((*handler_id, id.0));
                }
                None
            } else {
                None
            }
        })
        .expect("should have a Listen op for click");

    let ops = rt.dispatch_event(handler_id, node_id).unwrap();
    // The click handler creates a div with text "clicked" and appends it
    assert!(
        !ops.is_empty(),
        "dispatch_event should produce ops, got none"
    );
    assert!(
        ops.iter()
            .any(|op| matches!(op, Op::SetText { value, .. } if value == "clicked")),
        "ops should contain SetText with 'clicked', got: {ops:?}"
    );
}

#[test]
fn eval_string_returns_value() {
    let _guard = TEST_LOCK.lock().unwrap();
    let mut rt = RvstRuntime::new(
        "function rvst_mount(t) { var d = document.createElement('div'); t.appendChild(d); }"
            .to_string(),
    )
    .unwrap();
    let _ = rt.take_ops();

    let result = rt.eval_string("1 + 2").unwrap();
    assert_eq!(result, "3");
}

#[test]
fn eval_produces_ops() {
    let _guard = TEST_LOCK.lock().unwrap();
    let mut rt = RvstRuntime::new(
        "function rvst_mount(t) { var d = document.createElement('div'); t.appendChild(d); }"
            .to_string(),
    )
    .unwrap();
    let _ = rt.take_ops();

    let ops = rt
        .eval("var d = document.createElement('div'); d.textContent = 'evaled'; document.body.appendChild(d);")
        .unwrap();
    assert!(
        ops.iter()
            .any(|op| matches!(op, Op::SetText { value, .. } if value == "evaled")),
        "eval should produce SetText op, got: {ops:?}"
    );
}

#[test]
fn invoke_command_from_js() {
    let _guard = TEST_LOCK.lock().unwrap();
    // Register a Rust handler
    rvst_quickjs::commands::clear();
    rvst_quickjs::register_command("echo", Box::new(|payload| {
        format!("{{\"echoed\":{}}}", payload)
    }));

    // Create runtime with JS that calls __host.invoke_command
    let mut rt = RvstRuntime::new(r#"
        function rvst_mount(target) {
            var result = __host.invoke_command("echo", '{"msg":"hello"}');
            var el = document.createElement('div');
            el.textContent = result;
            target.appendChild(el);
        }
    "#.to_string()).unwrap();

    let ops = rt.take_ops();
    // Should have CreateNode + SetText with the echoed result + Insert + Flush
    let text_op = ops.iter().find(|o| matches!(o, Op::SetText { .. }));
    assert!(text_op.is_some(), "should have SetText op with echoed result, got: {ops:?}");
}

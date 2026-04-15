//! Integration tests for RvstInspector — exercises all 4 query levels
//! against real JS bundles rendered headlessly.

use rvst_shell::HeadlessSession;

const W: u32 = 400;
const H: u32 = 300;

const RED_DIV: &str = r#"function rvst_mount(target) {
    const d = document.createElement('div');
    d.style.backgroundColor = 'red';
    d.style.width = '200px';
    d.style.height = '100px';
    target.appendChild(d);
}"#;

const HIDDEN_DIV: &str = r#"function rvst_mount(target) {
    const d = document.createElement('div');
    d.style.display = 'none';
    d.style.width = '200px';
    d.style.height = '100px';
    target.appendChild(d);
}"#;

const BTN_BUNDLE: &str = r#"function rvst_mount(target) {
    const btn = document.createElement('button');
    btn.textContent = 'Click me';
    btn.addEventListener('click', () => {});
    target.appendChild(btn);
}"#;

const COUNTER_BUNDLE: &str = r#"function rvst_mount(target) {
    let count = 0;
    const btn = document.createElement('button');
    const label = document.createTextNode('Count: 0');
    btn.appendChild(label);
    btn.addEventListener('click', () => {
        count++;
        label.data = 'Count: ' + count;
        Deno.core.ops.op_set_text(label.__rvst_id, 'Count: ' + count);
    });
    target.appendChild(btn);
}"#;

// --- Level 2: Layout queries ---

#[test]
fn level2_visible_div_reports_visible() {
    // style.backgroundColor is stored as "background-color" (camelCase → kebab-case)
    let s = HeadlessSession::new(RED_DIV, W, H);
    let r = s
        .inspector()
        .find_by_attr("background-color", "red")
        .is_visible();
    assert!(r.ok, "expected red div to be visible: {}", r.reason);
}

#[test]
fn level2_hidden_div_reports_not_visible() {
    let s = HeadlessSession::new(HIDDEN_DIV, W, H);
    let r = s.inspector().find_by_attr("display", "none").is_visible();
    assert!(!r.ok, "expected hidden div to not be visible: {}", r.reason);
}

#[test]
fn level2_rect_returns_layout_dimensions() {
    // style.backgroundColor is stored as "background-color" (camelCase → kebab-case)
    let s = HeadlessSession::new(RED_DIV, W, H);
    let r = s.inspector().find_by_attr("background-color", "red").rect();
    assert!(r.ok, "expected rect to be present: {}", r.reason);
    let rect = r.value.expect("rect should be Some");
    assert!(
        rect.w > 0.0,
        "rect width should be positive, got {}",
        rect.w
    );
    assert!(
        rect.h > 0.0,
        "rect height should be positive, got {}",
        rect.h
    );
}

#[test]
fn level2_at_finds_div_at_its_center() {
    let s = HeadlessSession::new(RED_DIV, W, H);
    // The red div is 200x100 starting at (0,0), so center is around (100, 50)
    let r = s.inspector().at(100.0, 50.0).is_visible();
    assert!(
        r.ok,
        "expected node at (100, 50) to be visible: {}",
        r.reason
    );
}

// --- Level 4: Constraint checks ---

#[test]
fn level4_button_has_click_handler() {
    let s = HeadlessSession::new(BTN_BUNDLE, W, H);
    let r = s.inspector().find("Click me").has_handler("click");
    assert!(
        r.ok,
        "expected 'Click me' button to have a click handler: {}",
        r.reason
    );
}

#[test]
fn level4_div_has_background_color_style() {
    // style.backgroundColor is stored as "background-color" (camelCase → kebab-case)
    let s = HeadlessSession::new(RED_DIV, W, H);
    let r = s
        .inspector()
        .find_by_attr("background-color", "red")
        .has_style("background-color", "red");
    assert!(
        r.ok,
        "expected div to have background-color=red: {}",
        r.reason
    );
}

#[test]
fn level4_text_content_returns_button_label() {
    let s = HeadlessSession::new(BTN_BUNDLE, W, H);
    let r = s.inspector().find("Click me").text_content();
    assert!(r.ok, "expected text content to be present: {}", r.reason);
    assert!(
        r.value.contains("Click me"),
        "expected text to contain 'Click me', got {:?}",
        r.value
    );
}

// --- Level 3: Event dispatch ---

#[test]
fn level3_click_updates_counter_text() {
    let mut s = HeadlessSession::new(COUNTER_BUNDLE, W, H);
    // Before click: "Count: 0" should be visible
    assert!(
        s.inspector().find("Count: 0").is_visible().ok,
        "expected 'Count: 0' to be visible before click"
    );
    // Click the button
    s.click("Count: 0").expect("click should succeed");
    // After click: "Count: 1" should be visible
    assert!(
        s.inspector().find("Count: 1").is_visible().ok,
        "expected 'Count: 1' to be visible after click"
    );
}

// --- Level 1: Pixels ---

#[test]
fn level1_render_pixels_returns_correct_size() {
    let mut s = HeadlessSession::new(RED_DIV, W, H);
    let Some(pixels) = s.render_pixels() else {
        eprintln!("SKIP: no GPU adapter available for headless rendering");
        return;
    };
    let expected_len = (W * H * 4) as usize;
    assert_eq!(
        pixels.len(),
        expected_len,
        "expected {} bytes ({}x{}x4), got {}",
        expected_len,
        W,
        H,
        pixels.len()
    );
}

/// Headless render snapshot tests.
///
/// These tests exercise the full pipeline:
///   JS bundle → DOM ops → Tree → Layout → Composite → Vello → RGBA pixels
///
/// They let the engine be verified visually without a window or human in the loop.
///
/// Background color = (20, 20, 26) = #14141a.
/// Default text color = white = (255, 255, 255).
use rvst_shell::render_bundle_headless;

const W: u32 = 400;
const H: u32 = 300;

/// Count pixels that differ from the background color (20, 20, 26).
fn non_bg_pixel_count(pixels: &[u8]) -> usize {
    pixels
        .chunks(4)
        .filter(|p| {
            // Any pixel brighter than the background in any channel
            p[0] > 30 || p[1] > 30 || p[2] > 40
        })
        .count()
}

/// Sample a pixel at (x, y) from the RGBA buffer.
#[allow(dead_code)]
fn pixel_at(pixels: &[u8], w: u32, x: u32, y: u32) -> (u8, u8, u8) {
    let idx = ((y * w + x) * 4) as usize;
    (pixels[idx], pixels[idx + 1], pixels[idx + 2])
}

/// Minimal bundle: a div with a text node. Exercises CreateNode, SetText, Insert, Flush.
const SIMPLE_TEXT_BUNDLE: &str = r#"
function rvst_mount(target) {
    const div = document.createElement('div');
    const text = document.createTextNode('Hello rvst');
    div.appendChild(text);
    target.appendChild(div);
}
"#;

/// Bundle with an explicit background-color on a div.
const COLORED_DIV_BUNDLE: &str = r#"
function rvst_mount(target) {
    const div = document.createElement('div');
    div.style.backgroundColor = 'red';
    div.style.width = '200px';
    div.style.height = '100px';
    target.appendChild(div);
}
"#;

/// Bundle with rem-unit padding and gap — validates rem parsing in layout.
const REM_UNITS_BUNDLE: &str = r#"
function rvst_mount(target) {
    const div = document.createElement('div');
    div.style.backgroundColor = 'red';
    div.style.width = '12.5rem';   // 12.5 * 16 = 200px
    div.style.height = '6.25rem';  // 6.25 * 16 = 100px
    target.appendChild(div);
}
"#;

/// Bundle with document.getElementById lookup.
const GETELEMENTBYID_BUNDLE: &str = r#"
function rvst_mount(target) {
    const div = document.createElement('div');
    div.style.backgroundColor = 'blue';
    div.style.width = '200px';
    div.style.height = '100px';
    div.id = 'mybox';
    target.appendChild(div);
    // getElementById should find it after insertion
    const found = document.getElementById('mybox');
    if (found) {
        found.style.backgroundColor = 'lime'; // change color to confirm lookup worked
    }
}
"#;

/// Bundle with two sibling divs — exercises column layout.
const TWO_DIVS_BUNDLE: &str = r#"
function rvst_mount(target) {
    const a = document.createElement('div');
    a.textContent = 'First';
    const b = document.createElement('div');
    b.textContent = 'Second';
    target.appendChild(a);
    target.appendChild(b);
}
"#;

/// Bundle that toggles a class via classList — exercises classList→SetAttr pipeline.
const CLASSLIST_BUNDLE: &str = r#"
function rvst_mount(target) {
    const div = document.createElement('div');
    div.classList.add('active');
    const text = document.createTextNode('Active');
    div.appendChild(text);
    target.appendChild(div);
}
"#;

#[test]
fn simple_text_renders_non_background_pixels() {
    let Some(pixels) = render_bundle_headless(SIMPLE_TEXT_BUNDLE, W, H) else {
        eprintln!("SKIP: no GPU adapter available for headless rendering");
        return;
    };
    assert_eq!(
        pixels.len(),
        (W * H * 4) as usize,
        "pixel buffer size mismatch"
    );
    let count = non_bg_pixel_count(&pixels);
    assert!(
        count > 10,
        "expected text pixels rendered, got only {count} non-background pixels"
    );
}

#[test]
fn colored_div_renders_red_pixels() {
    let Some(pixels) = render_bundle_headless(COLORED_DIV_BUNDLE, W, H) else {
        eprintln!("SKIP: no GPU adapter available for headless rendering");
        return;
    };
    assert_eq!(pixels.len(), (W * H * 4) as usize);
    // The red div should produce pixels with high R and low G/B
    let red_pixels = pixels
        .chunks(4)
        .filter(|p| p[0] > 150 && p[1] < 50 && p[2] < 50)
        .count();
    assert!(
        red_pixels > 100,
        "expected red div pixels, found only {red_pixels} red pixels"
    );
}

#[test]
fn two_divs_render_non_background_pixels() {
    let Some(pixels) = render_bundle_headless(TWO_DIVS_BUNDLE, W, H) else {
        eprintln!("SKIP: no GPU adapter available for headless rendering");
        return;
    };
    assert_eq!(pixels.len(), (W * H * 4) as usize);
    let count = non_bg_pixel_count(&pixels);
    assert!(
        count > 10,
        "expected two text nodes to render, got {count} non-background pixels"
    );
}

#[test]
fn classlist_add_does_not_crash_render() {
    // classList.add emits SetAttr("class", ...) — this test confirms no panic occurs
    // and that the tree renders without issues.
    let Some(pixels) = render_bundle_headless(CLASSLIST_BUNDLE, W, H) else {
        eprintln!("SKIP: no GPU adapter available for headless rendering");
        return;
    };
    assert_eq!(pixels.len(), (W * H * 4) as usize);
    let count = non_bg_pixel_count(&pixels);
    assert!(count > 0, "expected at least some pixels rendered");
}

#[test]
fn rem_units_produce_correct_layout() {
    // 12.5rem × 6.25rem = 200×100px. If rem is parsed, red pixels should fill a large region.
    // If rem is NOT parsed, div would be 0×0 and no red pixels appear.
    let Some(pixels) = render_bundle_headless(REM_UNITS_BUNDLE, W, H) else {
        eprintln!("SKIP: no GPU adapter available for headless rendering");
        return;
    };
    assert_eq!(pixels.len(), (W * H * 4) as usize);
    let red_pixels = pixels
        .chunks(4)
        .filter(|p| p[0] > 150 && p[1] < 50 && p[2] < 50)
        .count();
    assert!(
        red_pixels > 1000,
        "expected large red rect from rem-sized div, got only {red_pixels} red pixels — rem units may not be parsed"
    );
}

#[test]
fn getelementbyid_finds_and_modifies_element() {
    // getElementById('mybox') should find the div and change its color to lime (0,255,0).
    let Some(pixels) = render_bundle_headless(GETELEMENTBYID_BUNDLE, W, H) else {
        eprintln!("SKIP: no GPU adapter available for headless rendering");
        return;
    };
    assert_eq!(pixels.len(), (W * H * 4) as usize);
    let lime_pixels = pixels
        .chunks(4)
        .filter(|p| p[0] < 50 && p[1] > 150 && p[2] < 50)
        .count();
    assert!(
        lime_pixels > 100,
        "expected lime-colored pixels from getElementById lookup, got {lime_pixels} — getElementById may be returning null"
    );
}

#[test]
fn empty_bundle_renders_pure_background() {
    // A bundle with no DOM output should produce only background color pixels.
    let bundle = "function rvst_mount(target) {}";
    let Some(pixels) = render_bundle_headless(bundle, W, H) else {
        eprintln!("SKIP: no GPU adapter available for headless rendering");
        return;
    };
    assert_eq!(pixels.len(), (W * H * 4) as usize);
    let count = non_bg_pixel_count(&pixels);
    // Background only — nearly all pixels should match the bg color
    // Allow a small tolerance for antialiasing artifacts
    assert!(
        count < 500,
        "expected near-empty scene, got {count} non-background pixels"
    );
}

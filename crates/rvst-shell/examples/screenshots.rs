//! Generate README screenshots for each ASCII map mode.
//!
//! Usage: cargo run -p rvst-shell --example screenshots -- <bundle.js> [bundle.css] [output_dir]
//!
//! Generates:
//!   - screenshot_render.png     (actual pixel render of the app)
//!   - screenshot_structure.txt  (box-drawing structure map)
//!   - screenshot_tree.txt       (semantic tree)
//!   - screenshot_tree_css.txt   (CSS tree view)
//!   - screenshot_tree_layout.txt (layout tree view)
//!   - screenshot_tree_full.txt  (full tree view)
//!   - screenshot_render_ascii.txt (pixel-based ASCII)

use std::path::PathBuf;

fn main() {
    let args: Vec<String> = std::env::args().collect();
    let bundle_path = args
        .get(1)
        .map(PathBuf::from)
        .expect("Usage: screenshots <bundle.js> [bundle.css] [output_dir]");

    let css_path = args
        .get(2)
        .map(PathBuf::from)
        .unwrap_or_else(|| bundle_path.with_extension("css"));

    let out_dir = args
        .get(3)
        .map(PathBuf::from)
        .unwrap_or_else(|| PathBuf::from("."));

    std::fs::create_dir_all(&out_dir).ok();

    let bundle = std::fs::read_to_string(&bundle_path).expect("Could not read bundle");
    if let Ok(css) = std::fs::read_to_string(&css_path) {
        rvst_quickjs::push_css_text(css);
    }

    let mut session = rvst_shell::HeadlessSession::new(&bundle, 1024, 768);
    let snap = session.snapshot();
    let (cols, rows) = (160, 50);

    // 1. Pixel render → PNG
    if let Some(pixels) = session.render_pixels() {
        let path = out_dir.join("screenshot_render.png");
        save_rgba_png(&pixels, 1024, 768, &path);
        eprintln!("wrote {}", path.display());
    }

    // 2. Structure map
    let structure = rvst_shell::ascii::structure(&snap, cols, rows);
    let structure = rvst_shell::ascii::crop(&structure);
    write_txt(&out_dir.join("screenshot_structure.txt"), &structure);

    // 3. Tree views
    let tree_sem = rvst_shell::ascii::tree(&snap);
    write_txt(&out_dir.join("screenshot_tree.txt"), &tree_sem);

    let tree_css = rvst_shell::ascii::tree_with_view(&snap, rvst_shell::ascii::TreeView::Css);
    write_txt(&out_dir.join("screenshot_tree_css.txt"), &tree_css);

    let tree_layout =
        rvst_shell::ascii::tree_with_view(&snap, rvst_shell::ascii::TreeView::Layout);
    write_txt(&out_dir.join("screenshot_tree_layout.txt"), &tree_layout);

    let tree_full = rvst_shell::ascii::tree_with_view(&snap, rvst_shell::ascii::TreeView::Full);
    write_txt(&out_dir.join("screenshot_tree_full.txt"), &tree_full);

    // 4. Pixel-based ASCII render
    if let Some(pixels) = session.render_pixels() {
        let ascii_render = rvst_shell::ascii::render(&pixels, 1024, 768, cols, rows);
        write_txt(&out_dir.join("screenshot_render_ascii.txt"), &ascii_render);
    }

    // 5. Overlay (if GPU available)
    if let Some(pixels) = session.render_pixels() {
        let overlay = rvst_shell::ascii::overlay(&snap, &pixels, 1024, 768, cols, rows);
        write_txt(&out_dir.join("screenshot_overlay.txt"), &overlay);
    }

    // 6. Validate
    if let Some(pixels) = session.render_pixels() {
        let (validate, issues) =
            rvst_shell::ascii::validate(&snap, &pixels, 1024, 768, cols, rows);
        let mut out = validate;
        if !issues.is_empty() {
            out.push_str("\n\n--- Validation Issues ---\n");
            for issue in &issues {
                out.push_str(&format!("  ! [{}] {}\n", issue.kind, issue.message));
            }
        }
        write_txt(&out_dir.join("screenshot_validate.txt"), &out);
    }

    eprintln!("done — all screenshots in {}", out_dir.display());
}

fn write_txt(path: &PathBuf, content: &str) {
    std::fs::write(path, content).expect("write failed");
    eprintln!("wrote {}", path.display());
}

fn save_rgba_png(pixels: &[u8], w: u32, h: u32, path: &PathBuf) {
    use std::io::Write;

    // Minimal PNG encoder (no dependency needed — use raw image crate if available)
    // For now, write as PPM (simpler) and note that a proper PNG would need the `png` crate
    let ppm_path = path.with_extension("ppm");
    let mut f = std::fs::File::create(&ppm_path).expect("create file");
    write!(f, "P6\n{} {}\n255\n", w, h).unwrap();
    for chunk in pixels.chunks(4) {
        f.write_all(&chunk[..3]).unwrap(); // RGB, skip A
    }
    eprintln!(
        "wrote {} (PPM format — convert to PNG with: convert {} {})",
        ppm_path.display(),
        ppm_path.display(),
        path.display()
    );
}

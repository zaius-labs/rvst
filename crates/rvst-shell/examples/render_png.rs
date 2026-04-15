/// Renders an rvst example headlessly and saves RGBA output as a PNG via ImageMagick.
/// Usage: cargo run --example render_png [path/to/bundle.js] [output.png] [width] [height]
fn main() {
    let args: Vec<String> = std::env::args().collect();
    let bundle_path = args
        .get(1)
        .map(String::as_str)
        .unwrap_or("packages/examples/counter/dist/counter.js");
    let out_path = args
        .get(2)
        .map(String::as_str)
        .unwrap_or("/tmp/rvst_render.png");
    let width: u32 = args.get(3).and_then(|s| s.parse().ok()).unwrap_or(640);
    let height: u32 = args.get(4).and_then(|s| s.parse().ok()).unwrap_or(480);

    let bundle = std::fs::read_to_string(bundle_path)
        .unwrap_or_else(|e| panic!("cannot read {bundle_path}: {e}"));

    eprintln!("Rendering {bundle_path} at {width}×{height}…");
    match rvst_shell::render_bundle_headless(&bundle, width, height) {
        None => eprintln!("No GPU adapter — cannot render headlessly."),
        Some(rgba) => {
            // Pipe raw RGBA bytes to ImageMagick
            use std::io::Write;
            use std::process::{Command, Stdio};
            let mut child = Command::new("magick")
                .args([
                    "-size",
                    &format!("{width}x{height}"),
                    "-depth",
                    "8",
                    "rgba:-", // read raw RGBA from stdin
                    out_path,
                ])
                .stdin(Stdio::piped())
                .spawn()
                .expect("magick not found — install ImageMagick");
            child.stdin.take().unwrap().write_all(&rgba).unwrap();
            let status = child.wait().unwrap();
            if status.success() {
                eprintln!("Saved → {out_path}");
            } else {
                eprintln!("magick exited with {status}");
            }
        }
    }
}

//! E3: Animation export — render carousel frames as animated GIF.

use image::codecs::gif::{GifEncoder, Repeat};
use image::{Delay, Frame, RgbaImage};
use rvst_diagram::pipeline::render_and_score_graph;
use rvst_diagram::schema::Diagram;
use rvst_diagram::split::split_into_frames;
use std::path::PathBuf;

pub fn run_animate(fixture_name: &str, out_path: &str) {
    println!("\n=== E3: ANIMATION EXPORT ===\n");

    let fixture_dir = PathBuf::from(env!("CARGO_MANIFEST_DIR")).join("fixtures");
    let json = std::fs::read_to_string(fixture_dir.join(format!("{fixture_name}.json")))
        .unwrap_or_else(|e| panic!("Fixture not found: {e}"));
    let diagram: Diagram = serde_json::from_str(&json).unwrap();

    // Split into frames
    let frames = split_into_frames(&diagram);
    println!("frames={}", frames.len());

    if frames.len() < 2 {
        println!(
            "NOTE: Only {} frame — rendering single PNG instead of GIF",
            frames.len()
        );
        let result = render_and_score_graph(&diagram);
        if let Some(px) = &result.pixels {
            let img = RgbaImage::from_raw(diagram.canvas.width, diagram.canvas.height, px.clone())
                .unwrap();
            img.save(out_path).unwrap();
            println!("png={out_path}");
        }
        println!("=== E3 RESULT=PASS (single frame) ===");
        return;
    }

    // Render each frame
    let mut rendered_frames: Vec<(RgbaImage, String)> = Vec::new();

    for f in &frames {
        let result = render_and_score_graph(&f.diagram);
        if let Some(px) = &result.pixels {
            let img =
                RgbaImage::from_raw(f.diagram.canvas.width, f.diagram.canvas.height, px.clone())
                    .unwrap();
            println!(
                "  frame {}/{}: \"{}\" rendered ({}x{})",
                f.index + 1,
                f.total,
                f.title,
                f.diagram.canvas.width,
                f.diagram.canvas.height
            );
            rendered_frames.push((img, f.title.clone()));
        } else {
            println!("  frame {}: SKIP (no GPU)", f.index);
        }
    }

    if rendered_frames.is_empty() {
        println!("=== E3 RESULT=SKIP (no frames rendered) ===");
        return;
    }

    // Compose into GIF
    std::fs::create_dir_all(
        PathBuf::from(out_path)
            .parent()
            .unwrap_or(&PathBuf::from(".")),
    )
    .ok();
    let file = std::fs::File::create(out_path).unwrap();
    let mut encoder = GifEncoder::new_with_speed(file, 10); // speed 10 = fast encoding
    encoder.set_repeat(Repeat::Infinite).unwrap();

    for (img, title) in &rendered_frames {
        let frame = Frame::from_parts(
            img.clone(),
            0,
            0,
            Delay::from_saturating_duration(std::time::Duration::from_secs(2)), // 2s per frame
        );
        encoder.encode_frame(frame).unwrap();
        println!("  encoded: {title}");
    }

    drop(encoder); // flush
    println!("gif={out_path}");
    println!("total_frames={}", rendered_frames.len());
    println!("\n=== E3 RESULT=PASS ===");
}

//! A5: Validate headless PNG export + CI feasibility.
//! Binary pass/fail. Tests determinism, software fallback, font loading.

use rvst_core::node::{NodeId, NodeType};
use rvst_core::ops::Op;

fn build_simple_scene() -> (rvst_tree::Tree, rvst_text::TextRenderer) {
    let mut tree = rvst_tree::Tree::new();
    let mut tr = rvst_text::TextRenderer::new();

    let root = NodeId(1);
    tree.apply(Op::CreateNode {
        id: root,
        node_type: NodeType::View,
    });
    tree.apply(Op::SetStyle {
        id: root,
        key: "display".into(),
        value: "flex".into(),
    });
    tree.apply(Op::SetStyle {
        id: root,
        key: "width".into(),
        value: "100%".into(),
    });
    tree.apply(Op::SetStyle {
        id: root,
        key: "height".into(),
        value: "100%".into(),
    });
    tree.apply(Op::SetStyle {
        id: root,
        key: "padding".into(),
        value: "40px".into(),
    });
    tree.apply(Op::SetStyle {
        id: root,
        key: "gap".into(),
        value: "12px".into(),
    });
    tree.apply(Op::SetStyle {
        id: root,
        key: "background-color".into(),
        value: "#fafafa".into(),
    });
    tree.apply(Op::Insert {
        parent: NodeId(0),
        child: root,
        anchor: None,
    });

    let card = NodeId(2);
    tree.apply(Op::CreateNode {
        id: card,
        node_type: NodeType::View,
    });
    tree.apply(Op::SetStyle {
        id: card,
        key: "padding".into(),
        value: "16px".into(),
    });
    tree.apply(Op::SetStyle {
        id: card,
        key: "background-color".into(),
        value: "#f5e642".into(),
    });
    tree.apply(Op::SetStyle {
        id: card,
        key: "flex".into(),
        value: "1".into(),
    });
    tree.apply(Op::Insert {
        parent: root,
        child: card,
        anchor: None,
    });

    let text = NodeId(3);
    tree.apply(Op::CreateNode {
        id: text,
        node_type: NodeType::Text,
    });
    tree.apply(Op::SetText {
        id: text,
        value: "Determinism Test".into(),
    });
    tree.apply(Op::SetStyle {
        id: text,
        key: "font-size".into(),
        value: "16px".into(),
    });
    tree.apply(Op::SetStyle {
        id: text,
        key: "font-weight".into(),
        value: "700".into(),
    });
    tree.apply(Op::Insert {
        parent: card,
        child: text,
        anchor: None,
    });

    let roots = tree.root_children.clone();
    rvst_shell::layout::flow(&mut tree, &roots, &mut tr, 400.0, 300.0, 1.0, None);

    (tree, tr)
}

pub fn run_headless_validation() {
    println!("\n=== A5: HEADLESS PNG EXPORT VALIDATION ===\n");
    let mut all_pass = true;

    // 1. Render produces non-zero bytes
    {
        let (tree, mut tr) = build_simple_scene();
        let roots = tree.root_children.clone();
        let scene = rvst_shell::composite::build_scene(&tree, &roots, &mut tr, 400, 300, 1.0);
        let pixels = rvst_render_wgpu::render_to_rgba(&scene, 400, 300);

        match &pixels {
            Some(px) => {
                let correct_size = px.len() == 400 * 300 * 4;
                let not_blank = px.iter().any(|&b| b != px[0]);
                println!("render_produced_bytes=true");
                println!(
                    "buffer_correct_size={correct_size} expected={} got={}",
                    400 * 300 * 4,
                    px.len()
                );
                println!("not_blank={not_blank}");
                if !correct_size || !not_blank {
                    all_pass = false;
                }
            }
            None => {
                println!("render_produced_bytes=false (no GPU adapter)");
                println!("SKIP: remaining tests require GPU adapter");
                println!("\n=== A5 RESULT=SKIP ===");
                return;
            }
        }
    }

    // 2. Deterministic: same input twice → identical RGBA buffers
    {
        let (tree1, mut tr1) = build_simple_scene();
        let roots1 = tree1.root_children.clone();
        let scene1 = rvst_shell::composite::build_scene(&tree1, &roots1, &mut tr1, 400, 300, 1.0);
        let px1 = rvst_render_wgpu::render_to_rgba(&scene1, 400, 300).unwrap();

        let (tree2, mut tr2) = build_simple_scene();
        let roots2 = tree2.root_children.clone();
        let scene2 = rvst_shell::composite::build_scene(&tree2, &roots2, &mut tr2, 400, 300, 1.0);
        let px2 = rvst_render_wgpu::render_to_rgba(&scene2, 400, 300).unwrap();

        let identical = px1 == px2;
        println!("deterministic_identical_buffers={identical}");

        if !identical {
            // Compute MSE for tolerance check
            let mse: f64 = px1
                .iter()
                .zip(px2.iter())
                .map(|(&a, &b)| (a as f64 - b as f64).powi(2))
                .sum::<f64>()
                / px1.len() as f64;
            let max_diff: u8 = px1
                .iter()
                .zip(px2.iter())
                .map(|(&a, &b)| (a as i16 - b as i16).unsigned_abs() as u8)
                .max()
                .unwrap_or(0);
            println!("mse={mse:.4} max_channel_diff={max_diff}");

            // Accept if within tolerance (MSE < 0.5, max < 3)
            let within_tolerance = mse < 0.5 && max_diff < 3;
            println!("within_tolerance={within_tolerance}");
            if !within_tolerance {
                all_pass = false;
            }
        }
    }

    // 3. PNG encode + decode roundtrip
    {
        let (tree, mut tr) = build_simple_scene();
        let roots = tree.root_children.clone();
        let scene = rvst_shell::composite::build_scene(&tree, &roots, &mut tr, 400, 300, 1.0);
        let pixels = rvst_render_wgpu::render_to_rgba(&scene, 400, 300).unwrap();

        let img = image::RgbaImage::from_raw(400, 300, pixels.clone())
            .expect("RgbaImage creation failed");

        let out_path = "/tmp/diagram-harness/headless_test.png";
        std::fs::create_dir_all("/tmp/diagram-harness").ok();
        img.save(out_path).expect("PNG save failed");

        // Read it back
        let loaded = image::open(out_path).expect("PNG load failed");
        let loaded_rgba = loaded.to_rgba8();
        let roundtrip_ok = loaded_rgba.width() == 400 && loaded_rgba.height() == 300;
        println!("png_roundtrip_ok={roundtrip_ok}");
        if !roundtrip_ok {
            all_pass = false;
        }

        // Check pixel content survived
        let content_pct = pixels
            .chunks(4)
            .filter(|px| px[0] != pixels[0] || px[1] != pixels[1] || px[2] != pixels[2])
            .count() as f32
            / (400 * 300) as f32
            * 100.0;
        println!("png_content_pct={content_pct:.1}");
        let has_content = content_pct > 1.0;
        println!("png_has_content={has_content}");
        if !has_content {
            all_pass = false;
        }
    }

    // 4. Font measurement works in headless (no window system needed)
    {
        let mut tr = rvst_text::TextRenderer::new();
        let (w, h) = tr.measure("Headless font test", 16.0, 9999.0, None, None);
        let font_ok = w > 0.0 && h > 0.0;
        println!("headless_font_measure=({w:.1},{h:.1}) ok={font_ok}");
        if !font_ok {
            all_pass = false;
        }
    }

    // 5. Report GPU backend info
    {
        // wgpu backend selection can be influenced by WGPU_BACKEND env var
        let backend = std::env::var("WGPU_BACKEND").unwrap_or_else(|_| "auto".into());
        println!("wgpu_backend_env={backend}");
        println!("NOTE: Set WGPU_BACKEND=vulkan or WGPU_BACKEND=gl for CI with software renderer");
    }

    println!(
        "\n=== A5 RESULT={} ===",
        if all_pass { "PASS" } else { "FAIL" }
    );
}

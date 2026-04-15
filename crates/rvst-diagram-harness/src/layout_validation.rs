//! A4: Validate Taffy layout patterns.
//! 4 test layouts + multi-aspect. Binary pass/fail per check.

use rvst_core::node::{NodeId, NodeType};
use rvst_core::ops::Op;
use rvst_diagram::schema::{Diagram, NodeKind};
use std::collections::HashMap;

struct LayoutResult {
    rects: HashMap<String, (f32, f32, f32, f32)>, // id -> (x, y, w, h)
    canvas_w: f32,
    canvas_h: f32,
}

fn layout_fixture(fixture_name: &str, canvas_w: u32, canvas_h: u32) -> LayoutResult {
    let fixture_dir = std::path::PathBuf::from(env!("CARGO_MANIFEST_DIR")).join("fixtures");
    let json = std::fs::read_to_string(fixture_dir.join(format!("{fixture_name}.json"))).unwrap();
    let mut diagram: Diagram = serde_json::from_str(&json).unwrap();
    diagram.canvas.width = canvas_w;
    diagram.canvas.height = canvas_h;

    // Build tree (same logic as main harness)
    let mut tree = rvst_tree::Tree::new();
    let mut next_id: u32 = 100;
    let mut id_map: HashMap<String, NodeId> = HashMap::new();

    let root_id = NodeId(1);
    tree.apply(Op::CreateNode {
        id: root_id,
        node_type: NodeType::View,
    });
    tree.apply(Op::SetStyle {
        id: root_id,
        key: "display".into(),
        value: "flex".into(),
    });
    tree.apply(Op::SetStyle {
        id: root_id,
        key: "flex-direction".into(),
        value: "row".into(),
    });
    tree.apply(Op::SetStyle {
        id: root_id,
        key: "flex-wrap".into(),
        value: "wrap".into(),
    });
    tree.apply(Op::SetStyle {
        id: root_id,
        key: "gap".into(),
        value: format!("{}px", diagram.theme.gap),
    });
    tree.apply(Op::SetStyle {
        id: root_id,
        key: "padding".into(),
        value: format!("{}px", diagram.canvas.padding),
    });
    tree.apply(Op::SetStyle {
        id: root_id,
        key: "width".into(),
        value: "100%".into(),
    });
    tree.apply(Op::SetStyle {
        id: root_id,
        key: "height".into(),
        value: "100%".into(),
    });
    tree.apply(Op::Insert {
        parent: NodeId(0),
        child: root_id,
        anchor: None,
    });

    let groups: Vec<_> = diagram
        .nodes
        .iter()
        .filter(|n| n.kind == NodeKind::Group)
        .cloned()
        .collect();
    let cards: Vec<_> = diagram
        .nodes
        .iter()
        .filter(|n| n.kind != NodeKind::Group)
        .cloned()
        .collect();

    for node in &groups {
        next_id += 1;
        let nid = NodeId(next_id);
        id_map.insert(node.id.clone(), nid);
        tree.apply(Op::CreateNode {
            id: nid,
            node_type: NodeType::View,
        });
        tree.apply(Op::SetStyle {
            id: nid,
            key: "display".into(),
            value: "flex".into(),
        });
        tree.apply(Op::SetStyle {
            id: nid,
            key: "flex-direction".into(),
            value: "column".into(),
        });
        tree.apply(Op::SetStyle {
            id: nid,
            key: "gap".into(),
            value: format!("{}px", diagram.theme.gap),
        });
        tree.apply(Op::SetStyle {
            id: nid,
            key: "padding".into(),
            value: "16px".into(),
        });
        tree.apply(Op::SetStyle {
            id: nid,
            key: "border".into(),
            value: "1px solid #c4b99a".into(),
        });
        tree.apply(Op::SetStyle {
            id: nid,
            key: "background-color".into(),
            value: "#f5f0e8".into(),
        });
        tree.apply(Op::SetStyle {
            id: nid,
            key: "flex".into(),
            value: "1".into(),
        });

        // Label
        next_id += 1;
        let label_id = NodeId(next_id);
        tree.apply(Op::CreateNode {
            id: label_id,
            node_type: NodeType::Text,
        });
        tree.apply(Op::SetText {
            id: label_id,
            value: node.label.clone(),
        });
        tree.apply(Op::SetStyle {
            id: label_id,
            key: "font-size".into(),
            value: "14px".into(),
        });
        tree.apply(Op::SetStyle {
            id: label_id,
            key: "color".into(),
            value: "#888".into(),
        });
        tree.apply(Op::Insert {
            parent: nid,
            child: label_id,
            anchor: None,
        });

        // Card container
        next_id += 1;
        let cc = NodeId(next_id);
        tree.apply(Op::CreateNode {
            id: cc,
            node_type: NodeType::View,
        });
        tree.apply(Op::SetStyle {
            id: cc,
            key: "display".into(),
            value: "flex".into(),
        });
        tree.apply(Op::SetStyle {
            id: cc,
            key: "flex-direction".into(),
            value: "row".into(),
        });
        tree.apply(Op::SetStyle {
            id: cc,
            key: "flex-wrap".into(),
            value: "wrap".into(),
        });
        tree.apply(Op::SetStyle {
            id: cc,
            key: "gap".into(),
            value: format!("{}px", diagram.theme.gap),
        });
        tree.apply(Op::SetStyle {
            id: cc,
            key: "flex".into(),
            value: "1".into(),
        });
        tree.apply(Op::Insert {
            parent: nid,
            child: cc,
            anchor: None,
        });
        id_map.insert(format!("{}__cards", node.id), cc);

        let parent_nid = node
            .parent
            .as_ref()
            .and_then(|p| id_map.get(&format!("{}__cards", p)).copied())
            .or_else(|| node.parent.as_ref().and_then(|p| id_map.get(p).copied()))
            .unwrap_or(root_id);
        tree.apply(Op::Insert {
            parent: parent_nid,
            child: nid,
            anchor: None,
        });
    }

    for (i, node) in cards.iter().enumerate() {
        next_id += 1;
        let card_id = NodeId(next_id);
        id_map.insert(node.id.clone(), card_id);
        let fill = node
            .fill
            .as_deref()
            .unwrap_or(&diagram.theme.colors[i % diagram.theme.colors.len()]);
        tree.apply(Op::CreateNode {
            id: card_id,
            node_type: NodeType::View,
        });
        tree.apply(Op::SetStyle {
            id: card_id,
            key: "padding".into(),
            value: "12px 16px".into(),
        });
        tree.apply(Op::SetStyle {
            id: card_id,
            key: "border-radius".into(),
            value: "3px".into(),
        });
        tree.apply(Op::SetStyle {
            id: card_id,
            key: "background-color".into(),
            value: fill.to_string(),
        });
        tree.apply(Op::SetStyle {
            id: card_id,
            key: "min-width".into(),
            value: "80px".into(),
        });
        tree.apply(Op::SetStyle {
            id: card_id,
            key: "flex".into(),
            value: "1".into(),
        });

        next_id += 1;
        let label_id = NodeId(next_id);
        tree.apply(Op::CreateNode {
            id: label_id,
            node_type: NodeType::Text,
        });
        tree.apply(Op::SetText {
            id: label_id,
            value: node.label.clone(),
        });
        tree.apply(Op::SetStyle {
            id: label_id,
            key: "font-size".into(),
            value: "16px".into(),
        });
        tree.apply(Op::SetStyle {
            id: label_id,
            key: "font-weight".into(),
            value: "700".into(),
        });
        tree.apply(Op::Insert {
            parent: card_id,
            child: label_id,
            anchor: None,
        });

        let parent_nid = node
            .parent
            .as_ref()
            .and_then(|p| id_map.get(&format!("{}__cards", p)).copied())
            .or_else(|| node.parent.as_ref().and_then(|p| id_map.get(p).copied()))
            .unwrap_or(root_id);
        tree.apply(Op::Insert {
            parent: parent_nid,
            child: card_id,
            anchor: None,
        });
    }

    let mut tr = rvst_text::TextRenderer::new();
    let roots = tree.root_children.clone();
    rvst_shell::layout::flow(
        &mut tree,
        &roots,
        &mut tr,
        canvas_w as f32,
        canvas_h as f32,
        1.0,
        None,
    );

    let mut rects = HashMap::new();
    for node in &diagram.nodes {
        if let Some(&nid) = id_map.get(&node.id) {
            if let Some(n) = tree.nodes.get(&nid) {
                if let Some(r) = &n.layout {
                    rects.insert(node.id.clone(), (r.x, r.y, r.w, r.h));
                }
            }
        }
    }

    LayoutResult {
        rects,
        canvas_w: canvas_w as f32,
        canvas_h: canvas_h as f32,
    }
}

fn within_canvas(r: &(f32, f32, f32, f32), cw: f32, ch: f32) -> bool {
    r.0 >= -1.0 && r.1 >= -1.0 && (r.0 + r.2) <= cw + 1.0 && (r.1 + r.3) <= ch + 1.0
}

fn no_overlap(a: &(f32, f32, f32, f32), b: &(f32, f32, f32, f32)) -> bool {
    // Returns true if a and b do NOT overlap
    a.0 + a.2 <= b.0 + 1.0
        || b.0 + b.2 <= a.0 + 1.0
        || a.1 + a.3 <= b.1 + 1.0
        || b.1 + b.3 <= a.1 + 1.0
}

fn contains(parent: &(f32, f32, f32, f32), child: &(f32, f32, f32, f32)) -> bool {
    child.0 >= parent.0 - 1.0
        && child.1 >= parent.1 - 1.0
        && (child.0 + child.2) <= (parent.0 + parent.2) + 1.0
        && (child.1 + child.3) <= (parent.1 + parent.3) + 1.0
}

pub fn run_layout_validation() {
    println!("\n=== A4: TAFFY LAYOUT VALIDATION ===\n");
    let mut all_pass = true;

    // A. SIMPLE GRID
    {
        println!("--- A. Simple Grid (4 cards in a row) ---");
        let r = layout_fixture("grid_4", 1200, 630);
        let ids = ["a", "b", "c", "d"];
        let mut pass = true;

        // All within canvas
        for id in &ids {
            let rect = r.rects.get(*id).unwrap();
            let ok = within_canvas(rect, r.canvas_w, r.canvas_h);
            if !ok {
                pass = false;
            }
            println!(
                "  {id}: x={:.0} y={:.0} w={:.0} h={:.0} within={ok}",
                rect.0, rect.1, rect.2, rect.3
            );
        }

        // No overlap between adjacent cards
        for i in 0..ids.len() - 1 {
            let a = r.rects.get(ids[i]).unwrap();
            let b = r.rects.get(ids[i + 1]).unwrap();
            let ok = no_overlap(a, b);
            if !ok {
                pass = false;
            }
            println!("  no_overlap({},{})={ok}", ids[i], ids[i + 1]);
        }

        // Cards have roughly equal width (±20%)
        let widths: Vec<f32> = ids.iter().map(|id| r.rects.get(*id).unwrap().2).collect();
        let avg = widths.iter().sum::<f32>() / widths.len() as f32;
        let even = widths.iter().all(|w| (*w - avg).abs() / avg < 0.2);
        if !even {
            pass = false;
        }
        println!("  evenly_spaced={even} widths={widths:?}");

        if !pass {
            all_pass = false;
        }
        println!("test_simple_grid={}\n", if pass { "PASS" } else { "FAIL" });
    }

    // B. GROUPED TOPOLOGY
    {
        println!("--- B. Grouped Topology (nested groups) ---");
        let r = layout_fixture("nested_groups", 1200, 630);
        let mut pass = true;

        let canopy = r.rects.get("canopy").unwrap();
        let signals = r.rects.get("signals").unwrap();
        let intent = r.rects.get("intent").unwrap();
        let space = r.rects.get("space").unwrap();
        let moe = r.rects.get("moe").unwrap();

        // Parent contains children
        let canopy_contains_signals = contains(canopy, signals);
        let canopy_contains_moe = contains(canopy, moe);
        let signals_contains_intent = contains(signals, intent);
        let signals_contains_space = contains(signals, space);

        if !canopy_contains_signals {
            pass = false;
        }
        if !canopy_contains_moe {
            pass = false;
        }
        if !signals_contains_intent {
            pass = false;
        }
        if !signals_contains_space {
            pass = false;
        }

        println!("  canopy_contains_signals={canopy_contains_signals}");
        println!("  canopy_contains_moe={canopy_contains_moe}");
        println!("  signals_contains_intent={signals_contains_intent}");
        println!("  signals_contains_space={signals_contains_space}");

        // All within canvas
        for (id, rect) in &r.rects {
            let ok = within_canvas(rect, r.canvas_w, r.canvas_h);
            if !ok {
                pass = false;
            }
            println!("  {id}: within={ok}");
        }

        if !pass {
            all_pass = false;
        }
        println!(
            "test_grouped_topology={}\n",
            if pass { "PASS" } else { "FAIL" }
        );
    }

    // C. DENSE CARD MIX
    {
        println!("--- C. Dense Card Mix ---");
        let r = layout_fixture("dense_mix", 1200, 630);
        let mut pass = true;

        // All within canvas, no collapse (all w > 0, h > 0)
        for (id, rect) in &r.rects {
            let ok = within_canvas(rect, r.canvas_w, r.canvas_h);
            let has_size = rect.2 > 10.0 && rect.3 > 10.0;
            if !ok || !has_size {
                pass = false;
            }
            println!(
                "  {id}: w={:.0} h={:.0} within={ok} has_size={has_size}",
                rect.2, rect.3
            );
        }

        if !pass {
            all_pass = false;
        }
        println!("test_dense_mix={}\n", if pass { "PASS" } else { "FAIL" });
    }

    // D. MULTI-ASPECT
    {
        println!("--- D. Multi-Aspect (same scene, 3 canvas sizes) ---");
        let mut pass = true;

        let landscape = layout_fixture("basic_group", 1200, 675);
        let square = layout_fixture("basic_group", 1080, 1080);
        let portrait = layout_fixture("basic_group", 1080, 1350);

        // All within canvas for each
        for (name, r) in [
            ("landscape", &landscape),
            ("square", &square),
            ("portrait", &portrait),
        ] {
            let all_ok = r
                .rects
                .values()
                .all(|rect| within_canvas(rect, r.canvas_w, r.canvas_h));
            if !all_ok {
                pass = false;
            }
            println!(
                "  {name} ({:.0}x{:.0}): all_within={all_ok}",
                r.canvas_w, r.canvas_h
            );
        }

        // Layout should differ between ARs (not identical shrunken copy)
        let l_input = landscape.rects.get("input").unwrap();
        let s_input = square.rects.get("input").unwrap();
        let p_input = portrait.rects.get("input").unwrap();

        // At minimum, heights should differ between landscape and portrait
        let h_differs = (l_input.3 - p_input.3).abs() > 50.0;
        println!(
            "  height_differs_landscape_vs_portrait={h_differs} (l={:.0} p={:.0})",
            l_input.3, p_input.3
        );

        // Width might also differ
        let dims_differ =
            (l_input.2 - s_input.2).abs() > 10.0 || (l_input.3 - s_input.3).abs() > 10.0;
        println!("  dims_differ_landscape_vs_square={dims_differ}");

        if !h_differs {
            pass = false;
        }

        // Stable reruns (layout twice, same result)
        let rerun = layout_fixture("basic_group", 1200, 675);
        let stable = landscape.rects.get("input").unwrap() == rerun.rects.get("input").unwrap();
        println!("  stable_rerun={stable}");
        if !stable {
            pass = false;
        }

        if !pass {
            all_pass = false;
        }
        println!("test_multi_aspect={}\n", if pass { "PASS" } else { "FAIL" });
    }

    println!(
        "=== A4 RESULT={} ===",
        if all_pass { "PASS" } else { "FAIL" }
    );
}

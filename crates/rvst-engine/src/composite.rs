use rvst_core::{NodeId, NodeType};
use rvst_text::{FontWeight, TextRenderer, FONT_SIZE};
use rvst_tree::Tree;
use vello::kurbo::{Affine, Line, Point, Rect, RoundedRect, Stroke, Vec2};
use vello::peniko::Gradient;
use vello::peniko::{Blob, Brush, Color, Fill, FontData, Mix};
use vello::Scene;

fn button_bg() -> Color {
    Color::from_rgba8(0x3a, 0x4a, 0x7a, 0xff)
}

/// Walk the tree and emit GPU draw calls into a Vello Scene.
/// Must be called after layout::flow() so every node has a valid Rect.
///
/// `scale_factor` converts logical pixel coordinates (used by layout and CSS) to physical
/// pixels (used by the wgpu render target). Pass 1.0 for headless/test rendering.
// Thread-local collection of position:fixed nodes to draw on top of everything.
// Populated during the main tree walk, drawn after the normal pass.
thread_local! {
    static FIXED_NODES: std::cell::RefCell<Vec<rvst_core::NodeId>> = std::cell::RefCell::new(Vec::new());
}

pub fn build_scene(
    tree: &Tree,
    roots: &[NodeId],
    tr: &mut TextRenderer,
    canvas_w: u32,
    canvas_h: u32,
    scale_factor: f32,
) -> Scene {
    let mut logical_scene = Scene::new();
    // Viewport in logical pixels with a 100px buffer to prevent pop-in during fast scrolling
    let buffer = 100.0_f64;
    let viewport = Rect::new(
        -buffer,
        -buffer,
        (canvas_w as f64 / scale_factor as f64) + buffer,
        (canvas_h as f64 / scale_factor as f64) + buffer,
    );
    // Clear fixed nodes from previous frame
    FIXED_NODES.with(|f| f.borrow_mut().clear());

    // Pass 1: draw all nodes except position:fixed (those get collected)
    for &id in roots {
        draw_node(tree, id, tr, &mut logical_scene, viewport);
    }

    // Pass 2: draw position:fixed nodes ON TOP of everything
    // These always render relative to viewport, ignoring scroll and stacking context
    let fixed_ids: Vec<NodeId> = FIXED_NODES.with(|f| f.borrow().clone());
    for id in fixed_ids {
        draw_node_inner(tree, id, tr, &mut logical_scene, viewport, 0.0, (0.0, 0.0));
    }
    // Draw hover highlight on the hovered button (subtle white overlay)
    if let Some(hovered_id) = tree.hovered {
        if let Some(node) = tree.nodes.get(&hovered_id) {
            if let Some(rect) = node.layout {
                // Hover overlay: darken light buttons, lighten dark buttons
                let bg = node
                    .styles
                    .get("background-color")
                    .map(|s| s.as_str())
                    .unwrap_or("");
                let is_light_bg =
                    bg == "#fff" || bg == "white" || bg.contains("96.7%") || bg.contains("100%");
                let hover_color = if is_light_bg {
                    Color::from_rgba8(0x00, 0x00, 0x00, 0x1A) // 10% black overlay on light buttons
                } else {
                    Color::from_rgba8(0xFF, 0xFF, 0xFF, 0x20) // 12% white overlay on dark buttons
                };
                let x0 = rect.x as f64;
                let y0 = rect.y as f64;
                let x1 = (rect.x + rect.w) as f64;
                let y1 = (rect.y + rect.h) as f64;
                let radius = parse_border_radius_with_size(&node.styles, rect.w, rect.h);
                if radius > 0.0 {
                    let rrect = RoundedRect::new(x0, y0, x1, y1, radius);
                    logical_scene.fill(Fill::NonZero, Affine::IDENTITY, hover_color, None, &rrect);
                } else {
                    let vello_rect = Rect::new(x0, y0, x1, y1);
                    logical_scene.fill(
                        Fill::NonZero,
                        Affine::IDENTITY,
                        hover_color,
                        None,
                        &vello_rect,
                    );
                }
            }
        }
    }

    // Draw focus ring on the focused element (2px blue outline)
    if let Some(focused_id) = tree.focused {
        if let Some(node) = tree.nodes.get(&focused_id) {
            if let Some(rect) = node.layout {
                let focus_color = Color::from_rgba8(0x3B, 0x82, 0xF6, 0xCC); // blue-500 with alpha
                let x0 = (rect.x as f64) - 1.0;
                let y0 = (rect.y as f64) - 1.0;
                let x1 = (rect.x + rect.w) as f64 + 1.0;
                let y1 = (rect.y + rect.h) as f64 + 1.0;
                let radius = parse_border_radius_with_size(&node.styles, rect.w, rect.h) + 1.0;
                let rrect = RoundedRect::new(x0, y0, x1, y1, radius.max(2.0));
                let stroke = vello::kurbo::Stroke::new(2.0);
                logical_scene.stroke(&stroke, Affine::IDENTITY, focus_color, None, &rrect);
            }
        }
    }
    let mut scene = Scene::new();
    // Scale the logical-pixel scene up to physical pixels for HiDPI displays.
    let transform = if (scale_factor - 1.0).abs() > f32::EPSILON {
        Some(Affine::scale(scale_factor as f64))
    } else {
        None
    };
    scene.append(&logical_scene, transform);
    scene
}

fn draw_node(tree: &Tree, id: NodeId, tr: &mut TextRenderer, scene: &mut Scene, viewport: Rect) {
    draw_node_inner(tree, id, tr, scene, viewport, 0.0, (0.0, 0.0));
}

/// Returns true when a node creates a CSS stacking context.
///
/// Per spec, a stacking context is created when any of:
///   - `position` is not `static` AND `z-index` is not `auto`
///   - `opacity` < 1
///   - A CSS transform is present
///   - `position` is `fixed` or `sticky`
fn creates_stacking_context(node: &rvst_tree::Node) -> bool {
    let pos = node.styles.get("position").map(|s| s.as_str()).unwrap_or("static");
    let z_val = node.styles.get("z-index").map(|s| s.as_str()).unwrap_or("auto");
    // position:fixed and position:sticky always create a stacking context
    if pos == "fixed" || pos == "sticky" {
        return true;
    }
    // positioned element with explicit z-index
    if pos != "static" && z_val != "auto" {
        return true;
    }
    // opacity < 1
    if let Some(op) = node.styles.get("opacity") {
        if let Ok(v) = op.trim().parse::<f32>() {
            if v < 1.0 {
                return true;
            }
        }
    }
    // CSS transform
    if let Some(t) = node.styles.get("transform") {
        let t = t.trim();
        if !t.is_empty() && t != "none" {
            return true;
        }
    }
    false
}

/// Effective z-index of a child for sorting within a parent stacking context.
/// Children with z-index:auto are treated as 0 for ordering but retain
/// document-order stability via the secondary sort key.
fn child_effective_z(tree: &Tree, child_id: NodeId) -> i32 {
    tree.nodes
        .get(&child_id)
        .and_then(|n| n.styles.get("z-index"))
        .and_then(|v| {
            let v = v.trim();
            if v == "auto" { None } else { v.parse::<i32>().ok() }
        })
        .unwrap_or(0)
}

/// Inner draw function with cumulative scroll offset and fixed-position offset.
/// `scroll_y_acc` accumulates parent scroll offsets.
/// `fixed_offset` is (dx, dy) applied to all children of a position:fixed node
/// to compensate for the parent's CSS left/top override vs Taffy position.
fn draw_node_inner(tree: &Tree, id: NodeId, tr: &mut TextRenderer, scene: &mut Scene, viewport: Rect, scroll_y_acc: f32, fixed_offset: (f32, f32)) {
    let node = match tree.nodes.get(&id) {
        Some(n) => n,
        None => return,
    };
    let raw_rect = match node.layout {
        Some(r) => r,
        None => return,
    };

    // position:fixed nodes are collected and drawn LAST (on top of everything).
    // Skip them during the normal pass — they'll be drawn in pass 2 of build_scene.
    // Only collect during pass 1 (scroll_y_acc != 0 means we might be inside a scroll
    // container or in pass 2 itself — don't re-collect).
    let is_fixed = node.styles.get("position").map(|s| s == "fixed").unwrap_or(false);
    if is_fixed && scroll_y_acc == 0.0 {
        // Check if this is pass 1 (not pass 2 re-draw) by checking if we're being
        // called from the main tree walk vs the fixed-node re-draw
        let already_collecting = FIXED_NODES.with(|f| f.borrow().contains(&id));
        if !already_collecting {
            FIXED_NODES.with(|f| f.borrow_mut().push(id));
            // Draw children of fixed nodes will happen in pass 2
            return;
        }
    }

    // Compute screen-space rect.
    use rvst_core::Rect as RvstRect;
    let parse_px = |key: &str| -> Option<f32> {
        node.styles.get(key).and_then(|v| v.trim().trim_end_matches("px").parse::<f32>().ok())
    };
    // For position:fixed nodes: use CSS left/top as viewport-absolute coordinates
    // and compute the offset delta so children inherit the repositioning.
    let (rect, child_fixed_offset) = if is_fixed {
        let css_x = parse_px("left").unwrap_or(raw_rect.x);
        let css_y = parse_px("top").unwrap_or(raw_rect.y);
        let dx = css_x - raw_rect.x;
        let dy = css_y - raw_rect.y;
        (RvstRect { x: css_x, y: css_y, w: raw_rect.w, h: raw_rect.h }, (dx, dy))
    } else {
        // Apply scroll offset + any inherited fixed offset from a fixed ancestor
        let r = RvstRect {
            x: raw_rect.x + fixed_offset.0,
            y: raw_rect.y - scroll_y_acc + fixed_offset.1,
            w: raw_rect.w,
            h: raw_rect.h,
        };
        (r, fixed_offset)
    };

    // Viewport culling: skip nodes whose screen-space rect is entirely outside the viewport.
    {
        let node_right = rect.x as f64 + rect.w as f64;
        let node_bottom = rect.y as f64 + rect.h as f64;
        let intersects = (rect.x as f64) < viewport.x1
            && node_right > viewport.x0
            && (rect.y as f64) < viewport.y1
            && node_bottom > viewport.y0;
        if !intersects {
            return;
        }
    }

    // Skip invisible nodes
    if node.styles.get("visibility").map(|s| s.as_str()) == Some("hidden") {
        return;
    }
    if node.styles.get("display").map(|s| s.as_str()) == Some("none") {
        return;
    }
    let opacity = node
        .styles
        .get("opacity")
        .and_then(|v| v.trim().parse::<f32>().ok())
        .unwrap_or(1.0);
    if opacity <= 0.0 {
        return;
    }

    // CSS transform: translate(X,Y) / translateX / translateY — visual offset only, not layout.
    // SVG <g> transforms operate in viewBox coordinates and are applied to path data instead,
    // so skip the visual offset for nodes inside an SVG subtree (have viewBox on self or ancestor).
    let in_svg = node.styles.contains_key("viewBox") || {
        let mut cur = node.parent;
        let mut found = false;
        while let Some(pid) = cur {
            if let Some(anc) = tree.nodes.get(&pid) {
                if anc.styles.contains_key("viewBox") {
                    found = true;
                    break;
                }
                cur = anc.parent;
            } else {
                break;
            }
        }
        found
    };
    let (tx, ty) = if in_svg {
        (0.0, 0.0)
    } else {
        parse_css_transform_translate(&node.styles, rect.w, rect.h)
    };
    // Apply translation to the draw rect (does not affect Taffy layout rect)
    let rect = RvstRect {
        x: rect.x + tx as f32,
        y: rect.y + ty as f32,
        w: rect.w,
        h: rect.h,
    };
    // Propagate transform offset to children so they render in the parent's
    // transformed coordinate space (CSS transforms affect the entire subtree).
    let child_fixed_offset = (
        child_fixed_offset.0 + tx as f32,
        child_fixed_offset.1 + ty as f32,
    );

    // Push opacity layer if needed (vello composes alpha over children)
    let use_opacity_layer = opacity < 1.0;
    let node_rect = Rect::new(
        rect.x as f64,
        rect.y as f64,
        (rect.x + rect.w) as f64,
        (rect.y + rect.h) as f64,
    );
    if use_opacity_layer {
        scene.push_layer(
            Fill::NonZero,
            Mix::Normal,
            opacity,
            Affine::IDENTITY,
            &node_rect,
        );
    }

    // CSS stacking context–aware child ordering.
    //
    // Per CSS spec, a node creates a stacking context when it has:
    //   - position != static AND z-index != auto, OR
    //   - opacity < 1, OR
    //   - a CSS transform
    //
    // Only nodes that create a stacking context should sort their children by
    // z-index.  Within a stacking context the paint order is:
    //   1. Children with negative z-index (sorted ascending)
    //   2. Non-positioned / z-index:auto children (document order)
    //   3. Children with z-index >= 0 (sorted ascending)
    //
    // A child that itself creates a stacking context is always treated as an
    // atomic unit — its subtree's z-index values never leak to the parent sort.
    //
    // If the current node does NOT create a stacking context, children are drawn
    // in document order (no z-index sort) — their z-index values only compete
    // inside *their own* stacking contexts.
    let children = &node.children;
    let this_is_stacking_ctx = creates_stacking_context(node);
    let sorted_storage;
    let children = if this_is_stacking_ctx {
        // Fast path: skip sort if no child has a non-zero/non-auto z-index
        let needs_sort = children.iter().any(|&cid| {
            tree.nodes
                .get(&cid)
                .and_then(|n| n.styles.get("z-index"))
                .map(|z| z != "0" && z != "auto")
                .unwrap_or(false)
        });
        if needs_sort {
            sorted_storage = {
                let mut v: Vec<(usize, NodeId)> = children.iter().copied().enumerate().collect();
                v.sort_by(|&(a_idx, a_id), &(b_idx, b_id)| {
                    let a_z = child_effective_z(tree, a_id);
                    let b_z = child_effective_z(tree, b_id);
                    // Primary: z-index ascending.  Secondary: document order (stable).
                    a_z.cmp(&b_z).then(a_idx.cmp(&b_idx))
                });
                v.into_iter().map(|(_, id)| id).collect::<Vec<_>>()
            };
            &sorted_storage
        } else {
            children
        }
    } else {
        // Not a stacking context — draw children in document order.
        // Inner z-index values are scoped to their own stacking contexts.
        children
    };

    match &node.node_type {
        NodeType::Button => {
            let x0 = rect.x as f64;
            let y0 = rect.y as f64;
            let x1 = (rect.x + rect.w) as f64;
            let y1 = (rect.y + rect.h) as f64;
            // Use styled background-color/background if set.
            // Only fall back to default button_bg when no CSS class is applied (unstyled button).
            // Tailwind/CSS resets set button bg to transparent — respect that.
            let has_css_styles =
                node.styles.contains_key("class") || node.styles.contains_key("background-color");
            // Try gradient from background-image or background shorthand
            let bg_gradient = node.styles.get("background-image")
                .or_else(|| node.styles.get("background"))
                .and_then(|s| {
                    let s = s.trim();
                    if s.starts_with("linear-gradient(") {
                        parse_linear_gradient(s, rect.w, rect.h)
                    } else {
                        None
                    }
                });
            let bg_color = node
                .styles
                .get("background-color")
                .and_then(|s| {
                    let s = s.trim();
                    // Skip transparent (#0000 or rgba with 0 alpha)
                    if s == "#0000" || s == "transparent" || s == "rgba(0,0,0,0)" {
                        return None;
                    }
                    parse_css_color(s)
                })
                .or_else(|| {
                    node.styles.get("background").and_then(|s| {
                        let s = s.trim();
                        if s.contains("gradient") || s.contains("url(") {
                            None
                        } else {
                            parse_css_color(s)
                        }
                    })
                })
                .or_else(|| {
                    if has_css_styles {
                        None
                    } else {
                        Some(button_bg())
                    }
                });
            let radius = parse_border_radius_with_size(&node.styles, rect.w, rect.h);
            // Box shadow (drawn behind background)
            draw_box_shadow(scene, &node.styles, rect.x, rect.y, rect.w, rect.h, radius);
            if let Some(ref gradient) = bg_gradient {
                if radius > 0.0 {
                    let rrect = RoundedRect::new(x0, y0, x1, y1, radius);
                    scene.fill(Fill::NonZero, Affine::IDENTITY, gradient, None, &rrect);
                } else {
                    let vello_rect = Rect::new(x0, y0, x1, y1);
                    scene.fill(Fill::NonZero, Affine::IDENTITY, gradient, None, &vello_rect);
                }
            } else if let Some(bg_color) = bg_color {
                if radius > 0.0 {
                    let rrect = RoundedRect::new(x0, y0, x1, y1, radius);
                    scene.fill(Fill::NonZero, Affine::IDENTITY, bg_color, None, &rrect);
                } else {
                    let vello_rect = Rect::new(x0, y0, x1, y1);
                    scene.fill(Fill::NonZero, Affine::IDENTITY, bg_color, None, &vello_rect);
                }
            }
            draw_border(scene, &node.styles, rect.x, rect.y, rect.w, rect.h);
            let clip_children = node
                .styles
                .get("overflow")
                .map(|s| s == "hidden")
                .unwrap_or(false);
            if clip_children {
                scene.push_clip_layer(Fill::NonZero, Affine::IDENTITY, &node_rect);
            }
            for &child in children {
                draw_node_inner(tree, child, tr, scene, viewport, scroll_y_acc, child_fixed_offset);
            }
            if clip_children {
                scene.pop_layer();
            }
        }
        NodeType::Text => {
            let raw_text = node.text.as_deref().unwrap_or("");
            if raw_text.is_empty() || rect.w < 1.0 || rect.h < 1.0 {
                return;
            }
            // color: inherit from nearest ancestor with a concrete color value.
            // Walk up the tree until we find a node with a usable color style.
            let own_color_str = node.styles.get("color").map(|s| s.as_str()).unwrap_or("");
            let own_is_unresolvable = own_color_str.starts_with("color-mix(")
                || own_color_str.starts_with("currentcolor")
                || own_color_str.is_empty();
            let color = if own_is_unresolvable {
                let mut ancestor_color = None;
                let mut cur = node.parent;
                while let Some(pid) = cur {
                    if let Some(anc) = tree.nodes.get(&pid) {
                        let c = anc.styles.get("color").map(|s| s.as_str()).unwrap_or("");
                        if !c.is_empty() && !c.starts_with("color-mix(") && !c.starts_with("currentcolor") {
                            ancestor_color = Some(parse_color(&anc.styles));
                            break;
                        }
                        cur = anc.parent;
                    } else {
                        break;
                    }
                }
                ancestor_color.unwrap_or(Color::from_rgba8(0x00, 0x00, 0x00, 0xff))
            } else {
                parse_color(&node.styles)
            };

            // All inherited properties: resolve parent first, then fall back.
            let parent_node = node.parent.and_then(|pid| tree.nodes.get(&pid));

            // font-size: inherit from parent when not set directly on text node
            let font_size = node
                .styles
                .get("font-size")
                .and_then(|v| parse_font_size_value(v))
                .or_else(|| {
                    parent_node
                        .and_then(|p| p.styles.get("font-size"))
                        .and_then(|v| parse_font_size_value(v))
                })
                .unwrap_or(FONT_SIZE);

            // text-transform: inherited from parent; apply before shaping
            let text_transform = parent_node
                .and_then(|p| p.styles.get("text-transform"))
                .map(|s| s.as_str())
                .unwrap_or("none");
            let transformed: String;
            let text = match text_transform {
                "uppercase" => {
                    transformed = raw_text.to_uppercase();
                    &transformed
                }
                "lowercase" => {
                    transformed = raw_text.to_lowercase();
                    &transformed
                }
                "capitalize" => {
                    transformed = raw_text
                        .split_whitespace()
                        .map(|w| {
                            let mut c = w.chars();
                            match c.next() {
                                None => String::new(),
                                Some(f) => f.to_uppercase().to_string() + c.as_str(),
                            }
                        })
                        .collect::<Vec<_>>()
                        .join(" ");
                    &transformed
                }
                _ => raw_text,
            };

            // text-align: inherited from parent element.
            // Buttons default to center (matching browser behavior) unless overridden.
            let parent_is_button = parent_node
                .map(|p| matches!(p.node_type, NodeType::Button))
                .unwrap_or(false);
            let text_align = parent_node
                .and_then(|p| p.styles.get("text-align"))
                .map(|s| s.as_str())
                .unwrap_or(if parent_is_button { "center" } else { "left" });

            // line-height and font-weight: inherited from parent element
            let parent_line_height =
                parent_node.map(|p| crate::layout::parse_line_height_pub(&p.styles, font_size));
            // font-weight: check text node's own styles first, then parent
            let font_weight = if node.styles.contains_key("font-weight") {
                crate::layout::parse_font_weight_pub(&node.styles)
            } else {
                parent_node
                    .map(|p| crate::layout::parse_font_weight_pub(&p.styles))
                    .unwrap_or(FontWeight::NORMAL)
            };

            // letter-spacing: inherited from parent; in px or em units
            // em values are relative to font_size; px values are absolute.
            let letter_spacing_px = parent_node
                .and_then(|p| p.styles.get("letter-spacing"))
                .and_then(|v| {
                    let v = v.trim();
                    if let Some(em) = v.strip_suffix("em") {
                        em.trim().parse::<f32>().ok().map(|e| e * font_size)
                    } else if let Some(px) = v.strip_suffix("px") {
                        px.trim().parse::<f32>().ok()
                    } else {
                        v.parse::<f32>().ok()
                    }
                })
                .unwrap_or(0.0);

            // white-space: nowrap detection:
            // 1. Explicit white-space: nowrap on text or parent
            // 2. Parent is a Button (buttons don't wrap text by default)
            // 3. Parent is a single-line container (height ≤ ~2 lines of text)
            //    This catches badges, labels, inline spans, and flex items
            let explicit_nowrap = node
                .styles
                .get("white-space")
                .map(|s| s == "nowrap")
                .unwrap_or(false)
                || parent_node
                    .map(|p| {
                        p.styles
                            .get("white-space")
                            .map(|s| s == "nowrap")
                            .unwrap_or(false)
                    })
                    .unwrap_or(false);
            let parent_is_button = parent_node
                .map(|p| matches!(p.node_type, NodeType::Button))
                .unwrap_or(false);
            let parent_is_single_line = parent_node
                .and_then(|p| p.layout)
                .map(|pr| {
                    let line_h = parent_line_height.unwrap_or(font_size * 1.2);
                    pr.h <= line_h * 2.2 // parent fits ~2 lines or fewer → single-line container
                })
                .unwrap_or(false);
            let nowrap = explicit_nowrap || parent_is_button || parent_is_single_line;

            // overflow-wrap / word-break: parse from text node or parent
            let word_breaking = {
                let ow = node.styles.get("overflow-wrap").map(|s| s.as_str())
                    .or_else(|| node.styles.get("word-wrap").map(|s| s.as_str()))
                    .or_else(|| parent_node.and_then(|p| p.styles.get("overflow-wrap").map(|s| s.as_str())))
                    .or_else(|| parent_node.and_then(|p| p.styles.get("word-wrap").map(|s| s.as_str())));
                let wb = node.styles.get("word-break").map(|s| s.as_str())
                    .or_else(|| parent_node.and_then(|p| p.styles.get("word-break").map(|s| s.as_str())));
                if ow.is_some() || wb.is_some() {
                    let overflow_wrap = match ow {
                        Some("break-word") => rvst_text::OverflowWrapMode::BreakWord,
                        Some("anywhere") => rvst_text::OverflowWrapMode::Anywhere,
                        _ => rvst_text::OverflowWrapMode::Normal,
                    };
                    let word_break = match wb {
                        Some("break-all") => rvst_text::WordBreakMode::BreakAll,
                        Some("keep-all") => rvst_text::WordBreakMode::KeepAll,
                        _ => rvst_text::WordBreakMode::Normal,
                    };
                    Some(rvst_text::WordBreaking { overflow_wrap, word_break })
                } else {
                    None
                }
            };

            // text-overflow: ellipsis — truncate text with "…" when it overflows.
            // Per CSS spec, requires: white-space:nowrap + overflow:hidden + text-overflow:ellipsis
            let text_overflow_ellipsis = parent_node
                .and_then(|p| p.styles.get("text-overflow"))
                .map(|s| s == "ellipsis")
                .unwrap_or(false);
            let parent_overflow_hidden = parent_node
                .and_then(|p| p.styles.get("overflow"))
                .map(|s| s == "hidden")
                .unwrap_or(false);
            let ellipsis_text: String;
            let text = if explicit_nowrap && parent_overflow_hidden && text_overflow_ellipsis {
                // Measure the full text at unlimited width to see if it overflows
                let (full_w, _) = tr.measure(text, font_size, f32::MAX, parent_line_height, Some(font_weight));
                if full_w > rect.w {
                    // Measure the ellipsis character width
                    let (ellipsis_w, _) = tr.measure("\u{2026}", font_size, f32::MAX, parent_line_height, Some(font_weight));
                    let budget = rect.w - ellipsis_w;
                    if budget > 0.0 {
                        // Binary search for the longest prefix that fits within budget
                        let chars: Vec<char> = text.chars().collect();
                        let mut lo = 0usize;
                        let mut hi = chars.len();
                        while lo < hi {
                            let mid = (lo + hi + 1) / 2;
                            let prefix: String = chars[..mid].iter().collect();
                            let (pw, _) = tr.measure(&prefix, font_size, f32::MAX, parent_line_height, Some(font_weight));
                            if pw <= budget {
                                lo = mid;
                            } else {
                                hi = mid - 1;
                            }
                        }
                        // Trim trailing whitespace from the truncated prefix
                        let prefix: String = chars[..lo].iter().collect();
                        ellipsis_text = format!("{}\u{2026}", prefix.trim_end());
                        &ellipsis_text
                    } else {
                        // Not even room for ellipsis — just show ellipsis alone
                        ellipsis_text = "\u{2026}".to_string();
                        &ellipsis_text
                    }
                } else {
                    text
                }
            } else {
                text
            };

            let needs_parley_align = text_align == "center" || text_align == "right";
            // For centering: Parley needs rect.w to center within. For nowrap left: use MAX.
            let shape_w = if needs_parley_align {
                rect.w
            } else if nowrap {
                f32::MAX
            } else {
                rect.w
            };

            // For center/right: Parley handles alignment via layout.align(), x_base = rect.x
            // For left: x_base = rect.x (no manual offset needed)
            let x_base = { rect.x };
            // Use font-family if specified (e.g. "Phosphor" for icon fonts)
            let font_family = node
                .styles
                .get("font-family")
                .or_else(|| parent_node.and_then(|p| p.styles.get("font-family")));
            let shaped = if let Some(family) = font_family {
                // Extract first font family from comma-separated list
                let family = family.split(',').next().unwrap_or(family).trim().trim_matches('"').trim_matches('\'');
                // Map CSS generic families to real font names
                let family = match family {
                    "ui-sans-serif" | "system-ui" | "sans-serif" => {
                        if cfg!(target_os = "macos") { ".AppleSystemUIFont" }
                        else if cfg!(target_os = "windows") { "Segoe UI" }
                        else { "sans-serif" }
                    }
                    "ui-monospace" => {
                        if cfg!(target_os = "macos") { "SF Mono" }
                        else if cfg!(target_os = "windows") { "Cascadia Code" }
                        else { "monospace" }
                    }
                    "ui-serif" | "serif" => "serif",
                    other => other,
                };
                if needs_parley_align {
                    let align = match text_align {
                        "center" => rvst_text::TextAlign::Center,
                        "right" => rvst_text::TextAlign::Right,
                        _ => rvst_text::TextAlign::Left,
                    };
                    tr.shape_to_glyphs_aligned_with_family_wb(
                        text, font_size, shape_w, parent_line_height, Some(font_weight), align, family,
                        word_breaking.as_ref(),
                    )
                } else {
                    tr.shape_to_glyphs_with_family_wb(text, font_size, shape_w, family, word_breaking.as_ref())
                }
            } else if needs_parley_align {
                let align = match text_align {
                    "center" => rvst_text::TextAlign::Center,
                    "right" => rvst_text::TextAlign::Right,
                    _ => rvst_text::TextAlign::Left,
                };
                tr.shape_to_glyphs_aligned_wb(
                    text,
                    font_size,
                    shape_w,
                    parent_line_height,
                    Some(font_weight),
                    align,
                    word_breaking.as_ref(),
                )
            } else {
                tr.shape_to_glyphs_wb(
                    text,
                    font_size,
                    shape_w,
                    parent_line_height,
                    Some(font_weight),
                    word_breaking.as_ref(),
                )
            };
            if shaped.glyphs.is_empty() || shaped.font_data.is_empty() {
                return;
            }
            // Compute centering BEFORE moving font_data into Blob
            // For icon fonts: use skrifa to get precise glyph bounds for exact centering.
            // For regular text: center the line_height block within the rect.
            // Check if parent is a centering container (flex + align-items:center + justify-content:center)
            // with a single short text child — common for avatars, badges, icons.
            let parent_is_centering_box = parent_node
                .map(|p| {
                    let ps = &p.styles;
                    let is_flex = ps.get("display").map(|v| v.contains("flex")).unwrap_or(false);
                    let ai_center = ps.get("align-items").map(|v| v == "center").unwrap_or(false);
                    let jc_center = ps.get("justify-content").map(|v| v == "center").unwrap_or(false);
                    is_flex && ai_center && jc_center
                })
                .unwrap_or(false);
            let use_precise_centering = (font_family.is_some() && shaped.glyphs.len() == 1)
                || (parent_is_centering_box && text.len() <= 2 && shaped.glyphs.len() <= 2);

            let (text_y_offset, text_x_offset) =
                if use_precise_centering && shaped.glyphs.len() == 1 {
                    // Single glyph in centering container — use precise skrifa bounds
                    let g = &shaped.glyphs[0];
                    if let Some((x_min, y_min, gw, gh)) =
                        rvst_text::glyph_pixel_bounds(&shaped.font_data, g.id, shaped.font_size)
                    {
                        let y_off = (rect.h - gh) / 2.0 - (g.y + y_min);
                        let x_off = (rect.w - gw) / 2.0 - (g.x + x_min);
                        (y_off, x_off)
                    } else {
                        let line_h = shaped.font_size * 1.2;
                        (((rect.h - line_h).max(0.0)) / 2.0, 0.0)
                    }
                } else {
                    // Regular text vertical positioning:
                    // Single-line: center line-height block within rect
                    // Multi-line: no centering — text starts at top of rect
                    //   (layout engine already positioned the rect correctly)
                    let line_h = shaped.font_size * 1.2;
                    let is_multiline = rect.h > line_h * 1.5;
                    let y_off = if is_multiline {
                        0.0
                    } else {
                        ((rect.h - line_h).max(0.0)) / 2.0
                    };
                    (y_off, 0.0)
                };
            let x_base = x_base + text_x_offset;
            let blob: Blob<u8> = Blob::from(shaped.font_data);
            let font_data = FontData::new(blob, 0);
            scene
                .draw_glyphs(&font_data)
                .font_size(shaped.font_size)
                .transform(Affine::translate(Vec2::new(
                    x_base as f64,
                    (rect.y + text_y_offset) as f64,
                )))
                .brush(Brush::Solid(color))
                .draw(
                    Fill::NonZero,
                    shaped.glyphs.iter().enumerate().map(|(i, g)| vello::Glyph {
                        id: g.id,
                        x: g.x + i as f32 * letter_spacing_px,
                        y: g.y,
                    }),
                );

            // text-decoration: underline / line-through / overline
            let text_decoration = node
                .styles
                .get("text-decoration-line")
                .or_else(|| node.styles.get("text-decoration"))
                .or_else(|| parent_node.and_then(|p| p.styles.get("text-decoration-line")))
                .or_else(|| parent_node.and_then(|p| p.styles.get("text-decoration")));
            if let Some(dec) = text_decoration {
                let dec = dec.trim();
                if dec != "none" {
                    let line_x0 = x_base as f64;
                    let line_x1 = (x_base + rect.w) as f64;
                    let base_y = (rect.y + text_y_offset) as f64;
                    let fs = font_size as f64;
                    let stroke = Stroke::new(1.0);
                    if dec.contains("underline") {
                        let y = base_y + fs * 1.05;
                        scene.stroke(
                            &stroke,
                            Affine::IDENTITY,
                            color,
                            None,
                            &Line::new(Point::new(line_x0, y), Point::new(line_x1, y)),
                        );
                    }
                    if dec.contains("line-through") {
                        let y = base_y + fs * 0.55;
                        scene.stroke(
                            &stroke,
                            Affine::IDENTITY,
                            color,
                            None,
                            &Line::new(Point::new(line_x0, y), Point::new(line_x1, y)),
                        );
                    }
                    if dec.contains("overline") {
                        let y = base_y;
                        scene.stroke(
                            &stroke,
                            Affine::IDENTITY,
                            color,
                            None,
                            &Line::new(Point::new(line_x0, y), Point::new(line_x1, y)),
                        );
                    }
                }
            }
        }
        NodeType::Input => {
            // Draw input box: read CSS background-color, border-radius, border from styles
            let input_radius = parse_border_radius_with_size(&node.styles, rect.w, rect.h);
            let bg_color = node
                .styles
                .get("background-color")
                .and_then(|s| parse_css_color(s.trim()))
                .or_else(|| {
                    node.styles.get("background").and_then(|s| parse_css_color(s.trim()))
                })
                .unwrap_or(Color::from_rgba8(0xff, 0xff, 0xff, 0xff)); // Browser default: white
            {
                let x0 = rect.x as f64;
                let y0 = rect.y as f64;
                let x1 = (rect.x + rect.w) as f64;
                let y1 = (rect.y + rect.h) as f64;
                if input_radius > 0.0 {
                    let rrect = RoundedRect::new(x0, y0, x1, y1, input_radius);
                    scene.fill(Fill::NonZero, Affine::IDENTITY, bg_color, None, &rrect);
                } else {
                    let vello_rect = Rect::new(x0, y0, x1, y1);
                    scene.fill(Fill::NonZero, Affine::IDENTITY, bg_color, None, &vello_rect);
                }
            }
            // CSS borders (same logic as View nodes)
            draw_border(scene, &node.styles, rect.x, rect.y, rect.w, rect.h);
            // Fallback: if border-width is 0 but box-shadow contains a ring,
            // draw a border using the ring color (Tailwind ring-2 uses box-shadow)
            {
                let bw = node.styles.get("border-width").map(|s| s.trim()).unwrap_or("0");
                if bw == "0" || bw == "0px" {
                    if let Some(shadow) = node.styles.get("box-shadow") {
                        // Extract ring color from box-shadow pattern: 0 0 0 Npx <color>
                        // Tailwind ring-2 compiles to: 0 0 0 calc(2px + 0px) rgb(...)
                        if shadow.contains("calc(") || shadow.contains("0 0 0") {
                            // Use border-color if set, otherwise try parsing from shadow
                            let ring_color = node.styles.get("border-color")
                                .and_then(|s| parse_css_color(s.trim()))
                                .unwrap_or(Color::from_rgba8(0xe5, 0xe7, 0xeb, 0xff));
                            // Ring renders outside the element edge (like CSS box-shadow spread).
                            // Stroke is centered on the path, so offset outward by half stroke width.
                            let ring_width = 2.0_f64;
                            let r = input_radius as f64;
                            let stroke = Stroke::new(ring_width);
                            let offset = ring_width / 2.0;
                            if r > 0.0 {
                                let rrect = RoundedRect::new(
                                    rect.x as f64 - offset, rect.y as f64 - offset,
                                    (rect.x + rect.w) as f64 + offset, (rect.y + rect.h) as f64 + offset,
                                    r + offset,
                                );
                                scene.stroke(&stroke, Affine::IDENTITY, ring_color, None, &rrect);
                            } else {
                                let vr = Rect::new(
                                    rect.x as f64 - offset, rect.y as f64 - offset,
                                    (rect.x + rect.w) as f64 + offset, (rect.y + rect.h) as f64 + offset,
                                );
                                scene.stroke(&stroke, Affine::IDENTITY, ring_color, None, &vr);
                            }
                        }
                    }
                }
            }
            // Value text, or placeholder if value is empty
            let value = node
                .styles
                .get("value")
                .map(|s| s.as_str())
                .or(node.text.as_deref())
                .unwrap_or("");
            let css_text_color = node
                .styles
                .get("color")
                .and_then(|s| parse_css_color(s.trim()))
                .unwrap_or(Color::from_rgba8(0xcd, 0xd6, 0xf4, 0xff));
            let is_placeholder = value.is_empty();
            let (display_text, text_color) = if !value.is_empty() {
                (value, css_text_color)
            } else if let Some(ph) = node.styles.get("placeholder") {
                (ph.as_str(), Color::from_rgba8(0x6c, 0x70, 0x86, 0xff)) // dimmed placeholder
            } else {
                ("", css_text_color)
            };
            // Read CSS padding for text inset
            let pad_left = node.styles.get("padding-left")
                .or_else(|| node.styles.get("padding"))
                .and_then(|s| s.trim().trim_end_matches("px").parse::<f32>().ok())
                .unwrap_or(8.0);
            let pad_top = node.styles.get("padding-top")
                .or_else(|| node.styles.get("padding"))
                .and_then(|s| s.trim().trim_end_matches("px").parse::<f32>().ok())
                .unwrap_or(8.0);
            // Read CSS font-size
            let input_font_size = node.styles.get("font-size")
                .and_then(|s| s.trim().trim_end_matches("px").parse::<f32>().ok())
                .unwrap_or(FONT_SIZE);
            // Vertically center text: baseline at vertical midpoint + half ascent
            let text_y = rect.y + (rect.h - input_font_size) / 2.0;
            let text_x = rect.x + pad_left;
            let mut text_end_x = text_x;
            if !display_text.is_empty() {
                let shaped = tr.shape_to_glyphs(display_text, input_font_size, rect.w - pad_left * 2.0, None, None);
                if !shaped.glyphs.is_empty() && !shaped.font_data.is_empty() {
                    // Only advance caret for actual value text, not placeholder.
                    // Placeholder is an overlay — caret stays at start position.
                    if !is_placeholder {
                        if let Some(last) = shaped.glyphs.last() {
                            text_end_x = text_x + last.x + shaped.font_size * 0.6;
                        }
                    }
                    let blob = vello::peniko::Blob::from(shaped.font_data);
                    let font_data = vello::peniko::FontData::new(blob, 0);
                    scene
                        .draw_glyphs(&font_data)
                        .font_size(shaped.font_size)
                        .transform(Affine::translate(vello::kurbo::Vec2::new(
                            text_x as f64,
                            text_y as f64,
                        )))
                        .brush(Brush::Solid(text_color))
                        .draw(
                            Fill::NonZero,
                            shaped.glyphs.iter().map(|g| vello::Glyph {
                                id: g.id,
                                x: g.x,
                                y: g.y,
                            }),
                        );
                }
            }
            // Draw caret when this input is focused
            if tree.focused == Some(node.id) {
                let caret_y = rect.y + pad_top;
                let caret_h = rect.h - pad_top * 2.0;
                let caret = Rect::new(
                    text_end_x as f64,
                    caret_y as f64,
                    (text_end_x + 1.0) as f64,
                    (caret_y + caret_h) as f64,
                );
                scene.fill(
                    Fill::NonZero,
                    Affine::IDENTITY,
                    Color::from_rgba8(0xcd, 0xd6, 0xf4, 0xff),
                    None,
                    &caret,
                );
            }
        }
        NodeType::Textarea => {
            let vello_rect = Rect::new(
                rect.x as f64,
                rect.y as f64,
                (rect.x + rect.w) as f64,
                (rect.y + rect.h) as f64,
            );
            scene.fill(
                Fill::NonZero,
                Affine::IDENTITY,
                Color::from_rgba8(0x1e, 0x1e, 0x2e, 0xff),
                None,
                &vello_rect,
            );
            let border = Rect::new(
                rect.x as f64,
                rect.y as f64,
                (rect.x + rect.w) as f64,
                (rect.y + 1.0) as f64,
            );
            scene.fill(
                Fill::NonZero,
                Affine::IDENTITY,
                Color::from_rgba8(0x58, 0x5b, 0x70, 0xff),
                None,
                &border,
            );
            let value = node
                .styles
                .get("value")
                .map(|s| s.as_str())
                .or(node.text.as_deref())
                .unwrap_or("");
            let (display_text, text_color) = if !value.is_empty() {
                (value, Color::from_rgba8(0xcd, 0xd6, 0xf4, 0xff))
            } else if let Some(ph) = node.styles.get("placeholder") {
                (ph.as_str(), Color::from_rgba8(0x6c, 0x70, 0x86, 0xff))
            } else {
                ("", Color::from_rgba8(0xcd, 0xd6, 0xf4, 0xff))
            };
            let mut text_end_x = rect.x + 8.0;
            let mut text_end_y = rect.y + 4.0;
            let font_size = node
                .styles
                .get("font-size")
                .and_then(|v| parse_font_size_value(v))
                .unwrap_or(FONT_SIZE);
            if !display_text.is_empty() {
                // Textarea renders multiline text clipped to its bounds
                let shaped = tr.shape_to_glyphs(display_text, font_size, rect.w - 16.0, None, None);
                if !shaped.glyphs.is_empty() && !shaped.font_data.is_empty() {
                    if let Some(last) = shaped.glyphs.last() {
                        text_end_x = rect.x + 8.0 + last.x + font_size * 0.6;
                        text_end_y = rect.y + last.y - font_size;
                    }
                    let blob = vello::peniko::Blob::from(shaped.font_data);
                    let font_data = vello::peniko::FontData::new(blob, 0);
                    scene.push_clip_layer(Fill::NonZero, Affine::IDENTITY, &vello_rect);
                    scene
                        .draw_glyphs(&font_data)
                        .font_size(shaped.font_size)
                        .transform(Affine::translate(vello::kurbo::Vec2::new(
                            (rect.x + 8.0) as f64,
                            rect.y as f64,
                        )))
                        .brush(Brush::Solid(text_color))
                        .draw(
                            Fill::NonZero,
                            shaped.glyphs.iter().map(|g| vello::Glyph {
                                id: g.id,
                                x: g.x,
                                y: g.y,
                            }),
                        );
                    scene.pop_layer();
                }
            }
            // Draw caret when this textarea is focused
            if tree.focused == Some(node.id) {
                let caret_h = font_size + 4.0;
                let caret = Rect::new(
                    text_end_x as f64,
                    text_end_y as f64,
                    (text_end_x + 1.0) as f64,
                    (text_end_y + caret_h) as f64,
                );
                scene.fill(
                    Fill::NonZero,
                    Affine::IDENTITY,
                    Color::from_rgba8(0xcd, 0xd6, 0xf4, 0xff),
                    None,
                    &caret,
                );
            }
        }
        NodeType::View | NodeType::Scroll | NodeType::Form => {
            // Box shadow (drawn behind everything)
            let view_radius = parse_border_radius_with_size(&node.styles, rect.w, rect.h);
            draw_box_shadow(
                scene,
                &node.styles,
                rect.x,
                rect.y,
                rect.w,
                rect.h,
                view_radius,
            );
            // background-color takes priority; background shorthand is fallback.
            // Try gradient from background-image or background shorthand.
            let view_bg_gradient = node.styles.get("background-image")
                .or_else(|| node.styles.get("background"))
                .and_then(|s| {
                    let s = s.trim();
                    if s.starts_with("linear-gradient(") {
                        parse_linear_gradient(s, rect.w, rect.h)
                    } else {
                        None
                    }
                });
            let bg_color = node
                .styles
                .get("background-color")
                .and_then(|s| parse_css_color(s.trim()))
                .or_else(|| {
                    node.styles.get("background").and_then(|s| {
                        let s = s.trim();
                        if s.contains("gradient") || s.contains("url(") {
                            None
                        } else {
                            parse_css_color(s)
                        }
                    })
                });
            {
                let x0 = rect.x as f64;
                let y0 = rect.y as f64;
                let x1 = (rect.x + rect.w) as f64;
                let y1 = (rect.y + rect.h) as f64;
                let radius = view_radius; // already computed above for box-shadow
                if let Some(ref gradient) = view_bg_gradient {
                    if radius > 0.0 {
                        let rrect = RoundedRect::new(x0, y0, x1, y1, radius);
                        scene.fill(Fill::NonZero, Affine::IDENTITY, gradient, None, &rrect);
                    } else {
                        let vello_rect = Rect::new(x0, y0, x1, y1);
                        scene.fill(Fill::NonZero, Affine::IDENTITY, gradient, None, &vello_rect);
                    }
                } else if let Some(color) = bg_color {
                    if radius > 0.0 {
                        let rrect = RoundedRect::new(x0, y0, x1, y1, radius);
                        scene.fill(Fill::NonZero, Affine::IDENTITY, color, None, &rrect);
                    } else {
                        let vello_rect = Rect::new(x0, y0, x1, y1);
                        scene.fill(Fill::NonZero, Affine::IDENTITY, color, None, &vello_rect);
                    }
                }
            }
            // Border rendering (inset filled rects per side)
            draw_border(scene, &node.styles, rect.x, rect.y, rect.w, rect.h);

            // SVG path rendering: if this node has a `d` attribute, render the path
            if let Some(d_attr) = node.styles.get("d") {
                // Determine fill color: check `fill` attr, then `color` with ancestor walk
                let fill_color = node
                    .styles
                    .get("fill")
                    .and_then(|s| {
                        let s = s.trim();
                        if s == "currentColor" || s == "currentcolor" || s.is_empty() || s == "none" {
                            None
                        } else {
                            parse_css_color(s)
                        }
                    })
                    .unwrap_or_else(|| {
                        // Walk up ancestors to find a color
                        let own_color_str = node.styles.get("color").map(|s| s.as_str()).unwrap_or("");
                        let own_is_unresolvable = own_color_str.starts_with("color-mix(")
                            || own_color_str.starts_with("currentcolor")
                            || own_color_str.is_empty();
                        if own_is_unresolvable {
                            let mut ancestor_color = None;
                            let mut cur = node.parent;
                            while let Some(pid) = cur {
                                if let Some(anc) = tree.nodes.get(&pid) {
                                    let c = anc.styles.get("color").map(|s| s.as_str()).unwrap_or("");
                                    if !c.is_empty()
                                        && !c.starts_with("color-mix(")
                                        && !c.starts_with("currentcolor")
                                    {
                                        ancestor_color = Some(parse_color(&anc.styles));
                                        break;
                                    }
                                    cur = anc.parent;
                                } else {
                                    break;
                                }
                            }
                            ancestor_color.unwrap_or(Color::from_rgba8(0x00, 0x00, 0x00, 0xff))
                        } else {
                            parse_color(&node.styles)
                        }
                    });

                // Use parent's layout rect if this node has degenerate dimensions
                // (common for SVG <path> elements that rely on parent <svg> for sizing)
                let svg_rect = if rect.w < 1.0 || rect.h < 1.0 {
                    node.parent
                        .and_then(|pid| tree.nodes.get(&pid))
                        .and_then(|p| p.layout)
                        .unwrap_or(rect)
                } else {
                    rect
                };

                // Determine viewBox (default 24x24 for most icon sets)
                // Parse viewBox from self, parent, or grandparent
                let parse_viewbox = |vb: &str| -> Option<(f64, f64)> {
                    let parts: Vec<f64> = vb
                        .split_whitespace()
                        .filter_map(|s| s.parse().ok())
                        .collect();
                    if parts.len() >= 4 {
                        Some((parts[2], parts[3]))
                    } else {
                        None
                    }
                };
                let (vb_w, vb_h) = node
                    .styles
                    .get("viewBox")
                    .and_then(|vb| parse_viewbox(vb))
                    .or_else(|| {
                        // Check parent and grandparent for viewBox
                        let parent = node.parent.and_then(|pid| tree.nodes.get(&pid));
                        parent
                            .and_then(|p| p.styles.get("viewBox").and_then(|vb| parse_viewbox(vb)))
                            .or_else(|| {
                                parent
                                    .and_then(|p| p.parent)
                                    .and_then(|gid| tree.nodes.get(&gid))
                                    .and_then(|g| g.styles.get("viewBox").and_then(|vb| parse_viewbox(vb)))
                            })
                    })
                    .unwrap_or((24.0, 24.0));

                let scale_x = svg_rect.w as f64 / vb_w;
                let scale_y = svg_rect.h as f64 / vb_h;
                let offset_x = svg_rect.x as f64;
                let offset_y = svg_rect.y as f64;

                if let Some(bez_path) = parse_svg_path(d_attr, scale_x, scale_y, offset_x, offset_y)
                {
                    // Check if fill="none" — if so, stroke instead of fill
                    let fill_is_none = node
                        .styles
                        .get("fill")
                        .map(|s| s.trim() == "none")
                        .unwrap_or(false);
                    if fill_is_none {
                        let stroke_width = node
                            .styles
                            .get("stroke-width")
                            .and_then(|s| s.trim().parse::<f64>().ok())
                            .unwrap_or(2.0);
                        let stroke_color = node
                            .styles
                            .get("stroke")
                            .and_then(|s| {
                                let s = s.trim();
                                if s == "currentColor" || s == "currentcolor" {
                                    None
                                } else {
                                    parse_css_color(s)
                                }
                            })
                            .unwrap_or(fill_color);
                        let stroke = Stroke::new(stroke_width * scale_x.min(scale_y));
                        scene.stroke(&stroke, Affine::IDENTITY, stroke_color, None, &bez_path);
                    } else {
                        scene.fill(Fill::NonZero, Affine::IDENTITY, fill_color, None, &bez_path);
                    }
                }
            }

            // SVG <polygon points="..."> rendering: convert points to a closed path
            if let Some(points_attr) = node.styles.get("points") {
                if !points_attr.is_empty() {
                    // Parse points: "x1 y1 x2 y2 ..." or "x1,y1 x2,y2 ..."
                    let coords: Vec<f64> = points_attr
                        .replace(',', " ")
                        .split_whitespace()
                        .filter_map(|s| s.parse().ok())
                        .collect();

                    if coords.len() >= 4 {
                        // Accumulate <g> transforms by walking up to the nearest viewBox ancestor
                        let mut g_tx = 0.0f64;
                        let mut g_ty = 0.0f64;
                        let mut cur_id = node.parent;
                        while let Some(pid) = cur_id {
                            if let Some(anc) = tree.nodes.get(&pid) {
                                if anc.styles.get("viewBox").is_some() {
                                    break; // Stop at the <svg> element
                                }
                                let (atx, aty) =
                                    parse_css_transform_translate(&anc.styles, 0.0, 0.0);
                                g_tx += atx;
                                g_ty += aty;
                                cur_id = anc.parent;
                            } else {
                                break;
                            }
                        }

                        // Find viewBox from ancestors
                        let parse_viewbox_full =
                            |vb: &str| -> Option<(f64, f64, f64, f64)> {
                                let parts: Vec<f64> = vb
                                    .split_whitespace()
                                    .filter_map(|s| s.parse().ok())
                                    .collect();
                                if parts.len() >= 4 {
                                    Some((parts[0], parts[1], parts[2], parts[3]))
                                } else {
                                    None
                                }
                            };
                        let (vb_x, vb_y, vb_w, vb_h) = {
                            let mut result = None;
                            let mut search = node.parent;
                            while let Some(pid) = search {
                                if let Some(anc) = tree.nodes.get(&pid) {
                                    if let Some(vb) = anc.styles.get("viewBox") {
                                        result = parse_viewbox_full(vb);
                                        break;
                                    }
                                    search = anc.parent;
                                } else {
                                    break;
                                }
                            }
                            result.unwrap_or((0.0, 0.0, 24.0, 24.0))
                        };

                        // Use parent SVG element's layout rect
                        let svg_rect = if rect.w < 1.0 || rect.h < 1.0 {
                            let mut search = node.parent;
                            let mut found = rect;
                            while let Some(pid) = search {
                                if let Some(anc) = tree.nodes.get(&pid) {
                                    if let Some(ly) = anc.layout {
                                        if ly.w >= 1.0 && ly.h >= 1.0 {
                                            found = ly;
                                            break;
                                        }
                                    }
                                    search = anc.parent;
                                } else {
                                    break;
                                }
                            }
                            found
                        } else {
                            rect
                        };

                        let sx = svg_rect.w as f64 / vb_w;
                        let sy = svg_rect.h as f64 / vb_h;

                        // Build BezPath from points, applying <g> transforms and viewBox scaling
                        let mut path = peniko::kurbo::BezPath::new();
                        for (i, chunk) in coords.chunks_exact(2).enumerate() {
                            let px = (chunk[0] + g_tx - vb_x) * sx + svg_rect.x as f64;
                            let py = (chunk[1] + g_ty - vb_y) * sy + svg_rect.y as f64;
                            if i == 0 {
                                path.move_to((px, py));
                            } else {
                                path.line_to((px, py));
                            }
                        }
                        path.close_path();

                        // Determine fill color (same logic as SVG path)
                        let poly_fill = node
                            .styles
                            .get("fill")
                            .or_else(|| {
                                // Walk up for fill from ancestors
                                let mut cur = node.parent;
                                while let Some(pid) = cur {
                                    if let Some(anc) = tree.nodes.get(&pid) {
                                        if let Some(f) = anc.styles.get("fill") {
                                            if !f.is_empty() {
                                                return Some(f);
                                            }
                                        }
                                        cur = anc.parent;
                                    } else {
                                        break;
                                    }
                                }
                                None
                            })
                            .and_then(|s| {
                                let s = s.trim();
                                if s == "currentColor" || s == "currentcolor" {
                                    // Resolve currentColor from ancestor chain
                                    let mut cur = node.parent;
                                    while let Some(pid) = cur {
                                        if let Some(anc) = tree.nodes.get(&pid) {
                                            let c = anc.styles.get("color").map(|s| s.as_str()).unwrap_or("");
                                            if !c.is_empty() && !c.starts_with("color-mix(") && !c.starts_with("currentcolor") {
                                                return parse_css_color(c);
                                            }
                                            cur = anc.parent;
                                        } else {
                                            break;
                                        }
                                    }
                                    Some(Color::from_rgba8(0x00, 0x00, 0x00, 0xff))
                                } else if s == "none" {
                                    None
                                } else {
                                    parse_css_color(s)
                                }
                            })
                            .unwrap_or(Color::from_rgba8(0x00, 0x00, 0x00, 0xff));

                        scene.fill(Fill::NonZero, Affine::IDENTITY, poly_fill, None, &path);
                    }
                }
            }

            let overflow = node
                .styles
                .get("overflow")
                .map(|s| s.as_str())
                .unwrap_or("");
            let overflow_y = node
                .styles
                .get("overflow-y")
                .map(|s| s.as_str())
                .unwrap_or("");
            let clip_children = matches!(node.node_type, NodeType::Scroll)
                || matches!(overflow, "hidden" | "auto" | "scroll")
                || matches!(overflow_y, "hidden" | "auto" | "scroll");
            let scroll_offset = node.scroll_y;
            if clip_children {
                scene.push_clip_layer(Fill::NonZero, Affine::IDENTITY, &node_rect);
            }
            // Scroll: pass accumulated offset to children so they draw at screen-space
            // positions. No Vello compositing layer needed — just arithmetic.
            let child_scroll_y = scroll_y_acc + scroll_offset;
            for &child in children {
                draw_node_inner(tree, child, tr, scene, viewport, child_scroll_y, child_fixed_offset);
            }
            // Draw caret for contentEditable elements when focused
            if tree.focused == Some(node.id) {
                let is_ce = node
                    .styles
                    .get("contenteditable")
                    .map(|v| v == "true" || v.is_empty())
                    .unwrap_or(false);
                if is_ce {
                    if let Some((cx, cy, ch)) = node.caret {
                        let caret_rect = Rect::new(
                            cx as f64,
                            cy as f64,
                            (cx + 1.0) as f64,
                            (cy + ch) as f64,
                        );
                        scene.fill(
                            Fill::NonZero,
                            Affine::IDENTITY,
                            Color::from_rgba8(0xcd, 0xd6, 0xf4, 0xff),
                            None,
                            &caret_rect,
                        );
                    }
                }
            }
            // ── Scrollbar rendering ──────────────────────────────────────
            // Draw a thin scrollbar track + thumb on the right edge when content
            // overflows the container and overflow is scroll/auto.
            if clip_children {
                let is_scrollable = matches!(node.node_type, NodeType::Scroll)
                    || matches!(overflow, "auto" | "scroll")
                    || matches!(overflow_y, "auto" | "scroll");
                if is_scrollable {
                    let container_h = rect.h;
                    // Content height: use virtual_content_height if set, else compute
                    // from the maximum bottom edge of children minus container top.
                    let content_h = node.virtual_content_height.unwrap_or_else(|| {
                        let container_top = raw_rect.y;
                        node.children
                            .iter()
                            .filter_map(|c| {
                                tree.nodes
                                    .get(c)
                                    .and_then(|n| n.layout.as_ref())
                                    .map(|r| r.y + r.h)
                            })
                            .fold(0.0f32, f32::max)
                            - container_top
                    });
                    let max_scroll = (content_h - container_h).max(0.0);
                    if max_scroll > 0.0 {
                        let scrollbar_w: f64 = 6.0;
                        let scrollbar_radius: f64 = 3.0;
                        let padding: f64 = 2.0;
                        let track_x = node_rect.x1 - scrollbar_w - padding;
                        let track_y = node_rect.y0 + padding;
                        let track_h = (node_rect.y1 - node_rect.y0) - padding * 2.0;

                        // Track background
                        let track_rrect = RoundedRect::new(
                            track_x,
                            track_y,
                            track_x + scrollbar_w,
                            track_y + track_h,
                            scrollbar_radius,
                        );
                        scene.fill(
                            Fill::NonZero,
                            Affine::IDENTITY,
                            Color::from_rgba8(0x00, 0x00, 0x00, 0x4d), // ~0.3 opacity
                            None,
                            &track_rrect,
                        );

                        // Thumb
                        let ratio = (container_h as f64) / (content_h as f64);
                        let thumb_h = (ratio * track_h).max(20.0).min(track_h);
                        let scroll_ratio = if max_scroll > 0.0 {
                            (scroll_offset as f64) / (max_scroll as f64)
                        } else {
                            0.0
                        };
                        let thumb_y = track_y + scroll_ratio * (track_h - thumb_h);
                        let thumb_rrect = RoundedRect::new(
                            track_x,
                            thumb_y,
                            track_x + scrollbar_w,
                            thumb_y + thumb_h,
                            scrollbar_radius,
                        );
                        scene.fill(
                            Fill::NonZero,
                            Affine::IDENTITY,
                            Color::from_rgba8(0xff, 0xff, 0xff, 0x99), // ~0.6 opacity
                            None,
                            &thumb_rrect,
                        );
                    }
                }
                scene.pop_layer();
            }
        }
    }

    if use_opacity_layer {
        scene.pop_layer();
    }
}

/// Parse a full CSS `transform` property into an `Affine`.
/// Supports: translate, translateX, translateY, translate3d, rotate, scale, scaleX, scaleY, skew, skewX, skewY.
/// CSS transform functions are applied left-to-right; in matrix terms: result = last * ... * first.
/// Percent translate values are resolved against the node's own width/height.
fn parse_css_transform(
    styles: &std::collections::HashMap<String, String>,
    w: f32,
    h: f32,
) -> Affine {
    let s = match styles.get("transform") {
        Some(v) => v.trim(),
        None => return Affine::IDENTITY,
    };
    if s.is_empty() || s == "none" {
        return Affine::IDENTITY;
    }
    let parse_len = |v: &str, dim: f32| -> f64 {
        let v = v.trim();
        if v.ends_with('%') {
            v.trim_end_matches('%').parse::<f64>().unwrap_or(0.0) / 100.0 * dim as f64
        } else {
            v.trim_end_matches("px")
                .trim()
                .parse::<f64>()
                .unwrap_or(0.0)
        }
    };
    let parse_angle = |v: &str| -> f64 {
        let v = v.trim();
        if v.ends_with("deg") {
            v.trim_end_matches("deg")
                .trim()
                .parse::<f64>()
                .unwrap_or(0.0)
                .to_radians()
        } else if v.ends_with("rad") {
            v.trim_end_matches("rad")
                .trim()
                .parse::<f64>()
                .unwrap_or(0.0)
        } else if v.ends_with("turn") {
            v.trim_end_matches("turn")
                .trim()
                .parse::<f64>()
                .unwrap_or(0.0)
                * std::f64::consts::TAU
        } else {
            // bare number treated as radians (uncommon but valid in some contexts)
            v.parse::<f64>().unwrap_or(0.0).to_radians()
        }
    };
    // Center of the element for rotate/scale/skew transforms
    let cx = w as f64 / 2.0;
    let cy = h as f64 / 2.0;
    let mut result = Affine::IDENTITY;
    let mut rest = s;
    while !rest.is_empty() {
        rest = rest.trim_start();
        let Some(paren) = rest.find('(') else { break };
        let func = rest[..paren].trim();
        let Some(close) = rest.find(')') else { break };
        let args_str = &rest[paren + 1..close];
        let args: Vec<&str> = args_str.split(',').collect();
        // CSS: functions apply left-to-right. In matrix math: new_func * current_result
        match func {
            "translate" => {
                let tx = parse_len(args.first().copied().unwrap_or("0"), w);
                let ty = parse_len(args.get(1).copied().unwrap_or("0"), h);
                result = Affine::translate(Vec2::new(tx, ty)) * result;
            }
            "translateX" => {
                let tx = parse_len(args.first().copied().unwrap_or("0"), w);
                result = Affine::translate(Vec2::new(tx, 0.0)) * result;
            }
            "translateY" => {
                let ty = parse_len(args.first().copied().unwrap_or("0"), h);
                result = Affine::translate(Vec2::new(0.0, ty)) * result;
            }
            "translate3d" => {
                let tx = parse_len(args.first().copied().unwrap_or("0"), w);
                let ty = parse_len(args.get(1).copied().unwrap_or("0"), h);
                result = Affine::translate(Vec2::new(tx, ty)) * result;
            }
            "rotate" => {
                let angle = parse_angle(args.first().copied().unwrap_or("0"));
                // Rotate around element center
                let rot = Affine::translate(Vec2::new(cx, cy))
                    * Affine::rotate(angle)
                    * Affine::translate(Vec2::new(-cx, -cy));
                result = rot * result;
            }
            "scale" => {
                let sx = args
                    .first()
                    .copied()
                    .unwrap_or("1")
                    .trim()
                    .parse::<f64>()
                    .unwrap_or(1.0);
                let sy = args
                    .get(1)
                    .map(|v| v.trim().parse::<f64>().unwrap_or(sx))
                    .unwrap_or(sx);
                // Scale around element center
                let scl = Affine::translate(Vec2::new(cx, cy))
                    * Affine::scale_non_uniform(sx, sy)
                    * Affine::translate(Vec2::new(-cx, -cy));
                result = scl * result;
            }
            "scaleX" => {
                let sx = args
                    .first()
                    .copied()
                    .unwrap_or("1")
                    .trim()
                    .parse::<f64>()
                    .unwrap_or(1.0);
                let scl = Affine::translate(Vec2::new(cx, cy))
                    * Affine::scale_non_uniform(sx, 1.0)
                    * Affine::translate(Vec2::new(-cx, -cy));
                result = scl * result;
            }
            "scaleY" => {
                let sy = args
                    .first()
                    .copied()
                    .unwrap_or("1")
                    .trim()
                    .parse::<f64>()
                    .unwrap_or(1.0);
                let scl = Affine::translate(Vec2::new(cx, cy))
                    * Affine::scale_non_uniform(1.0, sy)
                    * Affine::translate(Vec2::new(-cx, -cy));
                result = scl * result;
            }
            "skew" => {
                let ax = parse_angle(args.first().copied().unwrap_or("0"));
                let ay = parse_angle(args.get(1).copied().unwrap_or("0"));
                let sk = Affine::translate(Vec2::new(cx, cy))
                    * Affine::skew(ax.tan(), ay.tan())
                    * Affine::translate(Vec2::new(-cx, -cy));
                result = sk * result;
            }
            "skewX" => {
                let ax = parse_angle(args.first().copied().unwrap_or("0"));
                let sk = Affine::translate(Vec2::new(cx, cy))
                    * Affine::skew(ax.tan(), 0.0)
                    * Affine::translate(Vec2::new(-cx, -cy));
                result = sk * result;
            }
            "skewY" => {
                let ay = parse_angle(args.first().copied().unwrap_or("0"));
                let sk = Affine::translate(Vec2::new(cx, cy))
                    * Affine::skew(0.0, ay.tan())
                    * Affine::translate(Vec2::new(-cx, -cy));
                result = sk * result;
            }
            _ => {} // ignore unknown functions (e.g. matrix, perspective)
        }
        rest = &rest[close + 1..];
    }
    result
}

/// Backward-compatible wrapper: extract (tx, ty) translation from CSS transform.
fn parse_css_transform_translate(
    styles: &std::collections::HashMap<String, String>,
    w: f32,
    h: f32,
) -> (f64, f64) {
    let affine = parse_css_transform(styles, w, h);
    let coeffs = affine.as_coeffs();
    (coeffs[4], coeffs[5])
}

/// Draw CSS border as inset filled rectangles (one per side).
/// Supports: border shorthand ("1px solid #ccc"), border-width, border-color,
/// border-top/right/bottom/left shorthands, and per-side -color/-width variants.
fn draw_border(
    scene: &mut Scene,
    styles: &std::collections::HashMap<String, String>,
    x: f32,
    y: f32,
    w: f32,
    h: f32,
) {
    // Parse the border shorthand: "width style color" (only width and color matter for fill)
    let parse_border_shorthand = |s: &str| -> Option<(f32, Color)> {
        let mut width = None;
        let mut color = None;
        for token in s.split_whitespace() {
            if token == "none" || token == "hidden" {
                return None;
            }
            if token == "0" {
                width = Some(0.0);
            } else if let Some(px) = token.strip_suffix("px").and_then(|n| n.parse::<f32>().ok()) {
                width = Some(px);
            } else if token == "thin" {
                width = Some(1.0);
            } else if token == "medium" {
                width = Some(2.0);
            } else if token == "thick" {
                width = Some(4.0);
            } else if let Some(c) = parse_css_color(token) {
                color = Some(c);
            }
        }
        let w = width.unwrap_or(1.0);
        // border-width: 0 means no border (Tailwind reset: "border: 0 solid")
        if w <= 0.0 {
            return None;
        }
        Some((
            w,
            color.unwrap_or(Color::from_rgba8(0x88, 0x88, 0x88, 0xff)),
        ))
    };

    // Global border: shorthand first, then individual width+color+style properties
    let global = styles
        .get("border")
        .and_then(|s| parse_border_shorthand(s))
        .or_else(|| {
            // Construct from individual properties (Tailwind sets these separately)
            let width = styles
                .get("border-width")
                .and_then(|v| v.strip_suffix("px").and_then(|n| n.parse::<f32>().ok()))
                .filter(|&w| w > 0.0)?;
            let style = styles
                .get("border-style")
                .map(|s| s.as_str())
                .unwrap_or("solid");
            if style == "none" || style == "hidden" {
                return None;
            }
            let color = styles
                .get("border-color")
                .and_then(|v| parse_css_color(v))
                .unwrap_or(Color::from_rgba8(0x88, 0x88, 0x88, 0xff));
            Some((width, color))
        });

    // Per-side shorthands override global
    struct Side {
        width: f32,
        color: Color,
    }
    let _resolve = |side_key: &str, width_key: &str, color_key: &str| -> Option<Side> {
        if let Some(s) = styles.get(side_key) {
            if let Some((w, c)) = parse_border_shorthand(s) {
                return Some(Side { width: w, color: c });
            }
            return None; // "none" or invalid
        }
        if let Some((global_w, global_c)) = global {
            let width = styles
                .get(width_key)
                .and_then(|v| v.strip_suffix("px")?.parse::<f32>().ok())
                .unwrap_or(global_w);
            let color = styles
                .get(color_key)
                .and_then(|v| parse_css_color(v))
                .unwrap_or(global_c);
            if width > 0.0 {
                return Some(Side { width, color });
            }
        }
        None
    };

    // Per-side: also check individual -style properties (Tailwind sets border-right-style etc.)
    let resolve_with_style =
        |side_key: &str, width_key: &str, color_key: &str, style_key: &str| -> Option<Side> {
            // First try the per-side shorthand
            if let Some(s) = styles.get(side_key) {
                if let Some((w, c)) = parse_border_shorthand(s) {
                    return Some(Side { width: w, color: c });
                }
                return None;
            }
            // Check per-side width/style. If per-side style isn't set, fall back to
            // the global border-style (Tailwind sets border-style: solid globally, then
            // uses border-bottom-width: 1px without per-side style).
            let side_style = styles
                .get(style_key)
                .or_else(|| styles.get("border-style"))
                .map(|s| s.as_str());
            let has_side_width = styles.get(width_key).is_some();
            let has_side_style =
                (side_style.is_some() && side_style != Some("none") && side_style != Some("hidden"))
                    && has_side_width;
            if has_side_style {
                let width = styles
                    .get(width_key)
                    .and_then(|v| v.strip_suffix("px")?.parse::<f32>().ok())
                    .or_else(|| global.map(|(w, _)| w))
                    .unwrap_or(0.0); // Default 0, not 1 — Tailwind reset sets border: 0 solid
                let color = styles
                    .get(color_key)
                    .and_then(|v| parse_css_color(v))
                    .or_else(|| styles.get("border-color").and_then(|v| parse_css_color(v)))
                    .or_else(|| global.map(|(_, c)| c))
                    .unwrap_or(Color::from_rgba8(0x88, 0x88, 0x88, 0xff));
                if width > 0.0 {
                    return Some(Side { width, color });
                }
            }
            // Fall back to global
            if let Some((global_w, global_c)) = global {
                let width = styles
                    .get(width_key)
                    .and_then(|v| v.strip_suffix("px")?.parse::<f32>().ok())
                    .unwrap_or(global_w);
                let color = styles
                    .get(color_key)
                    .and_then(|v| parse_css_color(v))
                    .unwrap_or(global_c);
                if width > 0.0 {
                    return Some(Side { width, color });
                }
            }
            None
        };

    let top = resolve_with_style(
        "border-top",
        "border-top-width",
        "border-top-color",
        "border-top-style",
    );
    let right = resolve_with_style(
        "border-right",
        "border-right-width",
        "border-right-color",
        "border-right-style",
    );
    let bottom = resolve_with_style(
        "border-bottom",
        "border-bottom-width",
        "border-bottom-color",
        "border-bottom-style",
    );
    let left = resolve_with_style(
        "border-left",
        "border-left-width",
        "border-left-color",
        "border-left-style",
    );

    // Snap to integer pixel boundaries for crisp 1px borders
    let x0 = (x as f64).round();
    let y0 = (y as f64).round();
    let x1 = ((x + w) as f64).round();
    let y1 = ((y + h) as f64).round();

    // If all 4 sides are the same, use a single rounded stroke (respects border-radius)
    let radius = parse_border_radius_with_size(styles, w, h);
    let all_same = match (&top, &right, &bottom, &left) {
        (Some(t), Some(r), Some(b), Some(l)) => {
            (t.width - r.width).abs() < 0.1
                && (t.width - b.width).abs() < 0.1
                && (t.width - l.width).abs() < 0.1
                && t.color == r.color
                && t.color == b.color
                && t.color == l.color
        }
        _ => false,
    };

    if all_same && radius > 0.0 {
        let s = top.as_ref().unwrap();
        let bw = s.width as f64;
        let inset = bw / 2.0;
        let rrect = RoundedRect::new(x0 + inset, y0 + inset, x1 - inset, y1 - inset, radius);
        let stroke = kurbo::Stroke::new(bw);
        scene.stroke(&stroke, Affine::IDENTITY, s.color, None, &rrect);
        return;
    }

    if let Some(s) = top {
        let bw = (s.width as f64).max(1.0);
        let r = Rect::new(x0, y0, x1, y0 + bw);
        scene.fill(Fill::NonZero, Affine::IDENTITY, s.color, None, &r);
    }
    if let Some(s) = bottom {
        let bw = (s.width as f64).max(1.0);
        // Border-bottom draws at the element's bottom edge (outside the content area)
        let r = Rect::new(x0, y1, x1, y1 + bw);
        scene.fill(Fill::NonZero, Affine::IDENTITY, s.color, None, &r);
    }
    if let Some(s) = left {
        let bw = (s.width as f64).max(1.0);
        let r = Rect::new(x0, y0, x0 + bw, y1);
        scene.fill(Fill::NonZero, Affine::IDENTITY, s.color, None, &r);
    }
    if let Some(s) = right {
        let bw = (s.width as f64).max(1.0);
        let r = Rect::new(x1 - bw, y0, x1, y1);
        scene.fill(Fill::NonZero, Affine::IDENTITY, s.color, None, &r);
    }
}

/// Draw CSS box-shadow as layered semi-transparent rects behind the element.
/// Approximates Gaussian blur with concentric offset rects at decreasing opacity.
/// Supports: "box-shadow: offsetX offsetY blur spread color" and Tailwind shadow classes.
fn draw_box_shadow(
    scene: &mut Scene,
    styles: &std::collections::HashMap<String, String>,
    x: f32,
    y: f32,
    w: f32,
    h: f32,
    border_radius: f64,
) {
    let shadow_val = match styles
        .get("box-shadow")
        .or_else(|| styles.get("--tw-shadow"))
    {
        Some(v) if v != "none" && !v.is_empty() => v.clone(),
        _ => return,
    };

    // Parse shadow: offsetX offsetY blurRadius [spreadRadius] [color]
    // Tailwind generates: "0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)"
    // Split on commas but respect parentheses (e.g. rgb(0 0 0 / 0.1) contains commas)
    let shadows = split_comma_respecting_parens(&shadow_val);

    for single_shadow in &shadows {
        let single_shadow = single_shadow.trim();
        if single_shadow.is_empty() {
            continue;
        }

        let mut offset_x: f64 = 0.0;
        let mut offset_y: f64 = 0.0;
        let mut blur: f64 = 0.0;
        let mut spread: f64 = 0.0;
        let mut color = Color::from_rgba8(0, 0, 0, 40); // default shadow color

        // Extract color first (rgb/rgba/hsl/oklch/hex/named at end)
        let (value_part, parsed_color) = if let Some(rgb_start) = single_shadow.find("rgb") {
            let color_str = &single_shadow[rgb_start..];
            let c = parse_css_color(color_str).unwrap_or(color);
            (&single_shadow[..rgb_start], Some(c))
        } else if let Some(hsl_start) = single_shadow.find("hsl") {
            let color_str = &single_shadow[hsl_start..];
            let c = parse_css_color(color_str).unwrap_or(color);
            (&single_shadow[..hsl_start], Some(c))
        } else if let Some(oklch_start) = single_shadow.find("oklch") {
            let color_str = &single_shadow[oklch_start..];
            let c = parse_css_color(color_str).unwrap_or(color);
            (&single_shadow[..oklch_start], Some(c))
        } else {
            // Try to find a hex color (#xxx, #xxxx, #xxxxxx, #xxxxxxxx) or named color
            // at the end of the shadow value
            let tokens: Vec<&str> = single_shadow.split_whitespace().collect();
            if let Some(last) = tokens.last() {
                if last.starts_with('#') {
                    if let Some(c) = parse_css_color(last) {
                        // Rebuild value_part without the last token
                        let last_start = single_shadow.rfind(last).unwrap_or(single_shadow.len());
                        (single_shadow[..last_start].trim_end(), Some(c))
                    } else {
                        (single_shadow, None)
                    }
                } else if last.chars().all(|c| c.is_alphabetic()) && parse_css_color(last).is_some() {
                    // Named color like "red", "transparent", etc.
                    let c = parse_css_color(last).unwrap();
                    let last_start = single_shadow.rfind(last).unwrap_or(single_shadow.len());
                    (single_shadow[..last_start].trim_end(), Some(c))
                } else {
                    (single_shadow, None)
                }
            } else {
                (single_shadow, None)
            }
        };
        if let Some(c) = parsed_color {
            color = c;
        }

        // Parse numeric values
        let nums: Vec<f64> = value_part
            .split_whitespace()
            .filter_map(|t| {
                if t == "inset" {
                    return None;
                } // skip inset keyword
                t.strip_suffix("px").unwrap_or(t).parse::<f64>().ok()
            })
            .collect();

        if let Some(&v) = nums.first() {
            offset_x = v;
        }
        if let Some(&v) = nums.get(1) {
            offset_y = v;
        }
        if let Some(&v) = nums.get(2) {
            blur = v;
        }
        if let Some(&v) = nums.get(3) {
            spread = v;
        }

        if blur <= 0.0 && spread <= 0.0 && offset_x == 0.0 && offset_y == 0.0 {
            continue; // no visible shadow for this layer
        }

        // Build the shadow rect: element rect + offset + spread
        let sx = (x as f64) + offset_x - spread;
        let sy = (y as f64) + offset_y - spread;
        let sw = (w as f64) + spread * 2.0;
        let sh = (h as f64) + spread * 2.0;

        // Skip degenerate rects
        if sw <= 0.0 || sh <= 0.0 {
            continue;
        }

        let shadow_rect = Rect::new(sx, sy, sx + sw, sy + sh);
        let shadow_radius = (border_radius + spread).max(0.0);
        // CSS blur radius → Gaussian standard deviation.
        // W3C spec says σ ≈ blur/2, but Chrome uses a slightly larger sigma
        // to produce a longer shadow tail. Empirically 0.55 matches Chrome best.
        let std_dev = blur * 0.71;

        if std_dev > 0.5 {
            // Use Vello's native GPU-accelerated Gaussian blur for rounded rects
            scene.draw_blurred_rounded_rect(
                Affine::IDENTITY,
                shadow_rect,
                color,
                shadow_radius,
                std_dev,
            );
        } else {
            // For very small or zero blur, just fill the rect directly
            if shadow_radius > 0.0 {
                let rrect = RoundedRect::new(sx, sy, sx + sw, sy + sh, shadow_radius);
                scene.fill(Fill::NonZero, Affine::IDENTITY, color, None, &rrect);
            } else {
                scene.fill(Fill::NonZero, Affine::IDENTITY, color, None, &shadow_rect);
            }
        }
    }
}

/// Split a CSS value on commas, but respect parentheses so that
/// `rgb(0 0 0 / 0.1)` is not split on its internal comma.
fn split_comma_respecting_parens(s: &str) -> Vec<&str> {
    let mut parts = Vec::new();
    let mut depth = 0usize;
    let mut start = 0;
    for (i, ch) in s.char_indices() {
        match ch {
            '(' => depth += 1,
            ')' => depth = depth.saturating_sub(1),
            ',' if depth == 0 => {
                parts.push(&s[start..i]);
                start = i + 1;
            }
            _ => {}
        }
    }
    parts.push(&s[start..]);
    parts
}

/// Parse border-radius, supporting px and % values. % is resolved against min(w,h)/2.
/// Multi-value shorthand (e.g. "8px 4px 8px 4px") is supported — we take the largest
/// value since Vello's RoundedRect only supports a single uniform radius.
fn parse_border_radius_with_size(
    styles: &std::collections::HashMap<String, String>,
    w: f32,
    h: f32,
) -> f64 {
    let v = match styles.get("border-radius") {
        Some(v) => v.trim(),
        None => return 0.0,
    };

    // Parse a single border-radius token to pixels
    let parse_one = |token: &str| -> f64 {
        if token.ends_with('%') {
            token
                .trim_end_matches('%')
                .parse::<f64>()
                .ok()
                .map(|pct| pct / 100.0 * (w.min(h) as f64 / 2.0))
                .unwrap_or(0.0)
        } else if token.ends_with("rem") {
            token
                .trim_end_matches("rem")
                .parse::<f64>()
                .ok()
                .map(|r| r * 16.0)
                .unwrap_or(0.0)
        } else if token.ends_with("em") {
            token
                .trim_end_matches("em")
                .parse::<f64>()
                .ok()
                .map(|e| e * 16.0)
                .unwrap_or(0.0)
        } else {
            token
                .trim_end_matches("px")
                .parse::<f64>()
                .ok()
                .unwrap_or(0.0)
        }
    };

    // Handle "/" separator (horizontal / vertical radii) — take max across both sides
    let v = if let Some(slash_pos) = v.find('/') {
        // Merge both halves and take max of all tokens
        let left = &v[..slash_pos];
        let right = &v[slash_pos + 1..];
        let max_left = left
            .split_whitespace()
            .map(&parse_one)
            .fold(0.0_f64, f64::max);
        let max_right = right
            .split_whitespace()
            .map(&parse_one)
            .fold(0.0_f64, f64::max);
        return max_left.max(max_right);
    } else {
        v
    };

    // Multi-value: "8px 4px 8px 4px" — take the largest
    v.split_whitespace().map(parse_one).fold(0.0_f64, f64::max)
}

/// Parse an SVG path `d` attribute into a Vello `BezPath`, applying scale and offset.
/// Supports: M, L, C, H, V, Z and their lowercase (relative) variants.
/// Also supports S/s (smooth cubic), Q/q (quadratic), T/t (smooth quadratic), A/a (arc approximation).
fn parse_svg_path(
    d: &str,
    scale_x: f64,
    scale_y: f64,
    offset_x: f64,
    offset_y: f64,
) -> Option<vello::kurbo::BezPath> {
    use vello::kurbo::{BezPath, Point};

    let mut path = BezPath::new();
    let mut has_commands = false;

    // Tokenize: split into command letters and numbers
    // SVG path data can have numbers separated by whitespace or commas,
    // and command letters can appear without whitespace before numbers.
    let mut tokens: Vec<String> = Vec::new();
    let mut current = String::new();
    let chars: Vec<char> = d.chars().collect();
    let mut i = 0;
    while i < chars.len() {
        let ch = chars[i];
        if ch.is_ascii_alphabetic() {
            if !current.is_empty() {
                tokens.push(current.clone());
                current.clear();
            }
            tokens.push(ch.to_string());
        } else if ch == '-' {
            // Negative sign: start a new number token if current is non-empty
            // BUT only if the previous char was not 'e' or 'E' (scientific notation)
            if !current.is_empty() {
                let last_ch = current.chars().last().unwrap_or(' ');
                if last_ch == 'e' || last_ch == 'E' {
                    current.push(ch);
                } else {
                    tokens.push(current.clone());
                    current.clear();
                    current.push(ch);
                }
            } else {
                current.push(ch);
            }
        } else if ch == ',' || ch == ' ' || ch == '\t' || ch == '\n' || ch == '\r' {
            if !current.is_empty() {
                tokens.push(current.clone());
                current.clear();
            }
        } else if ch == '.' {
            // A second dot starts a new number (e.g. "1.5.3" -> "1.5", ".3")
            if current.contains('.') {
                tokens.push(current.clone());
                current.clear();
            }
            current.push(ch);
        } else {
            current.push(ch);
        }
        i += 1;
    }
    if !current.is_empty() {
        tokens.push(current);
    }

    // Helper: transform a coordinate
    let tx = |x: f64| -> f64 { x * scale_x + offset_x };
    let ty = |y: f64| -> f64 { y * scale_y + offset_y };

    let mut ti = 0; // token index
    let mut cur_x = 0.0_f64;
    let mut cur_y = 0.0_f64;
    let mut start_x = 0.0_f64;
    let mut start_y = 0.0_f64;
    let mut last_ctrl_x = 0.0_f64;
    let mut last_ctrl_y = 0.0_f64;
    let mut last_cmd = ' ';

    let parse_num = |tokens: &[String], idx: &mut usize| -> Option<f64> {
        if *idx < tokens.len() {
            let val = tokens[*idx].parse::<f64>().ok()?;
            *idx += 1;
            Some(val)
        } else {
            None
        }
    };

    while ti < tokens.len() {
        let tok = &tokens[ti];
        let cmd_char = tok.chars().next().unwrap_or(' ');

        if cmd_char.is_ascii_alphabetic() && tok.len() == 1 {
            ti += 1;
            let cmd = cmd_char;

            match cmd {
                'M' => {
                    // Absolute move-to; subsequent coordinate pairs are implicit line-to
                    let mut first = true;
                    while ti < tokens.len() && !tokens[ti].chars().next().map_or(true, |c| c.is_ascii_alphabetic() && !c.is_ascii_digit() && c != '.') {
                        let x = parse_num(&tokens, &mut ti)?;
                        let y = parse_num(&tokens, &mut ti)?;
                        cur_x = x;
                        cur_y = y;
                        if first {
                            path.move_to(Point::new(tx(x), ty(y)));
                            start_x = x;
                            start_y = y;
                            has_commands = true;
                            first = false;
                        } else {
                            path.line_to(Point::new(tx(x), ty(y)));
                        }
                    }
                    last_cmd = 'M';
                    last_ctrl_x = cur_x;
                    last_ctrl_y = cur_y;
                }
                'm' => {
                    let mut first = true;
                    while ti < tokens.len() && tokens[ti].chars().next().map_or(false, |c| !c.is_ascii_alphabetic() || c == '.' || c == '-') {
                        let dx = parse_num(&tokens, &mut ti)?;
                        let dy = parse_num(&tokens, &mut ti)?;
                        cur_x += dx;
                        cur_y += dy;
                        if first {
                            path.move_to(Point::new(tx(cur_x), ty(cur_y)));
                            start_x = cur_x;
                            start_y = cur_y;
                            has_commands = true;
                            first = false;
                        } else {
                            path.line_to(Point::new(tx(cur_x), ty(cur_y)));
                        }
                    }
                    last_cmd = 'm';
                    last_ctrl_x = cur_x;
                    last_ctrl_y = cur_y;
                }
                'L' => {
                    while ti < tokens.len() && tokens[ti].chars().next().map_or(false, |c| !c.is_ascii_alphabetic() || c == '.' || c == '-') {
                        let x = parse_num(&tokens, &mut ti)?;
                        let y = parse_num(&tokens, &mut ti)?;
                        cur_x = x;
                        cur_y = y;
                        path.line_to(Point::new(tx(x), ty(y)));
                    }
                    last_cmd = 'L';
                    last_ctrl_x = cur_x;
                    last_ctrl_y = cur_y;
                }
                'l' => {
                    while ti < tokens.len() && tokens[ti].chars().next().map_or(false, |c| !c.is_ascii_alphabetic() || c == '.' || c == '-') {
                        let dx = parse_num(&tokens, &mut ti)?;
                        let dy = parse_num(&tokens, &mut ti)?;
                        cur_x += dx;
                        cur_y += dy;
                        path.line_to(Point::new(tx(cur_x), ty(cur_y)));
                    }
                    last_cmd = 'l';
                    last_ctrl_x = cur_x;
                    last_ctrl_y = cur_y;
                }
                'H' => {
                    while ti < tokens.len() && tokens[ti].chars().next().map_or(false, |c| !c.is_ascii_alphabetic() || c == '.' || c == '-') {
                        let x = parse_num(&tokens, &mut ti)?;
                        cur_x = x;
                        path.line_to(Point::new(tx(cur_x), ty(cur_y)));
                    }
                    last_cmd = 'H';
                    last_ctrl_x = cur_x;
                    last_ctrl_y = cur_y;
                }
                'h' => {
                    while ti < tokens.len() && tokens[ti].chars().next().map_or(false, |c| !c.is_ascii_alphabetic() || c == '.' || c == '-') {
                        let dx = parse_num(&tokens, &mut ti)?;
                        cur_x += dx;
                        path.line_to(Point::new(tx(cur_x), ty(cur_y)));
                    }
                    last_cmd = 'h';
                    last_ctrl_x = cur_x;
                    last_ctrl_y = cur_y;
                }
                'V' => {
                    while ti < tokens.len() && tokens[ti].chars().next().map_or(false, |c| !c.is_ascii_alphabetic() || c == '.' || c == '-') {
                        let y = parse_num(&tokens, &mut ti)?;
                        cur_y = y;
                        path.line_to(Point::new(tx(cur_x), ty(cur_y)));
                    }
                    last_cmd = 'V';
                    last_ctrl_x = cur_x;
                    last_ctrl_y = cur_y;
                }
                'v' => {
                    while ti < tokens.len() && tokens[ti].chars().next().map_or(false, |c| !c.is_ascii_alphabetic() || c == '.' || c == '-') {
                        let dy = parse_num(&tokens, &mut ti)?;
                        cur_y += dy;
                        path.line_to(Point::new(tx(cur_x), ty(cur_y)));
                    }
                    last_cmd = 'v';
                    last_ctrl_x = cur_x;
                    last_ctrl_y = cur_y;
                }
                'C' => {
                    while ti < tokens.len() && tokens[ti].chars().next().map_or(false, |c| !c.is_ascii_alphabetic() || c == '.' || c == '-') {
                        let x1 = parse_num(&tokens, &mut ti)?;
                        let y1 = parse_num(&tokens, &mut ti)?;
                        let x2 = parse_num(&tokens, &mut ti)?;
                        let y2 = parse_num(&tokens, &mut ti)?;
                        let x = parse_num(&tokens, &mut ti)?;
                        let y = parse_num(&tokens, &mut ti)?;
                        path.curve_to(
                            Point::new(tx(x1), ty(y1)),
                            Point::new(tx(x2), ty(y2)),
                            Point::new(tx(x), ty(y)),
                        );
                        last_ctrl_x = x2;
                        last_ctrl_y = y2;
                        cur_x = x;
                        cur_y = y;
                    }
                    last_cmd = 'C';
                }
                'c' => {
                    while ti < tokens.len() && tokens[ti].chars().next().map_or(false, |c| !c.is_ascii_alphabetic() || c == '.' || c == '-') {
                        let dx1 = parse_num(&tokens, &mut ti)?;
                        let dy1 = parse_num(&tokens, &mut ti)?;
                        let dx2 = parse_num(&tokens, &mut ti)?;
                        let dy2 = parse_num(&tokens, &mut ti)?;
                        let dx = parse_num(&tokens, &mut ti)?;
                        let dy = parse_num(&tokens, &mut ti)?;
                        let x1 = cur_x + dx1;
                        let y1 = cur_y + dy1;
                        let x2 = cur_x + dx2;
                        let y2 = cur_y + dy2;
                        let x = cur_x + dx;
                        let y = cur_y + dy;
                        path.curve_to(
                            Point::new(tx(x1), ty(y1)),
                            Point::new(tx(x2), ty(y2)),
                            Point::new(tx(x), ty(y)),
                        );
                        last_ctrl_x = x2;
                        last_ctrl_y = y2;
                        cur_x = x;
                        cur_y = y;
                    }
                    last_cmd = 'c';
                }
                'S' => {
                    while ti < tokens.len() && tokens[ti].chars().next().map_or(false, |c| !c.is_ascii_alphabetic() || c == '.' || c == '-') {
                        // Reflect last control point
                        let x1 = if matches!(last_cmd, 'C' | 'c' | 'S' | 's') {
                            2.0 * cur_x - last_ctrl_x
                        } else {
                            cur_x
                        };
                        let y1 = if matches!(last_cmd, 'C' | 'c' | 'S' | 's') {
                            2.0 * cur_y - last_ctrl_y
                        } else {
                            cur_y
                        };
                        let x2 = parse_num(&tokens, &mut ti)?;
                        let y2 = parse_num(&tokens, &mut ti)?;
                        let x = parse_num(&tokens, &mut ti)?;
                        let y = parse_num(&tokens, &mut ti)?;
                        path.curve_to(
                            Point::new(tx(x1), ty(y1)),
                            Point::new(tx(x2), ty(y2)),
                            Point::new(tx(x), ty(y)),
                        );
                        last_ctrl_x = x2;
                        last_ctrl_y = y2;
                        cur_x = x;
                        cur_y = y;
                    }
                    last_cmd = 'S';
                }
                's' => {
                    while ti < tokens.len() && tokens[ti].chars().next().map_or(false, |c| !c.is_ascii_alphabetic() || c == '.' || c == '-') {
                        let x1 = if matches!(last_cmd, 'C' | 'c' | 'S' | 's') {
                            2.0 * cur_x - last_ctrl_x
                        } else {
                            cur_x
                        };
                        let y1 = if matches!(last_cmd, 'C' | 'c' | 'S' | 's') {
                            2.0 * cur_y - last_ctrl_y
                        } else {
                            cur_y
                        };
                        let dx2 = parse_num(&tokens, &mut ti)?;
                        let dy2 = parse_num(&tokens, &mut ti)?;
                        let dx = parse_num(&tokens, &mut ti)?;
                        let dy = parse_num(&tokens, &mut ti)?;
                        let x2 = cur_x + dx2;
                        let y2 = cur_y + dy2;
                        let x = cur_x + dx;
                        let y = cur_y + dy;
                        path.curve_to(
                            Point::new(tx(x1), ty(y1)),
                            Point::new(tx(x2), ty(y2)),
                            Point::new(tx(x), ty(y)),
                        );
                        last_ctrl_x = x2;
                        last_ctrl_y = y2;
                        cur_x = x;
                        cur_y = y;
                    }
                    last_cmd = 's';
                }
                'Q' => {
                    while ti < tokens.len() && tokens[ti].chars().next().map_or(false, |c| !c.is_ascii_alphabetic() || c == '.' || c == '-') {
                        let x1 = parse_num(&tokens, &mut ti)?;
                        let y1 = parse_num(&tokens, &mut ti)?;
                        let x = parse_num(&tokens, &mut ti)?;
                        let y = parse_num(&tokens, &mut ti)?;
                        path.quad_to(
                            Point::new(tx(x1), ty(y1)),
                            Point::new(tx(x), ty(y)),
                        );
                        last_ctrl_x = x1;
                        last_ctrl_y = y1;
                        cur_x = x;
                        cur_y = y;
                    }
                    last_cmd = 'Q';
                }
                'q' => {
                    while ti < tokens.len() && tokens[ti].chars().next().map_or(false, |c| !c.is_ascii_alphabetic() || c == '.' || c == '-') {
                        let dx1 = parse_num(&tokens, &mut ti)?;
                        let dy1 = parse_num(&tokens, &mut ti)?;
                        let dx = parse_num(&tokens, &mut ti)?;
                        let dy = parse_num(&tokens, &mut ti)?;
                        let x1 = cur_x + dx1;
                        let y1 = cur_y + dy1;
                        let x = cur_x + dx;
                        let y = cur_y + dy;
                        path.quad_to(
                            Point::new(tx(x1), ty(y1)),
                            Point::new(tx(x), ty(y)),
                        );
                        last_ctrl_x = x1;
                        last_ctrl_y = y1;
                        cur_x = x;
                        cur_y = y;
                    }
                    last_cmd = 'q';
                }
                'T' => {
                    while ti < tokens.len() && tokens[ti].chars().next().map_or(false, |c| !c.is_ascii_alphabetic() || c == '.' || c == '-') {
                        let x1 = if matches!(last_cmd, 'Q' | 'q' | 'T' | 't') {
                            2.0 * cur_x - last_ctrl_x
                        } else {
                            cur_x
                        };
                        let y1 = if matches!(last_cmd, 'Q' | 'q' | 'T' | 't') {
                            2.0 * cur_y - last_ctrl_y
                        } else {
                            cur_y
                        };
                        let x = parse_num(&tokens, &mut ti)?;
                        let y = parse_num(&tokens, &mut ti)?;
                        path.quad_to(
                            Point::new(tx(x1), ty(y1)),
                            Point::new(tx(x), ty(y)),
                        );
                        last_ctrl_x = x1;
                        last_ctrl_y = y1;
                        cur_x = x;
                        cur_y = y;
                    }
                    last_cmd = 'T';
                }
                't' => {
                    while ti < tokens.len() && tokens[ti].chars().next().map_or(false, |c| !c.is_ascii_alphabetic() || c == '.' || c == '-') {
                        let x1 = if matches!(last_cmd, 'Q' | 'q' | 'T' | 't') {
                            2.0 * cur_x - last_ctrl_x
                        } else {
                            cur_x
                        };
                        let y1 = if matches!(last_cmd, 'Q' | 'q' | 'T' | 't') {
                            2.0 * cur_y - last_ctrl_y
                        } else {
                            cur_y
                        };
                        let dx = parse_num(&tokens, &mut ti)?;
                        let dy = parse_num(&tokens, &mut ti)?;
                        let x = cur_x + dx;
                        let y = cur_y + dy;
                        path.quad_to(
                            Point::new(tx(x1), ty(y1)),
                            Point::new(tx(x), ty(y)),
                        );
                        last_ctrl_x = x1;
                        last_ctrl_y = y1;
                        cur_x = x;
                        cur_y = y;
                    }
                    last_cmd = 't';
                }
                'A' | 'a' => {
                    // Arc: approximate with line-to for now (full arc support is complex)
                    let is_relative = cmd == 'a';
                    while ti < tokens.len() && tokens[ti].chars().next().map_or(false, |c| !c.is_ascii_alphabetic() || c == '.' || c == '-') {
                        let _rx = parse_num(&tokens, &mut ti)?;
                        let _ry = parse_num(&tokens, &mut ti)?;
                        let _x_rot = parse_num(&tokens, &mut ti)?;
                        let _large_arc = parse_num(&tokens, &mut ti)?;
                        let _sweep = parse_num(&tokens, &mut ti)?;
                        let ex = parse_num(&tokens, &mut ti)?;
                        let ey = parse_num(&tokens, &mut ti)?;
                        if is_relative {
                            cur_x += ex;
                            cur_y += ey;
                        } else {
                            cur_x = ex;
                            cur_y = ey;
                        }
                        // Approximate arc as line to endpoint
                        path.line_to(Point::new(tx(cur_x), ty(cur_y)));
                    }
                    last_cmd = cmd;
                    last_ctrl_x = cur_x;
                    last_ctrl_y = cur_y;
                }
                'Z' | 'z' => {
                    path.close_path();
                    cur_x = start_x;
                    cur_y = start_y;
                    last_cmd = 'Z';
                    last_ctrl_x = cur_x;
                    last_ctrl_y = cur_y;
                }
                _ => {
                    // Unknown command, skip
                    ti += 1;
                }
            }
        } else {
            // Stray number without command — skip it
            ti += 1;
        }
    }

    if has_commands {
        Some(path)
    } else {
        None
    }
}

/// Parse a font-size CSS value to pixels, supporting px, rem, and em units.
/// Root em = 16px (browser default).
fn parse_font_size_value(v: &str) -> Option<f32> {
    let v = v.trim();
    if let Some(n) = v.strip_suffix("px") {
        return n.trim().parse::<f32>().ok();
    }
    if let Some(n) = v.strip_suffix("rem") {
        return n.trim().parse::<f32>().ok().map(|x| x * 16.0);
    }
    if let Some(n) = v.strip_suffix("em") {
        return n.trim().parse::<f32>().ok().map(|x| x * 16.0);
    }
    // Bare number (unlikely but handle gracefully)
    v.parse::<f32>().ok()
}

fn parse_color(styles: &std::collections::HashMap<String, String>) -> Color {
    let s = styles.get("color").map(|s| s.as_str()).unwrap_or("#000000");
    parse_css_color(s).unwrap_or(Color::from_rgba8(0x00, 0x00, 0x00, 0xff))
}

fn hsl_to_rgb(h: f32, s: f32, l: f32) -> (u8, u8, u8) {
    let c = (1.0 - (2.0 * l - 1.0).abs()) * s;
    let x = c * (1.0 - ((h / 60.0) % 2.0 - 1.0).abs());
    let m = l - c / 2.0;
    let (r1, g1, b1) = match h as u32 {
        0..=59 => (c, x, 0.0_f32),
        60..=119 => (x, c, 0.0),
        120..=179 => (0.0, c, x),
        180..=239 => (0.0, x, c),
        240..=299 => (x, 0.0, c),
        _ => (c, 0.0, x),
    };
    (
        ((r1 + m) * 255.0).round().clamp(0.0, 255.0) as u8,
        ((g1 + m) * 255.0).round().clamp(0.0, 255.0) as u8,
        ((b1 + m) * 255.0).round().clamp(0.0, 255.0) as u8,
    )
}

/// oklch(L C H) → RGB u8 triple.
/// Uses the standard oklch → oklab → linear-sRGB → sRGB pipeline.
fn oklch_to_rgb(l: f32, c: f32, h_deg: f32) -> (u8, u8, u8) {
    let h = h_deg.to_radians();
    // oklab
    let a = c * h.cos();
    let b = c * h.sin();
    // oklab → linear sRGB (via LMS)
    let l_ = l + 0.396_337_78 * a + 0.215_803_76 * b;
    let m_ = l - 0.105_561_346 * a - 0.063_854_17 * b;
    let s_ = l - 0.089_484_18 * a - 1.291_485_5 * b;
    let lv = l_ * l_ * l_;
    let mv = m_ * m_ * m_;
    let sv = s_ * s_ * s_;
    let r_lin = 4.076_741_7 * lv - 3.307_711_6 * mv + 0.230_969_94 * sv;
    let g_lin = -1.268_438 * lv + 2.609_757_4 * mv - 0.341_319_38 * sv;
    let b_lin = -0.0041960863 * lv - 0.703_418_6 * mv + 1.707_614_7 * sv;
    // linear sRGB → gamma-corrected sRGB
    let to_u8 = |v: f32| -> u8 {
        let v = v.clamp(0.0, 1.0);
        let srgb = if v <= 0.0031308 {
            12.92 * v
        } else {
            1.055 * v.powf(1.0 / 2.4) - 0.055
        };
        (srgb * 255.0).round().clamp(0.0, 255.0) as u8
    };
    (to_u8(r_lin), to_u8(g_lin), to_u8(b_lin))
}

/// Parse a CSS `linear-gradient(direction, color1, color2, ...)` into a Vello `Gradient`.
/// `w` and `h` are the element dimensions used to compute start/end points.
fn parse_linear_gradient(s: &str, w: f32, h: f32) -> Option<Gradient> {
    let s = s.trim();
    let inner = s.strip_prefix("linear-gradient(")?.strip_suffix(')')?;

    // Split on commas, but respect parentheses (for rgb()/hsl() colors)
    let mut parts: Vec<String> = Vec::new();
    let mut depth = 0usize;
    let mut current = String::new();
    for ch in inner.chars() {
        match ch {
            '(' => {
                depth += 1;
                current.push(ch);
            }
            ')' => {
                depth = depth.saturating_sub(1);
                current.push(ch);
            }
            ',' if depth == 0 => {
                parts.push(current.trim().to_string());
                current.clear();
            }
            _ => current.push(ch),
        }
    }
    if !current.trim().is_empty() {
        parts.push(current.trim().to_string());
    }
    if parts.len() < 2 {
        return None;
    }

    // Parse direction (first part may be a direction or a color stop)
    let (start, end, color_start_idx) = {
        let first = parts[0].trim();
        if let Some(stripped) = first.strip_prefix("to ") {
            let dir = &stripped.trim();
            let (s, e) = match *dir {
                "right" => (Point::new(0.0, 0.0), Point::new(w as f64, 0.0)),
                "left" => (Point::new(w as f64, 0.0), Point::new(0.0, 0.0)),
                "bottom" => (Point::new(0.0, 0.0), Point::new(0.0, h as f64)),
                "top" => (Point::new(0.0, h as f64), Point::new(0.0, 0.0)),
                "bottom right" => (Point::new(0.0, 0.0), Point::new(w as f64, h as f64)),
                "top right" => (Point::new(0.0, h as f64), Point::new(w as f64, 0.0)),
                "bottom left" => (Point::new(w as f64, 0.0), Point::new(0.0, h as f64)),
                "top left" => (Point::new(w as f64, h as f64), Point::new(0.0, 0.0)),
                _ => (Point::new(0.0, 0.0), Point::new(0.0, h as f64)),
            };
            (s, e, 1)
        } else if first.ends_with("deg") {
            let deg: f64 = first
                .trim_end_matches("deg")
                .trim()
                .parse()
                .unwrap_or(180.0);
            // CSS gradient angles: 0deg = to top, 90deg = to right, 180deg = to bottom
            let rad = (deg - 90.0).to_radians();
            let cx = w as f64 / 2.0;
            let cy = h as f64 / 2.0;
            // Half-diagonal projection
            let half_len = (w as f64 / 2.0) * rad.cos().abs() + (h as f64 / 2.0) * rad.sin().abs();
            let dx = rad.cos() * half_len;
            let dy = rad.sin() * half_len;
            (
                Point::new(cx - dx, cy - dy),
                Point::new(cx + dx, cy + dy),
                1,
            )
        } else {
            // No direction specified — default is "to bottom"
            (Point::new(0.0, 0.0), Point::new(0.0, h as f64), 0)
        }
    };

    let color_parts = &parts[color_start_idx..];
    if color_parts.len() < 2 {
        return None;
    }

    // Parse color stops
    let mut stops: Vec<(f32, Color)> = Vec::new();
    for (i, part) in color_parts.iter().enumerate() {
        let part = part.trim();
        // A color stop can be "color" or "color offset%/px"
        // Try parsing the whole thing as a color first
        if let Some(c) = parse_css_color(part) {
            let offset = i as f32 / (color_parts.len() - 1).max(1) as f32;
            stops.push((offset, c));
        } else {
            // Try splitting last token as offset
            let tokens: Vec<&str> = part.rsplitn(2, ' ').collect();
            if tokens.len() == 2 {
                let offset_str = tokens[0].trim();
                let color_str = tokens[1].trim();
                let offset = if offset_str.ends_with('%') {
                    offset_str
                        .trim_end_matches('%')
                        .parse::<f32>()
                        .unwrap_or(0.0)
                        / 100.0
                } else if offset_str.ends_with("px") {
                    // px offset relative to gradient line length
                    let line_len = ((end.x - start.x).powi(2) + (end.y - start.y).powi(2)).sqrt();
                    if line_len > 0.0 {
                        offset_str
                            .trim_end_matches("px")
                            .parse::<f32>()
                            .unwrap_or(0.0)
                            / line_len as f32
                    } else {
                        0.0
                    }
                } else {
                    i as f32 / (color_parts.len() - 1).max(1) as f32
                };
                if let Some(c) = parse_css_color(color_str) {
                    stops.push((offset.clamp(0.0, 1.0), c));
                }
            }
        }
    }
    if stops.len() < 2 {
        return None;
    }

    let gradient = Gradient::new_linear(start, end).with_stops(stops.as_slice());
    Some(gradient)
}

fn parse_css_color(s: &str) -> Option<Color> {
    let s = s.trim();
    if s == "none" {
        return None;
    }

    // color-mix(in <colorspace>, <color1> [<pct1>%], <color2> [<pct2>%])
    // Tailwind v4 uses e.g. color-mix(in oklab, oklch(...) 10%, transparent)
    if s.starts_with("color-mix(") {
        return parse_color_mix(s);
    }

    // rgb(r g b) / rgb(r, g, b) / rgba(r, g, b, a)
    if s.starts_with("rgb") {
        let inner = s
            .trim_start_matches("rgba(")
            .trim_start_matches("rgb(")
            .trim_end_matches(')');
        // Support both comma and space separation, plus `/` alpha syntax:
        // rgb(55, 65, 81)  rgb(55 65 81)  rgb(55 65 81 / 1)  rgb(55 65 81 / 0.5)
        let (rgb_part, alpha_part) = if let Some(slash_idx) = inner.find('/') {
            (&inner[..slash_idx], Some(inner[slash_idx + 1..].trim()))
        } else {
            (inner, None)
        };
        let parts: Vec<&str> = if rgb_part.contains(',') {
            rgb_part.split(',').map(|s| s.trim()).collect()
        } else {
            rgb_part.split_whitespace().collect()
        };
        if parts.len() >= 3 {
            let r = parts[0].trim().parse::<f32>().ok()? as u8;
            let g = parts[1].trim().parse::<f32>().ok()? as u8;
            let b = parts[2].trim().parse::<f32>().ok()? as u8;
            let a = if let Some(av) = alpha_part {
                // alpha from `/` separator: rgb(R G B / alpha)
                let f = av.parse::<f32>().ok()?;
                if f <= 1.0 { (f * 255.0) as u8 } else { f as u8 }
            } else if parts.len() >= 4 {
                let av = parts[3].trim();
                let f = av.parse::<f32>().ok()?;
                if f <= 1.0 { (f * 255.0) as u8 } else { f as u8 }
            } else {
                0xff
            };
            return Some(Color::from_rgba8(r, g, b, a));
        }
    }

    // hsl(h, s%, l%) / hsla(h, s%, l%, a) — comma or space separated
    if s.starts_with("hsl") {
        let inner = s
            .trim_start_matches("hsla(")
            .trim_start_matches("hsl(")
            .trim_end_matches(')');
        let parts: Vec<&str> = if inner.contains(',') {
            inner.split(',').collect()
        } else {
            inner.split_whitespace().collect()
        };
        if parts.len() >= 3 {
            let h = parts[0]
                .trim()
                .trim_end_matches("deg")
                .parse::<f32>()
                .ok()?;
            let s = parts[1].trim().trim_end_matches('%').parse::<f32>().ok()? / 100.0;
            let l = parts[2].trim().trim_end_matches('%').parse::<f32>().ok()? / 100.0;
            let a = if parts.len() >= 4 {
                let av = parts[3].trim().trim_end_matches('%');
                let f = av.parse::<f32>().ok()?;
                if f <= 1.0 {
                    (f * 255.0) as u8
                } else {
                    (f * 2.55) as u8
                }
            } else {
                0xff
            };
            let (r, g, b) = hsl_to_rgb(h, s, l);
            return Some(Color::from_rgba8(r, g, b, a));
        }
    }

    // oklch(L% C H [/ A]) — Tailwind v4 default color format
    // L: 0-1 or 0%-100%, C: chroma (0-0.4 typical), H: hue degrees (0-360)
    if s.starts_with("oklch(") {
        let inner = &s[6..s.len().saturating_sub(1)];
        // Split on '/' for alpha, then parse L C H
        let (lch_part, alpha_part) = if let Some(slash) = inner.find('/') {
            (&inner[..slash], Some(inner[slash + 1..].trim()))
        } else {
            (inner, None)
        };
        let parts: Vec<&str> = lch_part.split_whitespace().collect();
        if parts.len() >= 3 {
            let l_str = parts[0].trim().trim_end_matches('%');
            let c_str = parts[1].trim();
            let h_str = parts[2].trim();
            if let (Ok(mut l), Ok(c), Ok(h)) = (
                l_str.parse::<f32>(),
                c_str.parse::<f32>(),
                h_str.parse::<f32>(),
            ) {
                // If L was given as percentage like "21%", normalize to 0-1
                if parts[0].ends_with('%') {
                    l /= 100.0;
                }
                let a = alpha_part
                    .and_then(|av| {
                        let av = av.trim_end_matches('%');
                        av.parse::<f32>().ok().map(|f| {
                            if f <= 1.0 {
                                (f * 255.0) as u8
                            } else {
                                (f * 2.55) as u8
                            }
                        })
                    })
                    .unwrap_or(0xff);
                let (r, g, b) = oklch_to_rgb(l, c, h);
                return Some(Color::from_rgba8(r, g, b, a));
            }
        }
    }

    // hex
    if let Some(stripped) = s.strip_prefix('#') {
        return parse_hex_color(stripped);
    }

    // CSS named colors (W3C full list subset — most common in practice)
    match s {
        "transparent" => Some(Color::from_rgba8(0x00, 0x00, 0x00, 0x00)),
        "white" => Some(Color::from_rgba8(0xff, 0xff, 0xff, 0xff)),
        "black" => Some(Color::from_rgba8(0x00, 0x00, 0x00, 0xff)),
        "red" => Some(Color::from_rgba8(0xff, 0x00, 0x00, 0xff)),
        "green" => Some(Color::from_rgba8(0x00, 0x80, 0x00, 0xff)),
        "lime" => Some(Color::from_rgba8(0x00, 0xff, 0x00, 0xff)),
        "blue" => Some(Color::from_rgba8(0x00, 0x00, 0xff, 0xff)),
        "yellow" => Some(Color::from_rgba8(0xff, 0xff, 0x00, 0xff)),
        "cyan" | "aqua" => Some(Color::from_rgba8(0x00, 0xff, 0xff, 0xff)),
        "magenta" | "fuchsia" => Some(Color::from_rgba8(0xff, 0x00, 0xff, 0xff)),
        "orange" => Some(Color::from_rgba8(0xff, 0xa5, 0x00, 0xff)),
        "orangered" => Some(Color::from_rgba8(0xff, 0x45, 0x00, 0xff)),
        "pink" => Some(Color::from_rgba8(0xff, 0xc0, 0xcb, 0xff)),
        "hotpink" => Some(Color::from_rgba8(0xff, 0x69, 0xb4, 0xff)),
        "deeppink" => Some(Color::from_rgba8(0xff, 0x14, 0x93, 0xff)),
        "purple" => Some(Color::from_rgba8(0x80, 0x00, 0x80, 0xff)),
        "violet" => Some(Color::from_rgba8(0xee, 0x82, 0xee, 0xff)),
        "indigo" => Some(Color::from_rgba8(0x4b, 0x00, 0x82, 0xff)),
        "brown" => Some(Color::from_rgba8(0xa5, 0x2a, 0x2a, 0xff)),
        "chocolate" => Some(Color::from_rgba8(0xd2, 0x69, 0x1e, 0xff)),
        "coral" => Some(Color::from_rgba8(0xff, 0x7f, 0x50, 0xff)),
        "crimson" => Some(Color::from_rgba8(0xdc, 0x14, 0x3c, 0xff)),
        "darkblue" => Some(Color::from_rgba8(0x00, 0x00, 0x8b, 0xff)),
        "darkcyan" => Some(Color::from_rgba8(0x00, 0x8b, 0x8b, 0xff)),
        "darkgray" | "darkgrey" => Some(Color::from_rgba8(0xa9, 0xa9, 0xa9, 0xff)),
        "darkgreen" => Some(Color::from_rgba8(0x00, 0x64, 0x00, 0xff)),
        "darkred" => Some(Color::from_rgba8(0x8b, 0x00, 0x00, 0xff)),
        "darkorange" => Some(Color::from_rgba8(0xff, 0x8c, 0x00, 0xff)),
        "darkviolet" => Some(Color::from_rgba8(0x94, 0x00, 0xd3, 0xff)),
        "deepskyblue" => Some(Color::from_rgba8(0x00, 0xbf, 0xff, 0xff)),
        "dodgerblue" => Some(Color::from_rgba8(0x1e, 0x90, 0xff, 0xff)),
        "forestgreen" => Some(Color::from_rgba8(0x22, 0x8b, 0x22, 0xff)),
        "gold" => Some(Color::from_rgba8(0xff, 0xd7, 0x00, 0xff)),
        "goldenrod" => Some(Color::from_rgba8(0xda, 0xa5, 0x20, 0xff)),
        "gray" | "grey" => Some(Color::from_rgba8(0x80, 0x80, 0x80, 0xff)),
        "lightgray" | "lightgrey" => Some(Color::from_rgba8(0xd3, 0xd3, 0xd3, 0xff)),
        "lightblue" => Some(Color::from_rgba8(0xad, 0xd8, 0xe6, 0xff)),
        "lightcoral" => Some(Color::from_rgba8(0xf0, 0x80, 0x80, 0xff)),
        "lightgreen" => Some(Color::from_rgba8(0x90, 0xee, 0x90, 0xff)),
        "lightpink" => Some(Color::from_rgba8(0xff, 0xb6, 0xc1, 0xff)),
        "lightyellow" => Some(Color::from_rgba8(0xff, 0xff, 0xe0, 0xff)),
        "limegreen" => Some(Color::from_rgba8(0x32, 0xcd, 0x32, 0xff)),
        "maroon" => Some(Color::from_rgba8(0x80, 0x00, 0x00, 0xff)),
        "mediumblue" => Some(Color::from_rgba8(0x00, 0x00, 0xcd, 0xff)),
        "mediumpurple" => Some(Color::from_rgba8(0x93, 0x70, 0xdb, 0xff)),
        "mediumseagreen" => Some(Color::from_rgba8(0x3c, 0xb3, 0x71, 0xff)),
        "navy" => Some(Color::from_rgba8(0x00, 0x00, 0x80, 0xff)),
        "olive" => Some(Color::from_rgba8(0x80, 0x80, 0x00, 0xff)),
        "olivedrab" => Some(Color::from_rgba8(0x6b, 0x8e, 0x23, 0xff)),
        "royalblue" => Some(Color::from_rgba8(0x41, 0x69, 0xe1, 0xff)),
        "salmon" => Some(Color::from_rgba8(0xfa, 0x80, 0x72, 0xff)),
        "seagreen" => Some(Color::from_rgba8(0x2e, 0x8b, 0x57, 0xff)),
        "silver" => Some(Color::from_rgba8(0xc0, 0xc0, 0xc0, 0xff)),
        "skyblue" => Some(Color::from_rgba8(0x87, 0xce, 0xeb, 0xff)),
        "slateblue" => Some(Color::from_rgba8(0x6a, 0x5a, 0xcd, 0xff)),
        "slategray" | "slategrey" => Some(Color::from_rgba8(0x70, 0x80, 0x90, 0xff)),
        "steelblue" => Some(Color::from_rgba8(0x46, 0x82, 0xb4, 0xff)),
        "teal" => Some(Color::from_rgba8(0x00, 0x80, 0x80, 0xff)),
        "tomato" => Some(Color::from_rgba8(0xff, 0x63, 0x47, 0xff)),
        "turquoise" => Some(Color::from_rgba8(0x40, 0xe0, 0xd0, 0xff)),
        "wheat" => Some(Color::from_rgba8(0xf5, 0xde, 0xb3, 0xff)),
        "yellowgreen" => Some(Color::from_rgba8(0x9a, 0xcd, 0x32, 0xff)),
        _ => None,
    }
}

/// Parse `color-mix(in <space>, <color1> [<pct>%], <color2> [<pct>%])`.
///
/// Handles the common Tailwind v4 patterns:
///   - `color-mix(in oklab, oklch(57.7% .245 27.325) 10%, transparent)` → color at 10% opacity
///   - `color-mix(in oklab, transparent, oklch(...) 50%)` → color at 50% opacity
///   - `color-mix(in oklab, <color1> P1%, <color2> P2%)` → linear mix of two concrete colors
///
/// For `currentcolor` (unresolvable here), falls back to a mid-gray placeholder.
fn parse_color_mix(s: &str) -> Option<Color> {
    // Strip "color-mix(" prefix and trailing ")"
    let inner = s
        .strip_prefix("color-mix(")?
        .strip_suffix(')')?
        .trim();

    // Split on first comma to get the color-space, then the two color stops
    let (space_part, rest) = inner.split_once(',')?;
    let _space = space_part.trim(); // "in oklab", "in srgb", etc. — ignored for now

    // Split remaining into two color stops on the top-level comma
    // Need to respect nested parens: oklch(57.7% .245 27.325) contains no commas,
    // but rgb(255, 0, 0) does. Walk to find the splitting comma.
    let rest = rest.trim();
    let split_idx = find_top_level_comma(rest)?;
    let stop1 = rest[..split_idx].trim();
    let stop2 = rest[split_idx + 1..].trim();

    // Parse each stop into (Option<Color>, percentage 0.0-1.0)
    let (c1, p1) = parse_color_stop(stop1);
    let (c2, p2) = parse_color_stop(stop2);

    // Normalize percentages: if only one is specified, the other = 100% - that one.
    // If neither is specified, both default to 50%.
    let (pct1, pct2) = match (p1, p2) {
        (Some(a), Some(b)) => (a, b),
        (Some(a), None) => (a, 1.0 - a),
        (None, Some(b)) => (1.0 - b, b),
        (None, None) => (0.5, 0.5),
    };

    // Resolve colors — currentcolor/unresolvable get a mid-gray placeholder
    let fallback = Color::from_rgba8(128, 128, 128, 255);
    let color1 = c1.unwrap_or(fallback);
    let color2 = c2.unwrap_or(fallback);

    // Linear mix in sRGB (good enough for rendering — true oklab would need
    // conversion but the visual difference is minimal for UI work)
    let [r1, g1, b1, a1] = color1.components;
    let [r2, g2, b2, a2] = color2.components;
    let r = r1 * pct1 + r2 * pct2;
    let g = g1 * pct1 + g2 * pct2;
    let b = b1 * pct1 + b2 * pct2;
    let a = a1 * pct1 + a2 * pct2;
    Some(Color::new([r.clamp(0.0, 1.0), g.clamp(0.0, 1.0), b.clamp(0.0, 1.0), a.clamp(0.0, 1.0)]))
}

/// Find the index of the first top-level comma (depth 0) in a string,
/// skipping commas inside parenthesized expressions.
fn find_top_level_comma(s: &str) -> Option<usize> {
    let mut depth = 0;
    for (i, ch) in s.char_indices() {
        match ch {
            '(' => depth += 1,
            ')' => depth -= 1,
            ',' if depth == 0 => return Some(i),
            _ => {}
        }
    }
    None
}

/// Parse a color-mix stop like `oklch(57.7% .245 27.325) 10%` or `transparent`
/// into (Option<Color>, Option<percentage as 0.0-1.0>).
fn parse_color_stop(s: &str) -> (Option<Color>, Option<f32>) {
    let s = s.trim();

    // Check for a trailing percentage: "... NN%"
    // But be careful not to confuse with percentages inside color functions like oklch(57.7% ...)
    // Strategy: find the last token; if it's "NN%" and not inside parens, it's the mix percentage.
    let last_paren_close = s.rfind(')');
    let last_pct = s.rfind('%');

    let (color_str, pct) = match (last_paren_close, last_pct) {
        (Some(paren_pos), Some(pct_pos)) if pct_pos > paren_pos => {
            // Percentage is after the last closing paren — it's the mix percentage
            // Walk backwards from pct_pos to find start of number
            let before_pct = &s[..pct_pos];
            let num_start = before_pct
                .rfind(|c: char| !c.is_ascii_digit() && c != '.')
                .map(|i| i + 1)
                .unwrap_or(0);
            let num_str = &s[num_start..pct_pos];
            let pct_val = num_str.parse::<f32>().ok().map(|v| v / 100.0);
            let color_part = s[..num_start].trim().trim_end();
            (color_part, pct_val)
        }
        (None, Some(pct_pos)) => {
            // No parens at all — check if the whole thing is like "transparent 50%"
            let before_pct = &s[..pct_pos];
            let num_start = before_pct
                .rfind(|c: char| !c.is_ascii_digit() && c != '.')
                .map(|i| i + 1)
                .unwrap_or(0);
            let num_str = &s[num_start..pct_pos];
            let pct_val = num_str.parse::<f32>().ok().map(|v| v / 100.0);
            let color_part = s[..num_start].trim();
            (color_part, pct_val)
        }
        _ => (s, None),
    };

    let color = if color_str.is_empty()
        || color_str == "currentcolor"
        || color_str == "currentColor"
    {
        None // unresolvable
    } else {
        parse_css_color(color_str)
    };

    (color, pct)
}

fn parse_hex_color(s: &str) -> Option<Color> {
    match s.len() {
        6 => {
            let r = u8::from_str_radix(&s[0..2], 16).ok()?;
            let g = u8::from_str_radix(&s[2..4], 16).ok()?;
            let b = u8::from_str_radix(&s[4..6], 16).ok()?;
            Some(Color::from_rgba8(r, g, b, 0xff))
        }
        8 => {
            let r = u8::from_str_radix(&s[0..2], 16).ok()?;
            let g = u8::from_str_radix(&s[2..4], 16).ok()?;
            let b = u8::from_str_radix(&s[4..6], 16).ok()?;
            let a = u8::from_str_radix(&s[6..8], 16).ok()?;
            Some(Color::from_rgba8(r, g, b, a))
        }
        3 => {
            let r = u8::from_str_radix(&s[0..1], 16).ok()? * 17;
            let g = u8::from_str_radix(&s[1..2], 16).ok()? * 17;
            let b = u8::from_str_radix(&s[2..3], 16).ok()? * 17;
            Some(Color::from_rgba8(r, g, b, 0xff))
        }
        4 => {
            // #RGBA shorthand — each digit is doubled (e.g. #0009 = #000000 99)
            let r = u8::from_str_radix(&s[0..1], 16).ok()? * 17;
            let g = u8::from_str_radix(&s[1..2], 16).ok()? * 17;
            let b = u8::from_str_radix(&s[2..3], 16).ok()? * 17;
            let a = u8::from_str_radix(&s[3..4], 16).ok()? * 17;
            Some(Color::from_rgba8(r, g, b, a))
        }
        _ => None,
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use rvst_core::{NodeId, NodeType, Op, Rect};
    use rvst_tree::Tree;

    fn make_text_tree() -> Tree {
        let mut tree = Tree::new();
        tree.apply(Op::CreateNode {
            id: NodeId(1),
            node_type: NodeType::Text,
        });
        tree.apply(Op::SetText {
            id: NodeId(1),
            value: "Hello".into(),
        });
        tree.apply(Op::Insert {
            parent: NodeId(0),
            child: NodeId(1),
            anchor: None,
        });
        tree.set_layout(
            NodeId(1),
            Rect {
                x: 0.0,
                y: 0.0,
                w: 200.0,
                h: 40.0,
            },
        );
        tree
    }

    #[test]
    fn build_scene_does_not_panic() {
        let tree = make_text_tree();
        let mut tr = rvst_text::TextRenderer::new();
        let roots = vec![NodeId(1)];
        // Just verify it does not panic — GPU scene contents are not testable without GPU
        let _scene = build_scene(&tree, &roots, &mut tr, 200, 40, 1.0);
    }

    #[test]
    fn parse_css_color_named_colors() {
        assert!(parse_css_color("orange").is_some());
        assert!(parse_css_color("tomato").is_some());
        assert!(parse_css_color("teal").is_some());
        assert!(parse_css_color("transparent").is_some());
        let t = parse_css_color("transparent").unwrap();
        // transparent should have zero alpha
        assert_eq!(t, Color::from_rgba8(0, 0, 0, 0));
        assert!(parse_css_color("unknownxyz").is_none());
    }

    #[test]
    fn parse_css_color_oklch() {
        // Helper: extract (r, g, b) as u8 from Color's f32 components
        let ch = |c: Color| -> (u8, u8, u8) {
            let [r, g, b, _] = c.components;
            (
                (r * 255.0).round() as u8,
                (g * 255.0).round() as u8,
                (b * 255.0).round() as u8,
            )
        };
        // oklch(0% 0 0) = black
        let (r, g, b) = ch(parse_css_color("oklch(0% 0 0)").unwrap());
        assert!(
            r < 5 && g < 5 && b < 5,
            "oklch black should be near 0,0,0 got {r},{g},{b}"
        );
        // oklch(100% 0 0) = white
        let (r, g, b) = ch(parse_css_color("oklch(100% 0 0)").unwrap());
        assert!(
            r > 250 && g > 250 && b > 250,
            "oklch white should be near 255,255,255 got {r},{g},{b}"
        );
        // Tailwind zinc-950: oklch(14.1% .005 285.823) — very dark
        let (r, g, b) = ch(parse_css_color("oklch(14.1% .005 285.823)").unwrap());
        assert!(
            r < 50 && g < 50 && b < 50,
            "zinc-950 should be very dark, got {r},{g},{b}"
        );
        // Tailwind zinc-100: oklch(96.7% .001 286.375) — very light
        let (r, g, b) = ch(parse_css_color("oklch(96.7% .001 286.375)").unwrap());
        assert!(
            r > 200 && g > 200 && b > 200,
            "zinc-100 should be very light, got {r},{g},{b}"
        );
        // red-600: oklch(57.7% .245 27.325) — dominant red channel
        let (r, g, b) = ch(parse_css_color("oklch(57.7% .245 27.325)").unwrap());
        assert!(
            r > g && r > b,
            "red-600 should have dominant red channel, got {r},{g},{b}"
        );
    }

    #[test]
    fn parse_css_color_hsl() {
        // hsl(0, 100%, 50%) = pure red
        let red = parse_css_color("hsl(0, 100%, 50%)").unwrap();
        assert_eq!(red, Color::from_rgba8(255, 0, 0, 255));
        // hsl(120, 100%, 50%) = pure green
        let green = parse_css_color("hsl(120, 100%, 50%)").unwrap();
        assert_eq!(green, Color::from_rgba8(0, 255, 0, 255));
        // hsl(240, 100%, 50%) = pure blue
        let blue = parse_css_color("hsl(240, 100%, 50%)").unwrap();
        assert_eq!(blue, Color::from_rgba8(0, 0, 255, 255));
        // hsla with alpha
        let semi = parse_css_color("hsla(0, 100%, 50%, 0.5)").unwrap();
        assert_eq!(semi, Color::from_rgba8(255, 0, 0, 127));
    }

    #[test]
    fn parse_css_color_color_mix_transparent() {
        // color-mix(in oklab, red 50%, transparent) → red at 50% alpha
        let c = parse_css_color("color-mix(in oklab, red 50%, transparent)").unwrap();
        let [r, g, b, a] = c.components;
        // red channel ~0.5 (50% of 1.0), alpha ~0.5 (50% of 1.0 mixed with 0.0)
        assert!(r > 0.3, "expected red component > 0.3, got {r}");
        assert!(g < 0.1, "expected green < 0.1, got {g}");
        assert!(b < 0.1, "expected blue < 0.1, got {b}");
        assert!(a > 0.3 && a < 0.7, "expected alpha ~0.5, got {a}");
    }

    #[test]
    fn parse_css_color_color_mix_oklch_transparent() {
        // Tailwind pattern: color-mix(in oklab, oklch(57.7% .245 27.325) 10%, transparent)
        let c = parse_css_color(
            "color-mix(in oklab, oklch(57.7% .245 27.325) 10%, transparent)",
        )
        .unwrap();
        let [_, _, _, a] = c.components;
        // 10% of a fully opaque color mixed with transparent → alpha ~0.1
        assert!(a < 0.2, "expected alpha ~0.1, got {a}");
    }

    #[test]
    fn parse_css_color_color_mix_two_colors() {
        // 50/50 mix of red and blue
        let c = parse_css_color("color-mix(in srgb, red, blue)").unwrap();
        let [r, _, b, a] = c.components;
        // Both should contribute ~50%
        assert!(r > 0.3, "expected red > 0.3, got {r}");
        assert!(b > 0.3, "expected blue > 0.3, got {b}");
        assert!(a > 0.9, "expected alpha ~1.0, got {a}");
    }

    #[test]
    fn parse_css_color_color_mix_currentcolor() {
        // currentcolor is unresolvable — should still return Some (gray fallback)
        let c = parse_css_color("color-mix(in oklab, currentcolor 50%, transparent)");
        assert!(c.is_some(), "color-mix with currentcolor should return Some");
    }

    #[test]
    fn text_align_center_does_not_panic() {
        // Verify that a text node whose parent has text-align:center builds a scene without panic.
        // Exact pixel position is untestable without a GPU, but the measure→shape path must work.
        let mut tree = Tree::new();
        tree.apply(Op::CreateNode {
            id: NodeId(10),
            node_type: NodeType::View,
        });
        tree.apply(Op::SetStyle {
            id: NodeId(10),
            key: "text-align".into(),
            value: "center".into(),
        });
        tree.apply(Op::CreateNode {
            id: NodeId(11),
            node_type: NodeType::Text,
        });
        tree.apply(Op::SetText {
            id: NodeId(11),
            value: "Centered".into(),
        });
        tree.apply(Op::Insert {
            parent: NodeId(0),
            child: NodeId(10),
            anchor: None,
        });
        tree.apply(Op::Insert {
            parent: NodeId(10),
            child: NodeId(11),
            anchor: None,
        });
        tree.set_layout(
            NodeId(10),
            Rect {
                x: 0.0,
                y: 0.0,
                w: 400.0,
                h: 60.0,
            },
        );
        tree.set_layout(
            NodeId(11),
            Rect {
                x: 0.0,
                y: 0.0,
                w: 400.0,
                h: 60.0,
            },
        );
        let mut tr = rvst_text::TextRenderer::new();
        let _scene = build_scene(&tree, &[NodeId(10)], &mut tr, 400, 60, 1.0);
    }

    #[test]
    fn text_align_right_does_not_panic() {
        let mut tree = Tree::new();
        tree.apply(Op::CreateNode {
            id: NodeId(20),
            node_type: NodeType::View,
        });
        tree.apply(Op::SetStyle {
            id: NodeId(20),
            key: "text-align".into(),
            value: "right".into(),
        });
        tree.apply(Op::CreateNode {
            id: NodeId(21),
            node_type: NodeType::Text,
        });
        tree.apply(Op::SetText {
            id: NodeId(21),
            value: "Right".into(),
        });
        tree.apply(Op::Insert {
            parent: NodeId(0),
            child: NodeId(20),
            anchor: None,
        });
        tree.apply(Op::Insert {
            parent: NodeId(20),
            child: NodeId(21),
            anchor: None,
        });
        tree.set_layout(
            NodeId(20),
            Rect {
                x: 0.0,
                y: 0.0,
                w: 400.0,
                h: 60.0,
            },
        );
        tree.set_layout(
            NodeId(21),
            Rect {
                x: 0.0,
                y: 0.0,
                w: 400.0,
                h: 60.0,
            },
        );
        let mut tr = rvst_text::TextRenderer::new();
        let _scene = build_scene(&tree, &[NodeId(20)], &mut tr, 400, 60, 1.0);
    }

    #[test]
    fn parse_border_radius_percent() {
        // 50% of min(100, 100) / 2 = 25px
        let mut styles = std::collections::HashMap::new();
        styles.insert("border-radius".to_string(), "50%".to_string());
        let r = parse_border_radius_with_size(&styles, 100.0, 100.0);
        assert!(
            (r - 25.0).abs() < 0.01,
            "50% of 100x100 should be 25, got {r}"
        );
        // Pure px
        styles.insert("border-radius".to_string(), "8px".to_string());
        let r2 = parse_border_radius_with_size(&styles, 100.0, 100.0);
        assert!((r2 - 8.0).abs() < 0.01, "8px should be 8, got {r2}");
    }

    #[test]
    fn creates_stacking_context_detection() {
        let mut tree = Tree::new();
        // Node with position:relative + z-index:1 → stacking context
        tree.apply(Op::CreateNode {
            id: NodeId(10),
            node_type: NodeType::View,
        });
        tree.apply(Op::SetStyle {
            id: NodeId(10),
            key: "position".into(),
            value: "relative".into(),
        });
        tree.apply(Op::SetStyle {
            id: NodeId(10),
            key: "z-index".into(),
            value: "1".into(),
        });
        assert!(
            creates_stacking_context(tree.nodes.get(&NodeId(10)).unwrap()),
            "positioned + z-index should create stacking context"
        );

        // Node with position:relative + z-index:auto → NOT a stacking context
        tree.apply(Op::CreateNode {
            id: NodeId(11),
            node_type: NodeType::View,
        });
        tree.apply(Op::SetStyle {
            id: NodeId(11),
            key: "position".into(),
            value: "relative".into(),
        });
        tree.apply(Op::SetStyle {
            id: NodeId(11),
            key: "z-index".into(),
            value: "auto".into(),
        });
        assert!(
            !creates_stacking_context(tree.nodes.get(&NodeId(11)).unwrap()),
            "positioned + z-index:auto should NOT create stacking context"
        );

        // Node with opacity < 1 → stacking context
        tree.apply(Op::CreateNode {
            id: NodeId(12),
            node_type: NodeType::View,
        });
        tree.apply(Op::SetStyle {
            id: NodeId(12),
            key: "opacity".into(),
            value: "0.5".into(),
        });
        assert!(
            creates_stacking_context(tree.nodes.get(&NodeId(12)).unwrap()),
            "opacity < 1 should create stacking context"
        );

        // Node with transform → stacking context
        tree.apply(Op::CreateNode {
            id: NodeId(13),
            node_type: NodeType::View,
        });
        tree.apply(Op::SetStyle {
            id: NodeId(13),
            key: "transform".into(),
            value: "translateX(10px)".into(),
        });
        assert!(
            creates_stacking_context(tree.nodes.get(&NodeId(13)).unwrap()),
            "transform should create stacking context"
        );

        // Plain div → NOT a stacking context
        tree.apply(Op::CreateNode {
            id: NodeId(14),
            node_type: NodeType::View,
        });
        assert!(
            !creates_stacking_context(tree.nodes.get(&NodeId(14)).unwrap()),
            "plain div should NOT create stacking context"
        );

        // position:fixed always creates stacking context
        tree.apply(Op::CreateNode {
            id: NodeId(15),
            node_type: NodeType::View,
        });
        tree.apply(Op::SetStyle {
            id: NodeId(15),
            key: "position".into(),
            value: "fixed".into(),
        });
        assert!(
            creates_stacking_context(tree.nodes.get(&NodeId(15)).unwrap()),
            "position:fixed should create stacking context"
        );
    }

    #[test]
    fn stacking_context_scopes_z_index() {
        // Test the mental model:
        //   Root (stacking context via z-index:0)
        //     ParentDiv (position:relative, z-index:1) → stacking context
        //       InnerDiv (position:relative, z-index:9999)
        //     ModalDiv (position:relative, z-index:50) → stacking context
        //
        // Modal (z-index:50) should paint OVER InnerDiv (z-index:9999)
        // because InnerDiv is scoped inside ParentDiv (z-index:1).
        let mut tree = Tree::new();

        // Root container — create stacking context so children get sorted
        let root = NodeId(1);
        tree.apply(Op::CreateNode { id: root, node_type: NodeType::View });
        tree.apply(Op::SetStyle { id: root, key: "position".into(), value: "relative".into() });
        tree.apply(Op::SetStyle { id: root, key: "z-index".into(), value: "0".into() });
        tree.set_layout(root, Rect { x: 0.0, y: 0.0, w: 800.0, h: 600.0 });
        tree.apply(Op::Insert { parent: NodeId(0), child: root, anchor: None });

        // ParentDiv: z-index:1 stacking context
        let parent_div = NodeId(2);
        tree.apply(Op::CreateNode { id: parent_div, node_type: NodeType::View });
        tree.apply(Op::SetStyle { id: parent_div, key: "position".into(), value: "relative".into() });
        tree.apply(Op::SetStyle { id: parent_div, key: "z-index".into(), value: "1".into() });
        tree.set_layout(parent_div, Rect { x: 0.0, y: 0.0, w: 400.0, h: 300.0 });
        tree.apply(Op::Insert { parent: root, child: parent_div, anchor: None });

        // InnerDiv: z-index:9999 (scoped inside ParentDiv)
        let inner_div = NodeId(3);
        tree.apply(Op::CreateNode { id: inner_div, node_type: NodeType::View });
        tree.apply(Op::SetStyle { id: inner_div, key: "position".into(), value: "relative".into() });
        tree.apply(Op::SetStyle { id: inner_div, key: "z-index".into(), value: "9999".into() });
        tree.set_layout(inner_div, Rect { x: 0.0, y: 0.0, w: 200.0, h: 100.0 });
        tree.apply(Op::Insert { parent: parent_div, child: inner_div, anchor: None });

        // ModalDiv: z-index:50 stacking context
        let modal_div = NodeId(4);
        tree.apply(Op::CreateNode { id: modal_div, node_type: NodeType::View });
        tree.apply(Op::SetStyle { id: modal_div, key: "position".into(), value: "relative".into() });
        tree.apply(Op::SetStyle { id: modal_div, key: "z-index".into(), value: "50".into() });
        tree.set_layout(modal_div, Rect { x: 0.0, y: 0.0, w: 800.0, h: 600.0 });
        tree.apply(Op::Insert { parent: root, child: modal_div, anchor: None });

        // Verify stacking context detection
        assert!(creates_stacking_context(tree.nodes.get(&root).unwrap()));
        assert!(creates_stacking_context(tree.nodes.get(&parent_div).unwrap()));
        assert!(creates_stacking_context(tree.nodes.get(&inner_div).unwrap()));
        assert!(creates_stacking_context(tree.nodes.get(&modal_div).unwrap()));

        // Verify root sorts children: parent_div(z:1) before modal_div(z:50)
        let root_node = tree.nodes.get(&root).unwrap();
        assert_eq!(root_node.children, vec![parent_div, modal_div]);
        assert_eq!(child_effective_z(&tree, parent_div), 1);
        assert_eq!(child_effective_z(&tree, modal_div), 50);

        // Build scene to verify no panic — paint order is enforced by the sort
        let mut tr = rvst_text::TextRenderer::new();
        let _scene = build_scene(&tree, &[root], &mut tr, 800, 600, 1.0);
    }

    #[test]
    fn text_overflow_ellipsis_does_not_panic() {
        // Verify that text-overflow:ellipsis + overflow:hidden + white-space:nowrap
        // builds a scene without panic and truncates long text.
        let mut tree = Tree::new();
        tree.apply(Op::CreateNode {
            id: NodeId(30),
            node_type: NodeType::View,
        });
        tree.apply(Op::SetStyle {
            id: NodeId(30),
            key: "overflow".into(),
            value: "hidden".into(),
        });
        tree.apply(Op::SetStyle {
            id: NodeId(30),
            key: "white-space".into(),
            value: "nowrap".into(),
        });
        tree.apply(Op::SetStyle {
            id: NodeId(30),
            key: "text-overflow".into(),
            value: "ellipsis".into(),
        });
        tree.apply(Op::CreateNode {
            id: NodeId(31),
            node_type: NodeType::Text,
        });
        tree.apply(Op::SetText {
            id: NodeId(31),
            value: "This is a very long text that should be truncated with an ellipsis character".into(),
        });
        tree.apply(Op::Insert {
            parent: NodeId(0),
            child: NodeId(30),
            anchor: None,
        });
        tree.apply(Op::Insert {
            parent: NodeId(30),
            child: NodeId(31),
            anchor: None,
        });
        // Narrow container forces truncation
        tree.set_layout(
            NodeId(30),
            Rect {
                x: 0.0,
                y: 0.0,
                w: 100.0,
                h: 30.0,
            },
        );
        tree.set_layout(
            NodeId(31),
            Rect {
                x: 0.0,
                y: 0.0,
                w: 100.0,
                h: 30.0,
            },
        );
        let mut tr = rvst_text::TextRenderer::new();
        let _scene = build_scene(&tree, &[NodeId(30)], &mut tr, 400, 60, 1.0);
    }
}

use rvst_core::{NodeId as RvstId, NodeType, Rect as RvstRect};
use rvst_text::{FontWeight, TextRenderer, FONT_SIZE};
use rvst_tree::Tree;
use std::collections::HashMap;
use taffy::prelude::*;

pub(crate) const BUTTON_PAD: f32 = 8.0;
/// Root em size used for `rem` unit resolution (matches browser default).
const ROOT_EM_PX: f32 = 16.0;

/// Parse a CSS absolute length value to pixels.
/// Handles: `px`, `rem` (= 16px root), `em` (relative to `em_px`), `ch` (~0.5em),
/// `pt` (1pt = 4/3px), `vw`/`vh` (viewport-relative), and bare `0`.
/// Returns None for `%`, `auto`, `calc()`.
fn parse_abs_len_px(v: &str, em_px: f32) -> Option<f32> {
    parse_len_px(v, em_px, 0.0, 0.0)
}

fn parse_len_px(v: &str, em_px: f32, vw: f32, vh: f32) -> Option<f32> {
    let v = v.trim();
    if v == "0" {
        return Some(0.0);
    }
    if let Some(n) = v.strip_suffix("px") {
        return n.trim().parse().ok();
    }
    if let Some(n) = v.strip_suffix("rem") {
        return n.trim().parse::<f32>().ok().map(|x| x * ROOT_EM_PX);
    }
    if let Some(n) = v.strip_suffix("vw") {
        return n.trim().parse::<f32>().ok().map(|x| x * vw / 100.0);
    }
    if let Some(n) = v.strip_suffix("vh") {
        return n.trim().parse::<f32>().ok().map(|x| x * vh / 100.0);
    }
    if let Some(n) = v.strip_suffix("em") {
        return n.trim().parse::<f32>().ok().map(|x| x * em_px);
    }
    if let Some(n) = v.strip_suffix("ch") {
        return n.trim().parse::<f32>().ok().map(|x| x * em_px * 0.5);
    }
    if let Some(n) = v.strip_suffix("pt") {
        return n.trim().parse::<f32>().ok().map(|x| x * (4.0 / 3.0));
    }
    // calc() — resolve against vw (horizontal) or vh (vertical). % terms use vw as base.
    if let Some(inner) = v.strip_prefix("calc(").and_then(|s| s.strip_suffix(')')) {
        return parse_calc_px(inner, em_px, vw, vh);
    }
    None
}

/// Resolve a single calc() operand token to pixels.
/// Returns `Some(px)` for dimensioned values, `None` for dimensionless numbers.
/// For dimensionless numbers use `resolve_calc_term_or_scalar` instead.
fn resolve_calc_term(v: &str, em_px: f32, vw: f32, vh: f32) -> Option<f32> {
    let v = v.trim();
    if v == "0" {
        return Some(0.0);
    }
    if let Some(n) = v.strip_suffix('%') {
        return n.trim().parse::<f32>().ok().map(|p| p / 100.0 * vw);
    }
    if let Some(n) = v.strip_suffix("px") {
        return n.trim().parse().ok();
    }
    if let Some(n) = v.strip_suffix("rem") {
        return n.trim().parse::<f32>().ok().map(|x| x * ROOT_EM_PX);
    }
    if let Some(n) = v.strip_suffix("em") {
        return n.trim().parse::<f32>().ok().map(|x| x * em_px);
    }
    if let Some(n) = v.strip_suffix("vw") {
        return n.trim().parse::<f32>().ok().map(|x| x * vw / 100.0);
    }
    if let Some(n) = v.strip_suffix("vh") {
        return n.trim().parse::<f32>().ok().map(|x| x * vh / 100.0);
    }
    None
}

/// Parse a `calc()` inner expression (without the `calc(...)` wrapper) to pixels.
/// Handles `A + B`, `A - B`, `A * B`, `A / B` (all with surrounding spaces).
/// For `*` and `/`, one operand must be dimensionless (a plain number);
/// the other carries the unit. `%` resolves against `vw`.
fn parse_calc_px(expr: &str, em_px: f32, vw: f32, vh: f32) -> Option<f32> {
    let expr = expr.trim();

    // Find the last ` + `, ` - `, ` * `, or ` / ` operator (right-to-left scan).
    // Right-to-left for `+`/`-` gives correct left-associativity.
    // For `*`/`/` we scan left-to-right (they bind tighter but we only support
    // simple two-operand expressions, so direction doesn't matter in practice).
    let bytes = expr.as_bytes();
    let len = bytes.len();

    // Find last additive operator first (lowest precedence)
    let mut add_pos: Option<(usize, bool)> = None;
    let mut i = len.saturating_sub(1);
    while i > 0 {
        if bytes[i] == b'+' && bytes[i - 1] == b' ' && i + 1 < len && bytes[i + 1] == b' ' {
            add_pos = Some((i - 1, true));
            break;
        }
        if bytes[i] == b'-' && bytes[i - 1] == b' ' && i + 1 < len && bytes[i + 1] == b' ' {
            add_pos = Some((i - 1, false));
            break;
        }
        i -= 1;
    }
    if let Some((pos, is_add)) = add_pos {
        let lhs = resolve_calc_term(expr[..pos].trim(), em_px, vw, vh)?;
        let rhs = resolve_calc_term(expr[pos + 3..].trim(), em_px, vw, vh)?;
        return Some(if is_add { lhs + rhs } else { lhs - rhs });
    }

    // Find first multiplicative operator (no additive found)
    for i in 1..len.saturating_sub(1) {
        if bytes[i] == b'*' && bytes[i - 1] == b' ' && bytes[i + 1] == b' ' {
            let lhs_str = expr[..i - 1].trim();
            let rhs_str = expr[i + 2..].trim();
            // One side has a unit; the other is a plain scalar
            if let Some(px) = resolve_calc_term(lhs_str, em_px, vw, vh) {
                let scalar: f32 = rhs_str.parse().ok()?;
                return Some(px * scalar);
            }
            if let Some(px) = resolve_calc_term(rhs_str, em_px, vw, vh) {
                let scalar: f32 = lhs_str.parse().ok()?;
                return Some(scalar * px);
            }
            return None;
        }
        if bytes[i] == b'/' && bytes[i - 1] == b' ' && bytes[i + 1] == b' ' {
            let lhs_str = expr[..i - 1].trim();
            let rhs_str = expr[i + 2..].trim();
            let px = resolve_calc_term(lhs_str, em_px, vw, vh)?;
            let divisor: f32 = rhs_str.parse().ok()?;
            return Some(px / divisor);
        }
    }

    // Single-term calc() — just a unit value
    resolve_calc_term(expr, em_px, vw, vh)
}

/// Split a CSS shorthand value into parts, respecting calc()/var() parens.
fn split_css_values(v: &str) -> Vec<String> {
    let mut parts = Vec::new();
    let mut current = String::new();
    let mut depth = 0;
    for ch in v.chars() {
        match ch {
            '(' => {
                depth += 1;
                current.push(ch);
            }
            ')' => {
                depth -= 1;
                current.push(ch);
            }
            ' ' | '\t' if depth == 0 => {
                let trimmed = current.trim().to_string();
                if !trimmed.is_empty() {
                    parts.push(trimmed);
                }
                current.clear();
            }
            _ => current.push(ch),
        }
    }
    let trimmed = current.trim().to_string();
    if !trimmed.is_empty() {
        parts.push(trimmed);
    }
    parts
}

struct TextNodeContext {
    text: String,
    font_size: f32,
    line_height_px: f32,
    font_weight: FontWeight,
}

fn parse_font_weight(styles: &HashMap<String, String>) -> FontWeight {
    match styles.get("font-weight").map(|s| s.trim()) {
        None | Some("normal") => FontWeight::NORMAL,
        Some("bold") => FontWeight::BOLD,
        Some("bolder") => FontWeight(700),
        Some("lighter") => FontWeight(300),
        Some(v) => v
            .parse::<u16>()
            .map(FontWeight)
            .unwrap_or(FontWeight::NORMAL),
    }
}

fn parse_font_size(styles: &HashMap<String, String>) -> f32 {
    styles
        .get("font-size")
        .and_then(|v| parse_abs_len_px(v.trim(), ROOT_EM_PX))
        .unwrap_or(FONT_SIZE)
}

pub(crate) fn parse_line_height_pub(styles: &HashMap<String, String>, font_size: f32) -> f32 {
    parse_line_height(styles, font_size)
}

pub(crate) fn parse_font_weight_pub(styles: &HashMap<String, String>) -> FontWeight {
    parse_font_weight(styles)
}

fn parse_line_height(styles: &HashMap<String, String>, font_size: f32) -> f32 {
    match styles.get("line-height").map(|s| s.trim()) {
        None | Some("normal") => font_size * 1.2,
        Some(v) if v.ends_with("px") => v
            .trim_end_matches("px")
            .trim()
            .parse::<f32>()
            .unwrap_or(font_size * 1.2),
        Some(v) if v.ends_with("em") => {
            v.trim_end_matches("em")
                .trim()
                .parse::<f32>()
                .unwrap_or(1.2)
                * font_size
        }
        Some(v) if v.ends_with('%') => {
            v.trim_end_matches('%')
                .trim()
                .parse::<f32>()
                .unwrap_or(120.0)
                / 100.0
                * font_size
        }
        Some(v) => v.parse::<f32>().unwrap_or(1.2) * font_size, // unitless multiplier
    }
}

fn build_taffy_node(
    taffy: &mut TaffyTree<TextNodeContext>,
    tree: &Tree,
    id: RvstId,
    taffy_map: &mut HashMap<RvstId, NodeId>,
    canvas_w: f32,
    canvas_h: f32,
) -> Option<NodeId> {
    let node = tree.nodes.get(&id)?;
    let node_type = node.node_type.clone();
    let text = node.text.clone();
    let children = node.children.clone();
    let styles = node.styles.clone();

    // display: none — exclude this node and its subtree from layout entirely
    if styles.get("display").map(|s| s.as_str()) == Some("none") {
        return None;
    }

    let taffy_id = match node_type {
        NodeType::Text => {
            let text_str = text.unwrap_or_default();
            // CSS spec: whitespace-only text nodes inside flex/grid containers are collapsed.
            // Browsers skip these in layout. Without this, Svelte's inter-element whitespace
            // creates phantom flex children that break gap/spacing calculations.
            if text_str.trim().is_empty() {
                let parent_display = node
                    .parent
                    .and_then(|pid| tree.nodes.get(&pid))
                    .and_then(|p| p.styles.get("display"))
                    .map(|s| s.as_str())
                    .unwrap_or("");
                let parent_is_button = node
                    .parent
                    .and_then(|pid| tree.nodes.get(&pid))
                    .map(|p| p.node_type == NodeType::Button)
                    .unwrap_or(false);
                if matches!(
                    parent_display,
                    "flex" | "inline-flex" | "grid" | "inline-grid"
                ) || parent_is_button
                {
                    // Collapse to zero-size node
                    return taffy
                        .new_leaf(Style {
                            display: Display::None,
                            ..Default::default()
                        })
                        .ok();
                }
            }
            // font-size, line-height, font-weight are inherited — read from parent element's styles
            let parent_styles = node
                .parent
                .and_then(|pid| tree.nodes.get(&pid))
                .map(|p| &p.styles);
            // Inherit font-size from parent when not set directly on the text node
            let font_size = if styles.contains_key("font-size") {
                parse_font_size(&styles)
            } else {
                parent_styles.map(parse_font_size).unwrap_or(FONT_SIZE)
            };
            let line_height_px = parent_styles
                .map(|ps| parse_line_height(ps, font_size))
                .unwrap_or(font_size * 1.2);
            let flex_grow = styles
                .get("flex-grow")
                .and_then(|v| v.trim().parse::<f32>().ok())
                .unwrap_or(0.0);
            // font-weight: check the text node's own styles, then fall back to parent
            let font_weight = if styles.contains_key("font-weight") {
                parse_font_weight(&styles)
            } else {
                parent_styles
                    .map(parse_font_weight)
                    .unwrap_or(FontWeight::NORMAL)
            };
            let ctx = TextNodeContext {
                text: text_str,
                font_size,
                line_height_px,
                font_weight,
            };
            // AlignSelf::FlexStart prevents text leaves from stretching to full container
            // width when the parent uses AlignItems::Stretch (the root container default).
            taffy
                .new_leaf_with_context(
                    Style {
                        flex_grow,
                        align_self: Some(AlignSelf::FlexStart),
                        ..Default::default()
                    },
                    ctx,
                )
                .ok()?
        }
        NodeType::Button | NodeType::View | NodeType::Scroll | NodeType::Form => {
            // Font-size on this element (needed for em unit resolution in padding/gap/margin)
            let elem_font_size = parse_font_size(&styles);
            let is_button = node_type == NodeType::Button;
            let display = match styles.get("display").map(|s| s.as_str()) {
                Some("flex") | Some("inline-flex") => Display::Flex,
                Some("grid") | Some("inline-grid") => Display::Grid,
                Some("none") => Display::None,
                // Buttons without explicit display default to flex (inline-block-like sizing)
                _ if is_button => Display::Flex,
                _ => Display::Block, // CSS default; block divs stretch to parent width
            };
            let flex_direction = match styles.get("flex-direction").map(|s| s.as_str()) {
                Some("column") => FlexDirection::Column,
                Some("row-reverse") => FlexDirection::RowReverse,
                Some("column-reverse") => FlexDirection::ColumnReverse,
                _ => FlexDirection::Row, // CSS default
            };
            // gap shorthand can be "8px" (all sides) or "8px 16px" (row col)
            let parse_gap_parts = |v: &str| -> (f32, f32) {
                let v = v.trim();
                // Try as a single value first (includes calc() expressions)
                if let Some(px) = parse_abs_len_px(v, elem_font_size) {
                    return (px, px);
                }
                // Split into parts, respecting calc() parentheses
                let parts: Vec<f32> = split_css_values(v)
                    .iter()
                    .filter_map(|p| parse_abs_len_px(p, elem_font_size))
                    .collect();
                match parts.as_slice() {
                    [a] => (*a, *a),
                    [row, col] => (*row, *col),
                    _ => (0.0, 0.0),
                }
            };
            let (row_gap_px, gap_px) = styles
                .get("gap")
                .map(|v| parse_gap_parts(v.trim()))
                .unwrap_or_else(|| {
                    let col = styles
                        .get("column-gap")
                        .and_then(|v| parse_abs_len_px(v.trim(), elem_font_size))
                        .unwrap_or(0.0);
                    let row = styles
                        .get("row-gap")
                        .and_then(|v| parse_abs_len_px(v.trim(), elem_font_size))
                        .unwrap_or(0.0);
                    (row, col)
                });
            let align_items = match styles.get("align-items").map(|s| s.as_str()) {
                Some("center") => Some(AlignItems::Center),
                Some("flex-end") | Some("end") => Some(AlignItems::FlexEnd),
                Some("flex-start") | Some("start") => Some(AlignItems::FlexStart),
                Some("stretch") => Some(AlignItems::Stretch),
                // Buttons default to center alignment (matches browser button behavior)
                _ if is_button => Some(AlignItems::Center),
                _ => None,
            };
            let justify_content = match styles.get("justify-content").map(|s| s.as_str()) {
                Some("center") => Some(JustifyContent::Center),
                Some("flex-end") | Some("end") => Some(JustifyContent::FlexEnd),
                Some("flex-start") | Some("start") => Some(JustifyContent::FlexStart),
                Some("space-between") => Some(JustifyContent::SpaceBetween),
                Some("space-around") => Some(JustifyContent::SpaceAround),
                Some("space-evenly") => Some(JustifyContent::SpaceEvenly),
                // Buttons: text-align:center is handled in the compositor, not via flex justify.
                // Using justify-content:center on buttons breaks sidebar/nav buttons that are
                // full-width with left-aligned text.
                _ => None,
            };
            let flex_wrap = match styles.get("flex-wrap").map(|s| s.as_str()) {
                Some("wrap") => FlexWrap::Wrap,
                Some("wrap-reverse") => FlexWrap::WrapReverse,
                _ => FlexWrap::NoWrap,
            };
            let align_content = match styles.get("align-content").map(|s| s.as_str()) {
                Some("center") => Some(AlignContent::Center),
                Some("flex-end") | Some("end") => Some(AlignContent::FlexEnd),
                Some("flex-start") | Some("start") => Some(AlignContent::FlexStart),
                Some("space-between") => Some(AlignContent::SpaceBetween),
                Some("space-around") => Some(AlignContent::SpaceAround),
                Some("space-evenly") => Some(AlignContent::SpaceEvenly),
                Some("stretch") => Some(AlignContent::Stretch),
                _ => None,
            };
            let aspect_ratio = styles.get("aspect-ratio").and_then(|v| {
                let v = v.trim();
                // "16 / 9" or "16/9" or "1.5"
                if let Some(slash) = v.find('/') {
                    let num = v[..slash].trim().parse::<f32>().ok()?;
                    let den = v[slash + 1..].trim().parse::<f32>().ok()?;
                    if den != 0.0 {
                        Some(num / den)
                    } else {
                        None
                    }
                } else {
                    v.parse::<f32>().ok()
                }
            });
            // Padding resolution: logical properties (padding-inline/block) override
            // the shorthand (padding). This matches CSS cascade: logical > shorthand.
            // Tailwind v4 sets `padding: 0` in reset AND `padding-inline: calc(...)` on utilities.
            let pad = {
                let parse_pair = |key: &str| -> Option<(f32, f32)> {
                    styles.get(key).and_then(|v| {
                        let v = v.trim();
                        if let Some(px) = parse_abs_len_px(v, elem_font_size) {
                            return Some((px, px));
                        }
                        let parts = split_css_values(v);
                        if parts.len() == 1 {
                            parse_abs_len_px(&parts[0], elem_font_size).map(|px| (px, px))
                        } else if parts.len() >= 2 {
                            let a = parse_abs_len_px(&parts[0], elem_font_size)?;
                            let b = parse_abs_len_px(&parts[1], elem_font_size)?;
                            Some((a, b))
                        } else {
                            None
                        }
                    })
                };
                // Logical properties only override shorthand when they have a non-zero value.
                // Tailwind's reset sets padding-block:0 on *, but .p-6 sets padding:24px.
                // The shorthand should win when the logical property is just the reset's 0.
                let inline_pair =
                    parse_pair("padding-inline").filter(|&(a, b)| a > 0.01 || b > 0.01);
                let block_pair = parse_pair("padding-block").filter(|&(a, b)| a > 0.01 || b > 0.01);

                // Shorthand as base (lowest priority)
                let (sh_top, sh_right, sh_bottom, sh_left) =
                    if let Some(shorthand) = styles.get("padding") {
                        let shorthand = shorthand.trim();
                        if let Some(v) = parse_abs_len_px(shorthand, elem_font_size) {
                            (v, v, v, v)
                        } else {
                            let vals: Vec<f32> = split_css_values(shorthand)
                                .iter()
                                .filter_map(|v| parse_abs_len_px(v, elem_font_size))
                                .collect();
                            match vals.as_slice() {
                                [a] => (*a, *a, *a, *a),
                                [v, h] => (*v, *h, *v, *h),
                                [t, h, b] => (*t, *h, *b, *h),
                                [t, r, b, l] => (*t, *r, *b, *l),
                                _ => {
                                    let d = if is_button { BUTTON_PAD } else { 0.0 };
                                    (d, d, d, d)
                                }
                            }
                        }
                    } else {
                        let d = if is_button { BUTTON_PAD } else { 0.0 };
                        (d, d, d, d)
                    };

                // Logical properties override shorthand; per-side overrides logical
                let pad_top = styles
                    .get("padding-top")
                    .or_else(|| styles.get("padding-block-start"))
                    .and_then(|v| parse_abs_len_px(v.trim(), elem_font_size))
                    .or_else(|| block_pair.map(|p| p.0))
                    .unwrap_or(sh_top);
                let pad_bottom = styles
                    .get("padding-bottom")
                    .or_else(|| styles.get("padding-block-end"))
                    .and_then(|v| parse_abs_len_px(v.trim(), elem_font_size))
                    .or_else(|| block_pair.map(|p| p.1))
                    .unwrap_or(sh_bottom);
                let pad_left = styles
                    .get("padding-left")
                    .or_else(|| styles.get("padding-inline-start"))
                    .and_then(|v| parse_abs_len_px(v.trim(), elem_font_size))
                    .or_else(|| inline_pair.map(|p| p.0))
                    .unwrap_or(sh_left);
                let pad_right = styles
                    .get("padding-right")
                    .or_else(|| styles.get("padding-inline-end"))
                    .and_then(|v| parse_abs_len_px(v.trim(), elem_font_size))
                    .or_else(|| inline_pair.map(|p| p.1))
                    .unwrap_or(sh_right);
                // When border-radius is large relative to element height (pill shapes),
                // add extra horizontal padding so content stays inside the rounded corners.
                // CSS doesn't do this explicitly, but browsers' inline-flex + rounded-full
                // naturally avoids content extending into the curved area.
                let radius_str = styles
                    .get("border-radius")
                    .map(|s| s.as_str())
                    .unwrap_or("");
                let is_pill = radius_str.contains("3.40282e38")
                    || radius_str == "9999px"
                    || radius_str == "50%";
                let radius_pad = if is_pill { 2.0 } else { 0.0 }; // small extra for pill shapes

                Rect {
                    top: LengthPercentage::length(pad_top),
                    right: LengthPercentage::length(pad_right + radius_pad),
                    bottom: LengthPercentage::length(pad_bottom),
                    left: LengthPercentage::length(pad_left + radius_pad),
                }
            };
            // width / height / min / max from styles
            let parse_dim = |key: &str| -> Option<Dimension> {
                let v = styles.get(key)?;
                let v = v.trim();
                if v == "auto" {
                    return Some(Dimension::auto());
                }
                if v.ends_with('%') {
                    v.trim_end_matches('%')
                        .trim()
                        .parse::<f32>()
                        .ok()
                        .map(|n| Dimension::percent(n / 100.0))
                } else {
                    parse_len_px(v, elem_font_size, canvas_w, canvas_h).map(Dimension::length)
                }
            };
            let dim_w = parse_dim("width").unwrap_or(Dimension::auto());
            let dim_h = parse_dim("height").unwrap_or(Dimension::auto());
            let min_w = parse_dim("min-width").unwrap_or(Dimension::auto());
            let min_h = parse_dim("min-height").unwrap_or(Dimension::auto());
            let max_w = parse_dim("max-width").unwrap_or(Dimension::auto());
            let max_h = parse_dim("max-height").unwrap_or(Dimension::auto());
            // flex shorthand: "1", "auto", "none", "1 1 0%", "0 0 120px", etc.
            // Expand to (grow, shrink, basis) so individual properties can override.
            let (flex_grow_sh, flex_shrink_sh, flex_basis_sh) = styles
                .get("flex")
                .map(|v| {
                    let v = v.trim();
                    if v == "none" {
                        return (0.0f32, 0.0f32, Some(Dimension::auto()));
                    }
                    if v == "auto" {
                        return (1.0, 1.0, Some(Dimension::auto()));
                    }
                    let parts: Vec<&str> = v.split_whitespace().collect();
                    match parts.as_slice() {
                        [g] => {
                            let grow = g.parse::<f32>().unwrap_or(0.0);
                            (grow, 1.0, Some(Dimension::length(0.0)))
                        }
                        [g, s] => {
                            let grow = g.parse::<f32>().unwrap_or(0.0);
                            let shrink = s.parse::<f32>().unwrap_or(1.0);
                            (grow, shrink, Some(Dimension::length(0.0)))
                        }
                        [g, s, b] => {
                            let grow = g.parse::<f32>().unwrap_or(0.0);
                            let shrink = s.parse::<f32>().unwrap_or(1.0);
                            let basis = if *b == "auto" {
                                Dimension::auto()
                            } else if b.ends_with('%') {
                                b.trim_end_matches('%')
                                    .parse::<f32>()
                                    .ok()
                                    .map(|n| Dimension::percent(n / 100.0))
                                    .unwrap_or(Dimension::auto())
                            } else {
                                parse_abs_len_px(b, elem_font_size)
                                    .map(Dimension::length)
                                    .unwrap_or(Dimension::auto())
                            };
                            (grow, shrink, Some(basis))
                        }
                        _ => (0.0, 1.0, None),
                    }
                })
                .unwrap_or((0.0, 1.0, None));
            // Individual flex-grow / flex-shrink / flex-basis override the shorthand
            let flex_grow = styles
                .get("flex-grow")
                .and_then(|v| v.trim().parse::<f32>().ok())
                .unwrap_or(flex_grow_sh);
            let flex_shrink = styles
                .get("flex-shrink")
                .and_then(|v| v.trim().parse::<f32>().ok())
                .unwrap_or(flex_shrink_sh);
            // align-self / justify-self (child properties — overrides parent align-items)
            let align_self = match styles.get("align-self").map(|s| s.as_str()) {
                Some("auto") | None => None,
                Some("center") => Some(AlignSelf::Center),
                Some("flex-end") | Some("end") => Some(AlignSelf::FlexEnd),
                Some("flex-start") | Some("start") => Some(AlignSelf::FlexStart),
                Some("stretch") => Some(AlignSelf::Stretch),
                Some("baseline") => Some(AlignSelf::Baseline),
                _ => None,
            };
            let justify_self = match styles.get("justify-self").map(|s| s.as_str()) {
                Some("auto") | None => None,
                Some("center") => Some(JustifySelf::Center),
                Some("flex-end") | Some("end") => Some(JustifySelf::FlexEnd),
                Some("flex-start") | Some("start") => Some(JustifySelf::FlexStart),
                Some("stretch") => Some(JustifySelf::Stretch),
                Some("baseline") => Some(JustifySelf::Baseline),
                _ => None,
            };
            let flex_basis = styles
                .get("flex-basis")
                .map(|v| {
                    let v = v.trim();
                    if v == "auto" {
                        Dimension::auto()
                    } else if v.ends_with('%') {
                        v.trim_end_matches('%')
                            .parse::<f32>()
                            .ok()
                            .map(|n| Dimension::percent(n / 100.0))
                            .unwrap_or(Dimension::auto())
                    } else {
                        parse_abs_len_px(v, elem_font_size)
                            .map(Dimension::length)
                            .unwrap_or(Dimension::auto())
                    }
                })
                .or(flex_basis_sh)
                .unwrap_or(Dimension::auto());
            // position mapping:
            // - absolute: removes from flow, positioned relative to nearest positioned ancestor
            // - fixed: removes from flow, same as absolute for now
            //   TODO: fixup to be viewport-relative (relative to NodeId(1)) after Taffy layout
            // - sticky: stays in flow (Relative), but during rendering (composite.rs) should
            //   clamp visual position to stay visible within scroll container. Currently no
            //   scroll-aware clamping — behaves as plain relative positioning.
            let position = match styles.get("position").map(|s| s.as_str()) {
                Some("absolute") | Some("fixed") => Position::Absolute,
                Some("sticky") => Position::Relative,
                _ => Position::Relative,
            };
            // inset (top/right/bottom/left) for absolutely positioned nodes
            let parse_lpa = |key: &str| -> LengthPercentageAuto {
                let v = styles.get(key).map(|s| s.trim()).unwrap_or("auto");
                if v == "auto" {
                    return LengthPercentageAuto::AUTO;
                }
                if v.ends_with('%') {
                    v.trim_end_matches('%')
                        .parse::<f32>()
                        .ok()
                        .map(|n| LengthPercentageAuto::percent(n / 100.0))
                        .unwrap_or(LengthPercentageAuto::AUTO)
                } else {
                    parse_abs_len_px(v, elem_font_size)
                        .map(LengthPercentageAuto::length)
                        .unwrap_or(LengthPercentageAuto::AUTO)
                }
            };
            let inset = Rect {
                top: parse_lpa("top"),
                right: parse_lpa("right"),
                bottom: parse_lpa("bottom"),
                left: parse_lpa("left"),
            };
            // margin shorthand: 1, 2, 3, or 4 space-separated values; "auto" supported
            let parse_lpa_margin = |v: &str| -> LengthPercentageAuto {
                let v = v.trim();
                if v == "auto" {
                    return LengthPercentageAuto::AUTO;
                }
                if v.ends_with('%') {
                    v.trim_end_matches('%')
                        .parse::<f32>()
                        .ok()
                        .map(|n| LengthPercentageAuto::percent(n / 100.0))
                        .unwrap_or(LengthPercentageAuto::AUTO)
                } else {
                    parse_abs_len_px(v, elem_font_size)
                        .map(LengthPercentageAuto::length)
                        .unwrap_or(LengthPercentageAuto::AUTO)
                }
            };
            let margin = if let Some(shorthand) = styles.get("margin") {
                let shorthand_trimmed = shorthand.trim();
                let vals = split_css_values(shorthand_trimmed);
                let (top, right, bottom, left) = match vals.len() {
                    1 => (
                        vals[0].as_str(),
                        vals[0].as_str(),
                        vals[0].as_str(),
                        vals[0].as_str(),
                    ),
                    2 => (
                        vals[0].as_str(),
                        vals[1].as_str(),
                        vals[0].as_str(),
                        vals[1].as_str(),
                    ),
                    3 => (
                        vals[0].as_str(),
                        vals[1].as_str(),
                        vals[2].as_str(),
                        vals[1].as_str(),
                    ),
                    4.. => (
                        vals[0].as_str(),
                        vals[1].as_str(),
                        vals[2].as_str(),
                        vals[3].as_str(),
                    ),
                    _ => ("0", "0", "0", "0"),
                };
                Rect {
                    top: parse_lpa_margin(top),
                    right: parse_lpa_margin(right),
                    bottom: parse_lpa_margin(bottom),
                    left: parse_lpa_margin(left),
                }
            } else {
                // CSS logical properties (LTR): margin-inline → left+right, margin-block → top+bottom
                let parse_mpair =
                    |key: &str| -> Option<(LengthPercentageAuto, LengthPercentageAuto)> {
                        styles.get(key).map(|v| {
                            let parts = split_css_values(v);
                            match parts.len() {
                                1 => (parse_lpa_margin(&parts[0]), parse_lpa_margin(&parts[0])),
                                2.. => (parse_lpa_margin(&parts[0]), parse_lpa_margin(&parts[1])),
                                _ => (
                                    LengthPercentageAuto::length(0.0),
                                    LengthPercentageAuto::length(0.0),
                                ),
                            }
                        })
                    };
                let inline_pair = parse_mpair("margin-inline");
                let block_pair = parse_mpair("margin-block");
                let mar_top = styles
                    .get("margin-top")
                    .or_else(|| styles.get("margin-block-start"))
                    .map(|s| parse_lpa_margin(s.as_str()))
                    .unwrap_or_else(|| {
                        block_pair
                            .as_ref()
                            .map(|p| p.0)
                            .unwrap_or(LengthPercentageAuto::length(0.0))
                    });
                let mar_bottom = styles
                    .get("margin-bottom")
                    .or_else(|| styles.get("margin-block-end"))
                    .map(|s| parse_lpa_margin(s.as_str()))
                    .unwrap_or_else(|| {
                        block_pair
                            .as_ref()
                            .map(|p| p.1)
                            .unwrap_or(LengthPercentageAuto::length(0.0))
                    });
                let mar_left = styles
                    .get("margin-left")
                    .or_else(|| styles.get("margin-inline-start"))
                    .map(|s| parse_lpa_margin(s.as_str()))
                    .unwrap_or_else(|| {
                        inline_pair
                            .as_ref()
                            .map(|p| p.0)
                            .unwrap_or(LengthPercentageAuto::length(0.0))
                    });
                let mar_right = styles
                    .get("margin-right")
                    .or_else(|| styles.get("margin-inline-end"))
                    .map(|s| parse_lpa_margin(s.as_str()))
                    .unwrap_or_else(|| {
                        inline_pair
                            .as_ref()
                            .map(|p| p.1)
                            .unwrap_or(LengthPercentageAuto::length(0.0))
                    });
                Rect {
                    top: mar_top,
                    right: mar_right,
                    bottom: mar_bottom,
                    left: mar_left,
                }
            };
            // overflow: maps to Taffy's Overflow for clipping behavior
            let parse_overflow = |v: &str| -> taffy::Overflow {
                match v.trim() {
                    "hidden" => taffy::Overflow::Hidden,
                    "scroll" | "auto" => taffy::Overflow::Scroll,
                    _ => taffy::Overflow::Visible,
                }
            };
            let overflow_shorthand = styles
                .get("overflow")
                .map(|s| parse_overflow(s))
                .unwrap_or(taffy::Overflow::Visible);
            let overflow_x = styles
                .get("overflow-x")
                .map(|s| parse_overflow(s))
                .unwrap_or(overflow_shorthand);
            let overflow_y = styles
                .get("overflow-y")
                .map(|s| parse_overflow(s))
                .unwrap_or(overflow_shorthand);

            // border-width: affects layout (adds to box size in Taffy)
            let border_w = styles
                .get("border-width")
                .or_else(|| styles.get("border"))
                .and_then(|v| {
                    // Extract width from border shorthand "1px solid #ccc" or plain "1px"
                    split_css_values(v)
                        .first()
                        .and_then(|w| parse_abs_len_px(w, elem_font_size))
                })
                .unwrap_or(0.0);
            let border = if border_w > 0.0 {
                Rect {
                    top: LengthPercentage::length(border_w),
                    right: LengthPercentage::length(border_w),
                    bottom: LengthPercentage::length(border_w),
                    left: LengthPercentage::length(border_w),
                }
            } else {
                Rect::zero()
            };
            let style = Style {
                display,
                flex_direction,
                align_items,
                align_content,
                align_self,
                justify_content,
                justify_self,
                flex_wrap,
                flex_grow,
                flex_shrink,
                flex_basis,
                aspect_ratio,
                position,
                inset,
                padding: pad,
                margin,
                overflow: taffy::Point {
                    x: overflow_x,
                    y: overflow_y,
                },
                border,
                size: Size {
                    width: dim_w,
                    height: dim_h,
                },
                min_size: Size {
                    width: min_w,
                    height: min_h,
                },
                max_size: Size {
                    width: max_w,
                    height: max_h,
                },
                gap: Size {
                    width: LengthPercentage::length(gap_px),
                    height: LengthPercentage::length(row_gap_px),
                },
                ..Default::default()
            };
            let child_taffy_ids: Vec<NodeId> = children
                .iter()
                .filter_map(|&cid| {
                    build_taffy_node(taffy, tree, cid, taffy_map, canvas_w, canvas_h)
                })
                .collect();
            taffy.new_with_children(style, &child_taffy_ids).ok()?
        }
        NodeType::Input => {
            // Input is a leaf — respects explicit styles, defaults to 100% width with text height.
            let elem_font_size_i = parse_font_size(&styles);
            let parse_dim_i = |key: &str| -> Option<Dimension> {
                let v = styles.get(key)?;
                let v = v.trim();
                if v == "auto" {
                    return Some(Dimension::auto());
                }
                if v.ends_with('%') {
                    v.trim_end_matches('%')
                        .parse::<f32>()
                        .ok()
                        .map(|n| Dimension::percent(n / 100.0))
                } else {
                    parse_len_px(v, elem_font_size_i, canvas_w, canvas_h).map(Dimension::length)
                }
            };
            let parse_lpa_i = |v: &str| -> LengthPercentageAuto {
                let v = v.trim();
                if v == "auto" {
                    return LengthPercentageAuto::AUTO;
                }
                if v.ends_with('%') {
                    v.trim_end_matches('%')
                        .parse::<f32>()
                        .ok()
                        .map(|n| LengthPercentageAuto::percent(n / 100.0))
                        .unwrap_or(LengthPercentageAuto::AUTO)
                } else {
                    v.trim_end_matches("px")
                        .trim()
                        .parse::<f32>()
                        .ok()
                        .map(LengthPercentageAuto::length)
                        .unwrap_or(LengthPercentageAuto::AUTO)
                }
            };
            let input_h = parse_font_size(&styles) + BUTTON_PAD * 2.0;
            // Browsers give <input> a default intrinsic width of ~20ch (~150px).
            // Use 150px as min-width when no explicit width is set.
            let dim_w = parse_dim_i("width").unwrap_or(Dimension::auto());
            let min_w_default = if styles.contains_key("width") || styles.contains_key("min-width")
            {
                parse_dim_i("min-width").unwrap_or(Dimension::auto())
            } else {
                Dimension::length(150.0)
            };
            let dim_h = parse_dim_i("height").unwrap_or(Dimension::length(input_h));
            let flex_grow = styles
                .get("flex-grow")
                .and_then(|v| v.trim().parse::<f32>().ok())
                .unwrap_or(0.0);
            let flex_shrink = styles
                .get("flex-shrink")
                .and_then(|v| v.trim().parse::<f32>().ok())
                .unwrap_or(1.0);
            let margin = if let Some(sh) = styles.get("margin") {
                let vals = split_css_values(sh);
                let (t, r, b, l) = match vals.len() {
                    1 => (
                        vals[0].as_str(),
                        vals[0].as_str(),
                        vals[0].as_str(),
                        vals[0].as_str(),
                    ),
                    2 => (
                        vals[0].as_str(),
                        vals[1].as_str(),
                        vals[0].as_str(),
                        vals[1].as_str(),
                    ),
                    3 => (
                        vals[0].as_str(),
                        vals[1].as_str(),
                        vals[2].as_str(),
                        vals[1].as_str(),
                    ),
                    4.. => (
                        vals[0].as_str(),
                        vals[1].as_str(),
                        vals[2].as_str(),
                        vals[3].as_str(),
                    ),
                    _ => ("0", "0", "0", "0"),
                };
                Rect {
                    top: parse_lpa_i(t),
                    right: parse_lpa_i(r),
                    bottom: parse_lpa_i(b),
                    left: parse_lpa_i(l),
                }
            } else {
                Rect {
                    top: parse_lpa_i(styles.get("margin-top").map(|s| s.as_str()).unwrap_or("0")),
                    right: parse_lpa_i(
                        styles
                            .get("margin-right")
                            .map(|s| s.as_str())
                            .unwrap_or("0"),
                    ),
                    bottom: parse_lpa_i(
                        styles
                            .get("margin-bottom")
                            .map(|s| s.as_str())
                            .unwrap_or("0"),
                    ),
                    left: parse_lpa_i(styles.get("margin-left").map(|s| s.as_str()).unwrap_or("0")),
                }
            };
            let style = Style {
                size: Size {
                    width: dim_w,
                    height: dim_h,
                },
                min_size: Size {
                    width: min_w_default,
                    height: parse_dim_i("min-height").unwrap_or(Dimension::auto()),
                },
                max_size: Size {
                    width: parse_dim_i("max-width").unwrap_or(Dimension::auto()),
                    height: parse_dim_i("max-height").unwrap_or(Dimension::auto()),
                },
                flex_grow,
                flex_shrink,
                margin,
                ..Default::default()
            };
            taffy.new_leaf(style).ok()?
        }
        NodeType::Textarea => {
            // Textarea defaults to 3 lines of text height. Respects explicit width/height styles.
            let font_size = parse_font_size(&styles);
            let line_h = font_size * 1.2;
            let default_h = line_h * 3.0 + BUTTON_PAD * 2.0;
            let dim_w = styles
                .get("width")
                .and_then(|v| {
                    let v = v.trim();
                    if v == "auto" {
                        Some(Dimension::auto())
                    } else if v.ends_with('%') {
                        v.trim_end_matches('%')
                            .parse::<f32>()
                            .ok()
                            .map(|n| Dimension::percent(n / 100.0))
                    } else {
                        v.trim_end_matches("px")
                            .trim()
                            .parse::<f32>()
                            .ok()
                            .map(Dimension::length)
                    }
                })
                .unwrap_or(Dimension::auto());
            let dim_h = styles
                .get("height")
                .and_then(|v| {
                    let v = v.trim();
                    if v == "auto" {
                        Some(Dimension::auto())
                    } else if v.ends_with('%') {
                        v.trim_end_matches('%')
                            .parse::<f32>()
                            .ok()
                            .map(|n| Dimension::percent(n / 100.0))
                    } else {
                        v.trim_end_matches("px")
                            .trim()
                            .parse::<f32>()
                            .ok()
                            .map(Dimension::length)
                    }
                })
                .unwrap_or(Dimension::length(default_h));
            let flex_grow = styles
                .get("flex-grow")
                .and_then(|v| v.trim().parse::<f32>().ok())
                .unwrap_or(0.0);
            let flex_shrink = styles
                .get("flex-shrink")
                .and_then(|v| v.trim().parse::<f32>().ok())
                .unwrap_or(1.0);
            let style = Style {
                size: Size {
                    width: dim_w,
                    height: dim_h,
                },
                flex_grow,
                flex_shrink,
                ..Default::default()
            };
            taffy.new_leaf(style).ok()?
        }
    };

    taffy_map.insert(id, taffy_id);
    Some(taffy_id)
}

fn write_back_layout(
    tree: &mut Tree,
    taffy: &TaffyTree<TextNodeContext>,
    id: RvstId,
    taffy_id: NodeId,
    taffy_map: &HashMap<RvstId, NodeId>,
    parent_x: f32,
    parent_y: f32,
) {
    let layout = match taffy.layout(taffy_id) {
        Ok(l) => l,
        Err(_) => return,
    };
    let abs_x = parent_x + layout.location.x;
    let abs_y = parent_y + layout.location.y;
    tree.set_layout(
        id,
        RvstRect {
            x: abs_x,
            y: abs_y,
            w: layout.size.width,
            h: layout.size.height,
        },
    );

    let children = tree
        .nodes
        .get(&id)
        .map(|n| n.children.clone())
        .unwrap_or_default();
    for child_id in children {
        if let Some(&child_taffy_id) = taffy_map.get(&child_id) {
            write_back_layout(
                tree,
                taffy,
                child_id,
                child_taffy_id,
                taffy_map,
                abs_x,
                abs_y,
            );
        }
    }
}

pub fn flow(
    tree: &mut Tree,
    roots: &[RvstId],
    tr: &mut TextRenderer,
    available_w: f32,
    available_h: f32,
    scale_factor: f32,
) -> f32 {
    let margin = rvst_text::WINDOW_MARGIN * scale_factor;

    let mut taffy: TaffyTree<TextNodeContext> = TaffyTree::new();
    let mut taffy_map: HashMap<RvstId, NodeId> = HashMap::new();

    let root_child_taffy_ids: Vec<NodeId> = roots
        .iter()
        .filter_map(|&id| {
            build_taffy_node(
                &mut taffy,
                tree,
                id,
                &mut taffy_map,
                available_w,
                available_h,
            )
        })
        .collect();

    // Synthetic root container — matches browser body: full width, no extra padding.
    // AlignItems::Stretch makes block-level children fill the full window width,
    // matching how a browser renders `body > div` (block formatting context).
    let pad = LengthPercentage::length(margin);
    let root_style = Style {
        flex_direction: FlexDirection::Column,
        align_items: Some(AlignItems::Stretch),
        size: Size {
            width: Dimension::length(available_w),
            height: Dimension::length(available_h),
        },
        padding: Rect {
            left: pad,
            right: pad,
            top: pad,
            bottom: pad,
        },
        ..Default::default()
    };
    let root_taffy_id = taffy
        .new_with_children(root_style, &root_child_taffy_ids)
        .expect("taffy root");

    // Compute layout; measure callback provides text dimensions
    taffy
        .compute_layout_with_measure(
            root_taffy_id,
            Size {
                width: AvailableSpace::Definite(available_w),
                height: AvailableSpace::MaxContent,
            },
            |known_dims, _available_space, _node_id, node_ctx, _style| {
                let Some(ctx) = node_ctx else {
                    return Size {
                        width: 0.0,
                        height: 0.0,
                    };
                };
                if ctx.text.is_empty() {
                    return Size {
                        width: 0.0,
                        height: 0.0,
                    };
                }
                // Text measurement: ALWAYS report intrinsic (unwrapped) width.
                // This ensures flex containers expand to fit their text content,
                // matching CSS behavior where text nodes don't shrink below their
                // content width (min-width: auto on flex items).
                // Only use a definite width if explicitly set on the text node itself
                // (known_dims.width), not the available space from the parent.
                let max_w = known_dims.width.unwrap_or(f32::MAX);
                let (w, h) = tr.measure(
                    &ctx.text,
                    ctx.font_size,
                    max_w,
                    Some(ctx.line_height_px),
                    Some(ctx.font_weight),
                );
                Size {
                    width: w,
                    height: h,
                }
            },
        )
        .expect("taffy layout");

    // Write absolute positions back to rvst tree
    // Root children are positioned relative to the synthetic root at (0,0).
    // Taffy places them at (margin, margin) via the root container's padding,
    // so their location.x/y already includes the window margin offset.
    for &id in roots {
        if let Some(&tid) = taffy_map.get(&id) {
            write_back_layout(tree, &taffy, id, tid, &taffy_map, 0.0, 0.0);
        }
    }

    taffy
        .layout(root_taffy_id)
        .map(|l| l.size.height)
        .unwrap_or(0.0)
}

#[cfg(test)]
mod tests {
    use super::*;
    use rvst_core::{NodeId, NodeType, Op};
    use rvst_tree::Tree;

    #[test]
    fn calc_basic_subtraction() {
        // calc(100% - 200px) with vw=800 → 800 - 200 = 600
        let result = parse_calc_px("100% - 200px", 16.0, 800.0, 600.0);
        assert_eq!(result, Some(600.0));
    }

    #[test]
    fn calc_basic_addition() {
        // calc(50% + 20px) with vw=400 → 200 + 20 = 220
        let result = parse_calc_px("50% + 20px", 16.0, 400.0, 600.0);
        assert_eq!(result, Some(220.0));
    }

    #[test]
    fn calc_in_parse_len_px() {
        // parse_len_px should strip calc() and resolve
        let result = parse_len_px("calc(100% - 200px)", 16.0, 800.0, 600.0);
        assert_eq!(result, Some(600.0));
    }

    #[test]
    fn calc_rem_minus_px() {
        // calc(4rem - 8px) with root 16px → 64 - 8 = 56
        let result = parse_calc_px("4rem - 8px", 16.0, 0.0, 0.0);
        assert_eq!(result, Some(56.0));
    }

    #[test]
    fn calc_multiply_rem_by_scalar() {
        // calc(0.25rem * 4) → 0.25 * 16 * 4 = 16px
        let result = parse_calc_px("0.25rem * 4", 16.0, 0.0, 0.0);
        assert_eq!(result, Some(16.0));
    }

    #[test]
    fn calc_scalar_times_rem() {
        // calc(8 * 0.25rem) → commutative: same result
        let result = parse_calc_px("8 * 0.25rem", 16.0, 0.0, 0.0);
        assert_eq!(result, Some(32.0));
    }

    #[test]
    fn calc_divide_px_by_scalar() {
        // calc(48px / 2) → 24px
        let result = parse_calc_px("48px / 2", 16.0, 0.0, 0.0);
        assert_eq!(result, Some(24.0));
    }

    #[test]
    fn calc_single_term() {
        // calc(with a single term — no operator
        let result = parse_calc_px("2rem", 16.0, 0.0, 0.0);
        assert_eq!(result, Some(32.0));
    }

    fn make_counter_tree() -> Tree {
        // Mirrors what the counter bundle produces:
        //   root -> [anchor(empty text), button -> [text("Count: 0")]]
        let mut tree = Tree::new();
        tree.apply(Op::CreateNode {
            id: NodeId(100),
            node_type: NodeType::Text,
        });
        tree.apply(Op::SetText {
            id: NodeId(100),
            value: "".into(),
        });
        tree.apply(Op::Insert {
            parent: NodeId(0),
            child: NodeId(100),
            anchor: None,
        });
        tree.apply(Op::CreateNode {
            id: NodeId(105),
            node_type: NodeType::Button,
        });
        tree.apply(Op::Insert {
            parent: NodeId(0),
            child: NodeId(105),
            anchor: None,
        });
        tree.apply(Op::CreateNode {
            id: NodeId(106),
            node_type: NodeType::Text,
        });
        tree.apply(Op::SetText {
            id: NodeId(106),
            value: "Count: 0".into(),
        });
        tree.apply(Op::Insert {
            parent: NodeId(105),
            child: NodeId(106),
            anchor: None,
        });
        tree
    }

    #[test]
    fn layout_assigns_rects_to_button_and_text() {
        let mut tree = make_counter_tree();
        let mut tr = rvst_text::TextRenderer::new();
        let roots: Vec<NodeId> = tree.root_children.clone();
        flow(&mut tree, &roots, &mut tr, 800.0, 600.0, 0.0);
        // Button should have a non-zero rect
        let btn_rect = tree
            .get_layout(NodeId(105))
            .expect("button must have layout");
        assert!(btn_rect.w > 0.0, "button width > 0");
        assert!(btn_rect.h > 0.0, "button height > 0");
        // Text inside button should be positioned with padding offset
        let txt_rect = tree.get_layout(NodeId(106)).expect("text must have layout");
        assert_eq!(txt_rect.x, BUTTON_PAD, "text x = button pad");
        assert_eq!(txt_rect.y, BUTTON_PAD, "text y = button pad");
        // Empty anchor has zero size
        let anc_rect = tree
            .get_layout(NodeId(100))
            .expect("anchor node must have layout");
        assert_eq!(anc_rect.w, 0.0);
        assert_eq!(anc_rect.h, 0.0);
    }

    #[test]
    fn layout_button_height_is_text_height_plus_padding() {
        let mut tree = make_counter_tree();
        let mut tr = rvst_text::TextRenderer::new();
        let roots: Vec<NodeId> = tree.root_children.clone();
        flow(&mut tree, &roots, &mut tr, 800.0, 600.0, 0.0);
        let btn = tree.get_layout(NodeId(105)).unwrap();
        let txt = tree.get_layout(NodeId(106)).unwrap();
        assert!(
            (btn.h - (txt.h + BUTTON_PAD * 2.0)).abs() < 1.0,
            "btn.h={} txt.h={} pad={}",
            btn.h,
            txt.h,
            BUTTON_PAD
        );
    }

    #[test]
    fn flex_direction_row_default_lays_out_horizontally() {
        // A flex container with no explicit flex-direction should default to row (CSS spec).
        // Two equal-width children in a row container each get half the parent width.
        let mut tree = Tree::new();
        // Parent view: display:flex, width:200px (no explicit flex-direction → row)
        tree.apply(Op::CreateNode {
            id: NodeId(300),
            node_type: NodeType::View,
        });
        tree.apply(Op::SetStyle {
            id: NodeId(300),
            key: "display".into(),
            value: "flex".into(),
        });
        tree.apply(Op::SetStyle {
            id: NodeId(300),
            key: "width".into(),
            value: "200px".into(),
        });
        tree.apply(Op::SetStyle {
            id: NodeId(300),
            key: "height".into(),
            value: "50px".into(),
        });
        tree.apply(Op::Insert {
            parent: NodeId(0),
            child: NodeId(300),
            anchor: None,
        });
        // Two children with flex-grow:1 each → each should be 100px wide
        tree.apply(Op::CreateNode {
            id: NodeId(301),
            node_type: NodeType::View,
        });
        tree.apply(Op::SetStyle {
            id: NodeId(301),
            key: "flex-grow".into(),
            value: "1".into(),
        });
        tree.apply(Op::SetStyle {
            id: NodeId(301),
            key: "height".into(),
            value: "50px".into(),
        });
        tree.apply(Op::Insert {
            parent: NodeId(300),
            child: NodeId(301),
            anchor: None,
        });
        tree.apply(Op::CreateNode {
            id: NodeId(302),
            node_type: NodeType::View,
        });
        tree.apply(Op::SetStyle {
            id: NodeId(302),
            key: "flex-grow".into(),
            value: "1".into(),
        });
        tree.apply(Op::SetStyle {
            id: NodeId(302),
            key: "height".into(),
            value: "50px".into(),
        });
        tree.apply(Op::Insert {
            parent: NodeId(300),
            child: NodeId(302),
            anchor: None,
        });

        let mut tr = rvst_text::TextRenderer::new();
        let roots: Vec<NodeId> = tree.root_children.clone();
        flow(&mut tree, &roots, &mut tr, 800.0, 600.0, 0.0);

        let child1 = tree
            .get_layout(NodeId(301))
            .expect("child1 must have layout");
        let child2 = tree
            .get_layout(NodeId(302))
            .expect("child2 must have layout");
        // In row direction, children are placed side-by-side
        assert!(
            child1.w > 0.0,
            "child1 should have width in row layout, got {}",
            child1.w
        );
        assert!(
            child2.w > 0.0,
            "child2 should have width in row layout, got {}",
            child2.w
        );
        assert!(
            child1.x < child2.x,
            "child1 should be left of child2 in row layout (child1.x={} child2.x={})",
            child1.x,
            child2.x
        );
        assert!(
            (child1.y - child2.y).abs() < 1.0,
            "children should share the same Y in row layout"
        );
    }

    #[test]
    fn gap_two_value_syntax_parsed_correctly() {
        // gap: 10px 20px → row-gap=10, column-gap=20
        // In a row-direction flex container, column-gap (gap.width in taffy) applies between children.
        let mut tree = Tree::new();
        tree.apply(Op::CreateNode {
            id: NodeId(400),
            node_type: NodeType::View,
        });
        tree.apply(Op::SetStyle {
            id: NodeId(400),
            key: "display".into(),
            value: "flex".into(),
        });
        tree.apply(Op::SetStyle {
            id: NodeId(400),
            key: "gap".into(),
            value: "10px 20px".into(),
        });
        tree.apply(Op::SetStyle {
            id: NodeId(400),
            key: "width".into(),
            value: "200px".into(),
        });
        tree.apply(Op::SetStyle {
            id: NodeId(400),
            key: "height".into(),
            value: "50px".into(),
        });
        tree.apply(Op::Insert {
            parent: NodeId(0),
            child: NodeId(400),
            anchor: None,
        });
        // Two 50px children; gap of 20px between them → total = 50 + 20 + 50 = 120px
        tree.apply(Op::CreateNode {
            id: NodeId(401),
            node_type: NodeType::View,
        });
        tree.apply(Op::SetStyle {
            id: NodeId(401),
            key: "width".into(),
            value: "50px".into(),
        });
        tree.apply(Op::SetStyle {
            id: NodeId(401),
            key: "height".into(),
            value: "50px".into(),
        });
        tree.apply(Op::Insert {
            parent: NodeId(400),
            child: NodeId(401),
            anchor: None,
        });
        tree.apply(Op::CreateNode {
            id: NodeId(402),
            node_type: NodeType::View,
        });
        tree.apply(Op::SetStyle {
            id: NodeId(402),
            key: "width".into(),
            value: "50px".into(),
        });
        tree.apply(Op::SetStyle {
            id: NodeId(402),
            key: "height".into(),
            value: "50px".into(),
        });
        tree.apply(Op::Insert {
            parent: NodeId(400),
            child: NodeId(402),
            anchor: None,
        });

        let mut tr = rvst_text::TextRenderer::new();
        let roots: Vec<NodeId> = tree.root_children.clone();
        flow(&mut tree, &roots, &mut tr, 800.0, 600.0, 0.0);

        let c1 = tree.get_layout(NodeId(401)).expect("c1 must have layout");
        let c2 = tree.get_layout(NodeId(402)).expect("c2 must have layout");
        // c2.x should be c1.x + 50 (c1.w) + 20 (col-gap)
        let expected_gap = c2.x - (c1.x + c1.w);
        assert!(
            (expected_gap - 20.0).abs() < 1.0,
            "column gap should be 20px (from 'gap: 10px 20px'), got {}",
            expected_gap
        );
    }

    #[test]
    fn layout_button_with_two_text_children_stacks_heights() {
        // Button with two text children: height == line1.h + line2.h + 2*BUTTON_PAD
        let mut tree = Tree::new();
        // Button node
        tree.apply(Op::CreateNode {
            id: NodeId(200),
            node_type: NodeType::Button,
        });
        tree.apply(Op::Insert {
            parent: NodeId(0),
            child: NodeId(200),
            anchor: None,
        });
        // First text child
        tree.apply(Op::CreateNode {
            id: NodeId(201),
            node_type: NodeType::Text,
        });
        tree.apply(Op::SetText {
            id: NodeId(201),
            value: "Line 1".into(),
        });
        tree.apply(Op::Insert {
            parent: NodeId(200),
            child: NodeId(201),
            anchor: None,
        });
        // Second text child
        tree.apply(Op::CreateNode {
            id: NodeId(202),
            node_type: NodeType::Text,
        });
        tree.apply(Op::SetText {
            id: NodeId(202),
            value: "Line 2".into(),
        });
        tree.apply(Op::Insert {
            parent: NodeId(200),
            child: NodeId(202),
            anchor: None,
        });

        let mut tr = rvst_text::TextRenderer::new();
        let roots: Vec<NodeId> = tree.root_children.clone();
        flow(&mut tree, &roots, &mut tr, 800.0, 600.0, 0.0);

        let btn = tree
            .get_layout(NodeId(200))
            .expect("button must have layout");
        let line1 = tree
            .get_layout(NodeId(201))
            .expect("line1 must have layout");
        let line2 = tree
            .get_layout(NodeId(202))
            .expect("line2 must have layout");

        // Button now uses CSS-driven flex layout (flex-row default, matching CSS spec).
        // With two text children in a row, the button height = tallest child + top+bottom padding.
        let expected_h = line1.h.max(line2.h) + BUTTON_PAD * 2.0;
        assert!(
            (btn.h - expected_h).abs() < 1.0,
            "btn.h={} expected={} (line1.h={} line2.h={} pad={})",
            btn.h,
            expected_h,
            line1.h,
            line2.h,
            BUTTON_PAD
        );
    }

    #[test]
    fn padding_inline_logical_property_maps_to_left_right() {
        // padding-inline: 20px should apply 20px left and right padding to a View.
        let mut tree = Tree::new();
        tree.apply(Op::CreateNode {
            id: NodeId(500),
            node_type: NodeType::View,
        });
        tree.apply(Op::SetStyle {
            id: NodeId(500),
            key: "width".into(),
            value: "200px".into(),
        });
        tree.apply(Op::SetStyle {
            id: NodeId(500),
            key: "height".into(),
            value: "60px".into(),
        });
        tree.apply(Op::SetStyle {
            id: NodeId(500),
            key: "padding-inline".into(),
            value: "20px".into(),
        });
        tree.apply(Op::Insert {
            parent: NodeId(0),
            child: NodeId(500),
            anchor: None,
        });
        // Child text — should be offset by 20px from the left edge
        tree.apply(Op::CreateNode {
            id: NodeId(501),
            node_type: NodeType::Text,
        });
        tree.apply(Op::SetText {
            id: NodeId(501),
            value: "hi".into(),
        });
        tree.apply(Op::Insert {
            parent: NodeId(500),
            child: NodeId(501),
            anchor: None,
        });

        let mut tr = rvst_text::TextRenderer::new();
        let roots: Vec<NodeId> = tree.root_children.clone();
        flow(&mut tree, &roots, &mut tr, 800.0, 600.0, 0.0);

        let txt = tree.get_layout(NodeId(501)).expect("text must have layout");
        let parent = tree
            .get_layout(NodeId(500))
            .expect("parent must have layout");
        // Child x relative to parent should be 20px (padding-inline-start)
        let rel_x = txt.x - parent.x;
        assert!(
            (rel_x - 20.0).abs() < 1.0,
            "text should be offset by padding-inline 20px, got rel_x={rel_x}"
        );
    }

    #[test]
    fn padding_block_logical_property_maps_to_top_bottom() {
        // padding-block: 15px should apply 15px top and bottom padding.
        let mut tree = Tree::new();
        tree.apply(Op::CreateNode {
            id: NodeId(510),
            node_type: NodeType::View,
        });
        tree.apply(Op::SetStyle {
            id: NodeId(510),
            key: "flex-direction".into(),
            value: "column".into(),
        });
        tree.apply(Op::SetStyle {
            id: NodeId(510),
            key: "width".into(),
            value: "100px".into(),
        });
        tree.apply(Op::SetStyle {
            id: NodeId(510),
            key: "height".into(),
            value: "80px".into(),
        });
        tree.apply(Op::SetStyle {
            id: NodeId(510),
            key: "padding-block".into(),
            value: "15px".into(),
        });
        tree.apply(Op::Insert {
            parent: NodeId(0),
            child: NodeId(510),
            anchor: None,
        });
        tree.apply(Op::CreateNode {
            id: NodeId(511),
            node_type: NodeType::Text,
        });
        tree.apply(Op::SetText {
            id: NodeId(511),
            value: "x".into(),
        });
        tree.apply(Op::Insert {
            parent: NodeId(510),
            child: NodeId(511),
            anchor: None,
        });

        let mut tr = rvst_text::TextRenderer::new();
        let roots: Vec<NodeId> = tree.root_children.clone();
        flow(&mut tree, &roots, &mut tr, 800.0, 600.0, 0.0);

        let txt = tree.get_layout(NodeId(511)).expect("text must have layout");
        let parent = tree
            .get_layout(NodeId(510))
            .expect("parent must have layout");
        let rel_y = txt.y - parent.y;
        assert!(
            (rel_y - 15.0).abs() < 1.0,
            "text should be offset by padding-block 15px, got rel_y={rel_y}"
        );
    }

    #[test]
    fn input_node_respects_explicit_width_and_flex_grow() {
        // Input with width:150px should use that width; Input with flex-grow:1 should expand.
        let mut tree = Tree::new();
        // Flex row container
        tree.apply(Op::CreateNode {
            id: NodeId(520),
            node_type: NodeType::View,
        });
        tree.apply(Op::SetStyle {
            id: NodeId(520),
            key: "display".into(),
            value: "flex".into(),
        });
        tree.apply(Op::SetStyle {
            id: NodeId(520),
            key: "width".into(),
            value: "300px".into(),
        });
        tree.apply(Op::SetStyle {
            id: NodeId(520),
            key: "height".into(),
            value: "50px".into(),
        });
        tree.apply(Op::Insert {
            parent: NodeId(0),
            child: NodeId(520),
            anchor: None,
        });
        // Fixed-width input
        tree.apply(Op::CreateNode {
            id: NodeId(521),
            node_type: NodeType::Input,
        });
        tree.apply(Op::SetStyle {
            id: NodeId(521),
            key: "width".into(),
            value: "150px".into(),
        });
        tree.apply(Op::Insert {
            parent: NodeId(520),
            child: NodeId(521),
            anchor: None,
        });
        // Flex-grow input
        tree.apply(Op::CreateNode {
            id: NodeId(522),
            node_type: NodeType::Input,
        });
        tree.apply(Op::SetStyle {
            id: NodeId(522),
            key: "flex-grow".into(),
            value: "1".into(),
        });
        tree.apply(Op::Insert {
            parent: NodeId(520),
            child: NodeId(522),
            anchor: None,
        });

        let mut tr = rvst_text::TextRenderer::new();
        let roots: Vec<NodeId> = tree.root_children.clone();
        flow(&mut tree, &roots, &mut tr, 800.0, 600.0, 0.0);

        let fixed = tree
            .get_layout(NodeId(521))
            .expect("fixed input must have layout");
        let grow = tree
            .get_layout(NodeId(522))
            .expect("grow input must have layout");
        assert!(
            (fixed.w - 150.0).abs() < 1.0,
            "fixed input width should be 150px, got {}",
            fixed.w
        );
        // flex-grow input fills remaining 300-150 = 150px
        assert!(
            (grow.w - 150.0).abs() < 1.0,
            "flex-grow input should fill remaining 150px, got {}",
            grow.w
        );
    }
}

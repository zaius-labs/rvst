use crate::node::{FormatFlag, NodeData, NodeKey};
use crate::state::{EditorState, TokenColorRange};
use peniko::Color;

pub struct InlayHintLayout {
    pub y: f32,              // paragraph y position
    pub x: f32,              // x position after text end
    pub shaped: rvst_text::ShapedGlyphs,  // pre-shaped hint text
}

pub struct UnderlineRect {
    pub x: f32,
    pub y: f32,      // baseline y (bottom of text line)
    pub width: f32,
    pub color: Color,
}

/// Result of laying out the editor content.
pub struct EditorLayout {
    /// One entry per paragraph, in document order.
    pub paragraphs: Vec<ParagraphLayout>,
    /// Cursor position (if selection is collapsed). In logical pixels relative to editor origin.
    pub cursor: Option<CursorRect>,
    /// Selection highlight rectangles (when selection is a range, not collapsed).
    pub selection_rects: Vec<CursorRect>,
    /// Inlay hint layouts (shaped text positioned after line end).
    pub inlay_hint_layouts: Vec<InlayHintLayout>,
    /// Diagnostic underline rects for squiggly rendering.
    pub underline_rects: Vec<UnderlineRect>,
    /// Total content height in logical pixels.
    pub content_height: f32,
}

#[derive(Debug, Clone)]
pub struct GlyphColorRun {
    pub color: Color,
    pub glyph_indices: std::ops::Range<usize>,
}

pub struct ParagraphLayout {
    pub key: NodeKey,
    pub y: f32,
    pub height: f32,
    pub text: String,
    pub glyphs: rvst_text::ShapedGlyphs,
    pub token_runs: Vec<GlyphColorRun>,
}

#[derive(Debug, Clone)]
pub struct CursorRect {
    pub x: f32,
    pub y: f32,
    pub width: f32,
    pub height: f32,
}

/// Split glyphs into consecutive color runs based on token color ranges.
///
/// Uses a 1:1 glyph-index = char-index approximation (monospace).
pub fn split_into_color_runs(
    glyph_count: usize,
    token_ranges: &[TokenColorRange],
    para_char_offset: usize,
    para_char_len: usize,
) -> Vec<GlyphColorRun> {
    if glyph_count == 0 {
        return vec![];
    }

    // Build per-glyph color array (default WHITE for dark backgrounds)
    let mut colors: Vec<Color> = vec![Color::WHITE; glyph_count];
    for range in token_ranges {
        // Convert absolute document offsets to paragraph-local
        let local_start = range.start.saturating_sub(para_char_offset);
        let local_end = range
            .end
            .saturating_sub(para_char_offset)
            .min(para_char_len)
            .min(glyph_count);
        if local_start >= local_end {
            continue;
        }
        for i in local_start..local_end {
            if i < colors.len() {
                colors[i] = range.color;
            }
        }
    }

    // Group consecutive same-color glyphs into runs
    let mut runs = Vec::new();
    let mut start = 0;
    for i in 1..colors.len() {
        if colors[i] != colors[start] {
            runs.push(GlyphColorRun {
                color: colors[start],
                glyph_indices: start..i,
            });
            start = i;
        }
    }
    runs.push(GlyphColorRun {
        color: colors[start],
        glyph_indices: start..colors.len(),
    });
    runs
}

/// Layout the editor state. Call this every frame (or when state changes).
pub fn layout_editor(
    state: &EditorState,
    tr: &mut rvst_text::TextRenderer,
    max_width: f32,
    font_size: f32,
    line_height: f32,
) -> EditorLayout {
    let mut paragraphs = Vec::new();
    let mut y = 0.0;
    let mut current_char_offset: usize = 0;
    let root = state.root();

    for &para_key in &root.children {
        let para = match state.node(para_key) {
            Some(n) => n,
            None => continue,
        };

        // Collect text from all child text nodes and check format flags
        let mut text = String::new();
        let mut is_bold = false;
        let mut _is_italic = false;
        for &child_key in &para.children {
            if let Some(child) = state.node(child_key) {
                if let NodeData::Text { ref content, format } = child.data {
                    text.push_str(content);
                    if format & (FormatFlag::Bold as u32) != 0 { is_bold = true; }
                    if format & (FormatFlag::Italic as u32) != 0 { _is_italic = true; }
                }
            }
        }

        // Shape the text
        let weight = if is_bold { Some(rvst_text::FontWeight::BOLD) } else { None };
        let glyphs = if text.is_empty() {
            rvst_text::ShapedGlyphs {
                font_data: vec![],
                font_size,
                glyphs: vec![],
                content_bounds: None,
            }
        } else {
            tr.shape_to_glyphs(&text, font_size, max_width, Some(line_height), weight)
        };

        // Always use line_height for consistent paragraph spacing and cursor height
        let para_height = line_height;

        // Compute color runs from decorations
        let token_runs = split_into_color_runs(
            glyphs.glyphs.len(),
            &state.decorations.token_colors,
            current_char_offset,
            text.len(),
        );

        // Advance char offset: paragraph text length + 1 for newline separator
        let text_len = text.len();

        paragraphs.push(ParagraphLayout {
            key: para_key,
            y,
            height: para_height,
            text,
            glyphs,
            token_runs,
        });

        current_char_offset += text_len + 1; // +1 for newline between paragraphs
        y += para_height;
    }

    // Layout inlay hints
    let hint_font_size = font_size * 0.85;
    let mut inlay_hint_layouts = Vec::new();
    for hint in &state.decorations.inlay_hints {
        let para_idx = hint.line as usize;
        if para_idx >= paragraphs.len() {
            continue;
        }
        let para = &paragraphs[para_idx];
        // Measure paragraph text width to position hint after it
        let text_end_x = if para.text.is_empty() {
            0.0
        } else {
            let (w, _) = tr.measure(&para.text, font_size, max_width, None, None);
            w
        };
        let shaped = tr.shape_to_glyphs(&hint.label, hint_font_size, max_width, Some(line_height), None);
        inlay_hint_layouts.push(InlayHintLayout {
            y: para.y,
            x: text_end_x + 16.0,
            shaped,
        });
    }

    // Layout diagnostic underlines
    let mut underline_rects = Vec::new();
    for diag in &state.decorations.diagnostics {
        let line_idx = diag.start_line as usize;
        if line_idx >= paragraphs.len() {
            continue;
        }
        let para = &paragraphs[line_idx];
        let glyph_count = para.glyphs.glyphs.len();

        let start_x = if glyph_count > 0 && (diag.start_char as usize) < glyph_count {
            para.glyphs.glyphs[diag.start_char as usize].x
        } else if glyph_count > 0 {
            let avg_w = para.glyphs.glyphs.last().map(|g| g.x / glyph_count as f32).unwrap_or(8.0);
            avg_w * diag.start_char as f32
        } else {
            8.0 * diag.start_char as f32
        };

        let end_x = if glyph_count > 0 && (diag.end_char as usize) < glyph_count {
            para.glyphs.glyphs[diag.end_char as usize].x
        } else if glyph_count > 0 {
            let last = para.glyphs.glyphs.last().unwrap();
            let avg_w = last.x / glyph_count as f32;
            (avg_w * diag.end_char as f32).min(last.x + avg_w)
        } else {
            8.0 * diag.end_char as f32
        };

        let width = (end_x - start_x).max(4.0);
        underline_rects.push(UnderlineRect {
            x: start_x,
            y: para.y + para.height,
            width,
            color: diag.color,
        });
    }

    // Compute cursor position
    let cursor = compute_cursor(state, &paragraphs, tr, font_size, max_width);
    let selection_rects = compute_selection_rects(state, &paragraphs, tr, font_size, max_width);

    EditorLayout {
        content_height: y,
        paragraphs,
        cursor,
        selection_rects,
        inlay_hint_layouts,
        underline_rects,
    }
}

fn compute_cursor(
    state: &EditorState,
    paragraphs: &[ParagraphLayout],
    tr: &mut rvst_text::TextRenderer,
    font_size: f32,
    max_width: f32,
) -> Option<CursorRect> {
    let sel = state.selection.as_ref()?;
    if !sel.is_collapsed() {
        return None;
    }

    // Find which paragraph contains the focused text node
    let focus_key = sel.focus.key;
    let focus_node = state.node(focus_key)?;
    let para_key = focus_node.parent?;

    // Find the paragraph layout
    let para_layout = paragraphs.iter().find(|p| p.key == para_key)?;

    // Compute cursor X from character offset
    let offset = sel.focus.offset;
    let cursor_x = if offset == 0 || para_layout.text.is_empty() {
        0.0
    } else {
        // Measure the text up to the cursor offset
        let prefix: String = para_layout.text.chars().take(offset).collect();
        let (w, _) = tr.measure(&prefix, font_size, max_width, None, None);
        w
    };

    Some(CursorRect {
        x: cursor_x,
        y: para_layout.y,
        width: 1.5,
        height: para_layout.height,
    })
}

fn compute_selection_rects(
    state: &EditorState,
    paragraphs: &[ParagraphLayout],
    tr: &mut rvst_text::TextRenderer,
    font_size: f32,
    max_width: f32,
) -> Vec<CursorRect> {
    let sel = match state.selection.as_ref() {
        Some(s) if !s.is_collapsed() => s,
        _ => return vec![],
    };
    // For same-node selection only (cross-node in later phase)
    if sel.anchor.key != sel.focus.key {
        return vec![];
    }

    let (start, end) = if sel.anchor.offset <= sel.focus.offset {
        (sel.anchor.offset, sel.focus.offset)
    } else {
        (sel.focus.offset, sel.anchor.offset)
    };

    let node = match state.node(sel.anchor.key) {
        Some(n) => n,
        None => return vec![],
    };
    let para_key = match node.parent {
        Some(k) => k,
        None => return vec![],
    };
    let para = match paragraphs.iter().find(|p| p.key == para_key) {
        Some(p) => p,
        None => return vec![],
    };

    if para.text.is_empty() {
        return vec![];
    }

    let chars: Vec<char> = para.text.chars().collect();
    let start_prefix: String = chars[..start].iter().collect();
    let end_prefix: String = chars[..end].iter().collect();
    let x1 = if start == 0 {
        0.0
    } else {
        let (w, _) = tr.measure(&start_prefix, font_size, max_width, None, None);
        w
    };
    let (x2, _) = tr.measure(&end_prefix, font_size, max_width, None, None);

    vec![CursorRect {
        x: x1,
        y: para.y,
        width: x2 - x1,
        height: para.height,
    }]
}

/// Given a click position (x, y) relative to the editor content origin,
/// find the nearest character position in the document.
pub fn hit_test_position(
    x: f32,
    y: f32,
    layout: &EditorLayout,
    state: &EditorState,
    tr: &mut rvst_text::TextRenderer,
    font_size: f32,
    max_width: f32,
) -> Option<crate::selection::SelectionPoint> {
    // 1. Find which paragraph the y coordinate falls in
    let para = layout
        .paragraphs
        .iter()
        .find(|p| y >= p.y && y < p.y + p.height)
        .or_else(|| layout.paragraphs.last())?;

    // 2. Find the text node key for this paragraph
    let para_node = state.node(para.key)?;
    let text_key = para_node.children.first().copied()?;

    // 3. If empty text, offset is 0
    if para.text.is_empty() {
        return Some(crate::selection::SelectionPoint {
            key: text_key,
            offset: 0,
        });
    }

    // 4. Linear scan: measure prefixes of increasing length,
    //    find the offset where measured width is closest to x
    let chars: Vec<char> = para.text.chars().collect();
    let mut best_offset = 0;
    let mut best_dist = x.abs(); // distance if cursor is at offset 0

    for i in 1..=chars.len() {
        let prefix: String = chars[..i].iter().collect();
        let (w, _) = tr.measure(&prefix, font_size, max_width, None, None);
        let dist = (w - x).abs();
        if dist < best_dist {
            best_dist = dist;
            best_offset = i;
        }
    }

    Some(crate::selection::SelectionPoint {
        key: text_key,
        offset: best_offset,
    })
}

/// Render the editor layout into a Vello Scene at the given origin.
///
/// Follows the same pattern as rvst-engine/src/composite.rs:
/// - `Blob::from(font_data)` -> `FontData::new(blob, 0)`
/// - `scene.draw_glyphs(&font_data).font_size(...).transform(...).brush(...).draw(...)`
pub fn render_editor(layout: &EditorLayout, scene: &mut vello::Scene, origin_x: f32, origin_y: f32) {
    use vello::kurbo::{Affine, BezPath, Point, Rect, Stroke, Vec2};
    use vello::peniko::{Blob, Brush, Color, Fill, FontData};

    // Render selection highlights (before text so text is on top)
    for rect in &layout.selection_rects {
        let sx = (origin_x + rect.x) as f64;
        let sy = (origin_y + rect.y) as f64;
        let sw = rect.width as f64;
        let sh = rect.height as f64;
        scene.fill(
            Fill::NonZero,
            Affine::IDENTITY,
            Color::from_rgba8(66, 133, 244, 80),
            None,
            &Rect::new(sx, sy, sx + sw, sy + sh),
        );
    }

    // Render each paragraph's glyphs, split by color runs
    for para in &layout.paragraphs {
        if para.glyphs.glyphs.is_empty() || para.glyphs.font_data.is_empty() {
            continue;
        }

        let blob: Blob<u8> = Blob::from(para.glyphs.font_data.clone());
        let font_data = FontData::new(blob, 0);
        let transform = Affine::translate(Vec2::new(
            origin_x as f64,
            (origin_y + para.y) as f64,
        ));

        if para.token_runs.is_empty() {
            // Fallback: no decoration data, draw all glyphs in white
            scene
                .draw_glyphs(&font_data)
                .font_size(para.glyphs.font_size)
                .transform(transform)
                .brush(&Brush::Solid(Color::WHITE))
                .draw(
                    Fill::NonZero,
                    para.glyphs.glyphs.iter().map(|g| vello::Glyph {
                        id: g.id,
                        x: g.x,
                        y: g.y,
                    }),
                );
        } else {
            // Draw each color run separately
            for run in &para.token_runs {
                let glyphs_slice = &para.glyphs.glyphs[run.glyph_indices.clone()];
                if glyphs_slice.is_empty() {
                    continue;
                }
                scene
                    .draw_glyphs(&font_data)
                    .font_size(para.glyphs.font_size)
                    .transform(transform)
                    .brush(&Brush::Solid(run.color))
                    .draw(
                        Fill::NonZero,
                        glyphs_slice.iter().map(|g| vello::Glyph {
                            id: g.id,
                            x: g.x,
                            y: g.y,
                        }),
                    );
            }
        }
    }

    // Render inlay hints (dimmed text after line end)
    for hint in &layout.inlay_hint_layouts {
        if hint.shaped.glyphs.is_empty() || hint.shaped.font_data.is_empty() {
            continue;
        }
        let blob: Blob<u8> = Blob::from(hint.shaped.font_data.clone());
        let font_data = FontData::new(blob, 0);
        scene
            .draw_glyphs(&font_data)
            .font_size(hint.shaped.font_size)
            .transform(Affine::translate(Vec2::new(
                (origin_x + hint.x) as f64,
                (origin_y + hint.y) as f64,
            )))
            .brush(&Brush::Solid(Color::from_rgba8(156, 163, 175, 160))) // gray-400 @ 63% alpha
            .draw(
                Fill::NonZero,
                hint.shaped.glyphs.iter().map(|g| vello::Glyph {
                    id: g.id,
                    x: g.x,
                    y: g.y,
                }),
            );
    }

    // Render diagnostic squiggly underlines
    for rect in &layout.underline_rects {
        let mut path = BezPath::new();
        let wave_height = 1.5f64;
        let wave_width = 3.0f64;
        let y_base = (origin_y + rect.y) as f64;
        let x_start = (origin_x + rect.x) as f64;
        let x_end = x_start + rect.width as f64;

        path.move_to(Point::new(x_start, y_base));
        let mut x = x_start;
        let mut up = true;
        while x < x_end {
            let next_x = (x + wave_width).min(x_end);
            let y_offset = if up { -wave_height } else { wave_height };
            path.line_to(Point::new(next_x, y_base + y_offset));
            up = !up;
            x = next_x;
        }

        scene.stroke(
            &Stroke::new(1.0),
            Affine::IDENTITY,
            rect.color,
            None,
            &path,
        );
    }

    // Render cursor
    if let Some(cursor) = &layout.cursor {
        let cx = (origin_x + cursor.x) as f64;
        let cy = (origin_y + cursor.y) as f64;
        let cw = cursor.width as f64;
        let ch = cursor.height as f64;

        scene.fill(
            Fill::NonZero,
            Affine::IDENTITY,
            Color::WHITE,
            None,
            &Rect::new(cx, cy, cx + cw, cy + ch),
        );
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::command::EditorCommand;
    use crate::state::EditorState;
    use crate::transaction::apply_command;

    #[test]
    fn layout_empty_editor() {
        let mut state = EditorState::with_paragraph();
        state.select_start();
        let mut tr = rvst_text::TextRenderer::new();
        let layout = layout_editor(&state, &mut tr, 700.0, 16.0, 25.6);
        assert_eq!(layout.paragraphs.len(), 1);
        assert!(layout.cursor.is_some());
        assert_eq!(layout.cursor.as_ref().unwrap().x, 0.0);
    }

    #[test]
    fn layout_with_text() {
        let mut state = EditorState::with_paragraph();
        state.select_start();
        apply_command(&mut state, EditorCommand::InsertText("hello".into()));
        let mut tr = rvst_text::TextRenderer::new();
        let layout = layout_editor(&state, &mut tr, 700.0, 16.0, 25.6);
        assert_eq!(layout.paragraphs.len(), 1);
        assert_eq!(layout.paragraphs[0].text, "hello");
        assert!(layout.cursor.is_some());
        assert!(layout.cursor.as_ref().unwrap().x > 0.0);
    }

    #[test]
    fn layout_two_paragraphs() {
        let mut state = EditorState::with_paragraph();
        state.select_start();
        apply_command(&mut state, EditorCommand::InsertText("first".into()));
        apply_command(&mut state, EditorCommand::InsertParagraph);
        apply_command(&mut state, EditorCommand::InsertText("second".into()));
        let mut tr = rvst_text::TextRenderer::new();
        let layout = layout_editor(&state, &mut tr, 700.0, 16.0, 25.6);
        assert_eq!(layout.paragraphs.len(), 2);
        assert_eq!(layout.paragraphs[0].text, "first");
        assert_eq!(layout.paragraphs[1].text, "second");
        assert!(layout.paragraphs[1].y > 0.0);
    }

    #[test]
    fn cursor_at_start_is_zero() {
        let mut state = EditorState::with_paragraph();
        state.select_start();
        apply_command(&mut state, EditorCommand::InsertText("abc".into()));
        // Move cursor to start
        apply_command(&mut state, EditorCommand::MoveLeft);
        apply_command(&mut state, EditorCommand::MoveLeft);
        apply_command(&mut state, EditorCommand::MoveLeft);
        let mut tr = rvst_text::TextRenderer::new();
        let layout = layout_editor(&state, &mut tr, 700.0, 16.0, 25.6);
        assert!(layout.cursor.is_some());
        assert_eq!(layout.cursor.as_ref().unwrap().x, 0.0);
    }

    #[test]
    fn hit_test_at_start() {
        let mut state = EditorState::with_paragraph();
        state.select_start();
        apply_command(&mut state, EditorCommand::InsertText("hello world".into()));
        let mut tr = rvst_text::TextRenderer::new();
        let layout = layout_editor(&state, &mut tr, 700.0, 16.0, 25.6);
        let point = hit_test_position(0.0, 0.0, &layout, &state, &mut tr, 16.0, 700.0).unwrap();
        assert_eq!(point.offset, 0);
    }

    #[test]
    fn hit_test_past_end() {
        let mut state = EditorState::with_paragraph();
        state.select_start();
        apply_command(&mut state, EditorCommand::InsertText("hi".into()));
        let mut tr = rvst_text::TextRenderer::new();
        let layout = layout_editor(&state, &mut tr, 700.0, 16.0, 25.6);
        let point =
            hit_test_position(9999.0, 0.0, &layout, &state, &mut tr, 16.0, 700.0).unwrap();
        assert_eq!(point.offset, 2); // "hi" has 2 chars
    }

    #[test]
    fn hit_test_second_paragraph() {
        let mut state = EditorState::with_paragraph();
        state.select_start();
        apply_command(&mut state, EditorCommand::InsertText("first".into()));
        apply_command(&mut state, EditorCommand::InsertParagraph);
        apply_command(&mut state, EditorCommand::InsertText("second".into()));
        let mut tr = rvst_text::TextRenderer::new();
        let layout = layout_editor(&state, &mut tr, 700.0, 16.0, 25.6);
        // Click in the second paragraph area (y > first paragraph height)
        let point = hit_test_position(0.0, 30.0, &layout, &state, &mut tr, 16.0, 700.0).unwrap();
        // Should be in the second paragraph's text node, not the first
        let first_text = state.first_text_key().unwrap();
        assert_ne!(point.key, first_text);
    }

    #[test]
    fn selection_rects_computed() {
        let mut state = EditorState::with_paragraph();
        state.select_start();
        apply_command(&mut state, EditorCommand::InsertText("hello".into()));
        apply_command(&mut state, EditorCommand::MoveToLineStart);
        apply_command(&mut state, EditorCommand::SelectRight);
        apply_command(&mut state, EditorCommand::SelectRight);
        let mut tr = rvst_text::TextRenderer::new();
        let layout = layout_editor(&state, &mut tr, 700.0, 16.0, 25.6);
        assert_eq!(layout.selection_rects.len(), 1);
        assert!(layout.selection_rects[0].width > 0.0);
    }

    #[test]
    fn render_does_not_panic() {
        let mut state = EditorState::with_paragraph();
        state.select_start();
        apply_command(&mut state, EditorCommand::InsertText("test".into()));
        let mut tr = rvst_text::TextRenderer::new();
        let layout = layout_editor(&state, &mut tr, 700.0, 16.0, 25.6);
        let mut scene = vello::Scene::new();
        render_editor(&layout, &mut scene, 0.0, 0.0);
    }
}

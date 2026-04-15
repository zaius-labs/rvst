pub use cosmic_text::Weight as FontWeight;
use cosmic_text::{Attrs, Buffer, Color, FontSystem, Metrics, Shaping, SwashCache, Weight};

use parley::{FontContext, LayoutContext, OverflowWrap, StyleProperty};
pub use parley::style::WordBreakStrength;

use std::collections::HashMap;

const LINE_HEIGHT_FACTOR: f32 = 1.2;
const MEASURE_CACHE_MAX: usize = 10_000;

pub const FONT_SIZE: f32 = 16.0;
pub const WINDOW_MARGIN: f32 = 0.0;

#[derive(Debug, Clone, Copy, PartialEq)]
pub enum TextAlign {
    Left,
    Center,
    Right,
}

/// Word-breaking behaviour for text layout.
/// Maps CSS `overflow-wrap` and `word-break` to Parley style properties.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash, Default)]
pub struct WordBreaking {
    /// CSS `overflow-wrap`: `break-word` or `anywhere`.
    pub overflow_wrap: OverflowWrapMode,
    /// CSS `word-break`: `break-all` or `keep-all`.
    pub word_break: WordBreakMode,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash, Default)]
pub enum OverflowWrapMode {
    #[default]
    Normal,
    BreakWord,
    Anywhere,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash, Default)]
pub enum WordBreakMode {
    #[default]
    Normal,
    BreakAll,
    KeepAll,
}

/// Cache key for text measurement results.
#[derive(Hash, Eq, PartialEq)]
struct MeasureCacheKey {
    text: String,
    font_size_bits: u32,
    max_width_bits: u32,
    line_height_bits: Option<u32>,
    weight: u16,
    word_breaking: Option<WordBreaking>,
}

pub struct TextRenderer {
    font_system: FontSystem,
    swash_cache: SwashCache,
    parley_fcx: FontContext,
    parley_lcx: LayoutContext<[u8; 4]>,
    measure_cache: HashMap<MeasureCacheKey, (f32, f32)>,
}

pub struct ShapedText {
    pub pixels: Vec<u8>,
    pub width: u32,
    pub height: u32,
}

#[derive(Debug, Clone)]
pub struct GlyphInfo {
    pub id: u32,
    pub x: f32,
    pub y: f32,
    pub advance: f32,
}

#[derive(Debug)]
pub struct ShapedGlyphs {
    pub font_data: Vec<u8>,
    pub font_size: f32,
    pub glyphs: Vec<GlyphInfo>,
    /// Actual content bounds: (min_x, min_y, max_x, max_y) relative to layout origin.
    pub content_bounds: Option<(f32, f32, f32, f32)>,
}

impl TextRenderer {
    pub fn new() -> Self {
        Self {
            font_system: FontSystem::new(),
            swash_cache: SwashCache::new(),
            parley_fcx: FontContext::default(),
            parley_lcx: LayoutContext::new(),
            measure_cache: HashMap::new(),
        }
    }

    /// Register a custom font from raw TTF/OTF bytes.
    /// Clears the measurement cache since new fonts may change metrics.
    pub fn register_font(&mut self, font_data: Vec<u8>) -> Option<String> {
        use parley::fontique::Blob;
        let blob: Blob<u8> = font_data.into();
        let results = self.parley_fcx.collection.register_fonts(blob, None);
        if results.is_empty() {
            return None;
        }
        self.measure_cache.clear();
        let (family_id, _) = &results[0];
        self.parley_fcx
            .collection
            .family_name(*family_id)
            .map(|s| s.to_string())
    }

    /// Render text to an RGBA pixel buffer (cosmic-text, used for shape_to_pixels only).
    pub fn shape_to_pixels(
        &mut self,
        text: &str,
        font_size: f32,
        canvas_w: u32,
        canvas_h: u32,
        color: [u8; 3],
    ) -> ShapedText {
        let metrics = Metrics::new(font_size, font_size * LINE_HEIGHT_FACTOR);
        let mut buffer = Buffer::new(&mut self.font_system, metrics);
        buffer.set_size(
            &mut self.font_system,
            Some(canvas_w as f32),
            Some(canvas_h as f32),
        );
        buffer.set_text(
            &mut self.font_system,
            text,
            &Attrs::new(),
            Shaping::Advanced,
            None,
        );

        let mut pixels = vec![0u8; (canvas_w * canvas_h * 4) as usize];
        buffer.draw(
            &mut self.font_system,
            &mut self.swash_cache,
            Color::rgb(color[0], color[1], color[2]),
            |x, y, w, h, color| {
                if x < 0 || y < 0 {
                    return;
                }
                let (x, y) = (x as u32, y as u32);
                for dy in 0..h {
                    for dx in 0..w {
                        let px = x + dx;
                        let py = y + dy;
                        if px >= canvas_w || py >= canvas_h {
                            continue;
                        }
                        let idx = ((py * canvas_w + px) * 4) as usize;
                        pixels[idx] = color.r();
                        pixels[idx + 1] = color.g();
                        pixels[idx + 2] = color.b();
                        pixels[idx + 3] = color.a();
                    }
                }
            },
        );
        ShapedText {
            pixels,
            width: canvas_w,
            height: canvas_h,
        }
    }

    /// Shape text to glyph IDs + positions for Vello rendering (Parley).
    pub fn shape_to_glyphs(
        &mut self,
        text: &str,
        font_size: f32,
        max_width: f32,
        line_height_px: Option<f32>,
        weight: Option<Weight>,
    ) -> ShapedGlyphs {
        self.parley_shape_to_glyphs(text, font_size, max_width, line_height_px, weight, None)
    }

    /// Shape text with word-breaking options.
    pub fn shape_to_glyphs_wb(
        &mut self,
        text: &str,
        font_size: f32,
        max_width: f32,
        line_height_px: Option<f32>,
        weight: Option<Weight>,
        word_breaking: Option<&WordBreaking>,
    ) -> ShapedGlyphs {
        self.parley_shape_to_glyphs(text, font_size, max_width, line_height_px, weight, word_breaking)
    }

    /// Measure text dimensions (Parley).
    pub fn measure(
        &mut self,
        text: &str,
        font_size: f32,
        max_width: f32,
        line_height_px: Option<f32>,
        weight: Option<Weight>,
    ) -> (f32, f32) {
        self.parley_measure(text, font_size, max_width, line_height_px, weight, None)
    }

    /// Measure text dimensions with word-breaking options.
    pub fn measure_wb(
        &mut self,
        text: &str,
        font_size: f32,
        max_width: f32,
        line_height_px: Option<f32>,
        weight: Option<Weight>,
        word_breaking: Option<&WordBreaking>,
    ) -> (f32, f32) {
        self.parley_measure(text, font_size, max_width, line_height_px, weight, word_breaking)
    }

    /// Cached version of measure — avoids reshaping identical text across layout passes.
    pub fn measure_cached(
        &mut self,
        text: &str,
        font_size: f32,
        max_width: f32,
        line_height_px: Option<f32>,
        weight: Option<Weight>,
    ) -> (f32, f32) {
        self.measure_cached_wb(text, font_size, max_width, line_height_px, weight, None)
    }

    /// Cached version of measure with word-breaking options.
    pub fn measure_cached_wb(
        &mut self,
        text: &str,
        font_size: f32,
        max_width: f32,
        line_height_px: Option<f32>,
        weight: Option<Weight>,
        word_breaking: Option<&WordBreaking>,
    ) -> (f32, f32) {
        let key = MeasureCacheKey {
            text: text.to_string(),
            font_size_bits: font_size.to_bits(),
            max_width_bits: max_width.to_bits(),
            line_height_bits: line_height_px.map(|v| v.to_bits()),
            weight: weight.unwrap_or(Weight::NORMAL).0,
            word_breaking: word_breaking.copied(),
        };
        if let Some(&result) = self.measure_cache.get(&key) {
            return result;
        }
        let result = self.measure_wb(text, font_size, max_width, line_height_px, weight, word_breaking);
        if self.measure_cache.len() >= MEASURE_CACHE_MAX {
            self.measure_cache.clear();
        }
        self.measure_cache.insert(key, result);
        result
    }

    /// Clear the measurement cache (call when fonts change or on explicit invalidation).
    pub fn clear_cache(&mut self) {
        self.measure_cache.clear();
    }

    // -----------------------------------------------------------------------
    // Parley implementation
    // -----------------------------------------------------------------------

    /// Push overflow-wrap / word-break style properties onto a Parley builder.
    fn push_word_breaking(
        builder: &mut parley::RangedBuilder<'_, [u8; 4]>,
        wb: &WordBreaking,
    ) {
        match wb.overflow_wrap {
            OverflowWrapMode::BreakWord => {
                builder.push_default(StyleProperty::OverflowWrap(OverflowWrap::BreakWord));
            }
            OverflowWrapMode::Anywhere => {
                builder.push_default(StyleProperty::OverflowWrap(OverflowWrap::Anywhere));
            }
            OverflowWrapMode::Normal => {}
        }
        match wb.word_break {
            WordBreakMode::BreakAll => {
                builder.push_default(StyleProperty::WordBreak(WordBreakStrength::BreakAll));
            }
            WordBreakMode::KeepAll => {
                builder.push_default(StyleProperty::WordBreak(WordBreakStrength::KeepAll));
            }
            WordBreakMode::Normal => {}
        }
    }

    fn parley_layout(
        &mut self,
        text: &str,
        font_size: f32,
        max_width: f32,
        line_height_px: Option<f32>,
        weight: Option<Weight>,
        word_breaking: Option<&WordBreaking>,
    ) -> parley::Layout<[u8; 4]> {
        self.parley_layout_with_family(text, font_size, max_width, line_height_px, weight, None, word_breaking)
    }

    #[allow(clippy::too_many_arguments)]
    fn parley_layout_with_family(
        &mut self,
        text: &str,
        font_size: f32,
        max_width: f32,
        line_height_px: Option<f32>,
        weight: Option<Weight>,
        font_family: Option<&str>,
        word_breaking: Option<&WordBreaking>,
    ) -> parley::Layout<[u8; 4]> {
        let line_height = line_height_px.unwrap_or(font_size * LINE_HEIGHT_FACTOR);
        let mut builder = self
            .parley_lcx
            .ranged_builder(&mut self.parley_fcx, text, 1.0, false);
        builder.push_default(StyleProperty::FontSize(font_size));
        builder.push_default(StyleProperty::LineHeight(
            parley::style::LineHeight::Absolute(line_height),
        ));
        let fw = parley::style::FontWeight::new(weight.unwrap_or(Weight::NORMAL).0 as f32);
        builder.push_default(StyleProperty::FontWeight(fw));
        if let Some(family) = font_family {
            builder.push_default(StyleProperty::FontStack(parley::style::FontStack::Single(
                parley::style::FontFamily::Named(std::borrow::Cow::Borrowed(family)),
            )));
        }
        if let Some(wb) = word_breaking {
            Self::push_word_breaking(&mut builder, wb);
        }
        let mut layout = builder.build(text);
        layout.break_all_lines(Some(max_width));
        layout.align(
            Some(max_width),
            parley::layout::Alignment::Start,
            Default::default(),
        );
        layout
    }

    /// Same as parley_layout_with_family but with explicit text alignment.
    #[allow(clippy::too_many_arguments)]
    fn parley_layout_aligned(
        &mut self,
        text: &str,
        font_size: f32,
        max_width: f32,
        line_height_px: Option<f32>,
        weight: Option<Weight>,
        font_family: Option<&str>,
        align: TextAlign,
        word_breaking: Option<&WordBreaking>,
    ) -> parley::Layout<[u8; 4]> {
        let line_height = line_height_px.unwrap_or(font_size * LINE_HEIGHT_FACTOR);
        let mut builder = self
            .parley_lcx
            .ranged_builder(&mut self.parley_fcx, text, 1.0, false);
        builder.push_default(StyleProperty::FontSize(font_size));
        builder.push_default(StyleProperty::LineHeight(
            parley::style::LineHeight::Absolute(line_height),
        ));
        let fw = parley::style::FontWeight::new(weight.unwrap_or(Weight::NORMAL).0 as f32);
        builder.push_default(StyleProperty::FontWeight(fw));
        if let Some(family) = font_family {
            builder.push_default(StyleProperty::FontStack(parley::style::FontStack::Single(
                parley::style::FontFamily::Named(std::borrow::Cow::Borrowed(family)),
            )));
        }
        if let Some(wb) = word_breaking {
            Self::push_word_breaking(&mut builder, wb);
        }
        let mut layout = builder.build(text);
        layout.break_all_lines(Some(max_width));
        let parley_align = match align {
            TextAlign::Center => parley::layout::Alignment::Center,
            TextAlign::Right => parley::layout::Alignment::End,
            TextAlign::Left => parley::layout::Alignment::Start,
        };
        layout.align(Some(max_width), parley_align, Default::default());
        layout
    }

    /// Shape text with explicit alignment. Parley handles centering via layout.align().
    pub fn shape_to_glyphs_aligned(
        &mut self,
        text: &str,
        font_size: f32,
        max_width: f32,
        line_height_px: Option<f32>,
        weight: Option<Weight>,
        align: TextAlign,
    ) -> ShapedGlyphs {
        self.shape_to_glyphs_aligned_wb(text, font_size, max_width, line_height_px, weight, align, None)
    }

    /// Shape text with explicit alignment and word-breaking.
    #[allow(clippy::too_many_arguments)]
    pub fn shape_to_glyphs_aligned_wb(
        &mut self,
        text: &str,
        font_size: f32,
        max_width: f32,
        line_height_px: Option<f32>,
        weight: Option<Weight>,
        align: TextAlign,
        word_breaking: Option<&WordBreaking>,
    ) -> ShapedGlyphs {
        if text.is_empty() {
            return ShapedGlyphs {
                font_data: vec![],
                font_size,
                glyphs: vec![],
                content_bounds: None,
            };
        }
        let layout = self.parley_layout_aligned(
            text,
            font_size,
            max_width,
            line_height_px,
            weight,
            None,
            align,
            word_breaking,
        );
        let (glyphs, font_data) = extract_glyphs(&layout);
        let content_bounds = compute_glyph_bounds(&glyphs, font_size, &font_data);
        ShapedGlyphs {
            font_data,
            font_size,
            glyphs,
            content_bounds,
        }
    }

    /// Aligned shaping with explicit font family.
    pub fn shape_to_glyphs_aligned_with_family(
        &mut self,
        text: &str,
        font_size: f32,
        max_width: f32,
        line_height_px: Option<f32>,
        weight: Option<Weight>,
        align: TextAlign,
        font_family: &str,
    ) -> ShapedGlyphs {
        self.shape_to_glyphs_aligned_with_family_wb(text, font_size, max_width, line_height_px, weight, align, font_family, None)
    }

    /// Aligned shaping with explicit font family and word-breaking.
    #[allow(clippy::too_many_arguments)]
    pub fn shape_to_glyphs_aligned_with_family_wb(
        &mut self,
        text: &str,
        font_size: f32,
        max_width: f32,
        line_height_px: Option<f32>,
        weight: Option<Weight>,
        align: TextAlign,
        font_family: &str,
        word_breaking: Option<&WordBreaking>,
    ) -> ShapedGlyphs {
        if text.is_empty() {
            return ShapedGlyphs {
                font_data: vec![],
                font_size,
                glyphs: vec![],
                content_bounds: None,
            };
        }
        let layout = self.parley_layout_aligned(
            text,
            font_size,
            max_width,
            line_height_px,
            weight,
            Some(font_family),
            align,
            word_breaking,
        );
        let (glyphs, font_data) = extract_glyphs(&layout);
        let content_bounds = compute_glyph_bounds(&glyphs, font_size, &font_data);
        ShapedGlyphs {
            font_data,
            font_size,
            glyphs,
            content_bounds,
        }
    }

    fn parley_measure(
        &mut self,
        text: &str,
        font_size: f32,
        max_width: f32,
        line_height_px: Option<f32>,
        weight: Option<Weight>,
        word_breaking: Option<&WordBreaking>,
    ) -> (f32, f32) {
        if text.is_empty() {
            return (0.0, 0.0);
        }
        let layout = self.parley_layout(text, font_size, max_width, line_height_px, weight, word_breaking);
        let mut w = layout.width();
        for line in layout.lines() {
            for item in line.items() {
                if let parley::layout::PositionedLayoutItem::GlyphRun(run) = item {
                    for glyph in run.positioned_glyphs() {
                        let right = glyph.x + glyph.advance;
                        if right > w {
                            w = right;
                        }
                    }
                }
            }
        }
        (w.ceil(), layout.height().ceil())
    }

    fn parley_shape_to_glyphs(
        &mut self,
        text: &str,
        font_size: f32,
        max_width: f32,
        line_height_px: Option<f32>,
        weight: Option<Weight>,
        word_breaking: Option<&WordBreaking>,
    ) -> ShapedGlyphs {
        if text.is_empty() {
            return ShapedGlyphs {
                font_data: vec![],
                font_size,
                glyphs: vec![],
                content_bounds: None,
            };
        }
        let layout = self.parley_layout(text, font_size, max_width, line_height_px, weight, word_breaking);
        let (glyphs, font_data) = extract_glyphs(&layout);
        let content_bounds = compute_glyph_bounds(&glyphs, font_size, &font_data);
        ShapedGlyphs {
            font_data,
            font_size,
            glyphs,
            content_bounds,
        }
    }

    /// Shape text with a specific font family (e.g. "Phosphor" for icon fonts).
    pub fn shape_to_glyphs_with_family(
        &mut self,
        text: &str,
        font_size: f32,
        max_width: f32,
        font_family: &str,
    ) -> ShapedGlyphs {
        self.shape_to_glyphs_with_family_wb(text, font_size, max_width, font_family, None)
    }

    /// Shape text with a specific font family and word-breaking options.
    pub fn shape_to_glyphs_with_family_wb(
        &mut self,
        text: &str,
        font_size: f32,
        max_width: f32,
        font_family: &str,
        word_breaking: Option<&WordBreaking>,
    ) -> ShapedGlyphs {
        if text.is_empty() {
            return ShapedGlyphs {
                font_data: vec![],
                font_size,
                glyphs: vec![],
                content_bounds: None,
            };
        }
        let layout = self.parley_layout_with_family(
            text,
            font_size,
            max_width,
            None,
            None,
            Some(font_family),
            word_breaking,
        );
        let (glyphs, font_data) = extract_glyphs(&layout);
        let content_bounds = compute_glyph_bounds(&glyphs, font_size, &font_data);
        ShapedGlyphs {
            font_data,
            font_size,
            glyphs,
            content_bounds,
        }
    }
}

/// Extract glyphs and font data from a Parley layout.
fn extract_glyphs(layout: &parley::Layout<[u8; 4]>) -> (Vec<GlyphInfo>, Vec<u8>) {
    let mut glyphs = Vec::new();
    let mut font_data: Vec<u8> = Vec::new();
    for line in layout.lines() {
        for item in line.items() {
            if let parley::layout::PositionedLayoutItem::GlyphRun(run) = item {
                if font_data.is_empty() {
                    font_data = run.run().font().data.data().to_vec();
                }
                for glyph in run.positioned_glyphs() {
                    glyphs.push(GlyphInfo {
                        id: glyph.id,
                        x: glyph.x,
                        y: glyph.y,
                        advance: glyph.advance,
                    });
                }
            }
        }
    }
    (glyphs, font_data)
}

/// Compute content dimensions of shaped glyphs using actual font metrics.
/// Returns (content_width, content_height, first_glyph_x, ascent).
/// Uses skrifa to read real ascent/descent from the font data when available,
/// falling back to 80%/20% approximation if font_data is empty.
fn compute_glyph_bounds(
    glyphs: &[GlyphInfo],
    font_size: f32,
    font_data: &[u8],
) -> Option<(f32, f32, f32, f32)> {
    if glyphs.is_empty() {
        return None;
    }
    let mut min_x = f32::MAX;
    let mut max_x = f32::MIN;
    for g in glyphs {
        min_x = min_x.min(g.x);
        max_x = max_x.max(g.x + g.advance);
    }
    let content_w = max_x - min_x;
    // Use real font metrics when available, fall back to approximation
    let (ascent, descent) = if !font_data.is_empty() {
        if let Some((a, d, _)) = font_metrics(font_data, font_size) {
            (a, d)
        } else {
            (font_size * 0.8, font_size * 0.2)
        }
    } else {
        (font_size * 0.8, font_size * 0.2)
    };
    let content_h = ascent + descent;
    Some((content_w, content_h, min_x, ascent))
}

/// Read actual font-level metrics (ascent, descent, line_gap) from the font data.
/// Returns (ascent, descent, line_gap) in pixels at the given font_size.
pub fn font_metrics(font_data: &[u8], font_size: f32) -> Option<(f32, f32, f32)> {
    use skrifa::instance::{LocationRef, Size};
    use skrifa::metrics::Metrics;
    use skrifa::FontRef;
    let font = FontRef::from_index(font_data, 0).ok()?;
    let size = Size::new(font_size);
    let metrics = Metrics::new(&font, size, LocationRef::default());
    Some((metrics.ascent, metrics.descent.abs(), metrics.leading))
}

/// Compute precise glyph bounding box from font data using skrifa.
/// Returns (x_min, y_min, width, height) in pixels at the given font_size.
/// y_min is relative to baseline (negative = above baseline).
pub fn glyph_pixel_bounds(
    font_data: &[u8],
    glyph_id: u32,
    font_size: f32,
) -> Option<(f32, f32, f32, f32)> {
    use skrifa::instance::{LocationRef, Size};
    use skrifa::metrics::GlyphMetrics;
    use skrifa::FontRef;
    let font = FontRef::from_index(font_data, 0).ok()?;
    let size = Size::new(font_size);
    let gm = GlyphMetrics::new(&font, size, LocationRef::default());
    let gid = skrifa::GlyphId::new(glyph_id);
    let bbox = gm.bounds(gid)?;
    // bbox is in pixel coordinates at the given size.
    // In font coordinates: y-up (y_max = top, y_min = bottom).
    // For rendering (y-down): flip y. top = -y_max, bottom = -y_min.
    let w = bbox.x_max - bbox.x_min;
    let h = bbox.y_max - bbox.y_min;
    Some((bbox.x_min, -bbox.y_max, w, h))
}

impl Default for TextRenderer {
    fn default() -> Self {
        Self::new()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn shapes_text_to_pixels() {
        let mut renderer = TextRenderer::new();
        let result = renderer.shape_to_pixels("Count: 0", 24.0, 400, 60, [0xFF, 0xFF, 0xFF]);
        assert_eq!(result.width, 400);
        assert_eq!(result.height, 60);
        assert_eq!(result.pixels.len(), (400 * 60 * 4) as usize);
        assert!(
            result.pixels.iter().any(|&p| p > 0),
            "expected non-zero pixels"
        );
    }

    #[test]
    fn measure_returns_nonzero_for_text() {
        let mut tr = TextRenderer::new();
        let (w, h) = tr.measure("Count: 0", 32.0, 800.0, None, None);
        assert!(w > 0.0, "width should be positive, got {w}");
        assert!(h > 0.0, "height should be positive, got {h}");
        assert!(w < 800.0, "width should fit within max_width");
    }

    #[test]
    fn measure_empty_returns_zero_width() {
        let mut tr = TextRenderer::new();
        let (w, _h) = tr.measure("", 32.0, 800.0, None, None);
        assert_eq!(w, 0.0);
    }

    #[test]
    fn measure_wraps_and_accumulates_height() {
        let mut tr = TextRenderer::new();
        let (_, h) = tr.measure("Count: 0", 32.0, 40.0, None, None);
        let line_h = 32.0 * 1.2;
        // Should wrap into multiple lines, increasing height
        assert!(
            h >= line_h * 2.0,
            "expected wrap — h={h} should be >= {}",
            line_h * 2.0
        );
    }

    #[test]
    fn shape_to_glyphs_returns_glyphs_for_nonempty_text() {
        let mut tr = TextRenderer::new();
        let result = tr.shape_to_glyphs("hello", FONT_SIZE, 400.0, None, None);
        assert!(!result.glyphs.is_empty(), "expected at least one glyph");
        assert!(!result.font_data.is_empty(), "expected font bytes");
        assert_eq!(result.font_size, FONT_SIZE);
        assert!(result.content_bounds.is_some(), "expected content bounds");
    }

    #[test]
    fn shape_to_glyphs_returns_empty_for_empty_text() {
        let mut tr = TextRenderer::new();
        let result = tr.shape_to_glyphs("", FONT_SIZE, 400.0, None, None);
        assert!(result.glyphs.is_empty());
        assert!(result.content_bounds.is_none());
    }

    #[test]
    fn measure_cached_returns_same_result() {
        let mut tr = TextRenderer::new();
        let (w1, h1) = tr.measure_cached("hello world", 16.0, 400.0, None, None);
        let (w2, h2) = tr.measure_cached("hello world", 16.0, 400.0, None, None);
        assert_eq!(w1, w2);
        assert_eq!(h1, h2);
        assert!(w1 > 0.0);
    }

    #[test]
    fn clear_cache_allows_remeasure() {
        let mut tr = TextRenderer::new();
        let (w1, h1) = tr.measure_cached("test", 16.0, 400.0, None, None);
        tr.clear_cache();
        let (w2, h2) = tr.measure_cached("test", 16.0, 400.0, None, None);
        assert_eq!(w1, w2);
        assert_eq!(h1, h2);
    }

    #[test]
    fn content_bounds_use_actual_advance() {
        let mut tr = TextRenderer::new();
        let result = tr.shape_to_glyphs("W", FONT_SIZE, 400.0, None, None);
        // content_bounds = (content_w, content_h, glyph_x0, ascent)
        let (content_w, content_h, _, _) = result.content_bounds.expect("should have bounds");
        let glyph_advance = result.glyphs[0].advance;
        assert!(
            (content_w - glyph_advance).abs() < 0.1,
            "content_w {content_w} should match glyph advance {glyph_advance}"
        );
        assert!(content_h > 0.0, "content_h should be positive");
    }
}

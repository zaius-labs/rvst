//! Convert Stylo computed values to RVST layout and paint types.
//!
//! This module replaces the manual string parsing in `rvst-engine/layout.rs`
//! (`parse_abs_len_px`, `parse_flex_direction`, etc.) with direct extraction
//! from Stylo's typed `ComputedValues`.
//!
//! Two main conversion functions:
//! - `computed_to_taffy_style()` -- layout properties for Taffy
//! - `computed_to_paint_props()` -- visual properties for the compositor
//!
//! ## Reference
//!
//! Blitz's `stylo_taffy` crate (0.2.0) is the primary reference for these
//! conversions. Stylo's computed value types live in `style::values::computed::*`.

use style::color::{AbsoluteColor, ColorSpace};
use style::properties::ComputedValues;
use style::values::computed::length_percentage::Unpacked;
use style::values::computed::LengthPercentage;
use style::values::generics::length::{
    GenericLengthPercentageOrNormal, GenericMargin, GenericMaxSize, GenericSize,
};
use style::values::generics::position::Inset as GenericInset;
use style::values::generics::NonNegative;
use style::values::specified::align::AlignFlags;
use style::values::specified::box_::{DisplayInside, Overflow};

// ---------------------------------------------------------------------------
// Public types
// ---------------------------------------------------------------------------

/// Visual properties for the compositor (rvst-engine/composite.rs).
///
/// Replaces the current pattern of extracting string values from
/// `HashMap<String, String>` and parsing them at render time.
#[derive(Debug, Clone, Default)]
pub struct PaintProps {
    // --- Colors ---
    pub color: [f32; 4],            // RGBA, premultiplied
    pub background_color: [f32; 4], // RGBA

    // --- Borders ---
    pub border_top_width: f32,
    pub border_right_width: f32,
    pub border_bottom_width: f32,
    pub border_left_width: f32,
    pub border_top_color: [f32; 4],
    pub border_right_color: [f32; 4],
    pub border_bottom_color: [f32; 4],
    pub border_left_color: [f32; 4],

    // --- Border radius ---
    pub border_top_left_radius: (f32, f32),
    pub border_top_right_radius: (f32, f32),
    pub border_bottom_right_radius: (f32, f32),
    pub border_bottom_left_radius: (f32, f32),

    // --- Effects ---
    pub opacity: f32,
    pub overflow_hidden: bool,

    // --- Text ---
    pub font_size: f32,
    pub font_weight: u16,
    pub line_height: f32,
    pub text_align: TextAlign,
    pub text_decoration_line: TextDecorationLine,
    pub text_decoration_color: Option<[f32; 4]>,

    // --- Outline ---
    pub outline_width: f32,
    pub outline_color: [f32; 4],
    pub outline_offset: f32,

    // --- Cursor ---
    pub cursor: CursorStyle,

    // --- Box shadow ---
    pub box_shadows: Vec<BoxShadow>,

    // --- Transform ---
    pub transform: Option<Transform2D>,
}

/// Text alignment.
#[derive(Debug, Clone, Copy, Default, PartialEq)]
pub enum TextAlign {
    #[default]
    Left,
    Center,
    Right,
    Justify,
}

/// Text decoration line.
#[derive(Debug, Clone, Copy, Default, PartialEq)]
pub struct TextDecorationLine {
    pub underline: bool,
    pub overline: bool,
    pub line_through: bool,
}

/// Cursor style.
#[derive(Debug, Clone, Copy, Default, PartialEq)]
pub enum CursorStyle {
    #[default]
    Default,
    Pointer,
    Text,
    Grab,
    Grabbing,
    Move,
    NotAllowed,
    CrossHair,
    ColResize,
    RowResize,
    EwResize,
    NsResize,
}

/// Box shadow.
#[derive(Debug, Clone, Default)]
pub struct BoxShadow {
    pub offset_x: f32,
    pub offset_y: f32,
    pub blur_radius: f32,
    pub spread_radius: f32,
    pub color: [f32; 4],
    pub inset: bool,
}

/// 2D transform (affine).
#[derive(Debug, Clone, Copy)]
pub struct Transform2D {
    pub a: f32,
    pub b: f32,
    pub c: f32,
    pub d: f32,
    pub e: f32,
    pub f: f32,
}

// ===========================================================================
// Stylo type aliases (mirrors stylo_taffy pattern)
// ===========================================================================

type StyloMargin = GenericMargin<LengthPercentage>;
type StyloInset = GenericInset<style::values::computed::Percentage, LengthPercentage>;
type StyloSize = GenericSize<NonNegative<LengthPercentage>>;
type StyloMaxSize = GenericMaxSize<NonNegative<LengthPercentage>>;
type StyloGap = GenericLengthPercentageOrNormal<NonNegative<LengthPercentage>>;

// ===========================================================================
// Helper conversion functions
// ===========================================================================

/// Convert a Stylo `LengthPercentage` to a Taffy `LengthPercentage`.
fn convert_lp(lp: &LengthPercentage) -> taffy::LengthPercentage {
    match lp.unpack() {
        Unpacked::Length(len) => taffy::style_helpers::length(len.px()),
        Unpacked::Percentage(pct) => taffy::style_helpers::percent(pct.0),
        Unpacked::Calc(_) => {
            // For calc values, resolve against zero (best-effort).
            // A proper implementation would pass the calc pointer through to Taffy.
            let resolved = lp.resolve(style::values::computed::Length::new(0.0));
            taffy::style_helpers::length(resolved.px())
        }
    }
}

/// Convert a Stylo `Size` (width/height) to a Taffy `Dimension`.
fn convert_dimension(val: &StyloSize) -> taffy::Dimension {
    match val {
        GenericSize::LengthPercentage(val) => convert_lp(&val.0).into(),
        GenericSize::Auto => taffy::Dimension::auto(),
        // Treat intrinsic sizing keywords as auto for now
        GenericSize::MaxContent
        | GenericSize::MinContent
        | GenericSize::FitContent
        | GenericSize::FitContentFunction(_)
        | GenericSize::Stretch
        | GenericSize::WebkitFillAvailable => taffy::Dimension::auto(),
        // Anchor positioning not supported
        GenericSize::AnchorSizeFunction(_) | GenericSize::AnchorContainingCalcFunction(_) => {
            taffy::Dimension::auto()
        }
    }
}

/// Convert a Stylo `MaxSize` to a Taffy `Dimension`.
fn convert_max_dimension(val: &StyloMaxSize) -> taffy::Dimension {
    match val {
        GenericMaxSize::LengthPercentage(val) => convert_lp(&val.0).into(),
        GenericMaxSize::None => taffy::Dimension::auto(),
        GenericMaxSize::MaxContent
        | GenericMaxSize::MinContent
        | GenericMaxSize::FitContent
        | GenericMaxSize::FitContentFunction(_)
        | GenericMaxSize::Stretch
        | GenericMaxSize::WebkitFillAvailable => taffy::Dimension::auto(),
        GenericMaxSize::AnchorSizeFunction(_) | GenericMaxSize::AnchorContainingCalcFunction(_) => {
            taffy::Dimension::auto()
        }
    }
}

/// Convert a Stylo `Margin` to a Taffy `LengthPercentageAuto`.
fn convert_margin(val: &StyloMargin) -> taffy::LengthPercentageAuto {
    match val {
        GenericMargin::Auto => taffy::LengthPercentageAuto::auto(),
        GenericMargin::LengthPercentage(val) => convert_lp(val).into(),
        GenericMargin::AnchorSizeFunction(_) | GenericMargin::AnchorContainingCalcFunction(_) => {
            taffy::LengthPercentageAuto::auto()
        }
    }
}

/// Convert a Stylo `Inset` to a Taffy `LengthPercentageAuto`.
fn convert_inset(val: &StyloInset) -> taffy::LengthPercentageAuto {
    match val {
        GenericInset::Auto => taffy::LengthPercentageAuto::auto(),
        GenericInset::LengthPercentage(val) => convert_lp(val).into(),
        GenericInset::AnchorSizeFunction(_)
        | GenericInset::AnchorFunction(_)
        | GenericInset::AnchorContainingCalcFunction(_) => taffy::LengthPercentageAuto::auto(),
    }
}

/// Convert Stylo's `Display` to Taffy's `Display`.
fn convert_display(input: style::values::specified::box_::Display) -> taffy::Display {
    match input.inside() {
        DisplayInside::None => taffy::Display::None,
        DisplayInside::Flex => taffy::Display::Flex,
        DisplayInside::Grid => taffy::Display::Grid,
        DisplayInside::Flow | DisplayInside::FlowRoot => taffy::Display::Block,
        // Map table to grid as a rough approximation
        DisplayInside::Table => taffy::Display::Grid,
        DisplayInside::TableCell => taffy::Display::Block,
        // Everything else falls back to the default (Flex)
        _ => taffy::Display::DEFAULT,
    }
}

/// Convert Stylo's `PositionProperty` to Taffy's `Position`.
fn convert_position(
    input: style::values::specified::box_::PositionProperty,
) -> taffy::Position {
    use style::values::specified::box_::PositionProperty;
    match input {
        PositionProperty::Static | PositionProperty::Relative | PositionProperty::Sticky => {
            taffy::Position::Relative
        }
        PositionProperty::Absolute | PositionProperty::Fixed => taffy::Position::Absolute,
    }
}

/// Convert Stylo's `Overflow` to Taffy's `Overflow`.
fn convert_overflow(input: Overflow) -> taffy::Overflow {
    match input {
        Overflow::Visible => taffy::Overflow::Visible,
        Overflow::Hidden => taffy::Overflow::Hidden,
        Overflow::Scroll => taffy::Overflow::Scroll,
        Overflow::Auto => taffy::Overflow::Scroll,
        Overflow::Clip => taffy::Overflow::Clip,
    }
}

/// Convert Stylo's `ContentDistribution` to Taffy's `AlignContent`.
fn convert_content_alignment(
    input: style::values::specified::align::ContentDistribution,
) -> Option<taffy::AlignContent> {
    match input.primary().value() {
        AlignFlags::NORMAL | AlignFlags::AUTO => None,
        AlignFlags::START | AlignFlags::LEFT => Some(taffy::AlignContent::Start),
        AlignFlags::END | AlignFlags::RIGHT => Some(taffy::AlignContent::End),
        AlignFlags::FLEX_START => Some(taffy::AlignContent::FlexStart),
        AlignFlags::FLEX_END => Some(taffy::AlignContent::FlexEnd),
        AlignFlags::CENTER => Some(taffy::AlignContent::Center),
        AlignFlags::STRETCH => Some(taffy::AlignContent::Stretch),
        AlignFlags::SPACE_BETWEEN => Some(taffy::AlignContent::SpaceBetween),
        AlignFlags::SPACE_AROUND => Some(taffy::AlignContent::SpaceAround),
        AlignFlags::SPACE_EVENLY => Some(taffy::AlignContent::SpaceEvenly),
        _ => None,
    }
}

/// Convert Stylo's alignment flags to Taffy's `AlignItems`.
fn convert_item_alignment(input: AlignFlags) -> Option<taffy::AlignItems> {
    match input.value() {
        AlignFlags::AUTO => None,
        AlignFlags::NORMAL | AlignFlags::STRETCH => Some(taffy::AlignItems::Stretch),
        AlignFlags::FLEX_START => Some(taffy::AlignItems::FlexStart),
        AlignFlags::FLEX_END => Some(taffy::AlignItems::FlexEnd),
        AlignFlags::START | AlignFlags::SELF_START | AlignFlags::LEFT => {
            Some(taffy::AlignItems::Start)
        }
        AlignFlags::END | AlignFlags::SELF_END | AlignFlags::RIGHT => {
            Some(taffy::AlignItems::End)
        }
        AlignFlags::CENTER => Some(taffy::AlignItems::Center),
        AlignFlags::BASELINE => Some(taffy::AlignItems::Baseline),
        _ => None,
    }
}

/// Convert a Stylo gap value to Taffy's `LengthPercentage`.
fn convert_gap(input: &StyloGap) -> taffy::LengthPercentage {
    match input {
        GenericLengthPercentageOrNormal::Normal => taffy::style_helpers::length(0.0),
        GenericLengthPercentageOrNormal::LengthPercentage(val) => convert_lp(&val.0),
    }
}

/// Convert a Stylo `FlexBasis` to a Taffy `Dimension`.
fn convert_flex_basis(
    input: &style::values::computed::flex::FlexBasis,
) -> taffy::Dimension {
    use style::values::generics::flex::GenericFlexBasis;
    match input {
        GenericFlexBasis::Content => taffy::Dimension::auto(),
        GenericFlexBasis::Size(size) => convert_dimension(size),
    }
}

/// Convert a Stylo `AbsoluteColor` to an `[f32; 4]` RGBA array.
fn convert_absolute_color(c: &AbsoluteColor) -> [f32; 4] {
    let srgb = c.to_color_space(ColorSpace::Srgb);
    [srgb.components.0, srgb.components.1, srgb.components.2, srgb.alpha]
}

/// Convert a Stylo computed `Color` to `[f32; 4]` by resolving against a
/// current color (inherited text color).
fn convert_color(
    c: &style::values::computed::color::Color,
    current_color: &AbsoluteColor,
) -> [f32; 4] {
    let abs = c.resolve_to_absolute(current_color);
    convert_absolute_color(&abs)
}

// ===========================================================================
// Main conversion: computed_to_taffy_style
// ===========================================================================

/// Convert Stylo's computed values to a Taffy `Style` for layout.
///
/// This replaces ~500 lines of manual string parsing in layout.rs.
pub fn computed_to_taffy_style(cv: &ComputedValues) -> taffy::Style {
    use style::computed_values::{
        flex_direction::T as FlexDirection, flex_wrap::T as FlexWrap,
    };

    let display = cv.clone_display();
    let pos = cv.get_position();
    let margin = cv.get_margin();
    let padding = cv.get_padding();
    let border = cv.get_border();

    taffy::Style {
        dummy: core::marker::PhantomData,
        display: convert_display(display),
        box_sizing: taffy::BoxSizing::BorderBox,
        item_is_table: display.inside() == DisplayInside::Table,
        item_is_replaced: false,
        position: convert_position(cv.clone_position()),
        overflow: taffy::Point {
            x: convert_overflow(cv.clone_overflow_x()),
            y: convert_overflow(cv.clone_overflow_y()),
        },
        scrollbar_width: 0.0,

        // Dimensions
        size: taffy::Size {
            width: convert_dimension(&pos.width),
            height: convert_dimension(&pos.height),
        },
        min_size: taffy::Size {
            width: convert_dimension(&pos.min_width),
            height: convert_dimension(&pos.min_height),
        },
        max_size: taffy::Size {
            width: convert_max_dimension(&pos.max_width),
            height: convert_max_dimension(&pos.max_height),
        },
        aspect_ratio: None,

        // Inset (for position: absolute/fixed)
        inset: taffy::Rect {
            left: convert_inset(&pos.left),
            right: convert_inset(&pos.right),
            top: convert_inset(&pos.top),
            bottom: convert_inset(&pos.bottom),
        },

        // Margin
        margin: taffy::Rect {
            left: convert_margin(&margin.margin_left),
            right: convert_margin(&margin.margin_right),
            top: convert_margin(&margin.margin_top),
            bottom: convert_margin(&margin.margin_bottom),
        },

        // Padding (NonNegativeLengthPercentage = NonNegative<LP>, access .0)
        padding: taffy::Rect {
            left: convert_lp(&padding.padding_left.0),
            right: convert_lp(&padding.padding_right.0),
            top: convert_lp(&padding.padding_top.0),
            bottom: convert_lp(&padding.padding_bottom.0),
        },

        // Border widths (BorderSideWidth wraps Au)
        border: taffy::Rect {
            left: taffy::style_helpers::length(border.border_left_width.0.to_f32_px()),
            right: taffy::style_helpers::length(border.border_right_width.0.to_f32_px()),
            top: taffy::style_helpers::length(border.border_top_width.0.to_f32_px()),
            bottom: taffy::style_helpers::length(border.border_bottom_width.0.to_f32_px()),
        },

        // Gap
        gap: taffy::Size {
            width: convert_gap(&pos.column_gap),
            height: convert_gap(&pos.row_gap),
        },

        // Alignment
        align_content: convert_content_alignment(pos.align_content),
        justify_content: convert_content_alignment(pos.justify_content),
        align_items: convert_item_alignment(pos.align_items.0),
        align_self: convert_item_alignment(pos.align_self.0.value()),

        // Flexbox
        flex_direction: match pos.flex_direction {
            FlexDirection::Row => taffy::FlexDirection::Row,
            FlexDirection::RowReverse => taffy::FlexDirection::RowReverse,
            FlexDirection::Column => taffy::FlexDirection::Column,
            FlexDirection::ColumnReverse => taffy::FlexDirection::ColumnReverse,
        },
        flex_wrap: match pos.flex_wrap {
            FlexWrap::Nowrap => taffy::FlexWrap::NoWrap,
            FlexWrap::Wrap => taffy::FlexWrap::Wrap,
            FlexWrap::WrapReverse => taffy::FlexWrap::WrapReverse,
        },
        flex_grow: pos.flex_grow.0,
        flex_shrink: pos.flex_shrink.0,
        flex_basis: convert_flex_basis(&pos.flex_basis),

        // Block text alignment
        text_align: taffy::TextAlign::Auto,

        // Grid (skip for now -- use defaults)
        justify_items: None,
        justify_self: None,
        grid_template_rows: Vec::new(),
        grid_template_columns: Vec::new(),
        grid_template_row_names: Vec::new(),
        grid_template_column_names: Vec::new(),
        grid_template_areas: Vec::new(),
        grid_auto_rows: Vec::new(),
        grid_auto_columns: Vec::new(),
        grid_auto_flow: taffy::GridAutoFlow::Row,
        grid_row: taffy::Line {
            start: taffy::GridPlacement::Auto,
            end: taffy::GridPlacement::Auto,
        },
        grid_column: taffy::Line {
            start: taffy::GridPlacement::Auto,
            end: taffy::GridPlacement::Auto,
        },
    }
}

// ===========================================================================
// Main conversion: computed_to_paint_props
// ===========================================================================

/// Convert Stylo's computed values to paint properties for the compositor.
pub fn computed_to_paint_props(cv: &ComputedValues) -> PaintProps {
    use style::values::computed::font::LineHeight;

    let inherited_text = cv.get_inherited_text();
    let bg = cv.get_background();
    let border = cv.get_border();
    let font = cv.get_font();
    let effects = cv.get_effects();
    let outline = cv.get_outline();

    // The `color` property (inherited text color) is an AbsoluteColor.
    let current_color = inherited_text.color.clone();
    let color_rgba = convert_absolute_color(&current_color);

    // Background color is a computed Color that may reference currentcolor.
    let bg_color = convert_color(&bg.background_color, &current_color);

    // Border widths
    let border_top_width = border.border_top_width.0.to_f32_px();
    let border_right_width = border.border_right_width.0.to_f32_px();
    let border_bottom_width = border.border_bottom_width.0.to_f32_px();
    let border_left_width = border.border_left_width.0.to_f32_px();

    // Border colors (computed Color, resolve against currentcolor)
    let border_top_color = convert_color(&border.border_top_color, &current_color);
    let border_right_color = convert_color(&border.border_right_color, &current_color);
    let border_bottom_color = convert_color(&border.border_bottom_color, &current_color);
    let border_left_color = convert_color(&border.border_left_color, &current_color);

    // Border radius: each is a BorderCornerRadius containing Size2D<NonNegativeLengthPercentage>
    // Resolve against zero for now (proper resolution needs containing block size)
    let zero = style::values::computed::Length::new(0.0);
    let border_top_left_radius = {
        let r = &border.border_top_left_radius;
        (r.0.width.0.resolve(zero).px(), r.0.height.0.resolve(zero).px())
    };
    let border_top_right_radius = {
        let r = &border.border_top_right_radius;
        (r.0.width.0.resolve(zero).px(), r.0.height.0.resolve(zero).px())
    };
    let border_bottom_right_radius = {
        let r = &border.border_bottom_right_radius;
        (r.0.width.0.resolve(zero).px(), r.0.height.0.resolve(zero).px())
    };
    let border_bottom_left_radius = {
        let r = &border.border_bottom_left_radius;
        (r.0.width.0.resolve(zero).px(), r.0.height.0.resolve(zero).px())
    };

    // Opacity (CSSFloat = f32)
    let opacity = effects.opacity;

    // Overflow
    let overflow_hidden = matches!(
        cv.clone_overflow_x(),
        Overflow::Hidden | Overflow::Clip
    ) || matches!(
        cv.clone_overflow_y(),
        Overflow::Hidden | Overflow::Clip
    );

    // Font size: FontSize.computed_size() returns CSSPixelLength
    let font_size = font.clone_font_size().computed_size().px();

    // Font weight: FontWeight wraps a fixed-point value, .value() -> f32
    let font_weight = font.clone_font_weight().value() as u16;

    // Line height
    let line_height = match font.clone_line_height() {
        LineHeight::Normal => font_size * 1.2,
        LineHeight::Number(n) => font_size * n.0,
        LineHeight::Length(l) => l.0.px(),
    };

    // Text align (computed value is TextAlignKeyword directly)
    let text_align = {
        use style::values::specified::text::TextAlignKeyword;
        match inherited_text.text_align {
            TextAlignKeyword::Left | TextAlignKeyword::Start | TextAlignKeyword::MozLeft => {
                TextAlign::Left
            }
            TextAlignKeyword::Right | TextAlignKeyword::End | TextAlignKeyword::MozRight => {
                TextAlign::Right
            }
            TextAlignKeyword::Center | TextAlignKeyword::MozCenter => TextAlign::Center,
            TextAlignKeyword::Justify => TextAlign::Justify,
        }
    };

    // Outline
    let outline_width = outline.outline_width.0.to_f32_px();
    let outline_color = convert_color(&outline.outline_color, &current_color);
    let outline_offset = outline.outline_offset.to_f32_px();

    PaintProps {
        color: color_rgba,
        background_color: bg_color,

        border_top_width,
        border_right_width,
        border_bottom_width,
        border_left_width,
        border_top_color,
        border_right_color,
        border_bottom_color,
        border_left_color,

        border_top_left_radius,
        border_top_right_radius,
        border_bottom_right_radius,
        border_bottom_left_radius,

        opacity,
        overflow_hidden,

        font_size,
        font_weight,
        line_height,
        text_align,

        // Text decoration and cursor skipped for now (complex types)
        text_decoration_line: TextDecorationLine::default(),
        text_decoration_color: None,

        outline_width,
        outline_color,
        outline_offset,

        cursor: CursorStyle::Default,
        box_shadows: Vec::new(),
        transform: None,
    }
}

// ===========================================================================
// Tests
// ===========================================================================

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_convert_lp_length() {
        let lp = LengthPercentage::new_length(style::values::computed::Length::new(42.0));
        let result = convert_lp(&lp);
        // Should produce a length value (not panic)
        let _ = result;
    }

    #[test]
    fn test_convert_lp_percentage() {
        let lp = LengthPercentage::new_percent(style::values::computed::Percentage(0.5));
        let result = convert_lp(&lp);
        let _ = result;
    }

    #[test]
    fn test_convert_display() {
        use style::values::specified::box_::Display;
        assert!(matches!(convert_display(Display::Flex), taffy::Display::Flex));
        assert!(matches!(convert_display(Display::None), taffy::Display::None));
        assert!(matches!(convert_display(Display::Grid), taffy::Display::Grid));
        assert!(matches!(convert_display(Display::Block), taffy::Display::Block));
        assert!(matches!(convert_display(Display::Inline), taffy::Display::Block));
    }

    #[test]
    fn test_convert_position() {
        use style::values::specified::box_::PositionProperty;
        assert!(matches!(
            convert_position(PositionProperty::Static),
            taffy::Position::Relative
        ));
        assert!(matches!(
            convert_position(PositionProperty::Absolute),
            taffy::Position::Absolute
        ));
        assert!(matches!(
            convert_position(PositionProperty::Fixed),
            taffy::Position::Absolute
        ));
    }

    #[test]
    fn test_convert_overflow() {
        assert!(matches!(convert_overflow(Overflow::Visible), taffy::Overflow::Visible));
        assert!(matches!(convert_overflow(Overflow::Hidden), taffy::Overflow::Hidden));
        assert!(matches!(convert_overflow(Overflow::Scroll), taffy::Overflow::Scroll));
        assert!(matches!(convert_overflow(Overflow::Auto), taffy::Overflow::Scroll));
    }

    #[test]
    fn test_convert_dimension_auto() {
        let size = GenericSize::<NonNegative<LengthPercentage>>::Auto;
        let dim = convert_dimension(&size);
        assert!(dim.is_auto());
    }

    #[test]
    fn test_convert_margin_auto() {
        let margin = GenericMargin::<LengthPercentage>::Auto;
        let result = convert_margin(&margin);
        assert!(result.is_auto());
    }

    #[test]
    fn test_convert_absolute_color() {
        let black = AbsoluteColor::BLACK;
        let rgba = convert_absolute_color(&black);
        assert_eq!(rgba[3], 1.0); // fully opaque
    }

    #[test]
    fn test_convert_content_alignment_normal() {
        let normal = style::values::specified::align::ContentDistribution::normal();
        assert!(convert_content_alignment(normal).is_none());
    }

    #[test]
    fn test_convert_item_alignment_stretch() {
        let result = convert_item_alignment(AlignFlags::STRETCH);
        assert_eq!(result, Some(taffy::AlignItems::Stretch));
    }

    #[test]
    fn test_convert_item_alignment_center() {
        let result = convert_item_alignment(AlignFlags::CENTER);
        assert_eq!(result, Some(taffy::AlignItems::Center));
    }
}

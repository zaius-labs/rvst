//! CSS transition state machine and interpolation.
//!
//! When a CSS property changes on a node and a `transition` rule is in effect,
//! the TransitionManager interpolates from old → new over the specified
//! duration using a cubic-bezier timing function (Servo's Newton + bisection
//! solver).

use rvst_core::NodeId;
use std::collections::HashMap;
use std::time::Instant;

// ---------------------------------------------------------------------------
// Cubic bezier solver (ported from Servo stylo/style/bezier.rs)
// ---------------------------------------------------------------------------

const NEWTON_ITERATIONS: usize = 8;
const NEWTON_MIN_SLOPE: f64 = 0.02;
const SUBDIVISION_PRECISION: f64 = 1e-7;
const SUBDIVISION_MAX_ITERATIONS: usize = 30;

/// Cubic bezier curve evaluator.
///
/// Given control points (x1, y1), (x2, y2) (the endpoints are implicitly
/// (0,0) and (1,1)), solves for y at a given x using Newton's method with
/// bisection fallback.
pub struct CubicBezier {
    ax: f64,
    bx: f64,
    cx: f64,
    ay: f64,
    by: f64,
    cy: f64,
}

impl CubicBezier {
    pub fn new(x1: f64, y1: f64, x2: f64, y2: f64) -> Self {
        let cx = 3.0 * x1;
        let bx = 3.0 * (x2 - x1) - cx;
        let ax = 1.0 - cx - bx;

        let cy = 3.0 * y1;
        let by = 3.0 * (y2 - y1) - cy;
        let ay = 1.0 - cy - by;

        Self {
            ax,
            bx,
            cx,
            ay,
            by,
            cy,
        }
    }

    fn sample_curve_x(&self, t: f64) -> f64 {
        ((self.ax * t + self.bx) * t + self.cx) * t
    }

    fn sample_curve_y(&self, t: f64) -> f64 {
        ((self.ay * t + self.by) * t + self.cy) * t
    }

    fn sample_curve_derivative_x(&self, t: f64) -> f64 {
        (3.0 * self.ax * t + 2.0 * self.bx) * t + self.cx
    }

    /// Solve for the parameter t given x, using Newton's method with bisection
    /// fallback.
    fn solve_curve_x(&self, x: f64) -> f64 {
        // Newton's method
        let mut t = x;
        for _ in 0..NEWTON_ITERATIONS {
            let x2 = self.sample_curve_x(t) - x;
            if x2.abs() < SUBDIVISION_PRECISION {
                return t;
            }
            let d = self.sample_curve_derivative_x(t);
            if d.abs() < NEWTON_MIN_SLOPE {
                break;
            }
            t -= x2 / d;
        }

        // Bisection fallback
        let mut lo = 0.0_f64;
        let mut hi = 1.0_f64;
        t = x;
        for _ in 0..SUBDIVISION_MAX_ITERATIONS {
            let x2 = self.sample_curve_x(t);
            if (x2 - x).abs() < SUBDIVISION_PRECISION {
                return t;
            }
            if x > x2 {
                lo = t;
            } else {
                hi = t;
            }
            t = (lo + hi) / 2.0;
        }
        t
    }

    /// Given an x in [0, 1], return the corresponding y on the bezier curve.
    pub fn solve(&self, x: f64) -> f64 {
        if x <= 0.0 {
            return 0.0;
        }
        if x >= 1.0 {
            return 1.0;
        }
        self.sample_curve_y(self.solve_curve_x(x))
    }
}

// ---------------------------------------------------------------------------
// Timing functions
// ---------------------------------------------------------------------------

#[derive(Clone, Debug)]
pub enum TimingFunction {
    Linear,
    Ease,
    EaseIn,
    EaseOut,
    EaseInOut,
    CubicBezier(f64, f64, f64, f64),
}

impl Default for TimingFunction {
    fn default() -> Self {
        Self::Ease
    }
}

impl TimingFunction {
    /// Evaluate the timing function at progress t in [0, 1].
    pub fn evaluate(&self, t: f64) -> f64 {
        match self {
            Self::Linear => t,
            Self::Ease => CubicBezier::new(0.25, 0.1, 0.25, 1.0).solve(t),
            Self::EaseIn => CubicBezier::new(0.42, 0.0, 1.0, 1.0).solve(t),
            Self::EaseOut => CubicBezier::new(0.0, 0.0, 0.58, 1.0).solve(t),
            Self::EaseInOut => CubicBezier::new(0.42, 0.0, 0.58, 1.0).solve(t),
            Self::CubicBezier(x1, y1, x2, y2) => CubicBezier::new(*x1, *y1, *x2, *y2).solve(t),
        }
    }

    /// Parse a timing function from a CSS string token.
    pub fn parse(s: &str) -> Self {
        let s = s.trim();
        match s {
            "linear" => Self::Linear,
            "ease" => Self::Ease,
            "ease-in" => Self::EaseIn,
            "ease-out" => Self::EaseOut,
            "ease-in-out" => Self::EaseInOut,
            _ if s.starts_with("cubic-bezier(") => {
                let inner = s
                    .trim_start_matches("cubic-bezier(")
                    .trim_end_matches(')');
                let parts: Vec<f64> = inner
                    .split(',')
                    .filter_map(|p| p.trim().parse().ok())
                    .collect();
                if parts.len() == 4 {
                    Self::CubicBezier(parts[0], parts[1], parts[2], parts[3])
                } else {
                    Self::Ease
                }
            }
            _ => Self::Ease,
        }
    }
}

// ---------------------------------------------------------------------------
// Animatable values
// ---------------------------------------------------------------------------

/// A value that can be interpolated between two states.
#[derive(Clone, Debug)]
pub enum AnimatableValue {
    /// Scalar: width, height, opacity, padding, margin, border-width, etc.
    Float(f32),
    /// RGBA color in linear RGB space (for perceptually correct blending).
    Color([f32; 4]),
}

impl AnimatableValue {
    /// Linearly interpolate between `self` and `to` at the given progress [0, 1].
    pub fn interpolate(&self, to: &Self, progress: f64) -> Self {
        let p = progress as f32;
        match (self, to) {
            (Self::Float(a), Self::Float(b)) => Self::Float(a + (b - a) * p),
            (Self::Color(a), Self::Color(b)) => {
                // Interpolate in linear RGB space.
                // sRGB → linear
                let a_lin = srgb_to_linear(*a);
                let b_lin = srgb_to_linear(*b);
                let mixed = [
                    a_lin[0] + (b_lin[0] - a_lin[0]) * p,
                    a_lin[1] + (b_lin[1] - a_lin[1]) * p,
                    a_lin[2] + (b_lin[2] - a_lin[2]) * p,
                    a[3] + (b[3] - a[3]) * p, // alpha is already linear
                ];
                // linear → sRGB
                Self::Color(linear_to_srgb(mixed))
            }
            // Mismatched types: snap to target
            _ => to.clone(),
        }
    }
}

/// sRGB → linear RGB (per channel, except alpha).
fn srgb_to_linear(c: [f32; 4]) -> [f32; 4] {
    fn s2l(v: f32) -> f32 {
        if v <= 0.04045 {
            v / 12.92
        } else {
            ((v + 0.055) / 1.055).powf(2.4)
        }
    }
    [s2l(c[0]), s2l(c[1]), s2l(c[2]), c[3]]
}

/// Linear RGB → sRGB (per channel, except alpha).
fn linear_to_srgb(c: [f32; 4]) -> [f32; 4] {
    fn l2s(v: f32) -> f32 {
        if v <= 0.0031308 {
            v * 12.92
        } else {
            1.055 * v.powf(1.0 / 2.4) - 0.055
        }
    }
    [l2s(c[0]), l2s(c[1]), l2s(c[2]), c[3]]
}

// ---------------------------------------------------------------------------
// Active transition
// ---------------------------------------------------------------------------

#[derive(Clone, Debug)]
pub struct ActiveTransition {
    pub property: String,
    pub from: AnimatableValue,
    pub to: AnimatableValue,
    pub timing: TimingFunction,
    pub duration_ms: f64,
    pub delay_ms: f64,
    pub start_time: Instant,
}

impl ActiveTransition {
    /// Returns (current_value, is_finished).
    pub fn tick(&self, now: Instant) -> (AnimatableValue, bool) {
        let elapsed = now.duration_since(self.start_time).as_secs_f64() * 1000.0;

        // Still in delay phase
        if elapsed < self.delay_ms {
            return (self.from.clone(), false);
        }

        // Zero duration: snap immediately
        if self.duration_ms <= 0.0 {
            return (self.to.clone(), true);
        }

        let active_elapsed = elapsed - self.delay_ms;
        let raw_progress = (active_elapsed / self.duration_ms).min(1.0);
        let finished = raw_progress >= 1.0;
        let eased = self.timing.evaluate(raw_progress);
        let value = self.from.interpolate(&self.to, eased);

        (value, finished)
    }
}

// ---------------------------------------------------------------------------
// Transition spec (parsed from CSS)
// ---------------------------------------------------------------------------

/// Parsed `transition` shorthand or individual transition-* properties.
#[derive(Clone, Debug)]
pub struct TransitionSpec {
    /// Property names (empty or ["all"] means wildcard).
    pub properties: Vec<String>,
    pub duration_ms: f64,
    pub timing: TimingFunction,
    pub delay_ms: f64,
}

impl Default for TransitionSpec {
    fn default() -> Self {
        Self {
            properties: vec![],
            duration_ms: 0.0,
            timing: TimingFunction::Ease,
            delay_ms: 0.0,
        }
    }
}

impl TransitionSpec {
    /// Check whether this spec applies to the given property name.
    pub fn matches_property(&self, prop: &str) -> bool {
        if self.properties.is_empty() {
            return false;
        }
        self.properties
            .iter()
            .any(|p| p == "all" || p == prop)
    }
}

// ---------------------------------------------------------------------------
// Transition manager
// ---------------------------------------------------------------------------

/// Per-node transition state. Owns all running transitions across the tree.
pub struct TransitionManager {
    /// node_id -> property -> active transition
    active: HashMap<NodeId, HashMap<String, ActiveTransition>>,
}

impl TransitionManager {
    pub fn new() -> Self {
        Self {
            active: HashMap::new(),
        }
    }

    /// Called when a node's computed style changes. If the property has a
    /// transition defined, start interpolating instead of jumping.
    pub fn on_style_change(
        &mut self,
        node_id: NodeId,
        property: &str,
        old_value: AnimatableValue,
        new_value: AnimatableValue,
        spec: &TransitionSpec,
    ) {
        if spec.duration_ms <= 0.0 || !spec.matches_property(property) {
            // No transition for this property — remove any running transition
            if let Some(props) = self.active.get_mut(&node_id) {
                props.remove(property);
            }
            return;
        }

        // If there's already a running transition for this property, start from
        // the current interpolated value (not the original "from").
        let now = Instant::now();
        let effective_from = if let Some(props) = self.active.get(&node_id) {
            if let Some(existing) = props.get(property) {
                let (current, _) = existing.tick(now);
                current
            } else {
                old_value
            }
        } else {
            old_value
        };

        let transition = ActiveTransition {
            property: property.to_string(),
            from: effective_from,
            to: new_value,
            timing: spec.timing.clone(),
            duration_ms: spec.duration_ms,
            delay_ms: spec.delay_ms,
            start_time: now,
        };

        self.active
            .entry(node_id)
            .or_default()
            .insert(property.to_string(), transition);
    }

    /// Tick all active transitions. Returns a list of (node_id, property, current_value)
    /// for properties that need their interpolated value applied this frame.
    /// Finished transitions are removed.
    pub fn tick_all(&mut self, now: Instant) -> Vec<(NodeId, String, AnimatableValue)> {
        let mut updates = Vec::new();
        let mut empty_nodes = Vec::new();

        for (node_id, props) in &mut self.active {
            let mut finished_keys = Vec::new();
            for (key, transition) in props.iter() {
                let (value, done) = transition.tick(now);
                updates.push((*node_id, key.clone(), value));
                if done {
                    finished_keys.push(key.clone());
                }
            }
            for key in finished_keys {
                props.remove(&key);
            }
            if props.is_empty() {
                empty_nodes.push(*node_id);
            }
        }

        for id in empty_nodes {
            self.active.remove(&id);
        }

        updates
    }

    /// Returns true if any transitions are currently running (need continuous redraw).
    pub fn has_active(&self) -> bool {
        !self.active.is_empty()
    }
}

impl Default for TransitionManager {
    fn default() -> Self {
        Self::new()
    }
}

// ---------------------------------------------------------------------------
// CSS transition parsing
// ---------------------------------------------------------------------------

/// Parse a CSS duration string (e.g., "200ms", "0.3s", "1s") to milliseconds.
pub fn parse_duration_ms(s: &str) -> f64 {
    let s = s.trim();
    if let Some(ms) = s.strip_suffix("ms") {
        ms.trim().parse::<f64>().unwrap_or(0.0)
    } else if let Some(sec) = s.strip_suffix('s') {
        sec.trim().parse::<f64>().unwrap_or(0.0) * 1000.0
    } else {
        0.0
    }
}

/// Parse the CSS `transition` shorthand into a TransitionSpec.
///
/// Format: `<property> <duration> [<timing-function>] [<delay>]`
/// Multiple transitions can be comma-separated:
///   `width 200ms ease, background-color 300ms ease-in-out 50ms`
///
/// If `transition: all 200ms ease`, property is "all" (wildcard).
pub fn parse_transition_shorthand(value: &str) -> Vec<TransitionSpec> {
    let mut specs = Vec::new();

    for part in split_on_commas(value) {
        let tokens = tokenize_transition(part.trim());
        if tokens.is_empty() {
            continue;
        }

        let mut property = String::new();
        let mut duration_ms = 0.0;
        let mut timing = TimingFunction::Ease;
        let mut delay_ms = 0.0;
        let mut duration_set = false;

        for token in &tokens {
            let t = token.trim();
            if t.is_empty() {
                continue;
            }
            // Check if it's a timing function keyword or cubic-bezier(...)
            if t == "linear"
                || t == "ease"
                || t == "ease-in"
                || t == "ease-out"
                || t == "ease-in-out"
                || t.starts_with("cubic-bezier(")
            {
                timing = TimingFunction::parse(t);
            } else if t.ends_with("ms") || t.ends_with('s') {
                // Duration or delay (first duration seen is duration, second is delay)
                let ms = parse_duration_ms(t);
                if !duration_set {
                    duration_ms = ms;
                    duration_set = true;
                } else {
                    delay_ms = ms;
                }
            } else if t != "none" {
                // Property name
                property = t.to_string();
            }
        }

        if !property.is_empty() && duration_ms > 0.0 {
            specs.push(TransitionSpec {
                properties: vec![property],
                duration_ms,
                timing,
                delay_ms,
            });
        }
    }

    specs
}

/// Split on commas, respecting parentheses (for cubic-bezier(...)).
fn split_on_commas(s: &str) -> Vec<&str> {
    let mut result = Vec::new();
    let mut depth = 0;
    let mut start = 0;
    for (i, ch) in s.char_indices() {
        match ch {
            '(' => depth += 1,
            ')' => depth -= 1,
            ',' if depth == 0 => {
                result.push(&s[start..i]);
                start = i + 1;
            }
            _ => {}
        }
    }
    result.push(&s[start..]);
    result
}

/// Tokenize a single transition declaration, respecting parentheses.
fn tokenize_transition(s: &str) -> Vec<String> {
    let mut tokens = Vec::new();
    let mut current = String::new();
    let mut depth = 0;
    for ch in s.chars() {
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
                    tokens.push(trimmed);
                }
                current.clear();
            }
            _ => current.push(ch),
        }
    }
    let trimmed = current.trim().to_string();
    if !trimmed.is_empty() {
        tokens.push(trimmed);
    }
    tokens
}

/// Convert a CSS color string to an [r, g, b, a] array in [0, 1] range.
/// This is a lightweight parser for transition purposes — handles hex, rgb(),
/// rgba(), and common named colors.
pub fn css_color_to_array(s: &str) -> Option<[f32; 4]> {
    let s = s.trim();

    // Hex: #rgb, #rrggbb, #rrggbbaa
    if s.starts_with('#') {
        let hex = &s[1..];
        return match hex.len() {
            3 => {
                let r = u8::from_str_radix(&hex[0..1].repeat(2), 16).ok()? as f32 / 255.0;
                let g = u8::from_str_radix(&hex[1..2].repeat(2), 16).ok()? as f32 / 255.0;
                let b = u8::from_str_radix(&hex[2..3].repeat(2), 16).ok()? as f32 / 255.0;
                Some([r, g, b, 1.0])
            }
            6 => {
                let r = u8::from_str_radix(&hex[0..2], 16).ok()? as f32 / 255.0;
                let g = u8::from_str_radix(&hex[2..4], 16).ok()? as f32 / 255.0;
                let b = u8::from_str_radix(&hex[4..6], 16).ok()? as f32 / 255.0;
                Some([r, g, b, 1.0])
            }
            8 => {
                let r = u8::from_str_radix(&hex[0..2], 16).ok()? as f32 / 255.0;
                let g = u8::from_str_radix(&hex[2..4], 16).ok()? as f32 / 255.0;
                let b = u8::from_str_radix(&hex[4..6], 16).ok()? as f32 / 255.0;
                let a = u8::from_str_radix(&hex[6..8], 16).ok()? as f32 / 255.0;
                Some([r, g, b, a])
            }
            _ => None,
        };
    }

    // rgb(r, g, b) / rgba(r, g, b, a) / rgb(r g b) / rgb(r g b / a)
    if s.starts_with("rgb") {
        let inner = s
            .trim_start_matches("rgba(")
            .trim_start_matches("rgb(")
            .trim_end_matches(')');
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
            let r = parts[0].parse::<f32>().ok()? / 255.0;
            let g = parts[1].parse::<f32>().ok()? / 255.0;
            let b = parts[2].parse::<f32>().ok()? / 255.0;
            let a = if let Some(av) = alpha_part {
                let f = av.parse::<f32>().ok()?;
                if f <= 1.0 { f } else { f / 255.0 }
            } else if parts.len() >= 4 {
                let f = parts[3].parse::<f32>().ok()?;
                if f <= 1.0 { f } else { f / 255.0 }
            } else {
                1.0
            };
            return Some([r, g, b, a]);
        }
    }

    // Named colors (subset needed for transitions)
    match s {
        "transparent" => Some([0.0, 0.0, 0.0, 0.0]),
        "black" => Some([0.0, 0.0, 0.0, 1.0]),
        "white" => Some([1.0, 1.0, 1.0, 1.0]),
        "red" => Some([1.0, 0.0, 0.0, 1.0]),
        "green" => Some([0.0, 128.0 / 255.0, 0.0, 1.0]),
        "blue" => Some([0.0, 0.0, 1.0, 1.0]),
        "gray" | "grey" => Some([128.0 / 255.0, 128.0 / 255.0, 128.0 / 255.0, 1.0]),
        _ => None,
    }
}

/// Convert an [r, g, b, a] array (each in [0, 1]) back to a CSS color string.
pub fn array_to_css_color(c: [f32; 4]) -> String {
    let r = (c[0] * 255.0).round() as u8;
    let g = (c[1] * 255.0).round() as u8;
    let b = (c[2] * 255.0).round() as u8;
    let a = c[3];
    if (a - 1.0).abs() < 0.001 {
        format!("rgb({r}, {g}, {b})")
    } else {
        format!("rgba({r}, {g}, {b}, {a:.3})")
    }
}

// ---------------------------------------------------------------------------
// Property classification
// ---------------------------------------------------------------------------

/// Properties that animate as floats (lengths).
const FLOAT_PROPERTIES: &[&str] = &[
    "width",
    "height",
    "min-width",
    "max-width",
    "min-height",
    "max-height",
    "opacity",
    "padding",
    "padding-top",
    "padding-right",
    "padding-bottom",
    "padding-left",
    "margin",
    "margin-top",
    "margin-right",
    "margin-bottom",
    "margin-left",
    "border-width",
    "border-top-width",
    "border-right-width",
    "border-bottom-width",
    "border-left-width",
    "top",
    "right",
    "bottom",
    "left",
    "gap",
    "row-gap",
    "column-gap",
    "border-radius",
    "font-size",
    "line-height",
    "letter-spacing",
];

/// Properties that animate as colors.
const COLOR_PROPERTIES: &[&str] = &[
    "background-color",
    "background",
    "color",
    "border-color",
    "border-top-color",
    "border-right-color",
    "border-bottom-color",
    "border-left-color",
    "outline-color",
];

/// Try to extract an AnimatableValue from a CSS string for the given property.
pub fn parse_animatable(property: &str, css_value: &str) -> Option<AnimatableValue> {
    if FLOAT_PROPERTIES.contains(&property) {
        parse_float_value(css_value).map(AnimatableValue::Float)
    } else if COLOR_PROPERTIES.contains(&property) {
        css_color_to_array(css_value).map(AnimatableValue::Color)
    } else {
        None
    }
}

/// Parse a CSS length or number to f32 (px, rem, em, plain number).
fn parse_float_value(s: &str) -> Option<f32> {
    let s = s.trim();
    if s == "0" {
        return Some(0.0);
    }
    if let Some(n) = s.strip_suffix("px") {
        return n.trim().parse().ok();
    }
    if let Some(n) = s.strip_suffix("rem") {
        return n.trim().parse::<f32>().ok().map(|x| x * 16.0);
    }
    if let Some(n) = s.strip_suffix("em") {
        return n.trim().parse::<f32>().ok().map(|x| x * 16.0);
    }
    // Plain number (opacity, unitless line-height, etc.)
    s.parse().ok()
}

/// Convert an AnimatableValue back to a CSS string for the given property.
pub fn animatable_to_css(property: &str, value: &AnimatableValue) -> String {
    match value {
        AnimatableValue::Float(f) => {
            if property == "opacity" {
                format!("{f:.4}")
            } else {
                format!("{f:.2}px")
            }
        }
        AnimatableValue::Color(c) => array_to_css_color(*c),
    }
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn bezier_linear() {
        let b = CubicBezier::new(0.0, 0.0, 1.0, 1.0);
        assert!((b.solve(0.0) - 0.0).abs() < 0.001);
        assert!((b.solve(0.5) - 0.5).abs() < 0.001);
        assert!((b.solve(1.0) - 1.0).abs() < 0.001);
    }

    #[test]
    fn bezier_ease_endpoints() {
        let b = CubicBezier::new(0.25, 0.1, 0.25, 1.0);
        assert!((b.solve(0.0) - 0.0).abs() < 0.001);
        assert!((b.solve(1.0) - 1.0).abs() < 0.001);
        // ease at 0.5 should be > 0.5 (it accelerates early then decelerates)
        assert!(b.solve(0.5) > 0.5);
    }

    #[test]
    fn timing_function_parse() {
        assert!(matches!(TimingFunction::parse("linear"), TimingFunction::Linear));
        assert!(matches!(TimingFunction::parse("ease-in"), TimingFunction::EaseIn));
        assert!(matches!(
            TimingFunction::parse("cubic-bezier(0.4, 0, 0.2, 1)"),
            TimingFunction::CubicBezier(_, _, _, _)
        ));
    }

    #[test]
    fn parse_duration() {
        assert!((parse_duration_ms("200ms") - 200.0).abs() < 0.001);
        assert!((parse_duration_ms("0.3s") - 300.0).abs() < 0.001);
        assert!((parse_duration_ms("1s") - 1000.0).abs() < 0.001);
        assert!((parse_duration_ms("0") - 0.0).abs() < 0.001);
    }

    #[test]
    fn parse_shorthand_single() {
        let specs = parse_transition_shorthand("width 200ms ease");
        assert_eq!(specs.len(), 1);
        assert_eq!(specs[0].properties, vec!["width"]);
        assert!((specs[0].duration_ms - 200.0).abs() < 0.001);
    }

    #[test]
    fn parse_shorthand_multiple() {
        let specs =
            parse_transition_shorthand("width 200ms ease, background-color 300ms ease-in-out 50ms");
        assert_eq!(specs.len(), 2);
        assert_eq!(specs[0].properties, vec!["width"]);
        assert_eq!(specs[1].properties, vec!["background-color"]);
        assert!((specs[1].delay_ms - 50.0).abs() < 0.001);
    }

    #[test]
    fn parse_shorthand_all() {
        let specs = parse_transition_shorthand("all 200ms ease");
        assert_eq!(specs.len(), 1);
        assert_eq!(specs[0].properties, vec!["all"]);
    }

    #[test]
    fn float_interpolation() {
        let a = AnimatableValue::Float(0.0);
        let b = AnimatableValue::Float(100.0);
        match a.interpolate(&b, 0.5) {
            AnimatableValue::Float(v) => assert!((v - 50.0).abs() < 0.01),
            _ => panic!("expected Float"),
        }
    }

    #[test]
    fn color_interpolation_endpoints() {
        let black = AnimatableValue::Color([0.0, 0.0, 0.0, 1.0]);
        let white = AnimatableValue::Color([1.0, 1.0, 1.0, 1.0]);
        match black.interpolate(&white, 0.0) {
            AnimatableValue::Color(c) => {
                assert!(c[0] < 0.01);
                assert!(c[1] < 0.01);
                assert!(c[2] < 0.01);
            }
            _ => panic!("expected Color"),
        }
        match black.interpolate(&white, 1.0) {
            AnimatableValue::Color(c) => {
                assert!((c[0] - 1.0).abs() < 0.01);
                assert!((c[1] - 1.0).abs() < 0.01);
                assert!((c[2] - 1.0).abs() < 0.01);
            }
            _ => panic!("expected Color"),
        }
    }

    #[test]
    fn transition_tick_zero_duration() {
        let t = ActiveTransition {
            property: "width".into(),
            from: AnimatableValue::Float(0.0),
            to: AnimatableValue::Float(100.0),
            timing: TimingFunction::Linear,
            duration_ms: 0.0,
            delay_ms: 0.0,
            start_time: Instant::now(),
        };
        let (val, done) = t.tick(Instant::now());
        assert!(done);
        match val {
            AnimatableValue::Float(v) => assert!((v - 100.0).abs() < 0.01),
            _ => panic!("expected Float"),
        }
    }

    #[test]
    fn css_color_hex_parse() {
        let c = css_color_to_array("#ff0000").unwrap();
        assert!((c[0] - 1.0).abs() < 0.01);
        assert!(c[1] < 0.01);
        assert!(c[2] < 0.01);
    }

    #[test]
    fn css_color_rgb_parse() {
        let c = css_color_to_array("rgb(255, 128, 0)").unwrap();
        assert!((c[0] - 1.0).abs() < 0.01);
        assert!((c[1] - 128.0 / 255.0).abs() < 0.01);
        assert!(c[2] < 0.01);
    }

    #[test]
    fn parse_animatable_opacity() {
        let v = parse_animatable("opacity", "0.5").unwrap();
        match v {
            AnimatableValue::Float(f) => assert!((f - 0.5).abs() < 0.01),
            _ => panic!("expected Float"),
        }
    }

    #[test]
    fn parse_animatable_color() {
        let v = parse_animatable("background-color", "#00ff00").unwrap();
        match v {
            AnimatableValue::Color(c) => {
                assert!(c[0] < 0.01);
                assert!((c[1] - 1.0).abs() < 0.01);
                assert!(c[2] < 0.01);
            }
            _ => panic!("expected Color"),
        }
    }

    #[test]
    fn manager_lifecycle() {
        let mut mgr = TransitionManager::new();
        let node = NodeId(1);
        let spec = TransitionSpec {
            properties: vec!["width".into()],
            duration_ms: 100.0,
            timing: TimingFunction::Linear,
            delay_ms: 0.0,
        };

        mgr.on_style_change(
            node,
            "width",
            AnimatableValue::Float(0.0),
            AnimatableValue::Float(100.0),
            &spec,
        );
        assert!(mgr.has_active());

        // Tick at start: should be near 0
        let updates = mgr.tick_all(Instant::now());
        assert!(!updates.is_empty());
    }
}

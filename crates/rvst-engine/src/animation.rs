//! CSS Animations & Transitions engine.
//!
//! Ticked once per frame before layout. Produces `Op::SetStyle` ops for
//! interpolated property values (transitions) and keyframe animations.

use rvst_core::{NodeId, Op};
use std::collections::HashMap;

// ---------------------------------------------------------------------------
// Easing functions (T1)
// ---------------------------------------------------------------------------

/// CSS easing function.
#[derive(Debug, Clone, PartialEq)]
pub enum EasingFn {
    Linear,
    Ease,
    EaseIn,
    EaseOut,
    EaseInOut,
    CubicBezier(f64, f64, f64, f64), // x1, y1, x2, y2
}

impl Default for EasingFn {
    fn default() -> Self {
        EasingFn::Ease
    }
}

impl EasingFn {
    /// Evaluate the easing function at time t (0.0..1.0) → progress (0.0..1.0).
    pub fn evaluate(&self, t: f64) -> f64 {
        let t = t.clamp(0.0, 1.0);
        match self {
            EasingFn::Linear => t,
            // Standard CSS named easings as cubic-bezier
            EasingFn::Ease => cubic_bezier_solve(0.25, 0.1, 0.25, 1.0, t),
            EasingFn::EaseIn => cubic_bezier_solve(0.42, 0.0, 1.0, 1.0, t),
            EasingFn::EaseOut => cubic_bezier_solve(0.0, 0.0, 0.58, 1.0, t),
            EasingFn::EaseInOut => cubic_bezier_solve(0.42, 0.0, 0.58, 1.0, t),
            EasingFn::CubicBezier(x1, y1, x2, y2) => cubic_bezier_solve(*x1, *y1, *x2, *y2, t),
        }
    }

    /// Parse a CSS timing function string.
    pub fn parse(s: &str) -> Self {
        let s = s.trim().to_lowercase();
        match s.as_str() {
            "linear" => EasingFn::Linear,
            "ease" => EasingFn::Ease,
            "ease-in" => EasingFn::EaseIn,
            "ease-out" => EasingFn::EaseOut,
            "ease-in-out" => EasingFn::EaseInOut,
            _ => {
                // Try cubic-bezier(x1, y1, x2, y2)
                if let Some(inner) = s
                    .strip_prefix("cubic-bezier(")
                    .and_then(|s| s.strip_suffix(')'))
                {
                    let parts: Vec<f64> = inner
                        .split(',')
                        .filter_map(|p| p.trim().parse().ok())
                        .collect();
                    if parts.len() == 4 {
                        return EasingFn::CubicBezier(parts[0], parts[1], parts[2], parts[3]);
                    }
                }
                EasingFn::Ease // default fallback
            }
        }
    }
}

/// Solve cubic-bezier curve: given t (time 0..1), find y (progress 0..1).
/// Uses bisection to find the x parameter, then evaluates y.
fn cubic_bezier_solve(x1: f64, y1: f64, x2: f64, y2: f64, t: f64) -> f64 {
    if t <= 0.0 {
        return 0.0;
    }
    if t >= 1.0 {
        return 1.0;
    }
    // Bisect to find parameter s where bezier_x(s) ≈ t
    let mut lo = 0.0_f64;
    let mut hi = 1.0_f64;
    for _ in 0..20 {
        let mid = (lo + hi) / 2.0;
        let x = bezier_component(x1, x2, mid);
        if x < t {
            lo = mid;
        } else {
            hi = mid;
        }
    }
    let s = (lo + hi) / 2.0;
    bezier_component(y1, y2, s)
}

/// Evaluate one component of a cubic bezier at parameter s.
/// B(s) = 3(1-s)²·s·p1 + 3(1-s)·s²·p2 + s³
fn bezier_component(p1: f64, p2: f64, s: f64) -> f64 {
    let inv = 1.0 - s;
    3.0 * inv * inv * s * p1 + 3.0 * inv * s * s * p2 + s * s * s
}

// ---------------------------------------------------------------------------
// CSS value interpolation (T2)
// ---------------------------------------------------------------------------

/// Interpolate between two CSS values at the given progress (0.0..1.0).
/// Returns the interpolated CSS value as a string.
pub fn interpolate_css_value(from: &str, to: &str, progress: f64) -> String {
    let from = from.trim();
    let to = to.trim();

    // Same value — no interpolation needed
    if from == to {
        return to.to_string();
    }

    // Try color interpolation
    if let (Some(c1), Some(c2)) = (parse_color_rgba(from), parse_color_rgba(to)) {
        let r = lerp(c1.0, c2.0, progress);
        let g = lerp(c1.1, c2.1, progress);
        let b = lerp(c1.2, c2.2, progress);
        let a = lerp(c1.3, c2.3, progress);
        return format!(
            "rgba({}, {}, {}, {})",
            (r * 255.0).round() as u8,
            (g * 255.0).round() as u8,
            (b * 255.0).round() as u8,
            round3(a)
        );
    }

    // Try numeric length interpolation (e.g. "16px" → "24px")
    if let (Some((v1, unit1)), Some((v2, unit2))) = (parse_length(from), parse_length(to)) {
        if unit1 == unit2 {
            let v = lerp(v1, v2, progress);
            return format!("{}{}", round3(v), unit1);
        }
    }

    // Try plain number interpolation (e.g. opacity "0.5" → "1")
    if let (Ok(v1), Ok(v2)) = (from.parse::<f64>(), to.parse::<f64>()) {
        return round3(lerp(v1, v2, progress)).to_string();
    }

    // Try transform interpolation
    if (from.contains('(') && to.contains('('))
        && (from.contains("translate")
            || from.contains("scale")
            || from.contains("rotate")
            || to.contains("translate")
            || to.contains("scale")
            || to.contains("rotate"))
    {
        return interpolate_transform(from, to, progress);
    }

    // Discrete: swap at 50%
    if progress < 0.5 {
        from.to_string()
    } else {
        to.to_string()
    }
}

fn lerp(a: f64, b: f64, t: f64) -> f64 {
    a + (b - a) * t
}

fn round3(v: f64) -> f64 {
    (v * 1000.0).round() / 1000.0
}

/// Parse a CSS color to (r, g, b, a) in 0.0..1.0 range.
fn parse_color_rgba(s: &str) -> Option<(f64, f64, f64, f64)> {
    let s = s.trim();

    // rgb(r, g, b) or rgba(r, g, b, a)
    if let Some(inner) = s
        .strip_prefix("rgba(")
        .or_else(|| s.strip_prefix("rgb("))
        .and_then(|s| s.strip_suffix(')'))
    {
        let parts: Vec<&str> = inner.split(|c| c == ',' || c == '/').collect();
        if parts.len() >= 3 {
            let r = parse_color_component(parts[0])?;
            let g = parse_color_component(parts[1])?;
            let b = parse_color_component(parts[2])?;
            let a = if parts.len() >= 4 {
                parse_alpha_component(parts[3])?
            } else {
                1.0
            };
            return Some((r, g, b, a));
        }
    }

    // #hex
    if s.starts_with('#') {
        let hex = &s[1..];
        return match hex.len() {
            3 => {
                let r = u8::from_str_radix(&hex[0..1].repeat(2), 16).ok()? as f64 / 255.0;
                let g = u8::from_str_radix(&hex[1..2].repeat(2), 16).ok()? as f64 / 255.0;
                let b = u8::from_str_radix(&hex[2..3].repeat(2), 16).ok()? as f64 / 255.0;
                Some((r, g, b, 1.0))
            }
            6 => {
                let r = u8::from_str_radix(&hex[0..2], 16).ok()? as f64 / 255.0;
                let g = u8::from_str_radix(&hex[2..4], 16).ok()? as f64 / 255.0;
                let b = u8::from_str_radix(&hex[4..6], 16).ok()? as f64 / 255.0;
                Some((r, g, b, 1.0))
            }
            8 => {
                let r = u8::from_str_radix(&hex[0..2], 16).ok()? as f64 / 255.0;
                let g = u8::from_str_radix(&hex[2..4], 16).ok()? as f64 / 255.0;
                let b = u8::from_str_radix(&hex[4..6], 16).ok()? as f64 / 255.0;
                let a = u8::from_str_radix(&hex[6..8], 16).ok()? as f64 / 255.0;
                Some((r, g, b, a))
            }
            _ => None,
        };
    }

    // Named colors (common ones used by Tailwind)
    match s {
        "transparent" => Some((0.0, 0.0, 0.0, 0.0)),
        "black" => Some((0.0, 0.0, 0.0, 1.0)),
        "white" => Some((1.0, 1.0, 1.0, 1.0)),
        "red" => Some((1.0, 0.0, 0.0, 1.0)),
        "green" => Some((0.0, 128.0 / 255.0, 0.0, 1.0)),
        "blue" => Some((0.0, 0.0, 1.0, 1.0)),
        _ => None,
    }
}

fn parse_color_component(s: &str) -> Option<f64> {
    let s = s.trim();
    if let Some(pct) = s.strip_suffix('%') {
        return pct.trim().parse::<f64>().ok().map(|v| v / 100.0);
    }
    s.parse::<f64>().ok().map(|v| v / 255.0)
}

fn parse_alpha_component(s: &str) -> Option<f64> {
    let s = s.trim();
    if let Some(pct) = s.strip_suffix('%') {
        return pct.trim().parse::<f64>().ok().map(|v| v / 100.0);
    }
    s.parse::<f64>().ok()
}

/// Parse "16px", "2rem", "50%", etc.
fn parse_length(s: &str) -> Option<(f64, &str)> {
    let s = s.trim();
    for unit in &["px", "rem", "em", "%", "vw", "vh", "deg", "turn"] {
        if let Some(num) = s.strip_suffix(unit) {
            if let Ok(v) = num.trim().parse::<f64>() {
                return Some((v, unit));
            }
        }
    }
    None
}

/// Simple transform interpolation: lerp matching transform functions.
fn interpolate_transform(from: &str, to: &str, progress: f64) -> String {
    let from_fns = parse_transform_functions(from);
    let to_fns = parse_transform_functions(to);

    if from_fns.len() != to_fns.len() {
        // Different number of functions — discrete swap
        return if progress < 0.5 {
            from.to_string()
        } else {
            to.to_string()
        };
    }

    let mut result = Vec::new();
    for (f1, f2) in from_fns.iter().zip(to_fns.iter()) {
        if f1.name != f2.name || f1.args.len() != f2.args.len() {
            // Mismatched functions — discrete swap
            return if progress < 0.5 {
                from.to_string()
            } else {
                to.to_string()
            };
        }
        let args: Vec<String> = f1
            .args
            .iter()
            .zip(f2.args.iter())
            .map(|(a, b)| {
                if let (Some((v1, u1)), Some((v2, u2))) = (parse_length(a), parse_length(b)) {
                    if u1 == u2 {
                        return format!("{}{}", round3(lerp(v1, v2, progress)), u1);
                    }
                }
                if let (Ok(v1), Ok(v2)) = (a.parse::<f64>(), b.parse::<f64>()) {
                    return round3(lerp(v1, v2, progress)).to_string();
                }
                if progress < 0.5 { a.clone() } else { b.clone() }
            })
            .collect();
        result.push(format!("{}({})", f1.name, args.join(", ")));
    }
    result.join(" ")
}

struct TransformFn {
    name: String,
    args: Vec<String>,
}

fn parse_transform_functions(s: &str) -> Vec<TransformFn> {
    let mut fns = Vec::new();
    let mut i = 0;
    let bytes = s.as_bytes();
    while i < bytes.len() {
        // Skip whitespace
        while i < bytes.len() && bytes[i] == b' ' {
            i += 1;
        }
        if i >= bytes.len() {
            break;
        }
        // Find function name
        let name_start = i;
        while i < bytes.len() && bytes[i] != b'(' && bytes[i] != b' ' {
            i += 1;
        }
        if i >= bytes.len() || bytes[i] != b'(' {
            break;
        }
        let name = s[name_start..i].to_string();
        i += 1; // skip '('
        // Find args until ')'
        let args_start = i;
        let mut depth = 1;
        while i < bytes.len() && depth > 0 {
            if bytes[i] == b'(' {
                depth += 1;
            } else if bytes[i] == b')' {
                depth -= 1;
            }
            if depth > 0 {
                i += 1;
            }
        }
        let args_str = &s[args_start..i];
        let args: Vec<String> = args_str
            .split(',')
            .map(|a| a.trim().to_string())
            .collect();
        fns.push(TransformFn { name, args });
        if i < bytes.len() {
            i += 1;
        } // skip ')'
    }
    fns
}

// ---------------------------------------------------------------------------
// Transition config (T3 — parsed from CSS)
// ---------------------------------------------------------------------------

/// Per-property transition configuration.
#[derive(Debug, Clone)]
pub struct TransitionConfig {
    /// Which property this applies to, or "all".
    pub property: String,
    pub duration_ms: f64,
    pub delay_ms: f64,
    pub timing_fn: EasingFn,
}

/// Parse the CSS `transition` shorthand or sub-properties from a styles map.
/// Returns a list of transition configs.
pub fn parse_transition_configs(styles: &HashMap<String, String>) -> Vec<TransitionConfig> {
    // Check for shorthand first: "transition: all 0.3s ease"
    if let Some(shorthand) = styles.get("transition") {
        return parse_transition_shorthand(shorthand);
    }

    // Otherwise, check individual sub-properties
    let properties: Vec<&str> = styles
        .get("transition-property")
        .map(|s| s.split(',').collect())
        .unwrap_or_else(|| vec!["all"]);

    let durations: Vec<f64> = styles
        .get("transition-duration")
        .map(|s| s.split(',').map(|d| parse_time_ms(d.trim())).collect())
        .unwrap_or_default();

    let delays: Vec<f64> = styles
        .get("transition-delay")
        .map(|s| s.split(',').map(|d| parse_time_ms(d.trim())).collect())
        .unwrap_or_default();

    let timing_fns: Vec<EasingFn> = styles
        .get("transition-timing-function")
        .map(|s| s.split(',').map(|t| EasingFn::parse(t.trim())).collect())
        .unwrap_or_default();

    properties
        .iter()
        .enumerate()
        .map(|(i, prop)| TransitionConfig {
            property: prop.trim().to_string(),
            duration_ms: durations.get(i).or(durations.first()).copied().unwrap_or(0.0),
            delay_ms: delays.get(i).or(delays.first()).copied().unwrap_or(0.0),
            timing_fn: timing_fns
                .get(i)
                .or(timing_fns.first())
                .cloned()
                .unwrap_or_default(),
        })
        .collect()
}

/// Parse a `transition` shorthand value like "all 0.3s ease" or
/// "opacity 0.2s ease-in, transform 0.3s ease-out".
fn parse_transition_shorthand(s: &str) -> Vec<TransitionConfig> {
    s.split(',')
        .filter_map(|part| {
            let tokens: Vec<&str> = part.trim().split_whitespace().collect();
            if tokens.is_empty() {
                return None;
            }
            let mut property = "all".to_string();
            let mut duration_ms = 0.0;
            let mut delay_ms = 0.0;
            let mut timing_fn = EasingFn::Ease;
            let mut found_duration = false;

            for token in &tokens {
                if token.ends_with('s') || token.ends_with("ms") {
                    if token.parse::<f64>().is_err() {
                        // It's a time value
                        let ms = parse_time_ms(token);
                        if !found_duration {
                            duration_ms = ms;
                            found_duration = true;
                        } else {
                            delay_ms = ms;
                        }
                        continue;
                    }
                }
                let parsed = EasingFn::parse(token);
                if parsed != EasingFn::Ease || *token == "ease" {
                    // Only set timing if it's a recognized keyword or the default "ease" literal
                    if *token == "linear"
                        || *token == "ease"
                        || *token == "ease-in"
                        || *token == "ease-out"
                        || *token == "ease-in-out"
                        || token.starts_with("cubic-bezier")
                    {
                        timing_fn = parsed;
                        continue;
                    }
                }
                // Must be the property name
                property = token.to_string();
            }

            if duration_ms > 0.0 || delay_ms > 0.0 {
                Some(TransitionConfig {
                    property,
                    duration_ms,
                    delay_ms,
                    timing_fn,
                })
            } else {
                None
            }
        })
        .collect()
}

/// Parse a CSS time value ("0.3s", "300ms") to milliseconds (public API).
pub fn parse_time_ms_pub(s: &str) -> f64 {
    parse_time_ms(s)
}

/// Parse a CSS time value ("0.3s", "300ms") to milliseconds.
fn parse_time_ms(s: &str) -> f64 {
    let s = s.trim();
    if let Some(ms) = s.strip_suffix("ms") {
        return ms.trim().parse::<f64>().unwrap_or(0.0);
    }
    if let Some(sec) = s.strip_suffix('s') {
        return sec.trim().parse::<f64>().unwrap_or(0.0) * 1000.0;
    }
    s.parse::<f64>().unwrap_or(0.0)
}

// ---------------------------------------------------------------------------
// Keyframe types (T6)
// ---------------------------------------------------------------------------

/// A single keyframe stop in an @keyframes animation.
#[derive(Debug, Clone)]
pub struct Keyframe {
    /// Progress 0.0 (from/0%) to 1.0 (to/100%).
    pub progress: f64,
    /// Property values at this keyframe.
    pub properties: HashMap<String, String>,
}

/// Configuration for a CSS animation on a node.
#[derive(Debug, Clone)]
pub struct AnimationConfig {
    pub name: String,
    pub duration_ms: f64,
    pub delay_ms: f64,
    pub timing_fn: EasingFn,
    pub iteration_count: f64, // f64::INFINITY for "infinite"
    pub direction: AnimationDirection,
    pub fill_mode: FillMode,
}

#[derive(Debug, Clone, Copy, PartialEq)]
pub enum AnimationDirection {
    Normal,
    Reverse,
    Alternate,
    AlternateReverse,
}

#[derive(Debug, Clone, Copy, PartialEq)]
pub enum FillMode {
    None,
    Forwards,
    Backwards,
    Both,
}

// ---------------------------------------------------------------------------
// Active transition / animation state
// ---------------------------------------------------------------------------

struct ActiveTransition {
    node_id: NodeId,
    property: String,
    from: String,
    to: String,
    duration_ms: f64,
    delay_ms: f64,
    timing_fn: EasingFn,
    start_time_ms: f64,
}

struct ActiveAnimation {
    node_id: NodeId,
    config: AnimationConfig,
    keyframes: Vec<Keyframe>,
    start_time_ms: f64,
}

// ---------------------------------------------------------------------------
// Animation Engine (T4/T8)
// ---------------------------------------------------------------------------

/// Drives CSS transitions and @keyframes animations.
/// Call `tick()` once per frame before layout.
pub struct AnimationEngine {
    transitions: Vec<ActiveTransition>,
    animations: Vec<ActiveAnimation>,
    /// Per-node previous style values for transition change detection.
    prev_styles: HashMap<NodeId, HashMap<String, String>>,
}

impl AnimationEngine {
    pub fn new() -> Self {
        Self {
            transitions: Vec::new(),
            animations: Vec::new(),
            prev_styles: HashMap::new(),
        }
    }

    /// Returns true if any transitions or animations are active (need redraws).
    pub fn has_active(&self) -> bool {
        !self.transitions.is_empty() || !self.animations.is_empty()
    }

    /// Start a transition for a property on a node.
    pub fn start_transition(
        &mut self,
        node_id: NodeId,
        property: String,
        from: String,
        to: String,
        config: &TransitionConfig,
        now_ms: f64,
    ) {
        // Cancel any existing transition for this (node, property)
        self.transitions
            .retain(|t| !(t.node_id == node_id && t.property == property));

        self.transitions.push(ActiveTransition {
            node_id,
            property,
            from,
            to,
            duration_ms: config.duration_ms,
            delay_ms: config.delay_ms,
            timing_fn: config.timing_fn.clone(),
            start_time_ms: now_ms,
        });
    }

    /// Start a @keyframes animation on a node.
    pub fn start_animation(
        &mut self,
        node_id: NodeId,
        config: AnimationConfig,
        keyframes: Vec<Keyframe>,
        now_ms: f64,
    ) {
        // Cancel existing animation with same name on this node
        self.animations
            .retain(|a| !(a.node_id == node_id && a.config.name == config.name));

        self.animations.push(ActiveAnimation {
            node_id,
            config,
            keyframes,
            start_time_ms: now_ms,
        });
    }

    /// Detect property changes on a node and start transitions if configured.
    /// Call this when CSS re-applies styles (hover, focus, class change).
    pub fn detect_transitions(
        &mut self,
        node_id: NodeId,
        old_styles: &HashMap<String, String>,
        new_styles: &HashMap<String, String>,
        transition_configs: &[TransitionConfig],
        now_ms: f64,
    ) {
        if transition_configs.is_empty() {
            return;
        }

        for (prop, new_val) in new_styles {
            let old_val = match old_styles.get(prop) {
                Some(v) if v != new_val => v,
                _ => continue,
            };

            // Check if this property has a transition configured
            let config = transition_configs.iter().find(|c| {
                c.property == "all" || c.property == *prop
            });

            if let Some(config) = config {
                if config.duration_ms > 0.0 {
                    self.start_transition(
                        node_id,
                        prop.clone(),
                        old_val.clone(),
                        new_val.clone(),
                        config,
                        now_ms,
                    );
                }
            }
        }
    }

    /// Advance all animations/transitions and return style ops to apply.
    pub fn tick(&mut self, now_ms: f64) -> Vec<Op> {
        let mut ops = Vec::new();

        // Tick transitions
        let mut finished_transitions = Vec::new();
        for (i, t) in self.transitions.iter().enumerate() {
            let elapsed = now_ms - t.start_time_ms - t.delay_ms;
            if elapsed < 0.0 {
                // Still in delay period — keep from value
                ops.push(Op::SetStyle {
                    id: t.node_id,
                    key: t.property.clone(),
                    value: t.from.clone(),
                });
                continue;
            }
            let progress_raw = if t.duration_ms > 0.0 {
                (elapsed / t.duration_ms).clamp(0.0, 1.0)
            } else {
                1.0
            };
            let progress = t.timing_fn.evaluate(progress_raw);
            let value = interpolate_css_value(&t.from, &t.to, progress);
            ops.push(Op::SetStyle {
                id: t.node_id,
                key: t.property.clone(),
                value,
            });
            if progress_raw >= 1.0 {
                finished_transitions.push(i);
            }
        }
        // Remove finished (in reverse to keep indices valid)
        for i in finished_transitions.into_iter().rev() {
            self.transitions.swap_remove(i);
        }

        // Tick animations
        let mut finished_animations = Vec::new();
        for (i, a) in self.animations.iter().enumerate() {
            let elapsed = now_ms - a.start_time_ms - a.config.delay_ms;
            if elapsed < 0.0 {
                // In delay — apply backwards fill if applicable
                if matches!(a.config.fill_mode, FillMode::Backwards | FillMode::Both) {
                    if let Some(first_kf) = a.keyframes.first() {
                        for (prop, val) in &first_kf.properties {
                            ops.push(Op::SetStyle {
                                id: a.node_id,
                                key: prop.clone(),
                                value: val.clone(),
                            });
                        }
                    }
                }
                continue;
            }

            let total_duration = a.config.duration_ms;
            if total_duration <= 0.0 {
                finished_animations.push(i);
                continue;
            }

            let iteration = elapsed / total_duration;
            let is_finished = iteration >= a.config.iteration_count;

            let current_iteration = if is_finished {
                a.config.iteration_count
            } else {
                iteration
            };

            // Compute progress within current iteration (0.0..1.0)
            let mut progress_in_iter = current_iteration.fract();
            if progress_in_iter == 0.0 && current_iteration > 0.0 {
                progress_in_iter = 1.0; // end of last iteration
            }

            // Apply direction
            let iter_index = current_iteration.floor() as u64;
            let reversed = match a.config.direction {
                AnimationDirection::Normal => false,
                AnimationDirection::Reverse => true,
                AnimationDirection::Alternate => iter_index % 2 == 1,
                AnimationDirection::AlternateReverse => iter_index % 2 == 0,
            };
            if reversed {
                progress_in_iter = 1.0 - progress_in_iter;
            }

            // Apply easing
            let eased = a.config.timing_fn.evaluate(progress_in_iter);

            // Find bounding keyframes and interpolate
            let kf_ops = interpolate_keyframes(&a.keyframes, eased, a.node_id);
            ops.extend(kf_ops);

            if is_finished {
                // Apply fill mode
                if matches!(a.config.fill_mode, FillMode::Forwards | FillMode::Both) {
                    // Keep last computed value (already applied above)
                } else {
                    // Remove animated properties — they revert to CSS values
                    // (The next CSS re-apply will restore them)
                }
                finished_animations.push(i);
            }
        }
        for i in finished_animations.into_iter().rev() {
            self.animations.swap_remove(i);
        }

        ops
    }
}

/// Find the two bounding keyframes for a progress value and interpolate.
fn interpolate_keyframes(
    keyframes: &[Keyframe],
    progress: f64,
    node_id: NodeId,
) -> Vec<Op> {
    if keyframes.is_empty() {
        return Vec::new();
    }

    // Find bounding keyframes
    let mut before = &keyframes[0];
    let mut after = keyframes.last().unwrap();

    for kf in keyframes {
        if kf.progress <= progress {
            before = kf;
        }
        if kf.progress >= progress && kf.progress < after.progress {
            after = kf;
        }
    }
    // More precise: find the first keyframe >= progress
    for kf in keyframes {
        if kf.progress >= progress {
            after = kf;
            break;
        }
    }

    // Interpolate between before and after
    let range = after.progress - before.progress;
    let local_progress = if range > 0.0 {
        ((progress - before.progress) / range).clamp(0.0, 1.0)
    } else {
        1.0
    };

    let mut ops = Vec::new();

    // Collect all properties from both keyframes
    let mut all_props: std::collections::HashSet<&str> = std::collections::HashSet::new();
    for (k, _) in &before.properties {
        all_props.insert(k.as_str());
    }
    for (k, _) in &after.properties {
        all_props.insert(k.as_str());
    }

    for prop in all_props {
        let from_val = before.properties.get(prop);
        let to_val = after.properties.get(prop);
        let value = match (from_val, to_val) {
            (Some(from), Some(to)) => interpolate_css_value(from, to, local_progress),
            (Some(v), None) | (None, Some(v)) => v.clone(),
            (None, None) => continue,
        };
        ops.push(Op::SetStyle {
            id: node_id,
            key: prop.to_string(),
            value,
        });
    }

    ops
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn easing_linear() {
        let e = EasingFn::Linear;
        assert_eq!(e.evaluate(0.0), 0.0);
        assert_eq!(e.evaluate(0.5), 0.5);
        assert_eq!(e.evaluate(1.0), 1.0);
    }

    #[test]
    fn easing_cubic_bezier_endpoints() {
        let e = EasingFn::Ease;
        assert!((e.evaluate(0.0) - 0.0).abs() < 0.01);
        assert!((e.evaluate(1.0) - 1.0).abs() < 0.01);
        // ease should be faster at start, slower at end
        assert!(e.evaluate(0.5) > 0.5);
    }

    #[test]
    fn easing_parse() {
        assert_eq!(EasingFn::parse("linear"), EasingFn::Linear);
        assert_eq!(EasingFn::parse("ease-in"), EasingFn::EaseIn);
        assert_eq!(
            EasingFn::parse("cubic-bezier(0.4, 0, 0.2, 1)"),
            EasingFn::CubicBezier(0.4, 0.0, 0.2, 1.0)
        );
    }

    #[test]
    fn interpolate_colors() {
        let result = interpolate_css_value("#000000", "#ffffff", 0.5);
        // Should be approximately rgb(128, 128, 128)
        assert!(result.contains("128") || result.contains("127"));
    }

    #[test]
    fn interpolate_lengths() {
        assert_eq!(interpolate_css_value("0px", "100px", 0.5), "50px");
        assert_eq!(interpolate_css_value("10px", "20px", 0.25), "12.5px");
    }

    #[test]
    fn interpolate_opacity() {
        assert_eq!(interpolate_css_value("0", "1", 0.5), "0.5");
        assert_eq!(interpolate_css_value("0.2", "0.8", 0.5), "0.5");
    }

    #[test]
    fn interpolate_discrete() {
        // Non-interpolable values swap at 50%
        assert_eq!(
            interpolate_css_value("block", "none", 0.3),
            "block"
        );
        assert_eq!(
            interpolate_css_value("block", "none", 0.7),
            "none"
        );
    }

    #[test]
    fn parse_transition_shorthand_basic() {
        let configs = parse_transition_shorthand("all 0.3s ease");
        assert_eq!(configs.len(), 1);
        assert_eq!(configs[0].property, "all");
        assert!((configs[0].duration_ms - 300.0).abs() < 0.1);
        assert_eq!(configs[0].timing_fn, EasingFn::Ease);
    }

    #[test]
    fn parse_transition_shorthand_multiple() {
        let configs = parse_transition_shorthand("opacity 0.2s ease-in, transform 0.3s ease-out");
        assert_eq!(configs.len(), 2);
        assert_eq!(configs[0].property, "opacity");
        assert!((configs[0].duration_ms - 200.0).abs() < 0.1);
        assert_eq!(configs[1].property, "transform");
        assert!((configs[1].duration_ms - 300.0).abs() < 0.1);
    }

    #[test]
    fn parse_time_values() {
        assert!((parse_time_ms("0.3s") - 300.0).abs() < 0.1);
        assert!((parse_time_ms("300ms") - 300.0).abs() < 0.1);
        assert!((parse_time_ms("1s") - 1000.0).abs() < 0.1);
    }

    #[test]
    fn transition_tick_produces_interpolated_values() {
        let mut engine = AnimationEngine::new();
        let node = NodeId(1);
        let config = TransitionConfig {
            property: "opacity".to_string(),
            duration_ms: 1000.0,
            delay_ms: 0.0,
            timing_fn: EasingFn::Linear,
        };
        engine.start_transition(node, "opacity".into(), "0".into(), "1".into(), &config, 0.0);
        assert!(engine.has_active());

        // At 500ms, should be ~0.5
        let ops = engine.tick(500.0);
        assert_eq!(ops.len(), 1);
        if let Op::SetStyle { key, value, .. } = &ops[0] {
            assert_eq!(key, "opacity");
            let v: f64 = value.parse().unwrap();
            assert!((v - 0.5).abs() < 0.01);
        }

        // At 1000ms, should be 1.0 and transition removed
        let ops = engine.tick(1000.0);
        assert_eq!(ops.len(), 1);
        if let Op::SetStyle { value, .. } = &ops[0] {
            let v: f64 = value.parse().unwrap();
            assert!((v - 1.0).abs() < 0.01);
        }
        assert!(!engine.has_active());
    }

    #[test]
    fn animation_tick_with_keyframes() {
        let mut engine = AnimationEngine::new();
        let node = NodeId(1);
        let keyframes = vec![
            Keyframe {
                progress: 0.0,
                properties: [("opacity".to_string(), "1".to_string())]
                    .into_iter()
                    .collect(),
            },
            Keyframe {
                progress: 0.5,
                properties: [("opacity".to_string(), "0.5".to_string())]
                    .into_iter()
                    .collect(),
            },
            Keyframe {
                progress: 1.0,
                properties: [("opacity".to_string(), "1".to_string())]
                    .into_iter()
                    .collect(),
            },
        ];
        let config = AnimationConfig {
            name: "pulse".into(),
            duration_ms: 2000.0,
            delay_ms: 0.0,
            timing_fn: EasingFn::Linear,
            iteration_count: 1.0,
            direction: AnimationDirection::Normal,
            fill_mode: FillMode::None,
        };
        engine.start_animation(node, config, keyframes, 0.0);

        // At 500ms (25% through), should be between kf 0% and 50%
        let ops = engine.tick(500.0);
        assert!(!ops.is_empty());
        if let Op::SetStyle { value, .. } = &ops[0] {
            let v: f64 = value.parse().unwrap();
            assert!(v > 0.7 && v < 0.9, "Expected ~0.75, got {v}");
        }
    }
}

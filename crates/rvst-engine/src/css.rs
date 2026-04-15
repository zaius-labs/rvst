//! CSS engine powered by lightningcss.
//!
//! Parses CSS text, matches selectors against the RVST tree, applies styles.
//! Uses lightningcss for proper parsing (no regex), then a lightweight custom
//! selector matcher for the subset of selectors that Svelte 5 produces.

use lightningcss::rules::CssRule;
use lightningcss::stylesheet::{ParserOptions, StyleSheet};
use lightningcss::traits::ToCss;
use std::collections::HashMap;

// ---------------------------------------------------------------------------
// Parsed rule representation
// ---------------------------------------------------------------------------

/// Pseudo-class conditions that must be met for a rule to match.
#[derive(Debug, Clone, PartialEq)]
pub enum PseudoCondition {
    Hover,
    Focus,
    Active,
}

/// A single CSS rule: selector text + property map + cascade metadata.
#[derive(Debug, Clone)]
pub struct ParsedRule {
    /// Normalized selector text (from lightningcss ToCss).
    pub selector: String,
    /// Specificity as (a, b, c) — IDs, classes/attrs/pseudoclasses, elements.
    pub specificity: (u32, u32, u32),
    /// Property name → value (both as CSS strings).
    pub properties: HashMap<String, String>,
    /// If this rule came from inside `@media`, the condition text.
    pub media_condition: Option<String>,
    /// Source order index for cascade tie-breaking.
    pub source_order: usize,
    /// Pseudo-class conditions that must be met for this rule to match.
    pub pseudo_conditions: Vec<PseudoCondition>,
    /// Properties marked !important (these override normal cascade).
    pub important_properties: HashMap<String, String>,
    /// If this rule targets a pseudo-element: "before", "after", or "placeholder".
    pub pseudo_element: Option<String>,
}

// ---------------------------------------------------------------------------
// Selector matching types
// ---------------------------------------------------------------------------

/// An attribute condition in a selector, e.g. `[disabled]` or `[type="text"]`.
#[derive(Debug, Clone, PartialEq)]
pub struct AttrCondition {
    pub name: String,
    /// If None, just checks existence (`[disabled]`). If Some, checks equality (`[type="text"]`).
    pub value: Option<String>,
}

/// A structural pseudo-class condition.
#[derive(Debug, Clone, PartialEq)]
pub enum StructuralPseudo {
    FirstChild,
    LastChild,
    NthChild(usize), // 1-based
}

/// One piece of a compound selector (e.g. `div.foo#bar`).
#[derive(Debug, Clone, PartialEq)]
pub struct SimpleSelector {
    pub tag: Option<String>,
    pub classes: Vec<String>,
    pub id: Option<String>,
    /// If true, this was inside :global() — skip Svelte scoping checks.
    pub is_global: bool,
    /// Attribute conditions: `[disabled]`, `[type="text"]`, etc.
    pub attributes: Vec<AttrCondition>,
    /// :not() selectors — each inner selector must NOT match.
    pub not_selectors: Vec<SimpleSelector>,
    /// Structural pseudo-classes: :first-child, :last-child, :nth-child(n).
    pub structural: Vec<StructuralPseudo>,
}

/// A combinator between compound selectors.
#[derive(Debug, Clone, Copy, PartialEq)]
pub enum Combinator {
    Descendant, // (space)
    Child,      // >
    Adjacent,   // +
    Sibling,    // ~
}

/// A parsed selector: alternating SimpleSelector and Combinator tokens,
/// stored right-to-left for matching.
#[derive(Debug, Clone)]
pub struct SelectorChain {
    /// The rightmost (subject) selector.
    pub subject: SimpleSelector,
    /// Ancestor chain: (combinator, selector) pairs walking left.
    pub ancestors: Vec<(Combinator, SimpleSelector)>,
}

// ---------------------------------------------------------------------------
// CSS Engine
// ---------------------------------------------------------------------------

/// Stored CSS state: all parsed rules + CSS custom properties.
#[derive(Debug, Default)]
pub struct CssEngine {
    /// All parsed rules, in source order.
    pub rules: Vec<ParsedRule>,
    /// CSS custom properties from `:root` rules.
    pub variables: HashMap<String, String>,
    /// Internal counter for source ordering.
    next_order: usize,
    /// Currently hovered node (for `:hover` pseudo-class matching).
    pub hovered_node: Option<rvst_core::NodeId>,
    /// Currently focused node (for `:focus` pseudo-class matching).
    pub focused_node: Option<rvst_core::NodeId>,
    /// Viewport dimensions for @media query evaluation.
    pub viewport_width: f32,
    pub viewport_height: f32,
}

impl CssEngine {
    pub fn new() -> Self {
        let mut engine = Self::default();
        // Seed Tailwind v4 @property initial values.
        // These are defined via @property { initial-value: X } which lightningcss
        // may not fully expose. Hardcode the known defaults.
        engine
            .variables
            .insert("--tw-border-style".into(), "solid".into());
        engine
            .variables
            .insert("--tw-font-weight".into(), "initial".into());
        engine
    }

    /// Parse a CSS text blob and add its rules to the engine.
    pub fn load_css(&mut self, css_text: &str) {
        let opts = ParserOptions::default();
        let sheet = match StyleSheet::parse(css_text, opts) {
            Ok(s) => s,
            Err(e) => {
                eprintln!("[rvst-css] parse error: {e}");
                return;
            }
        };

        for rule in &sheet.rules.0 {
            self.process_rule(rule, None);
        }
    }

    fn process_rule(&mut self, rule: &CssRule, media: Option<&str>) {
        match rule {
            CssRule::Style(style_rule) => {
                // Extract properties from declarations
                let mut properties = HashMap::new();
                let mut is_root_rule = false;

                for item in style_rule.declarations.declarations.iter() {
                    let name = item
                        .property_id()
                        .to_css_string(lightningcss::printer::PrinterOptions::default())
                        .unwrap_or_default();
                    let value = item
                        .value_to_css_string(lightningcss::printer::PrinterOptions::default())
                        .unwrap_or_default();
                    if !name.is_empty() && !value.is_empty() {
                        properties.insert(name, value);
                    }
                }
                // Extract !important declarations
                let mut important_properties = HashMap::new();
                for item in style_rule.declarations.important_declarations.iter() {
                    let name = item
                        .property_id()
                        .to_css_string(lightningcss::printer::PrinterOptions::default())
                        .unwrap_or_default();
                    let value = item
                        .value_to_css_string(lightningcss::printer::PrinterOptions::default())
                        .unwrap_or_default();
                    if !name.is_empty() && !value.is_empty() {
                        important_properties.insert(name, value);
                    }
                }

                if properties.is_empty() && important_properties.is_empty() {
                    return;
                }

                // Extract selectors from the SelectorList
                for selector in style_rule.selectors.0.iter() {
                    let sel_text = selector
                        .to_css_string(lightningcss::printer::PrinterOptions::default())
                        .unwrap_or_default();

                    // Skip vendor-prefixed pseudo-classes/elements that only
                    // apply in specific browsers (:-moz-*, :-webkit-*)
                    if sel_text.contains(":-moz-") || sel_text.contains(":-webkit-") {
                        continue;
                    }

                    // Check if this is a :root rule (for CSS variables)
                    if sel_text == ":root" {
                        is_root_rule = true;
                    }

                    let spec = selector.specificity();
                    let order = self.next_order;
                    self.next_order += 1;

                    // Extract pseudo-class conditions from the selector text
                    let pseudo_conditions = extract_pseudo_conditions(&sel_text);

                    // Detect pseudo-element (::before, ::after, ::placeholder)
                    let pseudo_element = extract_pseudo_element(&sel_text);

                    self.rules.push(ParsedRule {
                        selector: sel_text,
                        specificity: (
                            ((spec >> 20) & 0xFF),
                            ((spec >> 10) & 0x3FF),
                            (spec & 0x3FF),
                        ),
                        properties: properties.clone(),
                        media_condition: media.map(|s| s.to_string()),
                        source_order: order,
                        pseudo_conditions,
                        important_properties: important_properties.clone(),
                        pseudo_element,
                    });
                }

                // If :root rule, extract custom properties as variables
                if is_root_rule {
                    for (name, value) in &properties {
                        if name.starts_with("--") {
                            self.variables.insert(name.clone(), value.clone());
                        }
                    }
                }
            }
            CssRule::Media(media_rule) => {
                let condition = media_rule
                    .query
                    .to_css_string(lightningcss::printer::PrinterOptions::default())
                    .unwrap_or_default();
                for inner in &media_rule.rules.0 {
                    self.process_rule(inner, Some(&condition));
                }
            }
            CssRule::LayerBlock(layer) => {
                for inner in &layer.rules.0 {
                    self.process_rule(inner, media);
                }
            }
            CssRule::Supports(supports) => {
                // Assume all @supports conditions pass for now
                for inner in &supports.rules.0 {
                    self.process_rule(inner, media);
                }
            }
            CssRule::Property(prop_rule) => {
                // @property --name { initial-value: X }
                // Seed CSS variables from @property initial values (Tailwind v4 uses these)
                if let Some(ref initial) = prop_rule.initial_value {
                    let name = format!("--{}", prop_rule.name.0);
                    let val = initial
                        .to_css_string(lightningcss::printer::PrinterOptions::default())
                        .unwrap_or_default();
                    if !val.is_empty() {
                        // Only insert if not already set by a :root rule (explicit > initial)
                        self.variables.entry(name).or_insert(val);
                    }
                }
            }
            _ => {} // Skip @keyframes, @font-face, etc.
        }
    }

    /// Check if a node satisfies the pseudo-class conditions of a rule.
    fn matches_pseudo_conditions(
        &self,
        node_id: rvst_core::NodeId,
        conditions: &[PseudoCondition],
    ) -> bool {
        for cond in conditions {
            match cond {
                PseudoCondition::Hover => {
                    if self.hovered_node != Some(node_id) {
                        return false;
                    }
                }
                PseudoCondition::Focus => {
                    if self.focused_node != Some(node_id) {
                        return false;
                    }
                }
                PseudoCondition::Active => return false, // Not tracked yet
            }
        }
        true
    }

    /// Match all rules against a node and return merged properties.
    /// Properties are merged in cascade order (specificity, then source order).
    pub fn match_node(
        &self,
        tree: &rvst_tree::Tree,
        node_id: rvst_core::NodeId,
    ) -> HashMap<String, String> {
        let node = match tree.nodes.get(&node_id) {
            Some(n) => n,
            None => return HashMap::new(),
        };

        // Extract node identity for matching
        let tag = node_type_to_tag(&node.node_type);
        let classes = extract_classes(node);
        let id = node.styles.get("id").map(|s| s.as_str());

        // Collect matching rules
        let mut matches: Vec<&ParsedRule> = Vec::new();
        for rule in &self.rules {
            // Skip pseudo-element rules — they don't apply to real nodes
            if rule.pseudo_element.is_some() {
                continue;
            }
            // Skip rules whose @media condition doesn't match viewport
            if let Some(ref media) = rule.media_condition {
                if !self.evaluate_media(media) {
                    continue;
                }
            }
            // Skip rules with unsatisfied pseudo-class conditions
            if !rule.pseudo_conditions.is_empty()
                && !self.matches_pseudo_conditions(node_id, &rule.pseudo_conditions)
            {
                continue;
            }
            if let Some(chain) = parse_selector(&rule.selector) {
                if selector_chain_matches(&chain, tree, node_id, &tag, &classes, id) {
                    matches.push(rule);
                }
            }
        }

        // Sort by specificity then source order (cascade)
        matches.sort_by(|a, b| {
            a.specificity
                .cmp(&b.specificity)
                .then(a.source_order.cmp(&b.source_order))
        });

        // Merge: later/higher specificity wins for normal properties
        let mut result = HashMap::new();
        for rule in &matches {
            for (prop, val) in &rule.properties {
                result.insert(prop.clone(), val.clone());
            }
        }
        // !important properties override everything (applied last, always win)
        for rule in &matches {
            for (prop, val) in &rule.important_properties {
                result.insert(prop.clone(), val.clone());
            }
        }

        result
    }

    /// Extract the transition spec for a given node from its matched CSS rules
    /// and inline styles. Returns a merged TransitionSpec covering all
    /// transition-property entries, or None if no transition is defined.
    pub fn transition_spec_for_node(
        &self,
        tree: &rvst_tree::Tree,
        node_id: rvst_core::NodeId,
    ) -> Option<crate::transition::TransitionSpec> {
        let node = tree.nodes.get(&node_id)?;

        // Helper: try to build a spec from a property map (inline styles or matched CSS).
        let try_build_spec = |props: &std::collections::HashMap<String, String>|
            -> Option<crate::transition::TransitionSpec>
        {
            // Check shorthand first
            if let Some(val) = props.get("transition") {
                let specs = crate::transition::parse_transition_shorthand(val);
                if !specs.is_empty() {
                    return Some(merge_transition_specs(&specs));
                }
            }
            // Check longhand properties (lightningcss may decompose the shorthand)
            let prop = props.get("transition-property");
            let dur = props.get("transition-duration");
            if let (Some(prop_val), Some(dur_val)) = (prop, dur) {
                let properties: Vec<String> = prop_val
                    .split(',')
                    .map(|s| s.trim().to_string())
                    .filter(|s| !s.is_empty() && s != "none")
                    .collect();
                if properties.is_empty() {
                    return None;
                }
                let duration_ms = crate::transition::parse_duration_ms(dur_val);
                let timing = props
                    .get("transition-timing-function")
                    .map(|s| crate::transition::TimingFunction::parse(s))
                    .unwrap_or(crate::transition::TimingFunction::Ease);
                let delay_ms = props
                    .get("transition-delay")
                    .map(|s| crate::transition::parse_duration_ms(s))
                    .unwrap_or(0.0);
                return Some(crate::transition::TransitionSpec {
                    properties,
                    duration_ms,
                    timing,
                    delay_ms,
                });
            }
            None
        };

        // Check inline styles first (JS-set transition)
        let inline_spec = try_build_spec(&node.styles);
        if inline_spec.is_some() {
            return inline_spec;
        }

        // Check CSS-matched properties
        let matched = self.match_node(tree, node_id);
        try_build_spec(&matched)
    }

    /// Apply all rules to every node in the tree.
    /// Returns a map of NodeId → (property → value) for all nodes with matches.
    /// Resolves var() references using inherited custom properties (ancestor walk).
    pub fn apply_to_tree(
        &self,
        tree: &rvst_tree::Tree,
    ) -> HashMap<rvst_core::NodeId, HashMap<String, String>> {
        // Phase 1: Collect custom properties (--*) per node from CSS matches AND inline styles
        let mut custom_props: HashMap<rvst_core::NodeId, HashMap<String, String>> = HashMap::new();
        for (&node_id, node) in &tree.nodes {
            let mut node_vars: HashMap<String, String> = HashMap::new();
            // From CSS rule matches
            let props = self.match_node(tree, node_id);
            for (k, v) in &props {
                if k.starts_with("--") {
                    node_vars.insert(k.clone(), v.clone());
                }
            }
            // From inline styles on the node
            for (k, v) in &node.styles {
                if k.starts_with("--") {
                    node_vars.insert(k.clone(), v.clone());
                }
            }
            if !node_vars.is_empty() {
                custom_props.insert(node_id, node_vars);
            }
        }

        // Phase 2: For each node, resolve var() using ancestor-inherited custom properties
        let mut result = HashMap::new();
        for &node_id in tree.nodes.keys() {
            let props = self.match_node(tree, node_id);
            if !props.is_empty() {
                let resolved: HashMap<String, String> = props
                    .into_iter()
                    .filter(|(k, _)| !k.starts_with("--"))
                    .map(|(k, v)| {
                        let resolved_v =
                            self.resolve_var_inherited(&v, 0, tree, node_id, &custom_props);
                        (k, resolved_v)
                    })
                    .collect();
                if !resolved.is_empty() {
                    result.insert(node_id, resolved);
                }
            }
        }
        result
    }

    /// Resolve var() by walking ancestors to find custom property definitions.
    /// Falls back to :root variables (self.variables) if not found on any ancestor.
    fn resolve_var_inherited(
        &self,
        val: &str,
        depth: usize,
        tree: &rvst_tree::Tree,
        node_id: rvst_core::NodeId,
        custom_props: &HashMap<rvst_core::NodeId, HashMap<String, String>>,
    ) -> String {
        if depth > 8 || !val.contains("var(") {
            return val.to_string();
        }

        let mut out = String::new();
        let mut i = 0;
        let bytes = val.as_bytes();

        while i < bytes.len() {
            if val[i..].starts_with("var(") {
                let start = i + 4;
                let mut depth_p = 1;
                let mut k = start;
                while k < bytes.len() && depth_p > 0 {
                    if bytes[k] == b'(' {
                        depth_p += 1;
                    } else if bytes[k] == b')' {
                        depth_p -= 1;
                    }
                    k += 1;
                }
                let inner = &val[start..k - 1];
                let (var_name, fallback) = split_var_args(inner);
                let var_name = var_name.trim();

                // Walk ancestors to find --var-name
                let resolved = self.find_custom_property(var_name, tree, node_id, custom_props);

                if let Some(resolved_val) = resolved {
                    out.push_str(&self.resolve_var_inherited(
                        &resolved_val,
                        depth + 1,
                        tree,
                        node_id,
                        custom_props,
                    ));
                } else if let Some(fb) = fallback {
                    out.push_str(&self.resolve_var_inherited(
                        fb.trim(),
                        depth + 1,
                        tree,
                        node_id,
                        custom_props,
                    ));
                } else {
                    out.push_str(&val[i..k]);
                }
                i = k;
            } else {
                out.push(bytes[i] as char);
                i += 1;
            }
        }
        out
    }

    /// Evaluate a @media condition string against current viewport.
    /// Supports: min-width, max-width, min-height, max-height, prefers-color-scheme.
    fn evaluate_media(&self, condition: &str) -> bool {
        let cond = condition.trim();

        // Comma-separated queries are OR: any branch passing -> true.
        // lightningcss serializes `@media A, B` as `"A, B"`.
        let branches: Vec<&str> = cond.split(',').collect();
        if branches.len() > 1 {
            return branches.iter().any(|b| self.evaluate_media(b));
        }

        // Handle `not` prefix: `not (min-width: 768px)`
        if let Some(rest) = cond.strip_prefix("not ") {
            return !self.evaluate_media(rest);
        }

        // Handle "and" combinator: (min-width: 768px) and (max-width: 1024px)
        // Also handles `screen and (...)` -- the bare media type `screen` / `all`
        // always passes.
        for part in cond.split(" and ") {
            let part = part
                .trim()
                .trim_start_matches('(')
                .trim_end_matches(')')
                .trim();
            if part.is_empty() {
                continue;
            }
            // Bare media types: `screen`, `all`, `print`, etc.
            match part {
                "screen" | "all" => continue,
                "print" => return false, // RVST is never print
                _ => {}
            }

            // lightningcss v1 serializes media features in range syntax:
            //   min-width: 768px  -> "width >= 768px"
            //   max-width: 1024px -> "width <= 1024px"
            // Also try the legacy colon syntax as fallback.
            if let Some(result) = self.evaluate_range_condition(part) {
                if !result {
                    return false;
                }
                continue;
            }

            // Legacy colon syntax: `min-width: 768px`
            let (prop, val) = match part.split_once(':') {
                Some((p, v)) => (p.trim(), v.trim()),
                None => continue, // skip unparseable
            };
            let px = parse_dimension(val);
            let passes = match prop {
                "min-width" => self.viewport_width >= px,
                "max-width" => self.viewport_width <= px,
                "min-height" => self.viewport_height >= px,
                "max-height" => self.viewport_height <= px,
                "prefers-color-scheme" => val == "dark", // RVST is always dark theme
                _ => true, // unknown conditions pass (permissive)
            };
            if !passes {
                return false;
            }
        }
        true
    }

    /// Evaluate a range-syntax media condition like `width >= 768px` or `height <= 500px`.
    /// Returns `Some(bool)` if the condition was recognized, `None` otherwise.
    fn evaluate_range_condition(&self, part: &str) -> Option<bool> {
        // Try each operator in order (longest first to avoid partial match)
        for op in &[">=", "<=", ">", "<"] {
            if let Some((prop, val)) = part.split_once(op) {
                let prop = prop.trim();
                let val = val.trim();
                let px = parse_dimension(val);
                let actual = match prop {
                    "width" => self.viewport_width,
                    "height" => self.viewport_height,
                    _ => return None,
                };
                return Some(match *op {
                    ">=" => actual >= px,
                    "<=" => actual <= px,
                    ">" => actual > px,
                    "<" => actual < px,
                    _ => unreachable!(),
                });
            }
        }
        None
    }

    /// Find a custom property by walking up the ancestor chain.
    /// Checks: node itself → parent → grandparent → ... → :root variables.
    fn find_custom_property(
        &self,
        name: &str,
        tree: &rvst_tree::Tree,
        start_node: rvst_core::NodeId,
        custom_props: &HashMap<rvst_core::NodeId, HashMap<String, String>>,
    ) -> Option<String> {
        // Check the node itself and ancestors
        let mut cursor = Some(start_node);
        while let Some(nid) = cursor {
            if let Some(vars) = custom_props.get(&nid) {
                if let Some(val) = vars.get(name) {
                    return Some(val.clone());
                }
            }
            // Also check inline styles directly
            if let Some(node) = tree.nodes.get(&nid) {
                if let Some(val) = node.styles.get(name) {
                    return Some(val.clone());
                }
                cursor = node.parent;
            } else {
                break;
            }
        }
        // Fallback: :root variables
        self.variables.get(name).cloned()
    }

    /// Look up the `content` property for a node's ::before or ::after pseudo-element.
    ///
    /// `which` must be `"before"` or `"after"`. Returns the raw CSS `content` value
    /// (e.g. `""`, `"» "`, `attr(data-label)`) if a matching pseudo-element rule
    /// exists for this node, or `None` otherwise.
    pub fn pseudo_element_content(
        &self,
        tree: &rvst_tree::Tree,
        node_id: rvst_core::NodeId,
        which: &str,
    ) -> Option<String> {
        let node = tree.nodes.get(&node_id)?;
        let tag = node_type_to_tag(&node.node_type);
        let classes = extract_classes(node);
        let id = node.styles.get("id").map(|s| s.as_str());

        // Walk pseudo-element rules, find those targeting `which` that match this node
        let mut best: Option<(&ParsedRule, (u32, u32, u32), usize)> = None;

        for rule in &self.rules {
            let pe = match &rule.pseudo_element {
                Some(pe) if pe == which => pe,
                _ => continue,
            };
            let _ = pe; // used for the match guard above

            // Skip if @media doesn't match
            if let Some(ref media) = rule.media_condition {
                if !self.evaluate_media(media) {
                    continue;
                }
            }

            // The selector includes ::before/::after — strip it before matching
            let base_sel = rule
                .selector
                .replace(&format!("::{which}"), "")
                .trim()
                .to_string();
            let base_sel = if base_sel.is_empty() {
                "*".to_string()
            } else {
                base_sel
            };

            if let Some(chain) = parse_selector(&base_sel) {
                if selector_chain_matches(&chain, tree, node_id, &tag, &classes, id) {
                    let dominated = match &best {
                        Some((_, spec, order)) => {
                            rule.specificity > *spec
                                || (rule.specificity == *spec && rule.source_order > *order)
                        }
                        None => true,
                    };
                    if dominated {
                        best = Some((rule, rule.specificity, rule.source_order));
                    }
                }
            }
        }

        let (rule, _, _) = best?;
        // Check both normal and !important properties for `content`
        rule.important_properties
            .get("content")
            .or_else(|| rule.properties.get("content"))
            .cloned()
    }
}

// ---------------------------------------------------------------------------
// Node helpers
// ---------------------------------------------------------------------------

/// Map NodeType to a CSS tag name.
/// Split var() inner content into (name, optional_fallback).
/// Handles nested parens in fallback: var(--x, calc(1px + 2px))
fn split_var_args(inner: &str) -> (&str, Option<&str>) {
    let mut depth = 0;
    for (i, b) in inner.bytes().enumerate() {
        match b {
            b'(' => depth += 1,
            b')' => depth -= 1,
            b',' if depth == 0 => {
                return (&inner[..i], Some(&inner[i + 1..]));
            }
            _ => {}
        }
    }
    (inner, None)
}

/// Parse a CSS dimension value like `768px`, `48rem`, or bare number into f32 pixels.
/// Supports `px` (identity) and `rem` (multiplied by 16).
fn parse_dimension(val: &str) -> f32 {
    let val = val.trim();
    if val.ends_with("rem") {
        val.trim_end_matches("rem")
            .trim()
            .parse::<f32>()
            .unwrap_or(0.0)
            * 16.0
    } else {
        val.trim_end_matches("px")
            .trim()
            .parse::<f32>()
            .unwrap_or(0.0)
    }
}

fn node_type_to_tag(nt: &rvst_core::NodeType) -> String {
    match nt {
        rvst_core::NodeType::View => "div".to_string(),
        rvst_core::NodeType::Text => "span".to_string(),
        rvst_core::NodeType::Button => "button".to_string(),
        rvst_core::NodeType::Input => "input".to_string(),
        rvst_core::NodeType::Textarea => "textarea".to_string(),
        rvst_core::NodeType::Scroll => "div".to_string(),
        rvst_core::NodeType::Form => "form".to_string(),
    }
}

/// Extract CSS classes from a node's styles map.
fn extract_classes(node: &rvst_tree::Node) -> Vec<String> {
    node.styles
        .get("class")
        .map(|c| c.split_whitespace().map(|s| s.to_string()).collect())
        .unwrap_or_default()
}

// ---------------------------------------------------------------------------
// Selector parsing (from normalized lightningcss text)
// ---------------------------------------------------------------------------

/// Parse a normalized selector string into a SelectorChain.
/// Handles: tag, .class, #id, combinators (>, space, +, ~),
/// :where(), :is(), :global(), :not() (basic).
pub fn parse_selector(selector: &str) -> Option<SelectorChain> {
    let sel = selector.trim();
    if sel.is_empty() {
        return None;
    }

    // Strip :where() and :is() wrappers — they don't affect specificity
    // but the inner selector still needs to match.
    let sel = unwrap_pseudo_function(sel, ":where(");
    let sel = unwrap_pseudo_function(&sel, ":is(");
    let sel = unwrap_pseudo_function(&sel, ":global(");

    // Split into tokens by combinators
    let tokens = tokenize_selector(&sel)?;
    if tokens.is_empty() {
        return None;
    }

    // Build chain right-to-left: last token is subject, rest are ancestors.
    // The combinator stored on each token is the one BEFORE it (i.e., between
    // it and the previous token). So when walking right-to-left, the combinator
    // linking the subject to its nearest ancestor is stored on the subject token.
    let len = tokens.len();
    let (subject, _subject_comb) = tokens[len - 1].clone();
    let mut ancestors = Vec::new();
    // Walk from second-to-last down to first
    for i in (0..len - 1).rev() {
        // The combinator between tokens[i] and tokens[i+1] is stored on tokens[i+1]
        let comb = tokens[i + 1].1.unwrap_or(Combinator::Descendant);
        ancestors.push((comb, tokens[i].0.clone()));
    }

    Some(SelectorChain { subject, ancestors })
}

/// Unwrap a pseudo-function wrapper like `:where(...)`.
fn unwrap_pseudo_function(sel: &str, prefix: &str) -> String {
    if sel.starts_with(prefix) && sel.ends_with(')') {
        sel[prefix.len()..sel.len() - 1].to_string()
    } else {
        sel.to_string()
    }
}

/// Tokenize a selector string into (SimpleSelector, Option<Combinator>) pairs.
/// The combinator is the one BEFORE this selector piece (None for the first).
fn tokenize_selector(sel: &str) -> Option<Vec<(SimpleSelector, Option<Combinator>)>> {
    let mut result = Vec::new();
    let mut current = String::new();
    let mut last_combinator: Option<Combinator> = None;
    let chars: Vec<char> = sel.chars().collect();
    let len = chars.len();
    let mut i = 0;

    while i < len {
        let ch = chars[i];
        match ch {
            ' ' | '>' | '+' | '~' => {
                // Flush current if non-empty
                if !current.trim().is_empty() {
                    let simple = parse_simple_selector(current.trim());
                    result.push((simple, last_combinator.take()));
                    current.clear();
                }

                // Determine combinator
                // Skip whitespace, look for explicit combinator
                let mut found_combinator = if ch != ' ' {
                    Some(match ch {
                        '>' => Combinator::Child,
                        '+' => Combinator::Adjacent,
                        '~' => Combinator::Sibling,
                        _ => unreachable!(),
                    })
                } else {
                    None
                };

                i += 1;
                while i < len && chars[i] == ' ' {
                    i += 1;
                }

                // If we just had spaces and now see a combinator, use that
                if found_combinator.is_none() && i < len {
                    match chars[i] {
                        '>' => {
                            found_combinator = Some(Combinator::Child);
                            i += 1;
                            while i < len && chars[i] == ' ' {
                                i += 1;
                            }
                        }
                        '+' => {
                            found_combinator = Some(Combinator::Adjacent);
                            i += 1;
                            while i < len && chars[i] == ' ' {
                                i += 1;
                            }
                        }
                        '~' => {
                            found_combinator = Some(Combinator::Sibling);
                            i += 1;
                            while i < len && chars[i] == ' ' {
                                i += 1;
                            }
                        }
                        _ => {
                            // Just whitespace = descendant combinator
                            found_combinator = Some(Combinator::Descendant);
                        }
                    }
                }

                last_combinator = found_combinator;
                continue;
            }
            _ => {
                current.push(ch);
            }
        }
        i += 1;
    }

    // Flush last token
    if !current.trim().is_empty() {
        let simple = parse_simple_selector(current.trim());
        result.push((simple, last_combinator));
    }

    if result.is_empty() {
        None
    } else {
        Some(result)
    }
}

/// Unescape CSS backslash sequences: `\[` → `[`, `\/` → `/`, `\:` → `:`, etc.
/// Tailwind uses escaped brackets in class names like `.h-\[80vh\]`.
fn css_unescape(s: &str) -> String {
    let mut out = String::with_capacity(s.len());
    let mut chars = s.chars();
    while let Some(ch) = chars.next() {
        if ch == '\\' {
            if let Some(next) = chars.next() {
                out.push(next);
            }
        } else {
            out.push(ch);
        }
    }
    out
}

/// Parse a compound selector like `div.foo#bar[disabled]:not(.active)` into a SimpleSelector.
fn parse_simple_selector(s: &str) -> SimpleSelector {
    let mut tag = None;
    let mut classes = Vec::new();
    let mut id = None;
    let is_global = false;
    let mut attributes = Vec::new();
    let mut not_selectors = Vec::new();
    let mut structural = Vec::new();

    // Extract :not() selectors before stripping pseudo-classes
    let s_owned = extract_not_selectors(s, &mut not_selectors);
    // Extract structural pseudo-classes before stripping
    extract_structural_pseudos(&s_owned, &mut structural);

    // Strip pseudo-classes we don't match (:hover, :focus, :active, etc.)
    let s_stripped = strip_pseudo_classes(&s_owned);

    let chars: Vec<char> = s_stripped.chars().collect();
    let len = chars.len();
    let mut i = 0;
    let mut current = String::new();
    let mut mode = 'T'; // T=tag, C=class, I=id

    while i < len {
        let ch = chars[i];
        match ch {
            // CSS escape: \X → literal X (Tailwind uses \[ \] \/ \: in class names)
            '\\' => {
                i += 1;
                if i < len {
                    current.push(chars[i]);
                    i += 1;
                }
            }
            '.' => {
                flush_part(&mut current, mode, &mut tag, &mut classes, &mut id);
                mode = 'C';
                i += 1;
            }
            '#' => {
                flush_part(&mut current, mode, &mut tag, &mut classes, &mut id);
                mode = 'I';
                i += 1;
            }
            '[' => {
                flush_part(&mut current, mode, &mut tag, &mut classes, &mut id);
                mode = 'T';
                // Parse attribute selector: [attr] or [attr="value"] or [attr=value]
                i += 1; // skip '['
                let mut attr_content = String::new();
                while i < len && chars[i] != ']' {
                    attr_content.push(chars[i]);
                    i += 1;
                }
                if i < len {
                    i += 1;
                } // skip ']'
                if let Some(eq_pos) = attr_content.find('=') {
                    let name = attr_content[..eq_pos].trim().to_string();
                    let val = attr_content[eq_pos + 1..]
                        .trim()
                        .trim_matches('"')
                        .trim_matches('\'')
                        .to_string();
                    attributes.push(AttrCondition {
                        name,
                        value: Some(val),
                    });
                } else {
                    let name = attr_content.trim().to_string();
                    if !name.is_empty() {
                        attributes.push(AttrCondition { name, value: None });
                    }
                }
            }
            ':' => {
                flush_part(&mut current, mode, &mut tag, &mut classes, &mut id);
                // Check for :where() / :is() with attribute conditions
                let rest: String = chars[i..].iter().collect();
                if let Some(inner) = rest.strip_prefix(":where(").or_else(|| rest.strip_prefix(":is(")) {
                    // Extract content inside the parens
                    if let Some(close) = inner.find(')') {
                        let condition = &inner[..close];
                        // If it's an attribute selector like [type=button], add as condition
                        if condition.starts_with('[') && condition.ends_with(']') {
                            let attr_inner = &condition[1..condition.len()-1];
                            if let Some(eq_pos) = attr_inner.find('=') {
                                let name = attr_inner[..eq_pos].trim().to_string();
                                let val = attr_inner[eq_pos+1..].trim().trim_matches('"').trim_matches('\'').to_string();
                                attributes.push(AttrCondition { name, value: Some(val) });
                            } else {
                                let name = attr_inner.trim().to_string();
                                if !name.is_empty() {
                                    attributes.push(AttrCondition { name, value: None });
                                }
                            }
                        }
                        // Skip past the :where(...) or :is(...)
                        i += 7 + close + 1; // 7 = ":where(" length, +1 for ')'
                        continue;
                    }
                }
                // For other pseudo-classes, skip remainder
                break;
            }
            _ => {
                current.push(ch);
                i += 1;
            }
        }
    }
    flush_part(&mut current, mode, &mut tag, &mut classes, &mut id);

    // Treat `*` as no tag constraint
    if tag.as_deref() == Some("*") {
        tag = None;
    }

    SimpleSelector {
        tag,
        classes,
        id,
        is_global,
        attributes,
        not_selectors,
        structural,
    }
}

/// Extract `:not(...)` from a selector string, parse each inner selector,
/// and return the selector string with `:not(...)` removed.
fn extract_not_selectors(s: &str, not_sels: &mut Vec<SimpleSelector>) -> String {
    let mut result = s.to_string();
    while let Some(pos) = result.find(":not(") {
        let inner_start = pos + 5; // after ":not("
                                   // Find matching closing paren
        let mut depth = 1;
        let mut end = inner_start;
        for ch in result[inner_start..].chars() {
            match ch {
                '(' => depth += 1,
                ')' => {
                    depth -= 1;
                    if depth == 0 {
                        break;
                    }
                }
                _ => {}
            }
            end += ch.len_utf8();
        }
        let inner = &result[inner_start..end];
        let parsed = parse_not_inner(inner);
        not_sels.push(parsed);
        // Remove the :not(...) from the string
        let remove_end = (end + 1).min(result.len()); // +1 for ')'
        result = format!("{}{}", &result[..pos], &result[remove_end..]);
    }
    result
}

/// Parse the content inside :not() — supports simple tag, .class, #id selectors.
fn parse_not_inner(s: &str) -> SimpleSelector {
    let s = s.trim();
    let mut tag = None;
    let mut classes = Vec::new();
    let mut id = None;
    let mut attributes = Vec::new();
    let mut current = String::new();
    let mut mode = 'T';

    let chars: Vec<char> = s.chars().collect();
    let len = chars.len();
    let mut i = 0;
    while i < len {
        let ch = chars[i];
        match ch {
            '.' => {
                flush_part(&mut current, mode, &mut tag, &mut classes, &mut id);
                mode = 'C';
                i += 1;
            }
            '#' => {
                flush_part(&mut current, mode, &mut tag, &mut classes, &mut id);
                mode = 'I';
                i += 1;
            }
            '[' => {
                flush_part(&mut current, mode, &mut tag, &mut classes, &mut id);
                mode = 'T';
                i += 1;
                let mut attr_content = String::new();
                while i < len && chars[i] != ']' {
                    attr_content.push(chars[i]);
                    i += 1;
                }
                if i < len {
                    i += 1;
                }
                if let Some(eq_pos) = attr_content.find('=') {
                    let name = attr_content[..eq_pos].trim().to_string();
                    let val = attr_content[eq_pos + 1..]
                        .trim()
                        .trim_matches('"')
                        .trim_matches('\'')
                        .to_string();
                    attributes.push(AttrCondition {
                        name,
                        value: Some(val),
                    });
                } else {
                    let name = attr_content.trim().to_string();
                    if !name.is_empty() {
                        attributes.push(AttrCondition { name, value: None });
                    }
                }
            }
            _ => {
                current.push(ch);
                i += 1;
            }
        }
    }
    flush_part(&mut current, mode, &mut tag, &mut classes, &mut id);
    if tag.as_deref() == Some("*") {
        tag = None;
    }
    SimpleSelector {
        tag,
        classes,
        id,
        is_global: false,
        attributes,
        not_selectors: Vec::new(),
        structural: Vec::new(),
    }
}

/// Extract structural pseudo-classes (:first-child, :last-child, :nth-child(n)) from selector text.
fn extract_structural_pseudos(s: &str, structural: &mut Vec<StructuralPseudo>) {
    if s.contains(":first-child") {
        structural.push(StructuralPseudo::FirstChild);
    }
    if s.contains(":last-child") {
        structural.push(StructuralPseudo::LastChild);
    }
    // :nth-child(N)
    let mut search = s;
    while let Some(pos) = search.find(":nth-child(") {
        let start = pos + 11; // after ":nth-child("
        let rest = &search[start..];
        if let Some(end) = rest.find(')') {
            let n_str = rest[..end].trim();
            if let Ok(n) = n_str.parse::<usize>() {
                structural.push(StructuralPseudo::NthChild(n));
            }
            search = &search[start + end + 1..];
        } else {
            break;
        }
    }
}

fn flush_part(
    current: &mut String,
    mode: char,
    tag: &mut Option<String>,
    classes: &mut Vec<String>,
    id: &mut Option<String>,
) {
    if current.is_empty() {
        return;
    }
    match mode {
        'T' => *tag = Some(css_unescape(current)),
        'C' => classes.push(css_unescape(current)),
        'I' => *id = Some(css_unescape(current)),
        _ => {}
    }
    current.clear();
}

/// Extract pseudo-element name from a selector string.
/// Any `::name` is detected — not just before/after/placeholder.
/// This prevents vendor pseudo-elements (`::-webkit-scrollbar-thumb`, etc.)
/// from leaking styles onto real elements.
fn extract_pseudo_element(sel: &str) -> Option<String> {
    if let Some(idx) = sel.find("::") {
        let after = &sel[idx + 2..];
        // Extract the pseudo-element name (alphanumeric + hyphens)
        let name: String = after
            .chars()
            .take_while(|c| c.is_alphanumeric() || *c == '-')
            .collect();
        if !name.is_empty() {
            return Some(name);
        }
    }
    None
}

/// Extract pseudo-class conditions from a selector string.
fn extract_pseudo_conditions(sel: &str) -> Vec<PseudoCondition> {
    let mut conditions = Vec::new();
    if sel.contains(":hover") {
        conditions.push(PseudoCondition::Hover);
    }
    if sel.contains(":focus") && !sel.contains(":focus-visible") && !sel.contains(":focus-within") {
        conditions.push(PseudoCondition::Focus);
    }
    if sel.contains(":active") {
        conditions.push(PseudoCondition::Active);
    }
    conditions
}

/// Strip pseudo-classes that we don't match against.
fn strip_pseudo_classes(s: &str) -> String {
    let pseudo_classes = [
        ":hover",
        ":focus",
        ":active",
        ":visited",
        ":link",
        ":focus-visible",
        ":focus-within",
        ":first-child",
        ":last-child",
        ":nth-child",
        ":disabled",
        ":enabled",
        ":checked",
        ":read-only",
        ":read-write",
        ":placeholder-shown",
        ":required",
        ":optional",
        ":valid",
        ":invalid",
        ":default",
        ":indeterminate",
        ":empty",
        ":root",
        ":any-link",
        ":target",
    ];
    let mut result = s.to_string();
    for pc in &pseudo_classes {
        if let Some(pos) = result.find(pc) {
            // Remove from the pseudo-class to the end (or next selector part)
            let rest = &result[pos + pc.len()..];
            let end = rest
                .find(['.', '#', ' ', '>'])
                .map(|p| pos + pc.len() + p)
                .unwrap_or(result.len());
            // Handle parenthesized args like :nth-child(2)
            let end = if rest.starts_with('(') {
                rest.find(')')
                    .map(|p| pos + pc.len() + p + 1)
                    .unwrap_or(end)
            } else {
                end
            };
            result = format!("{}{}", &result[..pos], &result[end..]);
        }
    }
    result
}

// ---------------------------------------------------------------------------
// Selector matching
// ---------------------------------------------------------------------------

/// Check if a SelectorChain matches a node.
fn selector_chain_matches(
    chain: &SelectorChain,
    tree: &rvst_tree::Tree,
    node_id: rvst_core::NodeId,
    tag: &str,
    classes: &[String],
    id: Option<&str>,
) -> bool {
    // Subject must match (with attributes and :not())
    let node_attrs = tree.nodes.get(&node_id).map(|n| &n.styles);
    if !simple_matches_with_attrs(&chain.subject, tag, classes, id, node_attrs) {
        return false;
    }

    // Check structural pseudo-classes on the subject
    if !check_structural_pseudos(&chain.subject.structural, tree, node_id) {
        return false;
    }

    // Walk ancestor chain
    let mut current_id = node_id;
    for (combinator, ancestor_sel) in &chain.ancestors {
        match combinator {
            Combinator::Child => {
                // Must match direct parent
                let parent_id = match tree.nodes.get(&current_id).and_then(|n| n.parent) {
                    Some(p) => p,
                    None => return false,
                };
                let parent = match tree.nodes.get(&parent_id) {
                    Some(n) => n,
                    None => return false,
                };
                let p_tag = node_type_to_tag(&parent.node_type);
                let p_classes = extract_classes(parent);
                let p_id = parent.styles.get("id").map(|s| s.as_str());
                if !simple_matches_with_attrs(
                    ancestor_sel,
                    &p_tag,
                    &p_classes,
                    p_id,
                    Some(&parent.styles),
                ) {
                    return false;
                }
                current_id = parent_id;
            }
            Combinator::Descendant => {
                // Must match some ancestor
                let mut walk = tree.nodes.get(&current_id).and_then(|n| n.parent);
                let mut found = false;
                while let Some(ancestor_id) = walk {
                    let ancestor = match tree.nodes.get(&ancestor_id) {
                        Some(n) => n,
                        None => break,
                    };
                    let a_tag = node_type_to_tag(&ancestor.node_type);
                    let a_classes = extract_classes(ancestor);
                    let a_id = ancestor.styles.get("id").map(|s| s.as_str());
                    if simple_matches_with_attrs(
                        ancestor_sel,
                        &a_tag,
                        &a_classes,
                        a_id,
                        Some(&ancestor.styles),
                    ) {
                        current_id = ancestor_id;
                        found = true;
                        break;
                    }
                    walk = ancestor.parent;
                }
                if !found {
                    return false;
                }
            }
            Combinator::Adjacent | Combinator::Sibling => {
                // Adjacent (+) / Sibling (~): check siblings
                let parent_id = match tree.nodes.get(&current_id).and_then(|n| n.parent) {
                    Some(p) => p,
                    None => return false,
                };
                let siblings = match tree.nodes.get(&parent_id) {
                    Some(p) => &p.children,
                    None => &tree.root_children,
                };
                let my_pos = match siblings.iter().position(|&c| c == current_id) {
                    Some(p) => p,
                    None => return false,
                };

                match combinator {
                    Combinator::Adjacent => {
                        // Immediately preceding sibling
                        if my_pos == 0 {
                            return false;
                        }
                        let sib_id = siblings[my_pos - 1];
                        let sib = match tree.nodes.get(&sib_id) {
                            Some(n) => n,
                            None => return false,
                        };
                        let s_tag = node_type_to_tag(&sib.node_type);
                        let s_classes = extract_classes(sib);
                        let s_id = sib.styles.get("id").map(|s| s.as_str());
                        if !simple_matches_with_attrs(
                            ancestor_sel,
                            &s_tag,
                            &s_classes,
                            s_id,
                            Some(&sib.styles),
                        ) {
                            return false;
                        }
                        current_id = sib_id;
                    }
                    Combinator::Sibling => {
                        // Any preceding sibling
                        let mut found = false;
                        for &sib_id in &siblings[..my_pos] {
                            let sib = match tree.nodes.get(&sib_id) {
                                Some(n) => n,
                                None => continue,
                            };
                            let s_tag = node_type_to_tag(&sib.node_type);
                            let s_classes = extract_classes(sib);
                            let s_id = sib.styles.get("id").map(|s| s.as_str());
                            if simple_matches_with_attrs(
                                ancestor_sel,
                                &s_tag,
                                &s_classes,
                                s_id,
                                Some(&sib.styles),
                            ) {
                                current_id = sib_id;
                                found = true;
                                break;
                            }
                        }
                        if !found {
                            return false;
                        }
                    }
                    _ => unreachable!(),
                }
            }
        }
    }

    true
}

/// Check structural pseudo-classes against a node's position in its parent's children.
fn check_structural_pseudos(
    pseudos: &[StructuralPseudo],
    tree: &rvst_tree::Tree,
    node_id: rvst_core::NodeId,
) -> bool {
    if pseudos.is_empty() {
        return true;
    }

    // Find this node's position among its parent's children
    let siblings = if let Some(node) = tree.nodes.get(&node_id) {
        if let Some(parent_id) = node.parent {
            tree.nodes.get(&parent_id).map(|p| &p.children[..])
        } else {
            // Root-level node
            Some(tree.root_children.as_slice())
        }
    } else {
        return false;
    };

    let siblings = match siblings {
        Some(s) => s,
        None => return false,
    };

    let my_pos = match siblings.iter().position(|&c| c == node_id) {
        Some(p) => p,
        None => return false,
    };

    for pseudo in pseudos {
        match pseudo {
            StructuralPseudo::FirstChild => {
                if my_pos != 0 {
                    return false;
                }
            }
            StructuralPseudo::LastChild => {
                if my_pos != siblings.len() - 1 {
                    return false;
                }
            }
            StructuralPseudo::NthChild(n) => {
                // CSS :nth-child is 1-based
                if my_pos + 1 != *n {
                    return false;
                }
            }
        }
    }
    true
}

/// Check if a SimpleSelector matches a node's tag, classes, id, and attributes.
/// `attrs` is the node's full styles map (attributes are stored via SetAttr into styles).
/// Convenience wrapper without attribute map — used in tests and simple cases.
#[allow(dead_code)]
fn simple_matches(sel: &SimpleSelector, tag: &str, classes: &[String], id: Option<&str>) -> bool {
    simple_matches_with_attrs(sel, tag, classes, id, None)
}

/// Extended matching that also checks attribute conditions and :not() selectors.
fn simple_matches_with_attrs(
    sel: &SimpleSelector,
    tag: &str,
    classes: &[String],
    id: Option<&str>,
    attrs: Option<&std::collections::HashMap<String, String>>,
) -> bool {
    // Tag must match (if specified)
    if let Some(ref sel_tag) = sel.tag {
        if sel_tag != tag {
            return false;
        }
    }

    // All selector classes must be present on the node
    for cls in &sel.classes {
        if !classes.iter().any(|c| c == cls) {
            return false;
        }
    }

    // ID must match (if specified)
    if let Some(ref sel_id) = sel.id {
        match id {
            Some(node_id) if node_id == sel_id => {}
            _ => return false,
        }
    }

    // Attribute conditions
    if let Some(attrs_map) = attrs {
        for attr_cond in &sel.attributes {
            match &attr_cond.value {
                None => {
                    // Existence check: [disabled]
                    if !attrs_map.contains_key(&attr_cond.name) {
                        return false;
                    }
                }
                Some(expected) => {
                    // Equality check: [type="text"]
                    match attrs_map.get(&attr_cond.name) {
                        Some(actual) if actual == expected => {}
                        _ => return false,
                    }
                }
            }
        }
    } else if !sel.attributes.is_empty() {
        // No attrs map provided but selector requires attributes — can't match
        return false;
    }

    // :not() selectors — each must NOT match
    for not_sel in &sel.not_selectors {
        if simple_matches_with_attrs(not_sel, tag, classes, id, attrs) {
            return false;
        }
    }

    true
}

// ---------------------------------------------------------------------------
// Transition spec merging
// ---------------------------------------------------------------------------

/// Merge multiple TransitionSpecs (from comma-separated `transition` shorthand)
/// into a single spec with all properties listed. Uses the last spec's timing
/// as a default, but individual property durations are preserved via the
/// properties list.
fn merge_transition_specs(specs: &[crate::transition::TransitionSpec]) -> crate::transition::TransitionSpec {
    if specs.len() == 1 {
        return specs[0].clone();
    }
    // For simplicity: merge all property names, use first spec's timing/duration
    // as default. The TransitionManager will look up per-property specs via
    // matches_property anyway.
    let mut all_props = Vec::new();
    for s in specs {
        all_props.extend(s.properties.iter().cloned());
    }
    // Use the first spec's timing as the default
    crate::transition::TransitionSpec {
        properties: all_props,
        duration_ms: specs[0].duration_ms,
        timing: specs[0].timing.clone(),
        delay_ms: specs[0].delay_ms,
    }
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn parses_basic_css() {
        let mut engine = CssEngine::new();
        engine.load_css(".btn { display: flex; padding: 8px; }");
        assert_eq!(engine.rules.len(), 1);
        assert!(engine.rules[0].properties.contains_key("display"));
    }

    #[test]
    fn parses_tailwind_layer() {
        let mut engine = CssEngine::new();
        engine.load_css("@layer utilities { .flex { display: flex; } .p-4 { padding: 1rem; } }");
        assert_eq!(engine.rules.len(), 2);
    }

    #[test]
    fn parses_nested_layer_blocks() {
        let mut engine = CssEngine::new();
        engine.load_css(
            "@layer base { :root { --spacing: 0.25rem; } } \
             @layer utilities { .mt-4 { margin-top: 1rem; } }",
        );
        // :root rule + .mt-4 rule
        assert_eq!(engine.rules.len(), 2);
        assert!(engine.variables.contains_key("--spacing"));
    }

    #[test]
    fn parses_supports_block() {
        let mut engine = CssEngine::new();
        engine.load_css("@supports (display: grid) { .grid { display: grid; } }");
        assert_eq!(engine.rules.len(), 1);
        assert_eq!(
            engine.rules[0].properties.get("display").map(|s| s.as_str()),
            Some("grid")
        );
    }

    #[test]
    fn parses_property_initial_value() {
        let mut engine = CssEngine::new();
        engine.load_css(
            "@property --tw-border-style { syntax: \"*\"; inherits: false; initial-value: solid; }",
        );
        assert_eq!(
            engine.variables.get("--tw-border-style").map(|s| s.as_str()),
            Some("solid")
        );
    }

    #[test]
    fn property_does_not_override_root() {
        let mut engine = CssEngine::new();
        // :root rule should take precedence over @property initial-value
        engine.load_css(
            "@property --tw-border-style { syntax: \"*\"; inherits: false; initial-value: solid; } \
             :root { --tw-border-style: dashed; }",
        );
        assert_eq!(
            engine.variables.get("--tw-border-style").map(|s| s.as_str()),
            Some("dashed")
        );
    }

    #[test]
    fn collects_css_variables() {
        let mut engine = CssEngine::new();
        engine.load_css(":root { --color-primary: #ff0000; }");
        assert!(engine.variables.contains_key("--color-primary"));
    }

    #[test]
    fn parses_media_queries() {
        let mut engine = CssEngine::new();
        engine.load_css("@media (min-width: 768px) { .container { max-width: 720px; } }");
        assert_eq!(engine.rules.len(), 1);
        assert!(engine.rules[0].media_condition.is_some());
    }

    #[test]
    fn selector_parsing_simple() {
        let chain = parse_selector(".foo").unwrap();
        assert_eq!(chain.subject.classes, vec!["foo"]);
        assert!(chain.subject.tag.is_none());
        assert!(chain.ancestors.is_empty());
    }

    #[test]
    fn selector_parsing_compound() {
        let chain = parse_selector("div.foo#bar").unwrap();
        assert_eq!(chain.subject.tag.as_deref(), Some("div"));
        assert_eq!(chain.subject.classes, vec!["foo"]);
        assert_eq!(chain.subject.id.as_deref(), Some("bar"));
    }

    #[test]
    fn selector_parsing_child_combinator() {
        let chain = parse_selector("div > .child").unwrap();
        assert_eq!(chain.subject.classes, vec!["child"]);
        assert_eq!(chain.ancestors.len(), 1);
        assert_eq!(chain.ancestors[0].0, Combinator::Child);
        assert_eq!(chain.ancestors[0].1.tag.as_deref(), Some("div"));
    }

    #[test]
    fn selector_parsing_descendant() {
        let chain = parse_selector("div .inner").unwrap();
        assert_eq!(chain.subject.classes, vec!["inner"]);
        assert_eq!(chain.ancestors.len(), 1);
        assert_eq!(chain.ancestors[0].0, Combinator::Descendant);
    }

    #[test]
    fn selector_matching_class() {
        let sel = SimpleSelector {
            tag: None,
            classes: vec!["active".to_string()],
            id: None,
            is_global: false,
            attributes: Vec::new(),
            not_selectors: Vec::new(),
            structural: Vec::new(),
        };
        assert!(simple_matches(
            &sel,
            "div",
            &["active".to_string(), "btn".to_string()],
            None
        ));
        assert!(!simple_matches(&sel, "div", &["btn".to_string()], None));
    }

    #[test]
    fn multiple_rules_same_property_cascade() {
        let mut engine = CssEngine::new();
        engine.load_css(
            r#"
            .base { color: red; }
            .override { color: blue; }
            "#,
        );
        assert_eq!(engine.rules.len(), 2);
        // Both have same specificity (0,1,0), so source order wins
        assert!(engine.rules[0].source_order < engine.rules[1].source_order);
    }

    // -----------------------------------------------------------------------
    // @media query evaluation tests
    // -----------------------------------------------------------------------

    /// Helper: create a tree with a single View (div) node and return (tree, node_id).
    fn tree_with_div() -> (rvst_tree::Tree, rvst_core::NodeId) {
        let mut tree = rvst_tree::Tree::default();
        let id = rvst_core::NodeId(1);
        tree.apply(rvst_core::Op::CreateNode {
            id,
            node_type: rvst_core::NodeType::View,
        });
        tree.apply(rvst_core::Op::Insert {
            parent: rvst_core::NodeId(0),
            child: id,
            anchor: None,
        });
        (tree, id)
    }

    #[test]
    fn media_min_width_matches_when_viewport_wider() {
        let mut engine = CssEngine::new();
        engine.viewport_width = 1024.0;
        engine.viewport_height = 768.0;
        engine.load_css(
            r#"
            div { display: none; }
            @media (min-width: 500px) { div { display: flex; } }
            "#,
        );
        let (tree, id) = tree_with_div();
        let style_map = engine.apply_to_tree(&tree);
        let props = style_map.get(&id).expect("div should have matched rules");
        assert_eq!(
            props.get("display").map(|s| s.as_str()),
            Some("flex"),
            "with viewport 1024px wide, min-width:500px should match -> display:flex"
        );
    }

    #[test]
    fn media_min_width_skipped_when_viewport_narrow() {
        let mut engine = CssEngine::new();
        engine.viewport_width = 400.0;
        engine.viewport_height = 768.0;
        engine.load_css(
            r#"
            div { display: none; }
            @media (min-width: 500px) { div { display: flex; } }
            "#,
        );
        let (tree, id) = tree_with_div();
        let style_map = engine.apply_to_tree(&tree);
        let props = style_map.get(&id).expect("div should have matched base rule");
        assert_eq!(
            props.get("display").map(|s| s.as_str()),
            Some("none"),
            "with viewport 400px wide, min-width:500px should NOT match -> display:none"
        );
    }

    #[test]
    fn media_not_prefix() {
        let mut engine = CssEngine::new();
        engine.viewport_width = 1024.0;
        assert!(engine.evaluate_media("not (max-width: 500px)"));
        assert!(!engine.evaluate_media("not (min-width: 500px)"));
    }

    #[test]
    fn media_comma_or() {
        let mut engine = CssEngine::new();
        engine.viewport_width = 1024.0;
        engine.viewport_height = 300.0;
        // First branch fails, second passes
        assert!(engine.evaluate_media("(max-width: 500px), (min-width: 800px)"));
        // Both fail
        assert!(!engine.evaluate_media("(max-width: 500px), (max-width: 600px)"));
    }

    #[test]
    fn media_screen_and_width() {
        let mut engine = CssEngine::new();
        engine.viewport_width = 1024.0;
        assert!(engine.evaluate_media("screen and (min-width: 768px)"));
        assert!(!engine.evaluate_media("print and (min-width: 768px)"));
    }

    #[test]
    fn media_prefers_color_scheme_dark() {
        let engine = CssEngine::new();
        assert!(engine.evaluate_media("(prefers-color-scheme: dark)"));
        assert!(!engine.evaluate_media("(prefers-color-scheme: light)"));
    }

    #[test]
    fn media_tailwind_responsive_breakpoints() {
        // Tailwind v4 responsive: multiple breakpoints with class selectors
        let mut engine = CssEngine::new();
        engine.viewport_width = 1024.0;
        engine.viewport_height = 768.0;
        engine.load_css(
            r#"
            .responsive { display: none; }
            @media (min-width: 768px) { .responsive { display: flex; } }
            @media (min-width: 1280px) { .responsive { display: grid; } }
            "#,
        );
        let (mut tree, id) = tree_with_div();
        tree.apply(rvst_core::Op::SetAttr {
            id,
            key: "class".into(),
            value: "responsive".into(),
        });
        let style_map = engine.apply_to_tree(&tree);
        let props = style_map.get(&id).expect("div should match responsive rules");
        // viewport 1024px >= 768px but < 1280px: both base and md match, xl doesn't
        // cascade: later matching rule wins -> display:flex (md breakpoint)
        assert_eq!(
            props.get("display").map(|s| s.as_str()),
            Some("flex"),
            "viewport 1024px: md breakpoint matches, xl doesn't -> display:flex"
        );
    }

    #[test]
    fn media_rem_units() {
        let mut engine = CssEngine::new();
        engine.viewport_width = 800.0;
        // 48rem * 16 = 768px; viewport 800 >= 768 -> matches
        assert!(engine.evaluate_media("(width >= 48rem)"));
        // 64rem * 16 = 1024px; viewport 800 < 1024 -> doesn't match
        assert!(!engine.evaluate_media("(width >= 64rem)"));
    }
}

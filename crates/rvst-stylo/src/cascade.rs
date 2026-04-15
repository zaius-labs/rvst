//! Style computation entry point.
//!
//! `StyloEngine` is the main interface. It replaces `CssEngine` from rvst-engine.
//!
//! ## Usage
//!
//! ```ignore
//! let mut engine = StyloEngine::new(viewport_width, viewport_height);
//! engine.load_css(css_text);
//! engine.restyle(&tree);
//!
//! // Per-node access:
//! let computed = engine.computed_style(node_id);
//! let taffy_style = values::computed_to_taffy_style(computed);
//! let paint = values::computed_to_paint_props(computed);
//! ```

use crate::adapter::{with_tree_data, RvstElement, RvstNode, TreeData};
use rvst_core::{NodeId, NodeType};
use rvst_tree::Tree;

use style::context::QuirksMode;
use style::device::servo::FontMetricsProvider;
use style::device::Device;
use style::media_queries::{MediaList, MediaType};
use style::properties::style_structs::Font;
use style::properties::ComputedValues;
use style::queries::values::PrefersColorScheme;
use style::shared_lock::{SharedRwLock, StylesheetGuards};
use style::stylesheets::{AllowImportRules, DocumentStyleSheet, Origin, Stylesheet, UrlExtraData};
use style::stylist::Stylist;

use style::context::{SharedStyleContext, StyleContext, StyleSystemOptions, ThreadLocalStyleContext};
use style::dom::TElement;
use style::selector_parser::SnapshotMap;
use style::style_resolver::{PseudoElementResolution, StyleResolverForElement};
use style::stylist::RuleInclusion;
use style::traversal_flags::TraversalFlags;

use servo_arc::Arc;

use style::font_metrics::FontMetrics;
use style::values::computed::font::GenericFontFamily;
use style::values::computed::{CSSPixelLength, Length};
use style::values::specified::font::QueryFontMetricsFlags;

// ---------------------------------------------------------------------------
// Minimal FontMetricsProvider (no real font system)
// ---------------------------------------------------------------------------

/// A no-op font metrics provider for RVST.
///
/// RVST does not yet have a real font system, so we return sensible defaults.
/// This is sufficient for CSS cascade -- actual text measurement happens in
/// the rendering layer.
#[derive(Debug)]
struct RvstFontMetricsProvider;

impl FontMetricsProvider for RvstFontMetricsProvider {
    fn query_font_metrics(
        &self,
        _vertical: bool,
        _font: &Font,
        base_size: CSSPixelLength,
        _flags: QueryFontMetricsFlags,
    ) -> FontMetrics {
        let px = base_size.px();
        FontMetrics {
            x_height: Some(Length::new(px * 0.5)),
            zero_advance_measure: Some(Length::new(px * 0.5)),
            cap_height: Some(Length::new(px * 0.7)),
            ic_width: Some(Length::new(px)),
            ascent: Length::new(px * 0.8),
            script_percent_scale_down: None,
            script_script_percent_scale_down: None,
        }
    }

    fn base_size_for_generic(&self, _generic: GenericFontFamily) -> Length {
        Length::new(16.0)
    }
}

// ---------------------------------------------------------------------------
// StyloEngine
// ---------------------------------------------------------------------------

/// The main Stylo integration entry point.
///
/// Owns:
/// - Stylo's `Stylist` (cascade data, rule tree)
/// - `SharedRwLock` (thread-safe style data access)
/// - Per-node `ElementData` (computed styles, restyle hints)
/// - Loaded stylesheets
pub struct StyloEngine {
    /// Stylo's cascade manager. Holds all parsed stylesheets and rule data.
    pub stylist: Stylist,

    /// Shared lock for stylesheet data access.
    pub lock: SharedRwLock,

    /// Viewport width in CSS pixels.
    pub viewport_width: f32,

    /// Viewport height in CSS pixels.
    pub viewport_height: f32,

    /// Currently hovered node (for :hover matching).
    pub hovered_node: Option<NodeId>,

    /// Currently focused node (for :focus matching).
    pub focused_node: Option<NodeId>,

    /// Persistent tree data so computed styles survive between calls.
    pub tree_data: Option<TreeData>,
}

impl StyloEngine {
    /// Create a new Stylo engine with the given viewport dimensions.
    pub fn new(viewport_width: f32, viewport_height: f32) -> Self {
        // Ensure Stylo's thread state is initialized (required for debug assertions).
        style::thread_state::initialize(style::thread_state::ThreadState::LAYOUT);

        let lock = SharedRwLock::new();

        // Build initial/default computed values with default font.
        let default_font = Font::initial_values();
        let default_values = ComputedValues::initial_values_with_font_override(default_font);

        let device = Device::new(
            MediaType::screen(),
            QuirksMode::NoQuirks,
            euclid::Size2D::new(viewport_width, viewport_height),
            euclid::Scale::new(1.0),
            Box::new(RvstFontMetricsProvider),
            default_values,
            PrefersColorScheme::Light,
        );

        let stylist = Stylist::new(device, QuirksMode::NoQuirks);

        Self {
            stylist,
            lock,
            viewport_width,
            viewport_height,
            hovered_node: None,
            focused_node: None,
            tree_data: None,
        }
    }

    /// Parse and register a CSS stylesheet.
    ///
    /// This replaces `CssEngine::load_css()`. The CSS text is parsed by Stylo's
    /// full CSS parser, added to the Stylist, and the cascade data is rebuilt.
    pub fn load_css(&mut self, css_text: &str) {
        let url = url::Url::parse("rvst://app").unwrap();
        let url_data = UrlExtraData::from(url);
        let media = Arc::new(self.lock.wrap(MediaList::empty()));

        let sheet = Stylesheet::from_str(
            css_text,
            url_data,
            Origin::Author,
            media,
            self.lock.clone(),
            None, // stylesheet loader (for @import)
            None, // error reporter
            QuirksMode::NoQuirks,
            AllowImportRules::Yes,
        );

        let doc_sheet = DocumentStyleSheet(Arc::new(sheet));
        let guard = self.lock.read();
        self.stylist.append_stylesheet(doc_sheet, &guard);
        drop(guard);

        // Flush cascade data so rules are available for matching.
        let guard = self.lock.read();
        let guards = StylesheetGuards::same(&guard);
        self.stylist.flush(&guards);
    }

    /// Run style computation for all nodes in the tree.
    ///
    /// This replaces `CssEngine::apply_to_tree()`. After this call, every element
    /// node has computed styles accessible via `computed_style()`.
    pub fn restyle(&mut self, tree: &Tree) {
        let tree_data = TreeData::new(tree.clone(), self.lock.clone());

        // Set the thread-local TreeData pointer and run style resolution inside
        // its scope. All RvstNode/RvstElement handles are only valid here.
        with_tree_data(&tree_data, || {
            let guard = self.lock.read();
            let guards = StylesheetGuards::same(&guard);
            let snapshot_map = SnapshotMap::new();

            let animations = style::animation::DocumentAnimationSet::default();

            let shared_context = SharedStyleContext {
                stylist: &self.stylist,
                visited_styles_enabled: false,
                options: StyleSystemOptions::default(),
                guards,
                current_time_for_animations: 0.0,
                traversal_flags: TraversalFlags::empty(),
                snapshot_map: &snapshot_map,
                animations: animations.clone(),
                registered_speculative_painters: &NoOpPainters,
            };

            let mut thread_local = ThreadLocalStyleContext::new();

            let mut style_context = StyleContext {
                shared: &shared_context,
                thread_local: &mut thread_local,
            };

            // Walk the tree and compute styles for each element.
            let root_children = tree.root_children.clone();
            for root_id in root_children {
                Self::resolve_styles_recursive(
                    &tree_data,
                    root_id,
                    &mut style_context,
                    None,
                );
            }
        });

        self.tree_data = Some(tree_data);
    }

    /// Recursively resolve styles for a node and its children.
    fn resolve_styles_recursive(
        tree_data: &TreeData,
        node_id: NodeId,
        context: &mut StyleContext<'_, RvstElement>,
        parent_style: Option<&ComputedValues>,
    ) {
        let node = match tree_data.tree.nodes.get(&node_id) {
            Some(n) => n,
            None => return,
        };

        // Text nodes inherit parent style -- skip style resolution for them.
        if matches!(node.node_type, NodeType::Text) {
            return;
        }

        let element = RvstNode::new(node_id);

        // Ensure element has data storage allocated.
        unsafe {
            element.ensure_data();
        }

        // Use StyleResolverForElement to resolve the primary style.
        // This drives Stylo's full selector matching + cascade for this element.
        let primary_style = {
            let mut resolver = StyleResolverForElement::new(
                element,
                context,
                RuleInclusion::All,
                PseudoElementResolution::IfApplicable,
            );
            resolver.resolve_primary_style(parent_style, parent_style)
        };

        // Store the resolved style in the element's data.
        let style_arc = primary_style.style.0.clone();
        if let Some(mut data) = element.mutate_data() {
            data.styles.primary = Some(style_arc);
        }

        // Get the style we just computed for passing to children.
        let my_style = element
            .borrow_data()
            .map(|d| d.styles.primary().clone());

        // Recurse into children.
        let children = node.children.clone();
        for child_id in children {
            Self::resolve_styles_recursive(
                tree_data,
                child_id,
                context,
                my_style.as_ref().map(|s| s.as_ref()),
            );
        }
    }

    /// Get the computed style for a node, if available.
    ///
    /// Returns None if the node hasn't been styled yet or is a text node.
    pub fn computed_style(&self, node_id: NodeId) -> Option<Arc<ComputedValues>> {
        let tree_data = self.tree_data.as_ref()?;
        // Access element data through the RefCell raw pointer for read access.
        let map = unsafe { &*tree_data.element_data.as_ptr() };
        let wrapper = map.get(&node_id)?;
        let data = wrapper.borrow();
        data.styles.get_primary().cloned()
    }

    /// Update the viewport dimensions (triggers media query re-evaluation).
    pub fn set_viewport(&mut self, width: f32, height: f32) {
        self.viewport_width = width;
        self.viewport_height = height;
        self.stylist
            .device_mut()
            .set_viewport_size(euclid::Size2D::new(width, height));
    }

    /// Set the currently hovered node (for :hover matching).
    pub fn set_hovered(&mut self, node_id: Option<NodeId>) {
        self.hovered_node = node_id;
    }

    /// Set the currently focused node (for :focus matching).
    pub fn set_focused(&mut self, node_id: Option<NodeId>) {
        self.focused_node = node_id;
    }

    /// Clear all stylesheets and computed styles.
    pub fn clear(&mut self) {
        self.tree_data = None;
        // Recreate the engine to clear all stylesheet state.
        let new = StyloEngine::new(self.viewport_width, self.viewport_height);
        self.stylist = new.stylist;
        self.lock = new.lock;
    }
}

// ---------------------------------------------------------------------------
// No-op RegisteredSpeculativePainters (required by SharedStyleContext)
// ---------------------------------------------------------------------------

use style::context::{RegisteredSpeculativePainter, RegisteredSpeculativePainters};
use stylo_atoms::Atom;

/// No-op paint worklet registry. RVST does not support CSS paint worklets.
struct NoOpPainters;

impl RegisteredSpeculativePainters for NoOpPainters {
    fn get(&self, _name: &Atom) -> Option<&dyn RegisteredSpeculativePainter> {
        None
    }
}

// ===========================================================================
// Tests
// ===========================================================================

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_new_does_not_panic() {
        let _engine = StyloEngine::new(1024.0, 768.0);
    }

    #[test]
    fn test_load_css_does_not_panic() {
        let mut engine = StyloEngine::new(1024.0, 768.0);
        engine.load_css(".flex { display: flex; }");
    }

    #[test]
    fn test_load_css_multiple_sheets() {
        let mut engine = StyloEngine::new(1024.0, 768.0);
        engine.load_css("div { display: flex; }");
        engine.load_css("button { color: red; }");
    }

    #[test]
    fn test_restyle_empty_tree() {
        let mut engine = StyloEngine::new(1024.0, 768.0);
        engine.load_css("div { display: flex; }");
        let tree = Tree::new();
        engine.restyle(&tree);
    }

    #[test]
    fn test_computed_style_returns_none_for_missing_node() {
        let engine = StyloEngine::new(1024.0, 768.0);
        assert!(engine.computed_style(NodeId(999)).is_none());
    }

    #[test]
    fn test_set_viewport() {
        let mut engine = StyloEngine::new(1024.0, 768.0);
        engine.set_viewport(1920.0, 1080.0);
        assert_eq!(engine.viewport_width, 1920.0);
        assert_eq!(engine.viewport_height, 1080.0);
    }

    #[test]
    fn test_clear() {
        let mut engine = StyloEngine::new(1024.0, 768.0);
        engine.load_css("div { display: flex; }");
        engine.clear();
        assert!(engine.tree_data.is_none());
    }

    #[test]
    fn test_custom_properties_from_root() {
        use rvst_core::Op;
        use crate::values;

        let mut engine = StyloEngine::new(1024.0, 768.0);
        // Simulates Tailwind v4: :root defines --spacing, .px-3 uses it
        engine.load_css(":root { --spacing: 0.25rem; --color-white: #ffffff; }");
        engine.load_css(".px-3 { padding-left: calc(var(--spacing) * 3); padding-right: calc(var(--spacing) * 3); }");
        engine.load_css(".text-white { color: var(--color-white); }");
        engine.load_css(".bg-dark { background-color: #1a1a1a; }");

        let mut tree = Tree::new();
        tree.apply(Op::CreateNode { id: NodeId(1), node_type: NodeType::View });
        tree.apply(Op::Insert { parent: NodeId(0), child: NodeId(1), anchor: None });
        // Set classes on the node
        tree.apply(Op::SetStyle { id: NodeId(1), key: "class".into(), value: "px-3 text-white bg-dark".into() });

        engine.restyle(&tree);

        let cv = engine.computed_style(NodeId(1)).expect("should have computed style");
        let taffy = values::computed_to_taffy_style(&cv);
        let paint = values::computed_to_paint_props(&cv);

        // padding-left should be calc(0.25rem * 3) = 12px
        let pad_left_px = taffy.padding.left.into_raw().value();
        eprintln!("pad_left={} color={:?} bg={:?}", pad_left_px, paint.color, paint.background_color);
        assert!(pad_left_px > 0.0, "padding-left should be > 0 from var(--spacing), got {}", pad_left_px);

        // color should be white (#ffffff)
        assert!(paint.color[0] > 0.9, "color should be white, got {:?}", paint.color);

        // background should be #1a1a1a
        assert!(paint.background_color[3] > 0.9, "bg should not be transparent, got {:?}", paint.background_color);
    }

    #[test]
    fn test_restyle_with_nodes() {
        use rvst_core::Op;

        let mut engine = StyloEngine::new(1024.0, 768.0);
        engine.load_css("div { display: flex; color: red; }");

        let mut tree = Tree::new();
        // Create a root div node and insert it at the root level.
        // Parent NodeId(0) doesn't exist in nodes, so Insert appends to root_children.
        tree.apply(Op::CreateNode { id: NodeId(1), node_type: NodeType::View });
        tree.apply(Op::Insert { parent: NodeId(0), child: NodeId(1), anchor: None });

        // Create a child button node
        tree.apply(Op::CreateNode { id: NodeId(2), node_type: NodeType::Button });
        tree.apply(Op::Insert { parent: NodeId(1), child: NodeId(2), anchor: None });

        engine.restyle(&tree);

        // After restyle, both nodes should have computed styles.
        let style1 = engine.computed_style(NodeId(1));
        assert!(style1.is_some(), "Root div should have computed styles");

        let style2 = engine.computed_style(NodeId(2));
        assert!(style2.is_some(), "Child button should have computed styles");
    }
}

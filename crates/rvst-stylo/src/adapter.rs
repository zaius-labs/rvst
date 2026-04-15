//! TElement / TNode adapter for RVST's tree.
//!
//! Stylo requires the DOM to implement a trait hierarchy:
//!   TDocument -> TNode -> TElement
//!                      -> TShadowRoot
//!
//! All of these must be `Copy + Clone` (they are lightweight handles).
//!
//! ## Design Decisions
//!
//! - `RvstNode` is exactly `usize`-sized (required by Stylo's sharing cache).
//!   The TreeData pointer is stored in a thread-local, set at the start of
//!   each restyle pass. RvstNode holds only the NodeId as a usize.
//! - Text nodes (`NodeType::Text`) are TNode but not TElement.
//! - Element nodes (View, Button, Input, etc.) are both TNode and TElement.
//! - Shadow DOM is stubbed out (RVST has no shadow boundaries).
//! - ElementData is stored in `TreeData::element_data` (parallel to the tree).

use rvst_core::{NodeId, NodeType};
use rvst_tree::{Node, Tree};
use std::cell::Cell;
use std::collections::HashMap;

use selectors::attr::{AttrSelectorOperation, CaseSensitivity, NamespaceConstraint};
use selectors::bloom::BloomFilter;
use selectors::matching::{ElementSelectorFlags, MatchingContext, VisitedHandlingMode};
use selectors::Element as SelectorsElement;
use selectors::OpaqueElement;
use servo_arc::{Arc, ArcBorrow};

use style::applicable_declarations::ApplicableDeclarationBlock;
use style::context::{QuirksMode, SharedStyleContext};
use style::data::{ElementDataMut, ElementDataRef, ElementDataWrapper};
use style::dom::{
    AttributeProvider, LayoutIterator, NodeInfo, OpaqueNode, TDocument, TElement, TNode,
    TShadowRoot,
};
use style::properties::PropertyDeclarationBlock;
use style::selector_parser::{AttrValue, Lang, NonTSPseudoClass, PseudoElement, SelectorImpl};
use style::shared_lock::{Locked, SharedRwLock};
use style::stylist::CascadeData;
use style::values::computed::Display;
use style::values::AtomIdent;
use style::{LocalName, Namespace};
use stylo_atoms::Atom as WeakAtom;

use stylo_dom::ElementState;

// ---------------------------------------------------------------------------
// Thread-local TreeData pointer
// ---------------------------------------------------------------------------

thread_local! {
    /// The TreeData for the current restyle pass. Set by `with_tree_data()`,
    /// read by RvstNode methods. This allows RvstNode to be pointer-sized
    /// (just a NodeId), which is required by Stylo's sharing cache.
    static CURRENT_TREE_DATA: Cell<*const TreeData> = const { Cell::new(std::ptr::null()) };
}

/// Run a closure with the TreeData pointer set in the thread-local.
///
/// SAFETY: The TreeData must outlive the closure. All RvstNode handles created
/// inside the closure must not escape it.
pub fn with_tree_data<F, R>(tree_data: &TreeData, f: F) -> R
where
    F: FnOnce() -> R,
{
    CURRENT_TREE_DATA.with(|cell| {
        let prev = cell.get();
        cell.set(tree_data as *const TreeData);
        let result = f();
        cell.set(prev);
        result
    })
}

/// Get the current TreeData reference. Panics if not inside `with_tree_data`.
///
/// SAFETY: The returned reference is valid for the duration of the enclosing
/// `with_tree_data` call.
#[inline]
fn current_tree_data<'a>() -> &'a TreeData {
    CURRENT_TREE_DATA.with(|cell| {
        let ptr = cell.get();
        assert!(!ptr.is_null(), "RvstNode used outside of with_tree_data()");
        unsafe { &*ptr }
    })
}

// ---------------------------------------------------------------------------
// Shared state for a restyle pass
// ---------------------------------------------------------------------------

/// Holds the RVST tree alongside Stylo's per-node ElementData.
///
/// During a restyle traversal, `RvstNode` handles point into this structure
/// via the thread-local `CURRENT_TREE_DATA`.
/// It must outlive all `RvstNode` / `RvstElement` handles created from it.
#[derive(Debug)]
pub struct TreeData {
    /// The RVST DOM tree.
    pub tree: Tree,

    /// Per-node Stylo element data (styles, restyle hints, etc.).
    /// Keyed by NodeId. Only element nodes (not text) have entries.
    ///
    /// Uses `RefCell<HashMap<..>>` for interior mutability -- Stylo's
    /// `ensure_data()` needs to insert into the map through a shared reference.
    /// `ElementDataWrapper` handles its own internal synchronization.
    pub element_data: std::cell::RefCell<HashMap<NodeId, ElementDataWrapper>>,

    /// Stylo's shared lock for stylesheet data.
    pub lock: SharedRwLock,

    /// Currently hovered node (for :hover pseudo-class).
    pub hovered: Option<NodeId>,

    /// Currently focused node (for :focus pseudo-class).
    pub focused: Option<NodeId>,
}

impl TreeData {
    pub fn new(tree: Tree, lock: SharedRwLock) -> Self {
        let hovered = tree.hovered;
        let focused = tree.focused;
        Self {
            tree,
            element_data: std::cell::RefCell::new(HashMap::new()),
            lock,
            hovered,
            focused,
        }
    }
}

// ---------------------------------------------------------------------------
// Node handle (implements TNode)
// ---------------------------------------------------------------------------

/// Lightweight Copy handle to a node in the RVST tree.
///
/// This is exactly `usize`-sized: it stores the NodeId as a usize. The TreeData
/// pointer is retrieved from the thread-local `CURRENT_TREE_DATA`. This sizing
/// constraint is required by Stylo's `StyleSharingCache` which uses a typeless
/// cache that assumes element handles are pointer-sized.
///
/// SAFETY: Only valid inside a `with_tree_data()` scope.
#[derive(Clone, Copy, Debug)]
#[repr(transparent)]
pub struct RvstNode {
    /// NodeId stored as usize for size compatibility with Stylo's sharing cache.
    raw_id: usize,
}

impl RvstNode {
    /// Create a new RvstNode from a NodeId.
    #[inline]
    pub fn new(id: NodeId) -> Self {
        Self { raw_id: id.0 as usize }
    }

    /// Get the NodeId.
    #[inline]
    pub fn id(&self) -> NodeId {
        NodeId(self.raw_id as u32)
    }

    /// Get a reference to the current TreeData.
    #[inline]
    fn tree(&self) -> &TreeData {
        current_tree_data()
    }

    /// Get the underlying RVST node, if it exists in the tree.
    pub fn node(&self) -> Option<&Node> {
        self.tree().tree.nodes.get(&self.id())
    }

    /// Whether this node is an element (not a text node).
    pub fn is_element_node(&self) -> bool {
        self.node()
            .map(|n| !matches!(n.node_type, NodeType::Text))
            .unwrap_or(false)
    }

    /// Whether this node is a text node.
    pub fn is_text(&self) -> bool {
        self.node()
            .map(|n| matches!(n.node_type, NodeType::Text))
            .unwrap_or(false)
    }
}

impl PartialEq for RvstNode {
    fn eq(&self, other: &Self) -> bool {
        self.raw_id == other.raw_id
    }
}
impl Eq for RvstNode {}

impl std::hash::Hash for RvstNode {
    fn hash<H: std::hash::Hasher>(&self, state: &mut H) {
        self.raw_id.hash(state);
    }
}

// ---------------------------------------------------------------------------
// Element handle (implements TElement)
// ---------------------------------------------------------------------------

/// Same as RvstNode but only constructed for element nodes.
/// Stylo's `TElement` trait is implemented on this type.
pub type RvstElement = RvstNode;

// ---------------------------------------------------------------------------
// Shadow root stub
// ---------------------------------------------------------------------------

/// RVST has no shadow DOM. This stub satisfies Stylo's TShadowRoot requirement.
/// This type is never actually constructed.
#[derive(Clone, Copy, Debug, PartialEq)]
pub struct RvstShadowRoot {
    _never: std::convert::Infallible,
}

// ---------------------------------------------------------------------------
// Document handle
// ---------------------------------------------------------------------------

/// Lightweight handle to the document root. Implements Stylo's TDocument.
#[derive(Clone, Copy, Debug)]
pub struct RvstDocument {
    _dummy: (),
}

impl PartialEq for RvstDocument {
    fn eq(&self, _other: &Self) -> bool {
        true // there's only one document
    }
}

// ---------------------------------------------------------------------------
// NodeType -> HTML element name mapping
// ---------------------------------------------------------------------------

/// Maps RVST's NodeType to an HTML local name for selector matching.
pub fn node_type_to_local_name(nt: &NodeType) -> &'static str {
    match nt {
        NodeType::View => "div",
        NodeType::Text => "span", // text nodes don't match selectors, but just in case
        NodeType::Button => "button",
        NodeType::Input => "input",
        NodeType::Textarea => "textarea",
        NodeType::Scroll => "div",
        NodeType::Form => "form",
    }
}

/// Extract classes from a node's styles map.
/// Svelte sets `class` as a style property via setAttribute.
pub fn extract_classes(node: &Node) -> Vec<String> {
    node.styles
        .get("class")
        .map(|c| c.split_whitespace().map(String::from).collect())
        .unwrap_or_default()
}

/// Extract the id from a node's styles map.
pub fn extract_id(node: &Node) -> Option<&str> {
    node.styles.get("id").map(|s| s.as_str())
}

// ===========================================================================
// TNode implementation
// ===========================================================================

impl NodeInfo for RvstNode {
    fn is_element(&self) -> bool {
        self.is_element_node()
    }

    fn is_text_node(&self) -> bool {
        self.is_text()
    }
}

impl TNode for RvstNode {
    type ConcreteElement = RvstElement;
    type ConcreteDocument = RvstDocument;
    type ConcreteShadowRoot = RvstShadowRoot;

    fn parent_node(&self) -> Option<Self> {
        let node = self.node()?;
        let parent_id = node.parent?;
        Some(RvstNode::new(parent_id))
    }

    fn first_child(&self) -> Option<Self> {
        let node = self.node()?;
        let &first = node.children.first()?;
        Some(RvstNode::new(first))
    }

    fn last_child(&self) -> Option<Self> {
        let node = self.node()?;
        let &last = node.children.last()?;
        Some(RvstNode::new(last))
    }

    fn prev_sibling(&self) -> Option<Self> {
        let node = self.node()?;
        let parent_id = node.parent?;
        let parent = self.tree().tree.nodes.get(&parent_id)?;
        let pos = parent.children.iter().position(|&c| c == self.id())?;
        if pos == 0 { return None; }
        Some(RvstNode::new(parent.children[pos - 1]))
    }

    fn next_sibling(&self) -> Option<Self> {
        let node = self.node()?;
        let parent_id = node.parent?;
        let parent = self.tree().tree.nodes.get(&parent_id)?;
        let pos = parent.children.iter().position(|&c| c == self.id())?;
        parent.children.get(pos + 1).map(|&id| RvstNode::new(id))
    }

    fn owner_doc(&self) -> RvstDocument {
        RvstDocument { _dummy: () }
    }

    fn is_in_document(&self) -> bool {
        true // all RVST nodes are in the document
    }

    fn traversal_parent(&self) -> Option<RvstElement> {
        self.parent_node().and_then(|n| n.as_element())
    }

    fn opaque(&self) -> OpaqueNode {
        OpaqueNode(self.raw_id)
    }

    fn debug_id(self) -> usize {
        self.raw_id
    }

    fn as_element(&self) -> Option<RvstElement> {
        if self.is_element_node() { Some(*self) } else { None }
    }

    fn as_document(&self) -> Option<RvstDocument> {
        None // individual nodes are never the document
    }

    fn as_shadow_root(&self) -> Option<RvstShadowRoot> {
        None // RVST has no shadow DOM
    }
}

// ===========================================================================
// selectors::Element implementation (selector matching)
// ===========================================================================

impl SelectorsElement for RvstElement {
    type Impl = SelectorImpl;

    fn opaque(&self) -> OpaqueElement {
        OpaqueElement::new(self)
    }

    fn parent_element(&self) -> Option<Self> {
        let node = self.node()?;
        let parent_id = node.parent?;
        let parent = self.tree().tree.nodes.get(&parent_id)?;
        if matches!(parent.node_type, NodeType::Text) { return None; }
        Some(RvstNode::new(parent_id))
    }

    fn parent_node_is_shadow_root(&self) -> bool { false }
    fn containing_shadow_host(&self) -> Option<Self> { None }
    fn is_pseudo_element(&self) -> bool { false }

    fn prev_sibling_element(&self) -> Option<Self> {
        let node = self.node()?;
        let parent_id = node.parent?;
        let parent = self.tree().tree.nodes.get(&parent_id)?;
        let pos = parent.children.iter().position(|&c| c == self.id())?;
        for i in (0..pos).rev() {
            let sib_id = parent.children[i];
            if let Some(sib) = self.tree().tree.nodes.get(&sib_id) {
                if !matches!(sib.node_type, NodeType::Text) {
                    return Some(RvstNode::new(sib_id));
                }
            }
        }
        None
    }

    fn next_sibling_element(&self) -> Option<Self> {
        let node = self.node()?;
        let parent_id = node.parent?;
        let parent = self.tree().tree.nodes.get(&parent_id)?;
        let pos = parent.children.iter().position(|&c| c == self.id())?;
        for i in (pos + 1)..parent.children.len() {
            let sib_id = parent.children[i];
            if let Some(sib) = self.tree().tree.nodes.get(&sib_id) {
                if !matches!(sib.node_type, NodeType::Text) {
                    return Some(RvstNode::new(sib_id));
                }
            }
        }
        None
    }

    fn first_element_child(&self) -> Option<Self> {
        let node = self.node()?;
        for &child_id in &node.children {
            if let Some(child) = self.tree().tree.nodes.get(&child_id) {
                if !matches!(child.node_type, NodeType::Text) {
                    return Some(RvstNode::new(child_id));
                }
            }
        }
        None
    }

    fn is_html_element_in_html_document(&self) -> bool { true }

    fn has_local_name(&self, name: &<SelectorImpl as selectors::parser::SelectorImpl>::BorrowedLocalName) -> bool {
        let node = match self.node() { Some(n) => n, None => return false };
        let local = node_type_to_local_name(&node.node_type);
        local == name.as_ref()
    }

    fn has_namespace(&self, ns: &<SelectorImpl as selectors::parser::SelectorImpl>::BorrowedNamespaceUrl) -> bool {
        // All RVST elements are in the HTML namespace.
        // Empty namespace matches everything in our case.
        ns.as_ref().is_empty()
    }

    fn is_same_type(&self, other: &Self) -> bool {
        match (self.node(), other.node()) {
            (Some(a), Some(b)) => a.node_type == b.node_type,
            _ => false,
        }
    }

    fn attr_matches(
        &self,
        _ns: &NamespaceConstraint<&<SelectorImpl as selectors::parser::SelectorImpl>::NamespaceUrl>,
        _local_name: &<SelectorImpl as selectors::parser::SelectorImpl>::LocalName,
        _operation: &AttrSelectorOperation<&<SelectorImpl as selectors::parser::SelectorImpl>::AttrValue>,
    ) -> bool {
        // TODO(task-2): look up attribute in node.styles
        false
    }

    fn match_non_ts_pseudo_class(
        &self,
        _pc: &NonTSPseudoClass,
        _context: &mut MatchingContext<SelectorImpl>,
    ) -> bool {
        // TODO(task-2): match :hover, :focus, etc.
        false
    }

    fn match_pseudo_element(
        &self,
        _pe: &PseudoElement,
        _context: &mut MatchingContext<SelectorImpl>,
    ) -> bool {
        false
    }

    fn apply_selector_flags(&self, _flags: ElementSelectorFlags) {
        // TODO(task-2): store in TreeData for invalidation
    }

    fn is_link(&self) -> bool { false }
    fn is_html_slot_element(&self) -> bool { false }

    fn has_id(
        &self,
        id: &<SelectorImpl as selectors::parser::SelectorImpl>::Identifier,
        case_sensitivity: CaseSensitivity,
    ) -> bool {
        let node = match self.node() { Some(n) => n, None => return false };
        match node.styles.get("id") {
            Some(node_id) => case_sensitivity.eq(node_id.as_bytes(), id.as_ref().as_bytes()),
            None => false,
        }
    }

    fn has_class(
        &self,
        name: &<SelectorImpl as selectors::parser::SelectorImpl>::Identifier,
        case_sensitivity: CaseSensitivity,
    ) -> bool {
        let node = match self.node() { Some(n) => n, None => return false };
        if let Some(classes) = node.styles.get("class") {
            classes.split_whitespace().any(|c|
                case_sensitivity.eq(c.as_bytes(), name.as_ref().as_bytes())
            )
        } else {
            false
        }
    }

    fn has_custom_state(
        &self,
        _name: &<SelectorImpl as selectors::parser::SelectorImpl>::Identifier,
    ) -> bool {
        false
    }

    fn imported_part(
        &self,
        _name: &<SelectorImpl as selectors::parser::SelectorImpl>::Identifier,
    ) -> Option<<SelectorImpl as selectors::parser::SelectorImpl>::Identifier> {
        None
    }

    fn is_part(
        &self,
        _name: &<SelectorImpl as selectors::parser::SelectorImpl>::Identifier,
    ) -> bool {
        false
    }

    fn is_empty(&self) -> bool {
        self.node().map(|n| n.children.is_empty()).unwrap_or(true)
    }

    fn is_root(&self) -> bool {
        let tree = self.tree();
        // A node is the :root if it's in the tree's root_children list.
        // RVST nodes may have parent=Some(NodeId(0)) even when they're root-level,
        // because the rvst-tree Insert op sets parent to the phantom NodeId(0).
        tree.tree.root_children.contains(&self.id())
    }

    fn add_element_unique_hashes(&self, _filter: &mut BloomFilter) -> bool {
        false
    }
}

// ===========================================================================
// AttributeProvider implementation
// ===========================================================================

impl AttributeProvider for RvstElement {
    fn get_attr(&self, attr: &LocalName, _namespace: &Namespace) -> Option<String> {
        let node = self.node()?;
        // RVST stores attributes in the styles map
        node.styles.get(attr.as_ref()).cloned()
    }
}

// ===========================================================================
// TElement implementation (Stylo element trait)
// ===========================================================================

impl TElement for RvstElement {
    type ConcreteNode = RvstNode;
    type TraversalChildrenIterator = RvstChildIter;

    fn as_node(&self) -> RvstNode { *self }

    fn traversal_children(&self) -> LayoutIterator<RvstChildIter> {
        LayoutIterator(RvstChildIter {
            children: self.node().map(|n| n.children.clone()).unwrap_or_default(),
            index: 0,
        })
    }

    fn is_html_element(&self) -> bool { true }
    fn is_mathml_element(&self) -> bool { false }
    fn is_svg_element(&self) -> bool { false }

    fn style_attribute(&self) -> Option<ArcBorrow<'_, Locked<PropertyDeclarationBlock>>> {
        // TODO(task-2): parse inline styles into PropertyDeclarationBlock and cache
        None
    }

    fn animation_rule(
        &self,
        _: &SharedStyleContext,
    ) -> Option<Arc<Locked<PropertyDeclarationBlock>>> {
        None
    }

    fn transition_rule(
        &self,
        _: &SharedStyleContext,
    ) -> Option<Arc<Locked<PropertyDeclarationBlock>>> {
        None
    }

    fn state(&self) -> ElementState {
        let tree = self.tree();
        let mut state = ElementState::empty();
        if tree.hovered == Some(self.id()) {
            state |= ElementState::HOVER;
        }
        if tree.focused == Some(self.id()) {
            state |= ElementState::FOCUS;
        }
        state
    }

    fn has_part_attr(&self) -> bool { false }
    fn exports_any_part(&self) -> bool { false }

    fn id(&self) -> Option<&WeakAtom> {
        // TODO(task-2): return interned atom for the id
        None
    }

    fn each_class<F>(&self, mut callback: F)
    where
        F: FnMut(&AtomIdent),
    {
        if let Some(node) = self.node() {
            if let Some(classes) = node.styles.get("class") {
                for cls in classes.split_whitespace() {
                    let atom = AtomIdent::from(cls);
                    callback(&atom);
                }
            }
        }
    }

    fn each_custom_state<F>(&self, _callback: F)
    where
        F: FnMut(&AtomIdent),
    {
    }

    fn each_attr_name<F>(&self, _callback: F)
    where
        F: FnMut(&LocalName),
    {
        // TODO(task-2): iterate attribute names
    }

    fn has_dirty_descendants(&self) -> bool {
        self.node().map(|n| n.dirty).unwrap_or(false)
    }

    fn has_snapshot(&self) -> bool { false }
    fn handled_snapshot(&self) -> bool { false }
    unsafe fn set_handled_snapshot(&self) {}

    unsafe fn set_dirty_descendants(&self) {
        // TODO(task-2): set dirty flag
    }

    unsafe fn unset_dirty_descendants(&self) {
        // TODO(task-2): clear dirty flag
    }

    fn shadow_root(&self) -> Option<RvstShadowRoot> { None }
    fn containing_shadow(&self) -> Option<RvstShadowRoot> { None }

    fn skip_item_display_fixup(&self) -> bool { false }
    fn may_have_animations(&self) -> bool { false }
    fn has_animations(&self, _: &SharedStyleContext) -> bool { false }
    fn has_css_animations(&self, _: &SharedStyleContext, _: Option<PseudoElement>) -> bool { false }
    fn has_css_transitions(&self, _: &SharedStyleContext, _: Option<PseudoElement>) -> bool { false }

    fn store_children_to_process(&self, _n: isize) {
        // TODO(task-2): atomic counter for parallel traversal
    }

    fn did_process_child(&self) -> isize {
        // TODO(task-2): atomic decrement
        0
    }

    unsafe fn ensure_data(&self) -> ElementDataMut<'_> {
        let tree = self.tree();
        let mut map = tree.element_data.borrow_mut();
        if !map.contains_key(&self.id()) {
            map.insert(self.id(), ElementDataWrapper::default());
        }
        // SAFETY: ElementDataWrapper outlives the borrow because it lives in TreeData.
        // We drop the RefCell borrow and access via raw pointer -- safe because
        // ensure_data is called with exclusive access to the element.
        let map = tree.element_data.as_ptr();
        (*map).get(&self.id()).unwrap().borrow_mut()
    }

    fn borrow_data(&self) -> Option<ElementDataRef<'_>> {
        let tree = self.tree();
        let map = tree.element_data.borrow();
        if !map.contains_key(&self.id()) {
            return None;
        }
        // SAFETY: same as ensure_data -- ElementDataWrapper lives in TreeData
        let map = unsafe { &*tree.element_data.as_ptr() };
        Some(map.get(&self.id())?.borrow())
    }

    fn mutate_data(&self) -> Option<ElementDataMut<'_>> {
        let tree = self.tree();
        let map = tree.element_data.borrow();
        if !map.contains_key(&self.id()) {
            return None;
        }
        // SAFETY: same as ensure_data
        let map = unsafe { &*tree.element_data.as_ptr() };
        Some(map.get(&self.id())?.borrow_mut())
    }

    fn has_data(&self) -> bool {
        self.tree().element_data.borrow().contains_key(&self.id())
    }

    unsafe fn clear_data(&self) {
        self.tree().element_data.borrow_mut().remove(&self.id());
    }

    fn lang_attr(&self) -> Option<AttrValue> {
        None
    }

    fn match_element_lang(
        &self,
        _override_lang: Option<Option<AttrValue>>,
        _value: &Lang,
    ) -> bool {
        false
    }

    fn is_html_document_body_element(&self) -> bool {
        // The first root child with type View is treated as <body>
        self.tree().tree.root_children.first().copied() == Some(self.id())
    }

    fn synthesize_presentational_hints_for_legacy_attributes<V>(
        &self,
        _visited_handling: VisitedHandlingMode,
        _hints: &mut V,
    ) where
        V: selectors::sink::Push<ApplicableDeclarationBlock>,
    {
        // RVST has no legacy HTML attributes
    }

    fn local_name(&self) -> &<SelectorImpl as selectors::parser::SelectorImpl>::BorrowedLocalName {
        // We need a static reference. Map node_type to a static LocalName.
        static DIV: std::sync::LazyLock<LocalName> = std::sync::LazyLock::new(|| LocalName::from("div"));
        static BUTTON: std::sync::LazyLock<LocalName> = std::sync::LazyLock::new(|| LocalName::from("button"));
        static INPUT: std::sync::LazyLock<LocalName> = std::sync::LazyLock::new(|| LocalName::from("input"));
        static TEXTAREA: std::sync::LazyLock<LocalName> = std::sync::LazyLock::new(|| LocalName::from("textarea"));
        static FORM: std::sync::LazyLock<LocalName> = std::sync::LazyLock::new(|| LocalName::from("form"));
        static SPAN: std::sync::LazyLock<LocalName> = std::sync::LazyLock::new(|| LocalName::from("span"));

        match self.node().map(|n| &n.node_type) {
            Some(NodeType::View) | Some(NodeType::Scroll) => &DIV,
            Some(NodeType::Button) => &BUTTON,
            Some(NodeType::Input) => &INPUT,
            Some(NodeType::Textarea) => &TEXTAREA,
            Some(NodeType::Form) => &FORM,
            Some(NodeType::Text) | None => &SPAN,
        }
    }

    fn namespace(&self) -> &<SelectorImpl as selectors::parser::SelectorImpl>::BorrowedNamespaceUrl {
        static HTML_NS: std::sync::LazyLock<Namespace> = std::sync::LazyLock::new(|| Namespace::from(""));
        &HTML_NS
    }

    fn query_container_size(
        &self,
        _display: &Display,
    ) -> euclid::default::Size2D<Option<app_units::Au>> {
        euclid::default::Size2D::new(None, None)
    }

    fn has_selector_flags(&self, _flags: ElementSelectorFlags) -> bool {
        false
    }

    fn relative_selector_search_direction(&self) -> ElementSelectorFlags {
        ElementSelectorFlags::empty()
    }
}

// ===========================================================================
// TShadowRoot stub
// ===========================================================================

impl TShadowRoot for RvstShadowRoot {
    type ConcreteNode = RvstNode;

    fn as_node(&self) -> Self::ConcreteNode {
        unreachable!("no shadow DOM in RVST")
    }

    fn host(&self) -> RvstElement {
        unreachable!("no shadow DOM in RVST")
    }

    fn style_data<'b>(&self) -> Option<&'b CascadeData>
    where
        Self: 'b,
    {
        None
    }
}

// ===========================================================================
// TDocument implementation
// ===========================================================================

impl TDocument for RvstDocument {
    type ConcreteNode = RvstNode;

    fn as_node(&self) -> RvstNode {
        // Return the first root child as the document element.
        // RVST doesn't have a single root -- it has root_children.
        // We use the first one; if empty, return a sentinel NodeId(0).
        let tree = current_tree_data();
        let root_id = tree.tree.root_children.first().copied()
            .unwrap_or(NodeId(0));
        RvstNode::new(root_id)
    }

    fn is_html_document(&self) -> bool { true }

    fn quirks_mode(&self) -> QuirksMode { QuirksMode::NoQuirks }

    fn shared_lock(&self) -> &SharedRwLock { &current_tree_data().lock }
}

// ===========================================================================
// Child iterator (for TElement::traversal_children)
// ===========================================================================

/// Iterator over a node's children, yielding RvstNode handles.
pub struct RvstChildIter {
    /// Owned copy of the children vec (needed because we can't hold a borrow
    /// from the tree data across iterator yields with the thread-local approach).
    children: Vec<NodeId>,
    index: usize,
}

impl Iterator for RvstChildIter {
    type Item = RvstNode;

    fn next(&mut self) -> Option<RvstNode> {
        if self.index >= self.children.len() {
            return None;
        }
        let id = self.children[self.index];
        self.index += 1;
        Some(RvstNode::new(id))
    }
}

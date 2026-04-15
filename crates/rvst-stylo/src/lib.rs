//! Stylo CSS engine integration for RVST.
//!
//! This crate bridges RVST's tree (`rvst-tree`) with Servo's Stylo CSS engine,
//! replacing the hand-written lightningcss-based cascade in `rvst-engine/css.rs`.
//!
//! ## Architecture
//!
//! ```text
//! op_load_css(text) --> StyloEngine::load_css()
//!                           |
//!                    Stylist (Stylo's cascade manager)
//!                           |
//!                    restyle traversal (per-node)
//!                           |
//!                    ComputedValues per node
//!                           |
//!                    values::computed_to_taffy_style()  --> Taffy layout
//!                    values::computed_to_paint_props()   --> WGPU compositor
//! ```
//!
//! ## Key Types
//!
//! - [`StyloEngine`] -- owns the Stylist, SharedRwLock, and per-node ElementData
//! - [`RvstNode`] / [`RvstElement`] -- lightweight Copy handles implementing Stylo's TNode/TElement
//! - [`PaintProps`] -- typed paint properties extracted from ComputedValues

pub mod adapter;
pub mod cascade;
pub mod values;

// Re-export the main entry point
pub use cascade::StyloEngine;
pub use values::PaintProps;

//! Native Rust implementations of svelte/internal/client functions.
//!
//! # Design
//!
//! Currently, Svelte's internal functions ($.state, $.get, $.set, $.template_effect,
//! $.set_text, $.child, $.append, etc.) run as JavaScript in QuickJS. Each call goes:
//!
//!   JS call → QuickJS dispatch → JS function body → __host.op_* → Rust FFI → Rust
//!
//! This module provides native QuickJS function implementations that skip the JS layer:
//!
//!   JS call → QuickJS native function → Rust directly
//!
//! Overhead reduction: ~100-200ns per call → ~5-10ns per call
//!
//! # Phase 1 (current): Infrastructure
//! - Register native functions that shadow the JS stubs
//! - Start with the highest-frequency ops: set_text, set_attr, child, append
//!
//! # Phase 2 (future): Full signal system in Rust
//! - $.state() creates a Rust-side signal
//! - $.get() reads from Rust signal, tracks dependency
//! - $.set() writes to Rust signal, triggers Rust-side effects
//! - $.template_effect() registers a Rust-side effect callback

use std::collections::HashMap;
use std::sync::{LazyLock, Mutex};

/// Registry of native function implementations.
/// When a function name is registered here, the QuickJS host can check
/// this registry before dispatching to the JS stub.
static NATIVE_FNS: LazyLock<Mutex<HashMap<String, NativeFn>>> =
    LazyLock::new(|| Mutex::new(HashMap::new()));

type NativeFn = Box<dyn Fn(&str) -> String + Send + Sync>;

/// Register a native implementation for a svelte/internal/client function.
pub fn register_native(name: &str, handler: NativeFn) {
    NATIVE_FNS.lock().unwrap().insert(name.to_string(), handler);
}

/// Check if a native implementation exists for a function name.
pub fn has_native(name: &str) -> bool {
    NATIVE_FNS.lock().unwrap().contains_key(name)
}

/// Invoke a native implementation. Returns None if no native exists.
pub fn invoke_native(name: &str, args_json: &str) -> Option<String> {
    let registry = NATIVE_FNS.lock().unwrap();
    registry.get(name).map(|f| f(args_json))
}

/// Register the initial set of native function implementations.
pub fn register_defaults() {
    // Phase 1: high-frequency DOM ops as native functions
    // These are called thousands of times during mount of large component trees

    // For now, this is a no-op — the implementations will be added incrementally
    // as we profile which functions have the most overhead
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn register_and_invoke() {
        register_native("test_fn", Box::new(|args| format!("got: {}", args)));
        assert!(has_native("test_fn"));
        assert_eq!(invoke_native("test_fn", "hello"), Some("got: hello".to_string()));
    }

    #[test]
    fn missing_native_returns_none() {
        assert_eq!(invoke_native("nonexistent", ""), None);
    }
}

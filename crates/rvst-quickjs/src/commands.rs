use std::collections::{HashMap, HashSet};
use std::sync::{Arc, LazyLock, Mutex};

type Handler = Box<dyn Fn(&str) -> String + Send + Sync>;

/// Required capability for a command. None means always allowed.
pub type Capability = &'static str;

/// A command registration entry collected via `inventory::submit!`.
///
/// Library crates can auto-register commands at link time:
/// ```ignore
/// inventory::submit! {
///     rvst_quickjs::commands::CommandRegistration {
///         name: "my_cmd",
///         handler: my_handler_fn,
///         capability: None,           // unrestricted
///         // capability: Some("fs:read"),  // requires fs:read
///     }
/// }
/// ```
pub struct CommandRegistration {
    pub name: &'static str,
    pub handler: fn(&str) -> String,
    /// Required capability. `None` means always allowed (unrestricted).
    pub capability: Option<Capability>,
}

inventory::collect!(CommandRegistration);

/// Drain all `inventory`-collected registrations into the main registry.
/// Call once at startup (before the shell event loop begins).
pub fn register_collected() {
    for reg in inventory::iter::<CommandRegistration> {
        register_internal(reg.name, Box::new(reg.handler), reg.capability.map(|c| c.to_string()));
    }
}

/// Arc-wrapped handler that can be shared with spawned threads.
type AsyncHandler = Arc<dyn Fn(&str) -> String + Send + Sync>;

/// Registry entry: handler + optional required capability.
static REGISTRY: LazyLock<Mutex<HashMap<String, (Handler, Option<String>)>>> =
    LazyLock::new(|| Mutex::new(HashMap::new()));

/// Separate registry for async-capable handlers (wrapped in Arc for thread sharing).
static ASYNC_REGISTRY: LazyLock<Mutex<HashMap<String, (AsyncHandler, Option<String>)>>> =
    LazyLock::new(|| Mutex::new(HashMap::new()));

/// Set of capabilities granted to this runtime (populated at app startup).
static GRANTED_CAPABILITIES: LazyLock<Mutex<HashSet<String>>> =
    LazyLock::new(|| Mutex::new(HashSet::new()));

/// Pending resolved results from async commands: (resolve_id, Ok(result) | Err(error)).
static PENDING_RESOLUTIONS: LazyLock<Mutex<Vec<(u64, Result<String, String>)>>> =
    LazyLock::new(|| Mutex::new(Vec::new()));

/// Monotonically increasing resolve ID counter.
static NEXT_RESOLVE_ID: Mutex<u64> = Mutex::new(0);

/// Grant a capability. Called at app startup based on rvst.config.js.
pub fn grant_capability(cap: &str) {
    GRANTED_CAPABILITIES.lock().unwrap().insert(cap.to_string());
}

/// Grant multiple capabilities at once.
pub fn grant_capabilities(caps: &[&str]) {
    let mut granted = GRANTED_CAPABILITIES.lock().unwrap();
    for cap in caps {
        granted.insert(cap.to_string());
    }
}

/// Check if a capability is granted.
pub fn has_capability(cap: &str) -> bool {
    GRANTED_CAPABILITIES.lock().unwrap().contains(cap)
}

/// Internal registration with explicit capability.
fn register_internal(name: &str, handler: Handler, capability: Option<String>) {
    REGISTRY.lock().unwrap().insert(name.to_string(), (handler, capability));
}

/// Register a native command handler (synchronous, unrestricted).
pub fn register(name: &str, handler: Handler) {
    register_internal(name, handler, None);
}

/// Register a native command handler that requires a capability.
pub fn register_with_capability(name: &str, handler: Handler, capability: &str) {
    register_internal(name, handler, Some(capability.to_string()));
}

/// Register a native command handler for async invocation (unrestricted).
/// The handler itself runs synchronously but will be spawned on a background thread
/// so it doesn't block the QuickJS event loop.
pub fn register_async(name: &str, handler: Box<dyn Fn(&str) -> String + Send + Sync + 'static>) {
    ASYNC_REGISTRY
        .lock()
        .unwrap()
        .insert(name.to_string(), (Arc::from(handler), None));
}

/// Register an async command handler that requires a capability.
pub fn register_async_with_capability(
    name: &str,
    handler: Box<dyn Fn(&str) -> String + Send + Sync + 'static>,
    capability: &str,
) {
    ASYNC_REGISTRY
        .lock()
        .unwrap()
        .insert(name.to_string(), (Arc::from(handler), Some(capability.to_string())));
}

/// Check a capability requirement against the granted set.
/// Returns Ok(()) if allowed, Err with message if denied.
fn check_capability(name: &str, required: &Option<String>) -> Result<(), String> {
    if let Some(cap) = required {
        if !has_capability(cap) {
            return Err(format!(
                "command '{}' requires capability '{}' which is not granted",
                name, cap
            ));
        }
    }
    Ok(())
}

/// Invoke a registered handler synchronously. Returns JSON result or error string.
pub fn invoke(name: &str, payload_json: &str) -> Result<String, String> {
    let registry = REGISTRY.lock().unwrap();
    match registry.get(name) {
        Some((handler, required_cap)) => {
            check_capability(name, required_cap)?;
            Ok(handler(payload_json))
        }
        None => Err(format!("no native handler registered for '{}'", name)),
    }
}

/// Allocate a resolve ID, spawn the handler on a background thread, and return the ID.
/// The JS side uses this ID to match the eventual result back to a Promise.
///
/// Looks up the handler in the async registry first, then falls back to the sync registry
/// (wrapping it in an Arc clone for the thread).
pub fn invoke_async(name: &str, payload: &str) -> Result<u64, String> {
    let id = {
        let mut next = NEXT_RESOLVE_ID.lock().unwrap();
        let id = *next;
        *next += 1;
        id
    };

    // Try async registry first
    let entry: Option<(AsyncHandler, Option<String>)> = ASYNC_REGISTRY.lock().unwrap().get(name).cloned();

    if let Some((h, required_cap)) = entry {
        check_capability(name, &required_cap)?;
        let payload = payload.to_string();
        std::thread::spawn(move || {
            let result = std::panic::catch_unwind(std::panic::AssertUnwindSafe(|| h(&payload)));
            let resolution = match result {
                Ok(json) => (id, Ok(json)),
                Err(_) => (id, Err(format!("handler panicked for resolve_id {id}"))),
            };
            PENDING_RESOLUTIONS.lock().unwrap().push(resolution);
        });
        return Ok(id);
    }

    // Fall back: wrap the sync registry handler for one-shot async use.
    // We must copy the result outside the lock since Handler isn't Clone/Arc.
    let registry = REGISTRY.lock().unwrap();
    match registry.get(name) {
        Some((handler, required_cap)) => {
            check_capability(name, required_cap)?;
            // For sync handlers, we can't move them to a thread (not Arc).
            // Instead, run inline but still return a resolve_id so the JS API is uniform.
            // Heavy sync handlers should be registered via register_async instead.
            let result = handler(payload);
            PENDING_RESOLUTIONS.lock().unwrap().push((id, Ok(result)));
            Ok(id)
        }
        None => Err(format!("no native handler registered for '{}'", name)),
    }
}

/// Drain all pending async resolutions. Called by the event loop each tick.
pub fn drain_resolutions() -> Vec<(u64, Result<String, String>)> {
    let mut pending = PENDING_RESOLUTIONS.lock().unwrap();
    std::mem::take(&mut *pending)
}

/// Returns true if there are pending async resolutions waiting to be drained.
pub fn has_pending_resolutions() -> bool {
    !PENDING_RESOLUTIONS.lock().unwrap().is_empty()
}

/// Clear all handlers and granted capabilities (for testing).
pub fn clear() {
    REGISTRY.lock().unwrap().clear();
    ASYNC_REGISTRY.lock().unwrap().clear();
    PENDING_RESOLUTIONS.lock().unwrap().clear();
    GRANTED_CAPABILITIES.lock().unwrap().clear();
}

#[cfg(test)]
mod tests {
    use super::*;

    fn echo_handler(payload: &str) -> String {
        format!("echo:{payload}")
    }

    inventory::submit! {
        CommandRegistration {
            name: "__test_auto_echo",
            handler: echo_handler,
            capability: None,
        }
    }

    #[test]
    fn test_register_collected_adds_inventory_commands() {
        clear();
        // Before register_collected, the command should not exist.
        assert!(invoke("__test_auto_echo", "hi").is_err());

        register_collected();

        let result = invoke("__test_auto_echo", "hi").unwrap();
        assert_eq!(result, "echo:hi");
    }

    #[test]
    fn test_manual_register_still_works() {
        clear();
        register("manual_cmd", Box::new(|p| format!("manual:{p}")));
        let result = invoke("manual_cmd", "data").unwrap();
        assert_eq!(result, "manual:data");
    }

    #[test]
    fn test_capability_denied_without_grant() {
        // Don't clear — other tests run in parallel. Use unique names.
        register_with_capability("__cap_denied_cmd", Box::new(|p| format!("secret:{p}")), "cap:denied_test");
        let result = invoke("__cap_denied_cmd", "data");
        assert!(result.is_err());
        assert!(result.unwrap_err().contains("cap:denied_test"));
    }

    #[test]
    fn test_capability_allowed_after_grant() {
        register_with_capability("__cap_allowed_cmd", Box::new(|p| format!("secret:{p}")), "cap:allowed_test");
        grant_capability("cap:allowed_test");
        let result = invoke("__cap_allowed_cmd", "data").unwrap();
        assert_eq!(result, "secret:data");
    }

    #[test]
    fn test_unrestricted_command_always_allowed() {
        register("__unrestricted_cmd", Box::new(|p| format!("open:{p}")));
        // No capability required — should always work regardless of granted set
        let result = invoke("__unrestricted_cmd", "data").unwrap();
        assert_eq!(result, "open:data");
    }

    #[test]
    fn test_grant_capabilities_batch() {
        grant_capabilities(&["batch:a", "batch:b", "batch:c"]);
        assert!(has_capability("batch:a"));
        assert!(has_capability("batch:c"));
        assert!(!has_capability("batch:missing"));
    }
}

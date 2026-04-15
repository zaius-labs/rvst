use std::sync::{LazyLock, Mutex};

/// Pending events pushed from Rust threads, waiting to be delivered to JS subscribers.
static PENDING_EVENTS: LazyLock<Mutex<Vec<(String, String)>>> =
    LazyLock::new(|| Mutex::new(Vec::new()));

/// Push an event from any Rust thread. The event will be delivered to JS on the next tick.
pub fn push_event(channel: &str, data_json: &str) {
    PENDING_EVENTS
        .lock()
        .unwrap()
        .push((channel.to_string(), data_json.to_string()));
}

/// Drain all pending events. Called by the event loop.
pub fn drain_events() -> Vec<(String, String)> {
    let mut pending = PENDING_EVENTS.lock().unwrap();
    std::mem::take(&mut *pending)
}

/// Check if there are pending events.
pub fn has_pending_events() -> bool {
    !PENDING_EVENTS.lock().unwrap().is_empty()
}

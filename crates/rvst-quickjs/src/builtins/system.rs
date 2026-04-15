use crate::commands;
use crate::subscriptions;

pub fn register() {
    commands::register("__rvst_watch_start", Box::new(handle_watch_start));
    commands::register("__rvst_watch_stop", Box::new(handle_watch_stop));
}

fn handle_watch_start(payload: &str) -> String {
    #[derive(serde::Deserialize)]
    struct Req {
        channel: String,
        #[allow(dead_code)]
        params: serde_json::Value,
    }
    let req: Req = match serde_json::from_str(payload) {
        Ok(r) => r,
        Err(e) => return format!("{{\"error\":\"{}\"}}", e),
    };

    match req.channel.as_str() {
        // Built-in system streams
        ch if ch.starts_with("system:") => {
            // Spawn a thread that pushes events via subscriptions::push_event
            let channel = req.channel.clone();
            std::thread::spawn(move || {
                // Simple CPU/memory polling loop
                loop {
                    let data = serde_json::json!({
                        "timestamp": std::time::SystemTime::now()
                            .duration_since(std::time::UNIX_EPOCH)
                            .unwrap_or_default()
                            .as_secs(),
                        "type": "system"
                    });
                    subscriptions::push_event(&channel, &data.to_string());
                    std::thread::sleep(std::time::Duration::from_secs(1));
                }
            });
            "{}".to_string()
        }
        _ => {
            // User-defined watch — no-op, handler should be registered separately
            "{}".to_string()
        }
    }
}

fn handle_watch_stop(payload: &str) -> String {
    // TODO: track spawned threads and stop them
    // For now, just acknowledge
    let _ = payload;
    "{}".to_string()
}

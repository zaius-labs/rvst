use crate::commands;
use sha2::{Sha256, Digest};

pub fn register() {
    commands::register_with_capability("crypto_hash", Box::new(handle_hash), "crypto");
    commands::register_with_capability("crypto_random_bytes", Box::new(handle_random_bytes), "crypto");
}

fn handle_hash(payload: &str) -> String {
    let v: serde_json::Value = match serde_json::from_str(payload) {
        Ok(v) => v,
        Err(e) => return serde_json::json!({"error": e.to_string()}).to_string(),
    };
    let input = match v.get("input").and_then(|i| i.as_str()) {
        Some(s) => s,
        None => return serde_json::json!({"error": "missing \"input\" field"}).to_string(),
    };
    let algorithm = v.get("algorithm").and_then(|a| a.as_str()).unwrap_or("sha256");

    match algorithm {
        "sha256" => {
            let mut hasher = Sha256::new();
            hasher.update(input.as_bytes());
            let result = hasher.finalize();
            let hex: String = result.iter().map(|b| format!("{b:02x}")).collect();
            serde_json::json!({"data": {"hex": hex, "algorithm": "sha256"}}).to_string()
        }
        other => {
            serde_json::json!({"error": format!("unsupported algorithm: {other}")}).to_string()
        }
    }
}

fn handle_random_bytes(payload: &str) -> String {
    use base64::Engine;

    let v: serde_json::Value = match serde_json::from_str(payload) {
        Ok(v) => v,
        Err(e) => return serde_json::json!({"error": e.to_string()}).to_string(),
    };
    let count = match v.get("count").and_then(|c| c.as_u64()) {
        Some(n) if n <= 1024 => n as usize,
        Some(_) => return serde_json::json!({"error": "count must be <= 1024"}).to_string(),
        None => return serde_json::json!({"error": "missing \"count\" field"}).to_string(),
    };

    let mut buf = vec![0u8; count];
    if let Err(e) = getrandom::getrandom(&mut buf) {
        return serde_json::json!({"error": format!("getrandom failed: {e}")}).to_string();
    }
    let encoded = base64::engine::general_purpose::STANDARD.encode(&buf);
    serde_json::json!({"data": {"base64": encoded, "length": count}}).to_string()
}

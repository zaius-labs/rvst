use crate::commands;
use flate2::read::{GzDecoder, GzEncoder};
use flate2::Compression;
use std::io::Read;

pub fn register() {
    commands::register_with_capability("compress_gzip", Box::new(handle_gzip), "compress");
    commands::register_with_capability("compress_gunzip", Box::new(handle_gunzip), "compress");
}

fn handle_gzip(payload: &str) -> String {
    use base64::Engine;

    let v: serde_json::Value = match serde_json::from_str(payload) {
        Ok(v) => v,
        Err(e) => return serde_json::json!({"error": e.to_string()}).to_string(),
    };

    // Accept either "text" (string to compress) or "base64" (raw bytes to compress)
    let input_bytes: Vec<u8> = if let Some(text) = v.get("text").and_then(|t| t.as_str()) {
        text.as_bytes().to_vec()
    } else if let Some(b64) = v.get("base64").and_then(|b| b.as_str()) {
        match base64::engine::general_purpose::STANDARD.decode(b64) {
            Ok(b) => b,
            Err(e) => return serde_json::json!({"error": format!("base64 decode: {e}")}).to_string(),
        }
    } else {
        return serde_json::json!({"error": "missing \"text\" or \"base64\" field"}).to_string();
    };

    let mut encoder = GzEncoder::new(&input_bytes[..], Compression::default());
    let mut compressed = Vec::new();
    if let Err(e) = encoder.read_to_end(&mut compressed) {
        return serde_json::json!({"error": format!("gzip compress: {e}")}).to_string();
    }

    let encoded = base64::engine::general_purpose::STANDARD.encode(&compressed);
    serde_json::json!({"data": {
        "base64": encoded,
        "originalSize": input_bytes.len(),
        "compressedSize": compressed.len(),
    }}).to_string()
}

fn handle_gunzip(payload: &str) -> String {
    use base64::Engine;

    let v: serde_json::Value = match serde_json::from_str(payload) {
        Ok(v) => v,
        Err(e) => return serde_json::json!({"error": e.to_string()}).to_string(),
    };
    let b64 = match v.get("base64").and_then(|b| b.as_str()) {
        Some(b) => b,
        None => return serde_json::json!({"error": "missing \"base64\" field"}).to_string(),
    };
    let compressed = match base64::engine::general_purpose::STANDARD.decode(b64) {
        Ok(b) => b,
        Err(e) => return serde_json::json!({"error": format!("base64 decode: {e}")}).to_string(),
    };

    let mut decoder = GzDecoder::new(&compressed[..]);
    let mut decompressed = Vec::new();
    if let Err(e) = decoder.read_to_end(&mut decompressed) {
        return serde_json::json!({"error": format!("gzip decompress: {e}")}).to_string();
    }

    // Try to return as text if valid UTF-8, otherwise as base64
    let as_text = v.get("asText").and_then(|a| a.as_bool()).unwrap_or(false);
    if as_text {
        match String::from_utf8(decompressed.clone()) {
            Ok(text) => serde_json::json!({"data": {"text": text, "size": decompressed.len()}}).to_string(),
            Err(_) => {
                let encoded = base64::engine::general_purpose::STANDARD.encode(&decompressed);
                serde_json::json!({"data": {"base64": encoded, "size": decompressed.len()}}).to_string()
            }
        }
    } else {
        let encoded = base64::engine::general_purpose::STANDARD.encode(&decompressed);
        serde_json::json!({"data": {"base64": encoded, "size": decompressed.len()}}).to_string()
    }
}

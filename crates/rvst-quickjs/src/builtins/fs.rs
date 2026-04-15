use crate::commands;
use crate::ops::validate_sandbox_path;

pub fn register() {
    // fs:read commands
    commands::register_with_capability("fs_read", Box::new(handle_fs_read), "fs:read");
    commands::register_with_capability("fs_read_text", Box::new(handle_fs_read_text), "fs:read");
    commands::register_with_capability("fs_list", Box::new(handle_fs_list), "fs:read");
    commands::register_with_capability("fs_stat", Box::new(handle_fs_stat), "fs:read");
    commands::register_with_capability("fs_exists", Box::new(handle_fs_exists), "fs:read");

    // fs:write commands
    commands::register_with_capability("fs_write", Box::new(handle_fs_write), "fs:write");
    commands::register_with_capability("fs_write_text", Box::new(handle_fs_write_text), "fs:write");
    commands::register_with_capability("fs_mkdir", Box::new(handle_fs_mkdir), "fs:write");
    commands::register_with_capability("fs_remove", Box::new(handle_fs_remove), "fs:write");
}

/// Helper: parse a "path" field from JSON payload.
fn parse_path(payload: &str) -> Result<String, String> {
    let v: serde_json::Value = serde_json::from_str(payload)
        .map_err(|e| e.to_string())?;
    v.get("path")
        .and_then(|p| p.as_str())
        .map(|s| s.to_string())
        .ok_or_else(|| "missing \"path\" field".to_string())
}

/// Helper: wrap a result as JSON.
fn ok_json(data: serde_json::Value) -> String {
    serde_json::json!({"data": data}).to_string()
}

fn err_json(msg: &str) -> String {
    serde_json::json!({"error": msg}).to_string()
}

fn handle_fs_read_text(payload: &str) -> String {
    let path = match parse_path(payload) {
        Ok(p) => p,
        Err(e) => return err_json(&e),
    };
    let safe_path = match validate_sandbox_path(&path) {
        Ok(p) => p,
        Err(e) => return err_json(&e),
    };
    match std::fs::read_to_string(&safe_path) {
        Ok(text) => ok_json(serde_json::Value::String(text)),
        Err(e) => err_json(&e.to_string()),
    }
}

fn handle_fs_read(payload: &str) -> String {
    use base64::Engine;

    let path = match parse_path(payload) {
        Ok(p) => p,
        Err(e) => return err_json(&e),
    };
    let safe_path = match validate_sandbox_path(&path) {
        Ok(p) => p,
        Err(e) => return err_json(&e),
    };
    match std::fs::read(&safe_path) {
        Ok(bytes) => {
            let encoded = base64::engine::general_purpose::STANDARD.encode(&bytes);
            ok_json(serde_json::json!({
                "base64": encoded,
                "length": bytes.len(),
            }))
        }
        Err(e) => err_json(&e.to_string()),
    }
}

fn handle_fs_list(payload: &str) -> String {
    let path = match parse_path(payload) {
        Ok(p) => p,
        Err(e) => return err_json(&e),
    };
    let safe_path = match validate_sandbox_path(&path) {
        Ok(p) => p,
        Err(e) => return err_json(&e),
    };
    match std::fs::read_dir(&safe_path) {
        Ok(entries) => {
            let mut items = Vec::new();
            for entry in entries.flatten() {
                let name = entry.file_name().to_string_lossy().to_string();
                let ft = entry.file_type().ok();
                let is_dir = ft.as_ref().map(|f| f.is_dir()).unwrap_or(false);
                let is_file = ft.as_ref().map(|f| f.is_file()).unwrap_or(false);
                items.push(serde_json::json!({
                    "name": name,
                    "isDir": is_dir,
                    "isFile": is_file,
                }));
            }
            ok_json(serde_json::Value::Array(items))
        }
        Err(e) => err_json(&e.to_string()),
    }
}

fn handle_fs_stat(payload: &str) -> String {
    let path = match parse_path(payload) {
        Ok(p) => p,
        Err(e) => return err_json(&e),
    };
    let safe_path = match validate_sandbox_path(&path) {
        Ok(p) => p,
        Err(e) => return err_json(&e),
    };
    match std::fs::metadata(&safe_path) {
        Ok(meta) => {
            let modified = meta.modified().ok()
                .and_then(|t| t.duration_since(std::time::UNIX_EPOCH).ok())
                .map(|d| d.as_secs());
            ok_json(serde_json::json!({
                "size": meta.len(),
                "isDir": meta.is_dir(),
                "isFile": meta.is_file(),
                "readonly": meta.permissions().readonly(),
                "modified": modified,
            }))
        }
        Err(e) => err_json(&e.to_string()),
    }
}

fn handle_fs_exists(payload: &str) -> String {
    let path = match parse_path(payload) {
        Ok(p) => p,
        Err(e) => return err_json(&e),
    };
    let safe_path = match validate_sandbox_path(&path) {
        Ok(p) => p,
        Err(e) => {
            // "no sandbox configured" or "path escapes sandbox" means we deny,
            // but for exists() we just return false rather than an error.
            if e.contains("escapes") || e.contains("denied") {
                return ok_json(serde_json::Value::Bool(false));
            }
            return err_json(&e);
        }
    };
    ok_json(serde_json::Value::Bool(safe_path.exists()))
}

fn handle_fs_write_text(payload: &str) -> String {
    let v: serde_json::Value = match serde_json::from_str(payload) {
        Ok(v) => v,
        Err(e) => return err_json(&e.to_string()),
    };
    let path = match v.get("path").and_then(|p| p.as_str()) {
        Some(p) => p,
        None => return err_json("missing \"path\" field"),
    };
    let content = match v.get("content").and_then(|c| c.as_str()) {
        Some(c) => c,
        None => return err_json("missing \"content\" field"),
    };
    let safe_path = match validate_sandbox_path(path) {
        Ok(p) => p,
        Err(e) => return err_json(&e),
    };
    match std::fs::write(&safe_path, content) {
        Ok(()) => ok_json(serde_json::json!({"written": content.len()})),
        Err(e) => err_json(&e.to_string()),
    }
}

fn handle_fs_write(payload: &str) -> String {
    use base64::Engine;

    let v: serde_json::Value = match serde_json::from_str(payload) {
        Ok(v) => v,
        Err(e) => return err_json(&e.to_string()),
    };
    let path = match v.get("path").and_then(|p| p.as_str()) {
        Some(p) => p,
        None => return err_json("missing \"path\" field"),
    };
    let b64 = match v.get("base64").and_then(|c| c.as_str()) {
        Some(c) => c,
        None => return err_json("missing \"base64\" field"),
    };
    let safe_path = match validate_sandbox_path(path) {
        Ok(p) => p,
        Err(e) => return err_json(&e),
    };
    let bytes = match base64::engine::general_purpose::STANDARD.decode(b64) {
        Ok(b) => b,
        Err(e) => return err_json(&format!("base64 decode error: {e}")),
    };
    match std::fs::write(&safe_path, &bytes) {
        Ok(()) => ok_json(serde_json::json!({"written": bytes.len()})),
        Err(e) => err_json(&e.to_string()),
    }
}

fn handle_fs_mkdir(payload: &str) -> String {
    let path = match parse_path(payload) {
        Ok(p) => p,
        Err(e) => return err_json(&e),
    };
    // For mkdir, the path doesn't exist yet. Validate the parent is inside sandbox.
    let p = std::path::Path::new(&path);
    let parent = match p.parent() {
        Some(par) => par.to_string_lossy().to_string(),
        None => return err_json("invalid path: no parent directory"),
    };
    if let Err(e) = validate_sandbox_path(&parent) {
        return err_json(&e);
    }
    match std::fs::create_dir_all(&path) {
        Ok(()) => ok_json(serde_json::json!({"created": true})),
        Err(e) => err_json(&e.to_string()),
    }
}

fn handle_fs_remove(payload: &str) -> String {
    let v: serde_json::Value = match serde_json::from_str(payload) {
        Ok(v) => v,
        Err(e) => return err_json(&e.to_string()),
    };
    let path = match v.get("path").and_then(|p| p.as_str()) {
        Some(p) => p,
        None => return err_json("missing \"path\" field"),
    };
    let recursive = v.get("recursive").and_then(|r| r.as_bool()).unwrap_or(false);

    let safe_path = match validate_sandbox_path(path) {
        Ok(p) => p,
        Err(e) => return err_json(&e),
    };
    let result = if safe_path.is_dir() {
        if recursive {
            std::fs::remove_dir_all(&safe_path)
        } else {
            std::fs::remove_dir(&safe_path)
        }
    } else {
        std::fs::remove_file(&safe_path)
    };
    match result {
        Ok(()) => ok_json(serde_json::json!({"removed": true})),
        Err(e) => err_json(&e.to_string()),
    }
}

//! RVST CLI — run Svelte 5 apps as native desktop windows.
//!
//! Usage:
//!   rvst <bundle.js>                Run a pre-built Svelte bundle
//!   rvst <bundle.js> <style.css>    Run with explicit CSS file
//!   rvst --watch <bundle.js>        Watch for changes and re-launch
//!   rvst --snapshot <bundle.js>     Dump scene snapshot as JSON (no window)
//!   rvst                            Run default example (counter)

use rvst_quickjs as js_runtime;
use std::path::PathBuf;

// ── rvst native ─────────────────────────────────────────────────────────

fn native_init() {
    let cargo_dir = PathBuf::from("src-native/src");
    std::fs::create_dir_all(&cargo_dir).expect("failed to create src-native/src");

    let cargo_toml = PathBuf::from("src-native/Cargo.toml");
    if !cargo_toml.exists() {
        std::fs::write(
            &cargo_toml,
            r#"[package]
name = "rvst-native"
version = "0.1.0"
edition = "2021"

[lib]
crate-type = ["rlib"]

[dependencies]
rvst-quickjs = { path = "../../crates/rvst-quickjs" }
serde = { version = "1", features = ["derive"] }
serde_json = "1"
"#,
        )
        .expect("failed to write src-native/Cargo.toml");
    }

    let lib_rs = cargo_dir.join("lib.rs");
    if !lib_rs.exists() {
        std::fs::write(
            &lib_rs,
            "//! Native Rust handlers for this RVST app.\n\
             //! Functions annotated with rvst_quickjs::register_command are available from Svelte.\n",
        )
        .expect("failed to write src-native/src/lib.rs");
    }

    let config = PathBuf::from("rvst.config.js");
    if !config.exists() {
        std::fs::write(
            &config,
            "export default {\n  rust: {\n    dependencies: {},\n  }\n};\n",
        )
        .expect("failed to write rvst.config.js");
    }

    eprintln!("Initialized src-native/. Run `rvst native build` to compile.");
}

fn native_add(args: &[String]) {
    if args.is_empty() {
        eprintln!("Usage: rvst native add <crate> [version]");
        std::process::exit(1);
    }
    let crate_name = &args[0];
    let version = args.get(1).map(|s| s.as_str()).unwrap_or("*");

    let cargo_toml = PathBuf::from("src-native/Cargo.toml");
    if !cargo_toml.exists() {
        eprintln!("src-native/Cargo.toml not found. Run `rvst native init` first.");
        std::process::exit(1);
    }

    let contents = std::fs::read_to_string(&cargo_toml).expect("failed to read Cargo.toml");
    let dep_line = if version == "*" {
        format!("{} = \"*\"\n", crate_name)
    } else {
        format!("{} = \"{}\"\n", crate_name, version)
    };
    let updated = format!("{}{}", contents.trim_end(), format!("\n{}", dep_line));
    std::fs::write(&cargo_toml, updated).expect("failed to write Cargo.toml");

    // Also update rvst.config.js if it exists
    let config = PathBuf::from("rvst.config.js");
    if config.exists() {
        if let Ok(cfg) = std::fs::read_to_string(&config) {
            let insert = format!("    \"{}\": \"{}\"", crate_name, version);
            let new_cfg = cfg.replace(
                "dependencies: {},",
                &format!("dependencies: {{\n{},\n    }},", insert),
            );
            if new_cfg != cfg {
                let _ = std::fs::write(&config, new_cfg);
            }
        }
    }

    eprintln!("Added {} = \"{}\" to src-native/Cargo.toml", crate_name, version);
}

fn native_cargo(cmd: &str) {
    let status = std::process::Command::new("cargo")
        .arg(cmd)
        .current_dir("src-native")
        .stdin(std::process::Stdio::inherit())
        .stdout(std::process::Stdio::inherit())
        .stderr(std::process::Stdio::inherit())
        .status()
        .unwrap_or_else(|e| {
            eprintln!("Failed to run cargo {}: {}", cmd, e);
            std::process::exit(1);
        });
    std::process::exit(status.code().unwrap_or(1));
}

fn native_cargo_release(cmd: &str) {
    let status = std::process::Command::new("cargo")
        .arg(cmd)
        .arg("--release")
        .current_dir("src-native")
        .stdin(std::process::Stdio::inherit())
        .stdout(std::process::Stdio::inherit())
        .stderr(std::process::Stdio::inherit())
        .status()
        .unwrap_or_else(|e| {
            eprintln!("Failed to run cargo {} --release: {}", cmd, e);
            std::process::exit(1);
        });
    std::process::exit(status.code().unwrap_or(1));
}

fn load_bundle(bundle_path: &PathBuf) -> String {
    std::fs::read_to_string(bundle_path).unwrap_or_else(|_| {
        panic!(
            "Could not read bundle at {bundle_path:?}\nBuild with: cd {dir} && npm run build",
            dir = bundle_path
                .parent()
                .and_then(|p| p.parent())
                .map(|p| p.display().to_string())
                .unwrap_or_default()
        )
    })
}

fn load_css(css_path: &PathBuf) -> Option<String> {
    std::fs::read_to_string(css_path).ok()
}

// ── rvst add ────────────────────────────────────────────────────────────

fn add_npm_package(name: &str) {
    let config_path = PathBuf::from("rvst.config.js");
    if !config_path.exists() {
        eprintln!("No rvst.config.js found. Run `rvst native init` first.");
        std::process::exit(1);
    }
    let content = std::fs::read_to_string(&config_path).expect("failed to read rvst.config.js");

    let new_content = if content.contains("packages:") {
        // Insert after "packages: {"
        content.replacen(
            "packages: {",
            &format!("packages: {{\n    '{}': '*',", name),
            1,
        )
    } else if content.contains("packages:{") {
        content.replacen(
            "packages:{",
            &format!("packages:{{\n    '{}': '*',", name),
            1,
        )
    } else {
        // No packages section — add one after "export default {"
        content.replacen(
            "export default {",
            &format!(
                "export default {{\n  packages: {{\n    '{}': '*',\n  }},",
                name
            ),
            1,
        )
    };

    std::fs::write(&config_path, new_content).expect("failed to write rvst.config.js");
    eprintln!("Added {} to rvst.config.js packages", name);

    let status = std::process::Command::new("npm")
        .arg("install")
        .stdin(std::process::Stdio::inherit())
        .stdout(std::process::Stdio::inherit())
        .stderr(std::process::Stdio::inherit())
        .status();
    if let Ok(s) = status {
        if !s.success() {
            eprintln!("npm install failed");
        }
    }
}

fn add_native_crate(name: &str, features: &[&str]) {
    let config_path = PathBuf::from("rvst.config.js");
    if !config_path.exists() {
        eprintln!("No rvst.config.js found. Run `rvst native init` first.");
        std::process::exit(1);
    }
    let content = std::fs::read_to_string(&config_path).expect("failed to read rvst.config.js");

    // Build the value: either "*" or { version: "*", features: ["a", "b"] }
    let value = if features.is_empty() {
        format!("'{}'", "*")
    } else {
        let feat_list: Vec<String> = features.iter().map(|f| format!("'{}'", f)).collect();
        format!(
            "{{ version: '*', features: [{}] }}",
            feat_list.join(", ")
        )
    };

    let new_content = if content.contains("crates:") {
        content.replacen(
            "crates: {",
            &format!("crates: {{\n    '{}': {},", name, value),
            1,
        )
    } else if content.contains("crates:{") {
        content.replacen(
            "crates:{",
            &format!("crates:{{\n    '{}': {},", name, value),
            1,
        )
    } else {
        // No crates section — add one. Try inside rust: {} first, or top-level.
        if content.contains("rust: {") {
            content.replacen(
                "rust: {",
                &format!(
                    "rust: {{\n    crates: {{\n      '{}': {},\n    }},",
                    name, value
                ),
                1,
            )
        } else {
            content.replacen(
                "export default {",
                &format!(
                    "export default {{\n  crates: {{\n    '{}': {},\n  }},",
                    name, value
                ),
                1,
            )
        }
    };

    std::fs::write(&config_path, &new_content).expect("failed to write rvst.config.js");
    eprintln!("Added crate {} to rvst.config.js", name);

    // Also add to src-native/Cargo.toml if it exists
    let cargo_toml = PathBuf::from("src-native/Cargo.toml");
    if cargo_toml.exists() {
        let cargo = std::fs::read_to_string(&cargo_toml).expect("failed to read Cargo.toml");
        let dep_line = if features.is_empty() {
            format!("{} = \"*\"\n", name)
        } else {
            let feat_list: Vec<String> = features.iter().map(|f| format!("\"{}\"", f)).collect();
            format!(
                "{} = {{ version = \"*\", features = [{}] }}\n",
                name,
                feat_list.join(", ")
            )
        };
        let updated = format!("{}{}", cargo.trim_end(), format!("\n{}", dep_line));
        std::fs::write(&cargo_toml, updated).expect("failed to write Cargo.toml");
        eprintln!("Added {} to src-native/Cargo.toml", name);

        // Run cargo check to verify
        let status = std::process::Command::new("cargo")
            .arg("check")
            .current_dir("src-native")
            .stdin(std::process::Stdio::inherit())
            .stdout(std::process::Stdio::inherit())
            .stderr(std::process::Stdio::inherit())
            .status();
        if let Ok(s) = status {
            if !s.success() {
                eprintln!("cargo check failed — the crate may not exist or features are wrong");
            }
        }
    } else {
        eprintln!("Note: src-native/Cargo.toml not found. Run `rvst native init` to scaffold native code.");
    }
}

fn build_desktop() {
    println!("Building desktop binary...");
    let status = std::process::Command::new("cargo")
        .args(["build", "--release"])
        .status()
        .expect("Failed to run cargo");
    if !status.success() {
        std::process::exit(1);
    }
    println!("Desktop build complete.");
}

fn build_web() {
    println!("Building WASM web target...");
    // Step 1: Build Svelte bundle
    let status = std::process::Command::new("npm")
        .args(["run", "build"])
        .status()
        .expect("Failed to run npm build");
    if !status.success() {
        eprintln!("Svelte build failed");
        std::process::exit(1);
    }

    // Step 2: Build WASM
    let status = std::process::Command::new("wasm-pack")
        .args([
            "build",
            "--target",
            "web",
            "--out-dir",
            "dist/wasm",
            "crates/rvst-web",
        ])
        .status();
    match status {
        Ok(s) if s.success() => println!("WASM build complete. Output: dist/wasm/"),
        Ok(_) => {
            eprintln!("wasm-pack build failed");
            std::process::exit(1);
        }
        Err(_) => {
            eprintln!("wasm-pack not found. Install: cargo install wasm-pack");
            std::process::exit(1);
        }
    }

    println!("Web build complete. Serve dist/ to deploy.");
}

fn build_web_compat() {
    // Same as web but with WebGL fallback flag
    println!("Building WASM web target (compat mode)...");
    build_web(); // For now, same as web. WebGL differences handled at runtime.
}

fn main() {
    let args: Vec<String> = std::env::args().collect();

    // rvst add <package> [--native] [--feat <feature>...]
    if args.len() > 1 && args[1] == "add" {
        if args.len() < 3 {
            eprintln!("Usage: rvst add <package> [--native] [--feat <feature>...]");
            std::process::exit(1);
        }
        let package = &args[2];
        let is_native = args.iter().any(|a| a == "--native");
        let features: Vec<&str> = args
            .windows(2)
            .filter(|w| w[0] == "--feat")
            .map(|w| w[1].as_str())
            .collect();

        if is_native {
            add_native_crate(package, &features);
        } else {
            add_npm_package(package);
        }
        return;
    }

    // rvst build [--target <desktop|web|web-compat>]
    if args.len() > 1 && args[1] == "build" {
        let target = args
            .iter()
            .position(|a| a == "--target")
            .and_then(|i| args.get(i + 1))
            .map(|s| s.as_str())
            .unwrap_or("desktop");

        match target {
            "desktop" => build_desktop(),
            "web" => build_web(),
            "web-compat" => build_web_compat(),
            _ => {
                eprintln!(
                    "Unknown target: {}. Use: desktop, web, web-compat",
                    target
                );
                std::process::exit(1);
            }
        }
        return;
    }

    // rvst native <subcommand>
    if args.len() > 1 && args[1] == "native" {
        let subcmd = args.get(2).map(|s| s.as_str()).unwrap_or("help");
        match subcmd {
            "init" => native_init(),
            "add" => native_add(&args[3..]),
            "check" => native_cargo("check"),
            "build" => native_cargo_release("build"),
            "test" => native_cargo("test"),
            "doc" => native_cargo("doc"),
            _ => {
                eprintln!("Usage: rvst native <init|add|check|build|test|doc>");
                std::process::exit(1);
            }
        }
        return;
    }

    if args.len() > 1 && (args[1] == "--help" || args[1] == "-h") {
        eprintln!("RVST — Native Svelte 5 Desktop Engine");
        eprintln!();
        eprintln!("Usage: rvst [options] [bundle.js] [style.css]");
        eprintln!();
        eprintln!("Options:");
        eprintln!("  --watch      Watch bundle file for changes, re-launch on modify");
        eprintln!("  --snapshot   Print scene snapshot as JSON and exit (no window)");
        eprintln!("  --a11y       Print accessibility tree as JSON and exit");
        eprintln!("  --ascii      Print ASCII map of scene layout and exit");
        eprintln!("  --help       Show this help");
        eprintln!();
        eprintln!("Run a pre-built Svelte 5 bundle as a native desktop app.");
        eprintln!("Companion CSS (bundle.css) is auto-loaded if present.");
        eprintln!();
        eprintln!("Examples:");
        eprintln!("  rvst dist/app.js");
        eprintln!("  rvst --watch dist/app.js");
        eprintln!("  rvst --snapshot dist/app.js | jq '.nodes | length'");
        eprintln!("  rvst --a11y dist/app.js | jq '.[] | select(.role==\"button\")'");
        eprintln!();
        eprintln!("Build:");
        eprintln!("  rvst build                       Build desktop binary (default)");
        eprintln!("  rvst build --target web           Build WASM web target");
        eprintln!("  rvst build --target web-compat    Build WASM with WebGL compat mode");
        eprintln!();
        eprintln!("Package Management:");
        eprintln!("  rvst add <pkg>                   Add npm package to rvst.config.js");
        eprintln!("  rvst add <crate> --native        Add Rust crate to rvst.config.js + Cargo.toml");
        eprintln!("  rvst add <crate> --native --feat <f>  Add crate with features");
        eprintln!();
        eprintln!("Native Rust:");
        eprintln!("  rvst native init         Generate src-native/ scaffold and rvst.config.js");
        eprintln!("  rvst native add <crate>  Add a Rust dependency to src-native (legacy)");
        eprintln!("  rvst native check        Run cargo check on src-native");
        eprintln!("  rvst native build        Build src-native in release mode");
        eprintln!("  rvst native test         Run cargo test for src-native");
        eprintln!("  rvst native doc          Open rustdoc for native code");
        std::process::exit(0);
    }

    // Parse flags
    let mut watch = false;
    let mut snapshot_mode = false;
    let mut a11y_mode = false;
    let mut ascii_mode: Option<String> = None;
    let mut filter_str: Option<String> = None;
    let mut positional = Vec::new();
    for arg in args.iter().skip(1) {
        match arg.as_str() {
            "--watch" => watch = true,
            "--snapshot" => snapshot_mode = true,
            "--a11y" => a11y_mode = true,
            "--ascii" => ascii_mode = Some("tree".to_string()),
            s if s.starts_with("--ascii=") => {
                ascii_mode = Some(s.trim_start_matches("--ascii=").to_string())
            }
            s if s.starts_with("--filter=") => {
                filter_str = Some(s.trim_start_matches("--filter=").to_string())
            }
            _ => positional.push(arg.clone()),
        }
    }

    let bundle_path = positional
        .first()
        .map(PathBuf::from)
        .unwrap_or_else(|| PathBuf::from("packages/examples/counter/dist/counter.js"));

    let css_path = positional
        .get(1)
        .map(PathBuf::from)
        .unwrap_or_else(|| bundle_path.with_extension("css"));

    // --snapshot: dump scene graph as JSON and exit
    if snapshot_mode {
        let bundle = load_bundle(&bundle_path);
        if let Some(css) = load_css(&css_path) {
            js_runtime::push_css_text(css);
        }
        let s = rvst_shell::HeadlessSession::new(&bundle, 1024, 768);
        println!("{}", s.snapshot().to_json());
        return;
    }

    // --a11y: dump accessibility tree as JSON and exit
    if a11y_mode {
        let bundle = load_bundle(&bundle_path);
        if let Some(css) = load_css(&css_path) {
            js_runtime::push_css_text(css);
        }
        let s = rvst_shell::HeadlessSession::new(&bundle, 1024, 768);
        let snap = s.snapshot();
        let tree = snap.accessibility_tree();
        println!(
            "{}",
            serde_json::to_string_pretty(&tree).unwrap_or_default()
        );
        return;
    }

    // --ascii[=mode]: dump ASCII map and exit
    // Modes: structure, render, overlay (default), validate
    if let Some(mode) = &ascii_mode {
        let bundle = load_bundle(&bundle_path);
        if let Some(css) = load_css(&css_path) {
            js_runtime::push_css_text(css);
        }
        let mut s = rvst_shell::HeadlessSession::new(&bundle, 1024, 768);
        let snap = s.snapshot();
        let (cols, rows) = (160, 50);

        match mode.as_str() {
            s if s.starts_with("tree") => {
                let view_name = s.strip_prefix("tree:").unwrap_or("semantic");
                let view = rvst_shell::ascii::TreeView::parse(view_name);
                let filter = filter_str
                    .as_deref()
                    .map(rvst_shell::ascii::TreeFilter::parse);
                println!(
                    "{}",
                    rvst_shell::ascii::tree_filtered(&snap, view, filter.as_ref())
                );
            }
            "structure" => {
                let map = rvst_shell::ascii::structure(&snap, cols, rows);
                println!("{}", rvst_shell::ascii::crop(&map));
            }
            "render" => {
                if let Some(pixels) = s.render_pixels() {
                    println!(
                        "{}",
                        rvst_shell::ascii::render(&pixels, 1024, 768, cols, rows)
                    );
                } else {
                    eprintln!("[rvst] no GPU adapter — falling back to structure map");
                    println!("{}", rvst_shell::ascii::structure(&snap, cols, rows));
                }
            }
            "validate" => {
                if let Some(pixels) = s.render_pixels() {
                    let (map, issues) =
                        rvst_shell::ascii::validate(&snap, &pixels, 1024, 768, cols, rows);
                    println!("{}", map);
                    if !issues.is_empty() {
                        eprintln!("\n--- Validation Issues ---");
                        for issue in &issues {
                            eprintln!("  ! [{}] {}", issue.kind, issue.message);
                        }
                    }
                } else {
                    eprintln!("[rvst] no GPU adapter — validate requires pixel rendering");
                    println!("{}", rvst_shell::ascii::structure(&snap, cols, rows));
                }
            }
            _ => {
                // "overlay" (default) — hybrid pixel + labels
                if let Some(pixels) = s.render_pixels() {
                    println!(
                        "{}",
                        rvst_shell::ascii::overlay(&snap, &pixels, 1024, 768, cols, rows)
                    );
                } else {
                    eprintln!("[rvst] no GPU adapter — falling back to structure map");
                    println!("{}", rvst_shell::ascii::structure(&snap, cols, rows));
                }
            }
        }
        return;
    }

    // --watch: poll mtime and re-exec on change
    if watch {
        eprintln!("[rvst] watching {:?} for changes...", bundle_path);
        loop {
            let mtime = std::fs::metadata(&bundle_path)
                .ok()
                .and_then(|m| m.modified().ok());

            // Spawn child process without --watch flag
            let exe = std::env::current_exe().unwrap();
            let mut cmd = std::process::Command::new(&exe);
            for arg in &positional {
                cmd.arg(arg);
            }
            let mut child = cmd.spawn().expect("failed to spawn rvst");

            // Poll for file changes while child runs
            loop {
                std::thread::sleep(std::time::Duration::from_millis(500));
                match child.try_wait() {
                    Ok(Some(_status)) => break, // Child exited (window closed)
                    Ok(None) => {
                        // Child still running — check if file changed
                        let new_mtime = std::fs::metadata(&bundle_path)
                            .ok()
                            .and_then(|m| m.modified().ok());
                        if new_mtime != mtime {
                            eprintln!("[rvst] bundle changed, reloading...");
                            let _ = child.kill();
                            let _ = child.wait();
                            break;
                        }
                    }
                    Err(e) => {
                        eprintln!("[rvst] wait error: {}", e);
                        break;
                    }
                }
            }

            // Check if user closed the window (child exited normally)
            if let Ok(Some(status)) = std::process::Command::new("true").status().map(Some) {
                // Re-check if the bundle still exists
                if !bundle_path.exists() {
                    eprintln!("[rvst] bundle removed, exiting.");
                    break;
                }
                // Check if child exited with ctrl-c
                let _ = status; // suppress unused
            }

            eprintln!("[rvst] restarting...");
        }
        return;
    }

    // Normal mode: run the app
    let bundle = load_bundle(&bundle_path);
    let css = load_css(&css_path);

    // Auto-load .ttf font files from fonts/ directory next to the bundle
    let fonts_dir = bundle_path
        .parent()
        .map(|p| p.join("fonts"))
        .unwrap_or_default();
    let mut fonts: Vec<Vec<u8>> = Vec::new();
    if fonts_dir.is_dir() {
        if let Ok(entries) = std::fs::read_dir(&fonts_dir) {
            for entry in entries.flatten() {
                let path = entry.path();
                let ext = path.extension().and_then(|e| e.to_str()).unwrap_or("");
                if ext == "ttf" || ext == "otf" {
                    if let Ok(data) = std::fs::read(&path) {
                        eprintln!(
                            "[rvst] loaded font: {}",
                            path.file_name().unwrap_or_default().to_string_lossy()
                        );
                        fonts.push(data);
                    }
                }
            }
        }
    }

    rvst_shell::run_with_bundle_css_fonts(bundle, css, fonts);
}

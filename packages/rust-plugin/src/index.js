import { execSync } from 'node:child_process';
import fs from 'node:fs';
import { existsSync, readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { loadConfigSync, generateCargoDeps } from '../../../js/vite-plugin-rvst/src/config-parser.js';

/**
 * Vite plugin for RVST native Rust code.
 * Manages src-native/ Cargo workspace, builds on start, watches for changes.
 */
export function rustPlugin(options = {}) {
  let projectRoot;
  const target = options.target || 'desktop';

  return {
    name: 'vite-plugin-rvst-rust',
    enforce: 'pre',

    configResolved(config) {
      projectRoot = config.root;
    },

    buildStart() {
      const nativeDir = join(projectRoot, 'src-native');
      if (!existsSync(nativeDir)) return; // No native code

      // Regenerate Cargo.toml from rvst.config.js before every build
      regenerateCargoToml(nativeDir, projectRoot, target);

      if (options.prebuild !== false) {
        if (target === 'web' || target === 'web-compat') {
          buildWasm(nativeDir, projectRoot);
        } else {
          buildNative(nativeDir, options);
        }
      }
    },

    configureServer(server) {
      // Watch rvst.config.js for dependency changes — regenerate Cargo.toml on edit
      const configPath = join(projectRoot, 'rvst.config.js');
      if (existsSync(configPath)) {
        server.watcher.add(configPath);
      }
    },

    handleHotUpdate({ file, server }) {
      const nativeDir = join(projectRoot, 'src-native');

      // Regenerate Cargo.toml when rvst.config.js changes (user added/removed deps)
      if (file.endsWith('rvst.config.js')) {
        console.log('[rvst-rust] Config changed — regenerating Cargo.toml...');
        regenerateCargoToml(nativeDir, projectRoot, target);
        // Trigger a full rebuild
        if (target === 'web' || target === 'web-compat') {
          triggerWasmRebuild(nativeDir, projectRoot, server);
        } else {
          triggerRebuild(nativeDir, server);
        }
        return;
      }

      // Debounced rebuild when .rs files change (including files written by rust-extractor)
      if (file.endsWith('.rs') && file.includes('src-native')) {
        if (target === 'web' || target === 'web-compat') {
          triggerWasmRebuild(nativeDir, projectRoot, server);
        } else {
          triggerRebuild(nativeDir, server);
        }
      }
    },
  };
}

/**
 * Build native desktop binary via cargo build.
 */
function buildNative(nativeDir, options = {}) {
  console.log('[rvst-rust] Building native code...');
  try {
    execSync('cargo build --release', {
      cwd: nativeDir,
      stdio: 'inherit',
    });
    console.log('[rvst-rust] Native build complete.');
  } catch (e) {
    console.error('[rvst-rust] Native build failed:', e.message);
    if (options.strict) throw e;
  }
}

/**
 * Build WASM target via wasm-pack.
 */
function buildWasm(nativeDir, projectRoot) {
  console.log('[rvst-rust] Building WASM target...');
  const outDir = join(projectRoot, 'dist', 'wasm');

  // Check for wasm-pack
  try {
    execSync('wasm-pack --version', { stdio: 'pipe' });
  } catch {
    console.error('[rvst-rust] wasm-pack not found. Install: cargo install wasm-pack');
    return;
  }

  try {
    execSync(`wasm-pack build --target web --out-dir "${outDir}"`, {
      cwd: nativeDir,
      stdio: 'inherit',
    });
    console.log(`[rvst-rust] WASM build complete. Output: ${outDir}`);
  } catch (e) {
    console.error('[rvst-rust] WASM build failed:', e.message);
  }
}

/**
 * Debounced Cargo rebuild + Vite server restart.
 * Called when .rs files change or rvst.config.js is edited.
 */
let rebuildTimeout;
function triggerRebuild(nativeDir, server) {
  clearTimeout(rebuildTimeout);
  rebuildTimeout = setTimeout(() => {
    console.log('[rvst-rust] Rebuilding native code...');
    try {
      execSync('cargo build --release', {
        cwd: nativeDir,
        stdio: 'inherit',
      });
      console.log('[rvst-rust] Rebuild complete. Restarting server...');
      // Write restart trigger for any external watchers (e.g. the RVST shell)
      writeFileSync(join(nativeDir, '..', '.rvst-restart'), Date.now().toString());
      // Restart the Vite dev server so new native code is loaded
      server.restart();
    } catch (e) {
      console.error('[rvst-rust] Rebuild failed:', e.message);
    }
  }, 500);
}

/**
 * Debounced WASM rebuild + Vite server restart.
 */
let wasmRebuildTimeout;
function triggerWasmRebuild(nativeDir, projectRoot, server) {
  clearTimeout(wasmRebuildTimeout);
  wasmRebuildTimeout = setTimeout(() => {
    console.log('[rvst-rust] Rebuilding WASM target...');
    buildWasm(nativeDir, projectRoot);
    writeFileSync(join(nativeDir, '..', '.rvst-restart'), Date.now().toString());
    server.restart();
  }, 500);
}

const BASE_DEPS = `rvst-quickjs = { path = "../../crates/rvst-quickjs" }
rvst-macro = { path = "../../crates/rvst-macro" }
serde = { version = "1", features = ["derive"] }
serde_json = "1"
inventory = "0.3"`;

/**
 * Build the full Cargo.toml content from base deps + user deps.
 * For WASM targets, includes "cdylib" crate-type required by wasm-pack.
 */
function buildCargoContent(userDeps, target = 'desktop') {
  let depsSection = BASE_DEPS;
  if (userDeps) {
    depsSection += '\n\n# User dependencies from rvst.config.js\n' + userDeps;
  }

  const crateType = (target === 'web' || target === 'web-compat')
    ? '["cdylib", "rlib"]'
    : '["rlib"]';

  return `[package]
name = "rvst-native"
version = "0.1.0"
edition = "2021"

[lib]
crate-type = ${crateType}

[dependencies]
${depsSection}
`;
}

/**
 * Regenerate Cargo.toml from rvst.config.js, updating user deps while
 * preserving any manual sections (e.g. [features], [profile.*]).
 * When targeting web/web-compat, excludes crates listed in webFallbacks.
 */
function regenerateCargoToml(nativeDir, projectRoot, target = 'desktop') {
  const cargoPath = join(nativeDir, 'Cargo.toml');
  const config = loadConfigSync(projectRoot);

  let crates = config ? { ...config.crates } : {};

  // When targeting web, exclude WASM-incompatible crates
  if (target === 'web' || target === 'web-compat') {
    const fallbacks = (config && config.webFallbacks) || {};
    for (const crate of Object.keys(fallbacks)) {
      delete crates[crate];
    }
  }

  const userDeps = Object.keys(crates).length > 0 ? generateCargoDeps(crates) : '';

  if (existsSync(cargoPath)) {
    // Update only the dependencies section of an existing Cargo.toml
    const existing = readFileSync(cargoPath, 'utf8');
    const updated = updateDepsSection(existing, userDeps);
    if (updated !== existing) {
      writeFileSync(cargoPath, updated);
      console.log('[rvst-rust] Cargo.toml updated with new dependencies.');
    }
  } else {
    // First-time scaffold
    ensureCargoToml(nativeDir, userDeps, target);
  }
}

/**
 * Update the user dependencies block inside an existing Cargo.toml.
 * Preserves everything outside the user deps marker comment.
 */
function updateDepsSection(content, userDeps) {
  const marker = '# User dependencies from rvst.config.js';
  const markerIdx = content.indexOf(marker);

  if (markerIdx !== -1) {
    // Find end of user deps block: next section header or EOF
    const afterMarker = content.substring(markerIdx);
    const nextSectionMatch = afterMarker.match(/\n\[(?!dependencies)/);
    const beforeMarker = content.substring(0, markerIdx);

    if (userDeps) {
      const userBlock = marker + '\n' + userDeps + '\n';
      if (nextSectionMatch) {
        const nextSectionStart = markerIdx + nextSectionMatch.index;
        return beforeMarker + userBlock + content.substring(nextSectionStart);
      }
      return beforeMarker + userBlock;
    } else {
      // No user deps — remove the marker block entirely
      if (nextSectionMatch) {
        const nextSectionStart = markerIdx + nextSectionMatch.index;
        return beforeMarker.trimEnd() + '\n' + content.substring(nextSectionStart);
      }
      return beforeMarker.trimEnd() + '\n';
    }
  } else if (userDeps) {
    // No existing marker — append user deps after [dependencies] section
    const depsHeaderMatch = content.match(/\[dependencies\][^\[]*/);
    if (depsHeaderMatch) {
      const insertPos = depsHeaderMatch.index + depsHeaderMatch[0].length;
      const before = content.substring(0, insertPos).trimEnd();
      const after = content.substring(insertPos);
      return before + '\n\n' + marker + '\n' + userDeps + '\n' + after;
    }
  }

  return content;
}

/**
 * Scaffold src-native/Cargo.toml and lib.rs from scratch.
 */
function ensureCargoToml(nativeDir, userDeps, target = 'desktop') {
  mkdirSync(join(nativeDir, 'src'), { recursive: true });
  const cargoPath = join(nativeDir, 'Cargo.toml');
  writeFileSync(cargoPath, buildCargoContent(userDeps, target));

  // Create lib.rs if missing
  const libPath = join(nativeDir, 'src', 'lib.rs');
  if (!existsSync(libPath)) {
    writeFileSync(libPath, '//! Native Rust handlers for this RVST app.\n');
  }
}

export default rustPlugin;

import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

/**
 * @typedef {Object} RvstConfig
 * @property {Record<string, string>} packages — npm dependencies
 * @property {Record<string, string|{version: string, features?: string[]}>} crates — Rust dependencies
 * @property {string[]} capabilities — permission declarations
 * @property {Record<string, string>} webFallbacks — WASM fallback packages
 */

/**
 * Load and parse rvst.config.js from the project root.
 * Supports both ESM (export default) and CJS (module.exports) formats.
 * Returns null if no config file found.
 */
export async function loadConfig(projectRoot) {
  const configPath = join(projectRoot, 'rvst.config.js');
  if (!existsSync(configPath)) return null;

  try {
    const mod = await import(pathToFileURL(configPath).href);
    const config = mod.default || mod;
    return normalizeConfig(config);
  } catch (e) {
    console.error('[rvst] Failed to load rvst.config.js:', e.message);
    return null;
  }
}

/**
 * Synchronous version using regex extraction (for build-time use where async isn't possible).
 */
export function loadConfigSync(projectRoot) {
  const configPath = join(projectRoot, 'rvst.config.js');
  if (!existsSync(configPath)) return null;

  const content = readFileSync(configPath, 'utf8');
  return parseConfigText(content);
}

/**
 * Parse config text without import() — regex-based extraction for build tools.
 */
export function parseConfigText(text) {
  // Extract the object literal from "export default { ... }" or "module.exports = { ... }"
  // This handles the common cases for build-time reading
  const config = {};

  // packages: { ... }
  const packagesMatch = text.match(/packages\s*:\s*\{([^}]*)\}/);
  if (packagesMatch) {
    config.packages = parseKeyValueBlock(packagesMatch[1]);
  }

  // crates: { ... } — handles both string values and object values with features
  const cratesMatch = text.match(/crates\s*:\s*\{([\s\S]*?)\n\s*\}/);
  if (cratesMatch) {
    config.crates = parseCratesBlock(cratesMatch[1]);
  }

  // capabilities: [ ... ]
  const capMatch = text.match(/capabilities\s*:\s*\[([^\]]*)\]/);
  if (capMatch) {
    config.capabilities = capMatch[1].match(/['"]([^'"]+)['"]/g)?.map(s => s.replace(/['"]/g, '')) || [];
  }

  // webFallbacks: { ... }
  const fallbackMatch = text.match(/webFallbacks\s*:\s*\{([^}]*)\}/);
  if (fallbackMatch) {
    config.webFallbacks = parseKeyValueBlock(fallbackMatch[1]);
  }

  return normalizeConfig(config);
}

function normalizeConfig(config) {
  return {
    packages: config.packages || {},
    crates: config.crates || {},
    capabilities: config.capabilities || [],
    webFallbacks: config.webFallbacks || {},
  };
}

function parseKeyValueBlock(text) {
  const result = {};
  const pairs = text.matchAll(/['"]([^'"]+)['"]\s*:\s*['"]([^'"]+)['"]/g);
  for (const [, key, val] of pairs) {
    result[key] = val;
  }
  return result;
}

function parseCratesBlock(text) {
  const result = {};
  // Object values first: 'name': { version: '...', features: [...] }
  const objPairs = text.matchAll(/['"]([^'"]+)['"]\s*:\s*\{([^}]+)\}/g);
  for (const [, key, inner] of objPairs) {
    const version = inner.match(/version\s*:\s*['"]([^'"]+)['"]/)?.[1];
    const featuresMatch = inner.match(/features\s*:\s*\[([^\]]*)\]/);
    const features = featuresMatch?.[1]?.match(/['"]([^'"]+)['"]/g)?.map(s => s.replace(/['"]/g, ''));
    if (version) {
      result[key] = { version, features: features || [] };
    }
  }
  // Simple string values: 'name': 'version' (skip keys already parsed as objects)
  const simplePairs = text.matchAll(/['"]([^'"]+)['"]\s*:\s*['"]([^'"]+)['"]/g);
  for (const [, key, val] of simplePairs) {
    if (!(key in result)) {
      result[key] = val;
    }
  }
  return result;
}

/**
 * Generate a Cargo.toml [dependencies] block from the crates config.
 */
export function generateCargoDeps(crates) {
  const lines = [];
  for (const [name, spec] of Object.entries(crates)) {
    if (typeof spec === 'string') {
      lines.push(`${name} = "${spec}"`);
    } else {
      const parts = [`version = "${spec.version}"`];
      if (spec.features?.length) {
        parts.push(`features = [${spec.features.map(f => `"${f}"`).join(', ')}]`);
      }
      lines.push(`${name} = { ${parts.join(', ')} }`);
    }
  }
  return lines.join('\n');
}

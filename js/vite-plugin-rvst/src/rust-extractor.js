// rust-extractor.js
//
// Extract <rust> blocks from .svelte files, write Rust modules to
// src-native/, and generate TypeScript/JS bindings that call invokeAsync.

import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';

/**
 * Extract <rust> blocks from Svelte file content.
 * Returns { code: strippedCode, rustBlocks: [{componentName, rustCode}] }
 */
export function extractRustBlocks(code, filename) {
  const blocks = [];
  const componentName = path.basename(filename).replace('.svelte', '');

  const rustRegex = /<rust>([\s\S]*?)<\/rust>/g;
  let match;
  while ((match = rustRegex.exec(code)) !== null) {
    blocks.push({
      componentName,
      rustCode: match[1].trim(),
    });
  }

  // Strip <rust> blocks from Svelte code
  const strippedCode = code.replace(/<rust>[\s\S]*?<\/rust>/g, '');

  return { code: strippedCode, rustBlocks: blocks };
}

/**
 * Write extracted Rust code to src-native/src/ directory.
 * Creates/updates the file only if content hash changed.
 * Returns true if file was written (content changed).
 */
export function writeRustModule(projectRoot, componentName, rustCode) {
  const nativeDir = path.join(projectRoot, 'src-native', 'src');
  fs.mkdirSync(nativeDir, { recursive: true });

  const filePath = path.join(nativeDir, `${componentName.toLowerCase()}.rs`);
  const hash = createHash('sha256').update(rustCode).digest('hex').slice(0, 12);

  // Check if content changed
  const hashFile = filePath + '.hash';
  try {
    const existingHash = fs.readFileSync(hashFile, 'utf8');
    if (existingHash === hash) return false;
  } catch {
    // No hash file yet — first write
  }

  const fullRust =
    `//! Auto-generated from ${componentName}.svelte — do not edit directly\n\n` +
    `use serde::{Serialize, Deserialize};\n` +
    `use rvst_quickjs::commands;\n\n` +
    rustCode;

  fs.writeFileSync(filePath, fullRust);
  fs.writeFileSync(hashFile, hash);

  return true;
}

/**
 * Generate JS bindings for extracted Rust functions.
 * For each #[rvst::command] fn, generates an invokeAsync wrapper.
 * Returns a string to inject into the component's <script> block.
 */
export function generateBindings(rustCode) {
  const fnRegex = /#\[rvst::(command|watch)\]\s+pub\s+fn\s+(\w+)\s*\(([^)]*)\)/g;
  const bindings = [];
  let m;

  while ((m = fnRegex.exec(rustCode)) !== null) {
    const [, annotation, name, paramsStr] = m;
    if (annotation !== 'command') continue;

    // Parse params — skip &self, &mut self, impl Fn(...) callbacks
    const params = paramsStr
      .split(',')
      .map(p => p.trim())
      .filter(p => p && !p.startsWith('&self') && !p.startsWith('&mut self') && !p.includes('impl Fn'))
      .map(p => p.split(':')[0].trim());

    if (params.length === 0) {
      bindings.push(
        `const ${name} = () => invokeAsync('${name}', '{}').then(r => JSON.parse(r));`
      );
    } else if (params.length === 1) {
      bindings.push(
        `const ${name} = (${params[0]}) => invokeAsync('${name}', JSON.stringify(${params[0]})).then(r => JSON.parse(r));`
      );
    } else {
      const paramObj = `{${params.join(', ')}}`;
      bindings.push(
        `const ${name} = (${paramObj}) => invokeAsync('${name}', JSON.stringify(${paramObj})).then(r => JSON.parse(r));`
      );
    }
  }

  return bindings.join('\n');
}

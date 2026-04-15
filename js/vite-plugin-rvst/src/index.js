// vite-plugin-rvst/src/index.js
//
// Redirects Svelte 5 internal imports to renderer-bridge-js.
//
// Svelte 5 compiler emits exactly two internal import paths:
//   - 'svelte/internal/client'        (DOM ops + reactivity)
//   - 'svelte/internal/disclose-version'  (version bookkeeping)
//
// We intercept these via resolveId and point them at the bridge, which
// wraps DOM ops as Deno op calls while re-exporting Svelte's own
// reactivity primitives unchanged.
//
// Discovered via probe (npx vite build on a Svelte 5 runes component):
//   import 'svelte/internal/disclose-version';
//   import * as $ from 'svelte/internal/client';

import { fileURLToPath } from 'url';
import { writeFileSync, readFileSync, existsSync } from 'node:fs';
import path from 'path';
import { rewriteRvstRunes, rewriteRvstHeavy } from './rvst-rune-rewrite.js';
import { extractRustBlocks, writeRustModule, generateBindings } from './rust-extractor.js';
import { writeDtsIfChanged } from './dts-generator.js';
import { loadConfigSync } from './config-parser.js';
import { generateCapabilityDts } from './capabilities.js';
import { generateRuntimeInit } from './capability-runtime.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Absolute path to the bridge entry point
// __dirname is packages/rvst/js/vite-plugin-rvst/src/
// bridge lives at packages/rvst/js/renderer-bridge-js/src/index.js
const BRIDGE_PATH = path.resolve(
  __dirname,
  '../../renderer-bridge-js/src/index.js'
);

// Virtual module ID for the capability runtime init code
const VIRTUAL_CAP_RUNTIME = 'virtual:rvst-capability-runtime';
const RESOLVED_CAP_RUNTIME = '\0' + VIRTUAL_CAP_RUNTIME;

// Import IDs emitted by the Svelte 5 compiler that we redirect to the bridge.
// We only intercept the DOM-ops module and version disclosure. Other internal
// modules (flags/legacy, flags/index, etc.) must resolve to the real Svelte
// package so runtime flags (legacy_mode_flag, async_mode_flag) work correctly.
const SVELTE_INTERNALS = [
  'svelte/internal/client',
  'svelte/internal/disclose-version',
];

export function rvstPlugin() {
  let capabilityRuntimeCode = null;

  return {
    name: 'vite-plugin-rvst',
    enforce: 'pre',

    buildStart() {
      const root = process.cwd();
      if (writeDtsIfChanged(root)) {
        console.log('[rvst] Generated src/rvst.d.ts from Rust signatures');
      }

      // Load config and generate capability types + runtime
      const config = loadConfigSync(root);
      if (config?.capabilities?.length) {
        // Generate TypeScript declarations
        const dts = generateCapabilityDts(config.capabilities);
        const dtsPath = path.join(root, 'src', 'rvst-capabilities.d.ts');
        const existing = existsSync(dtsPath) ? readFileSync(dtsPath, 'utf8') : '';
        if (dts !== existing) {
          writeFileSync(dtsPath, dts, 'utf8');
          console.log('[rvst] Generated src/rvst-capabilities.d.ts from capabilities');
        }

        // Generate runtime init code for virtual module
        capabilityRuntimeCode = generateRuntimeInit(config.capabilities);
      }
    },

    handleHotUpdate({ file }) {
      if (file.endsWith('.rs')) {
        const root = process.cwd();
        if (writeDtsIfChanged(root)) {
          console.log('[rvst] Regenerated src/rvst.d.ts (Rust source changed)');
        }
      }
    },

    resolveId(id, importer) {
      // Resolve the virtual capability runtime module
      if (id === VIRTUAL_CAP_RUNTIME) {
        return RESOLVED_CAP_RUNTIME;
      }

      // Don't redirect when the bridge itself imports svelte/internal/client —
      // that would create a circular dependency. The bridge is the only file
      // allowed to resolve to the real Svelte internals.
      if (importer && importer === BRIDGE_PATH) {
        return null;
      }
      if (SVELTE_INTERNALS.some(pat => id === pat || id.startsWith(pat + '/'))) {
        return BRIDGE_PATH;
      }
    },

    load(id) {
      if (id === RESOLVED_CAP_RUNTIME) {
        return capabilityRuntimeCode || '// No capabilities declared';
      }
    },

    // Pre-process .svelte files before the Svelte compiler sees them:
    //   1. Extract <rust> blocks → write to src-native/, inject JS bindings
    //   2. Rewrite $rvst.query() / $rvst.mutation() runes
    transform(code, id) {
      if (!id.endsWith('.svelte')) return null;

      let transformed = code;
      let changed = false;

      // --- Phase 1: Extract <rust> blocks ---
      if (transformed.includes('<rust>')) {
        const { code: stripped, rustBlocks } = extractRustBlocks(transformed, id);
        transformed = stripped;

        for (const block of rustBlocks) {
          const rustChanged = writeRustModule(process.cwd(), block.componentName, block.rustCode);
          if (rustChanged) {
            console.log(`[rvst] Rust code changed in ${block.componentName}.svelte — native rebuild will follow`);
          }

          // Regenerate d.ts after new Rust modules are written
          if (rustChanged) {
            writeDtsIfChanged(process.cwd());
          }

          // Inject bindings into the first <script> block
          const bindings = generateBindings(block.rustCode);
          if (bindings) {
            transformed = transformed.replace(
              /<script([^>]*)>/,
              `<script$1>\n${bindings}`
            );
          }
        }

        changed = true;
      }

      // --- Phase 2: Rewrite $rvst.* runes ---
      if (transformed.includes('$rvst.')) {
        const rewritten = transformed.replace(
          /(<script[^>]*>)([\s\S]*?)(<\/script>)/g,
          (_match, open, body, close) => {
            return open + rewriteRvstRunes(body) + close;
          }
        );

        if (rewritten !== transformed) {
          transformed = rewritten;
          changed = true;
        }
      }

      // --- Phase 3: Rewrite rvst:heavy directives ---
      if (transformed.includes('rvst:heavy')) {
        const heavyRewritten = rewriteRvstHeavy(transformed);
        if (heavyRewritten !== transformed) {
          transformed = heavyRewritten;
          changed = true;
        }
      }

      if (!changed) return null;
      return { code: transformed, map: null };
    },
  };
}

export default rvstPlugin;

import fs from 'fs';
import path from 'path';
import { parseApiSchema, generateProto, generateClient, generateRust } from '@rvst/api';

/**
 * Find all *.svelte.ts files in a directory (non-recursive).
 */
function findApiFiles(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir)
    .filter(f => f.endsWith('.svelte.ts'))
    .map(f => path.join(dir, f));
}

/**
 * Run codegen for one .svelte.ts file.
 * Writes .gen.js next to the source, .proto in same dir, .gen.rs in src-native/.
 */
function processFile(filePath, projectRoot) {
  const code = fs.readFileSync(filePath, 'utf-8');
  const filename = path.basename(filePath);
  const dir = path.dirname(filePath);

  const schema = parseApiSchema(filename, code);

  if (schema.commands.length === 0 && schema.messages.length === 0) {
    return; // Nothing to generate
  }

  const baseName = filename.replace('.svelte.ts', '');

  // Generate .gen.js (client stubs)
  const clientCode = generateClient(schema);
  fs.writeFileSync(path.join(dir, `${baseName}.gen.js`), clientCode);

  // Generate .proto
  const protoCode = generateProto(schema);
  fs.writeFileSync(path.join(dir, `${baseName}.proto`), protoCode);

  // Generate .gen.rs (Rust types + handler trait)
  const hasNative = schema.commands.some(c => c.native);
  if (hasNative) {
    const rustDir = path.join(projectRoot, 'src-native');
    if (!fs.existsSync(rustDir)) fs.mkdirSync(rustDir, { recursive: true });
    const rustCode = generateRust(schema);
    fs.writeFileSync(path.join(rustDir, `${baseName}.gen.rs`), rustCode);
  }

  console.log(`[@rvst/codegen] ${filename} → ${schema.commands.length} commands, ${schema.messages.length} messages`);
}

/**
 * Vite plugin for automatic API codegen.
 */
export function rvstApiPlugin(options = {}) {
  const apiDir = options.apiDir || 'src/api';

  return {
    name: 'vite-plugin-rvst-api',

    buildStart() {
      const projectRoot = process.cwd();
      const fullApiDir = path.resolve(projectRoot, apiDir);
      const files = findApiFiles(fullApiDir);

      for (const file of files) {
        processFile(file, projectRoot);
      }

      if (files.length > 0) {
        console.log(`[@rvst/codegen] processed ${files.length} API schema(s)`);
      }
    },

    handleHotUpdate({ file, server }) {
      if (file.endsWith('.svelte.ts') && file.includes('/api/')) {
        const projectRoot = server.config.root;
        processFile(file, projectRoot);
        // Trigger HMR for the generated file
        const genFile = file.replace('.svelte.ts', '.gen.js');
        const mod = server.moduleGraph.getModuleById(genFile);
        if (mod) {
          server.moduleGraph.invalidateModule(mod);
          return [mod];
        }
      }
    },
  };
}

// Also export processFile for direct CLI usage
export { processFile, findApiFiles };

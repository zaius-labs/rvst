/**
 * Reverse codegen: extract Rust function signatures and struct definitions,
 * then generate TypeScript declarations (.d.ts).
 */

/** Rust → TypeScript primitive type mapping. */
const RUST_TO_TS = {
  'String': 'string',
  '&str': 'string',
  'f64': 'number',
  'f32': 'number',
  'i32': 'number',
  'i64': 'number',
  'u32': 'number',
  'u64': 'number',
  'u8': 'number',
  'i8': 'number',
  'i16': 'number',
  'u16': 'number',
  'bool': 'boolean',
  'Vec<u8>': 'Uint8Array',
  '()': 'void',
  'usize': 'number',
  'isize': 'number',
};

/**
 * Split a comma-separated generic argument list, respecting nested angle brackets.
 * e.g. "String, Vec<u8>" → ["String", "Vec<u8>"]
 * @param {string} inner
 * @returns {string[]}
 */
export function splitGenericArgs(inner) {
  const parts = [];
  let depth = 0;
  let current = '';

  for (const ch of inner) {
    if (ch === '<') {
      depth++;
      current += ch;
    } else if (ch === '>') {
      depth--;
      current += ch;
    } else if (ch === ',' && depth === 0) {
      parts.push(current.trim());
      current = '';
    } else {
      current += ch;
    }
  }

  if (current.trim()) {
    parts.push(current.trim());
  }

  return parts;
}

/**
 * Convert a single Rust type to TypeScript.
 * Handles: primitives, Vec<T> → T[], Option<T> → T | null, HashMap<K,V> → Record<K,V>,
 * Result<T,E> → T (error handled at runtime), custom struct names pass through.
 * @param {string} rustType
 * @returns {string}
 */
export function rustTypeToTs(rustType) {
  rustType = rustType.trim();

  // Direct mapping (check full string first for Vec<u8>)
  if (RUST_TO_TS[rustType]) return RUST_TO_TS[rustType];

  // Vec<T> → T[]
  if (rustType.startsWith('Vec<') && rustType.endsWith('>')) {
    const inner = rustType.slice(4, -1);
    return `${rustTypeToTs(inner)}[]`;
  }

  // Option<T> → T | null
  if (rustType.startsWith('Option<') && rustType.endsWith('>')) {
    const inner = rustType.slice(7, -1);
    return `${rustTypeToTs(inner)} | null`;
  }

  // HashMap<K, V> / BTreeMap<K, V> → Record<K, V>
  for (const mapType of ['HashMap', 'BTreeMap']) {
    if (rustType.startsWith(`${mapType}<`) && rustType.endsWith('>')) {
      const inner = rustType.slice(mapType.length + 1, -1);
      const [k, v] = splitGenericArgs(inner);
      return `Record<${rustTypeToTs(k)}, ${rustTypeToTs(v)}>`;
    }
  }

  // Result<T, E> → T (errors handled at runtime)
  if (rustType.startsWith('Result<') && rustType.endsWith('>')) {
    const inner = rustType.slice(7, -1);
    const [ok] = splitGenericArgs(inner);
    return rustTypeToTs(ok);
  }

  // Box<T> → T
  if (rustType.startsWith('Box<') && rustType.endsWith('>')) {
    return rustTypeToTs(rustType.slice(4, -1));
  }

  // Strip lifetime annotations (e.g. &'a str → &str)
  const stripped = rustType.replace(/&'[a-z_]+ /g, '&');
  if (stripped !== rustType && RUST_TO_TS[stripped]) {
    return RUST_TO_TS[stripped];
  }

  // Custom struct — pass through as-is
  return rustType;
}

/**
 * Convert a snake_case Rust name to camelCase for TypeScript.
 * @param {string} name
 * @returns {string}
 */
function toCamelCase(name) {
  return name.replace(/_([a-z])/g, (_, c) => c.toUpperCase());
}

/**
 * Extract functions annotated with #[rvst::command] or #[rvst::watch] from Rust source.
 * Returns array of { annotation, name, params: [{name, type}], returnType }
 * @param {string} rustSource
 * @returns {{ annotation: string, name: string, params: { name: string, type: string }[], returnType: string }[]}
 */
export function extractRustFunctions(rustSource) {
  const results = [];

  // First, find annotation + fn signature up to the opening paren
  const headerRe = /#\[rvst::(command|watch)\]\s*(?:#\[[^\]]*\]\s*)*pub\s+(?:async\s+)?fn\s+(\w+)\s*(?:<[^>]*>)?\s*\(/g;

  let match;
  while ((match = headerRe.exec(rustSource)) !== null) {
    const [, annotation, name] = match;
    const afterParen = match.index + match[0].length;

    // Extract balanced parens content
    let depth = 1;
    let i = afterParen;
    while (i < rustSource.length && depth > 0) {
      if (rustSource[i] === '(') depth++;
      else if (rustSource[i] === ')') depth--;
      i++;
    }
    const rawParams = rustSource.slice(afterParen, i - 1);

    // Extract return type: everything between -> and {
    const rest = rustSource.slice(i).trimStart();
    let rawReturn = null;
    if (rest.startsWith('->')) {
      const braceIdx = rest.indexOf('{');
      rawReturn = braceIdx !== -1 ? rest.slice(2, braceIdx).trim() : rest.slice(2).trim();
    }

    // Parse params — skip self, skip impl Fn(...) callback params
    const params = [];
    if (rawParams.trim()) {
      const paramParts = splitGenericArgs(rawParams);
      for (const part of paramParts) {
        const trimmed = part.trim();
        // Skip self references
        if (trimmed === 'self' || trimmed === '&self' || trimmed === '&mut self') continue;
        // Skip impl Fn / callback params
        if (/:\s*impl\s+/.test(trimmed)) continue;

        const colonIdx = trimmed.indexOf(':');
        if (colonIdx === -1) continue;

        const pName = trimmed.slice(0, colonIdx).trim();
        const pType = trimmed.slice(colonIdx + 1).trim();
        params.push({ name: pName, type: pType });
      }
    }

    const returnType = rawReturn ? rawReturn.trim() : '()';

    results.push({ annotation, name, params, returnType });
  }

  return results;
}

/**
 * Extract struct definitions annotated with #[rvst::state] or #[derive(Serialize)]
 * (or #[derive(..., Serialize, ...)]).
 * Returns array of { name, fields: [{name, type, optional}] }
 * @param {string} rustSource
 * @returns {{ name: string, fields: { name: string, type: string, optional: boolean }[] }[]}
 */
export function extractRustStructs(rustSource) {
  const results = [];

  // Match annotated struct definitions
  // Look for #[rvst::state] or #[derive(...Serialize...)] followed by pub struct Name { ... }
  const structRe = /(?:#\[rvst::state\]|#\[derive\([^\)]*Serialize[^\)]*\)\])\s*(?:#\[[^\]]*\]\s*)*pub\s+struct\s+(\w+)\s*(?:<[^>]*>)?\s*\{([^}]*)\}/g;

  let match;
  while ((match = structRe.exec(rustSource)) !== null) {
    const [, name, body] = match;
    const fields = [];

    // Parse struct fields: pub field_name: Type,
    const fieldRe = /pub\s+(\w+)\s*:\s*([^,\n]+)/g;
    let fieldMatch;
    while ((fieldMatch = fieldRe.exec(body)) !== null) {
      const [, fName, rawType] = fieldMatch;
      const fType = rawType.trim().replace(/,$/, '').trim();
      const optional = fType.startsWith('Option<');
      const type = optional ? fType.slice(7, -1) : fType;
      fields.push({ name: fName, type, optional });
    }

    results.push({ name, fields });
  }

  return results;
}

/**
 * Generate a complete TypeScript declaration file from Rust source.
 * Returns string content for rvst.d.ts
 * @param {string} rustSource
 * @returns {string}
 */
export function generateTsDeclarations(rustSource) {
  const functions = extractRustFunctions(rustSource);
  const structs = extractRustStructs(rustSource);

  let output = '// Auto-generated by rvst-codegen — do not edit\n';

  // Generate interfaces for structs
  for (const s of structs) {
    output += '\n';
    output += `export interface ${s.name} {\n`;
    for (const f of s.fields) {
      const tsType = rustTypeToTs(f.type);
      output += `  ${toCamelCase(f.name)}${f.optional ? '?' : ''}: ${tsType};\n`;
    }
    output += '}\n';
  }

  // Generate rvst namespace with command/watch functions
  if (functions.length > 0) {
    output += '\n';
    output += 'declare namespace rvst {\n';
    for (const fn of functions) {
      const params = fn.params
        .map((p) => `${toCamelCase(p.name)}: ${rustTypeToTs(p.type)}`)
        .join(', ');
      const ret = rustTypeToTs(fn.returnType);
      const tsName = toCamelCase(fn.name);

      if (fn.annotation === 'command') {
        output += `  function ${tsName}(${params}): Promise<${ret}>;\n`;
      } else if (fn.annotation === 'watch') {
        output += `  function ${tsName}(${params}): AsyncIterable<${ret}>;\n`;
      }
    }
    output += '}\n';
  }

  return output;
}

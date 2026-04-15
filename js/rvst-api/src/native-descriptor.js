/**
 * native() descriptor — TypeScript-first function annotations that compile to Rust.
 *
 * Input format:
 *   native(async (events: AnalyticsEvent[]) => EventSummary, { strategy: 'parallel-reduce' })
 *
 * This is the reverse direction of ts_from_rust.js: TS types go in, Rust code comes out.
 */

// ── TS → Rust type mapping (reverse of ts_from_rust.js RUST_TO_TS) ─────────

const TS_TO_RUST = {
  'string': 'String',
  'number': 'f64',
  'boolean': 'bool',
  'void': '()',
  'Uint8Array': 'Vec<u8>',
};

/**
 * Convert a TypeScript type to Rust.
 * Handles: primitives, T[] → Vec<T>, T | null → Option<T>,
 * Record<K, V> → HashMap<K, V>, custom types pass through.
 * @param {string} tsType
 * @returns {string}
 */
export function tsTypeToRust(tsType) {
  tsType = tsType.trim();

  if (TS_TO_RUST[tsType]) return TS_TO_RUST[tsType];

  // T[] → Vec<T>
  if (tsType.endsWith('[]')) {
    return `Vec<${tsTypeToRust(tsType.slice(0, -2))}>`;
  }

  // T | null → Option<T>
  if (tsType.includes(' | null')) {
    return `Option<${tsTypeToRust(tsType.replace(' | null', '').trim())}>`;
  }

  // Record<K, V> → HashMap<K, V>
  if (tsType.startsWith('Record<') && tsType.endsWith('>')) {
    const inner = tsType.slice(7, -1);
    const parts = splitTsGenericArgs(inner);
    if (parts.length === 2) {
      return `std::collections::HashMap<${tsTypeToRust(parts[0])}, ${tsTypeToRust(parts[1])}>`;
    }
  }

  // Custom type — pass through
  return tsType;
}

/**
 * Split comma-separated generic args, respecting nested <>.
 * @param {string} inner
 * @returns {string[]}
 */
function splitTsGenericArgs(inner) {
  const parts = [];
  let depth = 0;
  let current = '';

  for (const ch of inner) {
    if (ch === '<') { depth++; current += ch; }
    else if (ch === '>') { depth--; current += ch; }
    else if (ch === ',' && depth === 0) { parts.push(current.trim()); current = ''; }
    else { current += ch; }
  }
  if (current.trim()) parts.push(current.trim());
  return parts;
}

// ── Descriptor parsing ──────────────────────────────────────────────────────

/**
 * Parse a native() descriptor source string.
 *
 * @param {string} source — the full native(...) call text
 * @returns {{ params: {name: string, type: string}[], returnType: string, strategy: string } | null}
 */
export function parseNativeDescriptor(source) {
  // Find the arrow function by scanning for => and walking back to find balanced parens
  const arrowIdx = source.indexOf('=>');
  if (arrowIdx === -1) return null;

  // Walk backwards from => to find the closing ) of the param list
  let closeIdx = -1;
  for (let i = arrowIdx - 1; i >= 0; i--) {
    const ch = source[i];
    if (ch === ')') { closeIdx = i; break; }
    if (!/\s/.test(ch) && ch !== ':') {
      // Check if this is part of a return type annotation like ": ReturnType =>"
      // Scan back further to find )
      continue;
    }
  }

  // If we didn't find ) by simple scan, try scanning past return type annotation
  if (closeIdx === -1) return null;

  // Find the matching opening (
  let depth = 1;
  let openIdx = closeIdx - 1;
  while (openIdx >= 0 && depth > 0) {
    if (source[openIdx] === ')') depth++;
    else if (source[openIdx] === '(') depth--;
    if (depth > 0) openIdx--;
  }
  if (depth !== 0) return null;

  const rawParams = source.slice(openIdx + 1, closeIdx).trim();

  // Return type: check for ": Type" annotation between ) and =>,
  // OR extract the type after => (descriptor format: (params) => ReturnType)
  const between = source.slice(closeIdx + 1, arrowIdx).trim();
  let returnType = 'void';
  if (between.startsWith(':')) {
    returnType = between.slice(1).trim();
  } else {
    // Descriptor format: return type follows =>
    const afterArrow = source.slice(arrowIdx + 2).trim();
    // Return type is everything up to the first comma or end (for options object)
    const retMatch = afterArrow.match(/^([A-Za-z_][\w<>,\[\]\s|]*?)(?:\s*,|\s*\)|\s*$)/);
    if (retMatch) {
      returnType = retMatch[1].trim();
    }
  }

  const params = rawParams
    ? rawParams.split(',').map(p => {
        const [name, ...rest] = p.split(':').map(s => s.trim());
        return { name, type: rest.join(':').trim() || 'any' };
      }).filter(p => p.name)
    : [];

  // Extract strategy from options object
  const strategyMatch = source.match(/strategy:\s*['"]([^'"]+)['"]/);
  const strategy = strategyMatch?.[1] || 'default';

  return { params, returnType, strategy };
}

// ── Rust codegen from descriptor ────────────────────────────────────────────

/**
 * Generate a complete Rust function from a parsed native() descriptor.
 *
 * @param {{ params: {name: string, type: string}[], returnType: string, strategy: string }} descriptor
 * @param {string} functionName — snake_case function name for the Rust side
 * @returns {string}
 */
export function generateRustFromDescriptor(descriptor, functionName) {
  const { params, returnType, strategy } = descriptor;

  const rustParams = params.map(p => `${p.name}: ${tsTypeToRust(p.type)}`).join(', ');
  const rustReturn = tsTypeToRust(returnType);

  let body;
  switch (strategy) {
    case 'parallel-reduce':
      body = generateParallelReduce(params, rustReturn);
      break;
    case 'map':
      body = generateMap(params, rustReturn);
      break;
    case 'filter':
      body = generateFilter(params, rustReturn);
      break;
    case 'sort':
      body = generateSort(params, rustReturn);
      break;
    case 'hash':
      body = generateHash(params, rustReturn);
      break;
    default:
      body = `    todo!("Implement ${functionName}")`;
  }

  return `#[rvst::command]\npub fn ${functionName}(${rustParams}) -> ${rustReturn} {\n${body}\n}`;
}

// ── Pattern library ─────────────────────────────────────────────────────────

/**
 * Generate parallel-reduce pattern using rayon.
 * Assumes first param is a collection.
 */
export function generateParallelReduce(params, returnType) {
  const collection = params[0];
  return (
    `    use rayon::prelude::*;\n` +
    `    ${collection.name}.par_iter()\n` +
    `        .map(|item| {\n` +
    `            // TODO: map each item\n` +
    `            todo!()\n` +
    `        })\n` +
    `        .reduce(|| ${returnType}::default(), |a, b| {\n` +
    `            // TODO: reduce/combine results\n` +
    `            todo!()\n` +
    `        })`
  );
}

/** Generate map pattern — transform each item in a collection. */
export function generateMap(params, returnType) {
  const collection = params[0];
  return (
    `    ${collection.name}.into_iter()\n` +
    `        .map(|item| {\n` +
    `            // TODO: transform each item\n` +
    `            todo!()\n` +
    `        })\n` +
    `        .collect()`
  );
}

/** Generate filter pattern — keep items matching a condition. */
export function generateFilter(params, returnType) {
  const collection = params[0];
  return (
    `    ${collection.name}.into_iter()\n` +
    `        .filter(|item| {\n` +
    `            // TODO: filter condition\n` +
    `            true\n` +
    `        })\n` +
    `        .collect()`
  );
}

/** Generate sort pattern — sort a collection in place. */
export function generateSort(params, returnType) {
  const collection = params[0];
  return (
    `    let mut sorted = ${collection.name};\n` +
    `    sorted.sort_by(|a, b| {\n` +
    `        // TODO: comparison logic\n` +
    `        a.partial_cmp(b).unwrap_or(std::cmp::Ordering::Equal)\n` +
    `    });\n` +
    `    sorted`
  );
}

/** Generate hash pattern using sha2. */
export function generateHash(params, returnType) {
  return (
    `    use sha2::{Sha256, Digest};\n` +
    `    let mut hasher = Sha256::new();\n` +
    `    hasher.update(&${params[0].name});\n` +
    `    format!("{:x}", hasher.finalize())`
  );
}

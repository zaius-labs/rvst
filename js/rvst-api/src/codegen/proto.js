/**
 * Map TypeScript types to proto3 scalar types.
 * @param {string} tsType
 * @returns {string}
 */
function mapType(tsType) {
  switch (tsType) {
    case 'number':
      return 'double';
    case 'string':
      return 'string';
    case 'boolean':
      return 'bool';
    case 'Uint8Array':
      return 'bytes';
    default:
      return tsType;
  }
}

/**
 * Capitalize the first letter of a string.
 * @param {string} s
 * @returns {string}
 */
function capitalize(s) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/**
 * Parse an inline object type string like "{ limit: number; name: string }"
 * into an array of fields.
 * @param {string} raw
 * @returns {import('../types.js').Field[]}
 */
function parseInlineFields(raw) {
  // Strip outer braces
  const inner = raw.replace(/^\{/, '').replace(/\}$/, '').trim();
  if (!inner) return [];

  // Split on semicolons or commas
  const parts = inner.split(/[;,]/).map((s) => s.trim()).filter(Boolean);
  return parts.map((part) => {
    // e.g. "limit: number" or "debug?: boolean" or "items: User[]"
    const match = part.match(/^(\w+)(\?)?:\s*(.+)$/);
    if (!match) return null;
    const [, name, opt, typeStr] = match;
    const optional = !!opt;
    const trimmed = typeStr.trim();
    const repeated = trimmed.endsWith('[]');
    const type = repeated ? trimmed.slice(0, -2) : trimmed;
    return { name, type, repeated, optional };
  }).filter(Boolean);
}

/**
 * Render a proto3 message block.
 * @param {string} name
 * @param {import('../types.js').Field[]} fields
 * @returns {string}
 */
function renderMessage(name, fields) {
  const lines = [`message ${name} {`];
  fields.forEach((f, i) => {
    const parts = [];
    if (f.optional) parts.push('optional');
    if (f.repeated) parts.push('repeated');
    parts.push(mapType(f.type));
    parts.push(`${f.name} = ${i + 1};`);
    lines.push(`  ${parts.join(' ')}`);
  });
  lines.push('}');
  return lines.join('\n');
}

/**
 * Derive a service name from a filename.
 * "users.svelte.ts" → "UsersService"
 * @param {string} filename
 * @returns {string}
 */
function serviceNameFromFile(filename) {
  const base = filename.replace(/\.svelte\.ts$/, '').replace(/\.ts$/, '');
  const name = base.split('/').pop() || base;
  return capitalize(name) + 'Service';
}

/**
 * Generate a valid proto3 file string from an ApiSchema.
 * @param {import('../types.js').ApiSchema} schema
 * @returns {string}
 */
export function generateProto(schema) {
  const blocks = [];
  blocks.push('syntax = "proto3";');
  blocks.push('');
  blocks.push('package rvst;');

  // Collect known message names from schema
  const knownMessages = new Set(schema.messages.map((m) => m.name));

  // Render interface-derived messages
  for (const msg of schema.messages) {
    blocks.push('');
    blocks.push(renderMessage(msg.name, msg.fields));
  }

  // Track generated request/response message names and rpc lines
  const rpcLines = [];

  for (const cmd of schema.commands) {
    const rpcName = capitalize(cmd.name);

    // --- Request message ---
    const reqMsgName = `${rpcName}Request`;
    const reqType = cmd.requestType.trim();

    if (reqType.startsWith('{')) {
      // Inline object → generate a named message
      const fields = parseInlineFields(reqType);
      blocks.push('');
      blocks.push(renderMessage(reqMsgName, fields));
    } else if (knownMessages.has(reqType)) {
      // Reference to an existing interface — use it directly as the request message
      // We still need a wrapper so the rpc signature is consistent
      // Actually, just alias it — but proto doesn't support aliases,
      // so generate a wrapper message
      blocks.push('');
      blocks.push(renderMessage(reqMsgName, [{ name: 'payload', type: reqType, repeated: false, optional: false }]));
    }

    // --- Response message ---
    const resMsgName = `${rpcName}Response`;
    const resType = cmd.responseType.trim();

    if (resType.endsWith('[]')) {
      // Array response → repeated T items
      const elemType = resType.slice(0, -2);
      blocks.push('');
      blocks.push(renderMessage(resMsgName, [{ name: 'items', type: elemType, repeated: true, optional: false }]));
    } else if (resType.startsWith('{')) {
      // Inline object response
      const fields = parseInlineFields(resType);
      blocks.push('');
      blocks.push(renderMessage(resMsgName, fields));
    } else {
      // Plain type → wrap as result
      blocks.push('');
      blocks.push(renderMessage(resMsgName, [{ name: 'result', type: resType, repeated: false, optional: false }]));
    }

    rpcLines.push(`  rpc ${rpcName} (${reqMsgName}) returns (${resMsgName});`);
  }

  // Service block
  if (rpcLines.length > 0) {
    const serviceName = serviceNameFromFile(schema.file);
    blocks.push('');
    blocks.push(`service ${serviceName} {`);
    blocks.push(rpcLines.join('\n'));
    blocks.push('}');
  }

  return blocks.join('\n') + '\n';
}

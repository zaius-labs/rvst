import { CAPABILITY_MAP } from './capabilities.js';

/**
 * Generate the runtime JS that creates the rvst global object.
 * This is injected into the entry point by the Vite plugin.
 */
export function generateRuntimeInit(capabilities) {
  const namespaces = {};

  for (const cap of capabilities) {
    const mapping = CAPABILITY_MAP[cap];
    if (!mapping?.tsApi) continue;
    const ns = mapping.tsApi.namespace;
    if (!namespaces[ns]) namespaces[ns] = { commands: [] };
    namespaces[ns].commands.push(...mapping.commands);
  }

  let code = '// Auto-generated rvst capability runtime\n';
  code += 'const rvst = {};\n';

  for (const [ns, info] of Object.entries(namespaces)) {
    code += `rvst.${ns} = {};\n`;
    for (const cmd of info.commands) {
      // Generate a wrapper that calls invokeAsync
      const methodName = cmd.replace(/^[a-z]+_/, ''); // fs_read -> read
      code += `rvst.${ns}.${methodName} = (params) => invokeAsync('${cmd}', JSON.stringify(typeof params === 'string' ? {path: params} : (params || {}))).then(r => JSON.parse(r));\n`;
    }
  }

  code += 'globalThis.rvst = rvst;\n';
  return code;
}

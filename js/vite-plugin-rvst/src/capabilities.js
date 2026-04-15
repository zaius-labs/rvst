/**
 * Map capability strings to the commands and ops they enable.
 * Used by the Vite plugin to generate typed APIs and by the shell to grant permissions.
 */

export const CAPABILITY_MAP = {
  'fs:read': {
    commands: ['fs_read', 'fs_read_text', 'fs_list', 'fs_stat', 'fs_exists'],
    ops: ['op_read_file', 'op_read_text_file'],
    tsApi: {
      namespace: 'fs',
      methods: [
        'read(path: string): Promise<Uint8Array>',
        'readText(path: string): Promise<string>',
        'list(dir: string): Promise<FileEntry[]>',
        'stat(path: string): Promise<FileStat>',
        'exists(path: string): Promise<boolean>',
      ]
    }
  },
  'fs:write': {
    commands: ['fs_write', 'fs_write_text', 'fs_mkdir', 'fs_remove'],
    ops: ['op_write_file'],
    tsApi: {
      namespace: 'fs',
      methods: [
        'write(path: string, data: Uint8Array): Promise<void>',
        'writeText(path: string, text: string): Promise<void>',
        'mkdir(path: string): Promise<void>',
        'remove(path: string): Promise<void>',
      ]
    }
  },
  'fs:watch': {
    commands: ['fs_watch_start', 'fs_watch_stop'],
    ops: [],
    tsApi: {
      namespace: 'fs',
      methods: ['watch(dir: string): AsyncIterable<FileChange>']
    }
  },
  'net:fetch': {
    commands: ['http_get', 'http_post'],
    ops: ['op_fetch'],
    tsApi: {
      namespace: 'net',
      methods: [
        'fetch(url: string, opts?: FetchOptions): Promise<Response>',
        'get(url: string): Promise<string>',
        'postJson(url: string, body: any): Promise<any>',
      ]
    }
  },
  'crypto': {
    commands: ['crypto_hash', 'crypto_random_bytes'],
    ops: [],
    tsApi: {
      namespace: 'crypto',
      methods: [
        "hash(data: Uint8Array, algo: 'sha256' | 'sha512' | 'blake3'): Promise<string>",
        'randomBytes(n: number): Uint8Array',
      ]
    }
  },
  'compress': {
    commands: ['compress_gzip', 'compress_gunzip', 'compress_zstd'],
    ops: [],
    tsApi: {
      namespace: 'compress',
      methods: [
        'gzip(data: Uint8Array): Promise<Uint8Array>',
        'gunzip(data: Uint8Array): Promise<Uint8Array>',
      ]
    }
  },
  'serial': {
    commands: ['serial_list', 'serial_open', 'serial_read', 'serial_write', 'serial_close'],
    ops: [],
    tsApi: {
      namespace: 'serial',
      methods: [
        'list(): Promise<SerialPort[]>',
        'open(path: string, baud: number): Promise<SerialHandle>',
      ]
    }
  },
  'clipboard': {
    commands: ['clipboard_read', 'clipboard_write'],
    ops: ['op_clipboard_read', 'op_clipboard_write'],
    tsApi: {
      namespace: 'clipboard',
      methods: [
        'read(): Promise<string>',
        'write(text: string): Promise<void>',
      ]
    }
  },
};

/**
 * Given a list of capability strings, return the aggregate set of allowed commands.
 */
export function resolveCommands(capabilities) {
  const commands = new Set();
  for (const cap of capabilities) {
    const mapping = CAPABILITY_MAP[cap];
    if (mapping) {
      for (const cmd of mapping.commands) commands.add(cmd);
    }
  }
  return [...commands];
}

/**
 * Given a list of capability strings, generate a TypeScript declaration for the rvst global.
 */
export function generateCapabilityDts(capabilities) {
  const namespaces = {};
  for (const cap of capabilities) {
    const mapping = CAPABILITY_MAP[cap];
    if (!mapping?.tsApi) continue;
    const ns = mapping.tsApi.namespace;
    if (!namespaces[ns]) namespaces[ns] = [];
    namespaces[ns].push(...mapping.tsApi.methods);
  }

  let output = '// Auto-generated from rvst.config.js capabilities\n\n';
  output += 'interface FileEntry { name: string; size: number; modified: number; isDir: boolean; }\n';
  output += 'interface FileStat { size: number; modified: number; created: number; isDir: boolean; }\n';
  output += 'interface FileChange { path: string; kind: string; }\n';
  output += 'interface FetchOptions { method?: string; headers?: Record<string, string>; body?: string; }\n';
  output += 'interface SerialPort { path: string; name: string; }\n';
  output += 'interface SerialHandle { read(): Promise<Uint8Array>; write(data: Uint8Array): Promise<void>; close(): Promise<void>; }\n\n';

  output += 'declare const rvst: {\n';
  for (const [ns, methods] of Object.entries(namespaces)) {
    output += `  ${ns}: {\n`;
    for (const method of methods) {
      output += `    ${method};\n`;
    }
    output += `  };\n`;
  }
  output += '};\n';

  return output;
}

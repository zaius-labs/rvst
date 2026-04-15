import { time, record } from '../harness.js';

/**
 * IPC stress workload. Tests native command and file I/O performance.
 */
export function runIpcStress() {
  // File write/read at different sizes
  for (const sizeKb of [1, 100, 1000, 10000]) {
    const data = 'x'.repeat(sizeKb * 1024);
    const path = '/tmp/rvst-bench-ipc-test.txt';

    const writeLabel = `file_write_${sizeKb}kb`;
    const readLabel = `file_read_${sizeKb}kb`;

    // Write
    if (globalThis.__rvst?.fs?.writeText) {
      time(writeLabel, () => { globalThis.__rvst.fs.writeText(path, data); });
      time(readLabel, () => { globalThis.__rvst.fs.readText(path); });
    } else if (globalThis.benchAPI?.writeFile) {
      time(writeLabel, () => { globalThis.benchAPI.writeFile(path, data); });
      // Electron preload doesn't expose readFile — skip read
    }
  }

  // Command round-trips (if __host.invoke_command exists)
  if (globalThis.__host?.invoke_command) {
    // Register a no-op echo command for benchmarking
    // (The handler should already be registered by the Rust side)

    // 1K round trips
    const n1k = 1000;
    const start1k = performance.now();
    for (let i = 0; i < n1k; i++) {
      globalThis.__host.invoke_command('__bench_echo', JSON.stringify({ i }));
    }
    record('ipc_1k_total_ms', performance.now() - start1k);
    record('ipc_1k_avg_us', ((performance.now() - start1k) / n1k) * 1000);

    // 10K round trips
    const n10k = 10000;
    const start10k = performance.now();
    for (let i = 0; i < n10k; i++) {
      globalThis.__host.invoke_command('__bench_echo', '{}');
    }
    record('ipc_10k_total_ms', performance.now() - start10k);
    record('ipc_10k_avg_us', ((performance.now() - start10k) / n10k) * 1000);

    // 1MB payload
    const bigPayload = JSON.stringify({ data: 'x'.repeat(1024 * 1024) });
    time('ipc_1mb_payload_ms', () => {
      globalThis.__host.invoke_command('__bench_echo', bigPayload);
    });
  }
}

// Benchmark timing utilities.
// Results written to /tmp/rvst-bench-results.json.

const RESULTS_FILE = '/tmp/rvst-bench-results.json';
const results = {};

// Record mount start immediately when this module loads
const MOUNT_START = performance.now();

/** Record first paint — call from first rAF after mount. */
export function markFirstPaint() {
  results['first_paint_ms'] = performance.now() - MOUNT_START;
}

/** Measure synchronous JS execution time. */
export function time(label, fn) {
  const start = performance.now();
  fn();
  const ms = performance.now() - start;
  results[label] = ms;
  return ms;
}

/** Measure from mutation through next rendered frame. */
export function timeToFrame(label, fn) {
  return new Promise(resolve => {
    const start = performance.now();
    fn();
    requestAnimationFrame(() => {
      const ms = performance.now() - start;
      results[label] = ms;
      resolve(ms);
    });
  });
}

/** Measure sustained FPS over a duration. */
export function measureFps(durationMs = 5000) {
  return new Promise(resolve => {
    let frames = 0;
    const start = performance.now();
    function tick() {
      frames++;
      if (performance.now() - start < durationMs) {
        requestAnimationFrame(tick);
      } else {
        const fps = frames / (durationMs / 1000);
        results['sustained_fps'] = fps;
        resolve(fps);
      }
    }
    requestAnimationFrame(tick);
  });
}

/** Measure file I/O speed (write 1MB, read it back). */
export function measureFileIO() {
  const testPath = '/tmp/rvst-bench-io-test.txt';
  const data = 'x'.repeat(1024 * 1024); // 1MB

  // Write
  const ws = performance.now();
  let writeOk = false;
  if (globalThis.__rvst?.fs?.writeText) {
    globalThis.__rvst.fs.writeText(testPath, data);
    writeOk = true;
  } else if (globalThis.benchAPI?.writeFile) {
    globalThis.benchAPI.writeFile(testPath, data);
    writeOk = true;
  }
  if (writeOk) {
    results['fs_write_1mb_ms'] = performance.now() - ws;
  }

  // Read
  const rs = performance.now();
  let readOk = false;
  if (globalThis.__rvst?.fs?.readText) {
    globalThis.__rvst.fs.readText(testPath);
    readOk = true;
  }
  // Electron/Tauri don't expose readText in our preload — skip for them
  if (readOk) {
    results['fs_read_1mb_ms'] = performance.now() - rs;
  }
}

function writeResults() {
  const json = JSON.stringify(results, null, 2);

  if (globalThis.__rvst?.fs?.writeText) {
    globalThis.__rvst.fs.writeText(RESULTS_FILE, json);
    return true;
  }
  if (globalThis.benchAPI?.writeFile) {
    globalThis.benchAPI.writeFile(RESULTS_FILE, json);
    return true;
  }
  if (globalThis.__TAURI_INTERNALS__) {
    globalThis.__TAURI_INTERNALS__.invoke('write_bench_results', { path: RESULTS_FILE, data: json });
    return true;
  }
  return false;
}

export function done() {
  // Run file I/O benchmark right before writing final results
  measureFileIO();

  writeResults();
  // Don't auto-close — let the external runner kill us after reading results.
  // This avoids race conditions between file write and process exit.
}

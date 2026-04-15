const results = {};
const marks = {};

export function mark(label) {
  marks[label] = performance.now();
}

export function measure(label, startMark) {
  const start = startMark ? marks[startMark] : 0;
  const ms = performance.now() - start;
  results[label] = ms;
  return ms;
}

export function time(label, fn) {
  const start = performance.now();
  fn();
  const ms = performance.now() - start;
  results[label] = ms;
  return ms;
}

export async function timeAsync(label, fn) {
  const start = performance.now();
  await fn();
  const ms = performance.now() - start;
  results[label] = ms;
  return ms;
}

export function measureFps(durationMs = 3000) {
  return new Promise(resolve => {
    let frames = 0;
    const start = performance.now();
    function tick() {
      frames++;
      if (performance.now() - start < durationMs) {
        requestAnimationFrame(tick);
      } else {
        const fps = frames / (durationMs / 1000);
        results['fps'] = fps;
        resolve(fps);
      }
    }
    requestAnimationFrame(tick);
  });
}

export function record(label, value) {
  results[label] = value;
}

export function getResults() {
  return { ...results };
}

export function writeResults() {
  const json = JSON.stringify(results, null, 2);
  if (globalThis.__rvst?.fs?.writeText) {
    globalThis.__rvst.fs.writeText('/tmp/rvst-bench-results.json', json);
  } else if (globalThis.benchAPI?.writeFile) {
    globalThis.benchAPI.writeFile('/tmp/rvst-bench-results.json', json);
  } else if (globalThis.__TAURI_INTERNALS__) {
    globalThis.__TAURI_INTERNALS__.invoke('write_bench_results', { path: '/tmp/rvst-bench-results.json', data: json });
  }
}

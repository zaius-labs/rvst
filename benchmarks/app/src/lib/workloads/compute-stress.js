import { time, record } from '../harness.js';

/**
 * Compute stress workload. Tests raw JS performance in the runtime.
 * @param {object[]} dataset - The full dataset
 */
export function runComputeStress(dataset) {
  // Filter at different scales
  for (const scale of [1000, 10000, 50000]) {
    const data = dataset.slice(0, scale);
    if (data.length < scale) continue; // skip if dataset too small

    time(`filter_${scale}`, () => {
      data.filter(r => r.salary > 100000 && r.status === 'active');
    });
  }

  // Sort at scale
  for (const scale of [1000, 10000, 50000]) {
    const data = dataset.slice(0, scale);
    if (data.length < scale) continue;

    time(`sort_${scale}`, () => {
      [...data].sort((a, b) => b.salary - a.salary);
    });
  }

  // JSON round-trip
  const jsonStr = JSON.stringify(dataset);
  record('json_stringify_bytes', jsonStr.length);

  time('json_stringify', () => {
    JSON.stringify(dataset);
  });

  time('json_parse', () => {
    JSON.parse(jsonStr);
  });

  // Array operations
  time('reduce_sum', () => {
    dataset.reduce((sum, r) => sum + r.salary, 0);
  });

  time('map_transform', () => {
    dataset.map(r => ({ ...r, salary: r.salary * 1.1 }));
  });
}

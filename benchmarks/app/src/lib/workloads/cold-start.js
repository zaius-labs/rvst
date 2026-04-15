import { mark, measure, record } from '../harness.js';

/**
 * Cold start workload. Called once after DataExplorer mounts.
 * Records: first_paint_ms, interactive_ms
 */
export function runColdStart() {
  // Mark that we're interactive (mount completed, data loaded)
  measure('interactive_ms', 'mount_start');

  // First paint was already marked by harness during mount
  // The external runner measures process-launch-to-first-output separately
}

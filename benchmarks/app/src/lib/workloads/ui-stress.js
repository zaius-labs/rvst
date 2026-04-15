import { record } from '../harness.js';

/**
 * UI stress workload. Operates on the DataExplorer's search/sort functions.
 * @param {object} opts
 * @param {function} opts.search - Search function (term) => void
 * @param {function} opts.sort - Sort function (col) => void
 * @param {object[]} opts.rows - Current visible rows
 */
export function runUiStress({ search, sort }) {
  const searchTerms = ['alice', 'eng', 'sf', 'active', 'bob', '2024', 'marketing', 'pending', 'a', ''];
  const sortCols = ['name', 'salary', 'score', 'department', 'city', 'id'];

  // Search stress — 10 queries, measure each
  const searchTimes = [];
  for (const term of searchTerms) {
    const start = performance.now();
    search(term);
    searchTimes.push(performance.now() - start);
  }
  searchTimes.sort((a, b) => a - b);
  record('search_p50_ms', searchTimes[Math.floor(searchTimes.length * 0.5)]);
  record('search_p95_ms', searchTimes[Math.floor(searchTimes.length * 0.95)]);
  record('search_max_ms', searchTimes[searchTimes.length - 1]);

  // Sort stress — sort each column
  const sortTimes = [];
  for (const col of sortCols) {
    const start = performance.now();
    sort(col);
    sortTimes.push(performance.now() - start);
  }
  sortTimes.sort((a, b) => a - b);
  record('sort_p50_ms', sortTimes[Math.floor(sortTimes.length * 0.5)]);
  record('sort_max_ms', sortTimes[sortTimes.length - 1]);
}

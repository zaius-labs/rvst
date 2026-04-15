#!/usr/bin/env python3
"""Benchmark runner v2 — data explorer stress test across RVST, Electron, Tauri."""

import subprocess, time, json, sys, os, statistics, argparse, csv

RESULTS_FILE = '/tmp/rvst-bench-results.json'


def parse_args():
    p = argparse.ArgumentParser(description='Benchmark runner v2')
    p.add_argument('--rvst-bin', required=True)
    p.add_argument('--rvst-bundle', required=True)
    p.add_argument('--electron-dir', required=True)
    p.add_argument('--tauri-bin', required=True)
    p.add_argument('--output', default='benchmarks/results/latest.json')
    p.add_argument('--cold-runs', type=int, default=5, help='Cold launch iterations (default 5, use 20 for full)')
    return p.parse_args()


def clear_results():
    try:
        os.remove(RESULTS_FILE)
    except FileNotFoundError:
        pass


def get_tree_rss(pid):
    """Get total RSS of process tree in KB."""
    try:
        ps = subprocess.run(
            ['ps', '-A', '-o', 'pid=,ppid=,rss='],
            capture_output=True, text=True, timeout=2
        )
        procs = {}
        for line in ps.stdout.strip().split('\n'):
            parts = line.split()
            if len(parts) >= 3:
                try:
                    procs[int(parts[0])] = (int(parts[1]), int(parts[2]))
                except ValueError:
                    pass
        tree = {pid}
        changed = True
        while changed:
            changed = False
            for p, (ppid, _) in procs.items():
                if ppid in tree and p not in tree:
                    tree.add(p)
                    changed = True
        return sum(procs[p][1] for p in tree if p in procs)
    except Exception:
        return 0


def run_once(cmd, cwd=None, timeout=120):
    """Run benchmark once. Returns (elapsed_s, internal_metrics or None)."""
    clear_results()
    start = time.time()
    proc = subprocess.Popen(cmd, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, cwd=cwd)

    # Wait for results file
    got_results = False
    while time.time() - start < timeout:
        if os.path.exists(RESULTS_FILE):
            time.sleep(0.3)
            got_results = True
            break
        if proc.poll() is not None:
            time.sleep(0.5)
            got_results = os.path.exists(RESULTS_FILE)
            break
        time.sleep(0.5)

    elapsed = time.time() - start

    if proc.poll() is None:
        proc.terminate()
        try:
            proc.wait(timeout=5)
        except Exception:
            proc.kill()
            proc.wait()

    metrics = None
    if got_results:
        try:
            with open(RESULTS_FILE) as f:
                metrics = json.load(f)
        except Exception:
            pass

    return elapsed, metrics


def measure_memory(cmd, cwd=None, duration=15):
    """Run and sample process tree RSS. Returns (idle_mb, peak_mb)."""
    proc = subprocess.Popen(cmd, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, cwd=cwd)
    time.sleep(3)  # settle
    samples = []
    start = time.time()
    while time.time() - start < duration:
        rss = get_tree_rss(proc.pid)
        if rss > 0:
            samples.append(rss)
        time.sleep(0.5)
    proc.terminate()
    try:
        proc.wait(timeout=5)
    except Exception:
        proc.kill()
        proc.wait()
    if not samples:
        return 0, 0
    return round(min(samples) / 1024, 1), round(max(samples) / 1024, 1)


def binary_size(path):
    if os.path.isfile(path):
        return os.path.getsize(path)
    total = 0
    for dp, _, fns in os.walk(path):
        for f in fns:
            fp = os.path.join(dp, f)
            if os.path.isfile(fp):
                total += os.path.getsize(fp)
    return total


def percentile(values, p):
    if not values:
        return 0
    s = sorted(values)
    k = (len(s) - 1) * (p / 100)
    f = int(k)
    c = f + 1 if f + 1 < len(s) else f
    return s[f] + (s[c] - s[f]) * (k - f)


def bench_target(name, cmd, cwd, bin_path, cold_runs):
    print(f'\n{"="*60}')
    print(f'  {name.upper()}')
    print(f'{"="*60}')

    # Cold starts
    startups = []
    all_metrics = []
    for i in range(cold_runs):
        print(f'  run {i+1}/{cold_runs}...', end=' ', flush=True)
        elapsed, metrics = run_once(cmd, cwd=cwd)
        startups.append(elapsed * 1000)
        if metrics:
            all_metrics.append(metrics)
        n = len(metrics) if metrics else 0
        print(f'{elapsed:.2f}s, {n} metrics')

    # Memory
    print(f'  measuring memory (15s)...', flush=True)
    idle_mb, peak_mb = measure_memory(cmd, cwd=cwd)

    # Binary size
    bsize = binary_size(bin_path)

    # Aggregate internal metrics
    merged = {}
    for m in all_metrics:
        for k, v in m.items():
            if isinstance(v, (int, float)):
                merged.setdefault(k, []).append(v)

    result = {
        'cold_startup_p50_ms': round(percentile(startups, 50), 1),
        'cold_startup_p95_ms': round(percentile(startups, 95), 1),
        'cold_startup_min_ms': round(min(startups), 1) if startups else 0,
        'memory_idle_mb': idle_mb,
        'memory_peak_mb': peak_mb,
        'binary_size_mb': round(bsize / (1024 * 1024), 1),
        'internal_metrics': {
            k: round(statistics.median(v), 2) for k, v in merged.items()
        },
    }

    print(f'  startup p50={result["cold_startup_p50_ms"]}ms  memory={idle_mb}MB  binary={result["binary_size_mb"]}MB')
    return result


def main():
    args = parse_args()

    targets = {
        'rvst': {
            'cmd': [args.rvst_bin, args.rvst_bundle],
            'cwd': None,
            'bin_path': args.rvst_bin,
        },
        'electron': {
            'cmd': ['npx', 'electron', '.'],
            'cwd': args.electron_dir,
            'bin_path': os.path.join(args.electron_dir, 'node_modules', 'electron', 'dist'),
        },
        'tauri': {
            'cmd': [args.tauri_bin],
            'cwd': None,
            'bin_path': args.tauri_bin,
        },
    }

    results = {}
    for name, cfg in targets.items():
        results[name] = bench_target(name, cfg['cmd'], cfg['cwd'], cfg['bin_path'], args.cold_runs)

    # Write JSON
    os.makedirs(os.path.dirname(args.output) or '.', exist_ok=True)
    with open(args.output, 'w') as f:
        json.dump(results, f, indent=2)

    # Write CSV
    csv_path = args.output.replace('.json', '.csv')
    with open(csv_path, 'w', newline='') as f:
        writer = csv.writer(f)
        header = ['metric'] + list(results.keys())
        writer.writerow(header)
        # System metrics
        for key in ['cold_startup_p50_ms', 'cold_startup_p95_ms', 'memory_idle_mb', 'memory_peak_mb', 'binary_size_mb']:
            row = [key] + [results[t].get(key, '') for t in results]
            writer.writerow(row)
        # Internal metrics (union of all keys)
        all_internal = set()
        for t in results:
            all_internal.update(results[t].get('internal_metrics', {}).keys())
        for key in sorted(all_internal):
            row = [key] + [results[t].get('internal_metrics', {}).get(key, '') for t in results]
            writer.writerow(row)

    print(f'\nJSON: {args.output}')
    print(f'CSV:  {csv_path}')


if __name__ == '__main__':
    main()

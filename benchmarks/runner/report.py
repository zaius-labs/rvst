#!/usr/bin/env python3
"""Generate comparison chart and markdown table from benchmark results v2."""

import json, sys, os

try:
    import matplotlib
    matplotlib.use('Agg')
    import matplotlib.pyplot as plt
    HAS_MPL = True
except ImportError:
    HAS_MPL = False


def load_results(path):
    with open(path) as f:
        return json.load(f)


def generate_chart(results, out_path):
    if not HAS_MPL:
        print('matplotlib not installed — pip3 install matplotlib')
        return

    targets = list(results.keys())
    colors = {'rvst': '#89b4fa', 'electron': '#f38ba8', 'tauri': '#a6e3a1'}

    # System metrics
    sys_metrics = [
        ('cold_startup_p50_ms', 'Startup p50 (ms)'),
        ('memory_idle_mb', 'Memory Idle (MB)'),
        ('memory_peak_mb', 'Memory Peak (MB)'),
        ('binary_size_mb', 'Binary Size (MB)'),
    ]

    fig, axes = plt.subplots(1, len(sys_metrics), figsize=(4 * len(sys_metrics), 5))
    fig.patch.set_facecolor('#1e1e2e')
    fig.suptitle('RVST vs Electron vs Tauri', color='#cdd6f4', fontsize=14, fontweight='bold')

    for ax, (key, label) in zip(axes, sys_metrics):
        vals = [results[t].get(key, 0) for t in targets]
        bars = ax.bar(targets, vals, color=[colors.get(t, '#cdd6f4') for t in targets])
        ax.set_title(label, color='#cdd6f4', fontsize=11)
        ax.set_facecolor('#1e1e2e')
        ax.tick_params(colors='#6c7086')
        for spine in ['top', 'right']:
            ax.spines[spine].set_visible(False)
        for spine in ['bottom', 'left']:
            ax.spines[spine].set_color('#45475a')
        for bar, val in zip(bars, vals):
            ax.text(bar.get_x() + bar.get_width() / 2, bar.get_height() + 0.5,
                    str(val), ha='center', va='bottom', color='#cdd6f4', fontsize=9)

    plt.tight_layout(rect=[0, 0, 1, 0.93])
    plt.savefig(out_path, dpi=150, facecolor='#1e1e2e', bbox_inches='tight')
    print(f'Chart: {out_path}')


def generate_markdown(results):
    targets = list(results.keys())
    header = '| Metric | ' + ' | '.join(t.upper() for t in targets) + ' |'
    sep = '|--------|' + '|'.join(['--------:'] * len(targets)) + '|'

    sys_rows = [
        ('Startup p50', 'cold_startup_p50_ms', 'ms', False),
        ('Startup p95', 'cold_startup_p95_ms', 'ms', False),
        ('Memory (idle)', 'memory_idle_mb', 'MB', False),
        ('Memory (peak)', 'memory_peak_mb', 'MB', False),
        ('Binary size', 'binary_size_mb', 'MB', False),
    ]

    lines = [header, sep]
    for label, key, unit, higher in sys_rows:
        vals = [results[t].get(key, 0) for t in targets]
        nums = [v for v in vals if isinstance(v, (int, float)) and v > 0]
        best = max(nums) if higher else min(nums) if nums else None
        cells = []
        for v in vals:
            s = f'{v} {unit}'
            if v == best and v > 0:
                s = f'**{s}**'
            cells.append(s)
        lines.append(f'| {label} | ' + ' | '.join(cells) + ' |')

    # Internal metrics
    all_internal = set()
    for t in targets:
        all_internal.update(results[t].get('internal_metrics', {}).keys())

    if all_internal:
        lines.append('')
        lines.append('| Internal Metric | ' + ' | '.join(t.upper() for t in targets) + ' |')
        lines.append(sep)
        for metric in sorted(all_internal):
            vals = [results[t].get('internal_metrics', {}).get(metric, 'N/A') for t in targets]
            nums = [v for v in vals if isinstance(v, (int, float))]
            is_higher = 'fps' in metric.lower() or 'throughput' in metric.lower()
            best = max(nums) if is_higher else min(nums) if nums else None
            cells = []
            for v in vals:
                s = str(v) if v != 'N/A' else 'N/A'
                if v == best:
                    s = f'**{s}**'
                cells.append(s)
            lines.append(f'| {metric} | ' + ' | '.join(cells) + ' |')

    return '\n'.join(lines)


def main():
    path = sys.argv[1] if len(sys.argv) > 1 else 'benchmarks/results/latest.json'
    results = load_results(path)
    out_dir = os.path.dirname(path)

    generate_chart(results, os.path.join(out_dir, 'comparison.png'))

    md = generate_markdown(results)
    print('\n' + md)
    md_path = os.path.join(out_dir, 'comparison.md')
    with open(md_path, 'w') as f:
        f.write(md)
    print(f'\nMarkdown: {md_path}')


if __name__ == '__main__':
    main()

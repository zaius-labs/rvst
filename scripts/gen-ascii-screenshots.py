#!/usr/bin/env python3
"""Generate terminal-style PNG screenshots of RVST ASCII and analyze modes."""

import subprocess
import os

from rich.console import Console
from rich.text import Text

RVST = os.path.join(os.path.dirname(__file__), "..", "target", "release", "rvst")
BUNDLE = os.path.join(
    os.path.dirname(__file__),
    "..",
    "packages",
    "create-rvst",
    "templates",
    "dashboard",
    "dist",
    "titlebar.js",
)
CSS = BUNDLE.replace(".js", ".css")
ASSETS = os.path.join(os.path.dirname(__file__), "..", "assets")

# ASCII visualization modes (use FORCE_COLOR=1 for colored output)
ASCII_MODES = {
    "ascii_structure": ("--ascii=structure", "rvst --ascii=structure"),
    "ascii_render": ("--ascii=render", "rvst --ascii=render"),
    "ascii_overlay": ("--ascii=overlay", "rvst --ascii=overlay"),
    "ascii_validate": ("--ascii=validate", "rvst --ascii=validate"),
    "ascii_tree": ("--ascii", "rvst --ascii (semantic tree)"),
    "ascii_tree_css": ("--ascii=tree:css", "rvst --ascii=tree:css"),
    "ascii_tree_layout": ("--ascii=tree:layout", "rvst --ascii=tree:layout"),
    "ascii_tree_full": ("--ascii=tree:full", "rvst --ascii=tree:full"),
}

# Analyze modes (subcommand style)
ANALYZE_MODES = {
    "analyze_diagnostics": ("diagnostics", "rvst analyze diagnostics"),
    "analyze_layout": ("layout", "rvst analyze layout"),
    "analyze_a11y": ("a11y", "rvst analyze a11y"),
    "analyze_contrast": ("contrast", "rvst analyze contrast"),
    "analyze_heatmap": ("heatmap", "rvst analyze heatmap"),
}


def run_ascii(flag, force_color=True):
    env = os.environ.copy()
    if force_color:
        env["FORCE_COLOR"] = "1"
    result = subprocess.run(
        [RVST, flag, BUNDLE, CSS],
        capture_output=True,
        text=True,
        env=env,
    )
    return result.stdout


def run_analyze(category, force_color=True):
    env = os.environ.copy()
    if force_color:
        env["FORCE_COLOR"] = "1"
    result = subprocess.run(
        [RVST, "analyze", category, BUNDLE, CSS],
        capture_output=True,
        text=True,
        env=env,
    )
    return result.stdout


def render_ansi_svg(text, title, width=160):
    """Render text (possibly with ANSI codes) to SVG via Rich."""
    console = Console(record=True, width=width, force_terminal=True)
    ansi_text = Text.from_ansi(text)
    console.print(ansi_text, highlight=False)
    return console.export_svg(title=title)


def render_plain_svg(text, title, width=160):
    """Render plain text to SVG via Rich."""
    console = Console(record=True, width=width, force_terminal=True)
    console.print(Text(text), highlight=False)
    return console.export_svg(title=title)


def svg_to_png(svg_path, png_path):
    subprocess.run(
        ["rsvg-convert", "-o", png_path, svg_path],
        check=True,
    )


def generate(name, output, title, width=160, has_ansi=False):
    if not output.strip():
        print(f"  WARNING: no output for {name}, skipping")
        return

    svg_path = os.path.join(ASSETS, f"{name}.svg")
    png_path = os.path.join(ASSETS, f"{name}.png")

    if has_ansi:
        svg = render_ansi_svg(output.rstrip(), title, width)
    else:
        svg = render_plain_svg(output.rstrip(), title, width)

    with open(svg_path, "w") as f:
        f.write(svg)

    svg_to_png(svg_path, png_path)
    os.remove(svg_path)
    print(f"  -> {png_path}")


def main():
    os.makedirs(ASSETS, exist_ok=True)

    # Generate ASCII mode screenshots
    for name, (flag, title) in ASCII_MODES.items():
        print(f"Generating {name}...")
        # Try colored first, fall back to plain
        output = run_ascii(flag, force_color=True)
        has_ansi = "\x1b[" in output
        if not has_ansi:
            output = run_ascii(flag, force_color=False)
        width = 180 if "tree" in name else 160
        generate(name, output, title, width, has_ansi)

    # Generate analyze mode screenshots
    for name, (category, title) in ANALYZE_MODES.items():
        print(f"Generating {name}...")
        output = run_analyze(category, force_color=True)
        has_ansi = "\x1b[" in output
        if not has_ansi:
            output = run_analyze(category, force_color=False)
        generate(name, output, title, 120, has_ansi)

    print("Done!")


if __name__ == "__main__":
    main()

#!/usr/bin/env python3
"""Generate LinkedIn carousel PDF for RVST announcement."""

from reportlab.lib.pagesizes import landscape
from reportlab.lib.units import inch
from reportlab.pdfgen import canvas
from reportlab.lib.colors import Color, white, HexColor
from PIL import Image
import os

ASSETS = os.path.join(os.path.dirname(__file__), "..", "assets")
OUT = os.path.join(os.path.dirname(__file__), "..", "assets", "rvst-carousel.pdf")

# LinkedIn carousel: 1080x1350 (4:5 portrait)
W, H = 1080, 1350
BG = HexColor("#1e1e2e")
FG = white
ACCENT = HexColor("#89b4fa")
DIM = HexColor("#6c7086")
PADDING = 60


def draw_bg(c):
    c.setFillColor(BG)
    c.rect(0, 0, W, H, fill=1, stroke=0)


def draw_text(c, text, x, y, size=42, color=FG, font="Helvetica-Bold", max_width=None):
    c.setFont(font, size)
    c.setFillColor(color)
    if max_width:
        # Simple word wrap
        words = text.split()
        lines = []
        current = ""
        for word in words:
            test = f"{current} {word}".strip()
            if c.stringWidth(test, font, size) > max_width:
                lines.append(current)
                current = word
            else:
                current = test
        if current:
            lines.append(current)
        for i, line in enumerate(lines):
            c.drawString(x, y - i * (size * 1.3), line)
        return len(lines)
    else:
        c.drawString(x, y, text)
        return 1


def draw_image_fitted(c, img_path, x, y, max_w, max_h):
    """Draw image scaled to fit within max_w x max_h, centered at (x, y) as bottom-left."""
    img = Image.open(img_path)
    iw, ih = img.size
    scale = min(max_w / iw, max_h / ih)
    draw_w = iw * scale
    draw_h = ih * scale
    # Center horizontally and vertically within the box
    cx = x + (max_w - draw_w) / 2
    cy = y + (max_h - draw_h) / 2
    c.drawImage(img_path, cx, cy, draw_w, draw_h, preserveAspectRatio=True)
    return draw_w, draw_h


def draw_pill(c, text, x, y, size=24, color=ACCENT):
    """Draw a rounded pill label."""
    c.setFont("Helvetica", size)
    tw = c.stringWidth(text, "Helvetica", size)
    pw, ph = tw + 24, size + 16
    c.setFillColor(Color(color.red, color.green, color.blue, 0.15))
    c.roundRect(x, y - 4, pw, ph, 8, fill=1, stroke=0)
    c.setFillColor(color)
    c.drawString(x + 12, y + 4, text)
    return pw


def slide_1(c):
    """Hook + dashboard screenshot."""
    draw_bg(c)

    # Hook text at top
    draw_text(c, "500MB runtime", PADDING, H - 100, size=56)
    draw_text(c, "to render a button.", PADDING, H - 170, size=56)
    draw_text(c, "That's Electron.", PADDING, H - 240, size=36, color=DIM, font="Helvetica")

    # Dashboard screenshot - large, pushed up
    img_path = os.path.join(ASSETS, "screenshot_dashboard.png")
    draw_image_fitted(c, img_path, PADDING, 40, W - PADDING * 2, H - 310)

    # Subtle label
    draw_text(c, "RVST", W - PADDING - 80, 30, size=18, color=DIM, font="Helvetica")


def slide_2(c):
    """Architecture / stack."""
    draw_bg(c)

    draw_text(c, "The stack.", PADDING, H - 100, size=48)
    draw_text(c, "No Chromium. No IPC. No webview.", PADDING, H - 150, size=24, color=DIM, font="Helvetica")

    # Stack flow - vertical boxes with arrows
    steps = [
        ("Svelte 5", "Your components", ACCENT),
        ("Vite", "Compiles to JS bundle", HexColor("#a6e3a1")),
        ("Deno", "Executes JavaScript", HexColor("#f9e2af")),
        ("Rust", "DOM tree + CSS cascade", HexColor("#fab387")),
        ("Taffy", "Flexbox & Grid layout", HexColor("#cba6f7")),
        ("Vello + wgpu", "GPU vector rendering", HexColor("#f38ba8")),
        ("winit", "Native window", HexColor("#89b4fa")),
    ]

    box_w = W - PADDING * 2
    # Calculate box size to fill available space
    available_h = H - 240  # below subtitle
    gap = 14
    box_h = (available_h - gap * (len(steps) - 1)) // len(steps)
    start_y = H - 210

    for i, (name, desc, color) in enumerate(steps):
        y = start_y - i * (box_h + gap)

        # Box background
        c.setFillColor(Color(color.red, color.green, color.blue, 0.1))
        c.roundRect(PADDING, y, box_w, box_h, 12, fill=1, stroke=0)

        # Left color bar
        c.setFillColor(color)
        c.roundRect(PADDING, y, 6, box_h, 3, fill=1, stroke=0)

        # Name
        c.setFont("Helvetica-Bold", 28)
        c.setFillColor(FG)
        c.drawString(PADDING + 24, y + box_h - 38, name)

        # Description
        c.setFont("Helvetica", 20)
        c.setFillColor(DIM)
        c.drawString(PADDING + 24, y + 16, desc)

        # Arrow between boxes
        if i < len(steps) - 1:
            c.setFillColor(HexColor("#45475a"))
            arrow_x = W / 2
            arrow_y = y - gap / 2
            c.setFont("Helvetica", 20)
            c.drawCentredString(arrow_x, arrow_y - 6, "↓")


def slide_image(c, title, subtitle, img_filename):
    """Generic slide: title + subtitle at top, image fills the rest."""
    draw_bg(c)

    draw_text(c, title, PADDING, H - 90, size=44)
    draw_text(c, subtitle, PADDING, H - 140, size=22, color=DIM, font="Helvetica")

    img_path = os.path.join(ASSETS, img_filename)
    # Image fills from just below subtitle to near bottom
    img_top = H - 180
    img_bottom = 40
    img_h = img_top - img_bottom
    draw_image_fitted(c, img_path, 30, img_bottom, W - 60, img_h)


def slide_3(c):
    slide_image(c, "Your UI as ASCII.", "Box-drawing structure map", "ascii_structure.png")


def slide_4(c):
    slide_image(c, "Semantic trees.", "CSS classes + computed properties", "ascii_tree_css.png")


def slide_5(c):
    slide_image(c, "WCAG contrast.", "Sampled from actual rendered pixels", "analyze_contrast.png")


def slide_6(c):
    slide_image(c, "Accessibility audit.", "Buttons, handlers, roles — all checked", "analyze_a11y.png")


def slide_7(c):
    """Heatmap + CTA."""
    draw_bg(c)

    draw_text(c, "Density heatmap.", PADDING, H - 90, size=44)
    draw_text(c, "Where your UI clusters", PADDING, H - 140, size=22, color=DIM, font="Helvetica")

    # Heatmap fills upper portion
    img_path = os.path.join(ASSETS, "analyze_heatmap.png")
    draw_image_fitted(c, img_path, 30, 380, W - 60, H - 560)

    # CTA in lower portion
    c.setFillColor(HexColor("#313244"))
    c.roundRect(PADDING, 40, W - PADDING * 2, 310, 16, fill=1, stroke=0)

    draw_text(c, "Svelte is the language.", PADDING + 40, 290, size=30)
    draw_text(c, "Rust is the kernel.", PADDING + 40, 248, size=30)
    draw_text(c, "Your app owns every pixel.", PADDING + 40, 206, size=30, color=ACCENT)

    c.setFont("Helvetica", 20)
    c.setFillColor(DIM)
    c.drawString(PADDING + 40, 100, "github.com/zaius-labs/rvst")


def main():
    c = canvas.Canvas(OUT, pagesize=(W, H))

    slides = [slide_1, slide_2, slide_3, slide_4, slide_5, slide_6, slide_7]

    for i, slide_fn in enumerate(slides):
        slide_fn(c)
        if i < len(slides) - 1:
            c.showPage()

    c.save()
    print(f"Generated: {OUT}")
    print(f"Slides: {len(slides)}")


if __name__ == "__main__":
    main()

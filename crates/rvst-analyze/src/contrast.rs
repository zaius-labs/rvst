use crate::report::{AnalysisReport, Finding, Severity};
use owo_colors::OwoColorize;
use rvst_snapshot::{NodeSnapshot, RectSnapshot};
use rvst_snapshot::SceneSnapshot;

/// A single contrast analysis entry for a text node.
#[derive(Debug, Clone)]
pub struct ContrastEntry {
    pub node_id: u32,
    pub text: String,
    pub fg_color: (u8, u8, u8),
    pub bg_color: (u8, u8, u8),
    pub ratio: f64,
    pub large_text: bool,
    pub aa_pass: bool,
    pub aaa_pass: bool,
}

/// Report containing WCAG 2.1 contrast analysis findings.
#[derive(Debug)]
pub struct ContrastReport {
    pub findings_list: Vec<Finding>,
    pub entries: Vec<ContrastEntry>,
    pub aa_pass: usize,
    pub aa_fail: usize,
    pub aaa_pass: usize,
    pub aaa_fail: usize,
}

impl AnalysisReport for ContrastReport {
    fn findings(&self) -> &[Finding] {
        &self.findings_list
    }

    fn to_colored_string(&self) -> String {
        let mut out = String::new();
        out.push_str(&format!("\n{}\n\n", "━━ Contrast (WCAG 2.1) ━━".bold()));

        for entry in &self.entries {
            let (label, color_fn): (&str, fn(&str) -> String) = if !entry.aa_pass {
                ("FAIL", |s| s.red().bold().to_string())
            } else if !entry.aaa_pass {
                ("WARN", |s| s.yellow().bold().to_string())
            } else {
                ("PASS", |s| s.green().bold().to_string())
            };

            let truncated = truncate_text(&entry.text, 24);
            let fg = entry.fg_color;
            let bg = entry.bg_color;
            let fg_block = format!("\x1b[38;2;{};{};{}m██\x1b[0m", fg.0, fg.1, fg.2);
            let bg_block = format!("\x1b[38;2;{};{};{}m██\x1b[0m", bg.0, bg.1, bg.2);
            let fg_hex = format!("#{:02x}{:02x}{:02x}", fg.0, fg.1, fg.2);
            let bg_hex = format!("#{:02x}{:02x}{:02x}", bg.0, bg.1, bg.2);

            let mut suffix = String::new();
            if !entry.aa_pass && entry.large_text {
                suffix = "  (AA fail, large text)".to_string();
            } else if !entry.aa_pass {
                suffix = "  (AA fail)".to_string();
            } else if !entry.aaa_pass && entry.large_text {
                suffix = "  (AAA fail, large text)".to_string();
            } else if !entry.aaa_pass {
                suffix = "  (AAA fail)".to_string();
            }

            out.push_str(&format!(
                "  {}  {:>4.1}:1  {:<26}  {} {} on {} {}{}\n",
                color_fn(label),
                entry.ratio,
                format!("\"{}\"", truncated),
                fg_block,
                fg_hex,
                bg_block,
                bg_hex,
                suffix,
            ));
        }

        let total = self.aa_pass + self.aa_fail;
        if total > 0 {
            out.push_str(&format!(
                "\n  AA:  {}/{} pass  AAA: {}/{} pass\n",
                self.aa_pass, total, self.aaa_pass, total,
            ));
        }

        out
    }
}

/// Analyze contrast for all text nodes in a scene snapshot.
///
/// `pixels` is an RGBA pixel buffer (4 bytes per pixel), row-major.
/// `canvas_w` and `canvas_h` are the pixel dimensions of the buffer.
pub fn analyze_contrast(
    snap: &SceneSnapshot,
    pixels: &[u8],
    canvas_w: u32,
    canvas_h: u32,
) -> ContrastReport {
    let mut entries = Vec::new();
    let mut findings_list = Vec::new();
    let mut aa_pass_count = 0usize;
    let mut aa_fail_count = 0usize;
    let mut aaa_pass_count = 0usize;
    let mut aaa_fail_count = 0usize;

    for node in &snap.nodes {
        // Only process text nodes
        let text = match extract_text(node) {
            Some(t) if !t.is_empty() => t,
            _ => continue,
        };

        // Need a layout rect
        let rect = match &node.layout {
            Some(r) => r,
            None => continue,
        };

        // Parse foreground color from styles
        let fg = match node.styles.get("color").and_then(|s| parse_css_color(s)) {
            Some(c) => c,
            None => continue,
        };

        // Sample background color from pixel buffer
        let bg = sample_bg_color(pixels, canvas_w, canvas_h, rect, fg);

        let ratio = contrast_ratio(fg, bg);

        // Determine if text is "large" per WCAG
        let font_size = node
            .styles
            .get("font-size")
            .and_then(|s| parse_px_value(s))
            .unwrap_or(16.0);
        let font_weight = node
            .styles
            .get("font-weight")
            .and_then(|s| s.parse::<f64>().ok())
            .unwrap_or(400.0);
        let large_text = font_size >= 18.0 || (font_size >= 14.0 && font_weight >= 700.0);

        let aa = passes_aa(ratio, large_text);
        let aaa = passes_aaa(ratio, large_text);

        if aa {
            aa_pass_count += 1;
        } else {
            aa_fail_count += 1;
        }
        if aaa {
            aaa_pass_count += 1;
        } else {
            aaa_fail_count += 1;
        }

        // Create finding
        let severity = if !aa {
            Severity::Error
        } else if !aaa {
            Severity::Warning
        } else {
            Severity::Pass
        };

        let fg_hex = format!("#{:02x}{:02x}{:02x}", fg.0, fg.1, fg.2);
        let bg_hex = format!("#{:02x}{:02x}{:02x}", bg.0, bg.1, bg.2);

        findings_list.push(Finding {
            severity,
            category: "contrast",
            message: format!(
                "\"{}\" — {:.1}:1 ({} on {})",
                truncate_text(&text, 24),
                ratio,
                fg_hex,
                bg_hex,
            ),
            node_ids: vec![node.id],
            evidence: vec![
                format!("ratio={:.2}", ratio),
                format!("fg={}", fg_hex),
                format!("bg={}", bg_hex),
                format!("large_text={}", large_text),
                format!("aa={}", aa),
                format!("aaa={}", aaa),
            ],
        });

        entries.push(ContrastEntry {
            node_id: node.id,
            text,
            fg_color: fg,
            bg_color: bg,
            ratio,
            large_text,
            aa_pass: aa,
            aaa_pass: aaa,
        });
    }

    ContrastReport {
        findings_list,
        entries,
        aa_pass: aa_pass_count,
        aa_fail: aa_fail_count,
        aaa_pass: aaa_pass_count,
        aaa_fail: aaa_fail_count,
    }
}

// ---------------------------------------------------------------------------
// Helper functions
// ---------------------------------------------------------------------------

/// Extract text content from a node (Text nodes or nodes with a name).
fn extract_text(node: &NodeSnapshot) -> Option<String> {
    if node.node_type == "Text" || node.text.is_some() {
        return node.text.clone().or_else(|| node.name.clone());
    }
    if let Some(ref name) = node.name {
        if !name.is_empty() {
            return Some(name.clone());
        }
    }
    None
}

/// WCAG 2.1 relative luminance (sRGB).
fn relative_luminance(r: u8, g: u8, b: u8) -> f64 {
    let [rs, gs, bs] = [r, g, b].map(|c| {
        let s = c as f64 / 255.0;
        if s <= 0.04045 {
            s / 12.92
        } else {
            ((s + 0.055) / 1.055).powf(2.4)
        }
    });
    0.2126 * rs + 0.7152 * gs + 0.0722 * bs
}

/// Compute WCAG contrast ratio between two colors.
fn contrast_ratio(c1: (u8, u8, u8), c2: (u8, u8, u8)) -> f64 {
    let l1 = relative_luminance(c1.0, c1.1, c1.2);
    let l2 = relative_luminance(c2.0, c2.1, c2.2);
    let (lighter, darker) = if l1 > l2 { (l1, l2) } else { (l2, l1) };
    (lighter + 0.05) / (darker + 0.05)
}

/// Check WCAG AA pass (4.5:1 normal, 3:1 large text).
fn passes_aa(ratio: f64, large_text: bool) -> bool {
    if large_text {
        ratio >= 3.0
    } else {
        ratio >= 4.5
    }
}

/// Check WCAG AAA pass (7:1 normal, 4.5:1 large text).
fn passes_aaa(ratio: f64, large_text: bool) -> bool {
    if large_text {
        ratio >= 4.5
    } else {
        ratio >= 7.0
    }
}

/// Sample average background color in a rect from pixel buffer.
///
/// `pixels` is RGBA (4 bytes per pixel), row-major, stride = canvas_w * 4.
/// Skips pixels close to `fg` (they are text pixels).
fn sample_bg_color(
    pixels: &[u8],
    canvas_w: u32,
    canvas_h: u32,
    rect: &RectSnapshot,
    fg: (u8, u8, u8),
) -> (u8, u8, u8) {
    let x0 = (rect.x.max(0.0) as u32).min(canvas_w.saturating_sub(1));
    let y0 = (rect.y.max(0.0) as u32).min(canvas_h.saturating_sub(1));
    let x1 = ((rect.x + rect.w).max(0.0) as u32).min(canvas_w);
    let y1 = ((rect.y + rect.h).max(0.0) as u32).min(canvas_h);

    let stride = canvas_w as usize * 4;
    let mut r_sum: u64 = 0;
    let mut g_sum: u64 = 0;
    let mut b_sum: u64 = 0;
    let mut count: u64 = 0;

    // Sample every 2nd pixel for speed
    let mut y = y0;
    while y < y1 {
        let mut x = x0;
        while x < x1 {
            let offset = y as usize * stride + x as usize * 4;
            if offset + 3 < pixels.len() {
                let pr = pixels[offset];
                let pg = pixels[offset + 1];
                let pb = pixels[offset + 2];

                // Skip pixels within euclidean distance 40 of fg (text pixels)
                let dr = pr as f64 - fg.0 as f64;
                let dg = pg as f64 - fg.1 as f64;
                let db = pb as f64 - fg.2 as f64;
                let dist = (dr * dr + dg * dg + db * db).sqrt();

                if dist > 40.0 {
                    r_sum += pr as u64;
                    g_sum += pg as u64;
                    b_sum += pb as u64;
                    count += 1;
                }
            }
            x += 2;
        }
        y += 2;
    }

    if count == 0 {
        (0, 0, 0)
    } else {
        (
            (r_sum / count) as u8,
            (g_sum / count) as u8,
            (b_sum / count) as u8,
        )
    }
}

/// Parse a CSS color string to RGB.
///
/// Handles: `#rgb`, `#rrggbb`, `rgb(r, g, b)`, and common named colors.
fn parse_css_color(s: &str) -> Option<(u8, u8, u8)> {
    let s = s.trim();

    // Hex colors
    if let Some(hex) = s.strip_prefix('#') {
        return match hex.len() {
            3 => {
                let r = u8::from_str_radix(&hex[0..1], 16).ok()?;
                let g = u8::from_str_radix(&hex[1..2], 16).ok()?;
                let b = u8::from_str_radix(&hex[2..3], 16).ok()?;
                Some((r * 17, g * 17, b * 17))
            }
            6 => {
                let r = u8::from_str_radix(&hex[0..2], 16).ok()?;
                let g = u8::from_str_radix(&hex[2..4], 16).ok()?;
                let b = u8::from_str_radix(&hex[4..6], 16).ok()?;
                Some((r, g, b))
            }
            _ => None,
        };
    }

    // rgb(r, g, b) or rgb(r,g,b)
    if s.starts_with("rgb(") && s.ends_with(')') {
        let inner = &s[4..s.len() - 1];
        let parts: Vec<&str> = inner.split(',').collect();
        if parts.len() == 3 {
            let r = parts[0].trim().parse::<u8>().ok()?;
            let g = parts[1].trim().parse::<u8>().ok()?;
            let b = parts[2].trim().parse::<u8>().ok()?;
            return Some((r, g, b));
        }
        return None;
    }

    // Named colors
    match s.to_lowercase().as_str() {
        "white" => Some((255, 255, 255)),
        "black" => Some((0, 0, 0)),
        "red" => Some((255, 0, 0)),
        "green" => Some((0, 128, 0)),
        "blue" => Some((0, 0, 255)),
        "yellow" => Some((255, 255, 0)),
        "cyan" | "aqua" => Some((0, 255, 255)),
        "magenta" | "fuchsia" => Some((255, 0, 255)),
        "gray" | "grey" => Some((128, 128, 128)),
        "silver" => Some((192, 192, 192)),
        "maroon" => Some((128, 0, 0)),
        "olive" => Some((128, 128, 0)),
        "navy" => Some((0, 0, 128)),
        "teal" => Some((0, 128, 128)),
        "purple" => Some((128, 0, 128)),
        "orange" => Some((255, 165, 0)),
        "transparent" => Some((0, 0, 0)),
        _ => None,
    }
}

/// Parse a pixel value like "16px" or "18" to f64.
fn parse_px_value(s: &str) -> Option<f64> {
    let s = s.trim().trim_end_matches("px");
    s.parse::<f64>().ok()
}

/// Truncate text to `max` chars, appending "..." if truncated.
fn truncate_text(s: &str, max: usize) -> String {
    if s.chars().count() <= max {
        s.to_string()
    } else {
        let truncated: String = s.chars().take(max).collect();
        format!("{truncated}...")
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn wcag_luminance_white() {
        assert!((relative_luminance(255, 255, 255) - 1.0).abs() < 0.01);
    }

    #[test]
    fn wcag_luminance_black() {
        assert!(relative_luminance(0, 0, 0).abs() < 0.01);
    }

    #[test]
    fn contrast_ratio_black_on_white() {
        let ratio = contrast_ratio((255, 255, 255), (0, 0, 0));
        assert!((ratio - 21.0).abs() < 0.1);
    }

    #[test]
    fn aa_normal_text_threshold() {
        assert!(passes_aa(4.5, false));
        assert!(!passes_aa(4.4, false));
    }

    #[test]
    fn aa_large_text_threshold() {
        assert!(passes_aa(3.0, true));
        assert!(!passes_aa(2.9, true));
    }

    #[test]
    fn parse_hex_color() {
        assert_eq!(parse_css_color("#ff0000"), Some((255, 0, 0)));
        assert_eq!(parse_css_color("#f00"), Some((255, 0, 0)));
    }

    #[test]
    fn parse_rgb_color() {
        assert_eq!(parse_css_color("rgb(128, 64, 32)"), Some((128, 64, 32)));
    }

    #[test]
    fn aaa_normal_text_threshold() {
        assert!(passes_aaa(7.0, false));
        assert!(!passes_aaa(6.9, false));
    }

    #[test]
    fn aaa_large_text_threshold() {
        assert!(passes_aaa(4.5, true));
        assert!(!passes_aaa(4.4, true));
    }

    #[test]
    fn parse_named_colors() {
        assert_eq!(parse_css_color("white"), Some((255, 255, 255)));
        assert_eq!(parse_css_color("black"), Some((0, 0, 0)));
        assert_eq!(parse_css_color("red"), Some((255, 0, 0)));
    }

    #[test]
    fn parse_unknown_returns_none() {
        assert_eq!(parse_css_color("notacolor"), None);
    }

    #[test]
    fn contrast_ratio_same_color() {
        let ratio = contrast_ratio((128, 128, 128), (128, 128, 128));
        assert!((ratio - 1.0).abs() < 0.01);
    }
}

//! Pixel-based spacing analyzer using gradient edge detection.
//!
//! Measures visual whitespace from the GPU-rendered pixel buffer by detecting
//! content boundaries via Sobel gradient, then analyzing gap patterns.
//! Works regardless of background color or palette.

use serde_json::Value;

/// Convert RGBA pixel to luminance.
fn luminance(r: u8, g: u8, b: u8) -> f32 {
    0.299 * r as f32 + 0.587 * g as f32 + 0.114 * b as f32
}

/// Build a luminance image from RGBA buffer.
fn to_luminance(pixels: &[u8], width: u32, height: u32) -> Vec<f32> {
    let mut lum = vec![0.0f32; (width * height) as usize];
    for y in 0..height {
        for x in 0..width {
            let idx = ((y * width + x) * 4) as usize;
            if idx + 2 < pixels.len() {
                lum[(y * width + x) as usize] = luminance(pixels[idx], pixels[idx + 1], pixels[idx + 2]);
            }
        }
    }
    lum
}

/// Compute Sobel gradient magnitude at each pixel.
fn sobel_gradient(lum: &[f32], width: u32, height: u32) -> Vec<f32> {
    let mut grad = vec![0.0f32; (width * height) as usize];
    let w = width as i32;
    let h = height as i32;

    for y in 1..h - 1 {
        for x in 1..w - 1 {
            let idx = |dy: i32, dx: i32| -> f32 {
                lum[((y + dy) * w + (x + dx)) as usize]
            };

            // Sobel X kernel: -1 0 1 / -2 0 2 / -1 0 1
            let gx = -idx(-1, -1) + idx(-1, 1)
                - 2.0 * idx(0, -1) + 2.0 * idx(0, 1)
                - idx(1, -1) + idx(1, 1);

            // Sobel Y kernel: -1 -2 -1 / 0 0 0 / 1 2 1
            let gy = -idx(-1, -1) - 2.0 * idx(-1, 0) - idx(-1, 1)
                + idx(1, -1) + 2.0 * idx(1, 0) + idx(1, 1);

            grad[(y * w + x) as usize] = (gx * gx + gy * gy).sqrt();
        }
    }
    grad
}

/// Horizontal projection profile: sum of gradient per row.
fn horizontal_projection(grad: &[f32], width: u32, height: u32, threshold: f32) -> Vec<u32> {
    let mut profile = vec![0u32; height as usize];
    for y in 0..height {
        let mut count = 0u32;
        for x in 0..width {
            if grad[(y * width + x) as usize] > threshold {
                count += 1;
            }
        }
        profile[y as usize] = count;
    }
    profile
}

/// Vertical projection profile: sum of gradient per column.
fn vertical_projection(grad: &[f32], width: u32, height: u32, threshold: f32) -> Vec<u32> {
    let mut profile = vec![0u32; width as usize];
    for x in 0..width {
        let mut count = 0u32;
        for y in 0..height {
            if grad[(y * width + x) as usize] > threshold {
                count += 1;
            }
        }
        profile[x as usize] = count;
    }
    profile
}

/// Find valleys (gaps) in a projection profile.
/// Returns (start, end, width) of each gap region.
fn find_gaps(profile: &[u32], min_gap_width: u32, noise_threshold: u32) -> Vec<(u32, u32, u32)> {
    let mut gaps = Vec::new();
    let mut in_gap = false;
    let mut gap_start = 0u32;

    for (i, &count) in profile.iter().enumerate() {
        if count <= noise_threshold {
            if !in_gap {
                gap_start = i as u32;
                in_gap = true;
            }
        } else if in_gap {
            let gap_width = i as u32 - gap_start;
            if gap_width >= min_gap_width {
                gaps.push((gap_start, i as u32, gap_width));
            }
            in_gap = false;
        }
    }

    // Close trailing gap
    if in_gap {
        let gap_width = profile.len() as u32 - gap_start;
        if gap_width >= min_gap_width {
            gaps.push((gap_start, profile.len() as u32, gap_width));
        }
    }

    gaps
}

/// Main entry: analyze spacing from pixel buffer.
pub fn analyze_spacing(pixels: &[u8], width: u32, height: u32) -> Value {
    let expected_len = (width * height * 4) as usize;
    if pixels.len() < expected_len {
        return serde_json::json!({"error": format!(
            "pixel buffer too small: got {} bytes, expected {} for {}x{}",
            pixels.len(), expected_len, width, height
        )});
    }

    // Step 1: Luminance
    let lum = to_luminance(pixels, width, height);

    // Step 2: Sobel gradient
    let grad = sobel_gradient(&lum, width, height);

    // Step 3: Projection profiles
    let edge_threshold = 30.0; // gradient magnitude threshold for "is an edge"
    let h_profile = horizontal_projection(&grad, width, height, edge_threshold);
    let v_profile = vertical_projection(&grad, width, height, edge_threshold);

    // Step 4: Find gaps
    let h_gaps = find_gaps(&h_profile, 3, 2); // horizontal gaps (vertical whitespace)
    let v_gaps = find_gaps(&v_profile, 3, 2); // vertical gaps (horizontal whitespace)

    let mut findings = Vec::new();

    // ── Vertical gap consistency ──────────────────────────────────
    // Skip first and last gaps (margin to viewport edge)
    let interior_h_gaps: Vec<&(u32, u32, u32)> = h_gaps.iter()
        .filter(|(start, end, _)| *start > 5 && *end < height - 5)
        .collect();

    if interior_h_gaps.len() >= 3 {
        let gap_widths: Vec<f32> = interior_h_gaps.iter().map(|(_, _, w)| *w as f32).collect();
        let avg = gap_widths.iter().sum::<f32>() / gap_widths.len() as f32;

        for (i, &&(start, end, w)) in interior_h_gaps.iter().enumerate() {
            let deviation = (w as f32 - avg).abs();
            if deviation > avg * 0.4 && deviation > 4.0 && w > 2 {
                findings.push(serde_json::json!({
                    "type": "gap_inconsistency",
                    "direction": "vertical",
                    "severity": "warning",
                    "y": start,
                    "gap_px": w,
                    "avg_gap_px": avg,
                    "message": format!(
                        "Vertical gap at y={}-{} is {}px (avg {:.0}px — {:.0}% off)",
                        start, end, w, avg, (deviation / avg) * 100.0
                    ),
                }));
            }
        }
    }

    // ── Horizontal gap consistency ─────────────────────────────────
    let interior_v_gaps: Vec<&(u32, u32, u32)> = v_gaps.iter()
        .filter(|(start, end, _)| *start > 5 && *end < width - 5)
        .collect();

    if interior_v_gaps.len() >= 3 {
        let gap_widths: Vec<f32> = interior_v_gaps.iter().map(|(_, _, w)| *w as f32).collect();
        let avg = gap_widths.iter().sum::<f32>() / gap_widths.len() as f32;

        for &&(start, end, w) in &interior_v_gaps {
            let deviation = (w as f32 - avg).abs();
            if deviation > avg * 0.4 && deviation > 4.0 && w > 2 {
                findings.push(serde_json::json!({
                    "type": "gap_inconsistency",
                    "direction": "horizontal",
                    "severity": "warning",
                    "x": start,
                    "gap_px": w,
                    "avg_gap_px": avg,
                    "message": format!(
                        "Horizontal gap at x={}-{} is {}px (avg {:.0}px — {:.0}% off)",
                        start, end, w, avg, (deviation / avg) * 100.0
                    ),
                }));
            }
        }
    }

    // ── Right edge bleed ──────────────────────────────────────────
    // Check if any row has edge pixels near the right viewport boundary
    let right_margin = 5;
    let mut right_bleed_rows = 0u32;
    for y in 0..height {
        for x in (width - right_margin)..width {
            if grad[(y * width + x) as usize] > edge_threshold {
                right_bleed_rows += 1;
                break;
            }
        }
    }
    if right_bleed_rows > 3 {
        findings.push(serde_json::json!({
            "type": "edge_bleed",
            "severity": "warning",
            "edge": "right",
            "rows_affected": right_bleed_rows,
            "message": format!(
                "{} rows have content touching the right viewport edge — content may be clipped",
                right_bleed_rows
            ),
        }));
    }

    // ── Large empty regions ───────────────────────────────────────
    for &(start, end, w) in &h_gaps {
        if w > height / 4 && start > 10 && end < height - 10 {
            findings.push(serde_json::json!({
                "type": "large_gap",
                "severity": "info",
                "y_start": start,
                "y_end": end,
                "gap_px": w,
                "message": format!(
                    "Large empty region y={}–{} ({}px — {:.0}% of viewport)",
                    start, end, w, (w as f32 / height as f32) * 100.0
                ),
            }));
        }
    }

    // ── Summary ───────────────────────────────────────────────────
    serde_json::json!({
        "h_gaps": h_gaps.len(),
        "v_gaps": v_gaps.len(),
        "findings": findings,
        "count": findings.len(),
        "h_gap_pattern": interior_h_gaps.iter().map(|(_, _, w)| *w).collect::<Vec<u32>>(),
        "v_gap_pattern": interior_v_gaps.iter().map(|(_, _, w)| *w).collect::<Vec<u32>>(),
    })
}

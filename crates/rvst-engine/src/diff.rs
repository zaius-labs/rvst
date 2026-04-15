//! Pixel-level image diffing for validation pipeline.
//!
//! Compares two RGBA images pixel-by-pixel and produces:
//! - A diff overlay image (green = match, red = mismatch)
//! - Per-pixel delta values
//! - Summary statistics (match %, max delta, hotspot regions)

/// Result of comparing two RGBA images.
#[derive(Debug, Clone)]
pub struct DiffResult {
    /// Width of the compared images.
    pub width: u32,
    /// Height of the compared images.
    pub height: u32,
    /// Total number of pixels compared.
    pub total_pixels: u64,
    /// Number of pixels that match within tolerance.
    pub matching_pixels: u64,
    /// Number of pixels that differ beyond tolerance.
    pub differing_pixels: u64,
    /// Match percentage (0.0 to 100.0).
    pub match_percent: f64,
    /// Maximum per-channel delta found.
    pub max_delta: u8,
    /// Diff overlay image (RGBA) — green = match, red = mismatch, intensity = delta magnitude.
    pub overlay: Vec<u8>,
    /// Per-pixel delta image (grayscale encoded as RGBA) — brighter = bigger difference.
    pub delta_map: Vec<u8>,
}

/// Compare two RGBA images pixel-by-pixel.
///
/// `tolerance` is the maximum per-channel difference (0-255) considered a match.
/// Use 0 for exact matching, 2 for anti-aliasing tolerance.
pub fn diff_rgba(
    image_a: &[u8],
    image_b: &[u8],
    width: u32,
    height: u32,
    tolerance: u8,
) -> DiffResult {
    let total = (width as u64) * (height as u64);
    let expected_len = (total * 4) as usize;

    assert_eq!(image_a.len(), expected_len, "image_a size mismatch");
    assert_eq!(image_b.len(), expected_len, "image_b size mismatch");

    let mut overlay = vec![0u8; expected_len];
    let mut delta_map = vec![0u8; expected_len];
    let mut matching = 0u64;
    let mut differing = 0u64;
    let mut max_delta = 0u8;

    for i in 0..total as usize {
        let base = i * 4;
        let ra = image_a[base];
        let ga = image_a[base + 1];
        let ba = image_a[base + 2];
        let rb = image_b[base];
        let gb = image_b[base + 1];
        let bb = image_b[base + 2];

        let dr = (ra as i16 - rb as i16).unsigned_abs() as u8;
        let dg = (ga as i16 - gb as i16).unsigned_abs() as u8;
        let db = (ba as i16 - bb as i16).unsigned_abs() as u8;
        let channel_max = dr.max(dg).max(db);

        if channel_max > max_delta {
            max_delta = channel_max;
        }

        if channel_max <= tolerance {
            matching += 1;
            // Green tint for matching pixels (dimmed original)
            overlay[base] = ra / 2;
            overlay[base + 1] = ga / 2 + 64;
            overlay[base + 2] = ba / 2;
            overlay[base + 3] = 255;
        } else {
            differing += 1;
            // Red intensity proportional to delta
            let intensity = ((channel_max as f32 / 255.0) * 255.0) as u8;
            overlay[base] = 255;
            overlay[base + 1] = 0;
            overlay[base + 2] = 0;
            overlay[base + 3] = intensity.max(128); // minimum visibility
        }

        // Delta map: grayscale showing magnitude of difference
        let avg_delta = ((dr as u16 + dg as u16 + db as u16) / 3) as u8;
        // Amplify small differences for visibility (4x)
        let amplified = (avg_delta as u16 * 4).min(255) as u8;
        delta_map[base] = amplified;
        delta_map[base + 1] = amplified;
        delta_map[base + 2] = amplified;
        delta_map[base + 3] = 255;
    }

    let match_percent = if total > 0 {
        (matching as f64 / total as f64) * 100.0
    } else {
        100.0
    };

    DiffResult {
        width,
        height,
        total_pixels: total,
        matching_pixels: matching,
        differing_pixels: differing,
        match_percent,
        max_delta,
        overlay,
        delta_map,
    }
}

/// Compare two RGBA images and return a three-panel side-by-side:
/// [Image A | Diff Overlay | Image B]
pub fn side_by_side(
    image_a: &[u8],
    image_b: &[u8],
    width: u32,
    height: u32,
    tolerance: u8,
) -> (Vec<u8>, DiffResult) {
    let diff = diff_rgba(image_a, image_b, width, height, tolerance);
    let panel_w = width as usize;
    let total_w = panel_w * 3;
    let h = height as usize;
    let mut combined = vec![0u8; total_w * h * 4];

    for y in 0..h {
        for x in 0..panel_w {
            let src = (y * panel_w + x) * 4;
            // Panel 1: Image A
            let dst1 = (y * total_w + x) * 4;
            combined[dst1..dst1 + 4].copy_from_slice(&image_a[src..src + 4]);
            // Panel 2: Diff overlay
            let dst2 = (y * total_w + panel_w + x) * 4;
            combined[dst2..dst2 + 4].copy_from_slice(&diff.overlay[src..src + 4]);
            // Panel 3: Image B
            let dst3 = (y * total_w + panel_w * 2 + x) * 4;
            combined[dst3..dst3 + 4].copy_from_slice(&image_b[src..src + 4]);
        }
    }

    (combined, diff)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn identical_images_100_percent_match() {
        let img = vec![255u8; 4 * 4 * 4]; // 4x4 white
        let result = diff_rgba(&img, &img, 4, 4, 0);
        assert_eq!(result.match_percent, 100.0);
        assert_eq!(result.differing_pixels, 0);
        assert_eq!(result.max_delta, 0);
    }

    #[test]
    fn completely_different_images_0_percent_match() {
        let white = vec![255u8; 4 * 4 * 4];
        let black = vec![0u8; 4 * 4 * 4];
        let result = diff_rgba(&white, &black, 4, 4, 0);
        assert_eq!(result.match_percent, 0.0);
        assert_eq!(result.differing_pixels, 16);
        assert_eq!(result.max_delta, 255);
    }

    #[test]
    fn tolerance_allows_small_differences() {
        let mut img_a = vec![100u8; 4 * 4 * 4];
        let mut img_b = vec![102u8; 4 * 4 * 4];
        // Set alpha to 255
        for i in (3..img_a.len()).step_by(4) {
            img_a[i] = 255;
            img_b[i] = 255;
        }
        let strict = diff_rgba(&img_a, &img_b, 4, 4, 0);
        assert!(strict.differing_pixels > 0);

        let tolerant = diff_rgba(&img_a, &img_b, 4, 4, 2);
        assert_eq!(tolerant.match_percent, 100.0);
    }
}

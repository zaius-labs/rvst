//! A2: Parley text measurement validation.
//! Every check is binary pass/fail. Do not proceed until you trust the numbers.

use rvst_text::TextRenderer;

pub fn run_text_validation() {
    println!("\n=== A2: TEXT MEASUREMENT VALIDATION ===\n");
    let mut tr = TextRenderer::new();
    let mut all_pass = true;

    // 1. Measure at 5 font sizes — values must increase monotonically
    {
        let text = "Hello World";
        let sizes = [10.0, 14.0, 18.0, 24.0, 32.0];
        let mut widths = Vec::new();
        let mut heights = Vec::new();

        for &size in &sizes {
            let (w, h) = tr.measure(text, size, 9999.0, None, None);
            widths.push(w);
            heights.push(h);
            println!("  measure(\"{text}\", {size}px) = ({w:.1}, {h:.1})");
        }

        let w_monotonic = widths.windows(2).all(|w| w[1] > w[0]);
        let h_monotonic = heights.windows(2).all(|h| h[1] > h[0]);
        let pass = w_monotonic && h_monotonic;
        if !pass {
            all_pass = false;
        }
        println!("check_monotonic_width={w_monotonic}");
        println!("check_monotonic_height={h_monotonic}");
        println!(
            "test_monotonic_sizes={}\n",
            if pass { "PASS" } else { "FAIL" }
        );
    }

    // 2. Non-zero measurements for non-empty text
    {
        let (w, h) = tr.measure("Test", 16.0, 9999.0, None, None);
        let pass = w > 0.0 && h > 0.0;
        if !pass {
            all_pass = false;
        }
        println!("check_nonzero w={w:.1} h={h:.1}");
        println!("test_nonzero={}\n", if pass { "PASS" } else { "FAIL" });
    }

    // 3. Empty text returns zero width
    {
        let (w, _h) = tr.measure("", 16.0, 9999.0, None, None);
        let pass = w == 0.0;
        if !pass {
            all_pass = false;
        }
        println!("check_empty_width={w:.1}");
        println!(
            "test_empty_zero_width={}\n",
            if pass { "PASS" } else { "FAIL" }
        );
    }

    // 4. Wrapping: constrained width produces taller measurement
    {
        let text = "Rolling Context Window Management System";
        let (w_wide, h_wide) = tr.measure(text, 16.0, 9999.0, None, None);
        let (w_narrow, h_narrow) = tr.measure(text, 16.0, 150.0, None, None);
        let wraps = h_narrow > h_wide;
        let narrower = w_narrow <= 151.0; // within constraint + 1px tolerance
        let pass = wraps && narrower;
        if !pass {
            all_pass = false;
        }
        println!("check_wrap wide=({w_wide:.1},{h_wide:.1}) narrow=({w_narrow:.1},{h_narrow:.1})");
        println!("check_wrap_height_increases={wraps}");
        println!("check_wrap_width_constrained={narrower}");
        println!("test_wrapping={}\n", if pass { "PASS" } else { "FAIL" });
    }

    // 5. Short vs long text: longer text = wider measurement
    {
        let (w_short, _) = tr.measure("Hi", 16.0, 9999.0, None, None);
        let (w_long, _) = tr.measure(
            "Pressure-Field Coordination Engine",
            16.0,
            9999.0,
            None,
            None,
        );
        let pass = w_long > w_short;
        if !pass {
            all_pass = false;
        }
        println!("check_length short={w_short:.1} long={w_long:.1}");
        println!(
            "test_longer_is_wider={}\n",
            if pass { "PASS" } else { "FAIL" }
        );
    }

    // 6. Bold vs normal: bold should be same or wider
    {
        use rvst_text::FontWeight;
        let (w_normal, _) = tr.measure("Test", 16.0, 9999.0, None, Some(FontWeight(400)));
        let (w_bold, _) = tr.measure("Test", 16.0, 9999.0, None, Some(FontWeight(700)));
        let pass = w_bold >= w_normal;
        if !pass {
            all_pass = false;
        }
        println!("check_bold normal={w_normal:.1} bold={w_bold:.1}");
        println!(
            "test_bold_at_least_as_wide={}\n",
            if pass { "PASS" } else { "FAIL" }
        );
    }

    // 7. Can we reliably detect "too small"?
    // If font_size=8 produces measurement, we know 8px text exists.
    {
        let (w, h) = tr.measure("Label", 8.0, 9999.0, None, None);
        let measurable = w > 0.0 && h > 0.0;
        // At 8px, h should be roughly 8-12px
        let reasonable = h < 20.0 && h > 4.0;
        let pass = measurable && reasonable;
        if !pass {
            all_pass = false;
        }
        println!(
            "check_small_font w={w:.1} h={h:.1} measurable={measurable} reasonable={reasonable}"
        );
        println!(
            "test_small_font_detectable={}\n",
            if pass { "PASS" } else { "FAIL" }
        );
    }

    // 8. Can we estimate node size needed for text?
    // Given label + font size, measurement tells us minimum node dimensions.
    {
        let label = "Canopy ML";
        let font_size = 16.0;
        let padding = 24.0; // 12px each side
        let (tw, th) = tr.measure(label, font_size, 9999.0, None, None);
        let min_node_w = tw + padding;
        let min_node_h = th + padding;
        let pass = min_node_w > padding && min_node_h > padding;
        if !pass {
            all_pass = false;
        }
        println!("check_node_estimate label=\"{label}\" text=({tw:.1},{th:.1}) node_min=({min_node_w:.1},{min_node_h:.1})");
        println!(
            "test_node_size_estimable={}\n",
            if pass { "PASS" } else { "FAIL" }
        );
    }

    println!(
        "=== A2 RESULT={} ===",
        if all_pass { "PASS" } else { "FAIL" }
    );
}

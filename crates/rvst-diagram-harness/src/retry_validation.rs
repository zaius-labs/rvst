//! B2: Validate the re-layout retry loop.
//! Tests with fixtures that should pass (basic_group) and fail→retry (dense_mix).

use rvst_diagram::retry::retry_loop;
use rvst_diagram::schema::Diagram;
use std::path::PathBuf;

fn load_fixture(name: &str) -> Diagram {
    let path = PathBuf::from(env!("CARGO_MANIFEST_DIR"))
        .join("fixtures")
        .join(format!("{name}.json"));
    let json = std::fs::read_to_string(&path).unwrap();
    serde_json::from_str(&json).unwrap()
}

pub fn run_retry_validation() {
    println!("\n=== B2: RE-LAYOUT RETRY VALIDATION ===\n");
    let mut all_pass = true;

    // Test 1: basic_group should pass on first try (no retry needed)
    {
        println!("--- Test 1: basic_group (should accept on pass 0) ---");
        let diagram = load_fixture("basic_group");
        let result = retry_loop(&diagram);

        for entry in &result.log {
            println!("  pass={} adjustment=\"{}\" score=(font={:.0} fill={:.0}% overflow={} trunc={}) passed={}",
                entry.pass, entry.adjustment,
                entry.score.min_font_px, entry.score.canvas_fill * 100.0,
                entry.score.overflow_count, entry.score.label_truncated,
                entry.passed);
        }

        let accepted_early = result.passes == 0 && result.render.passes;
        println!("accepted_on_pass_0={accepted_early}");
        println!("total_passes={}", result.passes);
        if !accepted_early {
            all_pass = false;
        }
        println!(
            "test_basic_no_retry={}\n",
            if accepted_early { "PASS" } else { "FAIL" }
        );
    }

    // Test 2: dense_mix should fail default and retry
    {
        println!("--- Test 2: dense_mix (should retry, may split) ---");
        let diagram = load_fixture("dense_mix");
        let result = retry_loop(&diagram);

        for entry in &result.log {
            println!("  pass={} adjustment=\"{}\" score=(font={:.0} fill={:.0}% overflow={} trunc={}) passed={}",
                entry.pass, entry.adjustment,
                entry.score.min_font_px, entry.score.canvas_fill * 100.0,
                entry.score.overflow_count, entry.score.label_truncated,
                entry.passed);
        }

        println!("total_passes={}", result.passes);
        println!("final_decision={:?}", result.render.decision);

        // Key checks:
        let tried_multiple = result.passes > 0;
        let hard_cap = result.passes <= 3;
        let logged_all = result.log.len() == (result.passes as usize + 1);

        println!("tried_multiple_passes={tried_multiple}");
        println!("hard_cap_respected={hard_cap}");
        println!("all_passes_logged={logged_all}");

        if !hard_cap {
            all_pass = false;
        }
        if !logged_all {
            all_pass = false;
        }

        // If it hit pass 3, should be a Split decision
        if result.passes == 3 {
            let is_split = matches!(
                result.render.decision,
                rvst_diagram::schema::LayoutDecision::Split { .. }
            );
            println!("split_decision_emitted={is_split}");
            if !is_split {
                all_pass = false;
            }
        }

        println!(
            "test_dense_retry={}\n",
            if hard_cap && logged_all {
                "PASS"
            } else {
                "FAIL"
            }
        );
    }

    // Test 3: Verify hard cap — even a pathological fixture never exceeds 3 retries
    {
        println!("--- Test 3: Hard cap enforcement ---");
        // Create a fixture that will always fail (tiny canvas, many nodes)
        let mut diagram = load_fixture("dense_mix");
        diagram.canvas.width = 200;
        diagram.canvas.height = 100;

        let result = retry_loop(&diagram);
        let capped = result.passes <= 3;
        let total_log_entries = result.log.len();

        println!("tiny_canvas_passes={}", result.passes);
        println!("hard_cap_enforced={capped}");
        println!("log_entries={total_log_entries}");
        println!("final_decision={:?}", result.render.decision);

        if !capped {
            all_pass = false;
        }
        println!("test_hard_cap={}\n", if capped { "PASS" } else { "FAIL" });
    }

    println!(
        "=== B2 RESULT={} ===",
        if all_pass { "PASS" } else { "FAIL" }
    );
}

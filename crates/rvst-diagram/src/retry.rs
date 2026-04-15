//! CMA-ES optimized layout retry loop.
//! Searches over gap/padding to minimize a composite readability penalty.
//! After optimization fails → split decision (not a failure — a product output).

use crate::pipeline::{render_and_score_graph, RenderResult};
use crate::schema::{Diagram, LayoutDecision, NodeKind, ReadabilityScore};
use cmaes::CMAESOptions;

/// Result of the full retry loop.
pub struct RetryResult {
    /// The final render (either accepted or the best attempt before split)
    pub render: RenderResult,
    /// How many passes were attempted (0 = default passed, 1 = CMA-ES, 2 = split)
    pub passes: u8,
    /// Log of each pass: what changed and why
    pub log: Vec<PassLog>,
}

#[derive(Debug, Clone)]
pub struct PassLog {
    pub pass: u8,
    pub adjustment: String,
    pub score: ReadabilityScore,
    pub passed: bool,
}

/// Compute a penalty score from a ReadabilityScore (lower = better).
/// CMA-ES minimizes this.
fn penalty(score: &ReadabilityScore, has_edges: bool, leaf_count: usize) -> f64 {
    let mut p = 0.0;

    // Fill penalty: distance from ideal fill ratio (scaled by diagram complexity)
    let ideal_fill = if has_edges {
        0.40
    } else {
        let n = leaf_count.max(1) as f64;
        (0.20 + (n - 1.0).min(9.0) * 0.05).min(0.60)
    };
    let fill_gap = (ideal_fill - score.canvas_fill as f64).max(0.0);
    p += fill_gap * 100.0;

    // Font penalty: readable text requires >= 10px
    if score.min_font_px < 10.0 {
        p += (10.0 - score.min_font_px as f64) * 50.0;
    }

    // Hard penalties for layout violations
    p += score.overflow_count as f64 * 500.0;
    p += score.label_truncated as f64 * 500.0;
    p += score.crossing_count as f64 * 200.0;
    p += (score.node_edge_overlap_area as f64 / 1000.0).min(100.0);

    // Edge length uniformity (lower CV = better)
    p += score.edge_length_cv as f64 * 10.0;

    // Reward high crosslessness
    p += (1.0 - score.crosslessness as f64) * 50.0;

    p
}

/// Run the CMA-ES optimized retry loop.
pub fn retry_loop(original: &Diagram) -> RetryResult {
    let mut log = Vec::new();
    let leaf_count = original
        .nodes
        .iter()
        .filter(|n| n.kind != NodeKind::Group)
        .count();
    let has_edges = !original.edges.is_empty();

    // Pass 0: default layout
    let result0 = render_and_score_graph(original);
    let p0 = penalty(&result0.score, has_edges, leaf_count);
    log.push(PassLog {
        pass: 0,
        adjustment: format!("default (penalty={p0:.1})"),
        score: result0.score.clone(),
        passed: result0.passes,
    });

    if result0.passes {
        return RetryResult {
            render: result0,
            passes: 0,
            log,
        };
    }

    // CMA-ES optimization over [gap, padding]
    // Direction is already handled by pipeline's try-both-directions logic.
    let orig_gap = original.theme.gap as f64;
    let orig_padding = original.canvas.padding as f64;

    // Track best result across all evaluations
    let best_gap = std::cell::Cell::new(original.theme.gap);
    let best_padding = std::cell::Cell::new(original.canvas.padding);
    let best_penalty = std::cell::Cell::new(p0);
    let best_result: std::cell::RefCell<Option<RenderResult>> = std::cell::RefCell::new(None);

    let objective = |x: &cmaes::DVector<f64>| -> f64 {
        let gap = x[0].clamp(4.0, 48.0).round() as u32;
        let padding = x[1].clamp(12.0, 60.0).round() as u32;

        let mut d = original.clone();
        d.theme.gap = gap;
        d.canvas.padding = padding;

        let result = render_and_score_graph(&d);
        let p = penalty(&result.score, has_edges, leaf_count);

        if p < best_penalty.get() {
            best_penalty.set(p);
            best_gap.set(gap);
            best_padding.set(padding);
            *best_result.borrow_mut() = Some(result);
        }

        p
    };

    // Run CMA-ES: start from original params, sigma=8 explores ±8 around initial
    let mut cmaes_state = CMAESOptions::new(vec![orig_gap, orig_padding], 8.0)
        .max_function_evals(20) // ~20 renders × ~50ms = ~1s budget
        .fun_target(0.1) // stop early if penalty near zero
        .build(objective)
        .expect("CMA-ES init failed");

    let _termination = cmaes_state.run();

    // Extract best result
    let final_gap = best_gap.get();
    let final_padding = best_padding.get();
    let best = best_result.into_inner();

    if let Some(result) = best {
        log.push(PassLog {
            pass: 1,
            adjustment: format!(
                "CMA-ES: gap={final_gap} padding={final_padding} penalty={:.1}",
                best_penalty.get()
            ),
            score: result.score.clone(),
            passed: result.passes,
        });

        if result.passes {
            return RetryResult {
                render: result,
                passes: 1,
                log,
            };
        }

        // CMA-ES found something better but still doesn't pass → split
        let frame_count = split_frame_count(original);
        let mut final_result = result;
        final_result.decision = LayoutDecision::Split { frame_count };

        log.push(PassLog {
            pass: 2,
            adjustment: format!("SPLIT into {frame_count} frames"),
            score: final_result.score.clone(),
            passed: false,
        });

        return RetryResult {
            render: final_result,
            passes: 2,
            log,
        };
    }

    // Fallback: CMA-ES produced nothing better than default → split
    let frame_count = split_frame_count(original);
    let mut final_result = result0;
    final_result.decision = LayoutDecision::Split { frame_count };

    log.push(PassLog {
        pass: 2,
        adjustment: format!("SPLIT into {frame_count} frames (CMA-ES no improvement)"),
        score: final_result.score.clone(),
        passed: false,
    });

    RetryResult {
        render: final_result,
        passes: 2,
        log,
    }
}

/// Determine how many frames to split into based on top-level groups.
fn split_frame_count(diagram: &Diagram) -> u32 {
    let top_groups = diagram
        .nodes
        .iter()
        .filter(|n| n.kind == NodeKind::Group && n.parent.is_none())
        .count();

    if top_groups > 1 {
        top_groups as u32 + 1 // overview + one per group
    } else {
        2 // at minimum: split in half
    }
}

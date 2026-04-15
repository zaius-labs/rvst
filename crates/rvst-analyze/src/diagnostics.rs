use crate::report::{AnalysisReport, Finding, Severity};
use owo_colors::OwoColorize;
use rvst_snapshot::SceneSnapshot;

/// Report containing findings from snapshot diagnostics.
#[derive(Debug)]
pub struct DiagnosticsReport {
    pub findings_list: Vec<Finding>,
}

/// Map a severity string from SnapshotDiagnostic to our Severity enum.
fn map_severity(s: &str) -> Severity {
    match s {
        "error" => Severity::Error,
        "warning" => Severity::Warning,
        "info" => Severity::Info,
        _ => Severity::Info,
    }
}

/// Analyze snapshot diagnostics and produce a report.
pub fn analyze_diagnostics(snap: &SceneSnapshot) -> DiagnosticsReport {
    if snap.diagnostics.is_empty() {
        return DiagnosticsReport {
            findings_list: vec![Finding {
                severity: Severity::Pass,
                category: "diagnostics",
                message: "No issues detected".to_string(),
                node_ids: vec![],
                evidence: vec![],
            }],
        };
    }

    let findings_list = snap
        .diagnostics
        .iter()
        .map(|d| Finding {
            severity: map_severity(&d.severity),
            category: "diagnostics",
            message: d.message.clone(),
            node_ids: d.node_ids.clone(),
            evidence: d.evidence.clone(),
        })
        .collect();

    DiagnosticsReport { findings_list }
}

impl AnalysisReport for DiagnosticsReport {
    fn findings(&self) -> &[Finding] {
        &self.findings_list
    }

    fn to_colored_string(&self) -> String {
        let mut out = String::new();
        out.push_str(&format!("{}\n", "━━ Diagnostics ━━".bold()));

        for f in &self.findings_list {
            out.push_str(&format!("  {} {}\n", f.severity.colored_label(), f.message));
            for ev in &f.evidence {
                out.push_str(&format!("    {}\n", ev.dimmed()));
            }
        }

        // Summary line
        let errors = self
            .findings_list
            .iter()
            .filter(|f| f.severity == Severity::Error)
            .count();
        let warnings = self
            .findings_list
            .iter()
            .filter(|f| f.severity == Severity::Warning)
            .count();

        let error_str = format!("{} errors", errors);
        let warn_str = format!("{} warnings", warnings);
        out.push_str(&format!(
            "  {}, {}\n",
            if errors > 0 {
                error_str.red().to_string()
            } else {
                error_str.green().to_string()
            },
            if warnings > 0 {
                warn_str.yellow().to_string()
            } else {
                warn_str.green().to_string()
            },
        ));

        out
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use rvst_snapshot::SnapshotDiagnostic;
    use rvst_snapshot::SceneSnapshot;

    fn empty_snapshot() -> SceneSnapshot {
        SceneSnapshot {
            nodes: vec![],
            root_children: vec![],
            focused_id: None,
            node_count: 0,
            viewport_w: 800.0,
            viewport_h: 600.0,
            diagnostics: vec![],
        }
    }

    #[test]
    fn clean_snapshot_produces_pass() {
        let snap = empty_snapshot();
        let report = analyze_diagnostics(&snap);
        assert_eq!(report.findings_list.len(), 1);
        assert_eq!(report.findings_list[0].severity, Severity::Pass);
        assert_eq!(report.findings_list[0].message, "No issues detected");
    }

    #[test]
    fn snapshot_with_diagnostics_produces_findings() {
        let mut snap = empty_snapshot();
        snap.diagnostics.push(SnapshotDiagnostic {
            severity: "error".to_string(),
            kind: "zero_size".to_string(),
            message: "Button has zero size".to_string(),
            node_ids: vec![1],
            evidence: vec!["width=0, height=0".to_string()],
        });
        snap.diagnostics.push(SnapshotDiagnostic {
            severity: "warning".to_string(),
            kind: "offscreen".to_string(),
            message: "Node is offscreen".to_string(),
            node_ids: vec![2],
            evidence: vec![],
        });

        let report = analyze_diagnostics(&snap);
        assert_eq!(report.findings_list.len(), 2);
        assert_eq!(report.findings_list[0].severity, Severity::Error);
        assert_eq!(report.findings_list[0].message, "Button has zero size");
        assert_eq!(report.findings_list[0].node_ids, vec![1]);
        assert_eq!(report.findings_list[1].severity, Severity::Warning);
    }

    #[test]
    fn colored_output_contains_severity_labels() {
        let mut snap = empty_snapshot();
        snap.diagnostics.push(SnapshotDiagnostic {
            severity: "error".to_string(),
            kind: "zero_size".to_string(),
            message: "Bad node".to_string(),
            node_ids: vec![1],
            evidence: vec!["detail".to_string()],
        });

        let report = analyze_diagnostics(&snap);
        let output = report.to_colored_string();
        // The colored output should contain the header and severity info
        assert!(output.contains("Diagnostics"));
        assert!(output.contains("ERROR"));
        assert!(output.contains("Bad node"));
        assert!(output.contains("detail"));
        assert!(output.contains("1 errors"));
    }
}

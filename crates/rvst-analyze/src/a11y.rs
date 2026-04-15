use crate::report::{AnalysisReport, Finding, Severity};
use owo_colors::OwoColorize;
use rvst_snapshot::SceneSnapshot;
use std::collections::HashMap;

/// Report containing accessibility analysis findings.
#[derive(Debug)]
pub struct A11yReport {
    pub findings_list: Vec<Finding>,
    pub total_interactive: usize,
    pub focusable_count: usize,
    pub buttons_without_name: Vec<u32>,
    pub handlers_missing: Vec<u32>,
    pub unlabeled_inputs: Vec<u32>,
    pub role_distribution: Vec<(String, usize)>,
}

/// Analyze accessibility of a scene snapshot.
pub fn analyze_a11y(snap: &SceneSnapshot) -> A11yReport {
    let mut buttons_without_name: Vec<u32> = Vec::new();
    let mut handlers_missing: Vec<u32> = Vec::new();
    let mut unlabeled_inputs: Vec<u32> = Vec::new();
    let mut focusable_count: usize = 0;
    let mut total_interactive: usize = 0;
    let mut role_counts: HashMap<String, usize> = HashMap::new();

    for node in &snap.nodes {
        let role = node.role.as_str();

        // Count role distribution for all nodes
        *role_counts.entry(node.role.clone()).or_insert(0) += 1;

        // Button without accessible name
        if role == "button" && node.name.as_ref().map_or(true, |n| n.is_empty()) {
            buttons_without_name.push(node.id);
        }

        // Interactive elements without handlers
        if (role == "button" || role == "textbox") && !node.has_handlers {
            handlers_missing.push(node.id);
        }

        // Unlabeled inputs
        if role == "textbox" && node.name.as_ref().map_or(true, |n| n.is_empty()) {
            unlabeled_inputs.push(node.id);
        }

        // Focusable and interactive counts
        if role == "button" || role == "textbox" || role == "form" {
            focusable_count += 1;
            total_interactive += 1;
        }
    }

    // Sort role distribution by count descending
    let mut role_distribution: Vec<(String, usize)> = role_counts.into_iter().collect();
    role_distribution.sort_by(|a, b| b.1.cmp(&a.1));

    // Generate findings
    let mut findings_list = Vec::new();

    for &id in &buttons_without_name {
        findings_list.push(Finding {
            severity: Severity::Error,
            category: "a11y",
            message: format!("Button #{} has no accessible name", id),
            node_ids: vec![id],
            evidence: vec![],
        });
    }

    for &id in &handlers_missing {
        findings_list.push(Finding {
            severity: Severity::Warning,
            category: "a11y",
            message: format!("Interactive element #{} has no event handler", id),
            node_ids: vec![id],
            evidence: vec![],
        });
    }

    for &id in &unlabeled_inputs {
        findings_list.push(Finding {
            severity: Severity::Warning,
            category: "a11y",
            message: format!("Input #{} has no label", id),
            node_ids: vec![id],
            evidence: vec![],
        });
    }

    let distinct_roles = role_distribution.len();
    findings_list.push(Finding {
        severity: Severity::Info,
        category: "a11y",
        message: format!(
            "{} focusable elements across {} roles",
            focusable_count, distinct_roles
        ),
        node_ids: vec![],
        evidence: vec![],
    });

    // Pass if no errors or warnings
    if buttons_without_name.is_empty()
        && handlers_missing.is_empty()
        && unlabeled_inputs.is_empty()
    {
        findings_list.push(Finding {
            severity: Severity::Pass,
            category: "a11y",
            message: "No accessibility issues found".to_string(),
            node_ids: vec![],
            evidence: vec![],
        });
    }

    A11yReport {
        findings_list,
        total_interactive,
        focusable_count,
        buttons_without_name,
        handlers_missing,
        unlabeled_inputs,
        role_distribution,
    }
}

impl AnalysisReport for A11yReport {
    fn findings(&self) -> &[Finding] {
        &self.findings_list
    }

    fn to_colored_string(&self) -> String {
        let mut out = String::new();
        out.push_str(&format!(
            "{}\n\n",
            "\u{2501}\u{2501} Accessibility \u{2501}\u{2501}".bold()
        ));

        // Stats table
        out.push_str(&format!(
            "  {:<15}{}\n",
            "Interactive", self.total_interactive
        ));
        out.push_str(&format!(
            "  {:<15}{}\n",
            "Focusable", self.focusable_count
        ));

        // Roles line with colored role names
        let roles_str: Vec<String> = self
            .role_distribution
            .iter()
            .map(|(role, count)| match role.as_str() {
                "button" => format!("{}({})", role.cyan(), count),
                "text" => format!("{}({})", role.green(), count),
                "group" => format!("{}({})", role.dimmed(), count),
                _ => format!("{}({})", role, count),
            })
            .collect();
        out.push_str(&format!(
            "  {:<15}{}\n",
            "Roles",
            roles_str.join(" ")
        ));

        // Findings
        out.push('\n');
        let mut error_count = 0usize;
        let mut warn_count = 0usize;

        for finding in &self.findings_list {
            match finding.severity {
                Severity::Error => error_count += 1,
                Severity::Warning => warn_count += 1,
                _ => {}
            }
            out.push_str(&format!(
                "  {}  {}\n",
                finding.severity.colored_label(),
                finding.message
            ));
        }

        // Summary line
        if error_count > 0 || warn_count > 0 {
            out.push_str(&format!(
                "\n  {} error{}, {} warning{}\n",
                error_count,
                if error_count == 1 { "" } else { "s" },
                warn_count,
                if warn_count == 1 { "" } else { "s" },
            ));
        }

        out
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use rvst_snapshot::NodeSnapshot;
    use std::collections::HashMap;

    fn make_node(id: u32, role: &str, name: Option<&str>, has_handlers: bool) -> NodeSnapshot {
        NodeSnapshot {
            id,
            node_type: role.to_string(),
            text: None,
            parent: None,
            children: vec![],
            styles: HashMap::new(),
            layout: None,
            scroll_y: 0.0,
            focused: false,
            has_handlers,
            semantic_id: String::new(),
            role: role.to_string(),
            name: name.map(|s| s.to_string()),
        }
    }

    fn make_snap(nodes: Vec<NodeSnapshot>) -> SceneSnapshot {
        let node_count = nodes.len();
        SceneSnapshot {
            nodes,
            root_children: vec![],
            focused_id: None,
            node_count,
            viewport_w: 800.0,
            viewport_h: 600.0,
            diagnostics: vec![],
        }
    }

    #[test]
    fn detect_button_without_name() {
        let snap = make_snap(vec![
            make_node(1, "button", None, true),
            make_node(2, "button", Some("OK"), true),
        ]);
        let report = analyze_a11y(&snap);

        assert_eq!(report.buttons_without_name, vec![1]);
        assert!(report
            .findings_list
            .iter()
            .any(|f| matches!(f.severity, Severity::Error)
                && f.message.contains("Button #1")));
    }

    #[test]
    fn count_focusable_elements() {
        let snap = make_snap(vec![
            make_node(1, "button", Some("Click"), true),
            make_node(2, "textbox", Some("Name"), true),
            make_node(3, "form", None, false),
            make_node(4, "text", Some("Hello"), false),
            make_node(5, "group", None, false),
        ]);
        let report = analyze_a11y(&snap);

        // button + textbox + form = 3 focusable
        assert_eq!(report.focusable_count, 3);
        assert_eq!(report.total_interactive, 3);
    }

    #[test]
    fn role_distribution_totals_match_node_count() {
        let snap = make_snap(vec![
            make_node(1, "button", Some("A"), true),
            make_node(2, "button", Some("B"), true),
            make_node(3, "text", Some("Hi"), false),
            make_node(4, "group", None, false),
            make_node(5, "textbox", Some("Input"), true),
        ]);
        let report = analyze_a11y(&snap);

        let total: usize = report.role_distribution.iter().map(|(_, c)| c).sum();
        assert_eq!(total, snap.nodes.len());
    }

    #[test]
    fn clean_snapshot_produces_pass() {
        let snap = make_snap(vec![
            make_node(1, "button", Some("Submit"), true),
            make_node(2, "textbox", Some("Email"), true),
            make_node(3, "text", Some("Hello"), false),
        ]);
        let report = analyze_a11y(&snap);

        assert!(report.buttons_without_name.is_empty());
        assert!(report.handlers_missing.is_empty());
        assert!(report.unlabeled_inputs.is_empty());
        assert!(report
            .findings_list
            .iter()
            .any(|f| matches!(f.severity, Severity::Pass)));
    }
}

use owo_colors::OwoColorize;

/// Severity level for analysis findings.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum Severity {
    Error,
    Warning,
    Info,
    Pass,
}

impl Severity {
    pub fn colored_label(&self) -> String {
        match self {
            Severity::Error   => "ERROR".red().bold().to_string(),
            Severity::Warning => "WARN".yellow().bold().to_string(),
            Severity::Info    => "INFO".blue().to_string(),
            Severity::Pass    => "PASS".green().bold().to_string(),
        }
    }
    pub fn plain_label(&self) -> &'static str {
        match self {
            Severity::Error   => "ERROR",
            Severity::Warning => "WARN",
            Severity::Info    => "INFO",
            Severity::Pass    => "PASS",
        }
    }
}

/// A single finding from any analysis.
#[derive(Debug, Clone)]
pub struct Finding {
    pub severity: Severity,
    pub category: &'static str,
    pub message: String,
    pub node_ids: Vec<u32>,
    pub evidence: Vec<String>,
}

/// Trait for analysis reports — colored for TTY, plain for piping.
pub trait AnalysisReport {
    fn findings(&self) -> &[Finding];

    fn to_colored_string(&self) -> String;

    fn to_plain_string(&self) -> String {
        self.findings()
            .iter()
            .map(|f| format!("[{}] {}: {}", f.severity.plain_label(), f.category, f.message))
            .collect::<Vec<_>>()
            .join("\n")
    }

    fn print(&self) {
        let force_color = std::env::var("FORCE_COLOR").map(|v| v == "1").unwrap_or(false);
        if force_color || atty::is(atty::Stream::Stdout) {
            print!("{}", self.to_colored_string());
        } else {
            print!("{}", self.to_plain_string());
        }
    }
}

use std::collections::HashMap;
use std::sync::{LazyLock, Mutex};

/// A tracked signal in the Svelte reactive system.
#[derive(Debug, Clone)]
pub struct TrackedSignal {
    pub id: u64,
    pub initial_value_json: String,
}

/// A DOM operation produced by an effect, with enough info to replay it
/// directly from Rust when the source signal changes (Phase 2).
#[derive(Debug, Clone)]
pub enum TrackedOp {
    SetText { node_id: u32, signal_id: u64 },
    SetAttr { node_id: u32, key: String, signal_id: u64 },
    SetStyle { node_id: u32, key: String, signal_id: u64 },
}

/// A tracked effect and the DOM ops it produces.
#[derive(Debug, Clone)]
pub struct TrackedEffect {
    pub id: u64,
    pub reads_signals: Vec<u64>,
    pub produces_ops: Vec<TrackedOp>,
    /// True if the dependency set hasn't changed across re-executions.
    pub stable: bool,
}

/// Stats for debugging and benchmarking the signal graph.
#[derive(Debug)]
pub struct GraphStats {
    pub total_signals: usize,
    pub total_effects: usize,
    pub stable_effects: usize,
    pub total_tracked_ops: usize,
}

/// The observed signal graph for the entire app.
///
/// Phase 1 (current): observation only. During component mount, we record
/// which signals exist, which effects depend on them, and which DOM ops
/// each effect produces. After mount, we check stability.
///
/// Phase 2 (future): for stable-graph components, intercept signal writes
/// in Rust and replay DOM ops directly, skipping JS effect re-execution.
pub struct SignalGraph {
    pub signals: HashMap<u64, TrackedSignal>,
    pub effects: HashMap<u64, TrackedEffect>,
    /// True during mount observation, false after `check_stability`.
    pub recording: bool,
    next_signal_id: u64,
    next_effect_id: u64,
    /// Which effect is currently executing (for tracking reads/ops).
    current_effect: Option<u64>,
}

impl SignalGraph {
    pub fn new() -> Self {
        Self {
            signals: HashMap::new(),
            effects: HashMap::new(),
            recording: true,
            next_signal_id: 1,
            next_effect_id: 1,
            current_effect: None,
        }
    }

    /// Reset the graph for a fresh mount cycle.
    pub fn reset(&mut self) {
        self.signals.clear();
        self.effects.clear();
        self.recording = true;
        self.next_signal_id = 1;
        self.next_effect_id = 1;
        self.current_effect = None;
    }

    /// Called when `$.state()` creates a new signal. Returns the assigned signal ID.
    pub fn track_signal_create(&mut self, initial_json: &str) -> u64 {
        if !self.recording {
            return 0;
        }
        let id = self.next_signal_id;
        self.next_signal_id += 1;
        self.signals.insert(id, TrackedSignal {
            id,
            initial_value_json: initial_json.to_string(),
        });
        id
    }

    /// Called when an effect starts executing. Returns the assigned effect ID.
    pub fn begin_effect(&mut self) -> u64 {
        if !self.recording {
            return 0;
        }
        let id = self.next_effect_id;
        self.next_effect_id += 1;
        self.effects.insert(id, TrackedEffect {
            id,
            reads_signals: Vec::new(),
            produces_ops: Vec::new(),
            stable: true, // assume stable until proven otherwise
        });
        self.current_effect = Some(id);
        id
    }

    /// Called when `$.get(signal)` is called inside an effect.
    pub fn track_signal_read(&mut self, signal_id: u64) {
        if !self.recording {
            return;
        }
        if let Some(eff_id) = self.current_effect {
            if let Some(eff) = self.effects.get_mut(&eff_id) {
                if !eff.reads_signals.contains(&signal_id) {
                    eff.reads_signals.push(signal_id);
                }
            }
        }
    }

    /// Called when an effect produces a DOM op (set_text, set_attr, set_style).
    pub fn track_dom_op(&mut self, op: TrackedOp) {
        if !self.recording {
            return;
        }
        if let Some(eff_id) = self.current_effect {
            if let Some(eff) = self.effects.get_mut(&eff_id) {
                eff.produces_ops.push(op);
            }
        }
    }

    /// Called when an effect finishes executing.
    pub fn end_effect(&mut self) {
        self.current_effect = None;
    }

    /// After mount: check if graph is stable (all effects have consistent
    /// dependency sets). Stops recording.
    ///
    /// Returns true if every effect is marked stable.
    pub fn check_stability(&mut self) -> bool {
        self.recording = false;
        self.current_effect = None;
        // An effect is stable if it reads at least one signal and produces
        // at least one op. Effects with no reads are likely conditional/dynamic.
        for eff in self.effects.values_mut() {
            if eff.reads_signals.is_empty() || eff.produces_ops.is_empty() {
                eff.stable = false;
            }
        }
        self.effects.values().all(|e| e.stable)
    }

    /// Get stats for debugging/benchmarking.
    pub fn stats(&self) -> GraphStats {
        let total_tracked_ops: usize = self.effects.values()
            .map(|e| e.produces_ops.len())
            .sum();
        GraphStats {
            total_signals: self.signals.len(),
            total_effects: self.effects.len(),
            stable_effects: self.effects.values().filter(|e| e.stable).count(),
            total_tracked_ops,
        }
    }
}

impl Default for SignalGraph {
    fn default() -> Self {
        Self::new()
    }
}

static GRAPH: LazyLock<Mutex<SignalGraph>> = LazyLock::new(|| Mutex::new(SignalGraph::new()));

/// Access the global signal graph.
pub fn graph() -> &'static Mutex<SignalGraph> {
    &GRAPH
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn basic_observation_cycle() {
        let mut g = SignalGraph::new();

        // Simulate mount: create signals
        let sig_count = g.track_signal_create("0");
        let sig_name = g.track_signal_create(r#""Alice""#);
        assert_eq!(sig_count, 1);
        assert_eq!(sig_name, 2);

        // Effect 1: reads count, sets text on node 5
        let eff1 = g.begin_effect();
        g.track_signal_read(sig_count);
        g.track_dom_op(TrackedOp::SetText { node_id: 5, signal_id: sig_count });
        g.end_effect();

        // Effect 2: reads name, sets attr on node 3
        let eff2 = g.begin_effect();
        g.track_signal_read(sig_name);
        g.track_dom_op(TrackedOp::SetAttr {
            node_id: 3,
            key: "class".to_string(),
            signal_id: sig_name,
        });
        g.end_effect();

        assert_eq!(eff1, 1);
        assert_eq!(eff2, 2);

        // Check stability
        let stable = g.check_stability();
        assert!(stable);
        assert!(!g.recording);

        let stats = g.stats();
        assert_eq!(stats.total_signals, 2);
        assert_eq!(stats.total_effects, 2);
        assert_eq!(stats.stable_effects, 2);
        assert_eq!(stats.total_tracked_ops, 2);
    }

    #[test]
    fn empty_effect_is_unstable() {
        let mut g = SignalGraph::new();
        g.track_signal_create("0");

        // Effect with no reads — dynamic/conditional
        g.begin_effect();
        g.end_effect();

        let stable = g.check_stability();
        assert!(!stable);

        let stats = g.stats();
        assert_eq!(stats.stable_effects, 0);
    }

    #[test]
    fn recording_stops_after_stability_check() {
        let mut g = SignalGraph::new();
        g.check_stability();

        // These should be no-ops
        let id = g.track_signal_create("1");
        assert_eq!(id, 0);
        let eid = g.begin_effect();
        assert_eq!(eid, 0);
    }

    #[test]
    fn reset_clears_state() {
        let mut g = SignalGraph::new();
        g.track_signal_create("0");
        g.begin_effect();
        g.track_signal_read(1);
        g.track_dom_op(TrackedOp::SetText { node_id: 1, signal_id: 1 });
        g.end_effect();
        g.check_stability();

        g.reset();
        assert!(g.recording);
        assert!(g.signals.is_empty());
        assert!(g.effects.is_empty());
    }
}

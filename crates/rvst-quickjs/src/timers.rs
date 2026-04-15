use std::time::{Duration, Instant};

pub struct TimerEntry {
    pub handler_id: u32,
    pub next_fire: Instant,
    pub interval_ms: Option<u64>, // None = setTimeout, Some = setInterval
    pub runtime_id: u64,
}

pub struct RafEntry {
    pub id: u32,
}

pub struct TimerWheel {
    timers: Vec<TimerEntry>,
    raf_queue: Vec<RafEntry>,
    raf_time: f64, // simulated timestamp, increments by 16.0 per frame
}

impl TimerWheel {
    pub fn new() -> Self {
        Self {
            timers: Vec::new(),
            raf_queue: Vec::new(),
            raf_time: 0.0,
        }
    }

    pub fn add_timeout(&mut self, handler_id: u32, ms: u64, runtime_id: u64) {
        self.timers.push(TimerEntry {
            handler_id,
            next_fire: Instant::now() + Duration::from_millis(ms),
            interval_ms: None,
            runtime_id,
        });
    }

    pub fn add_interval(&mut self, handler_id: u32, ms: u64, runtime_id: u64) {
        self.timers.push(TimerEntry {
            handler_id,
            next_fire: Instant::now() + Duration::from_millis(ms),
            interval_ms: Some(ms),
            runtime_id,
        });
    }

    pub fn clear_timer(&mut self, handler_id: u32) {
        self.timers.retain(|t| t.handler_id != handler_id);
    }

    pub fn add_raf(&mut self, id: u32) {
        self.raf_queue.push(RafEntry { id });
    }

    pub fn cancel_raf(&mut self, id: u32) {
        self.raf_queue.retain(|r| r.id != id);
    }

    /// Returns handler_ids of timers that are due. Advances intervals, removes one-shots.
    pub fn drain_due(&mut self) -> Vec<u32> {
        let now = Instant::now();
        let mut fired = Vec::new();
        let mut to_remove = Vec::new();

        for (i, timer) in self.timers.iter_mut().enumerate() {
            if timer.next_fire <= now {
                fired.push(timer.handler_id);
                if let Some(interval_ms) = timer.interval_ms {
                    timer.next_fire = now + Duration::from_millis(interval_ms);
                } else {
                    to_remove.push(i);
                }
            }
        }

        // Remove one-shot timers (in reverse to maintain indices)
        for i in to_remove.into_iter().rev() {
            self.timers.swap_remove(i);
        }

        fired
    }

    /// Drain all pending rAF entries. Returns (ids, timestamp).
    pub fn drain_raf(&mut self) -> (Vec<u32>, f64) {
        if self.raf_queue.is_empty() {
            return (vec![], self.raf_time);
        }
        self.raf_time += 16.0;
        let ids: Vec<u32> = self.raf_queue.drain(..).map(|r| r.id).collect();
        (ids, self.raf_time)
    }

    pub fn raf_count(&self) -> usize {
        self.raf_queue.len()
    }

    pub fn has_pending(&self) -> bool {
        !self.timers.is_empty() || !self.raf_queue.is_empty()
    }

    pub fn next_wake(&self) -> Option<Instant> {
        if !self.raf_queue.is_empty() {
            return Some(Instant::now()); // rAF should fire ASAP
        }
        self.timers.iter().map(|t| t.next_fire).min()
    }

    pub fn clear_for_runtime(&mut self, runtime_id: u64) {
        self.timers.retain(|t| t.runtime_id != runtime_id);
    }

    pub fn handler_ids_for_runtime(&self, runtime_id: u64) -> Vec<u32> {
        self.timers
            .iter()
            .filter(|t| t.runtime_id == runtime_id)
            .map(|t| t.handler_id)
            .collect()
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::thread;

    #[test]
    fn timeout_fires_after_delay() {
        let mut wheel = TimerWheel::new();
        wheel.add_timeout(1, 10, 1);
        assert!(wheel.has_pending());

        // Should not fire immediately
        let _fired = wheel.drain_due();
        // Might or might not fire depending on timing; sleep to be sure
        thread::sleep(Duration::from_millis(15));
        let fired = wheel.drain_due();
        assert_eq!(fired, vec![1]);

        // One-shot should be removed
        assert!(!wheel.has_pending());
    }

    #[test]
    fn interval_reschedules() {
        let mut wheel = TimerWheel::new();
        wheel.add_interval(2, 10, 1);

        thread::sleep(Duration::from_millis(15));
        let fired = wheel.drain_due();
        assert_eq!(fired, vec![2]);

        // Should still be pending (rescheduled)
        assert!(wheel.has_pending());

        thread::sleep(Duration::from_millis(15));
        let fired = wheel.drain_due();
        assert_eq!(fired, vec![2]);
    }

    #[test]
    fn clear_timer_removes_entry() {
        let mut wheel = TimerWheel::new();
        wheel.add_timeout(3, 1000, 1);
        assert!(wheel.has_pending());

        wheel.clear_timer(3);
        assert!(!wheel.has_pending());
    }

    #[test]
    fn raf_drains_all_and_advances_time() {
        let mut wheel = TimerWheel::new();
        wheel.add_raf(10);
        wheel.add_raf(11);

        let (ids, time) = wheel.drain_raf();
        assert_eq!(ids, vec![10, 11]);
        assert_eq!(time, 16.0);

        // Queue should be empty now
        let (ids, time) = wheel.drain_raf();
        assert!(ids.is_empty());
        assert_eq!(time, 16.0); // time doesn't advance without pending rafs

        // Add more and drain again
        wheel.add_raf(12);
        let (ids, time) = wheel.drain_raf();
        assert_eq!(ids, vec![12]);
        assert_eq!(time, 32.0);
    }

    #[test]
    fn cancel_raf_removes_entry() {
        let mut wheel = TimerWheel::new();
        wheel.add_raf(20);
        wheel.add_raf(21);

        wheel.cancel_raf(20);

        let (ids, _) = wheel.drain_raf();
        assert_eq!(ids, vec![21]);
    }

    #[test]
    fn clear_for_runtime_only_removes_matching() {
        let mut wheel = TimerWheel::new();
        wheel.add_timeout(1, 1000, 100);
        wheel.add_timeout(2, 1000, 200);
        wheel.add_interval(3, 1000, 100);

        wheel.clear_for_runtime(100);

        // Only timer with runtime_id 200 should remain
        assert!(wheel.has_pending());
        wheel.clear_for_runtime(200);
        assert!(!wheel.has_pending());
    }

    #[test]
    fn next_wake_returns_soonest_timer() {
        let mut wheel = TimerWheel::new();
        assert!(wheel.next_wake().is_none());

        wheel.add_timeout(1, 100, 1);
        wheel.add_timeout(2, 50, 1);

        let wake = wheel.next_wake().unwrap();
        // Should be roughly 50ms from now (the sooner one)
        let until = wake.duration_since(Instant::now());
        assert!(until.as_millis() <= 55);
    }

    #[test]
    fn next_wake_immediate_when_raf_pending() {
        let mut wheel = TimerWheel::new();
        wheel.add_raf(1);
        let wake = wheel.next_wake().unwrap();
        // Should be essentially now
        assert!(wake <= Instant::now() + Duration::from_millis(1));
    }
}

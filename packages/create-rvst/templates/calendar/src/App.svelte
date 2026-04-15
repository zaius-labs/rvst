<script>
  import TrafficLights from "./TrafficLights.svelte";

  // ── State ──────────────────────────────────────────────────────────────
  const today = new Date();
  let currentMonth = $state(today.getMonth());
  let currentYear = $state(today.getFullYear());
  let selectedDate = $state(today.getDate());
  let selectedMonth = $state(today.getMonth());
  let selectedYear = $state(today.getFullYear());

  // ── Events ─────────────────────────────────────────────────────────────
  const eventColors = {
    meeting:  "#89b4fa",
    personal: "#a6e3a1",
    deadline: "#cba6f7",
    reminder: "#fab387",
  };

  let events = $state([
    { day: 2,  month: 2, year: 2026, time: "9:00 AM",  title: "Team Standup",      type: "meeting"  },
    { day: 2,  month: 2, year: 2026, time: "2:00 PM",  title: "Design Review",     type: "deadline" },
    { day: 5,  month: 2, year: 2026, time: "10:00 AM", title: "Sprint Planning",   type: "meeting"  },
    { day: 5,  month: 2, year: 2026, time: "3:00 PM",  title: "Dentist",           type: "personal" },
    { day: 8,  month: 2, year: 2026, time: "11:00 AM", title: "1:1 with Manager",  type: "meeting"  },
    { day: 10, month: 2, year: 2026, time: "9:30 AM",  title: "All Hands",         type: "meeting"  },
    { day: 10, month: 2, year: 2026, time: "1:00 PM",  title: "Lunch with Sarah",  type: "personal" },
    { day: 10, month: 2, year: 2026, time: "4:00 PM",  title: "Code Review",       type: "deadline" },
    { day: 10, month: 2, year: 2026, time: "5:00 PM",  title: "Ship v2.0",         type: "deadline" },
    { day: 10, month: 2, year: 2026, time: "6:00 PM",  title: "Retro",             type: "reminder" },
    { day: 12, month: 2, year: 2026, time: "9:00 AM",  title: "Client Call",       type: "meeting"  },
    { day: 15, month: 2, year: 2026, time: "12:00 PM", title: "Team Lunch",        type: "personal" },
    { day: 18, month: 2, year: 2026, time: "3:00 PM",  title: "Proposal Due",      type: "deadline" },
    { day: 20, month: 2, year: 2026, time: "9:00 AM",  title: "Weekly Sync",       type: "meeting"  },
    { day: 20, month: 2, year: 2026, time: "2:00 PM",  title: "Pay Bills",         type: "reminder" },
    { day: 23, month: 2, year: 2026, time: "10:00 AM", title: "Demo Day",          type: "meeting"  },
    { day: 25, month: 2, year: 2026, time: "6:00 PM",  title: "Gym",              type: "personal" },
    { day: 27, month: 2, year: 2026, time: "9:00 AM",  title: "Quarterly Review",  type: "deadline" },
    { day: 31, month: 2, year: 2026, time: "11:00 AM", title: "Month-End Report",  type: "reminder" },
    { day: 31, month: 2, year: 2026, time: "3:00 PM",  title: "Plan Next Sprint",  type: "meeting"  },
  ]);

  // ── Helpers ────────────────────────────────────────────────────────────
  const monthNames = [
    "January","February","March","April","May","June",
    "July","August","September","October","November","December"
  ];
  const dayLabels = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

  function daysInMonth(m, y) {
    return new Date(y, m + 1, 0).getDate();
  }

  function firstDayOfMonth(m, y) {
    return new Date(y, m, 1).getDay();
  }

  function buildGrid(m, y) {
    const totalDays = daysInMonth(m, y);
    const startDay = firstDayOfMonth(m, y);
    const prevMonth = m === 0 ? 11 : m - 1;
    const prevYear = m === 0 ? y - 1 : y;
    const prevDays = daysInMonth(prevMonth, prevYear);
    const cells = [];

    // Previous month fill
    for (let i = startDay - 1; i >= 0; i--) {
      cells.push({ day: prevDays - i, month: prevMonth, year: prevYear, dim: true });
    }
    // Current month
    for (let d = 1; d <= totalDays; d++) {
      cells.push({ day: d, month: m, year: y, dim: false });
    }
    // Next month fill
    const nextMonth = m === 11 ? 0 : m + 1;
    const nextYear = m === 11 ? y + 1 : y;
    let nd = 1;
    while (cells.length % 7 !== 0) {
      cells.push({ day: nd++, month: nextMonth, year: nextYear, dim: true });
    }
    return cells;
  }

  function eventsForDay(d, m, y) {
    return events.filter(e => e.day === d && e.month === m && e.year === y);
  }

  function isToday(d, m, y) {
    return d === today.getDate() && m === today.getMonth() && y === today.getFullYear();
  }

  function isSelected(d, m, y) {
    return d === selectedDate && m === selectedMonth && y === selectedYear;
  }

  function selectDay(d, m, y) {
    selectedDate = d;
    selectedMonth = m;
    selectedYear = y;
  }

  function prevMonth() {
    if (currentMonth === 0) { currentMonth = 11; currentYear--; }
    else { currentMonth--; }
  }

  function nextMonth() {
    if (currentMonth === 11) { currentMonth = 0; currentYear++; }
    else { currentMonth++; }
  }

  // ── Derived ────────────────────────────────────────────────────────────
  let grid = $derived(buildGrid(currentMonth, currentYear));
  let miniGrid = $derived(buildGrid(currentMonth, currentYear));
  let titleText = $derived(`${monthNames[currentMonth]} ${currentYear}`);
  let selectedDayEvents = $derived(eventsForDay(selectedDate, selectedMonth, selectedYear));

  let upcomingEvents = $derived.by(() => {
    const now = new Date();
    return events
      .map(e => {
        const d = new Date(e.year, e.month, e.day);
        return { ...e, _date: d };
      })
      .filter(e => e._date >= new Date(now.getFullYear(), now.getMonth(), now.getDate()))
      .sort((a, b) => a._date - b._date)
      .slice(0, 5);
  });

  $effect(() => { globalThis.__rvst?.disableDecorations(); });

  const startDrag = (e) => {
    if (!e.target.closest("button")) {
      globalThis.__rvst?.startDragging();
    }
  };
</script>

<div class="shell">
  <!-- Titlebar -->
  <div class="titlebar" onmousedown={startDrag} role="banner">
    <TrafficLights />
    <span class="win-title">{titleText}</span>
    <div class="nav-arrows">
      <button class="arrow-btn" onclick={prevMonth} aria-label="Previous month">&lsaquo;</button>
      <button class="arrow-btn" onclick={nextMonth} aria-label="Next month">&rsaquo;</button>
    </div>
  </div>

  <div class="body">
    <!-- Sidebar -->
    <div class="sidebar">
      <!-- Mini month grid -->
      <div class="mini-cal">
        <div class="mini-header">
          {#each dayLabels as label}
            <span class="mini-day-label">{label.charAt(0)}</span>
          {/each}
        </div>
        <div class="mini-grid">
          {#each miniGrid as cell}
            <button
              class="mini-cell"
              class:dim={cell.dim}
              class:today={isToday(cell.day, cell.month, cell.year)}
              class:selected={isSelected(cell.day, cell.month, cell.year)}
              onclick={() => selectDay(cell.day, cell.month, cell.year)}
            >
              {cell.day}
            </button>
          {/each}
        </div>
      </div>

      <!-- Upcoming / Selected day events -->
      <div class="sidebar-section">
        {#if selectedDayEvents.length > 0}
          <div class="sidebar-label">EVENTS — {monthNames[selectedMonth].slice(0, 3).toUpperCase()} {selectedDate}</div>
          {#each selectedDayEvents as ev}
            <div class="upcoming-row">
              <span class="ev-dot" style="background-color:{eventColors[ev.type]}"></span>
              <span class="ev-time">{ev.time}</span>
              <span class="ev-title">{ev.title}</span>
            </div>
          {/each}
        {:else}
          <div class="sidebar-label">UPCOMING</div>
          {#each upcomingEvents as ev}
            <div class="upcoming-row">
              <span class="ev-dot" style="background-color:{eventColors[ev.type]}"></span>
              <span class="ev-time">{ev.time}</span>
              <span class="ev-title">{ev.title}</span>
            </div>
          {/each}
        {/if}
      </div>
    </div>

    <!-- Main calendar grid -->
    <div class="main">
      <div class="cal-header">
        {#each dayLabels as label}
          <span class="cal-day-label">{label}</span>
        {/each}
      </div>
      <div class="cal-grid">
        {#each grid as cell}
          {@const dayEvents = eventsForDay(cell.day, cell.month, cell.year)}
          <button
            class="cal-cell"
            class:dim={cell.dim}
            class:today={isToday(cell.day, cell.month, cell.year)}
            class:selected={isSelected(cell.day, cell.month, cell.year)}
            onclick={() => selectDay(cell.day, cell.month, cell.year)}
          >
            <span class="cell-day">{cell.day}</span>
            <div class="cell-events">
              {#each dayEvents.slice(0, 3) as ev}
                <span class="event-pill" style="background-color:{eventColors[ev.type]}">
                  {ev.title.length > 10 ? ev.title.slice(0, 10) + "..." : ev.title}
                </span>
              {/each}
              {#if dayEvents.length > 3}
                <span class="event-more">+{dayEvents.length - 3} more</span>
              {/if}
            </div>
          </button>
        {/each}
      </div>
    </div>
  </div>
</div>

<style>
  @font-face {
    font-family: "Phosphor";
    src: url("./Phosphor.ttf") format("truetype");
  }

  /* ── Reset ─────────────────────────────────────────────────────────── */
  * { box-sizing: border-box; }

  /* ── Shell ─────────────────────────────────────────────────────────── */
  .shell {
    display: flex; flex-direction: column; width: 100%; height: 100%;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    font-size: 14px;
    background-color: #1e1e2e; color: #cdd6f4;
  }

  /* ── Titlebar ──────────────────────────────────────────────────────── */
  .titlebar {
    display: flex; flex-direction: row; align-items: center;
    height: 38px; min-height: 38px;
    background-color: #181825; border-bottom: 1px solid #313244;
    padding-right: 12px;
  }
  .win-title {
    flex: 1; text-align: center; font-size: 13px; font-weight: 600;
    color: #a6adc8; letter-spacing: 0.02em;
  }
  .nav-arrows {
    display: flex; flex-direction: row; gap: 2px;
  }
  .arrow-btn {
    background: none; border: 1px solid #313244; color: #a6adc8;
    width: 26px; height: 26px; border-radius: 5px; cursor: pointer;
    font-size: 16px; display: flex; align-items: center; justify-content: center;
    line-height: 1;
  }
  .arrow-btn:hover { background-color: #313244; color: #cdd6f4; }

  /* ── Body ───────────────────────────────────────────────────────────── */
  .body { display: flex; flex-direction: row; flex: 1; overflow: hidden; }

  /* ── Sidebar ────────────────────────────────────────────────────────── */
  .sidebar {
    display: flex; flex-direction: column; width: 240px; min-width: 240px;
    background-color: #181825; border-right: 1px solid #313244;
    padding: 16px 12px; gap: 20px;
  }

  /* ── Mini calendar ─────────────────────────────────────────────────── */
  .mini-cal {
    display: flex; flex-direction: column; gap: 4px;
  }
  .mini-header {
    display: flex; flex-wrap: wrap;
    text-align: center;
  }
  .mini-day-label {
    font-size: 10px; font-weight: 600; color: #585b70;
    padding: 2px 0; width: 14.2857%;
  }
  .mini-grid {
    display: flex; flex-wrap: wrap;
  }
  .mini-cell {
    background: none; border: none; color: #a6adc8;
    font-size: 11px; width: 14.2857%; height: 20px;
    border-radius: 4px; cursor: pointer;
    display: flex; align-items: center; justify-content: center;
  }
  .mini-cell:hover { background-color: #2a2a3c; }
  .mini-cell.dim { color: #45475a; }
  .mini-cell.today {
    outline: 1.5px solid #89b4fa;
    color: #89b4fa; font-weight: 700;
  }
  .mini-cell.selected {
    background-color: #313244; color: #cdd6f4; font-weight: 600;
  }

  /* ── Sidebar section ───────────────────────────────────────────────── */
  .sidebar-section {
    display: flex; flex-direction: column; gap: 6px;
  }
  .sidebar-label {
    font-size: 10px; font-weight: 700; color: #585b70;
    letter-spacing: 0.08em; margin-bottom: 4px;
  }
  .upcoming-row {
    display: flex; flex-direction: row; align-items: center; gap: 8px;
    padding: 6px 4px; border-radius: 5px;
  }
  .upcoming-row:hover { background-color: #2a2a3c; }
  .ev-dot {
    width: 7px; height: 7px; border-radius: 50%; min-width: 7px;
  }
  .ev-time {
    font-size: 11px; color: #585b70; min-width: 58px;
  }
  .ev-title {
    font-size: 12px; color: #cdd6f4; white-space: nowrap;
    overflow: hidden; text-overflow: ellipsis;
  }

  /* ── Main calendar ─────────────────────────────────────────────────── */
  .main {
    display: flex; flex-direction: column; flex: 1;
    padding: 12px 16px; overflow: hidden;
  }
  .cal-header {
    display: flex; flex-wrap: wrap;
    text-align: center; margin-bottom: 4px;
  }
  .cal-day-label {
    font-size: 11px; font-weight: 600; color: #585b70;
    padding: 6px 0; width: 14.2857%;
  }
  .cal-grid {
    display: flex; flex-wrap: wrap;
    flex: 1;
  }

  /* ── Day cell ──────────────────────────────────────────────────────── */
  .cal-cell {
    background: none; border: 1px solid #313244; color: #cdd6f4;
    display: flex; flex-direction: column; align-items: flex-start;
    padding: 4px 6px; cursor: pointer; overflow: hidden;
    border-radius: 4px; text-align: left; gap: 2px;
    width: 14.2857%; min-height: 80px;
  }
  .cal-cell:hover { background-color: #2a2a3c; }
  .cal-cell.dim { color: #45475a; }
  .cal-cell.dim .cell-day { color: #45475a; }
  .cal-cell.today {
    outline: 2px solid #89b4fa; outline-offset: -2px;
  }
  .cal-cell.selected {
    background-color: #313244;
  }
  .cell-day {
    font-size: 12px; font-weight: 500; color: #a6adc8;
    line-height: 1;
  }
  .cal-cell.today .cell-day { color: #89b4fa; font-weight: 700; }

  /* ── Event pills ───────────────────────────────────────────────────── */
  .cell-events {
    display: flex; flex-direction: column; gap: 1px; width: 100%;
    overflow: hidden;
  }
  .event-pill {
    font-size: 9px; color: #1e1e2e; font-weight: 600;
    padding: 1px 4px; border-radius: 3px;
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    line-height: 1.3;
  }
  .event-more {
    font-size: 9px; color: #585b70; padding: 0 2px;
  }
</style>

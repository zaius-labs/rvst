<script>
  import TrafficLights from "./TrafficLights.svelte";

  let page = $state("overview");

  // ── data ──────────────────────────────────────────────────────────────
  const projects = [
    { name: "rvst",    status: "active", pct: 68,  tasks: 6  },
    { name: "Orbit",   status: "active", pct: 72,  tasks: 8  },
    { name: "Canopy",  status: "active", pct: 100, tasks: 12 },
    { name: "Bitnana", status: "paused", pct: 45,  tasks: 5  },
    { name: "Zaius",   status: "active", pct: 31,  tasks: 14 },
  ];

  let tasks = $state([
    { done: false, label: "Wire titlebar drag dispatch",    pri: "high",   proj: "rvst"   },
    { done: false, label: "Design CTM signal fusion",       pri: "high",   proj: "Canopy" },
    { done: true,  label: "Ship calc() CSS parser",         pri: "medium", proj: "rvst"   },
    { done: false, label: "Add letter-spacing rendering",   pri: "medium", proj: "rvst"   },
    { done: false, label: "Document ACP protocol",          pri: "low",    proj: "Canopy" },
    { done: true,  label: "Publish Bitnana alpha",          pri: "high",   proj: "Bitnana"},
    { done: false, label: "Train BitCodec v17 corpus",      pri: "high",   proj: "Canopy" },
    { done: false, label: "Finalize mod registry schema",   pri: "medium", proj: "Zaius"  },
  ]);

  const activity = [
    { what: "Shipped calc() support in layout.rs",      when: "2m ago"    },
    { what: "Added letter-spacing to composite.rs",     when: "18m ago"   },
    { what: "Merged custom titlebar — 10 commits",      when: "1h ago"    },
    { what: "Closed 4 beads tasks in rvst roadmap",     when: "3h ago"    },
    { what: "BitCodec v17 corpus assembled (120K ex.)", when: "Yesterday" },
  ];

  let taskFilter = $state("all");
  let settingsNotifs = $state(true);
  let settingsCompact = $state(false);
  let settingsTheme = $state("dark");
  let settingsTitlebar = $state("mac");

  function toggleTask(label) {
    const idx = tasks.findIndex(t => t.label === label);
    if (idx >= 0) { tasks[idx].done = !tasks[idx].done; }
  }

  function filteredTasks() {
    if (taskFilter === "open")   return tasks.filter(t => !t.done);
    if (taskFilter === "done")   return tasks.filter(t =>  t.done);
    return tasks;
  }

  const nav = [
    { id: "overview",  label: "Overview",  icon: "\uF470" },
    { id: "projects",  label: "Projects",  icon: "\uF41F" },
    { id: "tasks",     label: "Tasks",     icon: "\uF340" },
    { id: "settings",  label: "Settings",  icon: "\uF42B" },
  ];

  $effect(() => { globalThis.__rvst?.disableDecorations(); });

  const startDrag = (e) => {
    if (!e.target.closest("button") && !e.target.closest(".nav-item")) {
      globalThis.__rvst?.startDragging();
    }
  };
</script>

<div class="shell {settingsTheme} {settingsCompact ? 'compact' : ''}" >

  <!-- Titlebar -->
  <div class="titlebar" onmousedown={startDrag} role="banner">
    {#if settingsTitlebar === "mac"}
      <TrafficLights />
    {/if}
    <span class="win-title">Orbit</span>
    {#if settingsTitlebar === "windows"}
      <div class="win-controls">
        <button class="win-btn" onclick={() => globalThis.__rvst?.minimize()}>&#x2015;</button>
        <button class="win-btn" onclick={() => globalThis.__rvst?.maximize()}>&#x25A1;</button>
        <button class="win-btn win-close" onclick={() => globalThis.__rvst?.close()}>&#x2715;</button>
      </div>
    {:else}
      <button class="new-btn" onclick={() => { page = "tasks"; taskFilter = "open"; }}>+ New</button>
    {/if}
  </div>

  <div class="body">

    <!-- Sidebar -->
    <div class="sidebar">
      <div class="sidebar-section-label">WORKSPACE</div>
      {#each nav as n}
        <button
          class="nav-item {page === n.id ? 'active' : ''}"
          onclick={() => page = n.id}
        >
          <span class="nav-icon">{n.icon}</span>
          {n.label}
        </button>
      {/each}

      <div class="sidebar-section-label" style="margin-top:24px">PROJECTS</div>
      {#each projects as p}
        <button
          class="nav-item proj-item {page === 'projects' ? 'subtle' : ''}"
          onclick={() => page = "projects"}
        >
          <span class="proj-dot {p.status}"></span>
          {p.name}
        </button>
      {/each}
    </div>

    <!-- Main -->
    <div class="main">

      {#if page === "overview"}
        <div class="page-header">
          <div class="page-title">Good morning</div>
          <div class="page-sub">Here's what's happening across your workspace.</div>
        </div>

        <div class="stat-row">
          <div class="stat-card">
            <div class="stat-num">4</div>
            <div class="stat-label">Active projects</div>
          </div>
          <div class="stat-card">
            <div class="stat-num" style="color:#f38ba8">
              {tasks.filter(t => !t.done).length}
            </div>
            <div class="stat-label">Open tasks</div>
          </div>
          <div class="stat-card">
            <div class="stat-num" style="color:#a6e3a1">
              {tasks.filter(t => t.done).length}
            </div>
            <div class="stat-label">Completed</div>
          </div>
          <div class="stat-card">
            <div class="stat-num" style="color:#89b4fa">120K</div>
            <div class="stat-label">Training examples</div>
          </div>
        </div>

        <div class="section-title">Recent activity</div>
        <div class="activity-list">
          {#each activity as a}
            <div class="activity-row">
              <span class="activity-dot"></span>
              <span class="activity-what">{a.what}</span>
              <span class="activity-when">{a.when}</span>
            </div>
          {/each}
        </div>

      {:else if page === "projects"}
        <div class="page-header">
          <div class="page-title">Projects</div>
          <div class="page-sub">{projects.filter(p => p.status === "active").length} active · {projects.filter(p => p.status === "paused").length} paused</div>
        </div>

        <div class="proj-list">
          {#each projects as p}
            <div class="proj-row">
              <div class="proj-row-left">
                <span class="proj-dot-lg {p.status}"></span>
                <span class="proj-name">{p.name}</span>
                <span class="badge {p.status}">{p.status}</span>
              </div>
              <div class="proj-row-right">
                <span class="proj-tasks">{p.tasks} tasks</span>
                <div class="prog-track">
                  <div class="prog-fill {p.status}" style="width:{p.pct}%"></div>
                </div>
                <span class="proj-pct">{p.pct}%</span>
              </div>
            </div>
          {/each}
        </div>

      {:else if page === "tasks"}
        <div class="page-header">
          <div class="page-title">Tasks</div>
          <div class="task-filters">
            <button class="filter-btn {taskFilter === 'all'  ? 'active' : ''}" onclick={() => taskFilter = 'all'}>All</button>
            <button class="filter-btn {taskFilter === 'open' ? 'active' : ''}" onclick={() => taskFilter = 'open'}>Open</button>
            <button class="filter-btn {taskFilter === 'done' ? 'active' : ''}" onclick={() => taskFilter = 'done'}>Done</button>
          </div>
        </div>

        <div class="task-list">
          {#each filteredTasks() as t, i}
            <div class="task-row {t.done ? 'done' : ''}">
              <button class="check-btn {t.done ? 'checked' : ''}" onclick={() => toggleTask(t.label)}>
                <span class="check-icon">{t.done ? "\uF33E" : ""}</span>
              </button>
              <span class="task-label">{t.label}</span>
              <span class="pri-badge {t.pri}">{t.pri}</span>
              <span class="task-proj">{t.proj}</span>
            </div>
          {/each}
        </div>

      {:else if page === "settings"}
        <div class="page-header">
          <div class="page-title">Settings</div>
        </div>

        <div class="settings-group">
          <div class="settings-group-title">Appearance</div>
          <div class="settings-row">
            <span class="settings-label">Theme</span>
            <div class="theme-toggle">
              <button class="theme-btn {settingsTheme === 'dark' ? 'active' : ''}" onclick={() => settingsTheme = 'dark'}>Dark</button>
              <button class="theme-btn {settingsTheme === 'light' ? 'active' : ''}" onclick={() => settingsTheme = 'light'}>Light</button>
            </div>
          </div>
          <div class="settings-row">
            <span class="settings-label">Compact UI</span>
            <button class="toggle-pill {settingsCompact ? 'on' : ''}" onclick={() => settingsCompact = !settingsCompact}>
              <span class="toggle-knob"></span>
            </button>
          </div>
          <div class="settings-row">
            <span class="settings-label">Titlebar Style</span>
            <div class="theme-toggle">
              <button class="theme-btn {settingsTitlebar === 'mac' ? 'active' : ''}" onclick={() => settingsTitlebar = 'mac'}>Mac</button>
              <button class="theme-btn {settingsTitlebar === 'windows' ? 'active' : ''}" onclick={() => settingsTitlebar = 'windows'}>Windows</button>
            </div>
          </div>
        </div>

        <div class="settings-group">
          <div class="settings-group-title">Profile</div>
          <div class="settings-row">
            <span class="settings-label">Name</span>
            <div class="settings-value-box">Alex Rivera</div>
          </div>
          <div class="settings-row">
            <span class="settings-label">Email</span>
            <div class="settings-value-box">alex@zaius.dev</div>
          </div>
        </div>

        <div class="settings-group">
          <div class="settings-group-title">Notifications</div>
          <div class="settings-row">
            <span class="settings-label">PR Comments</span>
            <button class="toggle-pill on"><span class="toggle-knob"></span></button>
          </div>
          <div class="settings-row">
            <span class="settings-label">Mentions</span>
            <button class="toggle-pill {settingsNotifs ? 'on' : ''}" onclick={() => settingsNotifs = !settingsNotifs}>
              <span class="toggle-knob"></span>
            </button>
          </div>
        </div>
      {/if}

    </div>
  </div>
</div>

<style>
  /* ── Theme: Dark (default) ─────────────────────────────────────────── */
  .shell {
    display: flex; flex-direction: column; width: 100%; height: 100%;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    font-size: 14px;
    background-color: #1e1e2e; color: #cdd6f4;
  }
  /* ── Theme: Light (Apple-inspired) ───────────────────────────────── */
  .shell.light {
    background-color: #f8f8fa; color: #222;
  }
  .shell.light .titlebar  { background-color: #ececf0; border-bottom-color: #d4d4d8; }
  .shell.light .win-title { color: #444; }
  .shell.light .sidebar   { background-color: #f0f0f4; border-right-color: #d4d4d8; }
  .shell.light .sidebar-section-label { color: #8e8e93; }
  .shell.light .nav-item  { color: #444; }
  .shell.light .nav-icon  { color: #666; }
  .shell.light .nav-item.active { background-color: #007aff; color: #fff; }
  .shell.light .nav-item.active .nav-icon { color: #fff; }
  .shell.light .stat-card { background-color: #fff; border-color: #e0e0e4; }
  .shell.light .stat-num  { color: #111; }
  .shell.light .stat-label { color: #8e8e93; }
  .shell.light .activity-row { border-bottom-color: #e5e5ea; }
  .shell.light .activity-what { color: #222; }
  .shell.light .activity-when { color: #8e8e93; }
  .shell.light .activity-dot { background-color: #007aff; }
  .shell.light .proj-row  { background-color: #fff; border-color: #e0e0e4; }
  .shell.light .proj-name { color: #222; }
  .shell.light .proj-tasks { color: #8e8e93; }
  .shell.light .proj-pct { color: #8e8e93; }
  .shell.light .prog-track { background-color: #e5e5ea; }
  .shell.light .task-row  { border-bottom-color: #e5e5ea; }
  .shell.light .task-label { color: #222; }
  .shell.light .task-proj { color: #8e8e93; }
  .shell.light .page-title { color: #111; }
  .shell.light .page-sub  { color: #8e8e93; }
  .shell.light .section-title { color: #8e8e93; }
  .shell.light .settings-row { border-bottom-color: #e5e5ea; }
  .shell.light .settings-label { color: #444; }
  .shell.light .settings-group-title { color: #8e8e93; }
  .shell.light .settings-value-box { background-color: #fff; border-color: #d4d4d8; color: #222; }
  .shell.light .filter-btn { border-color: #d4d4d8; color: #444; background-color: #fff; }
  .shell.light .filter-btn.active { background-color: #007aff; color: #fff; border-color: #007aff; }
  .shell.light .theme-btn { border-color: #d4d4d8; color: #444; background-color: #fff; }
  .shell.light .theme-btn.active { background-color: #007aff; color: #fff; border-color: #007aff; }
  .shell.light .check-btn { border-color: #c7c7cc; background-color: #fff; }
  .shell.light .check-btn.checked { background-color: #007aff; border-color: #007aff; color: #fff; }
  .shell.light .new-btn { background-color: #007aff; color: #fff; }
  .shell.light .toggle-pill { background-color: #e5e5ea; }
  .shell.light .toggle-pill.on { background-color: #34c759; }
  .shell.light .toggle-knob { background-color: #fff; }

  /* ── Compact mode ──────────────────────────────────────────────────── */
  .shell.compact .titlebar { height: 30px; min-height: 30px; }
  .shell.compact .sidebar  { width: 160px; min-width: 160px; padding: 8px 6px; }
  .shell.compact .nav-item { padding: 4px 6px; font-size: 12px; }
  .shell.compact .nav-icon { font-size: 13px; width: 14px; min-width: 14px; }
  .shell.compact .main     { padding: 20px 24px; }
  .shell.compact .page-title { font-size: 17px; }
  .shell.compact .stat-card { padding: 10px 14px; min-width: 90px; }
  .shell.compact .stat-num { font-size: 22px; }
  .shell.compact .stat-label { font-size: 10px; }
  .shell.compact .sidebar-section-label { font-size: 9px; }

  /* ── Titlebar ───────────────────────────────────────────────────────── */
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
  .new-btn {
    background-color: #89b4fa; color: #1e1e2e; border: none; border-radius: 5px;
    padding: 4px 10px; font-size: 12px; font-weight: 600; cursor: pointer;
  }

  /* ── Windows titlebar controls ─────────────────────────────────────── */
  .win-controls {
    display: flex; flex-direction: row; align-items: center; gap: 0px;
  }
  .win-btn {
    width: 46px; height: 38px; background: none; border: none;
    color: #a6adc8; font-size: 13px; cursor: pointer; display: flex;
    align-items: center; justify-content: center;
  }
  .win-close { color: #fff; }
  .shell.light .win-btn { color: #555; }
  .shell.light .win-close { color: #1e1e2e; }

  /* ── Body ───────────────────────────────────────────────────────────── */
  .body { display: flex; flex-direction: row; flex: 1; overflow: hidden; }

  /* ── Sidebar ────────────────────────────────────────────────────────── */
  .sidebar {
    display: flex; flex-direction: column; width: 200px; min-width: 200px;
    background-color: #181825; border-right: 1px solid #313244;
    padding: 12px 8px; gap: 2px;
    text-align: left;
  }
  .sidebar-section-label {
    font-size: 10px; font-weight: 700; color: #585b70;
    letter-spacing: 0.08em; padding: 0 8px; margin-bottom: 4px;
  }
  .nav-item {
    display: flex; flex-direction: row; align-items: center; gap: 8px;
    background: none; border: none; color: #a6adc8; font-size: 13px;
    padding: 6px 8px; border-radius: 6px; cursor: pointer; text-align: left; width: 100%;
  }
  .nav-item.active { background-color: #313244; color: #cdd6f4; font-weight: 500; }
  .nav-icon { font-family: "Phosphor"; font-size: 16px; width: 16px; min-width: 16px; }
  .proj-dot { width: 8px; height: 8px; border-radius: 50%; min-width: 8px; }
  .proj-dot.active  { background-color: #a6e3a1; }
  .proj-dot.paused  { background-color: #fab387; }

  /* ── Main ───────────────────────────────────────────────────────────── */
  .main {
    display: flex; flex-direction: column; flex: 1;
    padding: 28px 32px; gap: 0px; overflow: hidden;
    text-align: left;
  }
  .page-header { display: flex; flex-direction: column; gap: 4px; margin-bottom: 24px; }
  .page-title { font-size: 20px; font-weight: 700; color: #cdd6f4; }
  .page-sub { font-size: 13px; color: #6c7086; }
  .section-title {
    font-size: 12px; font-weight: 600; color: #585b70;
    letter-spacing: 0.06em; text-transform: uppercase; margin-bottom: 12px; margin-top: 8px;
  }

  /* ── Stat cards ─────────────────────────────────────────────────────── */
  .stat-row { display: flex; flex-direction: row; gap: 12px; margin-bottom: 28px; }
  .stat-card {
    display: flex; flex-direction: column; gap: 4px;
    background-color: #181825; border: 1px solid #313244; border-radius: 8px;
    padding: 16px 20px; min-width: 110px;
  }
  .stat-num { font-size: 28px; font-weight: 700; color: #cdd6f4; }
  .stat-label { font-size: 12px; color: #6c7086; }

  /* ── Activity ───────────────────────────────────────────────────────── */
  .activity-list { display: flex; flex-direction: column; gap: 0px; }
  .activity-row {
    display: flex; flex-direction: row; align-items: center; gap: 10px;
    padding: 10px 0; border-bottom: 1px solid #313244;
  }
  .activity-dot { width: 6px; height: 6px; border-radius: 50%; background-color: #89b4fa; min-width: 6px; }
  .activity-what { flex: 1; font-size: 13px; color: #cdd6f4; text-align: left; }
  .activity-when { font-size: 12px; color: #585b70; }

  /* ── Projects ───────────────────────────────────────────────────────── */
  .proj-list { display: flex; flex-direction: column; gap: 2px; }
  .proj-row {
    display: flex; flex-direction: row; align-items: center;
    padding: 12px 16px; background-color: #181825; border: 1px solid #313244;
    border-radius: 8px; gap: 12px; margin-bottom: 6px;
  }
  .proj-row-left { display: flex; flex-direction: row; align-items: center; gap: 10px; flex: 1; }
  .proj-row-right { display: flex; flex-direction: row; align-items: center; gap: 12px; }
  .proj-dot-lg { width: 10px; height: 10px; border-radius: 50%; min-width: 10px; }
  .proj-dot-lg.active { background-color: #a6e3a1; }
  .proj-dot-lg.paused { background-color: #fab387; }
  .proj-name { font-weight: 500; color: #cdd6f4; font-size: 14px; }
  .badge { font-size: 11px; padding: 3px 8px; border-radius: 10px; font-weight: 600; text-align: center; }
  .badge.active { background-color: #1e3a2f; color: #a6e3a1; }
  .badge.paused { background-color: #3d2a1a; color: #fab387; }
  .proj-tasks { font-size: 12px; color: #6c7086; min-width: 48px; text-align: right; }
  .prog-track { width: 80px; height: 4px; background-color: #313244; border-radius: 2px; overflow: hidden; }
  .prog-fill { height: 4px; border-radius: 2px; }
  .prog-fill.active { background-color: #a6e3a1; }
  .prog-fill.paused { background-color: #fab387; }
  .proj-pct { font-size: 12px; color: #6c7086; min-width: 32px; text-align: right; }

  /* ── Tasks ──────────────────────────────────────────────────────────── */
  .task-filters { display: flex; flex-direction: row; gap: 4px; margin-top: 8px; }
  .filter-btn {
    background: none; border: 1px solid #313244; color: #a6adc8;
    font-size: 12px; padding: 4px 12px; border-radius: 5px; cursor: pointer;
  }
  .filter-btn.active { background-color: #313244; color: #cdd6f4; border-color: #45475a; }
  .task-list { display: flex; flex-direction: column; gap: 0px; margin-top: 16px; }
  .task-row {
    display: flex; flex-direction: row; align-items: center; gap: 10px;
    padding: 10px 0; border-bottom: 1px solid #313244;
  }
  .task-row.done .task-label { color: #45475a; }
  .check-btn {
    width: 18px; height: 18px; border-radius: 4px; border: 1px solid #45475a;
    background: none; color: #a6e3a1; cursor: pointer; min-width: 18px;
    display: flex; align-items: center; justify-content: center;
  }
  .check-btn.checked { background-color: #1e3a2f; border-color: #a6e3a1; }
  .check-icon { font-family: "Phosphor"; font-size: 11px; width: 11px; height: 11px; min-width: 11px; }
  .task-label { flex: 1; font-size: 13px; color: #cdd6f4; text-align: left; }
  .pri-badge {
    font-size: 10px; padding: 4px 8px; border-radius: 4px; font-weight: 600;
    text-transform: uppercase; text-align: center; min-width: 52px;
  }
  .pri-badge.high   { background-color: #3d1a1a; color: #f38ba8; }
  .pri-badge.medium { background-color: #3d2a1a; color: #fab387; }
  .pri-badge.low    { background-color: #313244; color: #6c7086; }
  .task-proj { font-size: 12px; color: #585b70; min-width: 52px; text-align: right; }

  /* Light theme task/badge overrides */
  .shell.light .task-row.done .task-label { color: #c7c7cc; }
  .shell.light .pri-badge.high   { background-color: #ffebee; color: #d32f2f; }
  .shell.light .pri-badge.medium { background-color: #fff3e0; color: #e65100; }
  .shell.light .pri-badge.low    { background-color: #f5f5f5; color: #8e8e93; }
  .shell.light .badge.active { background-color: #e8f5e9; color: #2e7d32; }
  .shell.light .badge.paused { background-color: #fff3e0; color: #e65100; }

  /* ── Settings ───────────────────────────────────────────────────────── */
  .settings-group { display: flex; flex-direction: column; gap: 0px; margin-bottom: 24px; }
  .settings-group-title {
    font-size: 11px; font-weight: 700; color: #585b70;
    letter-spacing: 0.06em; text-transform: uppercase; margin-bottom: 8px;
  }
  .settings-row {
    display: flex; flex-direction: row; align-items: center;
    padding: 10px 0; border-bottom: 1px solid #313244; gap: 12px;
  }
  .settings-label { flex: 1; font-size: 13px; color: #a6adc8; text-align: left; }
  .settings-value-box {
    font-size: 13px; color: #cdd6f4; background-color: #181825;
    border: 1px solid #313244; border-radius: 5px; padding: 5px 12px; min-width: 180px;
    text-align: left;
  }
  .theme-toggle { display: flex; flex-direction: row; gap: 4px; }
  .theme-btn {
    background: none; border: 1px solid #313244; color: #a6adc8;
    font-size: 12px; padding: 4px 12px; border-radius: 5px; cursor: pointer;
  }
  .theme-btn.active { background-color: #313244; color: #cdd6f4; }
  .toggle-pill {
    width: 36px; height: 20px; border-radius: 10px; background-color: #313244;
    border: none; cursor: pointer; padding: 2px; display: flex;
    flex-direction: row; align-items: center;
  }
  .toggle-pill.on { background-color: #89b4fa; }
  .toggle-knob { width: 16px; height: 16px; border-radius: 50%; background-color: #cdd6f4; }
  .toggle-pill.on .toggle-knob { margin-left: 16px; }

  /* Light theme toggle overrides */
  .shell.light .toggle-pill { background-color: #ccc; }
  .shell.light .toggle-pill.on { background-color: #3b82f6; }
  .shell.light .toggle-knob { background-color: #fff; }
</style>

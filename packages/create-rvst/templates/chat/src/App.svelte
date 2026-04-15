<script>
  import TrafficLights from "./TrafficLights.svelte";
  import { Toaster, toast } from "svelte-sonner";
  let showWelcome = $state(true);

  // ── context menu ──────────────────────────────────────────────────────
  let ctxMenu = $state({ show: false, x: 0, y: 0, text: "", anchorY: 0, scrollAtOpen: 0 });

  // Context menu dimensions
  const CTX_W = 180;
  const CTX_H = 140;

  // Sidebar contact context menu
  let sidebarCtx = $state({ show: false, x: 0, y: 0, contactId: "", contactName: "" });

  function onContactContext(e, contact) {
    e.preventDefault();
    let cx = Math.min(e.clientX ?? 200, VP_W - CTX_W - 8);
    let cy = Math.min(e.clientY ?? 200, VP_H - CTX_H - 8);
    sidebarCtx = { show: true, x: Math.max(cx, 8), y: Math.max(cy, 8), contactId: contact.id, contactName: contact.name };
  }

  function sidebarCtxAction(action) {
    const name = sidebarCtx.contactName;
    sidebarCtx.show = false;
    if (action === "mute") toast.info(`Muted ${name}`);
    else if (action === "pin") toast.success(`Pinned ${name}`);
    else if (action === "archive") toast(`Archived ${name}`);
    else if (action === "block") toast.error(`Blocked ${name}`);
  }
  const VP_W = 1024;
  const VP_H = 768;

  function onBubbleContext(e, text) {
    e.preventDefault();
    let cx = e.clientX ?? e.pageX ?? 200;
    let cy = e.clientY ?? e.pageY ?? 200;
    // Clamp to viewport so menu never goes off-screen
    cx = Math.min(cx, VP_W - CTX_W - 8);
    cy = Math.min(cy, VP_H - CTX_H - 8);
    cx = Math.max(cx, 8);
    cy = Math.max(cy, 8);
    sidebarCtx.show = false;
    const scrollPos = threadEl ? threadEl._scrollTop || 0 : 0;
    ctxMenu = { show: true, x: cx, y: cy, text, anchorY: cy, scrollAtOpen: scrollPos };
  }

  function closeCtxMenu() {
    ctxMenu.show = false;
  }

  // Reposition message context menu on scroll (pinned to message)
  function onThreadScroll() {
    if (ctxMenu.show && threadEl) {
      const currentScroll = threadEl._scrollTop || 0;
      const delta = currentScroll - ctxMenu.scrollAtOpen;
      const newY = ctxMenu.anchorY - delta;
      // If menu scrolled out of visible area, dismiss it
      if (newY < 40 || newY > VP_H - 20) {
        closeCtxMenu();
      } else {
        ctxMenu.y = Math.max(8, Math.min(newY, VP_H - CTX_H - 8));
      }
    }
  }

  // ── command palette ────────────────────────────────────────────────
  let cmdPalette = $state({ show: false, query: "", selected: 0 });
  const commands = [
    { id: "new-chat", label: "New Chat", desc: "Start a new conversation", icon: "\uF503" },
    { id: "search", label: "Search Messages", desc: "Find messages across all chats", icon: "\uF4A8" },
    { id: "theme", label: "Toggle Theme", desc: "Switch between light and dark mode", icon: "\uF416" },
    { id: "clear", label: "Clear Chat", desc: "Remove all messages in current chat", icon: "\uF3EB" },
    { id: "settings", label: "Settings", desc: "Open app preferences", icon: "\uF31C" },
    { id: "about", label: "About RVST", desc: "Version and system info", icon: "\uF31A" },
  ];
  let filteredCmds = $derived(
    cmdPalette.query
      ? commands.filter(c => c.label.toLowerCase().includes(cmdPalette.query.toLowerCase()))
      : commands
  );

  function runCommand(id) {
    cmdPalette.show = false;
    cmdPalette.query = "";
    toast.success(`Executed: ${id}`);
  }

  function onKeydown(e) {
    // Cmd+K or Ctrl+K → open command palette
    if ((e.metaKey || e.ctrlKey) && e.key === "k") {
      e.preventDefault();
      cmdPalette.show = !cmdPalette.show;
      cmdPalette.query = "";
      cmdPalette.selected = 0;
      return;
    }
    if (e.key === "Escape") {
      if (cmdPalette.show) { cmdPalette.show = false; return; }
      if (ctxMenu.show) { ctxMenu.show = false; return; }
      if (sidebarCtx.show) { sidebarCtx.show = false; return; }
      if (showWelcome) { showWelcome = false; return; }
    }
    if (cmdPalette.show) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        cmdPalette.selected = Math.min(cmdPalette.selected + 1, filteredCmds.length - 1);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        cmdPalette.selected = Math.max(cmdPalette.selected - 1, 0);
      } else if (e.key === "Enter" && filteredCmds.length > 0) {
        e.preventDefault();
        runCommand(filteredCmds[cmdPalette.selected].id);
      }
    }
  }

  function ctxAction(action) {
    if (action === "copy") {
      toast.success("Copied to clipboard");
    } else if (action === "reply") {
      toast.info("Reply started");
    } else if (action === "delete") {
      toast.error("Message deleted");
    }
    ctxMenu.show = false;
  }

  // ── contacts ───────────────────────────────────────────────────────────
  const contacts = [
    { id: "elena",   name: "Elena Ruiz",      color: "#f38ba8", status: "online",  lastMsg: "Sounds good, let me check the PR",         time: "2m ago"    },
    { id: "marcus",  name: "Marcus Chen",      color: "#a6e3a1", status: "online",  lastMsg: "The build is passing now",                  time: "15m ago"   },
    { id: "sofia",   name: "Sofia Andersson",  color: "#89b4fa", status: "away",    lastMsg: "I'll review it tomorrow morning",           time: "1h ago"    },
    { id: "james",   name: "James Okafor",     color: "#fab387", status: "online",  lastMsg: "Can you share the figma link?",             time: "2h ago"    },
    { id: "lina",    name: "Lina Park",        color: "#cba6f7", status: "offline", lastMsg: "Meeting moved to 3pm",                      time: "5h ago"    },
    { id: "omar",    name: "Omar Hassan",      color: "#94e2d5", status: "away",    lastMsg: "Thanks for the quick fix!",                 time: "Yesterday" },
    { id: "nina",    name: "Nina Volkov",      color: "#f9e2af", status: "offline", lastMsg: "Let me know when the deploy finishes",      time: "Yesterday" },
  ];

  // ── per-contact message history ────────────────────────────────────────
  const initialMessages = {
    elena: [
      { from: "them", text: "Hey, did you see the latest commit on the layout engine?",                         time: "10:02 AM" },
      { from: "me",   text: "Yeah! The flexbox implementation looks solid.",                                     time: "10:04 AM" },
      { from: "them", text: "I found a small edge case with nested containers though. The gap property isn't being inherited correctly when there are more than 3 levels of nesting.", time: "10:05 AM" },
      { from: "me",   text: "Hmm, can you open an issue? I'll look at it after lunch.",                          time: "10:06 AM" },
      { from: "them", text: "Already done. Issue #247.",                                                          time: "10:07 AM" },
      { from: "me",   text: "Perfect, thanks!",                                                                  time: "10:07 AM" },
      { from: "them", text: "Also, the titlebar drag region needs a fix on Windows. The hit test area is too small.", time: "10:12 AM" },
      { from: "me",   text: "I noticed that too. I have a patch ready, just need to test it.",                    time: "10:14 AM" },
      { from: "them", text: "Nice. Want me to test on my machine?",                                              time: "10:15 AM" },
      { from: "me",   text: "That would be great. I'll push in about an hour.",                                   time: "10:16 AM" },
      { from: "them", text: "Sounds good, let me check the PR",                                                  time: "10:18 AM" },
      { from: "me",   text: "Just pushed. Branch is feature/taffy-gap-fix.",                                      time: "10:25 AM" },
      { from: "them", text: "Pulling now. Also I noticed the scroll container is clipping the last row in the table view. Is that the same bug?", time: "10:28 AM" },
      { from: "me",   text: "Different issue actually. The virtual scroll buffer isn't accounting for the row height correctly when rows have different content lengths.", time: "10:30 AM" },
      { from: "them", text: "Ah right, variable height rows. That's always tricky.",                              time: "10:31 AM" },
      { from: "me",   text: "Yeah. I'm thinking we measure the first 20 rows to get an average height estimate, then use that for the placeholder sizing.", time: "10:33 AM" },
      { from: "them", text: "Makes sense. What about a resize observer to correct the estimates as you scroll?",  time: "10:35 AM" },
      { from: "me",   text: "We don't have ResizeObserver in the runtime yet, but we could use the layout pass to detect size changes and update the estimates.", time: "10:37 AM" },
      { from: "them", text: "Oh that's clever. The layout engine already knows the real sizes after Taffy runs.",  time: "10:38 AM" },
      { from: "me",   text: "Exactly. Post-layout correction. Zero overhead.",                                    time: "10:39 AM" },
      { from: "them", text: "Love it. Want me to pair on this? I have the afternoon free.",                        time: "10:40 AM" },
      { from: "me",   text: "That would be awesome. Meet in 30?",                                                time: "10:41 AM" },
      { from: "them", text: "Perfect. I'll set up a branch. See you then!",                                       time: "10:42 AM" },
      { from: "me",   text: "See you!",                                                                          time: "10:43 AM" },
      { from: "them", text: "Oh one more thing — the font rendering on Windows looks slightly off. The letter spacing seems tighter than on macOS.", time: "10:45 AM" },
      { from: "me",   text: "I noticed that too. It's a parley shaping difference. We might need platform-specific font metrics.", time: "10:47 AM" },
      { from: "them", text: "Should we track that as a P1?",                                                      time: "10:48 AM" },
      { from: "me",   text: "P2 probably. It's cosmetic and we have bigger rendering features to land first.",    time: "10:49 AM" },
      { from: "them", text: "Fair enough. Okay heading to lunch, see you at 11:15!",                              time: "10:50 AM" },
      { from: "me",   text: "Sounds good!",                                                                       time: "10:51 AM" },
    ],
    marcus: [
      { from: "me",   text: "Hey Marcus, is CI green?",                                                          time: "9:30 AM"  },
      { from: "them", text: "It was failing earlier because of a flaky test in the rendering pipeline.",          time: "9:32 AM"  },
      { from: "them", text: "I added a retry and bumped the timeout. Should be stable now.",                      time: "9:33 AM"  },
      { from: "me",   text: "Which test was it?",                                                                time: "9:35 AM"  },
      { from: "them", text: "The compositing stress test. It was timing out on the M1 runner.",                   time: "9:36 AM"  },
      { from: "me",   text: "Ah, makes sense. Those GPU tests are always finicky on CI.",                         time: "9:37 AM"  },
      { from: "them", text: "The build is passing now",                                                           time: "9:40 AM"  },
    ],
    sofia: [
      { from: "them", text: "Hey! I started looking at the CSS parser refactor.",                                  time: "Yesterday" },
      { from: "me",   text: "Great, how's it going?",                                                             time: "Yesterday" },
      { from: "them", text: "Pretty well. I split the tokenizer into its own module. Much cleaner now.",           time: "Yesterday" },
      { from: "them", text: "There's one thing I'm not sure about though - should we support CSS nesting at this stage, or defer it?", time: "Yesterday" },
      { from: "me",   text: "Let's defer nesting for now. We can add it in v2. Focus on getting the core selectors right first.", time: "Yesterday" },
      { from: "them", text: "Makes sense. I'll have a PR ready by end of week.",                                   time: "Yesterday" },
      { from: "me",   text: "Awesome. Can you also add some tests for the calc() expressions?",                    time: "Yesterday" },
      { from: "them", text: "I'll review it tomorrow morning",                                                     time: "Yesterday" },
    ],
    james: [
      { from: "them", text: "Quick question about the component library",                                         time: "11:00 AM" },
      { from: "me",   text: "Sure, what's up?",                                                                   time: "11:02 AM" },
      { from: "them", text: "I'm working on the new button variants and I want to make sure the hover states match the design spec.", time: "11:03 AM" },
      { from: "me",   text: "The Figma file has all the interaction states documented.",                           time: "11:05 AM" },
      { from: "them", text: "Can you share the figma link?",                                                      time: "11:06 AM" },
    ],
    lina: [
      { from: "them", text: "The standup tomorrow is moved to 3pm because of the all-hands.",                     time: "Yesterday" },
      { from: "me",   text: "Got it, thanks for the heads up.",                                                    time: "Yesterday" },
      { from: "them", text: "Also, can you present the rendering perf improvements you made last week?",           time: "Yesterday" },
      { from: "me",   text: "Sure! I have some nice before/after benchmarks to show.",                             time: "Yesterday" },
      { from: "them", text: "Meeting moved to 3pm",                                                               time: "Yesterday" },
    ],
    omar: [
      { from: "me",   text: "Hey Omar, I pushed a hotfix for the memory leak in the event loop.",                  time: "Yesterday" },
      { from: "them", text: "Oh nice, I was just about to look into that!",                                        time: "Yesterday" },
      { from: "me",   text: "It was a missing cleanup in the window resize handler. Pretty straightforward fix.",  time: "Yesterday" },
      { from: "them", text: "Thanks for the quick fix!",                                                           time: "Yesterday" },
    ],
    nina: [
      { from: "them", text: "The staging deploy is running. Should be done in about 10 minutes.",                  time: "Yesterday" },
      { from: "me",   text: "Great. I'll check the performance dashboard once it's up.",                            time: "Yesterday" },
      { from: "them", text: "Let me know when the deploy finishes",                                                time: "Yesterday" },
    ],
  };

  // ── state ──────────────────────────────────────────────────────────────
  let selectedContact = $state("elena");
  let messages = $state(structuredClone(initialMessages));
  let inputText = $state("");
  let searchText = $state("");

  // ── derived ────────────────────────────────────────────────────────────
  let currentContact = $derived(contacts.find(c => c.id === selectedContact));
  let currentMessages = $derived(messages[selectedContact] ?? []);
  let filteredContacts = $derived(
    searchText.trim() === ""
      ? contacts
      : contacts.filter(c => c.name.toLowerCase().includes(searchText.toLowerCase()))
  );

  // ── auto-scroll ────────────────────────────────────────────────────────
  let threadEl = $state(null);

  $effect(() => {
    // track currentMessages length to trigger scroll
    currentMessages.length;
    if (threadEl) {
      requestAnimationFrame(() => {
        threadEl.scrollTop = threadEl.scrollHeight;
      });
    }
  });

  // ── actions ────────────────────────────────────────────────────────────
  function sendMessage() {
    const text = inputText.trim();
    if (!text) return;
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes().toString().padStart(2, "0");
    const ampm = hours >= 12 ? "PM" : "AM";
    const h = hours % 12 || 12;
    const time = `${h}:${minutes} ${ampm}`;

    if (!messages[selectedContact]) messages[selectedContact] = [];
    messages[selectedContact] = [...messages[selectedContact], { from: "me", text, time }];
    toast.success("Message sent"); // needs portal support
    inputText = "";
  }

  function handleKeydown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  function selectContact(id) {
    selectedContact = id;
  }

  // ── titlebar drag ──────────────────────────────────────────────────────
  $effect(() => { globalThis.__rvst?.disableDecorations(); });

  const startDrag = (e) => {
    if (!e.target.closest("button")) {
      globalThis.__rvst?.startDragging();
    }
  };
</script>

<svelte:window onkeydown={onKeydown} />

<div class="shell">
<Toaster richColors position="top-right" />
  <!-- Titlebar -->
  <div class="titlebar" onmousedown={startDrag} role="banner">
    <TrafficLights />
    <span class="win-title">Messages</span>
    <div class="title-spacer"></div>
  </div>

  <div class="body">

    <!-- Sidebar -->
    <div class="sidebar">
      <div class="search-box">
        <span class="search-icon">{"\uF4A8"}</span>
        <input
          class="search-input"
          type="text"
          placeholder="Search"
          bind:value={searchText}
          aria-label="Search contacts"
        />
      </div>

      <div class="contact-list">
        {#each filteredContacts as c}
          <button
            class="contact-row {selectedContact === c.id ? 'active' : ''}"
            onclick={() => selectContact(c.id)}
            oncontextmenu={(e) => onContactContext(e, c)}
            aria-label="Chat with {c.name}"
          >
            <div class="avatar" style="background-color: {c.color}">
              {c.name[0]}
            </div>
            <div class="contact-info">
              <div class="contact-top">
                <span class="contact-name">{c.name}</span>
                <span class="contact-time">{c.time}</span>
              </div>
              <div class="contact-preview">{c.lastMsg}</div>
            </div>
          </button>
        {/each}
      </div>
    </div>

    <!-- Chat area -->
    <div class="chat-area">

      <!-- Chat header -->
      <div class="chat-header">
        <div class="header-avatar" style="background-color: {currentContact?.color ?? '#313244'}">
          {currentContact?.name[0] ?? "?"}
        </div>
        <div class="header-info">
          <div class="header-name">{currentContact?.name ?? ""}</div>
          <div class="header-status">
            <span class="status-dot {currentContact?.status ?? 'offline'}"></span>
            {currentContact?.status ?? "offline"}
          </div>
        </div>
      </div>

      <!-- Message thread -->
      <div class="thread" bind:this={threadEl} onscroll={onThreadScroll}>
        {#each currentMessages as msg}
          <div class="msg-wrapper {msg.from === 'me' ? 'sent' : 'received'}">
            <div
              class="bubble {msg.from === 'me' ? 'bubble-sent' : 'bubble-recv'}"
              oncontextmenu={(e) => onBubbleContext(e, msg.text)}
            >
              {msg.text}
            </div>
            <div class="msg-time {msg.from === 'me' ? 'time-sent' : 'time-recv'}">{msg.time}</div>
          </div>
        {/each}
      </div>

      <!-- Input bar -->
      <div class="input-bar">
        <input
          class="msg-input"
          type="text"
          placeholder="Type a message..."
          bind:value={inputText}
          onkeydown={handleKeydown}
          aria-label="Type a message"
        />
        <button class="send-btn" onclick={sendMessage} aria-label="Send">
          <span class="send-icon">{"\uF503"}</span>
        </button>
      </div>

    </div>
  </div>

  {#if cmdPalette.show}
    <div class="cmd-backdrop" onclick={() => cmdPalette.show = false}></div>
    <div class="cmd-palette">
      <input
        class="cmd-input"
        type="text"
        placeholder="Type a command..."
        bind:value={cmdPalette.query}
        aria-label="Command palette"
      />
      <div class="cmd-results">
        {#each filteredCmds as cmd, i}
          <button
            class="cmd-item {cmdPalette.selected === i ? 'cmd-selected' : ''}"
            onclick={() => runCommand(cmd.id)}
          >
            <span class="cmd-icon">{cmd.icon}</span>
            <div class="cmd-text">
              <span class="cmd-label">{cmd.label}</span>
              <span class="cmd-desc">{cmd.desc}</span>
            </div>
          </button>
        {/each}
        {#if filteredCmds.length === 0}
          <div class="cmd-empty">No commands found</div>
        {/if}
      </div>
    </div>
  {/if}

  {#if ctxMenu.show}
    <div class="ctx-backdrop" onclick={closeCtxMenu} oncontextmenu={(e) => { e.preventDefault(); closeCtxMenu(); }}></div>
    <div class="ctx-menu" style="left: {ctxMenu.x}px; top: {ctxMenu.y}px;">
      <div class="ctx-header">{ctxMenu.text.length > 30 ? ctxMenu.text.slice(0, 30) + '...' : ctxMenu.text}</div>
      <div class="ctx-divider"></div>
      <button class="ctx-item" onclick={() => ctxAction("copy")}>
        Copy text
      </button>
      <button class="ctx-item" onclick={() => ctxAction("reply")}>
        Reply
      </button>
      <button class="ctx-item ctx-danger" onclick={() => ctxAction("delete")}>
        Delete
      </button>
    </div>
  {/if}

  {#if sidebarCtx.show}
    <div class="ctx-backdrop" onclick={() => sidebarCtx.show = false} oncontextmenu={(e) => { e.preventDefault(); sidebarCtx.show = false; }}></div>
    <div class="ctx-menu" style="left: {sidebarCtx.x}px; top: {sidebarCtx.y}px;">
      <div class="ctx-header">{sidebarCtx.contactName}</div>
      <div class="ctx-divider"></div>
      <button class="ctx-item" onclick={() => sidebarCtxAction("pin")}>
        Pin conversation
      </button>
      <button class="ctx-item" onclick={() => sidebarCtxAction("mute")}>
        Mute notifications
      </button>
      <button class="ctx-item" onclick={() => sidebarCtxAction("archive")}>
        Archive chat
      </button>
      <button class="ctx-item ctx-danger" onclick={() => sidebarCtxAction("block")}>
        Block contact
      </button>
    </div>
  {/if}

  {#if showWelcome}
    <div class="modal-overlay">
      <div class="modal-card">
        <div class="modal-title">Welcome to RVST Messages</div>
        <div class="modal-body">This app is rendered natively using Svelte 5 + Rust — no browser, no Electron. This modal uses position:fixed to overlay on top of everything.</div>
        <button class="modal-dismiss" onclick={() => showWelcome = false}>Got it!</button>
      </div>
    </div>
  {/if}
</div>

<style>
  /* ── Root height fix ────────────────────────────────────────────────── */
  :global(html), :global(body), :global(body > *) {
    height: 100%; margin: 0; padding: 0;
  }

  /* ── Shell ──────────────────────────────────────────────────────────── */
  .shell {
    display: flex; flex-direction: column; width: 100%; height: 100%;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    font-size: 14px;
    background-color: #1e1e2e; color: #cdd6f4;
    overflow: hidden;
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
  .title-spacer { width: 68px; }

  /* ── Body ───────────────────────────────────────────────────────────── */
  .body { display: flex; flex-direction: row; flex: 1; overflow: hidden; }

  /* ── Sidebar ────────────────────────────────────────────────────────── */
  .sidebar {
    display: flex; flex-direction: column; width: 200px; min-width: 200px;
    background-color: #181825; border-right: 1px solid #313244;
    text-align: left;
  }

  /* ── Icons ──────────────────────────────────────────────────────────── */
  .search-icon {
    font-family: "Phosphor"; font-size: 15px; color: #6c7086;
    width: 15px; min-width: 15px;
  }

  /* ── Search ─────────────────────────────────────────────────────────── */
  .search-box {
    display: flex; flex-direction: row; align-items: center; gap: 8px;
    padding: 10px 12px;
    border-bottom: 1px solid #313244;
  }
  .search-input {
    flex-grow: 1; flex-shrink: 1; flex-basis: auto;
    background-color: #313244; border: none; border-radius: 6px;
    padding: 8px 10px; outline: none;
    color: #cdd6f4; font-size: 13px; width: 100%;
  }
  .search-input::placeholder { color: #6c7086; }

  /* ── Contact list ───────────────────────────────────────────────────── */
  .contact-list {
    display: flex; flex-direction: column;
    overflow-y: auto; flex: 1;
  }
  .contact-row {
    display: flex; flex-direction: row; align-items: center; gap: 10px;
    padding: 10px 12px;
    background: none; border: none; cursor: pointer;
    text-align: left; width: 100%;
    border-bottom: 1px solid #252536;
  }
  .contact-row.active {
    background-color: rgba(137, 180, 250, 0.12);
  }

  /* ── Avatar ─────────────────────────────────────────────────────────── */
  .avatar {
    width: 34px; height: 34px; min-width: 34px;
    border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    font-size: 14px; font-weight: 700; color: #1e1e2e;
    line-height: 34px;
    padding-top: 0; padding-bottom: 2px;
  }

  /* ── Contact info ───────────────────────────────────────────────────── */
  .contact-info {
    display: flex; flex-direction: column; gap: 2px;
    flex: 1; overflow: hidden;
  }
  .contact-top {
    display: flex; flex-direction: row; align-items: center; gap: 4px;
  }
  .contact-name {
    flex: 1; font-size: 13px; font-weight: 500; color: #cdd6f4;
    overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
  }
  .contact-time {
    font-size: 10px; color: #6c7086; white-space: nowrap;
  }
  .contact-preview {
    font-size: 11px; color: #6c7086;
    overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
  }

  /* ── Chat area ──────────────────────────────────────────────────────── */
  .chat-area {
    display: flex; flex-direction: column; flex: 1;
    overflow: hidden;
  }

  /* ── Chat header ────────────────────────────────────────────────────── */
  .chat-header {
    display: flex; flex-direction: row; align-items: center; gap: 10px;
    padding: 10px 16px;
    border-bottom: 1px solid #313244;
    background-color: #1e1e2e;
  }
  .header-avatar {
    width: 32px; height: 32px; min-width: 32px;
    border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    font-size: 14px; font-weight: 700; color: #1e1e2e;
    line-height: 32px;
    padding-bottom: 2px;
  }
  .header-info {
    display: flex; flex-direction: column; gap: 1px;
  }
  .header-name {
    font-size: 14px; font-weight: 600; color: #cdd6f4;
  }
  .header-status {
    display: flex; flex-direction: row; align-items: center; gap: 5px;
    font-size: 12px; color: #6c7086;
  }
  .status-dot {
    width: 8px; height: 8px; border-radius: 50%;
    min-width: 8px; min-height: 8px;
    flex-shrink: 0;
    display: block;
    line-height: 0;
    font-size: 0;
    overflow: hidden;
  }
  .status-dot.online  { background-color: #a6e3a1; }
  .status-dot.away    { background-color: #fab387; }
  .status-dot.offline { background-color: #585b70; }

  /* ── Thread ─────────────────────────────────────────────────────────── */
  .thread {
    display: flex; flex-direction: column; gap: 4px;
    flex: 1; overflow-y: auto;
    padding: 16px 16px 8px 16px;
  }

  /* ── Messages ───────────────────────────────────────────────────────── */
  .msg-wrapper {
    display: flex; flex-direction: column;
    max-width: 70%;
    min-width: 0;
    margin-bottom: 4px;
  }
  .msg-wrapper.sent {
    align-self: flex-end; align-items: flex-end;
    margin-left: auto;
  }
  .msg-wrapper.received {
    align-self: flex-start; align-items: flex-start;
    margin-right: auto;
  }

  .bubble {
    padding: 8px 12px;
    border-radius: 12px;
    font-size: 13px;
    line-height: 1.45;
    word-wrap: break-word;
    overflow-wrap: break-word;
    word-break: break-word;
    max-width: 100%;
    min-width: 0;
  }
  .bubble-sent {
    background-color: #89b4fa; color: #1e1e2e;
    border-bottom-right-radius: 4px;
  }
  .bubble-recv {
    background-color: #313244; color: #cdd6f4;
    border-bottom-left-radius: 4px;
  }

  .msg-time {
    font-size: 10px; color: #585b70;
    margin-top: 2px; padding: 0 4px;
    white-space: nowrap; min-width: max-content;
  }
  .time-sent { text-align: right; }
  .time-recv { text-align: left; }

  /* ── Input bar ──────────────────────────────────────────────────────── */
  .input-bar {
    display: flex; flex-direction: row; align-items: center; gap: 8px;
    padding: 10px 16px;
    border-top: 1px solid #313244;
    background-color: #1e1e2e;
  }
  .msg-input {
    flex-grow: 1; flex-shrink: 1; flex-basis: auto;
    background-color: #313244; color: #cdd6f4;
    border: none; border-radius: 8px;
    padding: 10px 14px; font-size: 13px;
    height: 36px;
    outline: none;
  }
  .msg-input::placeholder { color: #6c7086; }

  .send-btn {
    min-width: 48px;
    border-radius: 8px;
    background-color: #89b4fa; color: #1e1e2e;
    border: none; cursor: pointer;
    display: flex; align-items: center; justify-content: center;
    padding: 10px 12px;
  }
  .send-icon {
    font-family: "Phosphor"; font-size: 16px; color: #1e1e2e;
    width: 16px; min-width: 16px;
  }

  /* ── Command palette (Cmd+K — Raycast-style) ─────────────────── */
  .cmd-backdrop {
    position: fixed; top: 0; left: 0; width: 100%; height: 100%;
    background-color: #0006; z-index: 9998;
  }
  .cmd-palette {
    position: fixed;
    top: 15%; left: 50%;
    width: 480px; margin-left: -240px;
    background-color: #1e1e2e;
    border: 1px solid #313244;
    border-radius: 12px;
    overflow: hidden;
    z-index: 9999;
    display: flex; flex-direction: column;
  }
  .cmd-input {
    background: none; border: none; border-bottom: 1px solid #313244;
    padding: 14px 16px; font-size: 15px; color: #cdd6f4;
    outline: none;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  }
  .cmd-input::placeholder { color: #585b70; }
  .cmd-results {
    display: flex; flex-direction: column;
    max-height: 300px; overflow-y: auto;
    padding: 4px;
  }
  .cmd-item {
    display: flex; flex-direction: row; align-items: center; gap: 12px;
    padding: 10px 12px; border: none; background: none;
    cursor: pointer; border-radius: 8px; text-align: left;
  }
  .cmd-item:hover, .cmd-selected { background-color: #313244; }
  .cmd-icon {
    font-family: "Phosphor"; font-size: 18px; color: #89b4fa;
    width: 20px; min-width: 20px;
    display: flex; align-items: center; justify-content: center;
  }
  .cmd-text {
    display: flex; flex-direction: column; gap: 2px;
  }
  .cmd-label {
    font-size: 14px; font-weight: 500; color: #cdd6f4;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  }
  .cmd-desc {
    font-size: 12px; color: #6c7086;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  }
  .cmd-empty {
    padding: 16px; text-align: center; color: #585b70; font-size: 13px;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  }

  /* ── Context menu (position:fixed at cursor — no portal needed) ── */
  .ctx-backdrop {
    position: fixed; top: 0; left: 0; width: 100%; height: 100%;
    background-color: #0001;
    z-index: 9998;
  }
  .ctx-menu {
    position: fixed;
    z-index: 9999;
    background-color: #181825;
    border: 1px solid #313244;
    border-radius: 8px;
    padding: 4px;
    min-width: 180px;
    display: flex; flex-direction: column;
  }
  .ctx-header {
    font-size: 11px; color: #585b70; padding: 6px 12px 4px;
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  }
  .ctx-divider {
    height: 1px; background-color: #313244; margin: 2px 8px;
  }
  .ctx-item {
    background: none; border: none; color: #cdd6f4;
    font-size: 13px; padding: 8px 12px; text-align: left;
    cursor: pointer; border-radius: 4px;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  }
  .ctx-item:hover { background-color: #313244; }
  .ctx-danger { color: #f38ba8; }
  .ctx-danger:hover { background-color: #45172b; }

  /* ── Welcome modal (position:fixed overlay — no portal needed) ──── */
  .modal-overlay {
    position: fixed;
    top: 0; left: 0; width: 100%; height: 100%;
    background-color: rgba(0, 0, 0, 0.6);
    display: flex; align-items: center; justify-content: center;
    z-index: 9999;
  }
  .modal-card {
    background-color: #1e1e2e;
    border: 1px solid #313244;
    border-radius: 12px;
    padding: 24px;
    width: 340px;
    display: flex; flex-direction: column; gap: 12px;
  }
  .modal-title {
    font-size: 18px; font-weight: 700; color: #cdd6f4;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  }
  .modal-body {
    font-size: 13px; color: #a6adc8; line-height: 1.5;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  }
  .modal-dismiss {
    align-self: flex-end;
    background-color: #89b4fa; color: #1e1e2e;
    border: none; border-radius: 6px;
    padding: 8px 20px; font-size: 13px; font-weight: 600;
    cursor: pointer;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  }
</style>

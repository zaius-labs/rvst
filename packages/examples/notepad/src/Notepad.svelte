<script>
  let notes = $state([
    { id: 1, title: 'Welcome', body: 'Your first note.' },
  ]);
  let nextId = $state(2);
  let activeId = $state(1);
  let editTitle = $state('Welcome');
  let editBody = $state('Your first note.');
  let saveStatus = $state('');

  let activeNote = $derived(notes.find(n => n.id === activeId));
  let noteCount = $derived(notes.length);

  function selectNote(id) {
    // Save current edits before switching
    commitEdits();
    activeId = id;
    const note = notes.find(n => n.id === id);
    if (note) {
      editTitle = note.title;
      editBody = note.body;
    }
  }

  function commitEdits() {
    notes = notes.map(n =>
      n.id === activeId ? { ...n, title: editTitle, body: editBody } : n
    );
  }

  function addNote() {
    commitEdits();
    const id = nextId++;
    const newNote = { id, title: `Note ${id}`, body: '' };
    notes = [...notes, newNote];
    activeId = id;
    editTitle = newNote.title;
    editBody = newNote.body;
  }

  function deleteNote() {
    if (notes.length <= 1) return;
    notes = notes.filter(n => n.id !== activeId);
    activeId = notes[0].id;
    editTitle = notes[0].title;
    editBody = notes[0].body;
  }

  function saveToFile() {
    commitEdits();
    const data = JSON.stringify(notes, null, 2);
    const ok = __rvst.fs.writeText('/tmp/rvst_notepad.json', data);
    saveStatus = ok ? 'saved' : 'error';
  }

  function loadFromFile() {
    const data = __rvst.fs.readText('/tmp/rvst_notepad.json');
    if (data) {
      try {
        const loaded = JSON.parse(data);
        if (Array.isArray(loaded) && loaded.length > 0) {
          notes = loaded;
          activeId = notes[0].id;
          editTitle = notes[0].title;
          editBody = notes[0].body;
          saveStatus = 'loaded';
        }
      } catch(e) {
        saveStatus = 'parse-error';
      }
    } else {
      saveStatus = 'no-file';
    }
  }
</script>

<div style="display: flex; flex-direction: column; width: 100%; height: 100%; font-family: sans-serif; font-size: 14px;">
  <!-- Toolbar -->
  <div style="display: flex; gap: 8px; padding: 8px; background: #1a1a2e; color: #e0e0e0;">
    <span style="font-weight: bold;">Notepad</span>
    <span style="flex: 1;"></span>
    <button onclick={addNote}>New</button>
    <button onclick={deleteNote}>Delete</button>
    <button onclick={saveToFile}>Save</button>
    <button onclick={loadFromFile}>Load</button>
    <span>Status: {saveStatus || 'ready'}</span>
  </div>

  <div style="display: flex; flex: 1;">
    <!-- Sidebar: note list -->
    <div style="display: flex; flex-direction: column; width: 160px; background: #16213e; padding: 8px; gap: 4px; overflow: auto;">
      <div>Notes: {noteCount}</div>
      {#each notes as note}
        <button
          style={note.id === activeId ? 'background: #0f3460; color: white; padding: 4px 8px; text-align: left;' : 'padding: 4px 8px; text-align: left; color: #a0a0a0;'}
          onclick={() => selectNote(note.id)}
        >
          {note.title}
        </button>
      {/each}
    </div>

    <!-- Editor -->
    <div style="display: flex; flex-direction: column; flex: 1; padding: 16px; gap: 8px;">
      <input placeholder="Title" bind:value={editTitle} style="font-size: 18px; padding: 4px;" />
      <textarea placeholder="Write your note..." bind:value={editBody} style="flex: 1; padding: 8px; font-size: 14px; resize: none;" />
      <div>Chars: {editBody.length}</div>
    </div>
  </div>
</div>

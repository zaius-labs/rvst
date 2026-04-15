<script>
  import { onMount, onDestroy } from 'svelte';
  import * as lexical from 'lexical';

  const getRoot = lexical.$getRoot;
  const createParagraphNode = lexical.$createParagraphNode;
  const createTextNode = lexical.$createTextNode;

  let { initialText = '' } = $props();
  let editorDiv;
  let editor;

  onMount(() => {
    editor = lexical.createEditor({
      namespace: 'DocEditor',
      onError: (error) => console.error(error),
    });

    editor.setRootElement(editorDiv);

    // Always create initial content — Lexical needs at least one paragraph
    editor.update(() => {
      const root = getRoot();
      root.clear();
      if (initialText) {
        const lines = initialText.split('\n');
        for (const line of lines) {
          const p = createParagraphNode();
          if (line) p.append(createTextNode(line));
          root.append(p);
        }
      } else {
        root.append(createParagraphNode());
      }
    });

    editor.registerUpdateListener(({ editorState }) => {
      editorState.read(() => {
        const root = getRoot();
        const text = root.getTextContent();
        console.log('[lexical] update: ' + JSON.stringify(text.slice(0, 50)));
        __rvst.fs.writeText('/tmp/rvst_doceditor.txt', text);
      });
    });

    // Diagnostic: trace the Lexical DOM chain (runs synchronously after update)
    editor.registerUpdateListener(() => {
      const root = editorDiv;
      console.log('[diag] root.__lexicalEditor=' + (root.__lexicalEditor ? 'SET' : 'MISSING'));
      console.log('[diag] root.childNodes.length=' + root.childNodes.length);
      if (root.childNodes.length > 0) {
        const p = root.childNodes[0];
        console.log('[diag] p.nodeName=' + p.nodeName + ' p.nodeType=' + p.nodeType);
        console.log('[diag] p.parentElement=' + (p.parentElement ? 'id=' + p.parentElement.__rvst_id : 'null'));
        console.log('[diag] p.parentNode=' + (p.parentNode ? 'id=' + p.parentNode.__rvst_id : 'null'));
        // Check __lexicalKey
        const keys = Object.keys(p).filter(k => k.startsWith('__lexical'));
        console.log('[diag] p lexical keys=' + JSON.stringify(keys));
        // Check contains
        console.log('[diag] root.contains(p)=' + root.contains(p));
        // Check Selection
        const sel = window.getSelection();
        console.log('[diag] sel.anchorNode=' + (sel.anchorNode ? 'type=' + sel.anchorNode.nodeType : 'null'));
        console.log('[diag] sel.rangeCount=' + sel.rangeCount);
        // Check if p has children (should have a <br>)
        if (p.childNodes.length > 0) {
          const br = p.childNodes[0];
          console.log('[diag] br.nodeName=' + br.nodeName + ' br.parentElement=' + (br.parentElement ? 'id=' + br.parentElement.__rvst_id : 'null'));
          const brKeys = Object.keys(br).filter(k => k.startsWith('__lexical'));
          console.log('[diag] br lexical keys=' + JSON.stringify(brKeys));
        }
        // Try to walk up from p to find __lexicalEditor
        let cur = p;
        let depth = 0;
        while (cur && depth < 10) {
          const hasEditor = cur.__lexicalEditor ? 'YES' : 'no';
          const hasKey = Object.keys(cur).filter(k => k.startsWith('__lexicalKey')).length > 0 ? 'YES' : 'no';
          console.log('[diag] walk[' + depth + '] id=' + (cur.__rvst_id || '?') + ' editor=' + hasEditor + ' key=' + hasKey + ' tag=' + (cur.__rvst_tag || cur.nodeName || '?'));
          cur = cur.parentElement;
          depth++;
        }
      }
    });
  });

  onDestroy(() => {
    if (editor) editor.setRootElement(null);
  });
</script>

<div
  bind:this={editorDiv}
  contenteditable="true"
  style="flex: 1; width: 100%; outline: none; font-size: 16px; line-height: 1.6; padding: 32px; font-family: Georgia, serif; box-sizing: border-box; white-space: pre-wrap; min-height: 100%;"
></div>

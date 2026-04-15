<script>
  let content = $state('');
  let status = $state('idle');
  let writeResult = $state('');

  async function readFile() {
    status = 'reading';
    const text = __rvst.fs.readText('/tmp/rvst_test_read.txt');
    content = text || '(empty)';
    status = 'read';
  }

  async function writeFile() {
    status = 'writing';
    const ok = __rvst.fs.writeText('/tmp/rvst_test_write.txt', 'Hello from RVST');
    writeResult = ok ? 'written' : 'failed';
    status = 'wrote';
  }
</script>

<div>
  <div>Status: {status}</div>
  <div>Content: {content}</div>
  <div>Write: {writeResult}</div>
  <button onclick={readFile}>Read</button>
  <button onclick={writeFile}>Write</button>
</div>

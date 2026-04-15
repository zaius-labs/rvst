<script>
  import Tree from './Tree.svelte';

  const tree = {
    label: 'root',
    children: [
      { label: 'child-a', children: [{ label: 'grandchild-1' }] },
      { label: 'child-b', children: [] },
    ],
  };
</script>
<div>
  <Tree label={tree.label} children={tree.children} />
</div>

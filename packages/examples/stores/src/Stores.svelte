<script>
  import { writable, derived } from 'svelte/store';

  const countStore = writable(0);
  const doubledStore = derived(countStore, ($c) => $c * 2);

  // Svelte 5 style: explicit subscriptions via $effect
  let count = $state(0);
  let doubled = $state(0);

  $effect(() => {
    const unsub1 = countStore.subscribe((v) => { count = v; });
    const unsub2 = doubledStore.subscribe((v) => { doubled = v; });
    return () => { unsub1(); unsub2(); };
  });

  function increment() { countStore.update((n) => n + 1); }
  function reset() { countStore.set(0); }
</script>

<div>
  <div>Count: {count}</div>
  <div>Doubled: {doubled}</div>
  <button onclick={increment}>Increment</button>
  <button onclick={reset}>Reset</button>
</div>

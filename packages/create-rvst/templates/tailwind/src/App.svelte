<script>
  let count = $state(0);
</script>

<div class="flex flex-col items-center justify-center w-full h-full gap-4 bg-zinc-950 text-zinc-100 font-sans">
  <h1 class="text-2xl font-bold">Hello from RVST</h1>
  <p class="text-sm text-zinc-400">Tailwind v4 + Svelte 5 + Native Desktop</p>
  <button
    class="px-5 py-2 rounded-lg bg-blue-500 text-white font-semibold text-sm"
    onclick={() => count++}
  >
    Clicked {count} {count === 1 ? 'time' : 'times'}
  </button>
</div>

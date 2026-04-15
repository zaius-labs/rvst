<script>
  let count = $state(0);
  const items = ['Button', 'Badge', 'Card', 'Input', 'Slider'];
</script>

<!-- Shell: full-height dark bg, column layout -->
<div class="flex flex-col w-full h-full bg-zinc-950 text-zinc-100 font-sans text-sm">

  <!-- Header -->
  <div class="flex flex-row items-center gap-4 px-6 py-3 bg-zinc-900 border-b border-zinc-800">
    <span class="text-base font-semibold text-white">shadcn test</span>
    <span class="flex-1"></span>
    <button
      class="px-3 py-1 rounded-md bg-white text-zinc-900 font-medium text-sm"
      onclick={() => count++}
    >
      Clicked {count}
    </button>
  </div>

  <!-- Body: sidebar + main -->
  <div class="flex flex-row flex-1">

    <!-- Sidebar -->
    <div class="flex flex-col w-48 bg-zinc-900 border-r border-zinc-800 px-3 py-4 gap-1">
      <span class="text-xs font-semibold text-zinc-500 uppercase px-2 mb-1">Components</span>
      {#each items as item}
        <button class="flex flex-row items-center px-2 py-1 rounded-md text-zinc-400 text-sm text-left">
          {item}
        </button>
      {/each}
    </div>

    <!-- Main content -->
    <div class="flex flex-col flex-1 px-8 py-6 gap-6">

      <!-- Section: Buttons -->
      <div class="flex flex-col gap-3">
        <span class="text-xs font-semibold text-zinc-500 uppercase">Buttons</span>
        <div class="flex flex-row gap-2">
          <button class="px-4 py-2 rounded-md bg-white text-zinc-900 font-medium text-sm">Default</button>
          <button class="px-4 py-2 rounded-md border border-zinc-700 text-zinc-100 font-medium text-sm">Outline</button>
          <button class="px-4 py-2 rounded-md text-zinc-400 font-medium text-sm">Ghost</button>
          <button class="px-4 py-2 rounded-md bg-red-600 text-white font-medium text-sm">Destructive</button>
        </div>
      </div>

      <!-- Section: Badges -->
      <div class="flex flex-col gap-3">
        <span class="text-xs font-semibold text-zinc-500 uppercase">Badges</span>
        <div class="flex flex-row gap-2">
          <span class="px-2 py-0 rounded-full bg-zinc-100 text-zinc-900 text-xs font-semibold">Default</span>
          <span class="px-2 py-0 rounded-full border border-zinc-700 text-zinc-100 text-xs font-semibold">Outline</span>
          <span class="px-2 py-0 rounded-full bg-red-600 text-white text-xs font-semibold">Destructive</span>
        </div>
      </div>

      <!-- Section: Cards -->
      <div class="flex flex-col gap-3">
        <span class="text-xs font-semibold text-zinc-500 uppercase">Card</span>
        <div class="flex flex-col gap-2 bg-zinc-900 border border-zinc-800 rounded-lg p-6 w-80">
          <span class="text-base font-semibold text-white">Card title</span>
          <span class="text-sm text-zinc-400">Card description text goes here.</span>
          <div class="flex flex-row gap-2">
            <button class="flex-1 px-3 py-2 rounded-md bg-white text-zinc-900 font-medium text-sm">Action</button>
            <button class="flex-1 px-3 py-2 rounded-md border border-zinc-700 text-zinc-100 font-medium text-sm">Cancel</button>
          </div>
        </div>
      </div>

    </div>
  </div>
</div>

<script lang="ts">
	import type { Snippet } from 'svelte';

	type Props = {
		handler: () => void;
		disabled: boolean;
		children: Snippet;
	};

	let { handler, disabled, children }: Props = $props();
</script>

<button
	disabled={disabled}
	onclick={handler}
	aria-label="primary button"
	type="button"
	class="h-10 w-full transform cursor-pointer rounded px-4 py-2 text-sm font-medium capitalize text-white transition-colors duration-300 focus:outline-none focus:ring sm:mx-2 sm:mt-0 sm:w-1/2 lg:w-full {disabled
		? 'bg-slate-600 '
		: 'bg-emerald-600 hover:bg-emerald-500'}"
>
	{@render children()}
</button>

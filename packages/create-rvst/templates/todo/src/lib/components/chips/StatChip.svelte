<script lang="ts">
	import type { Snippet } from 'svelte';

	type Props = {
		children: Snippet;
		text: string;
		count: number;
	};

	let { children, text, count }: Props = $props();
</script>

<div
	draggable="true"
	role="button"
	title="Hover chip"
	aria-disabled="true"
	class="active:text-primary flex h-8 w-full min-w-40 items-center justify-center rounded-full bg-gray-700 px-3 text-gray-300"
>
	<div class="w-1/3">
		{@render children()}
	</div>
	<div class="flex w-1/3 items-center justify-center text-sm font-medium pr-5">{text}</div>
	<div class="flex w-1/3 items-center justify-center text-sm font-medium rounded-full bg-slate-200 text-slate-900">{count}</div>
</div>

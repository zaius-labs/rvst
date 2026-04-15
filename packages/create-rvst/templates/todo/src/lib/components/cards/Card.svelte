<script lang="ts">
	import type { Snippet } from 'svelte';

	type Props = {
		head: Snippet;
		body: Snippet;
		footer: Snippet;
	};

	let { head, body, footer }: Props = $props();
</script>

<div
	class="mx-auto h-[80vh] max-h-[700px] w-full max-w-6xl overflow-hidden rounded border border-slate-200 bg-white p-5 shadow-2xl"
>
	<div class="flex h-full flex-col items-center justify-center gap-2">
		{@render head()}
		{@render body()}
		<div class="mt-auto flex h-auto w-full flex-col items-end justify-end">
			{@render footer()}
		</div>
	</div>
</div>

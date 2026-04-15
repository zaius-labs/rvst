<script lang="ts">
	import StatChip from '$components/chips/StatChip.svelte';
	import CompletedIcon from '$components/icons/CompletedIcon.svelte';
	import PendingIcon from '$components/icons/PendingIcon.svelte';
	import { todoStore } from '$lib/store/todo.svelte';
</script>

<div class="mx-3 mb-0 flex w-full justify-between border-b border-slate-200 px-1 pb-2 pt-3">
	<span class="text-xl font-semibold text-slate-600"> Svelte 5 Runes Todo </span>
	<div class="flex gap-2">
		<StatChip text="Pending" count={todoStore.pending}>
			<div class="text-red-500">
				<PendingIcon />
			</div>
		</StatChip>
		<StatChip text="Done" count={todoStore.completed}>
			<div class="text-green-500">
				<CompletedIcon />
			</div>
		</StatChip>
	</div>
</div>

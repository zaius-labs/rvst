<script lang="ts">
	import RemoveButton from '$components/buttons/RemoveButton.svelte';
	import ToggleInput from '$components/inputs/ToggleInput.svelte';
	import { todoStore } from '$lib/store/todo.svelte';

	const remove = (id: string) => {
		todoStore.remove(id);
	};

	const toggle = (id: string) => {
		todoStore.toggle(id);
	};
</script>

<div class="flex w-full max-h-[80vh] h-full flex-col gap-2 overflow-y-auto overflow-x-hidden pr-2">
	{#each todoStore.todos as item}
		<div class="rounded-md bg-slate-200/90 px-8">
			<div class="flex items-center justify-between">
				<span class="truncate pr-3 text-base font-medium text-[#07074D]">
					{item.text}
				</span>
				<div class="flex gap-2">
					<ToggleInput value={item.completed} onChange={() => toggle(item.id)} />
					<RemoveButton handler={() => remove(item.id)} />
				</div>
			</div>
		</div>
	{/each}
</div>

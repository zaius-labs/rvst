<script lang="ts">
	type Props = {
		value: boolean;
		onChange: () => void;
	};

	let { value = $bindable(), onChange }: Props = $props();
</script>

<label class="me-1 inline-flex cursor-pointer items-center">
	<input
		type="checkbox"
		{value}
		class="peer sr-only"
		bind:checked={value}
		onchange={() => onChange()}
		aria-label={value ? 'mark as pending' : 'mark as done'}
	/>
	<div
		class="peer relative h-5 w-9 rounded-full border-gray-600 bg-slate-600 after:absolute after:start-[2px] after:top-0.5 after:h-4 after:w-4 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-green-600 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:ring-green-800"
	></div>
</label>

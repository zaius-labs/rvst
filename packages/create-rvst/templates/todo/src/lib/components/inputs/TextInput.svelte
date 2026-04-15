<script lang="ts">
	type Props = {
		value: string;
		label: string;
		name: string;
		onkeyUp: (e: KeyboardEvent) => void;
	};

	let { label, value = $bindable(), name, onkeyUp }: Props = $props();
</script>

<div class="relative w-full">
	<input
		id={name}
		{name}
		required
		type="text"
		bind:value
		onkeyup={onkeyUp}
		class="peer h-10 w-full rounded px-4 text-left text-base font-medium leading-6 tracking-tight ring-2 ring-gray-200 focus:outline-none focus:ring-blue-500"
	/>

	<label
		for={name}
		class="absolute left-0 ml-1 -translate-y-2.5 translate-x-2 bg-white px-1 text-xs font-medium duration-100 ease-linear"
	>
		{label}
	</label>
</div>

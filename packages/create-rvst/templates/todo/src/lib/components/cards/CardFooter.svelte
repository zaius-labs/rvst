<script lang="ts">
	import PrimaryButton from '$components/buttons/PrimaryButton.svelte';
	import TextInput from '$components/inputs/TextInput.svelte';
	import { todoStore } from '$lib/store/todo.svelte';

	let value = $state<string>('');

	const handler = () => {
		if (!value) return;

		todoStore.add({
			completed: false,
			created_at: new Date(),
			text: value,
			id: new Date().toTimeString(),
			updated_at: new Date()
		});

		value = '';
	};

	const onkeyUp = (event: KeyboardEvent) => {
		if (event.key === 'Enter') {
			handler();
		}
	};

	const disabled = $derived(!value || value.length < 1);
</script>

<div class="flex w-full flex-row items-center justify-center gap-2 border-t border-slate-200 pt-5">
	<div class="lg:w2/3 w-full">
		<TextInput bind:value label="Todo" name="todoinput" {onkeyUp} />
	</div>
	<div class="w-full lg:w-1/3">
		<PrimaryButton {handler} {disabled}>Add</PrimaryButton>
	</div>
</div>

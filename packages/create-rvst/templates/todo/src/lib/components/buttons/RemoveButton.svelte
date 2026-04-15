<script lang="ts">
	import CloseIcon from '$components/icons/CloseIcon.svelte';

	type Props = {
		handler: () => void;
	};

	let { handler }: Props = $props();
</script>

<button type="button" class="p-5" aria-label="remove item" onclick={handler} title="remove item">
	<CloseIcon />
</button>

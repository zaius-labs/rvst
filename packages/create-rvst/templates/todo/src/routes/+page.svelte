<script lang="ts">
	import Card from '$components/cards/Card.svelte';
	import CardBody from '$components/cards/CardBody.svelte';
	import CardFooter from '$components/cards/CardFooter.svelte';
	import CardHeader from '$components/cards/CardHeader.svelte';
</script>

<div class="flex h-full w-full items-center justify-center overflow-hidden">
	<Card>
		{#snippet head()}
			<CardHeader />
		{/snippet}

		{#snippet body()}
			<CardBody />
		{/snippet}

		{#snippet footer()}
			<CardFooter />
		{/snippet}
	</Card>
</div>

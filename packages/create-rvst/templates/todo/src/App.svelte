<script>
	import './app.css';
	import Card from '$lib/components/cards/Card.svelte';
	import CardBody from '$lib/components/cards/CardBody.svelte';
	import CardFooter from '$lib/components/cards/CardFooter.svelte';
	import CardHeader from '$lib/components/cards/CardHeader.svelte';
</script>

<div
	class="flex min-h-screen w-full items-center justify-center overflow-hidden bg-gradient-to-r from-indigo-500 to-cyan-400"
>
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

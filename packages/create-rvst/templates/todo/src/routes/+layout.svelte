<script>
	import '../app.css';

	export let title = 'Svelte 5 runes Todo';
	export let description = 'Svelte 5 todo app using runes mode';
</script>

<svelte:head>
	<title>{title}</title>
	<meta name="description" content={description} />
	<meta property="og:type" content="website" />
	<meta property="og:title" content={title} />
	<meta property="og:description" content={description} />
	<meta name="twitter:title" content={title} />
	<meta name="twitter:description" content={description} />
	<meta name="viewport" content="width=device-width, initial-scale=1.0" />
	<meta charset="UTF-8" />
	<meta name="keywords" content="sveltekit, todo, runes, svelte5, store" />
</svelte:head>

<div
	class="flex min-h-screen w-full items-center justify-center overflow-hidden bg-gradient-to-r from-indigo-500 to-cyan-400"
>
	<slot></slot>
</div>

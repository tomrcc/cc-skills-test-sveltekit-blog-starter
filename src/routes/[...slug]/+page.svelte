<script>
	import Blocks from '$lib/components/Blocks.svelte';

	let { data } = $props();

	let meta = $derived(data.meta);
	let PageContent = $derived(data.PageContent);
</script>

<svelte:head>
	<title>{meta.title}</title>
</svelte:head>

{#if meta.content_blocks}
	<h1 data-editable="text" data-prop="title">{meta.title}</h1>
	<Blocks blocks={meta.content_blocks} />
{:else}
	<div data-editable="text" data-type="block" data-prop="@content">
		<PageContent />
	</div>
{/if}

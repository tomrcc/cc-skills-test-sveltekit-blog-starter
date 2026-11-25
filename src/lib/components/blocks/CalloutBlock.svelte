<script>
	import Callout from '$lib/components/Callout.svelte';

	let { content } = $props();
</script>

<Callout data-editable="text" data-type="text" data-prop="content">{@html content ?? ''}</Callout>

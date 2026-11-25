<script>
	let { content } = $props();
</script>

<div data-editable="text" data-type="block" data-prop="content">{@html content ?? ''}</div>

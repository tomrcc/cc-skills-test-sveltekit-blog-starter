<script>
	/**
	 * @typedef {Object} Props
	 * @property {import('svelte').Snippet} [children]
	 */

	/** @type {Props & Record<string, unknown>} */
	let { children, ...attributes } = $props();
</script>

<div class="callout" {...attributes}>
	{@render children?.()}
</div>

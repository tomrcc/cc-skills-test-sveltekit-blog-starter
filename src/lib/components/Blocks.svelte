<script>
	import { blockMap } from '$lib/cloudcannon/componentMap.js';

	let { blocks } = $props();

	const resolved = $derived(
		blocks.map((block) => {
			const component = blockMap[block._type];
			if (!component) throw new Error(`No block component for _type "${block._type}"`);
			return { block, component };
		})
	);
</script>

<div data-editable="array" data-prop="content_blocks" data-component-key="_type">
	{#each resolved as { block, component: Block }, index (index)}
		<div data-editable="array-item" data-component={block._type}>
			<Block {...block} />
		</div>
	{/each}
</div>

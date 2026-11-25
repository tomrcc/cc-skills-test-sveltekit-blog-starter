import RichTextBlock from '$lib/components/blocks/RichTextBlock.svelte';
import CalloutBlock from '$lib/components/blocks/CalloutBlock.svelte';
import ContactFormBlock from '$lib/components/blocks/ContactFormBlock.svelte';

// Keys are the `_type` values in content_blocks.
export const blockMap = {
	rich_text: RichTextBlock,
	callout: CalloutBlock,
	form: ContactFormBlock
};

export const componentMap = {
	...blockMap
};

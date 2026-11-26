import { registerSvelteComponent } from '@cloudcannon/editable-regions/svelte';
import { componentMap } from './componentMap.js';
import { highlightEditorCode } from './highlightCode.js';

for (const [key, component] of Object.entries(componentMap)) {
	registerSvelteComponent(key, component);
}

highlightEditorCode();

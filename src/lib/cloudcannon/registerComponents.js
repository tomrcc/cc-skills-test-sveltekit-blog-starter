import { registerSvelteComponent } from '@cloudcannon/editable-regions/svelte';
import { componentMap } from './componentMap.js';

for (const [key, component] of Object.entries(componentMap)) {
	registerSvelteComponent(key, component);
}

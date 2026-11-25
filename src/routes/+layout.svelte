<!-- This is the global layout file; it "wraps" every page on the site. (Or more accurately: is the parent component to every page component on the site.) -->
<script>
	import { run } from 'svelte/legacy';

	import Header from '$lib/components/Header.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import { currentPage, isMenuOpen } from '../lib/assets/js/store.js';
	import navigation from '$lib/data/navigation.json';
	import { preloadCode } from '$app/navigation';
	import { onMount } from 'svelte';
	import { fade } from 'svelte/transition';
	import { EditableRegions } from '@cloudcannon/editable-regions/svelte';
	import site from '$lib/data/site.json';
	let { data, children } = $props();

	const transitionIn = { delay: 150, duration: 150 };
	const transitionOut = { duration: 100 };

	/**
	 * Updates the global store with the current path. (Used for highlighting
	 * the current page in the nav, but could be useful for other purposes.)
	 **/
	run(() => {
		currentPage.set(data.path);
	});

	/**
	 * This pre-fetches all top-level routes on the site in the background for faster loading.
	 * https://kit.svelte.dev/docs/modules#$app-navigation-preloaddata
	 *
	 * Any route added to src/lib/data/navigation.json is preloaded automatically. You can add your
	 * own preloadData() calls here, too.
	 **/
	onMount(() => {
		const navRoutes = navigation.items.map((item) => item.route);
		preloadCode(...navRoutes);

		if (!window.inEditorMode) return;
		import('$lib/cloudcannon/registerComponents.js').catch((error) => {
			console.warn('Failed to load CloudCannon component registration:', error);
		});
	});
</script>

<svelte:head>
	<link rel="stylesheet" href="/css/vars.css" />
	<link rel="stylesheet" href="/css/root.css" />
	<link rel="stylesheet" href="/css/fonts.css" />
	<link rel="stylesheet" href="/css/typography.css" />
	<link rel="stylesheet" href="/css/layout.css" />
	<link rel="stylesheet" href="/css/components.css" />
	<link rel="stylesheet" href="/css/header-and-footer.css" />
	<link rel="stylesheet" href="/css/forms.css" />
	<link rel="stylesheet" href="/css/animation.css" />
	<link rel="stylesheet" href="/css/utilities.css" />
	<link rel="stylesheet" href="/css/code.css" />
	<link rel="stylesheet" href="/css/prism.css" />
	<link
		rel="alternate"
		type="application/rss+xml"
		title={site.title}
		href="http://{site.url}/api/rss.xml"
	/>
</svelte:head>

<!--
	The below markup is used on every page in the site. The <slot> is where the page's
	actual contents will show up.
-->
<EditableRegions tag="div" class={$isMenuOpen ? 'layout open' : 'layout'}>
	<Header />
	{#key data.path}
		<main id="main" tabindex="-1" in:fade|global={transitionIn} out:fade|global={transitionOut}>
			{@render children?.()}
		</main>
	{/key}
	<Footer />
</EditableRegions>

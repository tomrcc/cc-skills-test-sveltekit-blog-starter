<script>
	import site from '$lib/data/site.json';
	import footer from '$lib/data/footer.json';
	import NavItems from './NavItems.svelte';

	// Links to files (the RSS feed) need a full page load, not client-side routing.
	const isFile = (route) => /\.\w+$/.test(route ?? '');
</script>

<footer>
	<nav>
		<ul data-editable="array" data-prop="@data[footer].links">
			{#each footer.links as link}
				<li data-editable="array-item">
					<a href={link.route} data-sveltekit-reload={isFile(link.route) ? '' : undefined}
						><editable-text data-prop="title">{link.title}</editable-text></a
					>
				</li>
			{/each}
			<template>
				<li><a><editable-text data-prop="title"></editable-text></a></li>
			</template>
		</ul>
	</nav>
	<nav>
		<NavItems />
	</nav>

	<p>&copy;{new Date().getFullYear()} <editable-text data-prop="@data[site].author">{site.author}</editable-text></p>
</footer>

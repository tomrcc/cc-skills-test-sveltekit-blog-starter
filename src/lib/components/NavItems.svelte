<script>
	import navigation from '$lib/data/navigation.json';
	import NavItem from './NavItem.svelte';
</script>

<ul data-editable="array" data-prop="@data[navigation].items">
	{#each navigation.items as page}
		<NavItem href={page.route} data-editable="array-item">
			<editable-text data-prop="title">{page.title}</editable-text>
		</NavItem>
	{/each}
	<template>
		<li><a><editable-text data-prop="title"></editable-text></a></li>
	</template>
</ul>

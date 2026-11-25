<script>
	import PostsList from '$lib/components/PostsList.svelte'
	import Pagination from '$lib/components/Pagination.svelte'

	let { data } = $props();
</script>


<svelte:head>
	<title>{data.page.title}</title>
	<meta data-key="description" name="description" content={data.page.description}>
</svelte:head>

<h1 data-editable="text" data-prop="title">{data.page.title}</h1>

<PostsList posts={data.posts} editable />

<Pagination currentPage={1} totalPosts={data.total} />

import { redirect } from '@sveltejs/kit'
import { postsPerPage } from '$lib/config'
import fetchPosts from '$lib/assets/js/fetchPosts'
import { allPosts, allCategories, pageNumbers } from '$lib/assets/js/postEntries'

export const entries = async () => {
	const posts = await allPosts()
	return (await allCategories()).flatMap((category) =>
		pageNumbers(posts.filter((post) => post.categories.includes(category)).length).map((page) => ({ category, page }))
	)
}

export const load = async ({ url, params, fetch }) => {
	const page = parseInt(params.page) || 1
	const { category } = params

	// Prevents duplication of page 1 as the index page
	if (page <= 1) {
		redirect(301, `/blog/category/${category}`);
	}
	
	let offset = (page * postsPerPage) - postsPerPage

	const totalPostsRes = await fetch(`${url.origin}/api/posts/count`)
	const total = await totalPostsRes.json()
	const { posts } = await fetchPosts({ offset, page })

	return {
		posts,
		page,
		category,
		totalPosts: total 
	}
}

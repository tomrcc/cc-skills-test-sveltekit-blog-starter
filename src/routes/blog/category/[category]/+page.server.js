import fetchPosts from '$lib/assets/js/fetchPosts'
import { allCategories } from '$lib/assets/js/postEntries'

export const entries = async () => (await allCategories()).map((category) => ({ category }))

export const load = async ({ params }) => {
	const category = params.category
  const page = params.page || 1
	const options = { category, limit: -1 }
	const { posts } = await fetchPosts(options)

	return { 
		posts,
		category,
		page,
		total: posts.length
	}
}

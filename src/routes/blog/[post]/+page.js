import { error } from '@sveltejs/kit'
import { allPosts } from '$lib/assets/js/postEntries'

export const entries = async () => (await allPosts()).map(({ slug }) => ({ post: slug }))

export const load = async ({ params }) => {
	try {	
		const post = await import(`../../../lib/posts/${params.post}.md`)

		return {
			PostContent: post.default,
			meta: { ...post.metadata, slug: params.post } 
		}
	} catch(err) {
		error(404, err);
	}
}

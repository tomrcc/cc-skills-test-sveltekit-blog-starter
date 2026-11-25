import { error } from '@sveltejs/kit'

const DIR = '/content/pages/'

// mdsvex compiles each file to a component, which only a universal load can return.
const pages = import.meta.glob('/content/pages/*.md')

// blog.md is rendered by the blog/ route.
const ROUTED_ELSEWHERE = ['blog']

export const entries = () =>
	Object.keys(pages)
		.map((path) => path.slice(DIR.length, -'.md'.length))
		.filter((slug) => !ROUTED_ELSEWHERE.includes(slug))
		.map((slug) => ({ slug: slug === 'index' ? '' : slug }))

export const load = async ({ params }) => {
	const slug = params.slug || 'index'
	const resolver = pages[`${DIR}${slug}.md`]
	if (!resolver || params.slug === 'index' || ROUTED_ELSEWHERE.includes(slug)) {
		error(404, 'Not found')
	}

	const page = await resolver()
	return {
		PageContent: page.default,
		meta: page.metadata
	}
}

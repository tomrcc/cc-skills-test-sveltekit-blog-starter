import { postsPerPage } from '$lib/config'
import fetchPosts from './fetchPosts'

export const allPosts = async () => (await fetchPosts({ limit: -1 })).posts

export const allCategories = async () => [...new Set((await allPosts()).flatMap((post) => post.categories))]

// Always includes page 1: pagination links to it, and it redirects to the listing.
export const pageNumbers = (total) =>
	Array.from({ length: Math.max(1, Math.ceil(total / postsPerPage)) }, (_, i) => String(i + 1))

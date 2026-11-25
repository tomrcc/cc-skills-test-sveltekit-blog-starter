import { postsPerPage } from '$lib/config'
import fetchPosts from '$lib/assets/js/fetchPosts'
import { json } from '@sveltejs/kit'
import { allPosts, pageNumbers } from '$lib/assets/js/postEntries'

export const entries = async () => pageNumbers((await allPosts()).length).map((page) => ({ page }))

export const prerender = true

export const GET = async ({ params }) => {
  const { page } = params || 1

  const options = {
    offset: (page - 1) * postsPerPage,
    limit: postsPerPage
  }

  const { posts } = await fetchPosts(options)
  
  return json(posts)
}
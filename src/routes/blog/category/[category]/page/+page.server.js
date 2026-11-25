import { redirect } from '@sveltejs/kit';
import { allCategories } from '$lib/assets/js/postEntries'

export const entries = async () => (await allCategories()).map((category) => ({ category }))

export const load = async () => {
	redirect(301, `/blog/category`);
}

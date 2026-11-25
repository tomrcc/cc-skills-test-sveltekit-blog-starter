import adapter from "@sveltejs/adapter-static";
import { mdsvex } from "mdsvex";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypeSlug from "rehype-slug";

// Components markdown content may use, by tag name. Content files don't import them.
const contentComponents = {
	Callout: "$lib/components/Callout.svelte",
};

function importContentComponents() {
	const imports = Object.entries(contentComponents)
		.map(([name, path]) => `import ${name} from "${path}";`)
		.join("\n");
	return (tree) => {
		const at = tree.children[0]?.type === "yaml" ? 1 : 0;
		tree.children.splice(at, 0, { type: "html", value: `<script>\n${imports}\n</script>` });
	};
}

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Ensures both .svelte and .md files are treated as components (can be imported and used anywhere, or used as pages)
	extensions: [".svelte", ".md"],

	kit: {
		adapter: adapter(),
	},

	preprocess: [
		mdsvex({
			// The default mdsvex extension is .svx; this overrides that.
			extensions: [".md"],

			remarkPlugins: [importContentComponents],

			// Adds IDs to headings, and anchor links to those IDs. Note: must stay in this order to work.
			rehypePlugins: [
				rehypeSlug,
				rehypeAutolinkHeadings,
			],
		}),
	],
};

export default config;

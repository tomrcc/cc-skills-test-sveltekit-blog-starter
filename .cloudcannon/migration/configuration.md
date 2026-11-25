# Configuration — sveltekit-blog-starter

Phase 2 of the CloudCannon migration. `npx @cloudcannon/cli validate` passes for `cloudcannon.config.yml` and `.cloudcannon/initial-site-settings.json`. `npm run build` exits 0 with no warnings.

The JSON schemas are in `.cloudcannon/migration/*.schema.json`, gitignored, kept for later phases to query. Delete them at the end of the migration.

## Checklist

No task tool on this host, so the checklist lives here.

Gate and files:

- [x] JSON schemas downloaded; `.cloudcannon/migration/*.schema.json` in `.gitignore`
- [x] Baseline generated with `configure generate --auto --initial-site-settings --ssg sveltekit`, then rewritten (CLI collections over `src`, `src/routes`, `src/lib/components` removed; `paths` fixed; timezone replaced)
- [x] `cloudcannon.config.yml` valid YAML, `validate` passes
- [x] `.cloudcannon/initial-site-settings.json`: `ssg: sveltekit`, build keys nested under `build`
- [x] `build_command` is `npm run build`, which alone produces the full output (no pre/post steps)
- [x] `install_command: npm ci`; `packageManager: "npm@11.19.1"` pinned in `package.json`
- [x] `node_version: "file"` with `.nvmrc` = `24` (meets Vite 8, npm 11 and editable-regions minimums)
- [x] `.cloudcannon/README.md` written for editors
- [x] No `.cloudcannon/` hook files

SvelteKit:

- [x] Build uses `adapter-static`; `output_path: build`
- [x] Every dynamic route whose pages come from content exports `entries` (see Decisions)
- [x] Every page a collection file builds is in `build/` (posts checked; pages planned, see URL check)
- [x] No `$env/static/private` imports
- [x] No collection over `.svelte` files
- [x] Images: `paths.static: static`, `paths.uploads: static/images`; stored paths (`/images/…`) unchanged

Collections:

- [x] `collections_config` entry for every audit collection: `pages`, `posts`, `data`
- [x] No defunct keys; no non-content directories
- [x] No single-file collection (`pages` will hold 4, `posts` 3, `data` 4)
- [x] `collection_groups`: Content (pages, posts), Site (data)
- [x] Every collection has a `url` with the right (absent) trailing slash, or `disable_url: true`
- [x] Computed URL = built path for every file (below)
- [x] Index page with different fields has its own schema (`blog_index`)

Inputs:

- [x] Explicit `_inputs` for every post field, page field, block field, snippet field and data key planned
- [x] Every `select`/`multiselect` has options (`categories` → `values: data.categories`)
- [x] No icon/variant/target/size/align/theme/columns keys in any structure value
- [x] No numeric values on `text` inputs (`coverWidth`/`coverHeight` are `number`)
- [x] `_schema` hidden globally
- [x] `file_config` uses the array form
- [x] `_enabled_editors`: posts and pages `[visual, content, data]`, page builder schema `[visual, data]`, data `[data]`

Content specifics:

- [x] No styled HTML in front matter; no `<br />` lists
- [x] No Markdown tables in content → `markdown.options.table` left off
- [x] Toolbar buttons only for syntax mdsvex reads (no strike, sub/sup, underline, table)
- [x] No switches or enum fields
- [x] No `type: markdown` inputs (block text is `html`, see Decisions)
- [x] No YAML anchors, aliases or merge keys
- [x] Every array backed by a data file uses `values: data.<name>`
- [x] `categories.json` is a top-level array of strings typed with `$[*]`

Schemas and Add button:

- [x] `add_options` offers Page and Page Builder only; Blog Index stays off the menu
- [x] Every key the planned files use is in their schema
- [x] `_schema` values used (`page_builder`, `blog_index`) are keys under `pages.schemas`
- [x] `data` has `disable_add`, `disable_add_folder`, `disable_file_actions`
- [x] Every creatable schema has `new_preview_url`
- [x] Page builder schema exists (3 block types: Rich Text, Callout, Contact Form)

Structures:

- [x] Every array input links `_structures.<name>` by full path (`content_blocks`, `nav_links`); arrays of primitives use `[*]` (`choices[*]`, `$[*]`)
- [x] Every structure value has `preview` and `picker_preview` with literal fallbacks; all literal icons checked against the enum
- [x] No nested object fields

Snippets:

- [x] Component inventory: `Callout` (only real component; `MyComponent` sits inside a code fence)
- [x] `Callout` → `mdx_paired_component` snippet, `content_key: content`
- [x] `importContentComponents` remark plugin in `svelte.config.js`; `Callout` in `contentComponents`
- [x] `<script>` import removed from `mdsvex-component-example.md`; no `<script>` left in content outside code
- [x] `snippet: true` in `_editables.content`; `escape_snippets_in_code_blocks: true`
- [x] Build passes; Callout renders on `/blog/mdsvex-component-example`
- [ ] Round-trip in the Content Editor — needs CloudCannon (Phase 5)

## Files changed

- `cloudcannon.config.yml`, `.cloudcannon/initial-site-settings.json`, `.cloudcannon/README.md`, `.cloudcannon/schemas/{post,page,page-builder,blog-index}.md`
- `.gitignore` — schema files
- `.nvmrc` — `24`
- `package.json` — `packageManager`
- `svelte.config.js` — wildcard `prerender.entries` removed (default `"*"` remains); `importContentComponents` remark plugin
- `src/lib/assets/js/postEntries.js` (new) — `allPosts`, `allCategories`, `pageNumbers` for `entries()`
- `entries()` added to `blog/[post]/+page.js`, `blog/category/[category]/+page.server.js`, `blog/category/[category]/page/+page.server.js`, `blog/category/[category]/page/[page]/+page.server.js`, `blog/category/page/[page]/+page.server.js`, `blog/page/[page]/+page.server.js`, `api/posts/page/[page]/+server.js`
- `src/lib/posts/mdsvex-component-example.md` — `<script>` import block removed
- `src/lib/data/categories.json` (new) — seeded from the 5 categories the posts use

## Build output after the change

`find build -name '*.html'`:

```
index.html  about.html  contact.html  blog.html
blog/heading-links-example.html  blog/mdsvex-component-example.html  blog/syntax-highlighting-example.html
blog/category.html
blog/category/{css,markdown,svelte,sveltekit,web}.html
blog/category/{css,markdown,svelte,sveltekit,web}/page.html     redirect → /blog/category
blog/category/{css,markdown,svelte,sveltekit,web}/page/1.html   redirect → category page
blog/category/page/1.html   redirect → /blog
blog/page.html              redirect → /blog
blog/page/1.html            redirect → /blog
```

Plus `api/posts.json`, `api/posts/count`, `api/posts/page/1`, `api/rss.xml`. No `*` files and no empty "Blog category: page" listing.

## URL check

Posts (`url: /blog/[slug]`):

- `src/lib/posts/heading-links-example.md` → `/blog/heading-links-example` = `build/blog/heading-links-example.html` ✓
- `src/lib/posts/mdsvex-component-example.md` → `/blog/mdsvex-component-example` = `build/blog/mdsvex-component-example.html` ✓
- `src/lib/posts/syntax-highlighting-example.md` → `/blog/syntax-highlighting-example` = `build/blog/syntax-highlighting-example.html` ✓

Pages (`url: /[full_slug]`), planned files against today's built paths. Phase 3 re-runs this on the real files:

- `content/pages/index.md` → `/` = `build/index.html` ✓
- `content/pages/about.md` → `/about` = `build/about.html` ✓
- `content/pages/contact.md` → `/contact` = `build/contact.html` ✓
- `content/pages/blog.md` → `/blog` = `build/blog.html` ✓ (built by the existing `blog/` route)

## Planned file shapes for Phase 3

Config is written against these; Phase 3 creates the files to match, then diffs keys against `_inputs` and structures.

- `content/pages/index.md` — `title`, README body (default schema, no `_schema`)
- `content/pages/about.md` — `title: About`, body from `about/+page.md` minus `<svelte:head>`
- `content/pages/contact.md` — `_schema: page_builder`, `title: Contact`, `content_blocks`: `rich_text` (the two intro paragraphs, links kept as HTML), `callout` (the Callout sentence), `form` (every key in the structure value, `inbox_key` blank until the user creates the Inbox)
- `content/pages/blog.md` — `_schema: blog_index`, `title: Blog`, `description` (today's `siteDescription`)
- `src/lib/data/site.json` — `{ "title", "description", "url", "link", "author" }` from `siteTitle`, `siteDescription`, `siteURL`, `siteLink`, `siteAuthor`
- `src/lib/data/navigation.json` — `{ "items": [{ "title", "route" }] }` from `navItems`
- `src/lib/data/footer.json` — `{ "links": [{ "title": "RSS", "route": "/api/rss.xml" }, { "title": "Home", "route": "/" }] }`
- `src/lib/data/categories.json` — exists now

## Decisions and why

- **Collections.** `posts` stays in `src/lib/posts` (loaders already glob it). `pages` at `content/pages`, flat `*.md` glob with `disable_add_folder` and a flat `create.path`: `/[full_slug]` on a nested `index.md` would point at a folder URL that `.html` output doesn't serve. `data` at `src/lib/data` (JSON, imported via `$lib/data/…` in components so the Visual Editor can re-render them).
- **Pages render through mdsvex.** Recommended for Phase 3: the `[...slug]` route reads `content/pages/*.md` with `import.meta.glob` in a universal `+page.js` (as `blog/[post]` does), so bodies keep mdsvex's Prism highlighting, heading links and the Callout snippet. A server load can't return the compiled component. `entries()` reads the same glob, maps `index` to `""`, and skips `blog` (the `blog/` route renders it; the route folder wins anyway). This is why the README's brace warning covers page bodies.
- **Block text is `html`, rendered with `{@html}`.** No markdown renderer exists for front matter; `html` needs no new dependency. Toolbars are set on each input.
- **Page builder for Contact** with three inline structures (`rich_text`, `callout`, `form`), `_type` discriminator. Phase 3 writes `blockMap` and `Blocks.svelte` per `sveltekit/page-building.md`.
- **Form block.** Labels, placeholders, the choices list and the button text are editable; `inbox_key` is a field on the block so the user pastes it once the Inbox exists. Radio values become the choice text. Phase 3/4 adds `method="post"`, `name` on every input and the hidden `inbox_key`, and removes the `preventDefault`.
- **Dates.** `date` and `updated` use `type: date` with `instance_value: NOW`. What CloudCannon writes for a date input on an existing `"YYYY-MM-DD"` string isn't confirmed (likely a full timestamp, which js-yaml in mdsvex turns into a `Date`). Phase 3 adds a small formatter so the post template prints `YYYY-MM-DD` from either a string or a `Date`; sorting and RSS already go through `new Date()`. Phase 5 confirms with one edit in CloudCannon.
- **Timezone `Etc/UTC`.** The site sets none and dates are date-only.
- **Categories dataset.** `src/lib/data/categories.json`, editor-owned, `values: data.categories`, no `allow_create`. Category pages still come from posts; the dataset only feeds the dropdown.
- **`coverWidth`/`coverHeight` are `number` inputs** labelled as aspect-ratio parts.
- **`new_preview_url`:** pages `/`; page builder `/contact` (only page-builder page); posts `/blog/heading-links-example` (a template post; named in the editor README).
- **Prerendering.** Wildcard `prerender.entries` removed; the default `"*"` plus `entries()` on every dynamic route. Pagination routes always list page 1: SvelteKit's `handleUnseenRoutes` fails the build for a prerenderable route that renders nothing, and `Pagination` links to `/page/1`, which redirects. Not using `handleUnseenRoutes: "ignore"` or `strict: false`, which would hide missing pages.
- **Pagination bugs left** (user decision): `fetchPosts({ offset, page })` without `category`, the missing `postsPerPage` import, the boolean sort comparator, `name={siteDescription}`.
- **Escaped fences** in `syntax-highlighting-example.md` left; `escape_snippets_in_code_blocks` is on. Phase 5 checks a save of that file.
- **`preserved_paths: node_modules/`** kept from the CLI; harmless with `npm ci`.

## Open questions

1. **Timezone.** Default `Etc/UTC`. Set the site's own IANA zone if dates should follow it.
2. **Date format on save.** Default `type: date` plus a template formatter (Phase 3). Alternative: a `text` input with a `YYYY-MM-DD` pattern, which keeps the file text exact but loses the date picker.
3. **New-post preview target.** Default `/blog/heading-links-example`. If the user deletes the starter posts, `new_preview_url` needs another post.
4. **Inbox key.** The form block has an empty `inbox_key` until the user creates an Inbox in CloudCannon and pastes its key.
5. **Post body text that's now inaccurate.** `mdsvex-component-example.md` still tells readers to import components in a `<script>` tag. Default: leave the starter copy; editors can rewrite it.

## Skill-doc issues found

- `sveltekit/configuration.md § Every page must be prerendered` doesn't mention `prerender.handleUnseenRoutes` (default `"fail"`): a dynamic route whose `entries()` returns nothing (pagination with few posts) fails the build. Needs the "always list page 1" pattern or guidance.
- No skill says what a `type: date` input saves over an existing date-only string, or how to keep a raw-printed `YYYY-MM-DD`. The audit flags it, but configuration has no answer.
- `sveltekit/page-building.md` renders page bodies via `getPage` + `{@html data.page.html}` "with the site's parser", but when that parser is mdsvex a server load can't return the component; the doc needs the `import.meta.glob` universal-load variant.
- `json-schemas.md` says to gitignore the schema files but not whether to keep or delete them after Phase 2.
- `configuration.md § Customization checklist` + structures rule 1 assume content files exist; in this site Phase 2 configures a pages collection and data files that Phase 3 creates. A note on configuring against planned shapes (as collection-urls.md has for URLs) would help.
- CLI baseline writes `preserved_paths: node_modules/` and `install_command: npm i`; `sveltekit/configuration.md`'s review table doesn't mention either.

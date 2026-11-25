# Visual editing — sveltekit-blog-starter

Phase 4 of the CloudCannon migration. `npm run build` exits 0 with no warnings (log: `.cloudcannon/migration/build.log`, overwritten by this phase's build). Parity against `.parity-baseline/`: all 26 pages identical on visible text, hrefs, image src/alt, `<title>` and meta description.

## Checklist

No task tool on this host, so the checklist lives here.

Setup (`sveltekit/visual-editing.md`):

- [x] `@cloudcannon/editable-regions` ^0.0.22 installed with npm into `dependencies` (no peer dependencies; needs Node >=20.19, `.nvmrc` is 24)
- [x] One `<EditableRegions tag="div">` in `src/routes/+layout.svelte`, replacing the `.layout` div, around `Header`, `<main>` and `Footer`
- [x] `onMount` imports `$lib/cloudcannon/registerComponents.js` only when `window.inEditorMode`
- [x] `src/lib/cloudcannon/registerComponents.js` registers every `componentMap` entry
- [x] Section census written before any `data-editable` (above)

Infrastructure checklist:

- [x] Package in `package.json` `dependencies`
- [x] Root layout renders exactly one `<EditableRegions>`, wrapping header, page and footer
- [x] `registerComponents` imported in `onMount` inside the `window.inEditorMode` check; built as its own chunk (`nodes/0` → `import("../chunks/…")`), not referenced from any page's HTML
- [x] No `@cloudcannon/svelte-connector`, no `onCloudCannonChanges` (grep: no matches)
- [x] No layout or component imports `registerSvelteComponent` or `componentMap` at the top level. `Blocks.svelte` imports `blockMap`, as `sveltekit/page-building.md` requires
- [x] Build passes, no prerender errors

Universal checklist (`../visual-editing.md`):

- [x] Editor enablement: `pages` and `posts` have `visual`; `blog_index` inherits it; `page_builder` has `[visual, data]`
- [x] Census coverage: every row wired or justified
- [x] Array containers: `content_blocks`, `choices`, `@data[navigation].items`, `@data[footer].links` have `array` + `array-item`
- [x] Per-loop census in registered components: `choices` loop has `array`, `array-item`, and a text region (`data-prop=""`) per row; no images
- [x] Nested editables in array items: block regions; choice labels; nav and footer link titles
- [x] Array path scope: relative paths inside items (`title`, `""`)
- [x] Array container purity: `Blocks` has its own wrapper; `choices` has a wrapper inside the fieldset after the `<legend>`; nav and footer `<ul>`s hold only items plus a `<template>`
- [x] Image editables: post cover (`data-prop-src="coverImage"`), blog index thumbnails (`@file[...].coverImage`)
- [x] Child component labels: form labels and legend are regions; submit text and placeholders are attributes, sidebar with live re-render (census)
- [x] Shared partials backed by data: header title, nav, footer links, footer credit via `@data[...]`
- [x] Data file completeness: every visible header/footer value comes from `site.json`, `navigation.json`, `footer.json`; the year is computed
- [x] Cross-collection select wiring: `categories` stores the displayed string itself; no lookup, so no registered component (sidebar-only, census)
- [x] `_inputs` audit: every `data-prop` field has an explicit input of a matching type (`title` text, `excerpt` textarea → span, `coverImage` image, block `content` html → block/text, form labels text, `choices[*]` text, `@data` fields in `file_config` or `_structures.nav_links`)
- [x] Schema-file seed audit: `post.md` has `title`, `coverImage`, `excerpt`; `page-builder.md` and `blog-index.md` have `title`
- [x] Markdown bodies: `@content` block regions around `<PageContent />` and `<PostContent />`
- [x] Source editables: none (not allowed in `.svelte`)
- [x] Conditional guards: cover images render only when `coverImage` is set (post page and `PostsList`); text regions accept `null`
- [x] Inline vs block: Rich Text (`p h2 h3`, lists) → `data-type="block"` on a `<div>`; Callout (inline toolbar only) → `data-type="text"`; plain text fields → span default
- [x] Component prop contract: blocks take their fields directly, rendered `<Block {...block} />`
- [x] Cross-collection editable guard: `PostsList` takes `editable` (default `false`); only `/blog` passes it
- [x] `<template>` blueprints: nav and footer link lists; `choices` needs none (sub-array inside a re-rendered block, container kept when empty)
- [x] Data file input config: all four data files in `file_config` (Phase 2)

SvelteKit checklist:

- [x] Collection and data file config: as above
- [x] Regions inside the root: every region renders inside `.layout`, which is the root
- [x] Component names resolve: `rich_text`, `callout`, `form` are `componentMap` keys and the only `_type` values in content and structures
- [x] Registered components take props: the three blocks and `Callout` read nothing from `load`, imports, stores or context
- [x] Images in registered components: none
- [x] Rich text hosts: `{@html}` inside the host for Rich Text and Callout; mdsvex bodies have the region on the element around the body component
- [x] Spread props: `<Block {...block} />`

Page builder:

- [x] `data-component-key="_type"` on the `content_blocks` wrapper
- [x] `data-editable="array-item"` and `data-component={block._type}` on each block's wrapper `<div>`
- [x] Widget nested editables and the `choices` sub-array
- [x] No numbered component variants
- [x] Build output has `data-component-key` (1), `data-component=` (3), `data-editable="array-item"` (14) on `/contact`

Other:

- [x] Wrapper elements: no child-combinator or positional rules on `main`, `.callout`, `fieldset` or the body; `.main-nav li:nth-of-type` counts `li` only; `footer ul li + li` unaffected by a trailing `<template>`
- [x] Load-time behaviour: no reveals, timers or carousels. The `{#key}` fade doesn't play on hydration. The mobile `.main-nav` is hidden until the hamburger opens it (toggle-driven, left)
- [x] Editor-only CSS gives an empty array region room for the Add button (`static/css/utilities.css`, under `.cms-editor-active`)
- [x] Contact form doesn't submit inside the Visual Editor (`onsubmit` checks `window.inEditorMode`)

## Pre-handoff sweep

- [x] Census walk-through: every row implemented or justified
- [x] Shared-UI walk-through: header (site title, nav) and footer (links, nav, credit) wired to data files in `data_config` with `file_config`. No CTA banner, share block or author card on this site
- [x] Build grep (`grep -oE 'data-editable|data-prop' build/**/*.html`): `@data[site]`, `@data[navigation]`, `@data[footer]` on every page; `@content` on home, about and posts; `content_blocks` on `/contact`; `@file[...]` on `/blog`

## Local check in CloudCannon

Not run (no editor access). To try the regions locally, from the site root: `npm run build`, then `cloudcannon dev build --port 10101` (or `npx @cloudcannon/cli dev build --port 10101`) and open `http://localhost:10101`. Rebuild by hand after each change; the dev server doesn't build.

## Section census

| Page | Section | Treatment | Binding plan | Data completeness | Justification |
| --- | --- | --- | --- | --- | --- |
| All pages | Header site title | data-file | `<editable-text data-prop="@data[site].title">` inside `a.site-title` | In `site.json` | — |
| All pages | Header nav links | data-file + array | `<ul data-editable="array" data-prop="@data[navigation].items">` in `NavItems`; `<li data-editable="array-item">`; relative `<editable-text data-prop="title">`; `<template>` blueprint | Titles and routes in `navigation.json` | Route is a link field → sidebar |
| All pages | Footer links | data-file + array | `<ul data-editable="array" data-prop="@data[footer].links">`; `<li data-editable="array-item">`; relative `<editable-text data-prop="title">`; `<template>` blueprint | Titles and routes in `footer.json` | Route → sidebar |
| All pages | Footer nav links | data-file + array | Same `NavItems` regions as the header | `navigation.json` | — |
| All pages | Footer credit | data-file | `<editable-text data-prop="@data[site].author">` inside the `<p>` | Year is computed (`new Date()`), not content | — |
| All pages | Skip link, hamburger button | none | — | Accessibility labels in code | Phase 3 decision: template labels stay in code; no source regions in `.svelte` |
| Home, About (`default` schema) | Markdown body | text (`@content`) | `<div data-editable="text" data-type="block" data-prop="@content">` around `<PageContent />` in `[...slug]/+page.svelte` | Body in file; `title` shows only in `<title>` | — |
| Home, About | Title | sidebar-only | — | `<title>` only, nothing visible | Not rendered on the page |
| Contact (page builder) | Heading | text | `<h1 data-editable="text" data-prop="title">` | `title` | — |
| Contact | Blocks array | array (page builder) | `Blocks.svelte`: `<div data-editable="array" data-prop="content_blocks" data-component-key="_type">`, `<div data-editable="array-item" data-component={block._type}>` | All block fields in front matter | — |
| Contact | Rich Text block | component + text | `<div data-editable="text" data-type="block" data-prop="content">` in `RichTextBlock` | `content` (html, block formats) | — |
| Contact | Callout block | component + text | `data-editable="text" data-type="text" data-prop="content"` on the `.callout` div (`Callout` forwards attributes) | `content` (html, inline only) | — |
| Contact | Contact Form block | component + text + array | `<label data-prop="name_label">`, `email_label`, `<legend data-prop="choices_legend">`, `checkbox_label`; `<div data-editable="array" data-prop="choices">` inside the fieldset, radio rows `array-item`, `<label data-editable="text" data-prop="">` | Every visible string in front matter | Placeholders, submit button text (an `<input value>` attribute) and `inbox_key` are attributes or hidden → sidebar, live through the block re-render |
| Blog index | Heading | text | `<h1 data-editable="text" data-prop="title">` | `title` in `blog.md`; `description` is meta only | — |
| Blog index | Post list | combined (`@file`) | `PostsList editable`: `@file[/src/lib/posts/<slug>.md]` on `title` (h2), `excerpt` (p), `coverImage` (img, `data-prop-src`) | Post fields live in post files | No array region: the list is a sorted, sliced view of the posts collection; a `@collections` array would let editors delete posts from the listing |
| Blog index | Pagination | none | — | Generated | Built from the post count |
| Post detail | Cover image | image | `<img data-editable="image" data-prop-src="coverImage">`, guarded on `coverImage` | `coverImage` | — |
| Post detail | Cover aspect ratio | sidebar-only | — | `coverWidth`/`coverHeight` | Numbers feed `width`/`height`/`style` attributes; live update needs a registered component bound to one object, which means nesting three root fields across posts, loaders and RSS. Changes show after the rebuild |
| Post detail | Title | text | `<h1 data-editable="text" data-prop="title">` | `title` | — |
| Post detail | Dates | sidebar-only | — | `date`, `updated` | Dates must not be text regions (date inputs, formatted by `formatDate`) |
| Post detail | Body | text (`@content`) | `<div data-editable="text" data-type="block" data-prop="@content">` around `<PostContent />` | Body; Callout has a snippet | — |
| Post detail | Categories | sidebar-only | — | `categories` multiselect | Values are restricted to `data.categories` and each one is also a computed link href; an array region would let editors type free text a text region can't re-link |
| Post detail | "Published:", "Updated:", "Posted in:" labels | none | — | Template labels | Phase 3 decision: labels stay in code; no source regions in `.svelte` |
| Category index, category pages, pagination, error | All | none | — | Generated or hardcoded | Audit census: no editable region; no collection file opens these URLs |

## Files changed

- `package.json`, `package-lock.json` — `@cloudcannon/editable-regions` in `dependencies`
- `src/routes/+layout.svelte` — `EditableRegions` root (replaces the `.layout` div; `class:open` became a class expression because the root is a component), gated registration import
- `src/lib/cloudcannon/registerComponents.js` (new)
- `src/lib/components/Blocks.svelte` — array wrapper and array-item hosts
- `src/lib/components/blocks/RichTextBlock.svelte`, `CalloutBlock.svelte`, `ContactFormBlock.svelte` — regions; form ignores submit in the editor
- `src/lib/components/Callout.svelte` — forwards extra attributes to the `.callout` div
- `src/routes/[...slug]/+page.svelte` — `title` region on page-builder pages, `@content` wrapper on prose pages
- `src/routes/blog/+page.svelte` — `title` region; `PostsList editable`
- `src/routes/blog/[post]/+page.svelte` — cover image, title, `@content` regions; cover guarded
- `src/lib/components/PostsList.svelte` — optional `@file` regions; thumbnail guarded
- `src/lib/components/Header.svelte`, `NavItems.svelte`, `NavItem.svelte` (forwards attributes to its `<li>`), `Footer.svelte` — `@data` regions, `<template>` blueprints
- `static/css/utilities.css` — editor-only empty-array rule

## Decisions and why

- **The `.layout` div is the root.** The layout already had one element around header, page and footer; making it the root keeps the grid and the DOM unchanged. `EditableRegions` forwards `class`, so the built HTML is `<div class="layout" data-editable="_dynamic" data-prop="">`.
- **Header, nav and footer use primitive `@data` regions, not registered components.** They import their own data and each field maps straight to an element (treatment 2 in `sveltekit/visual-editing-reference.md`). Routes are sidebar fields; a new or re-routed link shows after a rebuild.
- **`NavItems` renders the same array region in the header and footer.** Both bind `@data[navigation].items`; editing either writes the one data file.
- **Callout region sits on the `.callout` div.** `Callout` forwards attributes, so the block needs no extra element and the markup matches the snippet's. `data-type="text"` because the input's toolbar is inline-only.
- **Form attributes stay sidebar fields.** Placeholders, the submit text (`<input type="submit" value>`) and `inbox_key` have no text node to host a region. The block re-renders through `data-component="form"`, so sidebar edits still show live. Turning the submit input into a `<button>` would change markup and need a click guard for little gain.
- **Choice rows are an array region inside the fieldset.** A wrapper `<div>` after the `<legend>` keeps the array pure; each row's label is a `data-prop=""` text region on the string.
- **Contact form ignores submits in the editor.** Clicking the submit button in the preview would otherwise POST to the preview.
- **Blog index post list uses `@file` regions, switched on by a prop.** Titles, excerpts and thumbnails edit the post files from `/blog`. No array region: the list is a sorted, sliced view of the collection, and a `@collections` array would let editors delete posts. Category pages don't pass `editable`; no collection file opens them.
- **Cover aspect ratio, dates and categories are sidebar-only** (census justifications). Dates must not be text regions; categories are a restricted multiselect whose values also build link hrefs.
- **Cover images are guarded on `coverImage`.** A new post from the schema has an empty cover; without the guard the image region would get `null` and the page would render a broken `<img>`. Existing posts all have covers, so the output is unchanged.
- **Labels stay in code** ("Published:", "Skip to main content", listing headings), per Phase 3 and the user's listing decision; source regions aren't allowed in `.svelte` files.

## Open questions

1. **Submit button text inline.** Default: sidebar field with live re-render. Alternative: render a `<button>` with an inline text region and guard its click in the editor (changes the form's markup).
2. **Cover aspect ratio live in the editor.** Default: `coverWidth`/`coverHeight` update after a rebuild. Alternative: nest the cover fields into one `cover` object and render the cover through a registered component (touches every post, the loaders and RSS).
3. **Editing posts from `/blog`.** Default: on, so editors can fix a title or excerpt from the listing. Say if the listing should stay read-only.
4. **Mobile preview nav.** Default: at narrow widths the nav (and its regions) shows only after the hamburger is opened, as on the live site. Alternative: editor-only CSS that keeps the mobile nav open.

Hydration check (user's step, in a browser with the console open on `npm run build && npm run preview`): `/`, `/about`, `/contact`, `/blog`, `/blog/mdsvex-component-example`, `/blog/category/svelte`. The root and the regions add attributes only, so they shouldn't add hydration errors, but `<template>` blueprints inside the nav `<ul>` and the `EditableRegions` component (written in Svelte 4 syntax) are new in the hydrated tree.

## Skill-doc issues found

- `sveltekit/visual-editing.md § Infrastructure checklist` says no component imports "the component map" at the top level, while `sveltekit/page-building.md § Blocks` has `Blocks.svelte` import `blockMap` from `componentMap.js` at the top level. The checklist should name `blockMap` as the exception.
- `sveltekit/visual-editing.md` setup step 2 says to turn the layout's own element into the root but not that Svelte `class:` directives can't go on a component; `class:open={...}` has to become `class={...}`.
- `migrate-to-cloudcannon/SKILL.md § Phase handoff readiness` lists what counts as resolvable for Astro, Hugo, Eleventy, Next.js and Nuxt, but not SvelteKit (`componentMap.js` + `registerComponents.js`). The intro of `../visual-editing.md` also lists SSG files only up to Next.js.
- No doc covers a text label held in an attribute (`<input type="submit" value>`, `placeholder`); `§ Button/link text` assumes the label is a text node.
- No doc says whether two array regions on the same `@data` path on one page (the nav rendered in header and footer) are supported.
- `../svelte/visual-editing-reference.md § Text editing` shows the `{@html}` host only in the same component; a rich text region on a child component's root (`Callout`, which takes children) needs the child to forward attributes. Worth a line.
- `sveltekit/visual-editing.md` step 3 says the dynamic import keeps registration code out of normal page loads. The `EditableRegions` import comes from the same module as `registerSvelteComponent`, so the registration function (and the module's top-level `await import("svelte")`) ships in the layout chunk on every page; only the map and its components stay in the gated chunk. Harmless here, but the sentence overstates it.
- Setup note (not a skill doc): `.parity-baseline/compare.mjs` only finds files when run from inside `.parity-baseline` (`cd .parity-baseline && node compare.mjs . ../build`).

# Content — sveltekit-blog-starter

Phase 3 of the CloudCannon migration. `npm run build` exits 0 with no warnings and builds the same 26 HTML pages as Phase 2. `npx @cloudcannon/cli validate` passes.

## Checklist

No task tool on this host, so the checklist lives here.

Setup:

- [x] Parity baseline: Phase 2 tree built, HTML copied to `.parity-baseline/` (gitignored), compared after each round with `.parity-baseline/compare.mjs` (visible text, hrefs, image src and alt, `<title>`, meta description)

Review checklist (`content.md`):

- [x] Front matter consistency: posts already carry every key in every file; pages files hold every key of their schema
- [x] Defaults written into files (`coverWidth`/`coverHeight` already explicit; no build-time defaults)
- [x] Every key in the schema files (`page.md`, `page-builder.md`, `blog-index.md`, `post.md`)
- [x] `draft`: not used by the site
- [x] Dates: one format per collection (`"YYYY-MM-DD"`, kept per user decision); template formatter added
- [x] Image paths: one convention (`/images/…` under `static/images`)
- [x] Field naming: keys match component props (`coverImage`, block props); no reserved keys
- [x] Mixed-type fields: none
- [x] String references: `categories` → select from `data.categories` (Phase 2)
- [x] Markdown bodies: Callout is the only component (snippet, Phase 2); no inline HTML to normalize; no plugin syntax
- [x] Styled HTML in front matter: none; contact link's `rel="external"` dropped
- [x] Page-builder content: contact blocks carry every structure key (extraction table below)
- [x] One field per visual slot: page `title` feeds `<title>` and the page-builder/blog heading; no `a || b` slots
- [x] API-driven content: none (build-time fetches hit the site's own prerendered endpoints)
- [x] Settings in code → data files: `site.json`, `navigation.json`, `footer.json`; consumers updated; `config.js` keeps `postsPerPage`
- [x] Data collections: `disable_url: true` (Phase 2); JSON valid; nav/footer lists are arrays inside settings files; `categories.json` top-level array of strings

SvelteKit (`sveltekit/content.md`, `sveltekit/page-building.md`):

- [x] `content/pages/` with `index.md`, `about.md`, `contact.md`, `blog.md`; `_schema` on non-default files
- [x] `src/routes/[...slug]/` renders the collection; `+page.svelte`/`+page.js` (home), `about/`, `contact/` deleted
- [x] `entries` reads the same glob as `load`; `index` → `""`; `blog` skipped
- [x] `blockMap` in `src/lib/cloudcannon/componentMap.js`; `Blocks.svelte` renders only from it and throws on unknown `_type`; no `data-editable` wrappers (Phase 4)
- [x] Shared settings are JSON imports in the components that render them

Addendum:

- [x] Field completeness: every contact block has every key of its structure value
- [x] Fields the original page didn't pass: none; every form value came from the original markup
- [x] No block-level HTML in front matter strings except `rich_text.content`, whose input is `type: html` with `p`
- [x] Arrays in structure values linked to `_structures` or `[*]` (`choices[*]`, Phase 2)
- [x] Every editor-visible value in the data files' consumers lives in the data file (footer links moved out of `Footer.svelte`)
- [x] URL check on the real files (below); every `_inputs` key names a field in the files
- [x] This note records every structural change

## Files changed

New:

- `content/pages/index.md` — `title: My Awesome Blog` + the README body verbatim (user decision)
- `content/pages/about.md` — `title: About` + the body of `src/routes/about/+page.md` without `<svelte:head>`
- `content/pages/contact.md` — `_schema: page_builder`, `title`, three blocks
- `content/pages/blog.md` — `_schema: blog_index`, `title: Blog`, `description` (the old `siteDescription`)
- `src/lib/data/site.json`, `navigation.json`, `footer.json`
- `src/routes/[...slug]/+page.js`, `+page.svelte`
- `src/lib/cloudcannon/componentMap.js`, `src/lib/components/Blocks.svelte`
- `src/lib/components/blocks/RichTextBlock.svelte`, `CalloutBlock.svelte`, `ContactFormBlock.svelte`
- `src/lib/assets/js/formatDate.js`

Changed:

- `src/lib/config.js` — only `postsPerPage` left
- `Header.svelte`, `NavItems.svelte`, `Footer.svelte`, `+layout.svelte` — read `site.json`, `navigation.json`, `footer.json`
- `api/rss.xml/+server.js`, `blog/page/[page]/+page.svelte`, `blog/category/page/[page]/+page.svelte`, `blog/category/[category]/page/[page]/+page.svelte` — `site.json`
- `blog/+page.server.js`, `blog/+page.svelte` — title and description from `content/pages/blog.md`
- `blog/[post]/+page.svelte` — dates through `formatDate`
- `cloudcannon.config.yml` — `pages._inputs.title.comment` says the title is also the heading on Page Builder pages and Blog (cross-phase, mechanical)
- `.gitignore` — `/.parity-baseline`

Deleted: `src/routes/+page.svelte`, `src/routes/+page.js`, `src/routes/about/+page.md`, `src/routes/contact/+page.svelte`.

## Contact block extraction

Structure keys → value written:

- `rich_text`: `_type`, `content` (the two intro paragraphs as `<p>…</p><p>…</p>`, links kept)
- `callout`: `_type`, `content` (the Callout sentence)
- `form`: `_type`, `inbox_key` (empty, open question), `name_label` Name, `name_placeholder` First name, `email_label` Email, `email_placeholder` Email address, `choices_legend` Which option?, `choices` Option 1–3, `checkbox_label` Sign me up for something!, `submit_label` Do nothing!

## URL check

`pages` (`url: /[full_slug]`):

- `content/pages/index.md` → `/` = `build/index.html` ✓
- `content/pages/about.md` → `/about` = `build/about.html` ✓
- `content/pages/contact.md` → `/contact` = `build/contact.html` ✓
- `content/pages/blog.md` → `/blog` = `build/blog.html` ✓ (built by `blog/`)

No `build/index/` or second home page. Posts unchanged from Phase 2.

## Parity

Against `.parity-baseline/` (Phase 2 build): all 26 pages identical on visible text, hrefs, image src/alt, `<title>` and meta description. `api/rss.xml`, `api/posts.json`, `api/posts/count` byte-identical. Home `<main>` markup identical.

Markup differences, all on `/contact`:

- The intro was bare text nodes in `<main>` (two sentences running together in one block). It is now two `<p>` in a `<div>`: the html input always stores paragraphs. Slight added paragraph spacing.
- `rel="external"` dropped from the Josh Collinsworth link. SvelteKit never client-routes another origin, so behaviour is unchanged, and attributed HTML risks an uneditable chip in the rich-text editor.
- The form has `method="post"`, `name` on every input (`name`, `email`, `choice`, `signup`), radio values are the choice text, and `inbox_key` renders as a hidden input once set. The `preventDefault` is gone.

## Date formatter test

`date: 2023-10-26T00:00:00Z` (unquoted) on `heading-links-example.md`, built by hand: mdsvex's metadata holds `"2023-10-26T00:00:00.000Z"` (seen in `api/posts.json`); the post page printed `Published: 2023-10-26`; RSS unchanged. File reverted, rebuilt, parity clean.

## Decisions and why

- **Pages render through mdsvex with a universal load.** `[...slug]/+page.js` globs `/content/pages/*.md` and returns the compiled component plus `metadata`, as `blog/[post]` does, per Phase 2. Bodies keep Prism, heading links and the Callout snippet; a server load can't return a component.
- **`entries` skips `blog`; `load` 404s on `blog` and `index`.** `blog/` renders `blog.md`; `/index` would duplicate the home page.
- **Page-builder pages show `title` as the `<h1>`.** The contact `<h1>` had no block to go in (`rich_text` allows `p h2 h3`). Using the title avoids a second field for the same text. The `title` input comment says so.
- **Blog index reads `blog.md` in its server load** with a static import; only `metadata` (plain data) crosses to the page. `title` feeds `<title>` and `<h1>`, `description` the meta description.
- **`blog.md` description is its own field;** the pagination pages and RSS keep using `site.description`. They were the same value before; now an editor can change them separately.
- **Block components take one block's fields as props** and guard `null` (`content ?? ''`, `choices ?? []`), ready for Phase 4 registration. `Blocks.svelte` has no editable wrappers yet.
- **`CalloutBlock` wraps the existing `Callout`** so the snippet and the block share one presentation.
- **Footer links:** `data-sveltekit-reload` is added when the route ends in a file extension (the RSS feed), matching the old markup without an editor-facing flag.
- **Form posts to the current page** (no `action`). The skill docs give `method="post"` and `inbox_key` only.
- **Dates stay `"YYYY-MM-DD"` in files**; `formatDate` prints `YYYY-MM-DD` from a `Date` or an ISO timestamp string (user decision).
- **Starter copy kept verbatim** for parity, even where it now points at the wrong file (see Open questions).
- **Template labels stay in code:** "Published:", "Updated:", "Posted in:", "Skip to main content", and the listing headings (user decision for listings).
- **`.parity-baseline/` kept** (gitignored) with `compare.mjs`, for Phase 4/5 parity checks. Delete it at the end of the migration with the schema files.

## Open questions

1. **Inbox key and success page.** Default: `inbox_key` empty, so the hidden field isn't rendered and the form posts back to `/contact`. The user creates the Inbox, pastes its key into the Contact Form block, and decides whether a thank-you page should be the form's `action`.
2. **Starter copy that's now inaccurate.** The footer credit reads "- find and change this text in src/lib/config.js"; About says "you can find this file here: src/routes/about/+page.md"; Contact says the form does nothing and recommends Netlify forms. Default: leave for editors to rewrite.
3. **Contact intro spacing.** Default: accept the two paragraphs (see Parity). Alternative: one `<p>`, closer to the old run-on text.
4. **Home title.** Default: `title: My Awesome Blog` in `index.md`, copied from the site title; changing the site title in Data > Site doesn't change the home tab title.

## Skill-doc issues found

- `sveltekit/page-building.md § Pages collection` shows only the server-load + `{@html data.page.html}` variant; with mdsvex the working shape is a universal `+page.js` with `import.meta.glob` returning the component (Phase 2 noted the same). `content.md § mdsvex` permits it but page-building doesn't show it.
- Neither page-building doc says where a page-builder page's `<h1>` goes when the original heading sat outside any block.
- `audit.md § Forms` gives `method="post"` and `inbox_key` but not the `action` (success page), whether an empty `inbox_key` should be sent, or the field-naming convention for inputs.
- `content.md § Styled HTML in front matter` covers `type: markdown` fields only; it doesn't say whether attributes like `rel`/`target` on links in a `type: html` input become chips.
- `content.md § Parity baseline` doesn't say whether to delete the baseline at the end of the phase or keep it for Phase 4/5.
- `sveltekit/content.md` doesn't mention that moving a shared setting out of `config.js` into a JSON file can split one value (`siteDescription`) between a page field and a site field; worth a line on picking the owner.

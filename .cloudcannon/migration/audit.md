# Audit — sveltekit-blog-starter

Phase 1 of the CloudCannon migration. Nothing outside `.cloudcannon/migration/` was changed. `npm ci` installed `node_modules/`, and the baseline build wrote `build/` and `.svelte-kit/` (all gitignored).

## Checklist

- [x] Quick checks (overview.md) run and recorded
- [x] § 1 Static output readiness, versions, package manager, prerender, trailingSlash, missing pages
- [x] § 1 Earlier CloudCannon setup
- [x] § 2 Content sources, fields, paths, ordering, rendering
- [x] § 2 Svelte components in markdown; data file shape
- [x] § 3 Routes
- [x] § 4 Layouts and components; images; classification census + follow-on censuses
- [x] § 5 Build pipeline
- [x] § 6 Flags and special patterns; load-time behaviour
- [x] Shared audit: site-wide facts, forms, hydration errors, markdown-extension syntax
- [x] § 7 Sizing

## Quick checks

**Versions** (`package.json` → installed):

- `svelte` ^5.46.4 → 5.55.0
- `@sveltejs/kit` ^2.55.0 → 2.55.0
- `@sveltejs/adapter-static` ^3.0.0 → 3.0.10
- `@sveltejs/vite-plugin-svelte` ^7.0.0
- `vite` ^8.0.0 → 8.0.3
- `mdsvex` ^0.12.7 → 0.12.7, with `rehype-slug` ^5.1.0 and `rehype-autolink-headings` ^6.1.1
- No `marked`, velite or content-collections.

**`svelte.config.js`:** `adapter-static` with default options (no `strict`, no `fallback`, `pages`/`assets` = `build`). `extensions: [".svelte", ".md"]`; mdsvex compiles `.md` only, rehype plugins `rehypeSlug`, `rehypeAutolinkHeadings`. `kit.prerender.entries`:

```
"*", "/api/posts/page/*", "/blog/category/*/page/", "/blog/category/*/page/*",
"/blog/category/page/", "/blog/category/page/*", "/blog/page/", "/blog/page/*"
```

No `handleHttpError` or `handleMissingId`. `vite.config.js` only adds `server.fs.allow: ["."]`.

**Page options:** `src/routes/+layout.js` sets `prerender = true` and `csr = true`. All four `+server.js` endpoints set `prerender = true`. No `trailingSlash`, `ssr` or route-level `prerender = false`.

**Server-only files:** `+page.server.js` in `blog/`, `blog/page/`, `blog/page/[page]/`, `blog/category/`, `blog/category/page/[page]/`, `blog/category/[category]/`, `blog/category/[category]/page/`, `blog/category/[category]/page/[page]/`. Four `+server.js` endpoints under `src/routes/api/`. No `+layout.server.*`, no `hooks.server.*`, no `export const actions`.

**Environment variables:** none (`$env/*` not imported; no `.env*`; no `process.env` in config).

**Browser calls and forms:** every `fetch(` is inside a `+page.server.js` `load` hitting the site's own prerendered `/api/posts.json` and `/api/posts/count` — build time only. One `<form>` in `src/routes/contact/+page.svelte` (no `method`, no `action`, `onsubmit` prevents default). No `use:enhance`.

**Earlier CloudCannon setup:** none. No `@cloudcannon/*` or `@bookshop/*` packages, no `cloudcannon.config.*`, no `.cloudcannon/` hook files.

**Content and data files:** `src/lib/posts/*.md` (3), `src/routes/about/+page.md`, `README.md` (rendered as the home page). No JSON/YAML data files.

**Baseline build:** `npm run build` exits 0 with no errors or warnings (log: `.cloudcannon/migration/build.log`). HTML pages in `build/`:

```
index.html                         home (README.md)
about.html
contact.html
blog.html                          blog index, 3 posts
blog/heading-links-example.html
blog/mdsvex-component-example.html
blog/syntax-highlighting-example.html
blog/category.html                 category index
blog/category/css.html  markdown.html  svelte.html  sveltekit.html  web.html
blog/page.html                     meta-refresh → /blog
blog/category/*/page.html          meta-refresh → /blog/category
blog/page/*.html                   meta-refresh → /blog
blog/category/page/*.html          meta-refresh → /blog
blog/category/*/page/*.html        meta-refresh → /blog/category/*
blog/category/*.html               "Blog category: *" (empty listing)
blog/category/page.html            "Blog category: page" (empty listing)
```

Plus non-HTML: `api/posts.json`, `api/posts/count`, `api/posts/page/*`, `api/rss.xml`, and `__data.json` beside each page.

The `*` files are junk: SvelteKit treats only a bare `"*"` entry as "all routes"; `*` inside a path is a literal segment. `blog/category/page.html` comes from the `/blog/category/page/` entry matching `[category]`. See Flags.

## 1. Static output readiness

- **Adapter:** `@sveltejs/adapter-static` everywhere. Site is fully static.
- **Blocking server features:** none.
  - No form actions, no auth/session reads, no `url.searchParams`, no `prerender = false`/`ssr = false`, no hooks.
  - `+server.js` endpoints are all prerendered GETs. The browser never calls them; `blog/` loads call them during prerender. `api/rss.xml` is a feed linked from the footer.
  - Redirects are `redirect(301, …)` in prerendered `load`s, which build as meta-refresh HTML pages. They work on static hosting as is.
  - `api/rss.xml` sets `Cache-Control` and `Content-Type` headers in the endpoint; static hosting ignores them (the `.xml` extension gives the type).
- **Non-blocking (Phase 2):** server `load`s run at build time. No env vars. No unlinked dynamic routes: posts and categories are reached by the `"*"` crawl.
- **Node:** no `.nvmrc`, `.node-version` or `engines`. Local Node 24.22.1. Vite 8 needs Node ^20.19 or >=22.12; editable-regions needs 20.19. CloudCannon's default (22) meets both.
- **Package manager:** npm, `package-lock.json` (lockfileVersion 3). Local npm 11.19.1. No `packageManager` field — Phase 2 must pin `"packageManager": "npm@11.19.1"`; `install_command: npm ci`.
- **Prerender settings:** root layout `prerender = true`; entries as above; `handleHttpError` default (fail); adapter-static `strict` default (true), no `fallback`.
- **`trailingSlash`:** unset on every route → pages build as `.html` files (`build/blog/my-post.html`); collection URL patterns have no trailing slash (`/blog/[slug]`). Category links in the post template and category index use a trailing slash (`/blog/category/{category}/`), which resolve via redirect/hosting rules only.
- **Pages missing from the baseline:** none. Every route and content file has its page. Pagination pages (`/blog/page/2`…) don't exist because 3 posts < `postsPerPage` (10).
- **Hosting:** CloudCannon (user decision). No `netlify.toml`, `vercel.json`, `_redirects`, `_headers` or `.github/workflows`.
- **Repository:** the site is the repository root (`origin` git@work:tomrcc/cc-skills-test-sveltekit-blog-starter.git). One CloudCannon site.

## 2. Content sources

### Collection: posts — `src/lib/posts/*.md` (3 files)

- **Loaders:** `src/lib/assets/js/fetchPosts.js` (`import.meta.glob('/src/lib/posts/*.md')`, reads `metadata`), `src/routes/blog/[post]/+page.js` (dynamic `import(\`../../../lib/posts/${params.post}.md\`)`), `src/routes/api/rss.xml/+server.js` and `api/posts/count/+server.js` (glob).
- **Parser:** mdsvex at compile time; front matter arrives as `metadata`; body renders as a component (`<PostContent />`).
- **Path → URL:** file name is the slug → `/blog/<slug>` (built `build/blog/<slug>.html`). Collection `url`: `/blog/[slug]`.
- **Ordering:** `date` descending (`new Date(b.date) - new Date(a.date)`), in `fetchPosts` and the RSS endpoint.
- **Fields** (all present in all 3 files):
  - `title` — string. Post `<h1>`, `<title>`, og/twitter meta, `PostsList`, RSS.
  - `date` — quoted string `"YYYY-MM-DD"`. Printed raw in the post meta; sort key; RSS `pubDate`.
  - `updated` — quoted string `"YYYY-MM-DD"`. Printed raw in the post meta.
  - `categories` — array of strings. Post footer links, category pages (`post.categories.includes` — required on every post, or `fetchPosts({category})` throws), category index counts.
  - `coverImage` — string path under `static/images/` (`/images/…jpg`). Post cover `<img>`, `PostsList` thumbnail.
  - `coverWidth`, `coverHeight` — numbers (`16`, `9`; an aspect ratio, not pixel sizes). `width`/`height`/`aspect-ratio` on the cover; og image meta.
  - `excerpt` — unquoted string. Meta description, `PostsList`, RSS description.
- **Taxonomy:** categories are derived from posts only (posts own the list); category pages reverse-look-up. No separate categories file.

### Pages content (not in a collection today)

- **Home** — `src/routes/+page.js` imports the repo's `README.md` through mdsvex; `+page.svelte` renders `<data.ReadMe />`, title from `siteTitle`. README is ~230 lines of developer documentation for the starter (Features, Quick Start, Customization, … Contributing).
- **About** — `src/routes/about/+page.md`, an mdsvex route file: `<svelte:head><title>About</title></svelte:head>` then a markdown body. No front matter.
- **Contact** — `src/routes/contact/+page.svelte`: hardcoded `<h1>`, two prose paragraphs with links, a `<Callout>` with a sentence, and a demo form (see Forms).
- **Blog index** — `src/routes/blog/+page.svelte`: hardcoded `<h1>Blog</h1>`, meta description from `siteDescription`, `PostsList` + `Pagination` from the server load.
- **Category index / category pages / pagination pages** — headings are hardcoded strings with interpolated values ("All blog categories", "Blog category: {category}", "Posts {a}–{b} of {n}", "Oops!" fallbacks).
- **Error page** — `src/routes/+error.svelte`, hardcoded.

### Content in `.js` modules

`src/lib/config.js` exports `siteTitle`, `siteDescription`, `siteURL`, `siteLink`, `siteAuthor`, `postsPerPage` and `navItems` (array of `{title, route}`). Read by: `+layout.svelte` (RSS `<link>`), `Header` (site title), `Footer` (author), `NavItems` (nav), `Pagination`/pagination routes/`fetchPosts`/`api/posts*` (`postsPerPage`), RSS endpoint, `blog/+page.svelte` and pagination pages (`siteDescription`), home `<title>`. Phase 3 moves the editor-visible values into data files; `navItems` stays an array inside its settings file.

`src/lib/assets/js/store.js` — UI state stores (`currentPage`, `isMenuOpen`), not content.

### Svelte components in markdown

- `Callout` (`src/lib/components/Callout.svelte`, children only, no props) — 1 post (`mdsvex-component-example.md`), mid-prose, imported via a `<script>` block in the body. Also used directly in `contact/+page.svelte`. Classification: inline/prose component → **snippet** in Phase 2.
- `<svelte:head>` in `about/+page.md` body — goes away when About moves to a content file (title becomes front matter).
- Inline HTML in post bodies: `<code>` inside the Callout; the syntax-highlighting post has `<script>`/`<div>` only inside fenced code blocks.
- **Repeated at a fixed point:** none (Callout appears in one file).

### Data file shape

No data files exist yet. `navItems` is a nav link list → stays an array of `{title, route}` inside a navigation/settings data file, no ids.

## 3. Routes

- `src/routes/+page.svelte` (+ `+page.js`) — `/`, content from `README.md`.
- `src/routes/about/+page.md` — `/about`, own content.
- `src/routes/contact/+page.svelte` — `/contact`, own template.
- `src/routes/blog/+page.svelte` (+ `+page.server.js`) — `/blog`, listing of the first 10 posts via `/api/posts.json` + `/api/posts/count`.
- `src/routes/blog/[post]/+page.svelte` (+ `+page.js`) — `/blog/<slug>`, looks the file up by `params.post` = file name. Listed by `PostsList` on `/blog` and category pages, and RSS.
- `src/routes/blog/page/+page.server.js` — `/blog/page` → 301 `/blog` (empty `+page.svelte`).
- `src/routes/blog/page/[page]/` — `/blog/page/N` pagination; N ≤ 1 → 301 `/blog`.
- `src/routes/blog/category/+page.svelte` (+ server) — `/blog/category`, generated category index.
- `src/routes/blog/category/[category]/` — `/blog/category/<name>`, all posts in a category (`limit: -1`).
- `src/routes/blog/category/[category]/page/` — 301 `/blog/category`.
- `src/routes/blog/category/[category]/page/[page]/` — category pagination; N ≤ 1 → 301 to category.
- `src/routes/blog/category/page/[page]/` — duplicate of blog pagination (not category-filtered), reachable only via the prerender entry.
- `src/routes/+error.svelte` — error page.
- Endpoints: `api/posts.json` (first page of posts), `api/posts/count`, `api/posts/page/[page]`, `api/rss.xml` — build-time data and feed. Leave as code.
- No rest routes, no groups.

## 4. Layouts and components

- **`src/routes/+layout.svelte`** wraps every route: global CSS `<link>`s from `static/css/`, RSS alternate link, `Header`, `<main>` inside `{#key data.path}` with `in:fade`/`out:fade`, `Footer`. Sets `currentPage` store; preloads nav routes in `onMount`.
- **`+layout.js`** returns `{ path: url.pathname }`.
- **Components:**
  - `Header` — skip link, site title (reads `siteTitle` from config), `HamburgerMenuButton`, `MainNav`.
  - `MainNav` → `NavItems` → `NavItem` — `NavItems` reads `navItems` from config; `NavItem` reads `$currentPage`/`$isMenuOpen` stores.
  - `HamburgerMenuButton` — reads/writes `isMenuOpen` store.
  - `Footer` — hardcoded RSS + Home links, `NavItems`, `©{year} {siteAuthor}` (config).
  - `PostsList` — props `posts` (title, slug, excerpt, coverImage, coverWidth, coverHeight).
  - `Pagination` — props `currentPage`, `totalPosts`, `path`; reads `postsPerPage` from config.
  - `Callout` — children only.
  - `svg/HamburgerSVG`, `svg/XSVG` — icons.
- **Components that read data themselves** (Phase 4 may reshape if re-rendered): `Header`, `Footer`, `NavItems`, `NavItem`, `HamburgerMenuButton`, `Pagination`. None are section components; Header/Footer/nav get data-file editing, not re-rendered blocks.
- **UI libraries:** none. Plain CSS files in `static/css/`; no component `<style>` blocks.
- **Browser-only rendering:** none (`{#if browser}` absent; `onMount` only preloads code).
- **Images:** plain `<img>` with `src` from front matter pointing into `static/images/` (3 Unsplash JPGs). No `enhanced:img`, no imports from `src/lib/assets/`, no remote URLs. Uploads path: `static/images`, public path `/images`.

**Visual-editing candidates:** post template (title, dates, cover image, body), contact page blocks, home/about bodies, blog index heading. **Sidebar/data files:** navigation, site title/description/author, footer links.

### Census

| Page file | Distinct content sections | Layout repeated on other pages? | Editor will add similar pages? | Recommended pattern | Needs editable region? |
| --- | --- | --- | --- | --- | --- |
| `src/routes/+page.svelte` (+ `README.md`) | title, long markdown body | Yes (About is the same shape) | Maybe | `default` schema in `pages` — `content/pages/index.md` | Body only (+ title) |
| `src/routes/about/+page.md` | title, markdown body | Yes (home) | Maybe | `default` schema in `pages` — `content/pages/about.md` | Body only (+ title) |
| `src/routes/contact/+page.svelte` | heading, intro prose, callout, form | No | Maybe | Page builder in `pages` — `content/pages/contact.md` (blocks: rich text, callout, form) | Yes |
| `src/routes/blog/+page.svelte` | heading, meta description, generated post list, pagination | Partly (category listings) | No | Listing schema in `pages` — `content/pages/blog.md` (title, description) read by the existing `blog/` route | Yes (heading) |
| `src/routes/blog/[post]/+page.svelte` | cover, title, dates, body, categories | Yes (every post) | Yes | Fixed-schema collection `posts` | Yes (title, dates, cover image, body) |
| `src/routes/+layout.svelte` (Header, Footer, nav) | site title, nav links, footer links, author credit | Yes (every page) | No | Data files: site settings + navigation (+ footer) | Yes (site title, nav, footer credit via data) |
| `src/routes/blog/category/+page.svelte` | heading, generated category list | No | No | Hardcoded template (generated taxonomy) | No |
| `src/routes/blog/category/[category]/+page.svelte` | heading, generated post list | Yes (each category) | No | Hardcoded template (generated taxonomy) | No |
| `src/routes/blog/page/[page]/`, `blog/category/page/[page]/`, `blog/category/[category]/page/[page]/` | generated pagination | Yes | No | Hardcoded template | No |
| `src/routes/blog/page/`, `blog/category/[category]/page/` | redirect stubs | — | No | Hardcoded template | No |
| `src/routes/+error.svelte` | status, message, link | No | No | Hardcoded template | No |
| `src/routes/api/*` | feed and JSON endpoints | — | No | Leave as code | No |

### Follow-on censuses

**Primitive-vs-computed** (route files):

- `blog/[post]/+page.svelte` — all values read as-is from `data.meta`; `{#each categories}` iterates the post's own field. Primitive.
- `+page.svelte` (home) — `siteTitle` is a config import (computed: shared data); body is a component. Moves to `[...slug]` with front matter title.
- `about/+page.md` — primitive prose.
- `contact/+page.svelte` — all hardcoded; becomes blocks.
- `blog/+page.svelte` — `siteDescription` import (computed); post list from another folder via `PostsList` props (component, fine).
- Category/pagination routes — computed bounds and interpolated headings; generated pages, left as code.

**Frontmatter co-location:** the only components that would re-render in the editor are the contact blocks (to be created) and `Callout` (children only). New blocks should take one `content_blocks` item as props. `PostsList` and `Pagination` are fed from the collection, not front matter, and don't need to re-render.

## 5. Build pipeline

- `build`: `vite build`. No `prebuild`/`postbuild`, no codegen.
- Output: `build/` (adapter-static default). No adapter-specific output paths in scripts.
- No env vars read by the build.
- No hosting config files.

## 6. Flags and special patterns

- **Junk prerender entries:** `"/blog/category/*/page/*"` etc. are literal paths, producing `blog/category/*.html`, `blog/category/page.html` (an empty "Blog category: page" listing) and several `*` redirect pages. Phase 2 should replace the wildcard entries with `entries()` exports on the dynamic routes (or drop them), so the editor's URL list and the hosted site carry no junk pages. Removing them is safe while every post/category is linked.
- **Latent bugs in generated pagination routes** (not reached with 3 posts; left as is unless Phase 2 touches them):
  - `blog/category/page/[page]/+page.svelte` uses `postsPerPage` without importing it.
  - `blog/category/[category]/page/[page]/+page.server.js` calls `fetchPosts({ offset, page })` without `category`, so category page 2+ would list all posts.
  - `blog/category/+page.server.js` sorts with a comparator returning a boolean.
  - Category pagination pages emit `<meta data-key="description" name={siteDescription}>` (description in `name`).
- **Positional CSS:** `static/css/header-and-footer.css` `.main-nav li:nth-of-type(1…8)` sets animation delays. `nth-of-type` counts `li` only, so a `<template>` blueprint in the nav `<ul>` doesn't shift it.
- **Global DOM scripts:** none bind once. `Header` calls `document.querySelector('main')` inside a click handler only. `app.html` has no scripts.
- **Numbers displayed as text:** none. `coverWidth`/`coverHeight` are numbers used as attributes only.
- **Dates printed raw:** `date`/`updated` are quoted `"YYYY-MM-DD"` strings printed verbatim in the post meta and parsed with `new Date()` for sorting/RSS. A CloudCannon `date` input may save a different format, which would change the printed text. Phase 2 decides the input/format.
- **Styled HTML in strings:** no `{@html}` anywhere.
- **Load-time behaviour:**
  - `+layout.svelte` — `<main>` has `in:fade`/`out:fade` keyed on path. Svelte doesn't play intros on hydration, so the first load isn't faded; it affects client-side navigation only.
  - `header-and-footer.css` — `.main-nav` (mobile menu) is `opacity: 0` until `.open`; `.main-nav.open li` animate in via `slide_in_left` (`static/css/animation.css`). Toggle-driven, not load-driven.
  - `.skip-to-content-link` and `.sr-only` use `opacity: 0` for accessibility; not content.
  - No `IntersectionObserver`, `setInterval`, carousels or reveal classes.
- **Escaped fences:** `syntax-highlighting-example.md` shows fence syntax as `\```css` inside a plain fenced block. The Content Editor may rewrite the backslash escapes on save; worth a check in Phase 2/5 (or `_enabled_editors` for that file).
- **Curly braces in markdown bodies:** mdsvex treats `{…}` outside code as Svelte expressions. Current bodies only have braces inside code. Editors typing `{` in prose would break the build — a Phase 2/3 consideration for the posts collection.

## Shared audit items

- **Forms:** `src/routes/contact/+page.svelte` — a demo form: name (text), email (email), radio `s` (3 options), checkbox, submit "Do nothing!". No `method`/`action`; name/email/checkbox inputs have no `name` attribute; submit is prevented. Page text says the form does nothing and mentions Netlify forms. Per user decision it posts to a CloudCannon Inbox: `method="post"`, Inbox action, hidden `inbox_key`, `name` on every input. The form becomes a page-builder block.
- **Headers and redirects:** none configured. Load-level 301s prerender as meta-refresh pages; the RSS endpoint's headers aren't applied by static hosting.
- **Existing hydration errors:** not checked (no browser in this phase). Pages to check with the console open on `npm run build && npm run preview`: `/`, `/about`, `/contact`, `/blog`, `/blog/mdsvex-component-example`, `/blog/category`, `/blog/category/svelte`. The layout uses `svelte/legacy` `run()` and `createBubbler`/`preventDefault` (Svelte 4→5 migration shims) — likely fine, but unverified.
- **Markdown-extension syntax:** plugins are `rehype-slug` and `rehype-autolink-headings` (no new syntax) plus mdsvex defaults (Prism highlighting, smartypants). Grepped `src/lib/posts`, `src/routes/about`, `README.md` for footnotes, display/inline math, escaped dollars, `&dollar;`, citations and alerts: none found.

## 7. Sizing

- Total pages: 6 (home, about, contact, 3 posts; blog/category listings and pagination excluded) (threshold >30: ok)
- Hardcoded → YAML conversions: 4 (home, about, contact, blog index → `pages`) (threshold >15: ok)
- Distinct collections: 3 (posts, pages, data) (threshold >5: ok)
- Tripped: 0/3 — no `plan.md`; run as a single pass.

## Decisions and why

- **Static build, CloudCannon hosting.** No server features; adapter-static already in use. User chose CloudCannon hosting.
- **No upgrades.** Svelte 5.55, SvelteKit 2.55, mdsvex 0.12.7, Vite 8 stay (user decision).
- **npm with `npm ci`; pin `packageManager: "npm@11.19.1"`.** Lockfile is npm v3; build-commands.md requires pinning.
- **Node:** leave `build.node_version` unset (default 22 meets Vite 8 and editable-regions minimums); suggest an `.nvmrc` (open question).
- **Collections:**
  - `posts` — keep files in `src/lib/posts/`, URL `/blog/[slug]`. The loaders already glob/import that folder; moving them is churn with no editor benefit.
  - `pages` — new, `content/pages/`: `index.md` (home), `about.md`, `contact.md`, `blog.md`. Rendered by a new `src/routes/[...slug]/` route for index/about/contact; `blog.md` read by the existing `blog/` route. URL `/[full_slug]` (trailingSlash unset).
  - Data files — site settings (title, description, URL, link, author), navigation (`items[]` of title/route), footer links — replacing `src/lib/config.js` values. `postsPerPage` stays developer config.
- **Home stays prose.** Its content is a long markdown document → `default` schema. The repo `README.md` stays the developer README; the home page reads its own file.
- **Contact → page builder.** Four distinct sections including a form and a callout meets the page-builder signs (2+ sections).
- **Callout → snippet** in post bodies (inline prose component, one use).
- **Generated taxonomy/pagination pages stay code.** They're built from the posts folder, not content files.
- **Trailing slash unchanged** (`.html` output, no-slash URLs). No collection has an `index` file for a sub-route that would need `"always"`.
- **Form → CloudCannon Inbox** (user decision).

## Open questions

1. **Home page content.** Today the home page renders the repo's developer README. Default: copy the README body into `content/pages/index.md` as the starting content so the site looks unchanged; editors then own it separately from the README. Alternative: replace it with a short intro.
2. **Contact page copy and form.** The text says the form "does nothing" and recommends Netlify forms. Default: keep the copy as editable blocks unchanged and wire the form to the Inbox; the editor can rewrite the copy.
3. **Generated listing headings** ("All blog categories", "Blog category: …", "Oops!" fallbacks). Default: leave as code. Alternative: move the strings into a data file.
4. **Junk prerender entries.** Default: Phase 2 replaces the wildcard `prerender.entries` with route `entries()` so `*` pages stop building.
5. **Latent pagination bugs** (see Flags). Default: leave unless the routes are touched for entries; they only bite past 10 posts.
6. **`.nvmrc`.** Default: suggest adding `.nvmrc` with `24` (local version); don't add without a yes.
7. **Post dates.** Default: Phase 2 picks a date input that keeps the `YYYY-MM-DD` text the template prints.
8. **Hydration check.** Not run here (no browser). Pages listed above for the orchestrator or user to check before Phase 4.

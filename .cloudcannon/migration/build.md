# Build and test — sveltekit-blog-starter

Phase 5 of the CloudCannon migration. Clean production build exits 0 with no errors or warnings (log: `.cloudcannon/migration/build.log`). `npx @cloudcannon/cli validate` passes. Parity against the Phase 2 baseline: all 26 pages identical on visible text, hrefs, image src/alt, `<title>` and meta description.

Local tools: Node 24.22.1, npm 11.19.1, `@cloudcannon/cli` 0.0.20 via `npx` (not installed globally or in the project).

## Checklist

No task tool on this host, so the checklist lives here.

`build.md`:

- [x] Full build: `.svelte-kit/` and `build/` deleted, then `npm ci` and `npm run build` (the `install_command` and `build_command` in `initial-site-settings.json`; no `build.environment_variables`)
- [x] Frozen install: `npm ci --cache <empty folder>` with npm 11.19.1 (the pinned `packageManager`) exits 0
- [x] Regions in the output (counts below); every wired region type appears
- [x] `npx @cloudcannon/cli validate`: `✓ valid: cloudcannon.config.yml`, `✓ valid: .cloudcannon/initial-site-settings.json`
- [x] Collection URLs match the build (below)
- [x] Schema keys resolve: `_schema` values `page_builder` (`contact.md`) and `blog_index` (`blog.md`), and `add_options` schemas `default`, `page_builder`, are keys under `pages.schemas`
- [x] Search index: none on this site
- [x] Schema round-trip: no file is missing a key of its schema (`page.md`: `title`; `page-builder.md`: `_schema title content_blocks`; `blog-index.md`: `_schema title description`; `post.md`: all eight post keys in all three posts), so no fill-and-compare run was needed
- [ ] No hydration errors: no browser in this session; pages listed in the handoff for the user
- [ ] Hand off: below

`sveltekit/build.md`:

- [x] Clean build (above). The site is fully static on CloudCannon hosting, so there is no separate live build and no `PUBLIC_CLOUDCANNON_BUILD`
- [x] No prerender errors or warnings: no `Error: 500`, `404` or warning lines in the log
- [x] Every page is in the output: the audit baseline pages plus every collection file (below); the junk `*` pages are gone (Phase 2)
- [x] Regions counted
- [x] Images load: every `<img src>` is one of the three `/images/*.jpg` files, all present in `build/images/`
- [~] Client navigation: `npm run preview` answers 200 on `/`, `/about`, `/contact`, `/blog`, `/blog/mdsvex-component-example`, `/blog/category/svelte`. The universal loads (`[...slug]/+page.js`, `blog/[post]/+page.js`) use `import.meta.glob`/dynamic `import()` only, no Node APIs. Following a link in a browser is part of the user's hydration check
- [x] `build` script is `vite build` with no other steps; `build_command` is `npm run build`
- [x] `output_path: build` (adapter-static default); `node_version: "file"` with `.nvmrc` = `24` (meets Vite 8 ^20.19/>=22.12, npm 11's 20.17 and editable-regions' 20.19)
- [x] No steps read another adapter's output

Build settings (`.cloudcannon/initial-site-settings.json`): `ssg: sveltekit`, `mode: hosted`, `install_command: npm ci`, `build_command: npm run build`, `output_path: build`, `node_version: file`, `preserved_paths: node_modules/`. No `.cloudcannon/` hook files.

## Build output

26 HTML pages, identical list to Phase 2/3:

```
index.html  about.html  contact.html  blog.html
blog/{heading-links-example,mdsvex-component-example,syntax-highlighting-example}.html
blog/category.html  blog/category/{css,markdown,svelte,sveltekit,web}.html
redirect pages: blog/page.html, blog/page/1.html, blog/category/page/1.html,
  blog/category/<name>/page.html, blog/category/<name>/page/1.html
```

Plus `api/posts.json`, `api/posts/count`, `api/posts/page/1`, `api/rss.xml`, and `__data.json` for the routes with server loads.

## Regions

`grep -rhoE 'data-editable="[a-z_-]+' build --include='*.html' | sort | uniq -c`:

```
  13 _dynamic      (one root per non-redirect page)
  41 array
 110 array-item
   6 image
  25 text
```

Plus 169 `<editable-text>` elements (header site title, nav and footer link titles, footer credit, `/blog` listing titles and excerpts).

Spot checks:

- `/` — 13 `data-editable`: `@content` body, `@data[site].title`, `@data[site].author`, `@data[navigation].items` (header and footer), `@data[footer].links`
- `/contact` — 30: `title`, `content_blocks` with `data-component-key="_type"`, block `content` regions, form `name_label`, `email_label`, `choices_legend`, `choices`, `checkbox_label`
- `/blog/heading-links-example` — `title`, `coverImage` (`data-prop-src`), `@content`
- `/blog` — 22, including `@file[/src/lib/posts/<slug>.md]` title, excerpt and cover image regions

## Collection URLs

- `src/lib/posts/heading-links-example.md` → `/blog/heading-links-example` = `build/blog/heading-links-example.html` ✓
- `src/lib/posts/mdsvex-component-example.md` → `/blog/mdsvex-component-example` = `build/blog/mdsvex-component-example.html` ✓
- `src/lib/posts/syntax-highlighting-example.md` → `/blog/syntax-highlighting-example` = `build/blog/syntax-highlighting-example.html` ✓
- `content/pages/index.md` → `/` = `build/index.html` ✓
- `content/pages/about.md` → `/about` = `build/about.html` ✓
- `content/pages/contact.md` → `/contact` = `build/contact.html` ✓
- `content/pages/blog.md` → `/blog` = `build/blog.html` ✓
- `data` has `disable_url: true`

## Local CloudCannon dev server

Run and confirmed: `npx @cloudcannon/cli dev build --port 10101` from the site root served the app at `/` (200), `/__api/details` answered with `siteName: "Sveltekit Blog Starter"` and `outputDir: "build"`, and `/__output/index.html`, `about.html`, `contact.html` and `blog/heading-links-example.html` returned 200 with their regions. Stopped afterwards.

## Cleanup

Deleted (all gitignored, nothing later needs them): `.cloudcannon/migration/cloudcannon-config.latest.schema.json`, `.cloudcannon/migration/cloudcannon-initial-site-settings.schema.json`, `.parity-baseline/` (after a last clean compare). The two `.gitignore` lines for them are removed, so `.gitignore` matches the original repository.

## Files changed

- `.cloudcannon/migration/build.log` — this phase's clean build log
- `.cloudcannon/migration/build.md` — this note
- `.gitignore` — schema and parity-baseline lines removed
- Deleted: the two JSON schema files and `.parity-baseline/`

No source or config changes were needed.

## Decisions and why

- **No `build.environment_variables`.** The site reads no env vars and has no live server build.
- **Dev server through `npx`.** The CLI isn't installed globally (user constraint) and the skills don't call for a project devDependency; `npx @cloudcannon/cli` is the documented fallback in `cloudcannon-dev-server/setup.md`.
- **Local static check uses `npm run preview`.** It serves the prerendered pages with clean URLs. `npx serve build` (the doc's suggestion) wasn't run: fetching an unpinned package wasn't allowed in this session.
- **Schema files and parity baseline deleted.** Phase 5 is the last phase; the schemas can be downloaded again if a later fix needs them.

## Open questions

1. **Hydration and client navigation.** Not checked (no browser). User's step, listed in the handoff.
2. **Date format on save.** Phase 2/3 open: what a `type: date` input writes over `"YYYY-MM-DD"`. The template prints `YYYY-MM-DD` either way (Phase 3 test); the handoff asks for the saved line.
3. **Inbox key.** Empty until the user creates the Inbox and pastes the key into the Contact Form block.
4. Carried from earlier phases, defaults applied: timezone `Etc/UTC`; starter copy left verbatim (footer credit, About and Contact text point at old files); submit text and cover aspect ratio edited in the sidebar; `/blog` listing edits post files.

## Handoff

**Run the site locally** (from the site root):

```sh
npm ci
npm run dev                          # dev server, http://localhost:5173
npm run build && npm run preview     # production build, http://localhost:4173
```

**Run the CloudCannon editor locally** (from the site root; commit or stash first, since editor changes write straight to disk):

```sh
npm run build
npx @cloudcannon/cli dev build --port 10101
```

Open `http://localhost:10101`. Ctrl-C stops it. The dev server never builds: run `npm run build` again in a second terminal after edits to see them in the preview.

**Checks already run:** clean build with `npm ci` + `npm run build`, `validate`, region counts, collection URLs, schema keys, images, parity with the pre-migration HTML, local dev server serving `build/`.

**Hydration (browser):** run `npm run build && npm run preview`, open each of these with the console open, and paste any console errors (or "none"): `/`, `/about`, `/contact`, `/blog`, `/blog/mdsvex-component-example`, `/blog/category/svelte`. On `/`, also click "Blog" in the nav, then a post title: does the post render with no console error (yes/no)?

**In CloudCannon (hosted site), one answer each:**

1. Did the first build on CloudCannon succeed (yes/no; if no, paste the last ~30 lines of the build log)?
2. On `/blog/heading-links-example` in the Visual Editor, can you click the post title and type into it (yes/no)?
3. On the same page, does clicking the cover image open the image picker (yes/no)?
4. On `/contact` in the Visual Editor, do the page sections show add/remove/reorder controls (yes/no)?
5. On any page, after editing the site title in the header and saving, does the commit change `src/lib/data/site.json` (yes/no)?
6. On `/blog`, after editing a post title in the listing and saving, does the commit change that post's file under `src/lib/posts/` (yes/no)?
7. In `heading-links-example.md`, change `Published` in the sidebar to another day and save: paste the `date:` line from the commit diff.
8. Open `syntax-highlighting-example.md` in the Content Editor, change one word of prose and save: does the body diff show only that word (yes/no)?
9. Open `mdsvex-component-example.md` in the Content Editor: does the Callout show as a snippet, and after a one-word edit elsewhere and save, is the `<Callout>` markup unchanged in the diff (yes/no)?

When you've run those, reply with any failures or odd behaviour.

## Skill-doc issues found

- `build.md § Frozen install` says "from an empty store" but not how to get one without wiping the user's global cache (`npm ci --cache <empty project folder>` worked).
- `sveltekit/build.md § Client navigation` says "Each page's data comes from its `__data.json`", but pages with only universal loads (here `[...slug]` and `blog/[post]`) have no `__data.json`; their data comes from the JS chunk.
- `sveltekit/build.md` suggests `npx serve build` but doesn't pin a version; `npm run preview` (already in the project) serves the adapter-static output with clean URLs too and needs no download.
- `cloudcannon-dev-server/setup.md` lists `npm i -g @cloudcannon/cli` as the install, while the migration constraint here and `migrate-to-cloudcannon` give no preference; the `npx` fallback works and could be the documented default for handoff commands.
- `handoff.md` checklist has no item for date inputs or escaped fences, which earlier phases deferred to Phase 5; `build.md` could say to carry forward "Phase 5 confirms" items from earlier notes.
- Neither `build.md` nor `handoff.md` says to delete the JSON schemas and parity baseline at the end, though Phases 2 and 3 defer that cleanup to "the end of the migration".
- Note: `vite preview` binds to `localhost` (IPv6 `::1` on macOS), so `curl http://127.0.0.1:4173` fails while `http://localhost:4173` works.

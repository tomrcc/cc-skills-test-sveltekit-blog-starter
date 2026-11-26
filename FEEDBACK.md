# sveltekit-blog-starter: round 1 feedback

Skills: `agent-skills` as checked out on 2026-11-26 (branch `svelte`, uncommitted drafts on `b58db29`).

## Decisions given to the agent

- No Svelte, SvelteKit or mdsvex upgrades. CloudCannon hosts the site. Forms post to an Inbox. npm.
- Mid-run answers: `.nvmrc` with Node 24. Audit defaults 1–5 and 7 kept. The orchestrator runs the hydration check in a browser.

## Skill gaps the agent reported (audit)

- `SKILL.md` and `orchestration.md` require one subagent per phase. The skill doesn't say how that fits a user rule like "ask before launching several agents over my files".
- `sveltekit/audit.md` doesn't warn that a `*` inside a `prerender.entries` path is literal. Only a bare `"*"` means every page. This site builds junk pages such as `blog/category/*.html` because of it.
- The audit's hydration check (browser console, or hand the list of pages to the user if there's no browser) doesn't say who runs it.
- `sveltekit/page-building.md` says to render page bodies "with the site's parser". Here that parser is mdsvex, which compiles at build time, and the doc doesn't say how a `[...slug]` load should render mdsvex bodies.
- There's no audit row for `redirect()` in prerendered loads. They build as meta-refresh pages, which work on static hosting.
- There's no guidance on `{` in mdsvex prose. An editor who types one can break the build.

## Result

All five phases ran. The build passes with no warnings, `cloudcannon validate` passes, and all 26 built pages match the original build in text and links. The agent added `packageManager: npm@11.19.1` to `package.json`.

Orchestrator checks (Playwright):
- Dev server: no hydration warnings or errors on `/`, `/about`, `/contact`, `/blog`, `/blog/mdsvex-component-example` or `/blog/category/svelte`.
- Preview build with `window.inEditorMode` set: no console errors or failed requests on the same pages. Client-side navigation into `[...slug]` pages and a post keeps the same document and renders the right `<h1>`.

## Skill gaps the agent reported (phases 2–5)

- Orchestration:
  - Nothing says whether temp files (schemas, a parity baseline) are kept or deleted between phases.
  - `handoff.md` and `build.md` don't collect the checks earlier phases leave for Phase 5.
  - Phase 4 overwrote the Phase 1 baseline `build.log`.
- Configuration:
  - `sveltekit/configuration.md` doesn't mention `handleUnseenRoutes`. A dynamic route whose `entries()` returns nothing fails the build, so pagination routes always need page 1.
  - Nothing says what a `type: date` input writes over a date-only string.
  - Nothing covers configuring files that Phase 3 will create.
- Page building:
  - `sveltekit/page-building.md`'s `getPage` + `{@html}` pattern doesn't fit mdsvex, which compiles at build time. That needs a universal load, and the doc doesn't show one.
  - Neither page-building doc says where a page-builder page's `<h1>` goes.
  - `page-building.md` has `Blocks.svelte` import `blockMap` from the component map at the top level, which the SvelteKit visual-editing checklist bans.
- Forms: `audit.md` § Forms doesn't give the form `action`, what to do with an empty `inbox_key`, or how to name inputs.
- Visual editing:
  - A `class:` directive can't go on `EditableRegions`, and the setup steps don't say so.
  - The handoff-readiness row in `SKILL.md` doesn't say what counts as registered for SvelteKit.
  - Nothing covers labels in attributes (a submit button's `value`, a placeholder).
  - Nothing says whether two list regions on the same data file on one page work.
  - Nothing covers a rich-text region on a child component's root element.
  - The setup doc overstates what the gated import keeps out of normal page loads: the registration function still ships on every page.
- Build:
  - `sveltekit/build.md` says every page has a `__data.json`, but pages with only universal loads have none.
  - `sveltekit/build.md` gives `npx serve build` with no pinned version. `npm run preview` does the same job without a download.
  - `cloudcannon-dev-server/setup.md` defaults to a global CLI install. The `npx` form works and suits handoff better.
  - Nothing says how to get an empty npm cache for the clean-install check.

## Tom's testing

- Local `cloudcannon dev`: every page shows the site's own 404 in the Visual Editor. Posts show "Unknown variable dynamic import: ../../../lib/posts/undefined.md". The dev server's editor template (`cc-tools/cli` `src/templates/editor.html`) fetches the page HTML and injects it into an iframe that has no `src`. The page's `location` is `/app/assets/e2e/omnipage/editor.html`, with `<base href="/__output/">`, so any client router matches the editor's path. Confirmed in Playwright on this site and on a plain static page that prints `location.pathname`. `cloudcannon-dev-server/troubleshooting.md` already has the row ("A client-routed site (Nuxt) shows its own 404…"), but it names only Nuxt. The agent's handoff (`build.md`) points the user at `cloudcannon dev` for the editor checks without that caveat, so a real user would hit it on every page of a SvelteKit site. The editor checks moved to the hosted site.

- Hosted: pushed to `tomrcc/cc-skills-test-sveltekit-blog-starter`. The build succeeds, and the Visual Editor shows pages with no 404.
- No site-side fix: the page's `location` belongs to the editor template, not to any output URL. Tom chose a dev-server fix and an issue for `cc-tools/cli`.
- Hosted editor, "A Markdown post with a Svelte component": the body, including the Callout, is one editable rich-text area. Tom found nothing else off apart from the next item.
- Hosted editor, "Syntax highlighting with mdsvex": the two code blocks that show fence syntax (`\```css … \```` inside a plain fence) render empty in the Visual Editor. The built page renders them (mdsvex outputs ```` ```css ````). The audit flagged these escaped fences, and `markdown.options.escape_snippets_in_code_blocks` is on. Opening the post without touching it leaves Save clean.
- Save of "Syntax highlighting with mdsvex" after one paragraph edit (commit `64bb85f`):
  - The escaped fences (`\```css` and `\```js` inside plain fences) are unchanged in the file. Their empty blocks are an editor display problem only.
  - The `date:` line becomes `date: 2023-01-05T00:00:00Z` (and `updated:` the same). The site's `formatDate.js` cuts it back, so the post still prints `2023-01-05` and the build passes.
  - The editor also adds `_schema: default`, unquotes strings, removes the blank line after the front matter, adds one before a fence that followed text directly, and drops the final newline.
- Hosted editor, Contact Rich Text block (`{@html}` inside the region host): an inline edit stays after clicking out and back in.
- Hosted editor, Contact Form block choices (array of strings, Svelte 5): "Add item" adds a new choice on the page.
- Hosted editor, header nav: a label edit ("About" → "About Us") saved to `src/lib/data/navigation.json` (commit `2d41035`), which CloudCannon reformatted to one key per line. The same save carried the earlier Contact edits: the Rich Text block (HTML in YAML), a Callout `<br />`, and the "Add item" choice. The build passes.
- Contact form markup: `method="post"`, no `action`, no `_gotcha` honeypot, and the hidden `inbox_key` only when set. The Inbox docs ("Connecting your site to an Inbox") use `action` as the post-submit redirect and include `_gotcha`, but don't say what happens without `action`. Without `inbox_key`, a submission goes to the Inbox linked to the site.
- Save of "A Markdown post with a Svelte component" (commit `4779b1e`): the `<Callout>` survives as a paired snippet, joined onto one line (`<Callout>…<code>…</code></Callout>`). The build passes and the Callout renders. The editor also turns `_inside_` into `*inside*`, and makes the same front-matter and date changes as the syntax post.

All editor checks for this site are done. Tom skipped the Inbox form check (out of scope: it would test CloudCannon forms, not the skills).

## Fix round 1: empty code blocks in the Visual Editor

- Sent to the migration agent as a symptom only.
- Cause found: the editor renders `@content` fences without the highlighter's `language-*` class. Plain fences become a bare `<pre><code>`, and the site's `code { color: var(--darker) }` draws the text dark on the dark `pre` background. Built pages always carry `language-*` (mdsvex adds `language-undefined`), so Prism's colours apply there.
- Fix: `pre code { color: inherit; }` in `static/css/code.css`. The built site is unchanged and the build passes.
- The agent reproduced the problem without the hosted editor. It built a minimal static test site on `cloudcannon dev` (which the 404 bug doesn't affect) and checked computed colours in Playwright before and after the fix.
- Skill gaps it named:
  - Nothing says the editor draws `@content` code blocks without the SSG's highlighter classes, so site CSS that relies on them can hide the text.
  - The audit flagged the file only as a save risk.
  - `cloudcannon-dev-server` says to ask the user rather than drive the editor. The minimal-site approach worked and could be documented.
- Not fixed, by choice: the editor shows the backslashes (`\```css`), while mdsvex drops them on the built page. A four-backtick outer fence would fix that but changes content, and isn't tested against an editor save.

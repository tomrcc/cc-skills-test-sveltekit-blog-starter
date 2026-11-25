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

- Local `cloudcannon dev`: every page shows the site's own 404 in the Visual Editor. Posts show "Unknown variable dynamic import: ../../../lib/posts/<slug>.md". The dev server serves the build at `/__output/<route>.html`, and SvelteKit's router reads that path after hydration. I reproduced it in Playwright. `cloudcannon-dev-server/troubleshooting.md` already has the row ("A client-routed site (Nuxt) shows its own 404…"), but it names only Nuxt. The agent's handoff (`build.md`) points the user at `cloudcannon dev` for the editor checks without that caveat, so a real user would hit it on every page of a SvelteKit site. The editor checks moved to the hosted site.

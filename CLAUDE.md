# portfolio

Astro + TypeScript portfolio with a professional default and optional F1 mode.

## Architecture (Astro rebuild approved 2026-10-17; legacy retired 2026-10-24)

- The whole app is `src/`: Astro pages/layouts/components, shared CSS tokens,
  typed Markdown collections, data modules, and small progressive browser scripts.
- Use Node 24 and npm. Run `npm run check` and `npm run test:browser`.
  Browser runners are installed with `npx playwright install`. Browser tests
  serve the build on port 4400, so a running `astro dev` (4321) is never tested.
- `src/content/projects/` and `src/content/certifications/` hold entries;
  `src/lib/content-schema.ts` validates them, and `src/lib/content.ts` excludes
  drafts and validates references/assets for every public route.
- Keep project descriptions as `[what it is, how it works]`. Do not fabricate
  dates, credentials, benchmark results, live URLs or project screenshots.
- Profile, skills and education data live in `src/data/`; editorial copy and
  capability groups in `src/data/site.ts`. Guarded browser storage is
  `src/lib/storage.ts`.
- `src/scripts/theme.ts` owns the theme and one transition session.
  `src/scripts/f1-scene.ts` is a separate, intent-loaded Three.js/GSAP module.
  Reduced motion never imports the optional effect. Every exit must dispose
  rendering resources, timers and temporary DOM. Preserve route, scroll and focus.
- `src/scripts/boot-terminal.ts` owns the once-per-tab boot terminal (~3 s,
  restored by the owner 2026-10-18). An inline gate in `SiteLayout.astro`
  decides before first paint and has its own deadline. Keep fixed chrome
  outside `#site-shell`, which the hand-off transforms.
- Styling tokens live in `src/styles/site.css`; transition-only CSS is separate.
  Keep identical content/layout geometry across both visual modes.
- Every page is prerendered and there are no on-demand routes. The Vercel
  adapter stays for deployment (`docs/deployment.md`).
- The retired Next.js app is recoverable from tag `legacy-next-final`. See
  `docs/adr/0001-retire-legacy-next-app.md`. Content that only it held is listed,
  unverified, in `docs/legacy-content-inventory.md`.
- Read `docs/content-authoring.md`, `docs/deployment.md`, and `CHECKPOINT.md`.
  The approved design and implementation plan are under `docs/superpowers/`.
- Implementation and local checks do not mean committed, deployed or live.

## Agent skills

### Issue tracker

Issues live as GitHub issues in `Adeel0-0/portfolio`, driven through the `gh` CLI. See `docs/agents/issue-tracker.md`.

### Triage labels

The five canonical triage roles, each label string equal to its name. See `docs/agents/triage-labels.md`.

### Domain docs

Single-context: one `CONTEXT.md` and one `docs/adr/` at the repo root. See `docs/agents/domain.md`.

### Version control & Git management

Strict zero-tolerance policy for all agents (ChatGPT, Claude, Codex, Copilot, Cursor, etc.). Uncoordinated, untracked, uncommitted, or broken changes will be **IMMEDIATELY REVERTED AND REMOVED** via `git restore` and clean resets. All git operations, commit standards, and changelog updates must follow `docs/agents/version-control.md` and log into `docs/vcs-log.md`.

## Shared project guide for all agents

This file is the canonical project guide for Claude and other coding agents.
`AGENTS.md` points here. Keep shared instructions here and detailed conventions
in `docs/agents/`.

### Project purpose

A hiring-focused AI/ML and software-engineering portfolio with an F1
instrumentation theme. Prioritize clear evidence of work, accessible
interaction, performance, and deployable results.

This repository is a separate project from the parent job-hunt workspace.

### Start here

- Read `CONTEXT.md` for project background when it exists.
- Read relevant decisions under `docs/adr/` when that directory exists.
- Follow `docs/agents/domain.md` for domain documentation conventions.
- Check `git status` before changes and preserve existing unrelated work.
- Read `package.json` and `package-lock.json` for current dependency versions.
- Treat older documentation and previous check results as context; verify
  current behavior before relying on them.

### Repository map

- `src/pages/`: Routes: home, projects index and case studies, about,
  credentials, 404, robots and sitemap.
- `src/layouts/SiteLayout.astro`: Document head, prepaint theme and boot gates,
  header, navigation and the contact footer.
- `src/components/`: Project card, media, metrics and visual components.
- `src/content/`: Markdown projects and credentials; `src/content.config.ts`
  registers the collections.
- `src/data/`: Profile, skills, education and editorial site copy.
- `src/lib/`: Content schema and publication rules, boot timing, theme state,
  guarded storage.
- `src/scripts/`: Boot terminal, theme transition, F1 scene, project filter.
- `src/styles/`: Site tokens and components, boot and transition CSS.
- `public/`: Portrait, resume PDF, favicon and social image.
- `scripts/`: Build verification, the production-build server and the content
  fixture build.
- `tests/`: Vitest unit tests; `tests/browser/`: Playwright journeys and
  accessibility checks.
- `docs/agents/`: Issue tracker, triage labels, domain and version-control
  conventions.
- `.github/workflows/ci.yml`: Automated verification.

### Architecture conventions

- Keep routes in `src/pages/`, rendering in `src/components/` and layouts, and
  reusable logic and contracts in `src/lib/` or `src/data/`.
- `src/lib/` and `src/data/` must not import pages, layouts or components.
- Render content at build time. Add browser scripts only where browser APIs,
  state, or interaction require them.
- Keep filesystem checks (assets, resume availability) in build-time modules
  such as `src/lib/content.ts`, never in browser scripts.
- Keep project skill references consistent with the `SkillName` type.

### Styling and motion

- Preserve the established professional and F1 visual systems unless the task
  changes them. Use the tokens in `src/styles/site.css`.
- Preserve readable prerendered and no-JavaScript content.
- Keep fixed chrome outside `#site-shell` because the boot hand-off transform
  changes the containing block for fixed descendants.
- Honor reduced motion explicitly.
- Clean up timers, observers, event listeners, and animation frames.

### Content and external data

- Keep portfolio copy in `src/content/` and `src/data/` rather than
  duplicating it in components.
- Use verifiable project claims and explain the context behind metrics.
- Keep optional external data failures from breaking the core portfolio.
- Use `src/lib/storage.ts` for guarded browser-storage access.
- The site origin comes from `SITE_URL` or Vercel's production URL in
  `astro.config.mjs`.

### Verification

Use the package scripts:

- `npm run dev` (the owner runs the dev server)
- `npm run check`: typecheck, lint, unit tests and the verified build
- `npm run test:browser`: content fixture build and Playwright in Chromium,
  Firefox and WebKit

Report which checks ran, which passed or failed, and which could not run.
Do not describe a blocked check as passing.

### Shared instructions and local settings

`.claude/settings.local.json` contains Claude-specific local permissions.
It is not the shared project guide and does not grant permissions to other
agents. Follow each agent's actual runtime permissions.

Keep secrets, credentials, raw conversations, and machine-specific command
approval history out of this file.

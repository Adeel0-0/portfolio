# portfolio

Astro + TypeScript portfolio with a professional default and optional F1 mode.

## Active rebuild architecture (approved 2026-10-17)

- The active app is `src/`: Astro pages/layouts/components, shared CSS tokens,
  typed Markdown collections, and small progressive browser scripts.
- Use Node 24 and npm. Run `npm run check` and `npm run test:browser`.
  Browser runners are installed with `npx playwright install`.
- `src/content/projects/` and `src/content/certifications/` hold entries;
  `src/lib/content-schema.ts` validates them, and `src/lib/content.ts` excludes
  drafts and validates references/assets for every public route.
- Keep project descriptions as `[what it is, how it works]`. Do not fabricate
  dates, credentials, benchmark results, live URLs or project screenshots.
- Contact/profile data remains in `data/profile.ts`; shared storage and
  contribution helpers remain in `lib/`. The original data/logic tests remain.
- `src/scripts/theme.ts` owns the theme and one transition session.
  `src/scripts/f1-scene.ts` is a separate, intent-loaded Three.js/GSAP module.
  Reduced motion never imports the optional effect. Every exit must dispose
  rendering resources, timers and temporary DOM. Preserve route, scroll and focus.
- Styling tokens live in `src/styles/site.css`; transition-only CSS is separate.
  Keep identical content/layout geometry across both visual modes.
- Pages are prerendered; only `/api/contributions` renders on demand through
  the hosting adapter. Preserve its response, timeout and cache contract.
- Read `docs/content-authoring.md`, `docs/deployment.md`, and `CHECKPOINT.md`.
  The approved design and implementation plan are under `docs/superpowers/`.
- Root `app/`, `components/`, Next and Tailwind configs are retained legacy
  recovery source. The older Next-specific conventions below apply only when
  editing that source, not to the active Astro app. Do not delete it incidentally.
- Implementation and local checks do not mean committed, deployed or live.

This section records the owner's approved framework change and takes precedence
over the retained Next-specific repository map and motion instructions below.

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

- `app/`: App Router pages, root layout, metadata, error boundaries, global
  styles, and the contribution API route.
- `components/sections/`: Hero, About, Projects, Garage, Contact, and footer.
- `components/providers/`: Shared motion, scroll, notification, and skill state.
- `components/chrome/`, `components/nav/`, `components/mascot/`: Site decoration
  and navigation.
- `components/terminal/`: Interactive terminal interface.
- `data/`: Profile, projects, skills, education, and site copy.
- `lib/`: Shared contracts, pure logic, hooks, storage, environment resolution,
  resume availability, and motion helpers.
- `public/`: Portraits, resume PDF, and project media.
- `docs/agents/`: Issue tracker, triage labels, and domain conventions.
- `.github/workflows/ci.yml`: Automated verification.

### Architecture conventions

- Keep route-specific code in `app/`, rendering in `components/`, and reusable
  logic and contracts in `lib/` or `data/`.
- `lib/` and `data/` must not depend on `components/` or `app/`.
- `components/` must not depend on `app/`.
- Keep the main content server-rendered. Add client boundaries where browser
  APIs, state, or interaction require them.
- Keep server-only filesystem and environment logic out of client imports.
- Resolve resume availability in `lib/resume.ts` and pass its URL to clients.
- Use `lib/sections.ts` as the shared section registry.
- Keep project descriptions as `[what it is, how it works]`.
- Keep project skill references consistent with the `SkillName` type.

### Styling and motion

- Preserve the established F1 visual system unless the task changes it.
- Use the theme tokens in `app/globals.css` and `tailwind.config.ts`.
- Keep Tailwind class mappings in scanned source files, not `data/`; `data/`
  is excluded from the Tailwind content globs.
- Import shared motion APIs from `lib/motion.ts`. The lazy feature bundle
  belongs in `lib/motion-features.ts`.
- Use `m` with the existing strict `LazyMotion` provider.
- Handle reduced motion explicitly for scroll-linked `MotionValue`s.
- Preserve readable server-rendered and no-JavaScript content.
- Keep fixed chrome outside `#site-shell` because preloader transforms change
  the containing block for fixed descendants.
- Clean up timers, observers, event listeners, and animation frames.

### Content and external data

- Keep portfolio copy in `data/` rather than duplicating it in components.
- Use verifiable project claims and explain the context behind metrics.
- Validate contribution data before passing it to rendering code.
- Keep optional external data failures from breaking the core portfolio.
- Use `lib/storage.ts` for guarded browser-storage access.
- Resolve the site origin through `lib/env.ts`.

### Verification

Use the package scripts:

- `npm run dev`
- `npm run typecheck`
- `npm run lint`
- `npm test`
- `npm run build`

The current test suite uses a Node environment for pure logic and content
invariants. Add browser verification when changing user interactions.

Report which checks ran, which passed or failed, and which could not run.
Do not describe a blocked check as passing.

### Shared instructions and local settings

`.claude/settings.local.json` contains Claude-specific local permissions.
It is not the shared project guide and does not grant permissions to other
agents. Follow each agent's actual runtime permissions.

Keep secrets, credentials, raw conversations, and machine-specific command
approval history out of this file.

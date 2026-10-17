# Portfolio rebuild implementation plan

> **For agentic workers:** Use superpowers:executing-plans to implement task by task. The owner approved the full design and explicitly requested implementation; execute in this session without another approval gate.

**Goal:** Build the approved professional portfolio with an optional cinematic F1 mode, Git-managed content and verified delivery tooling.

**Architecture:** Astro prerenders content pages; one adapter-backed contribution endpoint preserves the existing public contract. One semantic token system changes presentation without remounting content. An optional Three.js/GSAP scene is imported on theme-switch intent and disposed after the transition.

**Tech stack:** Astro 7, TypeScript, CSS, Three.js, GSAP, Vitest, Playwright, GitHub Actions, Vercel adapter; Node 24.

**Spec:** ../specs/2026-10-17-portfolio-rebuild-design.md and ../../research/2026-10-17-f1-transition.md.

## Global constraints

- Preserve pre-existing user changes, resume bytes, profile location and legacy hash/API contracts. Keep a local binary patch and original config in ignored `.recovery/`.
- Work on `rebuild/astro-f1`; no commit, push, external publication or deployment in this implementation task.
- Professional default, F1 optional; same information and geometry. No mockup; local servers are for implementation testing only.
- No invented credentials, dates, numerical results or live-project claims. Unknown credential details remain draft.
- Node 24 locally and CI. Pin installed versions in lockfile. Core and cinematic bundle measured separately.
- Keep `CHECKPOINT.md` as durable execution ledger; update milestones and every ten minutes.

## Review focus

1. Rapid theme reversal or late imports must settle to the latest request without a leftover overlay.
2. Keyboard, unavailable storage and live reduced-motion changes must preserve usable content and focus.
3. Drafts, missing files, unsafe URLs and invalid references must not leak into public builds.
4. Contribution timeout/malformed payload must return the preserved 200/empty-array contract.
5. Production deployment must never be implied by local CI configuration or a passing build.

## File boundaries

- `astro.config.mjs`, `package.json`, `tsconfig.json`, `eslint.config.mjs`: active framework/tooling.
- `src/content.config.ts`, `src/lib/content-schema.ts`, `src/lib/content.ts`: typed content and publication validation.
- `src/content/projects/*.md`, `src/content/certifications/*.md`, `src/data/site.ts`: editable content; existing profile remains canonical for contact information.
- `src/layouts/SiteLayout.astro`, `src/components/*`, `src/styles/*`: shared semantic layout and both theme presentations.
- `src/pages/index.astro`, `projects/index.astro`, `projects/[slug].astro`, `certifications.astro`, `about.astro`, `404.astro`: visitor journeys.
- `src/scripts/theme.ts`, `src/scripts/f1-scene.ts`, `src/scripts/filters.ts`: small controller, lazy cinematic, progressive filter.
- `src/pages/api/contributions.ts`: shared parser/fetch adapter; main pages never wait for upstream.
- `tests/*.test.ts`, `tests/browser/*.spec.ts`, `playwright.config.ts`: content/API contracts and real-browser interactions.
- `scripts/verify-build.mjs`, `.github/workflows/ci.yml`, documentation: bundle/link checks and delivery setup.

## Task 1: Framework and preserved contracts

Interfaces: preserve `fetchContributions(username): Promise<ContributionDay[]>`, `parseContributions(input)` and `GET /api/contributions` JSON/cache headers. Keep original storage helpers.

- [ ] Snapshot the dirty baseline and use a working branch. Repair duplicate JSX without losing the added overflow styling.
- [ ] Install compatible Astro/adapter/Three/GSAP and test tools using local Node 24. Replace active scripts/config; leave old source available but excluded from the active build.
- [ ] Add API contract tests for success, non-OK, malformed JSON, timeout and cache headers; prove the migration boundary before changing it.
- [ ] Remove Next-only cache options from the shared fetch; deliver the same public endpoint through Astro.
- [ ] Run `npm test` and a minimal `npm run build`. Record actual results.

## Task 2: Content and professional pages

Interfaces: `projectSchema`, `credentialSchema`, `getPublishedProjects()`, `getPublishedCredentials()`, `validateContent(entries)`; project descriptions remain a two-string tuple. Publication filters apply to every route/index.

- [ ] Write failing schema tests for unsafe URLs, invalid dates, unsupported metrics and unpublished credentials; add collection/reference/asset validation.
- [ ] Add real source-derived project case studies and a draft NVIDIA credential. Missing dates remain absent, with a schema rule allowing them in drafts; do not fabricate values to fill fields.
- [ ] Create shared layout, navigation, skip link, resume, contact, case-study pages, structured credentials and about page.
- [ ] Create a deliberate token system: warm white/graphite/blue professional mode; ink/pale/red F1 mode. Use system sans typography, generous aligned reading grids and labelled architecture illustrations.
- [ ] Add mobile/desktop/no-JS browser assertions for routes, meaningful actions, legacy anchors and no overflow.
- [ ] Run typecheck, content tests, lint, build and browser checks; inspect screenshots of the actual app.

## Task 3: Shared theme and Lights Out transition

Interfaces: `Theme = 'professional' | 'f1'`; controller owns committed/desired theme and one session; scene exposes `prepareScene(canvas): Promise<{play(onComplete): void; dispose(): void}>`.

- [ ] Add browser tests for persistence, scroll/filter/focus retention, no arrival effect and reduced-motion behavior; run before implementation.
- [ ] Implement the small controller, early preference initialization, CSS fallback and keyboard Skip/Escape/Tab behavior.
- [ ] Implement an original procedural Three.js road/curbs/instanced trails and GSAP timeline: 2.2 s target, 500 ms readiness fallback, 2.5 s foreground deadline, shorter Professional return.
- [ ] Add rapid reversal, late async completion, context loss, blocked storage and repeated-cleanup browser cases. Every exit disposes resources; no animation loop remains in settled F1 mode.
- [ ] Verify real rich/fallback behavior, frame observations and cold/warm bundle loading without claiming broad device performance.

## Task 4: Delivery and review

- [ ] Add production-build internal-link/asset and separate JS-budget checks. Add content templates and authoring guidance.
- [ ] Update CI for Node 24, install/type/content/lint/unit/build/browser checks. Document Vercel Git previews, required branch/deployment checks and one production release owner; do not configure remote accounts without inspecting them.
- [ ] Update canonical project guidance to describe the accepted Astro architecture while retaining relevant existing conventions.
- [ ] Run final checks appropriate to the actual changes, then a fresh read-only whole-change reviewer under the executing-plans skill. Fix important findings with regression coverage.
- [ ] Update checkpoint with changed files, checks, limitations, processes and next action. Release writer ownership at handoff. No automatic commit/deploy.

## Execution rulings

- User's explicit implementation request supersedes a second plan-approval prompt. Native execution avoids repeating the design gate.
- Work in the shared checkout on a dedicated branch, retaining the dirty baseline and a recovery copy; no worktree copying or stashing is needed. Cost: existing changes and rebuild remain in one working tree, distinguished in the checkpoint.
- Keep legacy source during acceptance instead of deleting it. Only `src/` is the active app; legacy pure tests still run. Cost: temporary repository clutter, removed only in a later reviewed cleanup.

## Self-review

All design areas map to tasks above. Shared schemas feed routes and filters; the theme controller alone owns scene lifecycle. Draft filtering and external-data failure are tested separately from decorative rendering. Hosted release gates and actual credential evidence remain external dependencies, explicitly reported at handoff.

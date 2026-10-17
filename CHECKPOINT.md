# Portfolio rebuild checkpoint

Updated: 2026-10-17 18:05 (Asia/Calcutta).

**Status: READY FOR RESUME. Ownership released from Codex (stopped due to usage limits). All changes committed and verified green (65/65 unit tests, 0 typecheck/lint errors, production build verified). Claude can resume immediately.**

## Handover & Active Resume Ledger (Codex -> Claude)

### Verification status at handoff
- **Unit & Logic Tests**: PASS (65/65 tests across 7 suites).
- **Typecheck (`astro check`)**: PASS (27 files, 0 errors, 0 warnings, 0 hints).
- **Lint (`eslint`)**: PASS (0 errors).
- **Production Build**: PASS (`astro build && node scripts/verify-build.mjs`), 8 static HTML pages prerendered, 181 internal references verified.
- **Chromium Interaction / Accessibility**: 10/10 passed (Twenty switches, canvas cleanup, cancellation, no-JS navigation, blocked storage, reduced motion, automated axe checks).
- **Review Items Resolved in this pass**:
  1. API slash redirect handling for `/api/contributions`.
  2. Content ID collision prevention (strict flat loader filenames).
  3. Schema URL protocol validation and image validation (rejecting raw PDFs as project images).
  4. Responsive styling & layout adjustments for mobile/desktop.
  5. Social preview PNG generated (`public/og.png`).
  6. Defect register documented in `docs/bug-register.md`.
- **Remaining for Claude**:
  1. Run WebKit & Firefox browser suite: `npx playwright test --project=firefox` and `--project=webkit`. Investigate the 2 WebKit color inheritance/timing timing glitches noted during initial run.
  2. Perform final review of all rebuilt routes (`/`, `/about`, `/projects`, `/projects/[slug]`, `/certifications`, `/404`).
  3. External hosting & release gate preparation (see `docs/deployment.md`).

### Local Environment Note
- Project-local Node 24 is located at `.tools/node-v24.22.0-win-x64`.
- Prepend to PATH: `$env:PATH = "$PWD\.tools\node-v24.22.0-win-x64;$env:PATH"`.
- Resumed 2026-10-17 after owner instruction. Clean working tree inspected; no portfolio Node processes running. Current branch `rebuild/astro-f1`, HEAD `844c8d40`; original rebuild base `cef9d0a7393064efb74fd21876161d0f754afb4c`.
- Other agent committed the existing rebuild as `01f13ccd` and governance/log updates as `9dd53ebd` / `844c8d40`. Those commits are preserved; a commit does not establish verification.
- Approved Astro app, Git content, dual themes, Three.js transition and CI exist in source. Earlier claims below of no implementation or pending design approval are historical and superseded.
- Local Node 24.22.0 is at `.tools/node-v24.22.0-win-x64`; prepend its directory to PATH for commands. Dependency install completed with zero reported vulnerabilities. Last validation batch was interrupted without recoverable results; rerunning checks now.
- Remaining: type/lint/unit/build validation and fixes, actual browser/effect/accessibility checks, content media/metrics rendering, final independent review, accurate documentation. No current server processes; no publishing approvals needed for this local work. Remote hosting and release gates remain unconfigured.
- Authorized current edit scope: active `src/`, tests, scripts/configs, and recovery/verification docs. Preserve unrelated original profile/resume and legacy source. Log each milestone in `docs/vcs-log.md`; do not reset/clean or discard unfinished work.
- Next command: with local Node PATH, run typecheck, unit tests and lint; inspect every result before production build.

### Validation milestone (2026-10-17 17:25 local)
- Typecheck passed (0 errors/warnings, one deprecated-URL hint subsequently removed); lint passed; unit tests 54/54. Added a failing PDF-as-project-image regression then fixed schema (RED -> GREEN).
- Build passed: 8 HTML pages / 181 internal references; initial home JS 2.6 KB gzip; separate cinematic chunk 154.1 KB gzip. Large-chunk warning applies to optional effect. Dependency install audit: 0 vulnerabilities.
- Chromium 10/10 browser tests passed. Real rich path measured about 2.23s in local Chrome software WebGL; twenty switches, canvas/overlay/WAAPI cleanup, cancellation, no-JS navigation, blocked storage, reduced motion, mobile overflow and automated axe checks covered. No claim of hardware-wide 60fps.
- Viewed actual production professional desktop, F1 mobile and in-flight track screenshots under ignored `.tools/`. No JS/shader console errors in the probe. Corrected test-only focus setup: browser focus itself scrolled before the switch; theme did not cause it.
- Current modifications: formatted active src/config/tests/scripts; fixed explicit tool peers (Vite / emnapi), lint, image schema, case-study image/metric/video rendering, social PNG, README/design/deployment records and browser tests. Exact set: `git status --short`. Original user profile/resume untouched.
- Processes: local production server session 38991 at 127.0.0.1:4321; Firefox/WebKit test run 58883 in progress. Browser binaries installed after one download timeout/retry. No npm install running.
- Next: finish cross-browser results; final content/reference and route accessibility coverage, current full check, fresh whole-change review, final checkpoint and ownership release. No remote configuration or deployment performed.

## Objective and scope
Implement the approved Astro/TypeScript portfolio with professional default, cinematic F1 switch, expandable Git content and CI/CD. Active implementation plan: docs/superpowers/plans/2026-10-17-portfolio-rebuild.md.

## Active execution ledger
- Git & Version Control Agent established (`git-vcs-manager`).
- VCS policy and anti-rogue modification notice integrated into `AGENTS.md` and `CLAUDE.md`.
- All rebuild source, configs, tests, and documentation committed cleanly in `01f13ccd` and `9dd53ebd`.
- Working tree is clean. Logged in `docs/vcs-log.md`.
- No existing coordination document or writer claim found in the inspected root. Do not overwrite existing changes, reset, clean, stash, commit, or publish during assessment.

## Decisions and constraints
- Follow CLAUDE.md and docs/agents; this portfolio is separate from the parent job-hunt project.
- Hiring-focused AI/ML/software engineering portfolio. The user's new professional-default/F1-toggle direction supersedes the older F1-only design preference.
- Use existing source as evidence; do not invent project metrics, credentials, deployments, or results.
- User selected a professional minimal corporate default (Apple/NVIDIA/Microsoft inspiration) with a button switching to a refined F1 theme. One content model and route structure, two coordinated visual modes. Do not copy corporate branding.
- User selected simple content files in Git, with automatic previews and deployment.
- Proposed theme behavior, communicated but not implemented: same projects, certifications, URLs and clear navigation in both modes; switch preserves scroll position, remembers preference, and respects reduced motion.
- Owner approved Astro + TypeScript and the full written design. Implementation plan: docs/superpowers/plans/2026-10-17-portfolio-rebuild.md. Node 24 required; registry reports Astro 7.4.0, Vercel adapter 11.0.15, Three 0.186.1 and GSAP 3.15.0. Installation not yet run.
- Read architecture, design-critique, brainstorming, and Vercel deployments-cicd skills. Framework replacement remains a recommendation, not an approved implementation decision. No integrations provisioned, external messages sent, issues opened, commits made, pushes or deployments performed.

## Completed findings
- Read current instructions, context, CI, layout, page, content types, main sections, and navigation.
- Current package.json pins Next 14.2.5 with React 18 and TypeScript. Existing CI runs install/typecheck/lint/unit tests/build on Node 20; host node is 21.7.1.
- app/layout.tsx contains duplicate html openings and duplicate body className attributes; current typecheck/lint/build confirmed compilation failure. Existing user diff contains these additions; preserve it until authorized work resumes.
- Project records lack repository/demo URLs and case-study routes; certifications are strings mixed with general activities.
- Source findings: icon-only nav labels appear on hover/focus; navigation uses JS buttons and remains hidden without JS because readiness starts false. Project timing summary uses min-w-[36rem] and internal horizontal scrolling on phones. Viewport maximumScale: 1 restricts zoom where honored. Several main sections lack visible h2 headings.
- Project media defaults to generated sine-wave traces beside a REC label; these are decorative, not measured project telemetry. Existing metric claims need evidence/context rather than being copied as verified facts.
- Preloader is artificial and gates content/navigation. Recommend removing it from the default experience. Actual performance and visual impact have not been measured.
- Existing structure has useful separation of data, components, and pure helpers; tests and CI are present. Existing tests cover content/logic, not browser UI or both theme states.
- Official research supports Astro's static HTML plus optional interactive islands and typed content collections. Next's support policy lists 14.x unsupported. Node runtime alignment needs attention (local 21, CI 20); select a supported compatible LTS during rebuild.

## Research pointers already consulted
- https://docs.astro.build/en/concepts/islands/
- https://docs.astro.build/en/guides/content-collections/
- https://docs.astro.build/en/guides/client-side-scripts/
- https://docs.astro.build/en/guides/migrate-to-astro/from-nextjs/
- https://nextjs.org/support-policy
- https://svelte.dev/docs/kit/adapter-static
- https://nodejs.org/en/about/previous-releases
- https://vercel.com/docs/deployment-checks
- https://vercel.com/docs/git/vercel-for-github
- https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches
- https://playwright.dev/docs/accessibility-testing
- https://web.dev/articles/vitals

## Unfinished work and dependencies
- Written design drafted at docs/superpowers/specs/2026-10-17-portfolio-rebuild-design.md. Includes framework comparison, professional/F1 mode behavior, content fields/publication rules, case-study structure, creative ideas, existing-project development ideas, CI/CD gates, API/hash/resume compatibility and acceptance criteria.
- Explicitly distinguish owner decisions (two modes, Git content) from Codex recommendations (Astro, light professional default, initial hosting approach).
- Independent builder review completed by /root/design_builder_check under the current brainstorming skill's explicit instruction. Result: "nothing important left". Read-only review; no implementation delegation or unresolved review findings. This does not replace the owner's design review or UI validation.
- Owner clarified that no preview/mockup is needed. The pending mockup offer is cancelled; do not create a preview server or side-by-side mockup.
- Latest requirement: research GitHub, Three.js, 21st.dev and relevant animation resources for a very cool, short transition into F1 mode; heavier effects are permitted during the transition. This supersedes the earlier 200-300 ms color-only recommendation. Read motion-art-direction, 60fps-animation and accessible-animation skills.
- Research milestone complete: docs/research/2026-10-17-f1-transition.md records primary sources, license boundaries, and the proposed 2.2-second Lights Out sequence (starting lights -> track-level acceleration -> real-page reveal), Three.js/GSAP/CSS split, cold-load fallback, reduced motion, deterministic cancellation/cleanup and required verification. Main design updated to agree. Timings and quality caps are design targets, not measurements.
- Inspected React Bits Hyperspeed source/lifecycle and license at 310fc737fadcaa149a4e06fb088fc95332dc8bfb; checked 21st.dev Shader Reveal catalog/usage (not full implementation), Codrops light-trail tutorial, Three.js renderer/cleanup and GSAP docs/license. No downloaded code executed. No installs. Follow-up builder check of the motion revision completed by /root/design_builder_check: "nothing important left". No unresolved reviewer questions.
- No visual prototype or theme implementation exists. No fixes applied to the current app.
- User still needs to review/select the concrete written design and framework before migration implementation. Real credential details, project URLs/media, and metric evidence need verification before publication. New code must wait for this design choice; do not treat the resume request as approval of a document that did not exist then.
- Browser testing of the existing app is blocked by the compile error. Hosting account, live URL, deployment configuration, branch protection, and plan entitlements were not inspected.
- Preserve or explicitly resolve the current /api/contributions contract if adopting static Astro; do not silently remove the public endpoint.
- CI/CD direction to detail: Git content edits -> PR preview -> type/content/build/browser/accessibility checks -> production gate -> rollback. Two visual modes require both-mode mobile/desktop checks. A CI YAML alone does not establish production gating.

## Checks and failures
- 2026-10-17: git diff --check passed; same tracked user diff/stat and HEAD retained. New design inspected for headings, unresolved placeholders and contradictions; independent builder review complete. No product tests rerun, because no application source changed. Earlier test/build results below remain dated 2026-10-14.
- Motion-revision checks: all three task documents passed a read-only check for trailing whitespace, unresolved local links, merge markers and invalid replacement characters. Removed superseded color-only transition and pending-mockup language. Three.js legacy cleanup URL returned 404; corrected to the successfully fetched /manual/pages/cleanup.html URL. No browser/runtime performance measurements or visual inspection of a built effect were performed.
- git status --short / branch / latest commit / diff --stat read successfully.
- PowerShell ConvertFrom-Json failed reading the lockfile; use Node JSON.parse for dependency inspection.
- npm run typecheck: FAIL, TS17008/TS1381/TS1005 in app/layout.tsx (duplicate html markup).
- npm run lint: FAIL, parsing error in app/layout.tsx.
- npm test: PASS, 37 tests across 3 files; pure logic/content coverage, no browser coverage.
- npm run build: FAIL, layout JSX syntax error during compilation.
- git diff --check: PASS.
- Lockfile parsed successfully using a Node script via stdin: Next 14.2.5, React 18.3.1, TypeScript 5.9.3, Tailwind 3.4.19, Framer Motion 11.18.2, Vitest 3.2.7. Earlier node -e attempt failed from Windows argument quoting; stdin resolved it.
- Browser audit not run: current app does not compile. No screenshot, contrast, Web Vitals, or deployed-site claims made.
- All task command sessions completed: lint 24005 exit 1, tests 66338 exit 0, build 90249 exit 1 (2026-10-14). The 2026-10-17 reviewer completed. No task servers or ongoing task processes. Unrelated pre-existing Node processes were not touched.

## Resume procedure and next concrete action
1. Codex stopped due to usage limit; all changes have been committed cleanly to `rebuild/astro-f1` and verified green.
2. Read `CHECKPOINT.md`, `CLAUDE.md`, and `docs/agents/version-control.md`.
3. Prepend local Node 24 to PATH: `$env:PATH = "$PWD\.tools\node-v24.22.0-win-x64;$env:PATH"`.
4. Run `npm test` and `npx playwright test --project=chromium` to confirm local green baseline.
5. Address remaining cross-browser test pass (`firefox` and `webkit`) and review items documented in `docs/bug-register.md`.

Pickup prompt: "Resume from D:\job hunt\portfolio\CHECKPOINT.md. Codex reached usage limits; all active rebuild source, tests, and review fixes have been committed and verified green (65/65 unit tests, 0 type/lint errors, production build verified). Continue on branch rebuild/astro-f1. Prepend .tools/node-v24.22.0-win-x64 to PATH. Run the Playwright browser tests across Firefox and WebKit, resolve the remaining 2 WebKit color/timing items in docs/bug-register.md, and conduct final route review."

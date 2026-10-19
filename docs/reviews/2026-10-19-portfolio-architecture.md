# Portfolio architecture, efficiency and UI review

Date: 2026-10-19 (Asia/Calcutta). Application baseline: `b638d49d880a04c48a76d08e9fb49cb616ed2c7a`. Audit branch: `docs/portfolio-architecture-audit-20261019`. Scope: the current active application, rather than a historical commit diff. Three skill-requested read-only reviewers covered standards, requirements and architecture; Codex verified the findings. This is a completed assessment, not an implemented refactor or a release approval.

## Verdict

Keep Astro, TypeScript, typed Markdown, CSS tokens, and optional Three.js. The active site already has a proportionate architecture for a portfolio: prerendered pages, very little initial JavaScript, and a separately loaded cinematic effect. Another framework migration would not correct the reproduced layout and lifecycle defects.

The highest-value work is to give project presentation consistent ownership, make temporary animation cleanup reliable, preserve all authored copy in the rendered site, and test the visual states the current suite misses. Avoid a generic design-system package, CMS, state-management framework or animation engine for this small site.

The current source differs substantially from the retained Next implementation. There are 29 tracked files under `src/`, versus 9 under legacy `app/` and 39 under legacy `components/`; shared `lib/` and `data/` contain both useful active imports and recovery-era material. Retained source complicates navigation, but it is not evidence that visitors download React or Next. Do not delete it before a content/import inventory and the repository's recovery requirements are resolved.

## Measured baseline and evidence limits

| Check | Result |
|---|---|
| `npm run check`, Node 24.22.0 | PASS: 31 Astro files, 0 errors/warnings/hints; lint; 70 tests across 8 files; production build |
| Build verification | 8 static HTML pages, 189 internal references |
| Home initial JS | Verifier reports 4.3 KiB gzip; explicit emitted-file accounting including shared storage is 4.4 KiB (4,512 bytes) |
| Optional F1 chunk | 154.1 KiB gzip; 598,508 bytes minified, loaded on interaction intent |
| Shared CSS | 5.8 KiB gzip (22,915 bytes minified) |
| Home HTML / portrait | HTML 4.3 KiB gzip; portrait PNG 111,766 bytes |
| Existing browser suite | 49 passed, 2 expected WebGL skips, 0 failed, 0 flaky; Chromium, Firefox, WebKit |
| Existing isolated content fixture | PASS: invalid filenames/collisions rejected; media and metric evidence rendered into fixture build |
| Additional current-page matrix | PASS: 8 routes x 2 themes x widths 320, 390, 768, 1024, 1440 = 80 combinations; no document overflow, missing h1 or broken images |
| Additional targeted Chromium tests | 4 FAIL: late boot, restored theme metadata, image caption, metric panel inset; these failures establish defects, not successful verification |

The saved cross-browser report ended at 12:30:25 and was recovered after the owner's continuation message. Its embedded report records 51 total, 49 expected, 2 skipped and no errors. The interactive browser connector was unavailable on resume. Additional tests used the existing installed Playwright runner, isolated servers and saved screenshots. Inspected screenshots include home desktop/professional, home mobile/both modes, projects tablet/F1, SEFGH mobile/F1, and image/metric fixture desktop/mobile.

No widespread overlap was reproduced in the settled current-page screenshots inspected. This is not a claim of zero UI defects. No real-device GPU/frame-time survey, production Web Vitals, screen-reader audit, 200% zoom matrix, or deployed-version comparison was performed. The full WebGL journey uses software rendering in Chromium. Sizes are local build measurements, not a production network trace.

## Standards review

1. **P2: late successful boot loading reactivates a released presentation.** `src/layouts/SiteLayout.astro:72` removes the overlay/attribute independently of the controller; `src/scripts/boot-terminal.ts:118` later trusts only its private phase and writes `data-preloader="launching"`. With that module delayed 4.5 seconds, the recorded states were running at 15 ms, released at 5,676 ms, launching again at 6,757 ms, released at 7,562 ms. The page's completed state is therefore not terminal, contrary to the cleanup convention. This reproduces stale controller activity; it does not establish that the page stays blank permanently. **UI-014.**

2. **P2: restoring F1 does not restore browser theme metadata.** The prepaint script in `SiteLayout.astro:44` updates only `data-theme`; `theme.ts:238` initialises the button without the metadata update in `commit()`. After switching to F1 and navigating to About, the DOM is F1 while `meta[name=theme-color]` is `#f7f8fa`, instead of `#10151e`. The metadata mismatch is browser-confirmed; browser-toolbar rendering varies by platform. **UI-015.**

3. **Maintainability judgment: duplicated content authority.** `src/data/site.ts:6` declares a headline that `src/pages/index.astro:21` repeats literally. Resume existence is separately checked by the layout and home page. `getPublishedProjects()` and `getPublishedCredentials()` each reload and validate both collections. Consolidate those specific decisions; do not add an abstract content framework. Repeated collection validation is a small build-time cost, not a current visitor latency problem.

4. **Verification consistency:** `tsconfig.json:7` points `@/*` at `src/*`, but `vitest.config.ts:24` maps `@` to the root for legacy tests. Current active tests use relative imports, so no current production failure was established. Separate active and legacy aliases before relying on the same spelling in new tests. **TOOL-003.**

5. **Bundle-budget accuracy:** `scripts/verify-build.mjs:64` follows imports with a regex requiring whitespace before `from`. Both emitted entry scripts contain minified `import{...}from"./storage..."`, so the shared 150-byte gzip module is omitted. The current discrepancy is tiny, but a dependency-graph budget should use actual build metadata or a parser, not spacing-sensitive source matching. **TEST-005.**

The reviewer's suspected F1-related card-height change was **not reproduced** at the five tested widths. Do not present it as a verified defect. No critical security defect was identified in the inspected active paths; this was not a penetration test.

## Spec and user-requirements review

1. **P2: supported project screenshots clip their captions.** `src/pages/projects/[slug].astro:79` puts both image and caption in `.case-visual`; `src/styles/site.css:921` fixes the figure to 380 px and hides overflow. The existing isolated fixture at 1440 px produced a figure ending at y=912.2 and a caption ending at y=1130.7. The caption was entirely hidden. On mobile the same fixed height creates a large empty frame. Current published entries use diagrams, so this is a reproduced supported-content-path defect, not a claim that a published photograph is presently clipped. **UI-016.**

2. **P2: required authored descriptions have no rendered consumer.** The two-part `description` in `src/lib/content-schema.ts:41` is required and authored in all three project files. Cards (`ProjectCard.astro:44`) and case studies (`[slug].astro:25`) render `summary` and/or Markdown bodies, never that field. Preserve and intentionally render this authored copy, or consolidate it losslessly into the case study before retiring the field. Cards also omit the recorded contribution role, which the approved design requested. **CONTENT-001.**

3. **P3: narrow metric panels lose uniform spacing.** `site.css:927` sets a minimum 240 px grid track and 30 px padding. At 320 px the panel is 288 px wide; borders and padding leave 226 px for that track. The fixture's content extends 14 px into the intended right inset. Document width remains 320 px: this is a content-box/inset defect, **not page-level horizontal overflow**. **UI-017.**

4. **High-priority coverage gap:** `tests/browser/portfolio.spec.ts:263` tests widths first, then both themes only at the final desktop width. Similar sequencing exists in secondary-route coverage. Document-width assertions cannot detect clipped captions, inset violations, overlapping hit targets or all internal misalignment. Missing visual regression, media/metric-fixture browser checks, keyboard Tab/Enter during boot, and zoom coverage mean the suite cannot support a zero-UI-bugs claim. **TEST-004.**

5. **Existing content dependencies:** SEFGH and tiny-drone entries do not yet publish repository/demo/media evidence; the NVIDIA credential remains a draft. Preserve truthful current content and obtain real evidence. Never invent results or silently publish the draft to fill a page.

The restored three-second boot terminal is an explicit owner decision from 2026-10-18. It is not unauthorised scope. It deliberately postpones the first readable portfolio content, despite the tiny JS bundle. If instant arrival is now more important, choose a nonblocking/replayable introduction; do not remove the requested effect under the label of cleanup.

## Architecture candidates

### 1. Consistent project presentation — Strong, first recommendation

Files: `ProjectCard.astro`, `ProjectVisual.astro`, `projects/[slug].astro`, relevant rules in `site.css`.

Before: two callers select media/diagram independently, while global CSS owns image sizing, caption clipping, metric spacing and responsive changes. After: one project-media module owns that layout contract; the card and case study remain understandable renderers. Keep shared palette, type and spacing tokens global; put specific presentation rules beside their owning module. The caption belongs outside the clipped image viewport. Make image dimensions/aspect ratios explicit, metric tracks shrinkable, and card action placement consistent.

This earns depth because one small interface hides media fallback, caption placement, sizing and loading decisions. The deletion test would put those rules back into two callers. It improves locality and gives each visual correction leverage across both modes. Test real rendered image/diagram/metric fixtures at the module's interface. Avoid extracting every link or paragraph into another shallow module.

### 2. One owner for temporary presentation lifecycle — Strong

Files: `SiteLayout.astro`, `boot-terminal.ts`, `theme.ts`, `theme-state.ts`, boot/transition CSS; retain `f1-scene.ts`.

Before: inline recovery and the boot controller can independently release the same presentation; theme and boot also manage separate fullscreen sessions. After: make completion irreversible, route controller exits through one cleanup path, and coordinate boot/theme activation. Keep a tiny independent prepaint recovery mechanism for the case where the main script never arrives, with an explicit handoff to the loaded controller. Keep the existing deep Three.js scene module, which already hides GPU setup and disposal behind a small interface. Do not introduce a generic animation framework.

The real seam is between lifecycle ownership and effect rendering. Preserve the Three.js implementation/adapter at that seam. Tests should exercise delayed successful load, cancellation, failure, focus/scroll, reduced motion, hidden tab and repeated entry; callers should not have to know about timer arrays or disposal order. This concentrates lifecycle bugs and increases locality.

### 3. One authority for active portfolio content — Strong

Files: `src/data/site.ts`, shared `data/profile.ts`/skills, Markdown collections, `content.ts`, home and case-study templates.

Before: required invisible descriptions, unused headline, duplicated resume checks, and overlapping old/new data. After: explicit active profile/capabilities, Markdown project/credential authority, and one publication result per build consumer. Keep the valuable draft/reference/asset validation module. Give every required field a visible purpose and type capability skill references consistently.

The deletion test says to keep publication validation: removing it scatters rules across routes. It says to delete redundant declarations: removing them removes complexity. Preserve copy, links, titles, skills, resume and metadata with a before/after content inventory. Retain draft exclusions. This gives content edits leverage without adding runtime state.

### 4. Make active/recovery tooling explicit — Worth exploring after visible defects

Files: `tsconfig.json`, `vitest.config.ts`, build verifier, CI, documentation and retained source.

Before: the same alias points at different roots; recovery tests and active tests are reported together; visual gaps are hidden by a healthy total. After: explicit active and recovery test/import seams, robust bundle accounting, and a route x theme x width visual matrix. Archive/delete old source only after import/content parity is demonstrated and the preservation policy is consciously changed.

This is repository clarity, not an expected runtime speed gain. No extra runtime adapter is needed. The deletion test is whether recovery source could eventually disappear without editing active imports. Use tests of the real rendering interface rather than tests that merely assert class strings or HTML text presence.

## Acceptance criteria for the next implementation

- Preserve all existing portfolio content, routes, links, resume URL, draft status and contribution endpoint behavior; inventory any intentional content relocation.
- No clipping, unintended overlap, horizontal overflow or obscured focus in the route/theme/width matrix, plus 200% zoom and keyboard mobile navigation.
- Media/metrics, long titles, empty credentials and projectless skill links must be included in browser coverage, not only current happy-path content.
- Match shared spacing, type, radii and action placement across pages; reviewed screenshots become the baseline after correction, never before.
- Entry and theme effects have one irreversible completion outcome; no surviving canvas, timers, listeners or fullscreen obstruction after cancellation/deadline.
- Maintain the small core bundle; keep Three.js optional, lazy and disposable. Set real-device frame-time targets after measuring representative devices. A 60 fps claim requires measurements.
- For real traffic, target LCP <=2.5 s, INP <=200 ms and CLS <=0.1 at the 75th percentile, separately for mobile and desktop. Those are targets, not measured results here.

## Evidence, sources and next step

Reproduction harness, JSON traces and screenshots: `C:/Users/Windows/AppData/Local/Temp/portfolio-audit-20261019/`. The temporary config runs two isolated servers on 4401 and 4402; `node scripts/verify-content-build.mjs` creates the existing fixture. Command: `& '.tools/node-v24.22.0-win-x64/node.exe' 'node_modules/@playwright/test/cli.js' test -c 'C:/Users/Windows/AppData/Local/Temp/portfolio-audit-20261019/playwright.config.mjs'`. These intentionally failing audit probes are outside CI and should become permanent regressions as their corresponding fixes are implemented.

Official references: [Astro islands](https://docs.astro.build/en/concepts/islands/) supports the static HTML/optional-interaction choice; [Three.js cleanup](https://threejs.org/manual/pages/cleanup.html) explains explicit GPU-resource disposal; [Web Vitals](https://web.dev/articles/vitals) defines the performance targets and field/lab distinction. Stack recommendation is our inference from the current code and these properties, not a benchmark comparison between frameworks.

The visual candidate report is `C:/Users/Windows/AppData/Local/Temp/architecture-review-20261019-portfolio.html`. Start with candidate 1, then candidate 2, while adding their regression cases. The explicitly invoked architecture skill asks the owner to choose a candidate after the report, before detailed interface design. Application implementation and release remain unfinished; the assessment itself is complete.

For later Vercel operations, installing the currently absent CLI with `npm i -g vercel` is strongly recommended for environment retrieval, deployment inspection and logs. It is not required for this local review; no installation, account changes or deployment were performed.

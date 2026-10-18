# Portfolio rebuild issue register

Scope: defects found in the retained Next app and the active Astro replacement. Fixed means verified locally; no row claims deployment or live validation. Source and recovery files remain available.

| ID | Finding | Resolution / evidence | Status |
|---|---|---|---|
| UI-001 | Duplicate layout markup prevented compiling the original app | Repaired duplicate JSX; active Astro production build succeeds | Fixed locally |
| UI-002 | Navigation depended on JavaScript readiness and hover-only labels | Text links, native mobile details menu, no-JS browser journey | Fixed locally |
| UI-003 | Phone project layout used a wide horizontal timing table | Responsive cards and case-study pages; 320–1440px overflow checks | Fixed locally |
| UI-004 | Viewport settings limited zoom | Normal device-width viewport without maximum scale | Fixed locally |
| UI-005 | Some primary sections lacked visible headings | Semantic page/section headings and keyboard skip link; automated accessibility checks | Fixed locally |
| UI-006 | Artificial preloader delayed content | Removed in the rebuild. Owner reversed this on 2026-10-18: the boot terminal is restored at about 3 s, once per tab, skipped by any key or click, never with reduced motion or without JS, and an inline-gate deadline means it can never leave the page hidden. Covered by browser tests | Owner decision: restored |
| UI-007 | Decorative sine waves and REC label resembled measured evidence | Labelled architecture illustrations; metrics require method/date/evidence | Fixed locally |
| UI-008 | Projects lacked stable detail pages and useful source actions | Three case-study routes; verified palm-detection repository link; optional repo/live/video fields | Fixed locally |
| UI-009 | Certification strings mixed credentials with general activities | Structured credential collection with publication validation; incomplete NVIDIA record remains draft | Schema fixed; real credential details needed |
| UI-010 | Theme switching could strand a late scene or canvas | Abortable preparation, deadline, deterministic cleanup; delayed import, twenty switches and control tests | Fixed locally |
| UI-011 | Schema allowed PDF files as displayed project images | Separate image restriction; failing regression then passing test | Fixed locally |
| UI-012 | Git content fields needed page rendering | Case studies render optional media, measured evidence and video links; authoring documentation | Implemented |
| TOOL-001 | Local Node and framework/tooling were incompatible | Project-local Node 24; pinned Astro and explicit testing peers; build/type/lint/unit checks | Fixed locally |
| TOOL-002 | CI could not demonstrate usable UI | Production link/bundle checks and Chromium/Firefox/WebKit interaction/accessibility jobs | Configured; local evidence in checkpoint |
| TEST-001 | Scroll assertion measured before the test focused the sticky header | Isolated focus-induced scroll; moved focus before scroll baseline | Fixed test |
| TEST-002 | WebKit axe runs read professional text colour on F1 backgrounds after a reduced-motion switch | Product defect, not test timing: the reduced-motion reset set `transition-duration: 0.01ms` on every element, and `transition-property` defaults to `all`, so WebKit restarted the inherited colour transition at each tree level (deep text stale about 1 s). Reset now uses `transition: none`; both WebKit axe tests pass | Fixed locally |
| UI-013 | Home links four skills with no published project (PyTorch, FastAPI, Redis Caching, Docker); the projects filter ignored them and showed every project | Owner decision: keep all links and show the honest empty state. The projects page passes the home-linked skills; the filter adds an option only for a linked skill, so hand-edited `?skill=` values are ignored rather than shown. Passes in Chromium, Firefox and WebKit | Fixed locally |
| TEST-003 | Local browser tests silently reused any server on 4321, including `astro dev`, so they could pass or fail against dev-only behaviour instead of the build | Playwright serves the build on its own port 4400 (`PORT` in `scripts/serve-built.mjs`); `npm run start` keeps 4321 | Fixed locally |
| RELEASE-001 | No confirmed hosting target, branch protection or release gate | Concrete setup and rollback steps in deployment.md | External setup pending |

No real phone/GPU performance survey, screen-reader audit, live deployment check or confirmed production rollback has been performed. Automated accessibility checks are one layer of verification.

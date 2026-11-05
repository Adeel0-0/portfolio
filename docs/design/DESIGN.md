# Two-mode portfolio: design record

Date: 2026-11-05. Source brief: owner's `PORTFOLIO-REDESIGN-PROMPT.md`, with the
owner's adjustments of the same day: CI/CD-friendly, pictures and YouTube videos
added later by the owner, and F1 entered through the existing single toggle with
its lights-out transition. Builds on `2026-10-19-editorial-engineering.md`.

## Audience and first screen

Hiring managers, engineers and collaborators deciding in seconds whether to read
further. The first screen must answer: who (name, role), what (AI systems and
software), and where the strongest work is.

- **Minimal (default):** name/role line → headline with one editorial phrase →
  one-paragraph introduction → *Explore my work* / *View resume* → portrait.
  Selected work follows as one shared project-card contract.
- **F1:** a "pit wall": car-number and role strip → uppercase headline and
  actions → timing tower (P1–P3) + fictional circuit map + project preview.
  Selecting a project anywhere (row, map sector, 3D marker) updates all three.

```
Minimal (desktop)                     F1 (desktop)
┌──────────────────────────────┐      ┌──────────────────────────────────────┐
│ name / role                  │      │ [22] NAME / ROLE                     │
│ Engineering                  │      │ ENGINEERING USEFUL INTELLIGENCE. [CTA]│
│ useful intelligence.  [photo]│      ├──────────┬─────────────┬─────────────┤
│ intro · CTA · CTA            │      │ P1 SEFGH │  circuit    │ preview:    │
├──────────────────────────────┤      │ P2 Palm  │  S1 S2 S3   │ role, date, │
│ Selected work (cards)        │      │ P3 Drone │  [3D track] │ skills,links│
└──────────────────────────────┘      └──────────┴─────────────┴─────────────┘
```

Mobile: Minimal stacks hero → portrait → cards; F1 stacks headline → map →
timing tower → preview. Layouts respond to their container width
(`@container`), so browser zoom and narrow windows reflow the same way.

## Tokens

| Role | Minimal | F1 |
|---|---|---|
| Background / surface | `#F5F4F0` / `#FFFFFF` | carbon `#0B0C0F` under an animated red gradient; islands `rgba(12,13,17,.66)` + blur |
| Text / muted | `#1D262C` / `#5A6369` | `#F4F5F7` / `#A3A8B3` |
| Rule | `#DCDDD8` (decorative) | `#2A2D35`, island edge `rgba(255,255,255,.09)` |
| Accent (text, lines) | `#175CD3` | `#FF3B4E` (5.58:1 on carbon) |
| Action (buttons) | `#175CD3`, white text | `#D10A26`, white text (5.55:1) |
| Radius (frame / control) | 16 / 8 px | islands 24 px, frames 10 px, controls 4 px |

All text pairs pass WCAG AA (lowest measured: 4.97:1, accent on the tinted
band). Type: Minimal uses Instrument Sans (variable 400–700, 30 KB) with a
Newsreader italic display cut (12.9 KB) for one phrase. F1 uses **Saira**
(OFL, variable weight 400–800 and width 75–125 %, 82 KB, downloaded only in F1),
set wide and italic for display, with `tabular-nums` for positions and dates.
The official Formula1 typeface is proprietary to Formula 1 and not licensed for
third-party sites, so Saira is the owner-approved substitute (2026-11-05).

**F1 page treatment (owner request 2026-11-05):** the whole page sits on a
racing-red-on-carbon gradient. On hardware WebGL it is ShaderGradient
(`@shadergradient/react`, MIT), an animated Three.js mesh gradient mounted as a
lazily loaded React island (`src/islands/F1Gradient.tsx`, loader
`src/scripts/f1-backdrop.ts`); "3d" lighting avoids its remote HDR maps. A CSS
gradient is the static equivalent for reduced motion, missing WebGL and
software renderers (SwiftShader, llvmpipe, which would take seconds per frame).
The header and every section float on it as translucent "islands". F1 shows
less prose: the intro paragraph, capability descriptions and helper hints are
hidden visually (hints stay available to screen readers). Smallest
text 13 px (`--text-xs`), body 17 px, prose measure `60ch` (about 70
characters). Interactive targets at least 32 px tall (`--target`). Fonts are
self-hosted from `public/fonts` (OFL, Google Fonts sources), so no third-party
request is made on arrival.

## Mode switch

- One button in the header on every route, `aria-pressed` plus a filled dot.
- **Precedence:** `?mode=f1|minimal` in the URL → remembered choice
  (`localStorage["portfolio-theme"]`) → Minimal. A URL choice is also
  remembered; after a switch, an existing `?mode=` is rewritten to match.
  Canonical URLs never include it.
- Decided in an inline script before first paint; content does not wait for it.
- Without JavaScript the toggle is hidden and the page is Minimal.
- Because the compositions differ, a switch keeps the visitor on the same
  section (`data-section` keys) instead of the same pixel offset. Focus stays on
  the toggle. The existing transition, interruption, Escape/skip and
  reduced-motion behaviour are unchanged.

## Interactions

| Interaction | Purpose | Fallback |
|---|---|---|
| Circuit project navigator (F1) | Browse projects as sectors of a fictional circuit; mouse hover previews, click/touch/keyboard pins (Arrow keys, Home/End in the tower). | Tower rows are buttons; preview links are ordinary links; status announced politely. |
| 3D track (F1, on request) | Original procedural Three.js track from the same geometry as the SVG; drag sideways to turn, click a marker to select, *Reset view*, Escape to close. | Not loaded unless asked; WebGL missing, import failure or context loss leave the SVG map with a message. Disposed on close, on leaving F1, and on `pagehide`. Renders on demand only. |
| Work filters (`/projects/`) | Existing URL-linked skill filter and empty state. | Unchanged. |
| Case-study contents | Jump through real Markdown headings. Minimal: quiet list; F1: numbered sector rail (sticky on desktop). | Plain anchor links. |
| Project media gallery | Screenshots and YouTube videos per project. Videos load the privacy-enhanced player only when *Play video* is pressed. | Without JavaScript the video is a link to YouTube. |
| Resume and contact shortcuts | Resume in both navigations; *Copy email address* beside the mailto link, result announced. | Copy control hidden without clipboard access. |

## F1 easter eggs (owner request 2026-11-05)

Loaded only while F1 mode is active (`src/scripts/racing-loader.ts` →
`racing-eggs.ts`, logic in `src/lib/racing.ts`); leaving F1 removes every
listener, timer and element they added. All keyboard-operable; results are
announced through one polite status toast.

| Egg | How to find it |
|---|---|
| Lights-out reaction test | Paddock island on the home page; catches jump starts, remembers your best time locally. |
| Pit-stop challenge | Paddock island: *Box, box*, then change four tyres (focus moves tyre to tyre). |
| Team radio | Click or tap the car number "22". Original, fictional radio lines. |
| DRS | Type `drs` anywhere (not in a form field): the header's "rear wing" opens. |
| Scroll speedometer | Bottom-left speed and gear while scrolling; fades out at rest; hidden with reduced motion. |
| Chequered flag | Waves across the top of the footer at the "finish line" (static with reduced motion). |

## Feature inventory and parity

| Feature / route | Source | Minimal | F1 | Verified by |
|---|---|---|---|---|
| Home `/` | `src/pages/index.astro` | Hero + cards | Pit wall | `redesign.spec.ts`, `portfolio.spec.ts` |
| Projects `/projects/` + filter | `projects/index.astro`, `scripts/filters.ts` | Grid | Same content, F1 styling | `portfolio.spec.ts` |
| Case studies `/projects/<slug>/` | `projects/[slug].astro` | Contents list | Sector rail, timing facts | `redesign.spec.ts` |
| About, Credentials, 404 | `pages/*.astro` | Unchanged content | F1 styling | `portfolio.spec.ts`, `presentation.spec.ts` |
| Resume `/resume.pdf` | `public/` | Header, hero, footer | Header, pit wall, footer | build link check |
| Contact (email, GitHub, LinkedIn) | `data/profile.ts` | Footer | Footer | `portfolio.spec.ts` |
| `/api/contributions` | `src/pages/api/` | Unchanged | Unchanged | `contributions-api.test.ts` |
| Boot terminal | `scripts/boot-terminal.ts` | Unchanged | Unchanged | `boot-terminal.spec.ts` |

No routes, slugs or links changed; no redirects were needed.

## Performance budget (local build, 2026-11-05)

- Home arrival JavaScript: 7.9 KB gzip (was 4.6 KB) for the circuit navigator,
  copy control and backdrop loader. Budget 75 KB, enforced by
  `scripts/verify-build.mjs`.
- Optional F1 graphics (transition, circuit track, gradient backdrop, Three.js
  185 KB, React DOM 57 KB, gradient renderer 100 KB): 312.5 KB gzip, fetched only
  in F1 or on toggle intent. The verifier fails the build if any of it, or
  React, is on the arrival path; `redesign.spec.ts` confirms no 3D, React or
  third-party requests across four Minimal routes.

## Known gaps

- Projects have architecture illustrations only; real screenshots and videos
  are for the owner to add (see `docs/content-authoring.md`).
- 21st.dev could not be reached from this session (blocked by the cloud
  environment's network policy), so its component code was not inspected or
  installed. ShaderGradient, the npm library behind that style of gradient
  background, was used instead. Allow `21st.dev` in the environment's network
  settings to adopt specific 21st.dev components.
- Reference sites were studied in the 2026-10-19 research record plus a 2026-11-05
  web search for 3D and F1-inspired developer portfolios (search results only;
  the pages were not opened). The F1 Live Timing idea (track map + sectors +
  compact list) informed the pit wall from its description in the brief.
- Firefox and WebKit journeys run in CI, not in this container.

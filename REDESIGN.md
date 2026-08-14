# Portfolio Redesign — "Telemetry"

> Full design + build specification. Read this, mark it up, then tell me to proceed.
> Nothing in the codebase has been changed yet.

---

## 1. The concept

An ML engineer's portfolio wearing **F1 instrumentation**.

The two domains share a vocabulary, and that's the whole idea:

| F1 | ML |
|---|---|
| lap time | eval metric |
| sector split | per-task score |
| purple sector | new personal best / SOTA |
| telemetry trace | loss curve |
| timing tower | leaderboard |
| tyre compound | how hard a tool gets used |

So F1 supplies the **language of the interface** — timing towers, shift lights, sector splits, team radio — without a single team logo, crest, or anything lifted from formula1.com. Someone who watches F1 gets an extra layer. Someone who doesn't just sees a precise, instrument-grade dark UI.

**The one-line pitch:** the page reads as a live timing screen for one driver.

---

## 2. What exists today (audited, not assumed)

| | Status |
|---|---|
| Next.js 14.2.5, App Router, React 18.3.1, TS strict | ✅ keep |
| Tailwind **v3.4.19** — `tailwind.config.ts`, classic postcss | ⚠️ pasted components are written for v4, need translating |
| shadcn **not installed**; substrate is (`cn()` in `lib/utils.ts`, CVA, HSL tokens, `tailwindcss-animate`) | ⚠️ we won't install the CLI — see §9.3 |
| Space Grotesk loaded as `--font-space-grotesk` | ✅ keep |
| `fontFamily.mono` = `"JetBrains Mono"` but **the font is never loaded** | 🐛 every mono glyph on the site is OS fallback |
| **Zero animation libraries** — three.js was deliberately deleted (~210 KB) | ⚠️ sets our weight budget |
| `data/` — profile, stats, 3 projects, 7 skill groups, education, certs, site copy | ✅ this is the content contract |
| `public/profile.jpg` — 768×1024, **referenced nowhere** | ✅ we'll use it |
| Preloader — terminal boot sequence, `data-preloader` handoff, z-50 | 🔒 **frozen, per your decision** |
| Palette | ⚠️ neutral greyscale placeholder, and there are **three** hardcoded copies |

**Uncommitted right now:** `app/globals.css`, `app/layout.tsx`, `components/ui/spatial-neural-preloader.tsx` (the launch choreography is newer than HEAD). Commit or stash before we start, or Phase 0's sweeping edits become impossible to review.

---

## 3. Design system

### 3.1 Palette — Red Bull navy

Base is deep navy. **One** hot accent. The F1 timing colours are kept scarce so they still mean something.

```
RAW                              SEMANTIC
--rb-bg      226 55%  6%  #070B18   page background
--rb-surface 224 51% 10%  #0D1428   cards, dock, panels
--rb-raised  224 46% 16%  #16203C   hover surfaces, chips
--rb-border  224 42% 20%  #1E2A4A   hairlines
--rb-fg      222 39% 94%  #E8ECF5   primary text
--rb-dim     222 20% 61%  #8894B0   secondary text
--rb-red     352 87% 47%  #E1112C   BRAND
--rb-yellow   47 100% 50% #FFC800   SIGNAL
--rb-purple  276 88% 63%  #B14BF4   BEST
```

**The colour discipline — this is what keeps it from looking like a Christmas tree:**

| Colour | Allowed use | Never |
|---|---|---|
| **Red** `--brand` | Interactive only: active nav pip, primary CTA, links, live indicators, soft tyre ring | Decoration, headings, borders |
| **Yellow** `--signal` | Measurement only: metric numbers, hover glow, sector sweep lines, medium tyre ring | Buttons, body text |
| **Purple** `--best` | **Exactly one thing** — a number that is a personal best | Anything else, ever |
| **Green** | Dropped site-wide. Two carve-outs: the preloader terminal (its own black world) and the rev-strip LEDs (a shift light is literally green) | Any page surface |

Written as HSL triplets so hover/active states derive by shifting `L` alone, and so Tailwind's `/opacity` modifiers work. Hex kept in comments so drift is checkable.

**Two naming traps that will silently wreck the site** (they're the classic shadcn token inversions):

> `--muted` is a **surface**. `--muted-foreground` is the **text**. Dim grey `#8894B0` goes on `--muted-foreground`. Put it on `--muted` and every `bg-muted` becomes a light grey block on navy.

> shadcn's `--accent` is a subtle **hover surface** (`bg-accent` on a hovered menu item), *not* a brand colour. Map red onto it and every hover screams. `--accent` stays `var(--rb-raised)`; brand colours get new names: `--brand`, `--signal`, `--best`.

**Three files hold hardcoded copies of the palette and must be edited in parallel** — none of them can read CSS variables:
- `app/globals.css` — the source of truth
- `app/opengraph-image.tsx` — `#0a0a0a`, `#171717`, `#fafafa`, `#a1a1a1`
- `app/icon.svg` — `#0f1729`, `#00eeff` ← still the *old cyan theme*, nobody noticed

### 3.2 Typography

| Role | Font | Usage |
|---|---|---|
| Everything human | **Space Grotesk** (loaded) | headings, prose, labels, buttons |
| Everything measured | **JetBrains Mono** (to add) | timing numbers, metrics, deltas, stack chips, terminal, sector splits, eyebrows |

The mono/sans split *is* the design. Anything that would appear on a timing screen is mono; anything a human wrote is sans. Load JetBrains Mono via `next/font/google` **without a `weight` array** so we get the variable font — one ~35 KB woff2 instead of N static files — and fix `fontFamily.mono` to point at the variable.

Scale: tight tracking on display sizes (`-0.03em`), wide tracking on mono eyebrows (`0.3em`, uppercase) — the existing placeholder page already uses that eyebrow treatment and it's right.

### 3.3 Motion vocabulary

Four moves, used consistently, nothing else:

1. **Slam** — media enters at speed, overshoots, springs back, docks. Projects only.
2. **Sweep** — a 1px line wipes across on section entry, leaving a sector split time.
3. **Arm** — LEDs/pips light in sequence. Rev strip, nav notch.
4. **Stream** — text arrives token-by-token. Hero tagline, terminal, radio bubble.

### 3.4 Spacing / layout

Container is already configured: centred, `1.5rem` padding, `2xl: 1200px`. Keep it. Sections are `min-h-screen` with generous vertical rhythm, except Contact which needs bottom padding equal to dock height + safe-area inset.

---

## 4. Site structure

Single page. Five sections. Section IDs are plain; the *eyebrow labels* carry the F1 voice.

| # | id | Eyebrow | Nav icon | Mascot radio line |
|---|---|---|---|---|
| 1 | `hero` | `// GRID` | `Flag` | "Radio check, radio check." |
| 2 | `about` | `// DRIVER PROFILE` | `User` | "Here's who's in the car." |
| 3 | `projects` | `// RACE HISTORY` | `Trophy` | "Box, box — three cars incoming." |
| 4 | `garage` | `// GARAGE` | `Wrench` | "Full send. Tyres are good." |
| 5 | `contact` | `// TEAM RADIO` | `Radio` | "That's P1, mate. Get in there." |

All five live in `lib/sections.ts` as one ordered array — the single source of truth consumed by the nav dock, the IntersectionObserver, the track map, and the mascot. Adding a section is a one-line change.

> `data/content.ts` currently has a **4-link nav** (Projects, Skills, Education, Contact) from the old design. It gets restructured to these five.

---

### 4.1 Hero — `// GRID`

```
┌──────────────────────────────────────────────────────────────┐
│ ●●●●● ●●●●● ●●●●●                        ← rev strip (fixed) │
│                                                              │
│  ┌─────────────────┐                                         │
│  │  P1             │   SYED MOHAMMAD ADEEL                   │
│  │                 │   ══════════════════════                │
│  │  ADEEL      23  │   AI/ML & SOFTWARE ENGINEER             │
│  │  AI + ML        │                                         │
│  │  L23            │   I build and ship AI-powered backend   │
│  └─────────────────┘   systems — embeddings, vector search,  │
│     ↑ pit board        RAG pipelines, and production APIs▮   │
│                        ↑ token-stream reveal                 │
│                                                              │
│   [ VIEW RACE HISTORY ]   [ COPY EMAIL ]                     │
│                                                              │
│  ─────────────────────────────────────────────────────────   │
│  PYTHON · FASTAPI · PYTORCH · REDIS · AWS · DOCKER · NEXT    │
│  ↑ sponsor bar                                               │
└──────────────────────────────────────────────────────────────┘
```

**Pit board** — the physical board held over the pit wall. Hand-lettered feel, high contrast, mono. Carries position (`P1`), your name, discipline, race number, lap count. It's the identity block and it doubles as the "logo".

**Token-stream tagline** — `profile.tagline` arrives token-by-token (not character-by-character), each token flashing faintly as it lands. Reads exactly like watching an LLM stream.

> **Critical:** the tagline must be **real SSR'd text** with the animation layered on top — never tokens appended to React state. Otherwise reduced-motion users, no-JS visitors, and crawlers all get an empty hero. Same rule everywhere: never branch JSX *shape* on motion preferences.

**Sponsor bar** — your stack as livery sponsor decals along the base. Your tools *are* your sponsors. Wordmarks + lucide icons; no external logo assets.

**Race number** — appears here, in the favicon, the nav corner, and the footer. *Needs your pick — see §10.*

---

### 4.2 About — `// DRIVER PROFILE`

Two columns. Left: `profile.summary`, location, `content.about.availability` ("Open to opportunities") as a live green-dot chip — except green is dropped, so it becomes a **yellow signal dot**, which reads as "in the garage, ready" anyway.

Right: `public/profile.jpg` masked by the **halo frame** — the cockpit halo silhouette. Strong, modern, unmistakably F1, zero branding. The photo is 3:4 portrait, 88 KB, currently unused; served through `next/image` with explicit `sizes` so it doesn't ship 88 KB into a 256px slot.

Underneath: the three stat blocks.

```
   24%              86%              8.14
   ────             ────             ────
   API error/       mAP@0.5          CGPA
   fallback ↓       YOLO models      VIT-AP 2026
   (white)          (PURPLE ← best)  (white)
```

> `stats` has three entries and **no "best" marker**. If all three go purple the signal dies. We add `best?: boolean` and mark **exactly one** — 86% mAP@0.5 is the defensible choice (it's a hard, externally-comparable benchmark number).

---

### 4.3 Projects — `// RACE HISTORY`

Two layers: the tower, then the detail rows.

**Layer 1 — the timing tower.** Your "summarize it all in lines" idea, literally:

```
POS   PROJECT                      GAP (STACK)                    DELTA
──────────────────────────────────────────────────────────────────────
 1    SEFGH                        Python · FastAPI · Embeddings  −24%
      AI-Powered GitHub Search     Vector Search · Redis · CI

 2    PALM-TREE DETECTION          YOLOv5/v7 · OpenCV · Flask     86%
      Scalable CV Service          Celery · PostgreSQL · S3       ▲ purple

 3    AUTONOMOUS TINY DRONE        Embedded C/C++ · ESP32         —
      Flight Controller            Python · UART · PID            ▲ no time set
```

> `projects[2]` (Tiny Drone) **has no metric**. Its delta column shows `—`, exactly like a driver with no time set. That's a genuine empty state, not a bug — and it's honest.

**Layer 2 — the detail rows.** One per project, alternating sides, with the slam.

```
      ┌────────────────────────────┐
 01   │ ▓ SEFGH ────────── ● REC ▓ │  ← SLAMS IN from the RIGHT
      │                            │
 STACK│  query → [embed] → [rerank]│
 ···  │              ↓             │
 ABOUT│           [LLM] → answer   │
 ···  │  ╱╲╱─╲╱──╲───── latency    │
 HOW  │  −24%  ████████░░          │
 IT   └────────────────────────────┘
 WORKS      ↑ telemetry panel
```

Text side carries exactly the three line-groups you asked for:

| Label | Source |
|---|---|
| `STACK` | `project.stack` as tyre-ringed chips |
| `ABOUT` | `project.description[0]` |
| `HOW IT WORKS` | `project.description[1]` |

The existing data maps onto this cleanly — `description[0]` is already the what, `description[1]` is already the how. No rewriting needed.

**The slam, mechanically.** Media panel enters off-screen, overshoots, springs back, docks beside the text and stays. Alternating: project 01 from the right, 02 from the left, 03 from the right.

```ts
progress = useScroll({ target: rowRef, offset: ["start 0.85", "start 0.35"] }).scrollYProgress
eased    = useSpring(progress, { stiffness: 140, damping: 14, mass: 0.9 })
x        = useTransform(eased, [0, 1], [dir * 120, 0])   // dir = index % 2 ? -1 : 1
```

The **overshoot is the spring's own underdamping** — critical damping for `k=140, m=0.9` is ≈22, so `damping: 14` rings past the target and settles. That's the entire velocity/overshoot/settle requirement in three lines, no keyframes, no state machine.

**Latch it:** once `progress ≥ 0.98` fires once, swap to a static `x: 0`. Without this, scrolling back up re-slams the panel and it reads as a glitch rather than an effect.

**Media is a swappable slot.** `project-media.tsx` switches on `media.kind` and defaults to the generated telemetry panel:

```ts
type ProjectMedia =
  | { kind: "image"; src: string; alt: string }
  | { kind: "video"; src: string; poster?: string }
  | { kind: "telemetry" };          // default — code-drawn, no assets
```

So the day you drop `public/projects/sefgh.mp4` in and add one line to `data/projects.ts`, it just appears. **Zero refactor.**

**Telemetry panel contents** (code-drawn, derived from `Project` — no images):
- architecture flow diagram built from the stack
- the metric as a filled gauge (or `—` when absent)
- an animated trace line (`stroke-dashoffset` sweep) that doubles as a loss curve
- an `● REC` onboard-camera header

**Attention glow on hover** — two independent tiers:
- **Tier 1 (ships alone):** a radial dim light behind the text, tracked to cursor via `--mx`/`--my` CSS custom properties. Cheap, no layout repaint. Yellow at very low alpha — reads like a garage work light.
- **Tier 2:** hovering a project dims its siblings and draws faint SVG connector lines from the title to its own stack chips.

> ⚠️ The original "connect the project to the Skills section" idea is **undrawable** — Projects and Garage are separate full-height sections and are never co-visible, so an SVG line between them cannot exist. Retargeted to within-row connectors, plus a `SkillFocusContext` that marks the corresponding chips in the Garage section so they're already highlighted when you scroll there.

---

### 4.4 Garage — `// GARAGE` (Skills + Education)

**Tyre-compound chips.** Every skill gets a compound ring encoding how hard you actually run it:

```
  ● SOFT     red     — daily driver, current, deep
  ● MEDIUM   yellow  — regular use, solid
  ● HARD     white   — foundational, occasional
```

With a legend, because it's information, not decoration. Requires grading every entry in `data/skills.ts` — the type changes from `items: string[]` to `items: SkillItem[]`.

> This type change **must land in Phase 0**. Today `skills.items` has zero consumers, so it's a free edit. Once the Garage section exists it becomes a component refactor too.

Seven groups, as they already exist: AI/ML · Languages · Backend & APIs · Frontend · Databases · Cloud & DevOps · Testing.

**Education panel**, styled as a setup sheet: VIT-AP, B.Tech CSE, 2022—2026, CGPA 8.14/10, plus the three certifications (NVIDIA DLI, open-source, hackathons).

---

### 4.5 Contact — `// TEAM RADIO`

Heading from `content.contact.heading` — "Let's build something intelligent."

**Team radio treatment** — the block is styled as a radio transmission: waveform bars, a crackle-in animation on the text, transmission-style framing.

> ⚠️ **A working message form needs a backend or mail service, which this project doesn't have.** Without one, "send" is a styled `mailto:` or a copy-to-clipboard — honest, and it still works. A real form is a separate decision (Resend/Formspree/a route handler); say the word and I'll scope it.

**Contact cards** — the component you pasted. Copy-email button, GitHub icon with a year of contributions, LinkedIn, X, each with a card that cross-fades directionally while the container morphs between sizes.

Fixes needed on the pasted code:
- `ring` → `ring-1` (v3's `ringWidth.DEFAULT` is `3px`, v4's is `1px` — bare `ring` renders 3× too thick)
- `duration-400` isn't in v3's scale → add `transitionDuration: { 400: "400ms" }` to config so it stays a 1:1 paste
- strip `dark:` prefixes — `layout.tsx:38` hardcodes `className="dark"`, so they're permanently on and just noise
- `size-6` is **fine** — `size-*` shipped in Tailwind 3.4.0, verified present in the installed 3.4.19

**GitHub contributions** — the component fetches `github-contributions-api.jogruber.de` client-side. That puts a free community service, CORS, and an uncached round-trip on your critical path. We proxy it through `app/api/contributions/route.ts` with `revalidate: 3600`, render a fixed-dimension skeleton so CLS is zero, and **hide the graph entirely on failure** rather than showing an error on a portfolio. Username is `Adeel0-0`, added explicitly to `data/profile.ts` rather than string-slicing the URL.

**Race control toasts** — copy your email and you get `RACE CONTROL: MESSAGE RECEIVED` in the FIA notification style. It's a real toast system we'd need anyway; this just gives it a voice.

---

### 4.6 Persistent chrome

**Rev strip** (fixed, top edge) — F1 steering-wheel shift lights. You chose **authentic**: green → amber → red, flashing blue at the bottom of the page. Green lives here and nowhere else on the site; isolated as `--led-1..4` so that carve-out is one line, not a refactor.

**Nav dock** (fixed, bottom centre) — the `AnimatedTabBar` you pasted: an SVG clip-path notch that slides between icons. Five icons + hover tooltip labels above each.

> ⚠️ The snippet references `.menu`, `.menu__item`, `.menu__border`, `.icon`, `.svg-container` and **defines none of them**. You pasted only `@keyframes strok`. Roughly 60 lines of the component's actual styling has to be authored from scratch — co-located as `components/nav/animated-tab-bar.css`.

**Track map** (fixed, corner) — a circuit outline in SVG with a dot running the lap as you scroll. Scroll indicator, site map, and signature graphic in one object. *Needs your circuit — see §10.*

**Mascot** (fixed, bottom-right) — you, as your own race engineer. Idle bob, blink, cursor-tracking eyes, talk frames, and a team-radio bubble whose line changes per section (table in §4). Dismissible, remembers dismissal, hidden below `md` because it would collide with the dock.

**Terminal easter egg** — press `` ` `` anywhere and the boot terminal drops back down as a command palette: `whoami`, `ls projects`, `cat resume`, `help`, `clear` — all pure functions over `@/data`.

---

## 5. Architecture

### 5.1 Layout structure — the load-bearing decision

`app/globals.css:107-128` transforms `#site-shell` during the preloader handoff. At rest it's safe: the transform is deliberately *dropped* rather than parked at `scale(1)`, and the file documents exactly why.

**But for the ~1.1 s the `data-preloader` attribute exists, `#site-shell` IS a containing block** — and it's a full-document-height div. A `fixed bottom-6` dock inside it would pin to the *document* bottom, thousands of px below the fold, then snap into place at t=1000ms. And the overlay is already transparent from ~500ms, so **you'd see the last half-second of that snap on every single load.**

So all fixed chrome mounts as a **sibling** of `#site-shell`, never inside it:

```
<body>
  <noscript>…</noscript>
  <SpatialNeuralPreloader />          ← frozen, z-50
  <SiteProviders>                     ← client boundary; children stay server-rendered
    <EmbeddingField />                ← z-0
    <RevStrip /> <TrackMap />         ← z-45
    <NavDock />                       ← z-40
    <Mascot />                        ← z-35
    <RaceControlToasts />             ← z-55
    <TerminalOverlay />               ← z-60
    <div id="site-shell">{children}</div>
  </SiteProviders>
</body>
```

`SiteProviders` receives `{children}` as a prop, so no `"use client"` leaks into `page.tsx` and the whole section tree stays server-rendered. The z-scale lives in `tailwind.config.ts` so it's auditable in one place; the preloader's hardcoded `z-50` is the fixed point everything is arranged around.

**Mount gating** — `lib/hooks/use-preloader-done.ts` reads `data-preloader` on `<html>`, watches for its removal with a `MutationObserver`, and returns `true` immediately when it's absent (repeat visits, reduced motion, no-JS — every path the preloader already handles at `spatial-neural-preloader.tsx:84-86`). **This touches the preloader zero times.**

It also fixes a collision for free: the preloader binds a global `keydown` dismiss (`spatial-neural-preloader.tsx:147-155`), so an ungated backtick would open the terminal *and* skip the preloader simultaneously.

### 5.2 Scroll orchestration — hybrid, two layers

Neither one global provider nor N independent `useScroll` calls is correct alone.

**Layer A — `ScrollProvider`, one instance**, owns three things:

1. **One document-level `useScroll()`** → `scrollYProgress` exposed **as a MotionValue, never React state**. Scrolling causes *zero* React re-renders. Consumed by the rev strip and track map.
2. **One IntersectionObserver** over the five sections (`rootMargin: "-45% 0px -45% 0px"`, `threshold: 0`) → active section is whichever box crosses the viewport mid-band. ~5 re-renders per full traversal, not per frame.
3. **`scrollTo(id)`** for the dock, setting a ~700 ms `lockUntil` ref so the active pip doesn't flicker through intermediate sections during the smooth scroll.

**Two contexts, not one** — `ScrollMotionContext` (memoized once, identity never changes) and `ActiveSectionContext`. Sharing one would re-render the rev strip and the canvas on every section change for no reason.

**Three IntersectionObserver edge cases that must be handled explicitly** (this pattern fails all three by default):
- **Last section shorter than the viewport never activates.** Contact would never light up. Fix: force `activeId = last` when `scrollYProgress > 0.995`, via `useMotionValueEvent` so it piggybacks Framer's existing frameloop instead of adding a listener.
- **No callback fired on mount** → default to `SECTIONS[0]`.
- **Deep link with a hash** → set it on mount and lock briefly.

IntersectionObserver, not scroll math: scroll math means re-measuring five rects per frame and re-deriving thresholds on every resize, font swap, and image load. IO does it off the main thread and self-corrects.

**Layer B — per-project `useScroll({ target })`.** Not a listener leak: Framer registers all instances with one shared scroll-info manager — a single passive listener, measurements batched in the frameloop's read phase, no layout thrash. Re-deriving this from the global progress would mean re-implementing element measurement, resize handling, and offset resolution that `useScroll({target})` already does correctly.

**Listener budget — enforced as a rule:**

```
1  shared Framer scroll listener
1  IntersectionObserver
1  passive pointermove (canvas)
1  pointermove per HOVERED row  ← bound on pointerenter, removed on leave.
                                  Never one per row permanently.
1  keydown (terminal)
1  visibilitychange
2  ResizeObserver (canvas, dock)
```

**No component may attach a raw `window.addEventListener("scroll", …)`.**

**Lenis: skipped.** `scroll-behavior: smooth` already exists (`globals.css:42`) with a reduced-motion reset (`:142`). Lenis would need both removed and anchor nav re-implemented, adds a second permanent rAF loop to a codebase that deleted three.js for weight, ignores `prefers-reduced-motion`, and needs `stop()`/`start()` wiring for the terminal overlay. **The slam's smoothness comes from `useSpring`, not from smooth scroll** — a spring fed a jumpy wheel input already outputs a smooth curve.

*Revisit only if* Phase 2 testing on a physical Windows mouse wheel (~100px discrete notches) shows the slam stepping despite the spring.

### 5.3 Motion library

**`framer-motion@^11.18.2` — not `motion@^12`.**

On Next 14.2.5 + webpack + React 18, `motion@12` routes through the `motion/react` subpath, which is the combination most likely to throw `Package path ./react is not exported`. `framer-motion@11` is the last line built against exactly this stack. The APIs are identical.

**`lib/motion.ts` is a re-export seam** — every component imports `m`, `useScroll`, `useSpring`, `useTransform`, `AnimatePresence`, and the shared spring presets from `@/lib/motion`, never from the package directly. Moving to `motion@12` later (with React 19 / Next 15) becomes a one-file change.

### 5.4 Reduced motion — three layers, none sufficient alone

1. **`<MotionConfig reducedMotion="user">`** — covers `animate`, `whileHover`, `variants` automatically.
2. **`useReducedMotion()` for MotionValue work.** The nuance almost everyone misses: **`MotionConfig` does NOT affect `useTransform`/`useSpring` bound to `style`.** Those are value bindings, not animations — Framer has no hook to suppress them, so a scroll-linked slam still slams at full amplitude under `reducedMotion="user"`. The branch goes in exactly one place, `lib/hooks/use-scroll-slam.ts`, which returns literal `0`/`1` instead of MotionValues. Then no component can forget.
3. **The existing CSS kill switch** (`globals.css:132-144`) covers everything non-Framer: dock notch, mascot bob, LED transitions, hover fades.

| Feature | Reduced-motion behaviour |
|---|---|
| Rev strip | **still fills** — it's an indicator, information not decoration. Skip the spring and the flash. |
| Slam | media renders docked; opacity fade only |
| Token stream | full tagline immediately |
| Embedding field | one static frame, **and no pointermove listener bound at all** |
| Mascot | static pose; radio line still swaps (that's content, not motion) |
| Dock notch | jumps instead of sliding (handled by the CSS switch) |

**Hydration trap:** `useReducedMotion()` returns `null` on the server and on first client render, then resolves. Anything that conditionally renders a *different tree* on it produces a hydration mismatch. **Always render the settled markup server-side** and let Framer apply from-values via `initial`. Never branch JSX shape.

### 5.5 Mascot — swappable sprite interface

You haven't picked a renderer yet, and that must not block or cause rework. The split: **the engine owns all behaviour; the sprite owns only pixels.**

```ts
// components/mascot/mascot-sprite.ts — types only, no JSX, no imports
export type MascotPose = "idle" | "blink" | "talk-a" | "talk-b" | "point" | "cheer";
export type MascotGaze = { x: number; y: number };   // -1…1, clamped + eased by the engine

export type MascotSpriteProps = {
  pose: MascotPose;
  gaze: MascotGaze;
  size: number;        // rendered box in CSS px
  still: boolean;      // reduced motion — render statically, no self-animation
  className?: string;
};

export type MascotSprite = React.ComponentType<MascotSpriteProps>;
```

**Contract every implementation honours:** render a square `size × size` box; no margins, no fixed positioning, **no transforms on the root** (the engine owns bob/entry on the *wrapper*); pure function of props with **no internal timers** (blink cadence and talk frames are the engine's); `aria-hidden="true"` (the bubble supplies accessible text).

Selection is literally one line:

```ts
const Sprite: MascotSprite = SvgPixelMascot;   // ← the only line that changes
```

Everything else — gaze hook, blink timer, pose machine, section→radio-line lookup, bubble, mount gating, mobile hiding — is renderer-agnostic and written once. Swapping (a)→(b)→(c) touches one import.

Build order: write the SVG-pixel version first as a deliberately crude placeholder so the engine is testable immediately, then swap in whatever you choose.

### 5.6 Token layer

`app/globals.css` gets two tiers — raw palette (§3.1), then semantic aliases:

```
--background       var(--rb-bg)         --brand            var(--rb-red)
--card --popover   var(--rb-surface)    --signal           var(--rb-yellow)
--secondary        var(--rb-raised)     --best             var(--rb-purple)
--muted            var(--rb-raised)  ← SURFACE
--muted-foreground var(--rb-dim)     ← TEXT
--accent           var(--rb-raised)  ← hover surface, NOT brand
--border --input   var(--rb-border)
--foreground       var(--rb-fg)
--ring --destructive  var(--rb-red)

--led-1..4                     rev strip only — the green carve-out, isolated
--tyre-soft/medium/hard        → brand / signal / foreground
--mx --my                      cursor glow, written per-element by JS
```

`tailwind.config.ts` additions: map the currently-**missing** `popover` and `destructive` (declared in CSS, unmapped in config today); add `brand`/`signal`/`best`/`surface`/`raised`; **fix `fontFamily.mono`**; add `transitionDuration: { 400: "400ms" }`; add the z-scale and new keyframes (`token-land`, `led-flash`, `radio-pop`, `bob`, `trace`).

Opacity modifiers already work on `hsl(var(--x))` — verified against the installed Tailwind, no `<alpha-value>` retrofit needed.

> `content` globs are `./app`, `./components`, `./lib` — **`./data` is excluded**. No Tailwind class-name strings may live in data files or they'll be purged silently. Grade→class mapping stays in components.

---

## 6. Build phases

### Phase 0 — Foundation (zero visible change; everything depends on it)

| File | | Purpose |
|---|---|---|
| `package.json` | M | add `framer-motion@^11.18.2` |
| `app/globals.css` | M | Red Bull token layer. **Preloader block (54-128) and reduced-motion block (132-144) stay byte-identical.** |
| `tailwind.config.ts` | M | colours, mono fix, keyframes, z-scale, `duration-400` |
| `app/layout.tsx` | M | load JetBrains Mono |
| `app/opengraph-image.tsx` | M | parallel palette edit |
| `app/icon.svg` | M | parallel palette edit (still old cyan) |
| `lib/sections.ts` | **N** | ordered `SECTIONS` — single source of truth |
| `lib/motion.ts` | **N** | framer-motion seam + spring presets |
| `lib/tokens.ts` | **N** | `readToken()` — canvas can't read CSS vars |
| `data/skills.ts` | M | `items: string[]` → `SkillItem[]` with `grade` |
| `data/projects.ts` | M | optional `media?: ProjectMedia`, `skills?: string[]` |
| `data/profile.ts` | M | `githubUsername`; `best?: boolean` on `Stat`, mark one |
| `data/content.ts` | M | 5-section nav; fix `footer.builtWith`; mascot radio lines |
| `data/index.ts` | M | export the new types |
| `README.md` | M | de-stale — claims Three.js, shadcn, and `data/resume.ts` which doesn't exist |

**Verification gate:** `tsc --noEmit` + `lint` + `build` clean, preloader visually unchanged.

### Phase 1 — Shippable portfolio

Providers, scroll context, nav dock (+ the hand-authored CSS), rev strip, and all five sections with real content: pit-board hero with SSR'd tagline and sponsor bar, halo-framed about with stat blocks, projects timing tower with **statically docked** media, garage with tyre chips + education, contact with copy-email, footer.

Motion here is only what `MotionConfig` gives free, plus the dock notch and rev strip.

**This phase ships.** No canvas, no slam, no mascot, no terminal, no track map. It is a complete, honest, recruiter-ready portfolio on its own.

### Phase 2 — Signature motion

`use-scroll-slam.ts` · `project-media.tsx` (the swappable slot) · `telemetry-panel.tsx` · hero token-stream · attention glow tier 1 · `embedding-field.tsx` · contributions API route + `ContactCards` + graph · race-control toasts · sector splits.

### Phase 3 — Delight

Mascot (interface + engine + placeholder renderer + radio bubble + gaze hook) · terminal easter egg · track-map lap progress · team-radio contact treatment · skill connectors tier 2.

---

## 7. Performance budget

**Target: ≤ 45 KB gzip added JS.** If it passes ~60 KB, deleting three.js (~210 KB) bought nothing. That's the yardstick, and it's the reason this repo has the shape it does.

| Item | Mitigation |
|---|---|
| framer-motion (~34 KB full) | `<LazyMotion features={domAnimation} strict>` → ~5 KB initial, ~17 KB lazy. **`strict` throws at runtime if anyone writes `motion.*` instead of `m.*`** — that's the enforcement mechanism. Building the dock notch with `layoutId` would force `domMax` (+13 KB), so it's built with transform + spring instead. |
| Fonts | Both variable, `subsets: ["latin"]`, no `weight` arrays. next/font self-hosts, preloads, and injects `size-adjust` fallback metrics → no CLS, no third-party connection. |
| Canvas | ≤2 ms/frame. Move `resize()` **out of the draw loop** (`particle-field.tsx:69` calls it every frame and reads `clientWidth` — a forced layout read per frame). Cap DPR at **1.5**, not 2. Pause on `visibilitychange`. Frame-cap to 30 fps. **Never `ctx.shadowBlur`** — the canonical 10× killer; fake glow with stacked low-alpha arcs. |
| Code splitting | `next/dynamic({ ssr: false })` for `EmbeddingField`, `Mascot`, `TerminalOverlay`, `ContributionGraph`. Dock, rev strip and all five sections stay server-rendered. |
| LCP | Hero tagline is SSR'd text. `profile.jpg` through `next/image` with `priority` + explicit `sizes` — 88 KB of JPEG into a 256px slot is pure waste. |

**The biggest trap: `backdrop-filter` on fixed chrome over an animating canvas.** A frosted dock forces a full-viewport backdrop re-sample *every frame the canvas paints* — 8–16 ms on integrated GPUs. Use `bg-surface/95` + a border instead; on navy it looks better anyway. The preloader already learned this exact lesson and documents it at `spatial-neural-preloader.tsx:173-190`.

---

## 8. Risks — the things that will actually bite

1. **Fixed chrome mispositioned for ~1.1 s on every load.** §5.1. Cheap to prevent now, a real refactor once five components assume they live in `children`.
2. **`motion@12` vs `framer-motion@11`** — §5.3.
3. **`--muted` / `--muted-foreground` inversion**, and **shadcn `--accent` vs brand red** — §3.1. Both silent, both make the site look broken in ways that are hard to trace back.
4. **The dock notch will be misaligned** — it measures with `getBoundingClientRect`, which changes on resize *and* on font swap. Needs a `ResizeObserver` **and** an `await document.fonts.ready` re-measure. Without the font hook it's silently a few px off on first paint, every load. This is the #1 bug in this component pattern.
5. **Ref-callback bug in the pasted tab bar.** `ref={(el) => (itemRefs.current[i] = el)}` — precisely: it *does* type-check under `@types/react@18.3.3`. It's a **React 19 landmine**: React 19 types it as a compile error and at runtime calls the returned DOM node as a cleanup function. Fix with a block body now.
6. **`particle-field.tsx` must not be evolved in place** — the frozen preloader imports it (`spatial-neural-preloader.tsx:4`), so mutating it changes the preloader's look, contradicting "keep it as-is". Create `embedding-field.tsx` as a new file, copying the rAF/DPR/reduced-motion skeleton (which is genuinely good) and *not* the per-frame layout read.
7. **Never hand-write `will-change: transform`** on the dock, mascot, or panels — it permanently promotes layers *and* creates a containing block, reintroducing risk 1. Let Framer set and unset it.
8. **Backtick detection** must use `e.code === "Backquote"` (backtick is a dead key on many non-US layouts), bail on `meta`/`ctrl`/`alt`, and bail when focus is in an input — otherwise typing a backtick in the terminal's own prompt closes it.
9. **`navigator.clipboard` is undefined on non-secure origins**, including LAN dev over an IP. Keep the `execCommand` fallback in the pasted component; it exists for exactly this.
10. **Mobile collisions.** Fixed dock + bottom-right mascot overlap below `md` → hide the mascot. iOS Safari's URL bar covers `bottom: 0` → `env(safe-area-inset-bottom)`. The dock occludes the end of Contact → bottom padding equal to dock height + inset.
11. **`useReducedMotion()` returns `null` on first render** → hydration mismatch if it gates JSX shape. §5.4.
12. **IntersectionObserver never activates the last section.** §5.2.
13. **Three hardcoded palette copies** will drift. Cross-reference them in a header comment in `globals.css`.
14. **`content.footer.builtWith` and `README.md` both currently claim Three.js and shadcn/ui.** Shipping either is a factual error on a job-hunt portfolio.
15. **Tailwind `content` globs exclude `./data`** — no class-name strings in data files.
16. **Dirty working tree** — commit or stash first.

---

## 9. Decisions already made

| | |
|---|---|
| Livery | Red Bull navy |
| Animation | framer-motion 11 |
| Preloader | frozen, kept as-is |
| Project media | code-drawn telemetry panels now, real media via the swappable slot later |
| Rev strip | authentic F1 — green survives here as a functional instrument colour |
| Everything discussed | **in scope.** Nothing was cut; the phases order it so the site ships early. |
| shadcn CLI | **not** installing it. The substrate we need (`cn()`, CVA, tokens) already exists, and `components.json` would pull in `--accent` semantics that collide with the brand palette (risk 3). We author the handful of primitives we need directly. |

---

## 10. Open inputs — I need these from you

None of them block architecture. Defaults in the right column apply if you don't answer.

| # | Input | Needed by | Default if unanswered |
|---|---|---|---|
| 1 | **Mascot renderer**: (a) I hand-code an SVG pixel grid — full frame control, approximate likeness; (b) you export sprite PNGs (idle/blink/talk/wave) — best likeness, blocks until delivered; (c) hybrid — your PNG + coded eyes/mouth overlay | Phase 3 | Build (a) as a crude placeholder; swapping is a one-line import change |
| 2 | **Race number** — pick one like drivers do | Phase 1 | Omitted until you choose (it threads through favicon, hero, nav, footer) |
| 3 | **Favourite circuit** for the track map | Phase 3 | Spa-Francorchamps — most recognisable silhouette |
| 4 | **Skill grades** — soft/medium/hard across ~45 skills | Phase 1 | I'll make a first pass from your resume and projects; you correct it |
| 5 | **Project screenshots/clips** | any time | Telemetry panels render; the slot accepts real media with no refactor |
| 6 | **Contact form backend?** — real form needs Resend/Formspree/a route handler | Phase 3 | Styled `mailto:` + copy-email, which works today |
| 7 | **Resume PDF** — there isn't one in `public/`, and `cat resume` in the terminal easter egg wants something to point at | Phase 3 | Terminal prints a text summary from `@/data` instead |

---

## 11. Verification

Run per phase. Phase 0 must pass before anything is built on it.

1. `npx tsc --noEmit` and `npm run lint` clean.
2. `npm run build` — check route First Load JS against the ≤45 KB delta budget.
3. **Preloader regression** *(every phase, non-negotiable)* — hard-reload with devtools open and confirm the dock, rev strip and mascot are correctly positioned **during** the 1.1 s handoff, not just after. This is risk 1, and it's only visible in the last ~500 ms.
4. **Reduced motion** — toggle the OS setting (or DevTools → Rendering → Emulate `prefers-reduced-motion`) and reload. Preloader skips, sections render settled, media renders docked, rev strip still fills, canvas paints one frame and binds no pointer listener. **Check the console for hydration warnings** — that's the `useReducedMotion()` null trap.
5. **No-JS** — disable JS. Full hero text, all content, no black screen.
6. **Scroll audit** — DevTools → Performance, scroll the full page. ~60 fps, no layout thrash, and the Event Listeners panel matches the budget in §5.2. No stray `scroll` listeners.
7. **Nav sync** — scroll slowly through all five sections; the pip must track, and **Contact must activate at the bottom** (the edge case). Click each dock item: no flicker through intermediate sections.
8. **Dock notch alignment** — hard-reload with cache disabled and network throttled so the font swap is visible. The notch must be centred on first paint, not after.
9. **Responsive** — 360 / 768 / 1440. Mascot hidden below `md`, Contact not occluded by the dock, no horizontal overflow.
10. **A11y** — keyboard-tab the whole page. Dock items reachable with visible focus and `aria-current`, terminal closes on Escape, mascot `aria-hidden`. Lighthouse a11y ≥ 95.
11. **Contribution graph failure path** — block the API route in devtools; the graph must vanish cleanly, not error.

---

*Dev server is yours to run — I won't start one.*

# Adeel — Portfolio

An ML engineer's portfolio wearing F1 instrumentation. Built with **Next.js 14**
(App Router), **Tailwind v3**, and **Framer Motion**.

The design brief and build plan live in [REDESIGN.md](./REDESIGN.md).

## Run locally

```bash
npm install
npm run dev
```

Open http://localhost:3000

## Deploy

Push to GitHub, then import the repo at [vercel.com](https://vercel.com) — zero
config needed.

`metadataBase` reads `siteMeta.url` from `data/content.ts`; point it at the real
production domain so social share cards resolve.

## Customize

Content lives in `data/`, split by concern:

| File | Holds |
|---|---|
| `data/profile.ts` | name, role, tagline, contact links, race number, headline stats |
| `data/projects.ts` | the three projects — copy, stack, architecture flow, metrics, media slot |
| `data/skills.ts` | skills grouped and graded by tyre compound (`soft` / `medium` / `hard`) |
| `data/education.ts` | degree and certifications |
| `data/content.ts` | site metadata and section prose |

Structure lives in `lib/`:

- `lib/sections.ts` — the five sections in order. Single source of truth for the
  nav dock, the scroll observer, the track map and the mascot's radio lines.
- `lib/motion.ts` — the only file that imports `framer-motion`, plus the shared
  spring presets.
- `lib/tokens.ts` — reads CSS custom properties at runtime for `<canvas>` code.

### Theme

The palette is defined once in `app/globals.css` as a `--rb-*` tier, with
semantic aliases layered on top. **Three other files hold hardcoded copies**
because they cannot read CSS variables — recolouring is a four-file edit:

- `app/globals.css` (source of truth)
- `app/opengraph-image.tsx`
- `app/icon.svg`
- `lib/tokens.ts` bridges the rest into canvas

Colour discipline is documented at the top of `globals.css` and is load-bearing:
red is interactive-only, yellow is measurement-only, purple marks exactly one
personal-best number, and green is dropped everywhere except the preloader
terminal and the rev-strip shift lights.

### Adding project media

Projects render a code-drawn telemetry panel by default. To swap in a real
screenshot or clip, drop the file in `public/projects/` and add one line to the
project in `data/projects.ts`:

```ts
media: { kind: "image", src: "/projects/sefgh.png", alt: "SEFGH search results" }
// or
media: { kind: "video", src: "/projects/sefgh.mp4" }
```

### Intro animation

`components/ui/spatial-neural-preloader.tsx`. Plays once per tab
(`sessionStorage`), skippable with any click or keypress, and bypassed entirely
for `prefers-reduced-motion`. `LOADER_DURATION` sets its length.

Its hand-off choreography lives in `app/globals.css` and is coupled to
`LAUNCH_DURATION` in the component — the two must agree. Note that
`#site-shell` is a containing block while the hand-off runs, which is why all
fixed chrome (nav dock, rev strip, mascot) mounts as its sibling rather than
inside it.

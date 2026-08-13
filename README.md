# Adeel — Portfolio

Minimalist, futuristic portfolio built with **Next.js 14**, **Tailwind + shadcn-style components**, and a **WebGL shader background**.

## Run locally

```bash
npm install
npm run dev
```

Open http://localhost:3000

## Deploy (free)

Push to GitHub, then import the repo at [vercel.com](https://vercel.com) — zero config needed.

After deploying, update `metadataBase` in `app/layout.tsx` to your real production URL so social share cards resolve correctly.

## Customize

- All content (name, projects, skills, links) lives in `data/resume.ts`.
- Colors/theme: `app/globals.css` (change `--primary` HSL to re-accent the whole site).
- Social share card: `app/opengraph-image.tsx` — generated at build time from `data/resume.ts`.
- Intro animation: `components/ui/spatial-neural-preloader.tsx`. It plays once per tab
  (`sessionStorage`), is skippable with any click or keypress, and is bypassed entirely
  for visitors with `prefers-reduced-motion`. Tune `LOADER_DURATION` to change its length.

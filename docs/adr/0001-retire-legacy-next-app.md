# 0001. Retire the legacy Next.js app

- Status: accepted
- Date: 2026-10-24
- Decided by: the owner, approving the cleanup plan in a Claude session

## Context

The Astro rebuild (approved 2026-10-17) replaced the original Next.js 14 site. The rebuild kept the old source in the repository as "retained legacy recovery source": `app/`, `components/`, most of `lib/` and `data/`, and the Next, Tailwind and PostCSS configs. A rule in `CLAUDE.md` and `docs/content-authoring.md` said not to delete it.

By 2026-10-24 that source had stopped being a usable recovery path, and it had real costs:

- It could not build. `package.json` no longer installed React, Next, Framer Motion, Tailwind or lucide, and the `@/` alias pointed at `src/`, so every legacy import was broken.
- It was larger than the live site: 70 files and about 5,700 lines, against about 3,800 lines in `src/`.
- 25 of the 73 unit tests exercised it, which overstated coverage of the live site.
- The leftover Tailwind `postcss.config.mjs` forced a workaround in `astro.config.mjs`.
- `/api/contributions` survived only for the old React contribution graph. No page called it, yet it was the only reason the build needed a server function.
- No deployment of either version was ever found, so no external link depended on the old URLs or hash anchors (`#garage`, `#project-01` to `#project-03`).

Git history already keeps every version, so keeping the files on disk added no recovery value.

## Decision

- Delete the legacy Next.js source and its configs. Tag the last commit that contains them as `legacy-next-final` (`6da43246`).
- Remove `/api/contributions`, its helper, its tests and its copy in `scripts/serve-built.mjs`. The site is fully prerendered.
- Move the data the live site uses (`profile`, `skills`, `education`) into `src/data/`, and `storage` into `src/lib/`, so the whole app lives under `src/`.
- Drop the Next-era hash anchors.
- Keep the Vercel adapter and leave dependencies unchanged in this step.
- Before deleting anything, record the content that only the legacy data held in `docs/legacy-content-inventory.md`. It is marked unverified.

## Consequences

- One app, one source tree. Agents and contributors no longer have to know which half of the repository is live.
- The "do not delete legacy source" rule in `CLAUDE.md` and `docs/content-authoring.md` is withdrawn.
- Recovery is `git checkout legacy-next-final -- <path>`. The tag is local until the owner pushes it.
- A GitHub contribution graph, if wanted again, needs a new design. It could be fetched at build time instead of through a server function.
- The unit suite is smaller (32 tests), but every test now exercises live code.
- Unused dev dependencies, such as the jsx-a11y ESLint plugins, remain for a later, separate change.

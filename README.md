# Adeel — Portfolio

An Astro + TypeScript portfolio with a quiet professional default and an optional F1 theme. The F1 button runs a brief, original Three.js/GSAP starting-light and track sequence. The scene loads on intent, respects reduced motion, and is disposed when the switch ends. Ordinary navigation never replays it.

## Develop

Use Node 24 (see `.nvmrc`), then:

```sh
npm ci
npm run dev
```

Open the local URL printed by Astro, normally `http://127.0.0.1:4321`.

```sh
npm run check
npx playwright install
npm run test:browser
```

On Windows this checkout also has an ignored task-local runtime. In PowerShell:

```powershell
$env:PATH = "$PWD\.tools\node-v24.22.0-win-x64;$env:PATH"
npm run dev
```

The local runtime is not part of Git. Other machines should install Node 24 normally. Local Chromium tests use installed Chrome; CI installs its browser runners. `npm run start` serves the built Vercel static output for local verification after `npm run build`; production uses the Astro adapter.

## Add work and credentials

- Projects: `src/content/projects/*.md` become `/projects/<filename>/` case studies.
- Credentials: `src/content/certifications/*.md` support issuer, kind, issue/expiry dates, credential ID, verification link, asset and related projects.
- Profile/contact: `data/profile.ts`; editorial copy: `src/data/site.ts`.
- Resume: replace `public/resume.pdf` without changing its URL.
- Styles: `src/styles/site.css`; animation: `src/scripts/theme.ts` and `f1-scene.ts`.

[Content authoring](docs/content-authoring.md) includes templates and publication rules. Drafts never appear in public pages or previews. Unknown dates, metrics, credentials and project URLs are not invented. Optional metrics need a measurement method, date and evidence; images need descriptive alternative text.

## Delivery

GitHub CI checks types, content, lint, unit contracts, build output, internal links, arrival-JavaScript budget, and browser journeys in Chromium, Firefox and WebKit. [Deployment setup](docs/deployment.md) describes Git previews, production checks and rollback. Connecting a hosting project and protecting its production branch are separate setup steps; this repository alone does not activate them.

Set `SITE_URL` to the actual production origin. Pages are prerendered; `/api/contributions` is the only on-demand endpoint and preserves its existing JSON/cache/failure contract. The local default origin is for development only.

The Vercel CLI is not installed on the implementation machine. `npm i -g vercel` is strongly recommended to enable `vercel env pull`, `vercel deploy`, and `vercel logs` once the target account/project is confirmed.

## Project records

[CHECKPOINT.md](CHECKPOINT.md) holds recovery status. [CLAUDE.md](CLAUDE.md) is the canonical agent guide. The approved design and plan are in `docs/superpowers/`. Root `app/`, `components/` and Next/Tailwind configs are retained legacy recovery source, excluded from the active Astro app; do not edit them to change the current site.

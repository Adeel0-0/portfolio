# Editing the portfolio

The active app is Astro. Edit content in Git, open a pull request, review the automatic deployment, and merge after required checks pass. No database or browser CMS is needed.

## Development

Use Node 24 (the exact version is recorded in `.nvmrc`) and npm. Run `npm ci`, `npm run dev`, then visit the URL printed by Astro. Run `npm run check` and `npm run test:browser` before merging. Install the browser runners once with `npx playwright install`.

The implementation machine's system Node is older. A task-local runtime under ignored `.tools/` is a temporary setup aid, not a deployed dependency or a replacement for installing Node 24 normally.

## Add a project

Create `src/content/projects/my-project.md`. The filename becomes `/projects/my-project/`; use lowercase letters, numbers and hyphens. A minimal entry:

```yaml
---
title: A real project title
summary: One sentence explaining why it matters.
description:
  - What the project is.
  - How it works.
role: Your actual contribution
status: in-progress
category: Backend engineering
skills: [Python, FastAPI]
updatedAt: '2026-10-17'
draft: true
visual: search
diagram: [Input, Processing, Output]
---
```

Write the case study beneath the frontmatter: Problem, My contribution, Approach, Evaluation, Trade-offs and limitations, Next steps. Set `draft: false` only when the copy is ready to publish. Drafts are excluded from all public builds, including deployment previews.

Optional fields: `startedAt`, `completedAt`, `featuredOrder`, `repositoryUrl`, `liveUrl`, `videoUrl`, `media: {src, alt}`, and `metrics`. Use real dates or omit unknown optional dates. `featuredOrder: 1` puts an entry first among selected projects. The first three featured entries appear on the home page. Omit unavailable evidence links; no empty action is rendered.

`visual` supports `search`, `vision`, or `control` architecture artwork. Illustrations describe a system; they are not measured data. Add a real image under `public/projects/` and reference it with `media` when available. The build checks that referenced assets exist. A metric must supply `value`, `label`, `method`, `measuredAt` and `evidence` (an HTTP(S) URL or supported local asset). Numerical claims without context fail validation.

Skills must match `src/data/skills.ts`. Add a new skill there first, then reference it from projects or credentials. Its skill grades are not shown on the site.

## Add a credential

Create `src/content/certifications/my-credential.md`:

```yaml
---
title: Exact credential title
issuer: Exact issuer
kind: course-completion
skills: [Python]
draft: true
relatedProjects: []
---
```

Before publication, add the real `issuedAt: 'YYYY-MM-DD'`. Optional fields are `expiresAt`, `credentialId`, `verificationUrl`, `asset` and `relatedProjects`. `kind` is `certification`, `course-completion` or `badge`. These meanings should not be interchanged. A related project must exist, and a published credential cannot link to a draft project.

The NVIDIA entry was migrated as a draft because the old content only provided its title. Supply its issue date and supporting details before publishing. General open-source activity and hackathon participation are not certifications.

## Profile and assets

Contact information and location live in `src/data/profile.ts`. New editorial copy and capability groups live in `src/data/site.ts`. Replace `public/resume.pdf` to update the resume; deleting it hides resume actions at the next build. Keep the URL stable. Both modes use the same content and links.

## Theme behavior

Professional is the default. The header's F1 mode button stores a validated preference. An intentional entrance runs the brief Lights Out sequence when its scene is ready, otherwise a quick sweep. Reloading and normal navigation restore the selected mode immediately. Reduced motion skips the scene. No effect continues rendering after the transition finishes.

## Earlier versions

The Next.js version of the site was retired on 2026-10-24 (`docs/adr/0001-retire-legacy-next-app.md`) and is recoverable from tag `legacy-next-final`. Project facts and metrics that only it held are listed in `docs/legacy-content-inventory.md`. They are unverified: confirm each claim, and supply the metric fields above, before adding it to a content file.

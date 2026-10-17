# Delivery setup and release boundaries

## Local and CI verification

Node 24 and npm are required. The lockfile pins the dependency graph. CI runs install, Astro/type/content validation, lint, unit contracts, production build, internal-link/asset/bundle checks, and browser journeys across both themes. A failing required check must prevent merging.

The repository configuration alone does not enable branch protection, automatic previews, a production domain, or deployment promotion. These are hosting/account settings and must be verified on the actual project.

## Vercel Git workflow

1. Confirm the intended repository, Vercel project and production domain. Configure framework Astro, build `npm run build`, install `npm ci`, Node 24, and the repository root directory.
2. Connect Git to create a preview deployment for every pull request. Set the canonical `SITE_URL` to the real production origin; the config also accepts Vercel's production-domain environment value. Do not use a per-preview URL as canonical.
3. Protect `main` with the CI status checks required. Confirm the names against an actual CI run.
4. Configure Deployment Checks so required production checks pass before assigning the production domain. Test this with a deliberately failing check before relying on it.
5. If Deployment Checks are unavailable for the project, use one CI-owned staged deployment, smoke-test its immutable URL, and promote it only on success. Disable overlapping automatic production promotion. Verify the current CLI/provider behavior before adding that automation.
6. Keep the previous known-good deployment available. Test a rollback and verify routes, assets, resume and `/api/contributions` after promotion.

No hosted project was configured, committed, pushed or deployed by the local implementation. Deployment authorization should apply to a concrete verified artifact and a confirmed target.

## Runtime boundary

Pages are prerendered. `/api/contributions` is the only on-demand route and uses the Vercel adapter. Its response remains status 200 with `{contributions: []}` on upstream failures, a five-second upstream timeout, and `Cache-Control: public, s-maxage=3600, stale-while-revalidate`. The static pages do not wait for that service. Route/CDN caching replaces the old Next data-cache layer.

No private service token is needed by the site. Keep any later deployment credentials in CI/provider secret stores, never in content or the repository. Untrusted PR jobs must not receive deployment secrets. Preview deployments use the same draft-exclusion policy as production.

## CLI

The Vercel CLI was absent during implementation. Installing it with `npm i -g vercel` is strongly recommended for `vercel env pull`, deployment inspection and `vercel logs`. Pin a reviewed CLI version if a future deployment job uses it. Global installation and account login were not performed automatically.

## Portability

Content, semantic styles and the theme effect are hosting-independent. Moving hosts requires replacing the Astro adapter, validating the contribution route/cache behavior, setting `SITE_URL`, and rerunning the same checks. Avoid changing content files to match a hosting provider.

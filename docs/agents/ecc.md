# ECC (Everything Claude Code) subset

A small, hand-picked part of [affaan-m/ECC](https://github.com/affaan-m/ECC)
(MIT, copyright Affaan Mustafa; licence copied to `.claude/rules/ecc/LICENSE-ECC`),
vendored at commit `4adeee6732a12d1540f49a4d50a38ce8c97f9a53` (2026-11-19).

ECC ships ~330 skills, ~70 agents, ~100 commands, hooks and rules for many
stacks. Only the parts that fit an Astro + TypeScript static site were taken,
and they were chosen to cost as little context as possible: skills, agents and
commands load only their one-line description until used, and every rule is
path-scoped so it loads only when matching files are touched.

## What is installed

| Kind | Where | Items |
| --- | --- | --- |
| Rules | `.claude/rules/ecc/` | `common/` coding-style, security, testing (scoped to `src/`, `tests/`, `scripts/`); `typescript/` coding-style, patterns, security, testing; `web/` coding-style, patterns, performance, security, testing |
| Agents | `.claude/agents/` | typescript-reviewer, security-reviewer, build-error-resolver, e2e-runner, a11y-architect, silent-failure-hunter, refactor-cleaner, performance-optimizer |
| Skills | `.claude/skills/` | accessibility, frontend-a11y, typescript-patterns, vite-patterns, e2e-testing, verification-loop, seo, security-review, search-first, browser-qa |
| Commands | `.claude/commands/` | `/ecc-build-fix`, `/ecc-refactor-clean`, `/ecc-test-coverage` (prefixed to avoid clashing with other plugins) |

Local edits to the vendored files: `**/*.astro` added to the `paths` of the
TypeScript and web rules, and a `paths` block added to the three common rules
(upstream they load on every session). Nothing else was changed.

## Deliberately left out

- **Hooks and the installer** (`hooks/`, `install.sh`, `scripts/hooks/`): they
  need ECC's plugin runtime and write to `~/.claude`, and would run alongside
  Antigravity and this repo's own checkpoint rules.
- **Design, motion and taste skills**: the Preprint and F1 looks are
  owner-approved, and `ui-ux-pro-max` is the design skill here.
- **Git-workflow and agents rules**: `docs/agents/version-control.md` governs
  git; the agents rule lists ECC agents that are not installed.
- **Commands that call ECC scripts or download tools** (`/quality-gate`,
  `/security-scan`, `/checkpoint`, session commands) and `strategic-compact`.
- **Other stacks** (Python, Go, Rust, mobile, backend, data, ops, marketing).

## Precedence

`CLAUDE.md` and `docs/agents/` win over any ECC text. In particular: Astro
stack and tokens in `src/styles/site.css`; no fabricated content; motion,
reduced-motion and cleanup contract; boot terminal is hands-off; the owner runs
the dev server; verification is `npm run check` and `npm run test:browser`.
ECC agents and commands suggest tools such as `knip`, `ts-prune` or
`lighthouse` through `npx`; installing or downloading them still needs the
owner's approval.

## Updating

Re-clone ECC, copy the same files over, re-apply the two `paths` edits above,
and update the commit SHA here.

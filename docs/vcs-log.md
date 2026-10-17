# Repository Version Control & Change Log

This file is maintained by the **Git & Version Control Manager (`git-vcs-manager`)**.
All significant commits, architectural reorganizations, and cross-agent updates are logged here.

---

## Log Entries

### [2026-10-17] - Complete Astro + TypeScript Core Architecture Migration
- **Commit**: `01f13ccd`
- **Branch**: `rebuild/astro-f1`
- **Agent**: `git-vcs-manager` / Codex / Antigravity
- **Type**: `feat(rebuild)`
- **Scope**: Entire application migration (`src/`, `tests/`, `docs/`, configs)
- **Summary**:
  - Migrated core application to Astro + TypeScript with dual visual themes (minimal corporate default and cinematic F1 mode).
  - Added project collections, schemas, dynamic routes, and asset loaders.
  - Implemented client scripts for theme toggles, progressive enhancement, and Three.js / GSAP scenes.
  - Added comprehensive unit tests and Playwright browser specs.
  - Preserved legacy source in `app/` and `.recovery/` for rollback resilience.

---

### [2026-10-17] - Setup of Git Version Control Management & Enforcement Protocol
- **Commit**: `9dd53ebd`
- **Branch**: `rebuild/astro-f1`
- **Agent**: `git-vcs-manager` / Antigravity
- **Type**: `docs(agents)`
- **Scope**: Repository-wide agent governance and VCS policy
- **Summary**:
  - Established formal Git & Version Control Manager protocol (`docs/agents/version-control.md`).
  - Added strict anti-rogue modification policy across all agents (`AGENTS.md`, `CLAUDE.md`).
  - Strict rule: Any agent (ChatGPT, Claude, Codex, Copilot, etc.) that makes unmanaged, untracked, uncommitted, or unauthorized changes without going through proper version control logging will have their changes removed/reverted immediately.
  - Created persistent `docs/vcs-log.md` to track changes, verification gates, and commit history.
- **Verification**: Documentation verified and synchronized across agent guides.

---

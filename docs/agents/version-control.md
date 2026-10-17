# Version Control & Git Management Protocol

This document governs all Git operations, repository tracking, commit standards, and change lifecycle management across all human contributors and AI agents (ChatGPT, OpenAI Codex, Claude, Cursor, GitHub Copilot, Antigravity, etc.).

---

## 1. Zero-Tolerance Rogue Change Policy

> [!WARNING]
> **STRICT ENFORCEMENT FOR ALL AGENTS (ChatGPT, Claude, Codex, Cursor, Copilot, etc.):**
> Any agent that makes uncommitted, untracked, uncoordinated, or broken changes without following version control logging will have their changes **REMOVED AND REVERTED IMMEDIATELY** via `git restore` and `git clean`.
> No unlogged direct edits to core files are tolerated.

1. **Clean Slate Guarantee:** Before starting any task, check `git status` and verify the active branch.
2. **Authorized Commits Only:** Work must be structured in discrete, logically grouped commits with conventional commit messages.
3. **No Phantom Files:** Unregistered configuration files, scratch files, or transient dumps left in the repository root will be deleted. Ensure `.gitignore` covers build outputs, caches, and local tooling.
4. **Failure to Comply:** If an agent leaves rogue unstaged diffs or breaks the build without documenting and committing cleanly, the Version Control Agent (`git-vcs-manager`) will wipe and revert those changes to the last known good commit.

---

## 2. Commit Message Standards

All commits must strictly follow the **Conventional Commits** specification:

```
<type>(<scope>): <short description in imperative present tense>

[optional body explaining context, why this change was made, and architectural decisions]

[optional footer(s) referencing issue numbers or breaking changes]
```

### Approved Types:
- `feat`: A new user-facing feature or capability
- `fix`: A bug fix or defect resolution
- `rebuild`: Structural architectural migration or rewrite (e.g. Astro migration)
- `docs`: Documentation updates, specs, ADRs, or agent instructions
- `style`: Formatting, whitespace, semicolon changes (no code behavior change)
- `refactor`: Code restructuring without bug fixes or new features
- `perf`: Performance improvements
- `test`: Adding or correcting tests
- `chore`: Maintenance tasks, dependencies, tooling, or build configuration

---

## 3. Branching & Worktree Strategy

- **`main`**: Production-ready, deployable baseline. Direct unreviewed pushes to `main` are restricted.
- **`rebuild/*`**: Active major architecture rebuilds (e.g., `rebuild/astro-f1`).
- **`feat/*`**: Feature branches.
- **`fix/*`**: Bug fix branches.
- **`docs/*`**: Pure documentation and agent protocol branches.

---

## 4. Version Control Logging (`docs/vcs-log.md`)

Every major milestone, architectural migration, or batch of commits must be logged in `docs/vcs-log.md`.
Each log entry must record:
- **Timestamp (ISO 8601 / local)**
- **Author / Agent Role**
- **Git Commit SHA(s)**
- **Branch**
- **Summary of Changes & Rationale**
- **Verification Status** (e.g., `npm run check`, `npm test`, Playwright test results)

---

## 5. Pre-Commit Verification Checklist

Before creating a commit or finalizing a task:
1. `git status`: Review all modified and untracked files.
2. `git diff`: Inspect exact changes to ensure no extraneous files or unintentional edits are included.
3. Run verification scripts where applicable (`npm run check`, `npm test`).
4. Stage relevant files explicitly (`git add <files>`), avoiding blind `git add .` when untracked scratch artifacts exist.
5. Create a descriptive commit.
6. Record entry in `docs/vcs-log.md`.

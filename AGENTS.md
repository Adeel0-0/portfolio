# AGENTS.md

This file defines the master rules for all AI assistants, autonomous agents, and bots operating on this repository (including **ChatGPT / OpenAI Codex, Claude, Cursor, GitHub Copilot, Gemini / Antigravity**, and any other AI tools).

---

## 🚨 MANDATORY VERSION CONTROL & GIT ENFORCEMENT NOTICE 🚨

> [!CAUTION]
> **STRICT WARNING TO ALL AI AGENTS (CHATGPT, CLAUDE, CODEX, COPILOT, ETC.):**
> Any agent that makes uncommitted, untracked, uncoordinated, or unauthorized changes without following the version control protocol will have their changes **IMMEDIATELY REVERTED AND REMOVED** (`git restore`, `git reset`, and deletion of rogue untracked files).
> 
> No agent is permitted to make silent or direct modifications without logging and version control tracking.

### Core Git Rules for All Agents:
1. **Governing Protocol:** All git operations and commit procedures must follow [Version Control Protocol](docs/agents/version-control.md).
2. **Version Control Logging:** Every architectural change, feature addition, or configuration update must be documented in [docs/vcs-log.md](docs/vcs-log.md).
3. **No Phantom / Rogue Files:** Do not leave uncommitted scratch files, uncoordinated build dumps, or dirty working directories.
4. **Clean Commits:** All changes must be cleanly committed using Conventional Commits (`feat:`, `fix:`, `rebuild:`, `docs:`, `chore:`, etc.).
5. **If You Break It, It Gets Reverted:** If changes break the build, fail typechecks/tests, or violate repo conventions, the Git VCS Agent (`git-vcs-manager`) will purge them without hesitation.

---

## Agent Guide & Single Source of Truth

This repo maintains its detailed agent instructions and domain architecture in **[CLAUDE.md](./CLAUDE.md)**.
All agents must read and adhere to `CLAUDE.md`:
- Issue tracker conventions: `docs/agents/issue-tracker.md`
- Triage labels: `docs/agents/triage-labels.md`
- Domain documentation: `docs/agents/domain.md`
- Version Control Management: `docs/agents/version-control.md`

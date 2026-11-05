# Skill setup record (2026-11-05)

| Skill | Source and revision | Status | Decision it informed |
|---|---|---|---|
| `ui-ux-pro-max` | `nextlevelbuilder/ui-ux-pro-max-skill`, pinned in `skills-lock.json` (hash `5fe84f9e…`) | Installed 2026-11-02, reviewed (stdlib Python, no network), applied | Its priority rules set the order of work (accessibility and target size first). Measured 10–11 px text and 23 px targets became the 13 px floor and 32 px `--target`; its line-length rule produced the `60ch` prose measure. Its whole-system generator returned poor fits for a personal portfolio (AI-chatbot purple, then brutalist handwriting), so targeted `--domain style/typography/color` checks were used instead: "Minimalism & Swiss Style" matched the approved direction and the Newsreader editorial pairing. |
| `frontend-design` (`anthropics/skills`) | Listed upstream | Not installed: owner declined the install | — |
| `impeccable` (`pbakaus/impeccable`) | Listed upstream | Not installed: owner declined the install | Critique was done with screenshots and the measurement scripts instead. |
| Browser inspection | Project Playwright 1.64.1 suites | Used (Chromium) | Found the 200 % zoom header overflow, the copy-control selector bug and a 1 px mode-switch shift, all fixed. |

## Bootstrapped components (2026-11-05)

| Component | Source | License | Use |
|---|---|---|---|
| ShaderGradient 2.4.20 | npm `@shadergradient/react` (github.com/ruucm/shadergradient) | MIT | F1 animated page gradient, React island. Reviewed: imports the site's `three` and `@react-three/fiber` (no second Three.js copy); remote HDR maps avoided with "3d" lighting. |
| 21st.dev gradient backgrounds | 21st.dev | Varies (some MIT, some unlicensed) | Not reachable: domain blocked by the session's network policy. |

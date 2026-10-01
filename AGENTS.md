# Agent instructions

This file is for any AI coding agent (Claude Code, Codex, Cursor, Copilot, Gemini, etc.) working in this repo.

1. Read `CLAUDE.md` for the project brief, design rules and phases.
2. Execute the active plan: `docs/superpowers/plans/2026-10-01-react-port-phase-1-2.md`. Resume at the first task with unticked boxes, and follow its "How to execute this plan" and "Git workflow" sections exactly.
3. Stop at every checkpoint the plan defines and wait for the user.

## Git workflow (summary)

- Work **only on the `dev` branch**. Run `git branch --show-current` first and switch with `git checkout dev` if needed.
- Never commit to `main`, create other branches, merge, push, force, rebase or skip hooks unless the user explicitly asks.
- Make one commit per plan task, with Conventional Commit messages (`feat:`, `fix:`, `chore:`, `test:`, `docs:`).
- Stage explicit paths only. Never use `git add -A` or `git add .`.
- `npm test` must pass before every commit.

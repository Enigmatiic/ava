# Ava — design spec

2026-10-03. Approved in conversation; this file records what was agreed and what was verified.

## What it is

Ava packages the working method used on Decens so it can be installed in any software
project (mobile app, web app, site, CLI, library, backend), new or existing, for Claude Code
or Codex.

Two parts:

1. **An installer** (`bunx github:Enigmatiic/ava install`). Deterministic, no AI. It puts
   files in the project and stops.
2. **One skill, `ava`**, with sub-commands. The agent runs it. Each sub-command loads one
   playbook from `reference/`.

## Decisions

| Question | Decision |
|---|---|
| Distribution | `bunx` from the GitHub repo. No npm publication. |
| Providers | `claude-code`, `codex`, or both, chosen at install. |
| Required skill | Impeccable, installed from its own source (`bunx impeccable install`). |
| Optional skills | superpowers, ponytail, graphify — offered at install. Ava's playbooks carry the rules themselves and work without them. |
| Tracker | GitHub Issues and Milestones through `gh`. Without a GitHub remote: `docs/issues/*.md`, same format. |
| Language | Generated files are in English. The agent talks to the user in the user's language. |
| Scope of install | Project-level and committed, so the workflow travels with the repository. |

## Installer

`install [--provider claude-code|codex|both] [--extras a,b] [--yes]`

1. Ask for the provider when the flag is absent.
2. Copy `skill/ava/` into the provider's skill directory.
3. Claude Code only: write the reviewer agents to `.claude/agents/`.
4. Register two hooks (block `rm -rf`; run `.ava/verify.sh` on Stop) without disturbing hooks
   already present.
5. Upsert a marked block (`<!-- ava:start -->` … `<!-- ava:end -->`) in `CLAUDE.md` /
   `AGENTS.md`. Text outside the block is never touched.
6. Install Impeccable for the chosen provider unless it is already available.
7. Offer the optional skills; run their install command when the provider CLI is on `PATH`,
   print it otherwise.
8. Record the choice in `.ava/install.json` so a re-run updates without asking again.
9. Warn when `git` or `gh` is missing. Tell the user to run `/ava init`.

`doctor` checks an installation and exits non-zero when something is missing.

Re-running `install` is the update path. It must be idempotent.

### Where things go (verified 2026-10-03)

| | claude-code | codex |
|---|---|---|
| Instructions | `CLAUDE.md` | `AGENTS.md` |
| Skill | `.claude/skills/ava/` | `.agents/skills/ava/` |
| Reviewers | `.claude/agents/ava-*.md` | read from the skill's `reviewers/` |
| Hooks | `.claude/settings.json` | `.codex/hooks.json` |
| Impeccable | `--providers=claude` | `--providers=codex` |

Codex reads repository skills from `.agents/skills` and hooks from `<repo>/.codex/hooks.json`;
its hook JSON has the same shape as Claude Code's, `Bash` is the shell matcher, and exit code
2 blocks a tool call or continues a Stop. Source: OpenAI Codex docs (skills, hooks).

## The skill

| Command | Purpose |
|---|---|
| `/ava init` | Mandatory first step, empty project included. |
| `/ava <request>` | Intake: what the user wants, or what is broken. |
| `/ava milestone M<n>` | Run one milestone end to end. `new` creates one. |
| `/ava issue …` | Create, fix, move or close an issue. |
| `/ava review` | Run the reviewers on the current diff. |
| `/ava status` | Where things stand. Read-only. |

**init** — Empty project: interview. Existing project: read the code, the history and the
live product first, then ask only what the repository cannot answer. Establish the design
system through Impeccable (`init`, then `document` for existing UI or `shape` for new).
Write `docs/PRD.md`, `docs/ARCHITECTURE.md`, `docs/IMPLEMENTATION_PLAN.md`,
`docs/PROGRESS.md`, the project section of the instruction file, and `.ava/verify.sh`.
Create labels, milestones and epics. Nothing is written before the user approves the summary.

**intake** — Fixed order: the user states the request → the agent investigates (reproduce and
find the root cause for a bug; read the code and the options for a feature) → the agent
returns with questions sharpened by what it found → it proposes a route (fix now, issue,
milestone) → the user approves → work starts.

**milestone** — The Decens loop: load context, plan, wait for approval, implement test-first,
verify with real output, run the product live, review, re-home what cannot be done here,
close into `PROGRESS.md`.

**Anti-slop** — `reference/anti-slop.md` is read by every playbook that produces code, UI or
text. A `slop-reviewer` runs in `/ava review` and at the review step of each milestone. UI
slop is delegated to Impeccable and its detector.

## Out of scope

A tracker of its own, a web UI, telemetry, npm publication, providers other than the two
named.

## Testing

- Installer: `bun test` against temporary directories — empty project, project with an
  existing instruction file and existing hooks, re-install, each provider.
- Skill: `/ava init` run by hand on a scratch empty project and on an existing one.

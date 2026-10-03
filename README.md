# Ava

A working method for building software with a coding agent, installable in any project:
mobile app, web app, site, command-line tool, library or backend, new or already running.
It works with Claude Code and with Codex.

The method has three habits. The agent investigates before it asks. It gets agreement before
it builds. It shows proof before it says done. Everything a later session needs is written to
the repository, because each session starts from an empty context.

## Install

In the root of the project (the directory that holds, or will hold, `.git`):

```bash
bunx github:Enigmatiic/ava install
```

It asks which provider you use (`claude-code`, `codex` or `both`) and whether to add the
optional skills. Without questions:

```bash
bunx github:Enigmatiic/ava install --provider claude-code --yes
```

Then open the project in your agent and run `/ava init` (Codex: `$ava init`). Every project
starts with `init`, an empty one included.

Requirements: [Bun](https://bun.sh), `git`, and `gh` if you want issues on GitHub. Without a
GitHub remote, issues are kept as files in `docs/issues/`.

## Commands

| Command | What it does |
|---|---|
| `/ava init` | Learns the product (reads an existing project, or interviews you for a new one), sets the design system with Impeccable, writes the PRD, architecture, plan and progress file, and prepares the tracker. |
| `/ava <what you want, or what is broken>` | States the request back, investigates, returns with questions sharpened by what it found, and proposes a route: fix now, issue, or milestone. Builds only after you agree. |
| `/ava milestone M<n>` | Runs one milestone: plan, approval, test-first implementation, verification, live run with captures, review, closing report. `milestone new` adds one. |
| `/ava issue` | Creates, fixes, moves or closes an issue in a ten-line format: severity and why, where, what, fix plan, status. |
| `/ava review` | Runs the requirements, slop and compliance reviewers on the current diff. |
| `/ava status` | Where things stand, what is waiting on you, the next command. |

## What lands in the project

| | Claude Code | Codex |
|---|---|---|
| Skill | `.claude/skills/ava/` | `.agents/skills/ava/` |
| Reviewers | `.claude/agents/ava-*-reviewer.md` | read from the skill |
| Hooks | `.claude/settings.json` | `.codex/hooks.json` |
| Workflow rules | a marked block in `CLAUDE.md` | a marked block in `AGENTS.md` |

Plus `.ava/install.json`. Commit all of it: the workflow then travels with the repository.

Two hooks are registered. One blocks `rm -rf` (use `trash`). The other runs `.ava/verify.sh`,
the project's fast checks written by `init`, when the agent ends a turn that changed a file;
a failing check sends it back to work. In Codex, open `/hooks` once and trust them.

[Impeccable](https://github.com/pbakaus/impeccable) is installed alongside, because `init`
uses it to establish the design system (`PRODUCT.md`, `DESIGN.md`).

Optional: superpowers, ponytail and graphify. The playbooks use them when they are present and
carry the same rules when they are not.

`init` then adds `docs/PRD.md`, `docs/ARCHITECTURE.md`, `docs/IMPLEMENTATION_PLAN.md`,
`docs/PROGRESS.md`, `.ava/verify.sh`, and the project's own section of the instruction file.

## Update, check, remove

```bash
bunx github:Enigmatiic/ava install    # update: remembers the provider, changes only Ava's files
bunx github:Enigmatiic/ava doctor     # check an installation
```

An update rewrites the skill directory, the reviewers and the marked block. It never touches
text outside the block, your other hooks, or anything under `docs/`.

To remove Ava: delete the skill directory and the reviewers, the block between
`<!-- ava:start` and `<!-- ava:end -->`, the two hook entries that mention `ava/scripts`, and
`.ava/`.

## Limits

- Ava installs at the repository root. In a monorepo, install it once at the top.
- The hooks need `bash` and `git`.

## Develop

```bash
bun test
```

The installer is `src/install.ts`; the workflow itself is the markdown under `skill/ava/`.
`docs/spec.md` records the design.

# Ava implementation plan

**Goal:** an installer and one skill that put the Decens working method into any project.

**Architecture:** a zero-dependency Bun CLI copies a provider-neutral skill directory into the
project and wires hooks and instructions for the chosen provider. All workflow behaviour lives
in markdown playbooks; the only code is the installer and two hook scripts.

**Tech stack:** Bun (TypeScript run directly, `bun test`), bash for hooks and tracker scripts,
`gh` for the tracker.

**Spec:** `docs/spec.md`

## Global constraints

- No runtime dependencies in `package.json`.
- The installer never edits text outside its marked block, never drops existing hooks, and
  refuses to overwrite a settings file it cannot parse.
- Re-running `install` produces no diff.
- Playbooks carry the rules themselves; superpowers, ponytail and graphify are accelerators,
  never prerequisites.
- Generated files are in English.

## Files

```
package.json                  name, bin
src/cli.ts                    argument parsing, prompts, output
src/install.ts                install(), doctor(), upsertBlock(), mergeHooks()
src/install.test.ts
src/block.md                  the block written into CLAUDE.md / AGENTS.md
skill/ava/SKILL.md            router and always-on rules
skill/ava/reference/          init, intake, milestone, issue, review, status, anti-slop
skill/ava/reviewers/          requirements, slop, compliance (prompt bodies, no frontmatter)
skill/ava/templates/          PROGRESS.md, IMPLEMENTATION_PLAN.md, project-section.md
skill/ava/scripts/            block-rm-rf.sh, verify-on-stop.sh, labels.sh, board.sh
skill/ava/scripts/hooks.test.ts
README.md
```

## Interfaces

```ts
type Provider = "claude-code" | "codex";
type Run = (cmd: string[], cwd: string) => boolean;          // true when exit code is 0
interface Options { providers: Provider[]; extras: string[] }

upsertBlock(existing: string, block: string): string
mergeHooks(settings: Record<string, any>, skillDir: string): Record<string, any>
install(dir: string, opts: Options, run: Run, home?: string): string[]   // notes for the user
doctor(dir: string, home?: string): { ok: boolean; label: string }[]
```

`run` is the only seam: tests pass a recorder so nothing is downloaded.

## Tasks

### 1. Installer core

- [ ] Tests first, in `src/install.test.ts`:
  - `upsertBlock`: empty file; appended after existing text; replaces an existing block and
    keeps the text before and after it; applying twice equals applying once.
  - `mergeHooks`: empty settings; unrelated hooks and unrelated keys survive; applying twice
    adds nothing.
  - `install` claude-code into an empty directory: skill, three agents, hooks in
    `.claude/settings.json`, block in `CLAUDE.md`, `.ava/install.json`; nothing under
    `.agents`, `.codex`, no `AGENTS.md`; Impeccable requested with `--providers=claude`.
  - `install` codex: `.agents/skills/ava/SKILL.md`, `.codex/hooks.json`, `AGENTS.md`; nothing
    under `.claude`; Impeccable requested with `--providers=codex`.
  - Existing `CLAUDE.md` and `settings.json` content survives.
  - Second `install` leaves every file byte-identical.
  - Impeccable is not requested when it already exists in the project or in `home`.
  - An extra whose command fails yields a note containing the command to run by hand.
  - Unparseable `settings.json` throws and the file is unchanged.
  - `doctor` fails on an empty directory and passes its install checks after `install`.
- [ ] Run `bun test` — fails (module missing).
- [ ] Write `src/install.ts`, `src/block.md`, `package.json`.
- [ ] Run `bun test` — passes.
- [ ] Write `src/cli.ts`: `install`, `doctor`, `--provider`, `--extras`, `--yes`, prompts via
  `prompt()` only when a flag is missing and stdin is a terminal.
- [ ] Commit.

### 2. Hook scripts

- [ ] Tests first, in `skill/ava/scripts/hooks.test.ts`, spawning `bash`:
  - `block-rm-rf.sh`: exit 2 on `rm -rf x` and `rm -fr x`; exit 0 on `rm x` and `trash x`.
  - `verify-on-stop.sh`: exit 0 without `.ava/verify.sh`; exit 2 with the output on stderr
    when it fails; exit 0 when it passes; exit 0 when `stop_hook_active` is true.
- [ ] Write the two scripts. `verify-on-stop.sh` changes to the project root (four levels
  above its own directory) before running `.ava/verify.sh`.
- [ ] Run `bun test`. Commit.

### 3. The skill

- [ ] `SKILL.md`, the seven playbooks, three reviewers, three templates.
- [ ] `labels.sh` (idempotent label creation) and `board.sh` (the Decens board script without
  the hard-coded owner, repository or Python).
- [ ] Read every playbook against `reference/anti-slop.md`. Commit.

### 4. README

- [ ] Install, the six commands, what lands in the project, update, uninstall. Commit.

### 5. End to end

- [ ] `bunx` from a git URL of the local repository into a scratch empty project and a
  scratch existing project; `doctor` on both.
- [ ] First turn of `/ava init` and `/ava status` in a scratch project through a headless
  agent session; read the transcript.
- [ ] Record what was and was not verified.

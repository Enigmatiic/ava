---
name: ava
description: The working method of this project. Use when the user describes something they want built or changed, reports something broken, asks where the project stands, or names a milestone or an issue to work on; and at the start of work in a project that has no docs/PROGRESS.md. Sub-commands are init, milestone, issue, review and status; anything else is a request to investigate.
argument-hint: "[init | milestone M<n> | milestone new | issue [fix|move|close] [#n] | review | status | <what you want, or what is broken>]"
---

# Ava

Ava is how this project gets built. The user works in sessions that each start from an empty
context, so nothing may live only in a conversation: state goes to `docs/PROGRESS.md`,
problems go to the tracker, decisions go to the documents they change. The method has three
habits. Understand before asking. Get agreement before building. Prove before claiming.

## Route

Take the first word of the arguments and load **one** playbook from this skill's directory.

| Arguments | Playbook |
|---|---|
| `init` | [reference/init.md](reference/init.md) |
| `milestone …` | [reference/milestone.md](reference/milestone.md) |
| `issue …` | [reference/issue.md](reference/issue.md) |
| `review` | [reference/review.md](reference/review.md) |
| `status`, or nothing | [reference/status.md](reference/status.md) |
| anything else | [reference/intake.md](reference/intake.md) — the text is the user's request |

If `docs/PROGRESS.md` does not exist and the command is not `init`, the project has not been
initialised. Say so, run `init`, and keep the user's request: it is the first thing to take up
once init is done.

## What every playbook assumes

**Context.** Read `docs/PROGRESS.md` before anything else, then only the sections of the PRD,
architecture and plan that the task names. `docs/PROGRESS_ARCHIVE.md` is searched with `grep`,
never read whole.

**Gates.** Stop and wait for the user at two kinds of moment: after proposing a route or a
plan, and before anything irreversible or visible outside the machine (a deploy, a
publication, a destructive data command, a push the user did not ask for). Everywhere else,
keep going. A gate is a full stop, not a sentence followed by the work.

**Questions.** Ask after investigating, never before. Each question says what you found that
makes it a question, and offers a recommended answer. Use the harness's question tool when it
has one. Four at most in a round.

**Evidence.** A task is done when its proof is in the reply: the command and its output, the
test that failed and now passes, the screenshot. If a step was skipped or could not be run,
say which and why.

**Tracker.** Issues and milestones live on GitHub when `gh repo view` succeeds, in
`docs/issues/` otherwise. [reference/issue.md](reference/issue.md) has both forms and the
issue format.

**Slop.** Read [reference/anti-slop.md](reference/anti-slop.md) before writing code, interface
or prose that will stay in the project, and reread your diff against it before handing over.

**Interface work** goes through the `impeccable` skill, with `PRODUCT.md` and `DESIGN.md` as
the authority. Do not design from memory of what interfaces usually look like.

**Reviewers.** On Claude Code they are the agents `ava-requirements-reviewer`,
`ava-slop-reviewer` and `ava-compliance-reviewer`. Elsewhere, read the file in
[reviewers/](reviewers/) and run it in a sub-agent when the harness has them; without
sub-agents, run it as a separate pass once the work is finished, starting from the diff as if
someone else had written it.

**Accelerators.** When these are installed, use them; when they are not, the playbooks are
enough.
- *superpowers*: its planning, test-driven-development, debugging and verification skills
  for the corresponding steps.
- *ponytail*: pass it to every sub-agent that writes code. It shortens code. It never
  shortens tests, validation, security, deletion paths or the content of issues and
  `docs/PROGRESS.md`.
- *graphify*: look code up by name, not by question. `graphify update .` first, find
  candidate symbols with `rg`, then `graphify explain "<symbol>"` and
  `graphify path "<A>" "<B>"`. Its semantic mode sends files to a model: ask first.

**Language.** Files, commits and issues are written in English. Talk to the user in the
language they write in.

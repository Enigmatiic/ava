# Init

`init` turns a directory into a project this method can run: the product is written down, the
design system is decided, the work is cut into milestones, the checks that guard every turn
are in place, and the tracker is ready. Every project starts here, an empty one included.

Init changes no product code, not even a one-line fix for a failing test. Problems found
along the way become issues in step 8, and `M0` fixes them, run as its own command. Keeping
the two apart is what lets the user read the baseline before anything moves.

## 1. Preflight

- **Already initialised?** If `docs/PROGRESS.md` exists, do not overwrite anything. Report
  what differs between the documents and the code, and ask what the user wants refreshed.
- **Git.** If the directory is not a repository, run `git init` and say so.
- **Tracker.** `gh repo view` succeeds → GitHub mode. Otherwise local mode
  (`docs/issues/`); tell the user they can move to GitHub later without losing anything.
- **Impeccable.** If the `impeccable` skill is not available, stop and give the command:
  `bunx impeccable install --project`. Step 5 depends on it.

## 2. Empty or existing

The project is **existing** if it contains source code or a dependency manifest. Otherwise it
is **empty**. Go to 3A or 3B.

## 3A. Existing project: read before you ask

Learn everything the repository and the running product can tell you. The user's time is for
what only they know.

Read, roughly in this order:

- `README`, any `CLAUDE.md` / `AGENTS.md`, everything under `docs/`.
- Dependency manifests and lockfiles: language, framework, package manager, versions.
- The directory tree and the entry points: what the components are and how they talk.
- Tests and CI configuration: what is checked, and how it is run.
- Build, release and deploy configuration: where it ships, and how.
- `git log` (the last few dozen commits, the contributors, the pace) and open branches.
- Open issues and pull requests, in GitHub mode.
- The product itself. Follow the URL, the store listing or the run command, start it, and
  walk its main path. Screenshot what you see.
- The existing look: theme files, tokens, stylesheets, component library, a few real screens.

Then **run the checks** the project already has (install, type check, lint, tests, build) and
record each result exactly. A red baseline is a finding, not something to fix now.

In a large repository, split this reading across sub-agents by area and keep only their
conclusions.

Give the user a brief of what you found, short enough to read in a minute:

- what the product is and who uses it, as far as the evidence shows;
- the stack and how to run, test and ship it;
- the state of health: which checks pass, which fail, with the output;
- what looks risky, unfinished or contradictory, each with its `file:line`;
- what you could not determine.

Mark every statement you inferred rather than verified.

Then go to step 4.

## 3B. Empty project: interview

Ask in rounds, and follow up where an answer is vague. Do not move on with a guess.

1. **What is it, and for whom?** The one job it does for that person. If the user gives a
   feature list, ask which single thing would make it worth opening.
2. **Where does it run?** Phone, browser, desktop, terminal, server. Which platforms first.
3. **What is in the first usable version**, and what is explicitly later.
4. **What constrains it?** Deadlines, money, app-store rules, personal data, payments, a team,
   an existing brand.
5. **What already exists?** Accounts and services already created, a domain, designs, a
   repository to borrow from.
6. **Stack.** Propose one, with the reason for each choice, or take theirs. Prefer what the
   user already runs elsewhere over what is fashionable.

Then go to step 5.

## 4. Questions, for an existing project

Ask only what the repository could not answer, and tie each question to a finding.

- Where is this going next? What should be true in a few months that is not true now?
- What hurts today? Which bugs, which slowness, which part nobody dares touch?
- What must not change? Public contracts, data, a design the users are used to.
- For each contradiction in the brief, which side is right?
- Who else works on it, and what does a release require?

## 5. Design system

Skip this step if the product has no interface (a library, a service, most command-line
tools), and record that in `docs/PROGRESS.md`.

Otherwise the design system is established with `impeccable`, not written by hand:

1. Run **`impeccable init`** to capture the product context in `PRODUCT.md`. Feed it what
   steps 3 and 4 already established rather than asking the user again.
2. **Existing interface:** run **`impeccable document`** to produce `DESIGN.md` from the
   code as it is, then **`impeccable extract`** if tokens and components are scattered. The
   point is to describe the incumbent look faithfully. A redesign is a separate decision:
   offer it if the audit suggests one, do not slip it in.
3. **No interface yet:** run **`impeccable shape`** for the first surface, so that a visual
   direction is chosen and written to `DESIGN.md` before any screen is coded.

`PRODUCT.md` and `DESIGN.md` are then the authority for every interface task.

## 6. Proposal — stop here

Show the user what you are about to write, and wait for their agreement:

- the product in three lines;
- the rules that may never be broken (see step 7), each in one sentence;
- the milestones, one line each, in order;
- the commands that will guard every turn, and how the product will be run live;
- the tracker mode, and whether a compliance document is needed.

Revise until they agree. Write nothing before that.

## 7. Write the project down

If the project already has a document that does one of these jobs under another name, keep
it, point to it, and do not write a duplicate.

**`docs/PRD.md`** — the problem, the users, the product rules, and the requirements. Group
requirements by area and give each an ID (`AUTH-1`, `FEED-3`). Each one is a sentence that
can be checked: "the user can…", "the system never…". End with what is out of scope. For an
existing project, cover what the product does today at the level a newcomer needs in order
not to break it, mark those `shipped`, then add what is planned. Do not catalogue every
screen.

**Product rules** — the few constraints that outrank any single feature ("every listed item
can actually be bought", "no personal data reaches a third party without consent"). Name them
`P1`, `P2`… and say where each is enforced. Three good ones are better than ten.

**`docs/ARCHITECTURE.md`** — components, data model, external services, and the decisions
with their reasons. For an existing project, describe what the code does, with file
references, and mark what you inferred.

**`docs/IMPLEMENTATION_PLAN.md`** — from
[templates/IMPLEMENTATION_PLAN.md](../templates/IMPLEMENTATION_PLAN.md). Milestones are
ordered by dependency. Every "Done when" item can be checked by a command, a test or a live
step.
- New project: `M0` is the skeleton running end to end, with the checks green.
- Existing project: `M0` is the baseline. The checks are green, every known defect is filed,
  and the documents match the code.

**`docs/PROGRESS.md`** — from [templates/PROGRESS.md](../templates/PROGRESS.md).

**`docs/COMPLIANCE.md`** — only when the product ships through an app store, handles
personal data or takes payments. List the rules that apply, each with an ID (`CMP-1`) and the
place it is enforced. The compliance reviewer runs only when this file exists.

**The instruction file** (`CLAUDE.md` or `AGENTS.md`) — fill
[templates/project-section.md](../templates/project-section.md) and put it **above** the
`ava` block, never inside it: the block is rewritten on every update. Keep whatever the user
already had there.

**`.ava/verify.sh`** — the fast checks: type check, lint, unit tests. It runs at the end of
every turn that changed a file, so it must finish in about two minutes; slower suites stay in
the milestone's verify step. It contains only checks that pass today. Each check that fails
today becomes a `severity:high` issue on `M0`, and joins the script when it is fixed. Run the
script once and keep its output.

**`.gitignore`** — make sure secrets (`.env*`) and build output are ignored, and `graphify-out/`
when graphify is installed.
`.ava/` is committed.

## 8. Tracker

GitHub mode:

1. Labels: `bash scripts/labels.sh <area> <area>…`, from this skill's directory, with the
   areas of this project.
2. One GitHub milestone per plan milestone, titled exactly as in the plan:
   `gh api repos/{owner}/{repo}/milestones -f title="M0 — <name>" -f description="<goal>"`.
3. One `epic` issue per milestone: the deliverables as a checklist.
4. One issue for each problem found in step 3, in the format of
   [issue.md](issue.md), on the milestone where it will be fixed.
5. Offer the project board: `bash scripts/board.sh`, from this skill's directory. It needs a
   scope only the user can grant (`gh auth refresh -s project`).

Local mode: the same issues as files under `docs/issues/`. No epic files: the plan's "Done
when" lists sit in the same repository and already do that job.

## 9. Close

Commit (`chore(ava): initialise workflow`). Do not push unless asked.

Report: the files written, the baseline with its real output, the issues opened, what is
waiting on the user (credentials, decisions, content only they have), and the next command,
normally `/ava milestone M0`.

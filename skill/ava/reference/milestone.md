# Milestone

- `milestone new <description>` adds a milestone to the plan.
- `milestone M<n>` runs milestone `M<n>` of `docs/IMPLEMENTATION_PLAN.md` from plan to
  closing report.

## New milestone

1. If the description has not been through [intake](intake.md), run intake first. A
   milestone is written from an agreed request, not from a first message.
2. Write its section in `docs/IMPLEMENTATION_PLAN.md`, in the shape of the template: goal,
   requirements covered, dependencies, scope, "Done when". Each "Done when" item names the
   command, test or live step that checks it. New requirements get their ID in `docs/PRD.md`.
3. Give it the next free number. Place it by dependency; never renumber existing milestones,
   because issues and commits refer to them.
4. Tracker: create the milestone and its `epic` issue ([issue.md](issue.md)).
5. Add its row to the state table in `docs/PROGRESS.md`. Show the section to the user and
   commit.

## Run a milestone

### 1. Load context

Read `docs/PROGRESS.md`, then the milestone's section of the plan, then only the PRD,
architecture and compliance sections it references.

If an earlier milestone has unticked items, stop and tell the user — unless
`docs/PROGRESS.md` records that they were deferred on purpose, in which case say so and carry
on.

Work on a branch (`m<n>-<short-name>`) unless the project's conventions say otherwise.

### 2. Plan — stop here

Write `docs/plans/M<n>.md`: small tasks, each with the files it touches, the test that proves
it, and the requirement IDs it covers.

For each task, name the existing code it reuses, and justify in one line every new file,
dependency and abstraction. A plan that adds a helper the codebase already has is wrong.
Compliance, validation and deletion paths are never the part that is simplified away.

Interface tasks name the screen, its states (empty, loading, error) and the `impeccable`
command that will shape it.

Then stop and wait for approval. No code before it.

### 3. Implement

Task by task, test first: write the failing test, watch it fail for the right reason, write
the least code that passes it, commit with the requirement IDs in the message.

When tasks are independent and the harness has sub-agents, give each task to one. Its brief
contains the task, the project rules from the instruction file, and
[anti-slop.md](anti-slop.md). It builds nothing for a later milestone.

Interface work goes through `impeccable` and `DESIGN.md`.

### 4. Verify

Run `.ava/verify.sh` and the slower suites listed under Commands in the instruction file.
Show the output as it came, not a description of it.

### 5. Run it live

A green suite does not show that the product works. Whenever the milestone changes something
a user sees or calls, run the real thing, following "Running it live" in the instruction
file:

- Walk the path the milestone added, start to finish, as a user would.
- Capture every step — a screenshot for an interface, the transcript for a command line or
  an API — and look at each capture. A tap that misses lands on another control and looks
  like nothing happened; a blank frame means the app did not start.
- Keep the final captures in `docs/evidence/M<n>/`. The milestone is not done until the last
  one shows the state the milestone promised.
- Never enter real personal data. Ask the user which test account to use.
- If a path could not be exercised, say so plainly, and why.

For a library, the live run is a small consumer program, executed for real.

### 6. Review

Run [review.md](review.md) on the milestone's diff. Open an issue for every finding. Fix now
the ones that affect correctness or a requirement, and close them with the commit and how
you verified. The rest stay open, labelled, and are placed in step 7.

### 7. Settle the checklist

Tick the "Done when" items that have evidence, and the delivered lines of the `epic`. Then
deal with everything left. **Nothing this milestone could not do or check may stay parked on
it.**

- **Unticked items.** Do not tick them and do not drop them. Under a `### Deferred` heading in the milestone's
  section of the plan, say why each is deferred and which milestone will tick it, and give that milestone a matching checklist
  item. A box only one side knows about is a box nobody ticks.
- **Open issues still on this milestone.** Move each to where it becomes actionable. Blocked
  on a later deliverable → that milestone. Tooling, CI, measurement → Hardening, the
  plan's last milestone. Needs the user's data, credentials or judgement → the milestone where they will
  have the chance, labelled `blocked:user`.
- **Say why on every issue you move**, in one or two sentences: what makes it impossible
  here, and what has to exist first.
- **If the work is in fact finished, close the issue with evidence** rather than moving it.
- **Update the `epic`**: where each piece of its work went, read back from the tracker, not
  from memory. Close it if everything landed.

### 8. Close

Update `docs/PROGRESS.md`: the state table, each decision that changed the plan (one dated
line), new traps, the verification baseline, and what is waiting on the user. The next
session starts from an empty context; what is not in that file is lost.

Keep it under about 3,000 words (`wc -w docs/PROGRESS.md`): reduce this milestone to a few
lines and append the narrative to the end of `docs/PROGRESS_ARCHIVE.md`.

Commit. Then report: what was built, the evidence (output and captures), what was deferred
and where, and what the user has to do by hand.

## Things that go wrong

- Creating a new cloud project, database or application when the instruction file lists one
  already provisioned. Link the existing one.
- Asking the user to paste a secret. Tell them which variable to set, and where.
- Inventing data the user has to supply (their content, their photos, their accounts). Build
  what you can, then hand over.
- Ticking a box because the code was written. The box is ticked when the check has passed.

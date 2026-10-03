# Issue

Every problem found while working gets an issue: a bug, a compliance gap, a shortcut taken, a
dead end, something deferred. The open list is the backlog, and it is only a backlog if each
item is short, sits where someone will reach it, and is closed only with proof.

- `issue <description>` — create one.
- `issue fix #<n>` — fix one, end to end.
- `issue move #<n> M<k>` — re-home one.
- `issue close #<n>` — close one with evidence.

## Format

About ten lines. Plain sentences. No account of how the investigation went.

```markdown
**Severity:** high — <the concrete consequence, not an adjective>
**Where:** `path/to/file.ts:41` · <requirement ID when one applies>
**What:** <the symptom, and how it was found. One or two sentences.>
**Fix plan:**
1. <step someone else could act on>
2. <at most about four>
**Status:** <open: what it is blocked on> | <fixed in abc1234; verified by …>
```

Title: the symptom or the gap, under about 70 characters, no prefix.

Labels: one `severity:critical|high|medium|low`, one `area:<name>`, plus `compliance`,
`privacy`, `tech-debt`, `blocked:user` or `epic` as they apply.

| Severity | Means |
|---|---|
| critical | Data loss, a security hole, or the product cannot be used. |
| high | A requirement is broken, or a release is blocked. |
| medium | Wrong or missing behaviour with a workaround. |
| low | Polish, cleanup, a minor inconsistency. |

**The milestone is where the fix will happen, not where the problem was found.**

## Tracker

**GitHub mode** (`gh repo view` succeeds):

```bash
gh issue create --title "<title>" --body "<body>" --label "severity:high,area:<name>" --milestone "<exact title>"
gh issue edit <n> --milestone "<exact title>"
gh issue comment <n> --body "<why>"
gh issue close <n> --comment "Fixed in <sha>. Verified by <how>."
gh api repos/{owner}/{repo}/milestones -f title="M3 — <name>" -f description="<goal>"
```

**Local mode** (no GitHub remote): one file per issue, `docs/issues/<NNN>-<short-name>.md`,
numbered from `001`, with the same body under this header:

```markdown
---
title: <title>
severity: high
area: <name>
labels: []
milestone: M3
status: open
---
```

Moving an issue changes `milestone` and adds a dated line saying why. Closing sets
`status: closed` and fills the Status line. List the backlog with
`grep -l "^status: open" docs/issues/*.md`.

When the project later gets a GitHub repository, create each open file with `gh issue create`
and replace the file's body with a link to the issue.

## Create

Check that it is not already filed (`gh issue list --search "<words>"`, or `grep` in
`docs/issues/`). Write it in the format above. Assign the milestone where it will be fixed.

## Fix

1. **Reproduce.** Run the failing path and keep the output. If [intake](intake.md) already
   did, reuse it.
2. **Cause.** Trace back to the first wrong value. List every caller of the code you are
   about to change.
3. **Failing test.** Write the test that fails because of the bug, and watch it fail for
   that reason.
4. **Fix** at the place every affected caller passes through. The smallest change that makes
   the test pass.
5. **Verify.** The new test, then `.ava/verify.sh`. If the bug was visible to a user, run the
   product and confirm it there too.
6. **Commit** with `Closes #<n>` and the requirement ID.
7. **Close** with the commit and how it was verified. An issue closed without evidence is
   worse than one left open.

If the fix turns out not to be small or safe, stop, record what you learned on the issue, and
go back to the user with the new size.

## Move

The moment it is clear that something cannot be done or checked where it sits — it needs
infrastructure that does not exist yet, the user's data, credentials or a decision — move it.
Change the milestone, comment why in one or two sentences, update the `epic` it left, and if
the receiving milestone's plan does not already cover the work, give it a checklist item.

## Close

Only with evidence: the commit, or the `file:line` that settles it, and how you checked.

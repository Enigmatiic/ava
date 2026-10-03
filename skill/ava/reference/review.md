# Review

Review the current change before it is called done. The author of a change is the worst
person to judge it, so each pass below starts from the diff, without the reasoning that
produced it.

## 1. The diff

On a branch: `git diff $(git merge-base HEAD <default-branch>)...HEAD`. On the default
branch: `git diff HEAD`, plus untracked files. If there is no diff, say so and stop.

## 2. The passes

Run them in parallel when the harness has sub-agents. Give each the diff, never your
conclusions about it.

| Pass | Checks | When |
|---|---|---|
| Requirements — [reviewers/requirements.md](../reviewers/requirements.md) | "Done when" items, requirement IDs, product rules, scope | always |
| Slop — [reviewers/slop.md](../reviewers/slop.md) | code nobody needed, generic interface, filler prose, unproven claims | always |
| Compliance — [reviewers/compliance.md](../reviewers/compliance.md) | `docs/COMPLIANCE.md`, privacy rules | the file exists and the diff touches auth, personal data, AI calls, deletion, payments, links, permissions or release config |
| Correctness | the harness's own code review, if it has one | always |
| Interface | `impeccable` — its detector on the changed files, then `audit` | the diff touches an interface |
| Over-engineering | `ponytail-review`, if installed | the diff adds files, dependencies or abstractions |

## 3. Findings

- Check each finding against the code before acting on it. A reviewer can be wrong.
- Open an issue for every finding that survives ([issue.md](issue.md)).
- Fix now what affects correctness, a requirement or compliance, and close with the commit
  and how you verified.
- Leave the rest open, labelled, on the milestone where it will be done.
- Apply a simplification only if the tests stay green. A piece of flexibility the plan
  justified stays, with a comment naming its limit.

## 4. Report

One line per finding: severity, `file:line`, what, and its state (fixed in `<sha>`, or issue
`#<n>`). If the passes found nothing, say that, and say which passes ran.

# Status

Answer "where are we?" in under a screen. This command reads; it changes nothing.

Gather:

- `docs/PROGRESS.md`: the state table, what is waiting on the user, the last decisions.
- `docs/IMPLEMENTATION_PLAN.md`: the first milestone with unticked "Done when" items.
- The tracker: open issues grouped by milestone, `severity:critical` and `severity:high`
  first, and everything labelled `blocked:user`.
  `gh issue list --state open --limit 200 --json number,title,labels,milestone`, or
  `grep -l "^status: open" docs/issues/*.md`.
- `git status` and `git log -5 --oneline`: uncommitted work, and the branch.

Report:

1. **Now** — the current milestone, and how many of its "Done when" items are ticked.
2. **Waiting on you** — each thing only the user can do, with its issue.
3. **Open** — issue counts by milestone, and the critical and high ones by title.
4. **Next** — the one command to run.

Then name any disagreement between the sources: a box ticked while its issue is open, an
issue on a milestone that is closed, a `docs/PROGRESS.md` older than the last commits. Do not
repair it here; say it, and offer the command that would.

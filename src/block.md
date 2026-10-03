<!-- ava:start (managed by Ava; edits inside this block are lost on update) -->
## Ava workflow

This project is run with the `ava` skill. Invoke it as `/ava <command>` (Codex: `$ava <command>`).

| When | Command |
|---|---|
| `docs/PROGRESS.md` does not exist yet | `init` |
| The user wants something, or reports something broken | `<the request, in their words>` |
| Building a planned milestone | `milestone M<n>` |
| One issue: create, fix, move, close | `issue` |
| Before calling a change done | `review` |
| "Where are we?" | `status` |

These rules hold in every session, whether or not the skill is loaded:

- **Read `docs/PROGRESS.md` first.** The plan says what was intended; that file says what is true.
- **Investigate before asking, ask before building.** Questions come after reading the code or reproducing the bug, and only the ones the repository cannot answer. No code before the user approves the route.
- **Evidence, or it is not done.** A finished task shows the test output, the command output or the screenshot. Anything a user sees or touches is run live, not only tested.
- **Every problem found becomes an issue**: severity and why, where, what, fix plan, status. It is closed only with the commit and how the fix was verified.
- **The smallest change that meets the requirement.** Reuse what exists; justify each new file, dependency and abstraction in one line. Tests, validation, security and deletion paths are never what gets cut.
- **No slop.** The skill's `reference/anti-slop.md` applies to code, interface and prose.
- Delete with `trash`, never `rm -rf`. Secrets are never requested in chat, printed or committed.
<!-- ava:end -->

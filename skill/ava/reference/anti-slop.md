# Anti-slop

Slop is output that looks like work and is not. It was produced because that is what usually
appears in such a place, not because this project needed it. One test covers code, interface
and prose:

> If this were deleted, would anyone miss it? Could it have been written by someone who knew
> nothing about this project?

When nobody would miss it, or when it would fit any project unchanged, remove it.

## Code

- **Code nobody asked for.** Options and flags without a caller, configuration for a value
  that never changes, an interface with one implementation, a wrapper that only forwards,
  scaffolding "for later". Later can build its own.
- **Rewriting what exists.** Before writing a helper, search this repository, the standard
  library and the installed dependencies. A new dependency for a few lines is the same
  mistake in the other direction.
- **Defensive noise.** A `try/catch` that swallows the error or rethrows it unchanged. A null
  check on a value the types already guarantee. A fallback that returns a default when a call
  fails, which turns a visible failure into a silent wrong answer. Validate where untrusted
  data enters; let internal errors surface.
- **Comments that restate or narrate.** `// increment the counter`, `// now we handle the
  new case`, `// fixed the bug where…`, section banners. A comment gives a reason or a
  constraint the code cannot show. The story of the change belongs in the commit.
- **Tests that prove nothing.** Assertions on a mock's own return value, snapshots of
  everything, tests that mirror the implementation line by line, tests written afterwards and
  never seen failing. A test counts once it has failed for the right reason.
- **Invented facts.** An API, a flag, a package name or a file path recalled from memory.
  Check the installed version's documentation or source before using it.
- **Fake content in product paths.** Lorem ipsum, sample users, a function that returns a
  canned success, a `TODO` where a branch should be. If the real data must come from the
  user, stop and ask for it.
- **Symptom patches.** A special case for the reported input. Find every caller of the
  function you are about to edit and fix the shared path once.
- **Ignoring the neighbours.** A second naming style, a second way to do something the
  codebase already does one way, a second library for a job one already does.
- **Leftovers.** Debug logging, commented-out code, unused imports and parameters, files
  named `*_new`, `*_v2`, `final`.

## Interface

`impeccable` owns interface quality; use it rather than this list. These hold regardless:

- `DESIGN.md` is the authority. Colours, type, spacing and radii come from its tokens, never
  from values typed in place.
- Run Impeccable's detector on every changed interface file and fix what it reports.
- The familiar defaults are the tells: a purple-to-blue gradient, glass panels, every block
  a rounded card with a shadow, emoji standing in for icons, a centred hero above three
  feature cards, even spacing with no hierarchy. If the screen could belong to any product,
  it is not designed yet.
- Every screen has its empty, loading, error and offline states, and is checked with real
  content at real lengths.
- Platform conventions win over invention: native navigation, safe areas, system pickers.
- Contrast, labels, focus order and touch-target size are part of the work, not a pass at the
  end.
- Interface copy says what the thing does in the user's words. An error says what happened
  and what to do next. No "Oops!", no "Something went wrong", no exclamation marks, no
  "seamless".

## Prose

Documents, issues, commit messages, pull-request descriptions and replies to the user.

- **Lead with the point.** No preamble, no closing recap, no offer of further help.
- **Specific beats general.** A number, a `file:line`, a command, a date. Not "improves
  performance" but "list render 480 ms → 90 ms on 1,000 rows (`bench/list.ts`)".
- **No filler vocabulary.** Comprehensive, robust, seamless, powerful, leverage, streamline,
  cutting-edge, crucial, delve. If the sentence survives without the word, drop the word; if
  it does not survive, it said nothing.
- **No marketing voice in technical writing**, and no emoji in documents, issues, commits or
  code.
- **Say once what was verified and what was not.** Stacked hedges ("should probably mostly")
  hide which it is.
- **Structure only where the content has it.** No headings on five lines, no bullets for
  reasoning, no bold scattered for emphasis.
- **Documents state what is true now.** History goes to the archive and to git. Do not create
  a file nobody asked for: no `SUMMARY.md`, no `CHANGES.md`, no report next to the code.
- **Commit messages** say what changed and why, with the requirement ID. They do not narrate
  the session.
- **Length is a budget.** An issue is about ten lines. `docs/PROGRESS.md` stays under about
  3,000 words.

## Claims

- "Should work" and "tests pass" with no output shown. Show the command and its result.
- "Done" with a step skipped. Name the step.
- A ticked box with no evidence behind it.
- A summary more confident than what was actually run.

## Before handing over

Reread the whole diff as the person who has to maintain it. Delete what fails the test at the
top of this file. Then say what you removed, in one line.

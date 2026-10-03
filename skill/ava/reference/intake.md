# Intake

The user has said what they want, or what is broken. Their first message is rarely the whole
request: it is what they could say before anyone had looked. The order below exists so that
your questions come after you have looked, when they can be precise, and so that nothing is
built on a guess.

**State → investigate → ask → agree → build.** Never reorder.

## 1. State

Say back, in one sentence, what you understood, and what kind of request it is: a **bug**
(something behaves differently from what was intended), a **feature** (something new), a
**change** (something existing should work differently), or a **question**.

Ask nothing yet, unless the message cannot be understood at all. A question is answered from
the code and stops here.

## 2. Investigate

Read `docs/PROGRESS.md` first: the request may already be known, deferred or decided against.

**Bug.**
1. Reproduce it. Run the failing path yourself: the command, the test, the app. Keep the
   exact output or a screenshot. If you cannot reproduce it, that is the first thing to
   report, with what you tried.
2. Find the cause, not the place where it shows. Follow the data backwards from the symptom
   to the first wrong value.
3. Find every caller of the code you would change. A fix that covers only the reported path
   leaves the same bug in the others.
4. Check when it started (`git log -S`, `git bisect` when it is cheap). A recent commit often
   explains the intent that was broken.

**Feature or change.**
1. Find what already exists that does part of it: a component, a query, a similar feature.
   That is what the work extends.
2. Read the requirements and product rules it touches. Note any it would contradict.
3. For interface work, read `PRODUCT.md` and `DESIGN.md`, and look at the neighbouring
   screens as they really are.
4. Work out two or three ways to do it. For each: what it reuses, what it adds, what it
   costs, what it cannot do. Pick the one you would recommend.
5. List what the request leaves undecided: the cases, the limits, the states the user did not
   mention.

## 3. Ask

Report what you found in a few lines, then ask.

A question earns its place only if the answer changes what gets built. Each one names the
finding behind it and comes with the answer you would choose.

| Generic, asked too early | Sharpened by the investigation |
|---|---|
| "What format should the export use?" | "Invoices already export as CSV (`src/export/csv.ts`). Same columns for orders, or does your accountant need others? I would reuse them." |
| "Can you describe the bug?" | "The total is wrong only when a discount and a refund fall on the same order: the refund is applied before the discount (`orders/total.ts:41`). Is 'discount first' the rule everywhere, including past invoices?" |
| "Should it be fast?" | "The list loads every row; at your current 12,000 rows that is 3 s. Paginate at 50, or keep everything and virtualise? Pagination is the smaller change." |

Do not ask what the code already answers, and do not ask for a preference where the product
rules already decide.

If an answer opens something new, go back to step 2 for that part before continuing.

## 4. Agree — stop here

Write the request back as it now stands:

- **Will do** — the behaviour, in the user's terms.
- **Will not do** — what was considered and left out.
- **Done when** — how it will be checked.
- **Route** — one of the following, with its size.

| Route | When |
|---|---|
| **Fix now** | Small, safe, inside the current scope. It still gets an issue first, so the reason and the evidence are recorded. |
| **Issue for later** | It belongs to another milestone, or is blocked on something. |
| **Add to a milestone** | It fits a milestone already planned: a checklist item there, and an issue. |
| **New milestone** | Several tasks with their own "Done when". |
| **Not doing** | It already exists, or it contradicts a product rule. Say which. |

If the request adds or changes a requirement, the route includes updating `docs/PRD.md` with
its ID.

Wait for the user's agreement. Something trivial and unambiguous (a typo, a label) still gets
this step; it is one line and a yes.

## 5. Build

- Fix now, or an issue → [issue.md](issue.md).
- A milestone → [milestone.md](milestone.md).

When the work is done, close the loop in `docs/PROGRESS.md` if anything a later session needs
has changed: a decision, a trap, something now waiting on the user.

# <Project name>

<Two or three sentences: what the product is, who uses it, and what stage it is at.>

## Read before coding

1. `docs/PROGRESS.md` — where things actually stand. Read it first.
2. `docs/PRD.md` — what to build (requirement IDs such as `AUTH-1`).
3. `docs/ARCHITECTURE.md` — how it is built, and why.
4. `docs/IMPLEMENTATION_PLAN.md` — milestone order and "Done when" checklists.
5. `PRODUCT.md`, `DESIGN.md` — the product context and the design system. <Remove if the product has no interface.>
6. `docs/COMPLIANCE.md` — the rules every feature must meet. <Remove if the file does not exist.>

## Product rules

Never broken, whatever the task.

- **P1 — <name>.** <The rule, and where it is enforced.>

## Stack

- `<path>`: <what lives there, built with what>.

## Commands

```bash
<install>
<run in development>
<test>
<type check and lint>
<build or deploy>
```

<Anything about these commands that is not obvious, with the reason.>

## Running it live

<How to start the real product and drive it as a user: simulator, browser or terminal; which
test account; where captures are kept (`docs/evidence/`). Never enter real personal data.>

## Conventions

- <Where business logic lives, naming, how strings and configuration are handled.>
- Reference requirement IDs in commit messages and test names.
- Tests are written with the feature; a milestone is not done without them.

## Privacy and safety

- <What is never logged, never committed, never sent to a third party.>
- Delete with `trash`, never `rm -rf`.
- <Commands that must not be run without asking: production deploys, destructive data commands.>

## Accounts already provisioned

- <Service>: <the existing project or application to link; never create another>.
- Secrets live in <where>. They are never requested in chat, printed or committed.

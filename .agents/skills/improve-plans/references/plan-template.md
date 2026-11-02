# Plan template

Every plan is written for an executor with no context: it has not seen the audit, the other plans or this conversation, and it may be a smaller model. Three properties make that work. The plan carries its own context (paths, excerpts, conventions, commands). Every step ends in a command with an expected result, so the executor never judges success by feel. Boundaries and stop conditions are explicit, so reality that differs from the plan ends in a report, not an improvisation. Structure adapted from shadcn/improve (MIT).

Files: `plans/NNN-short-slug.md`, numbered in execution order, checked by `node assets/check-plans.mjs plans`.

## The file

````markdown
# Plan NNN: <imperative title: what is true afterwards>

> **Executor**: follow the steps in order. Run each verification command and confirm the
> expected result before the next step. On any STOP condition, stop and report; do not
> improvise. When done, update your row in `plans/README.md`, unless a reviewer told you
> they maintain the index. Do not push or open a pull request unless told to.
>
> **Drift check (run first)**: `git diff --stat <planned-at commit>..HEAD -- <in-scope paths>`.
> If an in-scope file changed, compare the "Current state" excerpts with the live code.
> A mismatch is a STOP condition.

## Status

- **Priority**: P1 | P2 | P3
- **Effort**: S | M | L
- **Risk**: LOW | MED | HIGH
- **Depends on**: none | 001, 002
- **Category**: bug | security | perf | tests | tech-debt | migration | dx | docs | direction | ui
- **Planned at**: commit `abc1234`, YYYY-MM-DD

## Why this matters

Two to five sentences: the problem, its concrete cost, what improves. Intent lets the executor make a correct call when a detail is off.

## Current state

Facts inlined, never "as discussed":

- each relevant file with one line on its role
- short excerpts with `file:line` markers, enough to confirm it is the right code
- the conventions that apply, with one exemplar file to match
- vocabulary or design constraints from the repository's own documents, quoted

## Commands you will need

| Purpose | Command | Expected on success |
| :--- | :--- | :--- |
| Verify everything | `npm run verify` | exit 0 |
| One test file | `npm test -- orders` | all pass |

(Taken from the repository during recon, not guessed.)

## Scope

**In scope** (the only files you may change):
- `src/orders/api.ts`
- `src/orders/api.test.ts` (create)

**Out of scope** (do not touch, although they look related):
- `src/orders/legacy-api.ts` - scheduled for deletion; v1 clients still use it
- any change to the public response shape

## Steps

### Step 1: <imperative title>

What to do, naming exact files and symbols. Show the target shape when it matters.

**Verify**: `<command>` → <expected output>

### Step 2: <title>

Order steps so the code is never broken between them (add the new path, switch callers, remove the old path).

**Verify**: `<command>` → <expected output>

## Test plan

Tests to write, where, and which cases: the happy path, the regression this plan fixes, named edge cases. Which existing test to copy the structure from. The command and the expected count.

## Done criteria

All must hold, each a command with an expected result:

- [ ] `npm run verify` exits 0
- [ ] new tests for <behaviour> exist and pass
- [ ] `grep -rn "<old pattern>" src/` finds nothing
- [ ] `git status --short` shows only in-scope files

## STOP conditions

- The code at the cited locations does not match the excerpts.
- A step's verification fails twice after a reasonable fix.
- The fix needs an out-of-scope file.
- <the key assumption of this plan> turns out to be false.

## Maintenance notes

What later changes will interact with this, what a reviewer should read closely, and any follow-up deliberately left out with the reason.
````

## The index: `plans/README.md`

```markdown
# Implementation plans

Written YYYY-MM-DD. Execute in this order unless the dependencies say otherwise.

| Plan | Title | Priority | Effort | Depends on | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| 001 | ... | P1 | S | — | TODO |
| 002 | ... | P1 | M | 001 | TODO |

Status: TODO, IN PROGRESS, DONE, BLOCKED (with a one-line reason), REJECTED (with a one-line reason).

## Dependency notes
- 002 needs 001 because <reason>.

## Considered and rejected
- <finding>: not worth doing because <one line>.
```

The checker reads the table: the first column is the number, the last two are "Depends on" and "Status".

## Quality bar before handing a plan over

- Could a model that has never seen this repository execute it with only the plan and the repository?
- Is every check a command with an expected result, not "make sure it works"?
- Does each step name exact files and symbols?
- Do the STOP conditions describe this plan's real risks, not boilerplate?
- Would a reviewer reading only "Why this matters" and "Done criteria" know what they approve?
- No secret value anywhere; the commit stamp is filled; the in-scope paths match the drift check.
- Does it fit one executor session? If not, split it. For a plan that becomes a story, keep done criteria to eight or fewer.

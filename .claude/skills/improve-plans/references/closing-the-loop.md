# Closing the loop: execute, reconcile, issues

An advisor's job continues after the plans are written. The founding rule stays: the advisor never edits source. In `execute`, a separate executor edits code in an isolated worktree, and the advisor dispatches, reviews and records. Adapted from shadcn/improve (MIT).

## `execute <plan>`

Preconditions, all checked first:

- The repository is under Git and the user approved executing this plan ([AGENTS.md](../../../../AGENTS.md) non-negotiable 13).
- The plan's dependencies are DONE in the index.
- The drift check shows nothing, or the plan was refreshed first. Never hand an executor a stale plan.

Dispatch one executor (a sub-agent or a fresh session) in its own worktree ([git-worktrees](../../git-worktrees/SKILL.md)). Put the whole plan text in the prompt: a worktree holds only committed files, so an uncommitted `plans/` folder is invisible to it. Tell the executor to follow the steps, run every verification, stay in scope, stop on a STOP condition, commit by the repository's convention with only the owner's identity ([08-git-workflow](../../../rules/08-git-workflow.md) section 2), leave the index to the reviewer, and report in this shape:

```text
STATUS:           COMPLETE | STOPPED
STEPS:            per step: done or skipped, and the verification result
STOPPED BECAUSE:  (if stopped) which condition and what was seen
FILES CHANGED:    list
NOTES:            deviations, surprises, judgement calls
```

Fresh worktrees share history but not dependencies or build output: the executor installs first, and checks that read build output may need one build.

### Review

Review as a lead reviews a pull request against the plan. The advisor fixes nothing.

1. Re-run every done criterion in the worktree. The executor's report is a claim, not evidence.
2. Compare `git diff --stat` with the in-scope list. A file outside it fails the review.
3. Read the whole diff against "Why this matters" and the repository conventions the plan names.
4. Read what the new tests assert. A test that asserts nothing passes any test command and proves nothing.

### Verdict

| Verdict | When | Then |
| :--- | :--- | :--- |
| APPROVE | criteria pass, scope is clean, quality holds | mark DONE; give the user the summary, the worktree and branch; merging is the user's decision |
| REVISE | fixable gaps | send specific feedback to the same executor ("criterion 3 fails: ..."), then review again; stop after two rounds |
| BLOCK | a STOP condition, an unrecoverable scope violation, or rounds used up | mark BLOCKED with the reason, refine the plan with what was learned, tell the user |

A documented deviation is judged on merit: an executor that met a real obstacle and said so is not wrong, a silent one is.

## `reconcile`

Read the index and every plan, then by status:

- **DONE**: spot-check the cheap criteria on the current HEAD. Keep the file; it is the record.
- **BLOCKED**: read the reason, look at the obstacle in the code, and either rewrite the plan around it (a new number if the approach changed) or reject it.
- **IN PROGRESS** and stale: tell the user. An executor probably stopped mid-run; check its worktree.
- **TODO**: run `node assets/check-plans.mjs plans --drift`. If a plan drifted, confirm the finding still exists (it may have been fixed in passing), then refresh the excerpts and the commit stamp, or reject it.

End with a short report: verified done, refreshed, rejected, and what can run now.

## Publishing plans as issues (only when the user asks)

1. `gh auth status` must succeed and the repository must have a GitHub remote; otherwise write the files and say why issues were skipped.
2. Check visibility with `gh repo view --json visibility`. In a public repository issues are public: warn the user and get explicit confirmation before publishing a plan that describes a vulnerability.
3. Show the titles, confirm once, then `gh issue create --title "<title>" --body-file <plan>` per plan.
4. Record each issue URL in the plan. The plan file remains the source of truth; the issue is distribution.

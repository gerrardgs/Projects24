---
name: systematic-debugging
description: Find and fix the root cause of bugs, crashes, wrong output, flaky tests, performance regressions and production incidents through reproduction, isolation, evidence and regression tests instead of guessing. Use when something fails, behaves unexpectedly, is slow, or when a user reports an error message or stack trace, including browser, layout, CSS, hydration, CORS and works-locally-but-not-deployed bugs.
license: MIT
metadata:
  version: "1.0.0"
---

# Systematic Debugging

Debugging is the scientific method applied to code: observe, hypothesise, test, conclude. Never change code hoping it helps. Debuggers, profilers and bisection commands per language are in [references/tools.md](references/tools.md). Browser and front-end debugging (DevTools, hydration errors, CORS, layout and CSS bugs, deploy-only bugs) is in [references/browser-debugging.md](references/browser-debugging.md).

## 1. Capture the facts

- The exact error message, stack trace, logs, inputs, and expected versus actual behaviour.
- The environment: versions of runtime, OS, dependencies, and configuration; what changed recently (deploys, dependency updates, data, traffic).
- Read the stack trace from the first frame **in this project's code**. The bug is usually there, not in the library that raised.

## 2. Reproduce

- Turn the report into a reproduction you can run on demand, ideally an automated failing test ([test-engineering](../test-engineering/SKILL.md)).
- Shrink it: remove inputs, steps and code until removing anything else makes the failure disappear.
- If it does not reproduce, compare environments (versions, configuration, data, timing, concurrency) and add targeted logging. Do not "fix" what you cannot observe.

## 3. Isolate

Use one technique at a time:

- **Binary search in code**: check the state at the midpoint of the data flow, then halve the search space.
- **Binary search in history**: `git bisect` between a known-good and a known-bad commit, automated with a test script.
- **Binary search in input**: halve the failing input until it is minimal.
- **Differential**: compare a working case with a failing one and list every difference (input, configuration, version, environment).
- **Inspect**: a debugger with breakpoints, or temporary structured logs at the boundaries of the suspected component.

## 4. Hypothesise and prove

- State one hypothesis that explains **all** the symptoms: "The cache returns stale data because the key omits the tenant ID."
- Design a check that would disprove it, and run it. Keep notes of what you tried and what you saw.
- Stop when the evidence shows the cause. "It works now" without knowing why is not a root cause.

## 5. Fix the root cause

- Fix the cause, not the symptom. A `try/catch` that hides the error, a `sleep` that hides a race, or a null check that hides bad data are not fixes.
- Look for the same defect elsewhere: other callers, similar code, the same pattern.
- Keep the fix minimal. Refactor separately.

## 6. Prevent the regression

- Keep the reproduction as a permanent test, and confirm it failed before the fix and passes after it.
- Remove temporary debug logging and breakpoints before committing.
- If the bug reached production, add the monitoring or alert that would have caught it earlier.

## 7. When a fix fails or you were wrong: correct the thinking, not only the code

A failed fix, a test that still fails, or the user saying "that's wrong" is evidence about your reasoning. Treat it the way you treat a failing test.

1. **Stop.** Do not try another variation of the same idea, and do not stack a second fix on the first. Undo the unproven change (it is yours, from this task) so the code is back to the last known state.
2. **Say what you believed.** Write down the assumptions behind the failed attempt: what you thought the cause was, what you thought the code, data, versions or user meant.
3. **Find the one that broke.** Check each assumption against evidence (read the code, run the reproduction, print the value, re-read the request). Name the wrong one plainly: "I assumed the API returns UTC; it returns local time."
4. **Re-plan from the corrected model.** Form a new hypothesis that explains every symptom, including why the first attempt failed, then continue from section 4.
5. **When the user corrects you, restate their correction in your own words and confirm it before changing code.** Do not defend the earlier answer, and do not over-correct into an unrequested rewrite.
6. **Report the correction** in the task report: what you assumed, what was true, and what you changed because of it. If the same kind of mistake repeats, propose a rule, a test or a check that would catch it.

## Special cases

### Flaky tests and race conditions
Run the test many times; vary parallelism and ordering; use race detectors (`go test -race`, ThreadSanitizer). Look for shared mutable state, unawaited async work, time and order dependence.

### Performance problems
Measure before changing anything: reproduce with a benchmark or load test, profile (CPU, memory, I/O, locks), fix the largest measured cost first, and re-measure with the same method. Report before and after numbers.

### Memory leaks
Compare heap snapshots taken over time under steady load; look for collections that only grow, listeners never removed, caches without limits, and closures holding large objects.

### Production incidents
1. **Mitigate first**: roll back, disable the feature flag, scale up, or fail over. Restore service before full diagnosis.
2. Preserve evidence: logs, metrics, traces, and the versions deployed.
3. Diagnose with the steps above on a copy or in staging. Never experiment on production data.
4. Write a blameless post-incident review: timeline, root cause, contributing factors, and follow-up actions with owners.

## Report

```text
Symptom:     <what failed, with the error message>
Root cause:  <the defect and the evidence that proves it>
Fix:         <what changed and why it addresses the cause>
Regression:  <test added; failed before, passes after>
Verified:    <commands run and results>
```

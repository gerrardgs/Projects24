---
trigger: always_on
description: "Clean execution: how an agent carries out any design or front-end task - predictable, minimal, verified step by step, reversible, and leaving no mess behind in the repository, the browser, the design file or the machine."
---

# R-15: Clean Execution

Clean code ([02-clean-code](02-clean-code.md)) is about what the result looks like. Clean execution is about how the work is done: **predictable, minimal, verified, reversible, and leaving no mess.** Both are required. This rule matches R-09 of Projects 23, with additions for design and front-end work.

## 1. Before acting

- Understand the request and read the code, configuration, design source and commands involved ([AGENTS.md](../../AGENTS.md) section 3).
- Run the baseline first (build, tests, lint) so you know which failures were already there.
- Plan the smallest change that solves it. For multi-step work, write the steps and the check that proves each one, in the form `1. <step> -> verify: <check>`.
- **Goal-driven execution**: turn the task into a goal you can check, then loop until the check passes. "Fix the bug" becomes "write a test that reproduces it, then make it pass"; "add validation" becomes "write tests for invalid input, then make them pass"; "refactor X" becomes "tests pass before and after". A weak goal ("make it work") needs clarifying before you start.
- Prefer a preview: dry-run flags (`--dry-run`, `--check`, `plan`, `diff`, `-WhatIf`), a scratch copy, a branch or duplicate of a design file, or a test, before the real action.

## 2. While acting

- One logical change at a time; verify it (build, lint, type-check, test, or run and look at the rendered page) before the next one.
- Use the project's own commands and versions (`npm ci`, `npx --no-install <tool>`, the scripts in `package.json`), not global installs or remembered ones.
- Commands are idempotent where possible: running them twice must not duplicate data or break state.
- Touch only what the task needs. No drive-by reformatting, renames, restyling or "improvements" ([01-core-principles](01-core-principles.md) section 1).
- Regenerate derived files with their generator after changing sources (lockfiles, the `.claude/skills/` mirror, token CSS, `_headers` and `vercel.json`, generated code); never edit generated output by hand.
- No irreversible or outward-facing action (deleting, force-pushing, migrating shared data, deploying, publishing a site, writing to a shared Figma or Penpot file, posting, sending messages) without explicit approval.

## 3. When something fails

- Stop at the first unexpected result. Read the actual error; do not retry the same thing blindly or stack guesses.
- Find the root cause ([systematic-debugging](../skills/systematic-debugging/SKILL.md)); never hide a failure by deleting a check, skipping a test, loosening a lint or accessibility rule, or catching and ignoring the error.
- If a step left partial changes, roll them back or state exactly what remains.

## 4. Leave no mess

- Temporary files (screenshots, reports, exports, probe pages, scratch scripts) go in a temporary or scratch directory and are removed when no longer needed; nothing temporary lands in the repository or in a shared design file.
- Stop dev servers, watchers, headless browsers and background processes you started.
- Remove the debug output, `console.log` calls, temporary styles and outlines, commented-out code and stray artefacts that *you* added during the task before finishing. Anything that existed before the task stays unless the user approved its removal ([01-core-principles](01-core-principles.md) section 8).
- Do not change global configuration, shell profiles, system packages, browser profiles or credentials unless that is the task.
- Finish with a clean, explainable working tree: every changed file is intended and listed in the report, and `git status` shows nothing else.

## 5. Tools and scripts you write

- Exit code `0` on success and non-zero on failure; errors to standard error with a clear message.
- Safe defaults: preview or confirmation for destructive operations, no secrets in output, timeouts on network calls.
- Validate input at the boundary (arguments, environment variables, files, API responses) before acting on it ([05-error-handling](05-error-handling.md)).
- Behave well in pipelines and automation: no interactive prompts in non-interactive mode, handle a closed output pipe and interruption without crashing or leaving partial state.

## 6. Report

State what was changed, which commands ran and what they returned, what was not done, and any state left behind (running services, open preview deployments, pending migrations, follow-ups), using the format in [AGENTS.md](../../AGENTS.md) section 7.

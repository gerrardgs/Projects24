---
trigger: always_on
description: "Core engineering principles for every coding task: scope discipline, simplicity, completeness, and respect for the existing codebase."
---

# R-01: Core Engineering Principles

## 1. Solve the stated problem, nothing more

- Do what was asked. Do not add features, options, abstractions or "improvements" that were not requested. Mention them as suggestions instead.
- Keep diffs focused. Do not rename, reformat or reorganise code you were not asked to touch. Unrelated changes hide the real change in review.
- If the request is ambiguous and the choice matters, ask. If it does not matter much, choose the conventional option and say which one you chose.

## 2. Simplicity (KISS, YAGNI)

- Write the most direct code that is correct. Concrete code first; extract an abstraction only when a second real use appears, or when it removes real duplication of *knowledge*, not merely of similar-looking lines.
- Prefer flat control flow: guard clauses and early returns instead of deep `if/else` nesting. Aim for nesting depth of 3 or less.
- Keep one level of abstraction per function. Orchestration code calls well-named helpers; it does not mix in byte-level or string-buffer details.
- Prefer the platform's standard library and the project's existing dependencies before adding new ones (see [04-dependencies](04-dependencies.md)).

## 3. Completeness

- Code presented as done must compile, run and handle its error paths.
- Not allowed in finished work: placeholder comments (`// TODO: implement`), elided bodies (`...` used as "rest omitted"), stubbed returns, fake data standing in for real logic, or catch-all handlers that hide failures.
- Legitimate exceptions: `pass` / `...` where the language requires an empty body by design (abstract methods, `Protocol` members, type stubs), and spread or rest syntax. Judge by intent, not by the characters.
- When you show only part of a file, say which part is omitted and why. Never let a partial snippet look like a complete file.

## 4. Work with the codebase, not against it

- Existing conventions win over personal or "best practice" preferences, unless they cause a bug or a security issue. In that case, flag it and ask before changing it widely.
- Reuse existing helpers, types, error classes, logging, configuration and test utilities. Search before writing a new one.
- Keep architecture boundaries the project already has: layers, modules, packages, public APIs.

## 5. Separate decisions from effects

- Keep business rules, validation and calculations in pure functions that take inputs and return outputs. They are easy to test without mocks.
- Keep I/O (network, disk, database, clock, randomness, environment) at the edges and pass results in. This makes behaviour deterministic and testable.
- Apply this pragmatically. A 20-line script does not need layers.

## 6. Make it work, make it right, then make it fast

- Correctness first, then clarity, then performance.
- Optimise only with evidence: a benchmark or profile that shows the hot path. Record the before and after numbers.
- Choose sensible algorithms from the start (avoid accidental O(n²) on unbounded input). That is correctness at scale, not premature optimisation.

## 7. Leave a trail

- Explain *why* in comments, commit messages and PR descriptions; the code already shows *what*.
- Record significant design decisions (new dependency, new service, data model change) in a short decision record (ADR) when the project keeps them.

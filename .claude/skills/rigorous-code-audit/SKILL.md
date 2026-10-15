---
name: rigorous-code-audit
description: Systematically review a diff, pull request or codebase for correctness bugs, security vulnerabilities, reliability problems, missing tests and maintainability issues, verifying each finding before reporting it. Use when asked to review, audit or check code, before merging or releasing, or before refactoring unfamiliar code.
license: MIT
metadata:
  version: "2.0.0"
---

# Rigorous Code Audit

A review is only useful if its findings are **real, ranked and actionable**. Run the toolchain first, then read the code with a checklist, then verify every finding before you report it.

## 1. Set the scope

- **Diff review** (PR or local change): `git diff <base>...HEAD`, plus enough surrounding code to understand each change. Also check callers of changed functions.
- **Codebase audit**: start from entry points (HTTP routes, CLI `main`, queue consumers, scheduled jobs) and trust boundaries (where external data enters).
- Note the stack, runtime version and existing tooling from the manifests before judging anything.

## 2. Run the automated checks (use the project's own commands first)

| Ecosystem | Format | Lint / static analysis | Types | Tests |
| :--- | :--- | :--- | :--- | :--- |
| JS / TS | `npx --no-install prettier --check .` or `npx --no-install biome check .` | `npx --no-install eslint .` | `npx --no-install tsc --noEmit` | `npm test` |
| Python | `ruff format --check .` | `ruff check .` | `mypy --strict <pkg>` or `pyright` | `pytest` or `python -m unittest` |
| Go | `gofmt -l .` (no output means clean) | `go vet ./...`, `staticcheck ./...` or `golangci-lint run` | (compiler) | `go test -race ./...` |
| Rust | `cargo fmt --check` | `cargo clippy --all-targets --all-features -- -D warnings` | (compiler) | `cargo test` |
| Java / Kotlin | Spotless or ktlint, if configured | `mvn verify` / `./gradlew check` | (compiler) | same |
| C# / .NET | `dotnet format --verify-no-changes` | `dotnet build -warnaserror` | (compiler) | `dotnet test` |

Then run the dependency vulnerability audit listed in [04-dependencies](../../rules/04-dependencies.md). For secret scanning, SAST and container scanning commands, see the [security-hardening tools reference](../security-hardening/references/tools.md).

Use `npx --no-install` (or the script in `package.json`) for local tools. A bare `npx tsc` in a project without TypeScript installed offers to download the npm package named `tsc`, which is "a deprecated release of the TypeScript compiler", not the current one.

Record each command and its result. A tool that cannot run (not installed, broken config) is itself a finding.

## 3. Read the code against this checklist

### Correctness
- Does the code do what the requirement or PR description says? Check every branch, including the `else` and default cases.
- Boundaries: empty collections, zero, negative numbers, maximum values, off-by-one, Unicode and multi-byte text, time zones and DST, floating-point money (use integer minor units or decimal types).
- Null, undefined and `None` handling; unchecked casts; ignored return values and errors.
- State: invariants maintained after every mutation; no stale caches; idempotency where retries can happen.

### Security (OWASP Top 10:2025)
- **A01 Broken Access Control**: every endpoint and object access checks authorisation server-side (IDOR, missing ownership checks, path traversal).
- **A02 Security Misconfiguration**: debug mode, default credentials, permissive CORS, verbose errors, missing security headers.
- **A03 Software Supply Chain Failures**: new or unpinned dependencies, unverified package names, missing lockfile, untrusted build steps.
- **A04 Cryptographic Failures**: hand-rolled crypto, weak algorithms (MD5 or SHA-1 for security, ECB mode), secrets in code, plaintext sensitive data, non-constant-time secret comparison.
- **A05 Injection**: SQL or NoSQL built by string concatenation, shell commands with user input, template injection, XSS from unescaped output, unsafe deserialisation.
- **A06 Insecure Design**: missing rate limits, abuse cases not considered, trust in client-side checks.
- **A07 Authentication Failures**: weak password storage (use Argon2id, scrypt or bcrypt), session fixation, missing MFA hooks where required, tokens without expiry.
- **A08 Software or Data Integrity Failures**: unsigned updates or artifacts, deserialising untrusted data, CI that runs untrusted code with secrets.
- **A09 Security Logging and Alerting Failures**: security events not logged, or secrets and personal data logged.
- **A10 Mishandling of Exceptional Conditions**: fail-open error paths, swallowed exceptions, crashes on malformed input, inconsistent state after partial failure.

### Reliability
- Every network or disk call has a timeout and a handled failure path; retries are bounded and only for idempotent operations.
- Resources (files, sockets, connections, locks, timers) are released on all paths.
- Concurrency: shared mutable state is protected; no unawaited promises or leaked goroutines and tasks; no check-then-act races.
- Unbounded growth: queues, caches, in-memory collections, request sizes.

### Tests
- New or changed behaviour has tests that would fail without the change.
- Failure paths and boundaries are tested, not only the happy path.
- Tests are deterministic (no real network, time or randomness without control) and assert behaviour, not implementation details.

### Maintainability
- Follows [02-clean-code](../../rules/02-clean-code.md) and the project's conventions; no dead code, debug output or unexplained suppressions.
- Placeholder scan: `rg -n "TODO|FIXME|XXX|HACK|NotImplementedError|not implemented"` (or `grep -rnE` with the same pattern). Judge each hit in context: `...` and `pass` are often legitimate syntax.

## 4. Verify before reporting

For each candidate finding:

1. Trace the actual code path from input to the problem. Read the called functions; do not assume what they do.
2. Construct a concrete failing scenario: specific input, state, result. Write a failing test or a reproduction when feasible.
3. Drop it if you cannot build a plausible scenario, or label it **unconfirmed** if it is still worth raising.
4. Do not report style preferences as bugs. Do not report issues the linter already enforces unless the linter is not running.

## 5. Report

Order findings by severity, most severe first. One entry per finding:

```text
[Severity] path/to/file.ext:LINE: one-sentence statement of the defect
  Scenario: concrete input/state → wrong result or impact
  Fix:      the specific change recommended
  Status:   confirmed (test/repro) | unconfirmed (reasoning only)
```

Severity guide:

- **Critical**: exploitable security flaw, data loss or corruption, or an outage in a core path.
- **High**: wrong results in normal use, or a security weakness that needs specific conditions.
- **Medium**: an edge-case bug, a missing timeout or limit, or an important missing test.
- **Low**: maintainability or clarity problems that make future bugs likely.

Finish with the commands you ran and their results, and anything you could not check.

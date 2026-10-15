---
trigger: always_on
description: "Clean code standards: idiomatic naming per language, small focused functions, sound types, immutability, comments, and tool-enforced formatting."
---

# R-02: Clean Code Standards

Clean code is code that the next engineer can read, change and debug quickly. It looks native to its language: idiomatic Go looks like Go, idiomatic Python looks like Python.

## 1. Formatting is the tool's job

- Use the project's formatter and its configuration. Do not hand-format against it.
- Common defaults when starting fresh: Prettier or Biome (JS/TS), Ruff format or Black (Python), `gofmt`/`goimports` (Go), `rustfmt` (Rust), `dotnet format` (C#), `google-java-format` or `ktlint` (JVM), `clang-format` (C/C++).
- Add an `.editorconfig` so every editor agrees on indentation, line endings and final newlines.

## 2. Naming

- Names say what a thing *means* in the domain, not how it is stored: `unpaidInvoices`, not `list2`. Functions start with a verb (`parseHeader`, `calculateTax`). Booleans read as a question (`isExpired`, `hasAccess`, `canRetry`).
- **Follow the language's idioms**:
  - Go: short names in small scopes are idiomatic (`ctx context.Context`, `r *http.Request`, `w http.ResponseWriter`, `i`, `err`). Exported names are `PascalCase`. No `Get` prefix on getters. Package names are short and lowercase.
  - Python: `snake_case` for functions and variables, `PascalCase` for classes, `UPPER_SNAKE_CASE` for constants (PEP 8).
  - JS/TS: `camelCase` for values and functions, `PascalCase` for types and classes, `UPPER_SNAKE_CASE` only for true constants.
  - Rust: `snake_case` for items, `PascalCase` for types and traits, `SCREAMING_SNAKE_CASE` for constants.
  - Java/Kotlin/C#: follow the platform's official conventions.
- Avoid ambiguous abbreviations (`usr`, `tmp2`, `dataObj`). Well-known short names (`id`, `url`, `ctx`, `err`, `i`) are fine where they are conventional.
- Use one word per concept across the codebase. Do not mix `fetch`, `get` and `retrieve` for the same operation.

## 3. Functions and modules

- One function does one thing at one level of abstraction. If you need "and" to describe it, split it.
- Keep functions short enough to read without scrolling. Keep cyclomatic complexity at 10 or less (McCabe's original threshold). Linters can enforce it: ESLint `complexity`, Ruff `C901` (mccabe), `gocyclo` via golangci-lint; for Rust, Clippy's `cognitive_complexity` is a related but different metric.
- Prefer few parameters. Group related ones into a typed object or struct. Avoid boolean flag parameters that switch behaviour; write two functions instead.
- Return early on invalid input. Put the main path at the lowest indentation.
- Modules have high cohesion and a small public surface. Export only what callers need.

## 4. Types

- Use the strictest settings the project allows: TypeScript `strict: true`; Python type hints checked by mypy or Pyright; compiler warnings treated as errors in CI.
- TypeScript: avoid `any`. Use `unknown` and narrow it with type guards or a schema validator at the boundary. Avoid non-null assertions (`!`) and unchecked `as` casts.
- Python: annotate public functions; use `dataclasses`, `typing.Protocol`, `TypedDict` and `enum` to express structure.
- Go: use concrete types and small interfaces defined where they are consumed. Use generics with constraints from `cmp` (for example `cmp.Ordered`, Go 1.21+) or your own interface constraints, not `any` everywhere.
- Rust: avoid `unwrap()`/`expect()` on recoverable errors in library code; avoid `unsafe` unless required, and then document the invariants in a `// SAFETY:` comment.
- Make invalid states unrepresentable. Model alternatives with discriminated unions, enums or sum types instead of combinations of booleans:

```typescript
// Avoid: loading=true and error set at the same time is representable.
type Fetch<T> = { loading: boolean; error?: Error; data?: T };

// Prefer: exactly one state at a time.
type Fetch<T> =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; data: T }
  | { status: "error"; error: Error };
```

- Wrap primitive identifiers that are easily confused (`UserId` vs `OrderId`) in distinct types when the language makes it cheap: branded types in TS, `NewType` in Python, newtypes in Rust, named types in Go.

## 5. State and side effects

- Prefer immutable data: `const` and `readonly`/`Readonly<T>` (TS), `@dataclass(frozen=True)` (Python), `let` without `mut` (Rust), `final`/`val`/`record` (JVM).
- No hidden global mutable state. Pass dependencies explicitly (constructor or function parameters).
- Do not return internal mutable collections that callers can modify; return a copy or a read-only view.
- Concurrency: share by communicating, or protect shared state with the language's primitives (mutex, atomic, actor/channel). Every async operation is awaited or explicitly supervised.

## 6. Comments and documentation

- Comment *why*: constraints, trade-offs, workarounds with links to issues. Do not narrate what the code obviously does.
- Public APIs get doc comments in the language's format (JSDoc/TSDoc, docstrings, GoDoc, rustdoc, Javadoc/KDoc, XML docs).
- Delete commented-out code; version control remembers it.
- Keep comments true. A wrong comment is worse than none, so update comments with the code.

## 7. Code smells to fix when you touch them

Duplicated knowledge, long parameter lists, magic numbers and strings (name them), dead code, feature envy, deeply nested conditionals, broad `catch`/`except` clauses, mutable defaults (Python `def f(x=[])`), and stringly-typed data that should be a type.

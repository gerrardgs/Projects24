# Modern Swift: defaults and concurrency

How to write Swift the way the current language expects, with the concurrency model that changed in Swift 6.2. Adapted, in our own words, from the `write-swift` skill of [emilkowalski/skill](https://github.com/emilkowalski/skill) (MIT, commit `f1090be`, read 2026-11-04). That skill states a Swift 6.3 baseline and flags unreleased 6.4 features; verify the toolchain the project actually uses (`swift --version`, the Xcode release notes at [developer.apple.com](https://developer.apple.com/documentation/xcode-release-notes)) before relying on any feature here ([03-verification](../../../rules/03-verification.md)). Never assume a version.

The through-line: start with the simplest, most static, single-threaded thing that works, and move to something more dynamic only for a reason you can state.

| Need | Start with | Move on only when |
| :--- | :--- | :--- |
| Data | `struct`, `enum` | you need identity, sharing or inheritance |
| Abstraction | a concrete type | the same code repeats across types |
| Polymorphism | `some P` | you must store different types: `any P` |
| Execution | the main actor, synchronous | profiling shows a hang: `async`, then `@concurrent`, then an `actor` |
| Memory | `Array`, `String` | profiling shows the cost: `InlineArray`, `Span` |
| Safety | safe APIs | C interop or a measured hot path: `Unsafe*` |

## 1. Data and errors

- Default to value types; `class` only for identity, shared mutable state, inheritance or resource lifetime. `let` unless you mutate.
- A struct with a mutable reference-type property is neither a value nor a reference: copies share the object. Keep the referenced type immutable, or wrap it with copy-on-write (`isKnownUniquelyReferenced`).
- Model mutually exclusive state with an enum instead of a pile of optional properties, so invalid combinations cannot be written ([02-clean-code](../../../rules/02-clean-code.md) section 4). Noncopyable types (`~Copyable`) make "must not be used twice" a compile error.
- Recoverable failures `throw`; programmer mistakes use `precondition` or `fatalError`. Enums with associated values make good error types. `guard` for error conditions. Typed throws suit internal code; public APIs usually keep untyped `throws` so the error type can change. Force-unwrap only where you can state the invariant, preferably with a message.

## 2. Concurrency: stay single-threaded until profiling says otherwise

Order, without skipping steps: main actor and synchronous code; `async`/`await` to hide latency (the SDK offloads for you); `@concurrent` for your own expensive work, only after Instruments shows a hang; an `actor` to move state off the main actor, only when main-actor state forces constant hopping.

- Turn on Approachable Concurrency; for app and UI modules set Default Actor Isolation to MainActor (the default for new app projects in recent Xcode).
- In Swift 6.2, marking a function `async` does not move it off the current actor. `@concurrent` always switches to the thread pool; `nonisolated` runs where it is called from, the right default for library APIs.
- Profile before offloading; a task for trivial work costs more than it saves. One task per end-to-end operation.
- `await` is a suspension point and breaks atomicity: re-check assumptions after it, never hold a lock across it.
- Actors give mutual exclusion, not transactions. Mutate actor state in synchronous methods, keep async methods thin, and watch for check-then-`await`-then-write races (two tasks both miss the cache and both download). Actors are not first-in-first-out; use a task or an `AsyncStream` when order matters.

## 3. Sendable and data races

When the compiler reports a data race, work down this list: do not share it (a local copy per job fixes most cases); make it a `Sendable` value type; isolate it to an actor; only then use `Mutex` or `Atomic` from the `Synchronization` module or `@unchecked Sendable`. Model classes are usually better left non-`Sendable`. `@unchecked Sendable` and `nonisolated(unsafe)` are promises the compiler cannot check, not warning silencers. For globals, prefer a `let`, then `@MainActor`, then a `Mutex`. Public types are never inferred `Sendable`; marking one is a promise to your clients.

## 4. Structured concurrency

Prefer `async let` for a fixed number of children and task groups for a dynamic number (`withDiscardingTaskGroup` when children return nothing). `Task { }` only when the lifetime does not fit a scope; `Task.detached` almost never. Cancellation is cooperative: check `Task.isCancelled` or call `Task.checkCancellation()` before expensive work, and bound fan-out instead of one child per item. Bridge callbacks with `withCheckedContinuation` and resume exactly once on every path; adapt delegates with `AsyncStream`.

## 5. SwiftUI

`View` is main-actor isolated, so you rarely write `@MainActor` on a view or view model. Some SwiftUI code runs off the main thread on purpose (APIs with `@Sendable` closures: `visualEffect`, `Shape.path(in:)`, `Layout`, `onGeometryChange`). Action callbacks are synchronous so that a gesture's animation starts in the same frame; put the `withAnimation` state change there, not behind an `await`. Keep view logic synchronous and put state on the seam between the UI and async work.

## 6. Protocols and API design

Concrete types first, then notice repeated code, then a protocol, then generic code. A protocol with no per-type customisation is a wasted protocol. Prefer composition to inheritance, `some P` to `any P` until you must store different types, and note that a requirement is dynamically dispatched while a method only in an extension is statically dispatched. A forced downcast is a smell. Name for clarity at the point of use; no type prefixes in Swift-only APIs; drop a leading `get`.

## 7. Verify

Build with warnings as errors, run the unit tests with Swift Testing or XCTest, run Instruments for hangs before adding concurrency, and run the app on a device ([07-testing](../../../rules/07-testing.md)). Report what you built and ran, and what you could not check without a device or a newer toolchain.

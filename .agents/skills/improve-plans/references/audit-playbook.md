# Audit playbook

What to look for, by category. Give each audit pass the relevant section and the finding format at the end. Scale depth to the repository: a 2,000-line CLI gets a lighter pass than a monorepo. Categories and the finding format are adapted from shadcn/improve (MIT); the wording is this repository's.

A finding needs evidence. "Probably has N+1 queries" is a guess; "`orders/api.ts:142` runs one query per order item inside a loop" is a finding.

## 1. Correctness

The most trusted category: defects found by reading.

- Errors swallowed or only logged on critical paths; missing error states in UI code.
- Async hazards: promises not awaited, races on shared state, effects or listeners that are never cleaned up.
- Null flows: non-null assertions on values that can be null, unchecked indexing, optional chaining that hides a value which must exist.
- Boundaries: off-by-one, empty collections, time zone and locale assumptions, counters that can overflow.
- State: combinations the types allow but the domain forbids; `default:` branches that silently do nothing.
- Concurrency: check-then-act on shared resources, multi-step writes without a transaction, retried operations that are not idempotent (webhooks, queues).
- Escape hatches: clusters of `any`, casts and suppression comments, each a place the compiler was overruled.
- Leaks: handles, connections and subscriptions that are not closed on every path.

## 2. Security

Report only what code evidence supports, framed as maintenance: the pattern, the production impact, the remedy.

- **Never copy a secret value.** Name file, line and kind only, and recommend rotation.
- By design is not a finding: honouring proxy variables, reading the user's own configuration files, a local developer tool running configured commands.
- Credentials: hard-coded keys, committed environment files, secrets in logs or history stores.
- Interpreters: SQL or shell built from request data, HTML sinks fed with user content, dynamic code execution on input.
- Access control: routes or actions without a server-side identity check, authorisation only in the client, object access by id without an owner or tenant check, missing request authentication.
- Input contracts: request bodies trusted without a schema, uploads without type and size limits, whole request objects assigned into persistent models.
- Dependencies: run the ecosystem's audit command read-only; report critical or high advisories that reach runtime code or the shipped artifact.
- Production settings: broad CORS with credentials, missing hardening headers on sensitive browser surfaces, cookies without `HttpOnly`, `Secure` or `SameSite`.
- Data minimisation: personal data in logs, stack traces returned to clients.

## 3. Performance

Algorithmic and architectural wins, not micro-tuning.

- N+1 queries or fetches per item or per rendered row; missing batching.
- Wrong complexity: nested scans or repeated `find` in hot loops where a keyed lookup belongs.
- Caching gaps: identical expensive work per request or render; stable data fetched every time.
- Payload: over-fetching, unbounded lists without pagination, large JSON sent to clients.
- Front end: heavy dependencies for small jobs, no code splitting on rarely used routes, unoptimised images and fonts, client fetching of data available at render time. Do not report Core Web Vitals numbers you did not measure.
- Back end: work that belongs in a queue, indexes implied by query patterns (flag for verification; do not claim without the schema), a connection per request where pooling exists.
- Build and CI: missing caches, redundant steps, tests that could run in parallel.

## 4. Test coverage

The question is which untested code is dangerous, not a percentage.

- List the critical paths (money, authentication, data changes, the feature the repository exists for) and which have no or trivial tests.
- Files with high churn and no tests are the top refactor risk: start with characterisation tests.
- Test quality: tests that assert nothing, mocks that test themselves, snapshots nobody reads, flaky patterns (real clocks, real network, order dependence).
- Missing layers: unit tests only with no integration test on API boundaries, or slow end-to-end tests for what a unit test would catch.
- Is there one command that says whether the code works? If not, that is finding one.

## 5. Tech debt and architecture

- Knowledge duplicated in three or more places, and copies that drifted apart.
- Layer violations, import cycles, a "utils" folder everything imports.
- Dead code: unused modules, rolled-out flags still branching, commented-out blocks without a reason, unused dependencies.
- Oversized modules and functions that everything touches; long parameter lists; deep nesting.
- Three ways of fetching, handling errors or styling in one repository: pick the one the team converged on most recently and plan the move.
- Abstractions with one implementation, or a missing abstraction where one change always edits N files together.

## 6. Dependencies and migrations

- Major versions behind on the core framework or runtime where staying behind has a cost (end of life, no security fixes, ecosystem breaks). Check dates at [endoflife.date](https://endoflife.date/) and in the registry (`npm view <pkg> time`).
- Deprecated APIs with announced removal.
- Abandoned packages on critical paths; two packages solving one problem.
- Lockfile or version drift across a monorepo.
- Estimate the blast radius (files touched) of each migration; it decides whether it is worth recommending.

## 7. Developer experience and tooling

- Missing or broken type check, lint, formatter, hooks, editor config.
- Slow feedback: minutes to start tests, no watch mode, CI without caching.
- Onboarding: wrong or incomplete setup steps, undocumented environment variables, no `.env.example`.
- No `AGENTS.md` where agents will run the plans: recommend one and plan it.
- Logging that cannot be correlated, or debugging that needs code changes.

## 8. Documentation

Lowest default priority; flag only a concrete cost.

- A public package surface without reference documentation.
- A contested design decision nobody can reconstruct.
- Documentation that is wrong (worse than missing): setup steps or examples that no longer work.

## 9. Direction: what to build next

Forward-looking and optional. **Every suggestion cites repository evidence;** one that would fit any project in the category is filler.

- Unfinished intent: TODO clusters on one theme, flags never rolled out, stubs, abandoned branches.
- Stated but undelivered: README or roadmap promises with no code, flags that do nothing.
- Asymmetries: export without import, create without bulk create, webhooks out but not in.
- The adjacent possible: a capability the current architecture makes cheap (an extension point one interface away).
- Friction users handle by hand around the project.

Impact for a direction finding is product value (who wants it, why now); confidence is how well the evidence supports it.

## 10. Design, accessibility and interface quality (this repository's addition)

Use it when the codebase ships a user interface. Same rule: evidence or silence.

- Accessibility: controls that are not native elements, missing accessible names, focus that is hidden, contrast and target sizes below [10-accessibility](../../../rules/10-accessibility.md), motion that ignores the reduced-motion setting.
- Design-system drift: hard-coded colours, sizes and spacing where tokens exist; two components doing one job; states (empty, loading, error, disabled) missing from a component.
- Slop: invented statistics, testimonials or logos, controls that do nothing, decoration with no purpose ([anti-slop-filter](../../anti-slop-filter/SKILL.md)).
- Performance of the interface: media without dimensions, a lazy hero image, render-blocking third-party scripts, layout shift. Report measured numbers only ([12-web-performance](../../../rules/12-web-performance.md)).
- Honest copy and ethics: dark patterns, confirm-shaming, copy that blames the user ([14-ux-writing-and-ethics](../../../rules/14-ux-writing-and-ethics.md)).

Category slug for findings: `UI`. In the plan Status block use `Category: ui`.

## Finding format

```markdown
### [CATEGORY-NN] Short imperative title

- **Evidence**: `path/file.ts:123` - what is there (2 to 5 strongest places; "and about N similar" when widespread)
- **Impact**: what goes wrong or what is paid, concretely ("every order list render issues 1+N queries")
- **Effort**: S (hours) / M (about a day) / L (several days), including tests
- **Risk**: LOW / MED / HIGH, and what the fix could break
- **Confidence**: HIGH (read it, certain) / MED (strong signal, needs checking) / LOW (smell; plan an investigation, not a fix)
- **Fix sketch**: one to three sentences, enough to judge the effort
```

## Prioritisation

Order by leverage: impact divided by effort, discounted by confidence and by the risk of the fix. Tiebreakers:

1. A finding that unblocks others (a verification baseline, characterisation tests) goes first.
2. A confident security finding beats an equal one elsewhere.
3. Prefer fixes with a clean verification story: executors succeed at those.
4. "Not worth doing" is a result. Write the one-line reason so nobody audits it again.

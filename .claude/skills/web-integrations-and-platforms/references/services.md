# Hosted services for a web project: Clerk, UploadThing, PostHog, Upstash, Better Stack

Integration notes for five services that often appear in modern web stacks. For each: what it is (as its own documentation says, read on 2026-11-05), the package and licence (looked up with `npm view` the same day), what to check before adopting, and what to do in the interface. Inclusion is not an endorsement, and no account was created or connected. Adopt each like any dependency ([04-dependencies](../../../rules/04-dependencies.md)): exact version, licence, data handling, cost, exit plan; record the choice in `docs/TECHSTACKS.md` and the licences in `docs/ASSETS.md`.

Common rules for all five:

- Keys, tokens and signing secrets live in the environment or a secret manager, never in client bundles or the repository ([20-secret-scanning](../../../rules/20-secret-scanning.md)). Anything shipped to a browser is public ([06-security](../../../rules/06-security.md)).
- Personal data sent to a service is a decision for the owner: purpose, region, retention, processor agreement, and an exit path (export and deletion).
- Webhooks from a service are untrusted input until their signature is verified, and handlers are idempotent.
- The service's own components are third-party code: check their accessibility, bundle weight and look, and put them behind your design tokens ([21-design-intelligence](../../../rules/21-design-intelligence.md) section 4).

## Clerk (authentication and user management)

- **What**: "full-stack authentication and user management with products such as Organizations, Billing, and more"; a hosted service managed through a dashboard. Package `@clerk/nextjs` MIT, 7.9.24.
- **Check**: what the service holds (credentials, sessions, profiles) and where; session verification on your server for every request, with authorisation decided server-side, never from client state; webhook signature verification; roles and organisation membership checked on the server; account recovery and deletion; lock-in (a migration of password hashes and users).
- **Interface**: sign-in, sign-up and recovery screens are among the most-used screens of a product; test them with keyboard, screen reader and 200 percent zoom, give errors that name the problem and the way out ([14-ux-writing-and-ethics](../../../rules/14-ux-writing-and-ethics.md)), and do not disable password managers or paste.
- **Not verified here**: the pricing, the token and JWT details, the data regions, because the pages read did not state them. Read the documentation for the version in use.
- Clerk's documentation suggests `npx clerk@latest init` and `npx skills add clerk/skills`: both download and run code. Read before running, and do not run them unasked ([21-design-intelligence](../../../rules/21-design-intelligence.md) section 5).

## UploadThing (file uploads)

- **What**: "the easiest way to add file uploads to your full stack TypeScript application" (its documentation landing page). Package `uploadthing` MIT, 7.7.4.
- **Check** in its documentation (the pages for file routes, authentication and security, and regions and ACLs were not read here): who can upload and read; file type and size limits enforced on the server, not only in the client; where files are stored and who can reach them; access by signed URL; deletion and retention.
- **Always**: treat every upload as untrusted: allow-list types by content, not by extension, limit size and count, scan where required, strip metadata (location in photos) from images you publish, never serve user uploads from your application's origin with script-executing types, and store user content separately from the application ([06-security](../../../rules/06-security.md) section 3).
- **Interface**: show progress, allow cancel and retry, name rejected files and the reason, support keyboard and screen readers (a drop zone needs a button alternative), and give images alternative text.

## PostHog (product analytics, session replay, feature flags)

- **What**: an analytics platform with product and web analytics, session replay, error tracking, feature flags, experiments, surveys and a warehouse. The repository is MIT except its `ee` directory; a purged `posthog-foss` exists; `posthog-js` is Apache-2.0 AND MIT, 1.445.5. Cloud has EU hosting. Its documentation says open-source deployments should scale to about 100,000 events a month and come without customer support.
- **Check**: whether analytics needs consent in your market and how the banner behaves ([web-integrations-and-platforms](../SKILL.md) section 7); the region (US or EU); what autocapture records (text typed into fields, URLs with identifiers); replay masking of inputs and sensitive elements (not stated on the page read; verify in its documentation); retention; deletion of a person's data on request.
- **Rules**: never send secrets, health or financial details, or free text from forms; use pseudonymous IDs; feature flags evaluated on the client are visible to users, so do not gate security on them; measure an experiment's effect with a stated hypothesis and sample, not by peeking ([ux-research-and-strategy](../../ux-research-and-strategy/SKILL.md)).
- An MCP server exists ([mcp-catalog](../../mcp-servers-and-integrations/references/mcp-catalog.md)); writes through it change production behaviour.

## Upstash (serverless Redis and related services)

- **What**: "a highly available, infinitely scalable Redis-compatible database" with a REST API "for edge and serverless runtimes where TCP is restricted"; other products exist (not read here). Package `@upstash/redis` MIT, 1.41.0.
- **Check**: its documentation says the token shown for a database "is also your database's password": keep it server-side, never in a bundle, and use the narrowest credentials the service offers; choose the primary region near the writes; understand consistency and durability for what you store (caches, sessions and rate limits are different risks than the only copy of data); cost per request.
- **Rules**: set expiry on cached and session data, never put personal data in keys, and handle the service being unavailable ([05-error-handling](../../../rules/05-error-handling.md)).

## Better Stack (uptime, incidents, status pages, logs, tracing)

- **What**: "an AI-native platform for on-call and incident response", covering uptime monitoring, incident management, status pages, log management and OpenTelemetry-native tracing (its documentation landing page). Client `@logtail/node` ISC, 0.5.12.
- **Check** (not stated on the page read): how data is ingested and with which tokens; retention and regions; what leaves your systems in logs.
- **Rules**: redact personal data and secrets before logs leave the process ([06-security](../../../rules/06-security.md) section 8); ingestion tokens are secrets; a public status page tells the truth about incidents in plain words and exposes no internal detail; alert on symptoms users feel, with an owner and a runbook ([resilience-and-chaos-engineering](../../resilience-and-chaos-engineering/SKILL.md)).

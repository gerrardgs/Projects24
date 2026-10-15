# Changelog

All notable changes to this project are documented here. The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and versions follow [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## 1.2.0: deployment, CI, security headers, tools catalog, prompt library (2026-10-15, stages 2 and 3 of the full audit)

### Added

- Skill `frontend-deployment`: hosting models and official docs for GitHub Pages, Netlify, Cloudflare Pages and Workers, Vercel, Firebase Hosting, AWS Amplify, Azure Static Web Apps, Render and container platforms; public versus secret configuration per framework prefix; security and caching headers; routing, domains and HTTPS; previews; monitoring; rollback.
- Skill `web-integrations-and-platforms`: headless CMS, WordPress block themes, Shopify themes and Hydrogen, Webflow and Framer, checkout UX, payments with hosted fields (small PCI scope), authentication UI and passkeys, HTML email, PWAs, technical SEO, third-party scripts, facades and consent.
- Security headers for the static site from one source (`security-headers.js`), rendered to `_headers` (Netlify, Cloudflare Pages; formats checked in their docs) and `vercel.json`; the dev server sends the same headers. Strict CSP without `unsafe-inline`; tests keep the files in sync.
- CI templates: `ci-frontend.yml` (checks, Playwright, Lighthouse CI), `lighthouserc.json` budgets, `deploy-github-pages.yml` with `configure-pages` v6.0.0, `upload-pages-artifact` v5.0.0, `deploy-pages` v5.0.1 and `upload-artifact` v7.0.2, all pinned to commit SHAs. actionlint and zizmor (auditor persona) clean.
- `axe-check` now also fails on console errors, so CSP violations are caught; a probe page with an inline script was detected.
- `systematic-debugging/references/browser-debugging.md`: DevTools, source maps, real devices, framework DevTools, agent browser access, and causes by symptom (hydration, CORS, stacking, overflow, deploy-only bugs, engine differences).
- `docs/TOOLKIT.md`: 320+ commonly used tools, libraries, platforms and services by phase, with official links (all checked), and rule 04 section 9, "Adopting any tool, framework, service or platform", so tools not listed are covered by procedure.
- `docs/PROMPT-LIBRARY.md`: ready-to-use prompts for about 25 scenarios, with notes per AI tool.
- Installer ships `docs/TOOLKIT.md` and `docs/PROMPT-LIBRARY.md`, which `AGENTS.md` links to.

### Changed

- Static site: the theme toggle reserves its space before JavaScript runs (Lighthouse had measured CLS 0.061 caused by it; now 0), and an SVG favicon removes a console 404. Lighthouse 12.6.1: 100 in all four categories. Tests: 13 → 18.
- `AGENTS.md`: indexes for the two new skills, pointers to the catalog and prompt library, and an operating condition for tools the spec does not mention. Operational manual: five more scenarios.
- README (restyled outside this session) corrected: CI status stated precisely (all 18 Validate jobs passed on GitHub for commit `7ff1512`; the changes in this release are verified locally and run in CI when pushed), the automated accessibility coverage figure now cites Deque's 57% study instead of an unsourced "30–50%", touch targets stated as 44 px with the 24 px WCAG minimum, "ISG" corrected to ISR, "eliminating hallucinations" reworded to "reduce", template verification stated precisely, counts updated to 27 skills.

## 1.1.0: Figma integration, mobile, agent capabilities (2026-10-15, stage 1 of the full audit)

### Added

- Skill `figma-integration`: file preparation for code generation, the Figma MCP server (remote and desktop, every documented tool, rate limits by seat), Code Connect (CLI, config, token scopes, seats), REST API tokens and scopes, plugins, widgets and Dev Mode codegen plugins, security, and the Penpot MCP server. Facts from Figma's developer docs on 2026-10-15.
- Template `figma-variables-sync`: converts `GET /v1/files/:file_key/variables/local` into DTCG 2025.10 token files per collection and mode. The fixture is type-checked against Figma's official `@figma/rest-api-spec` 0.44.0; 13 tests cover type mapping by scope, aliases, skipped values with reasons, name collisions, URL parsing, the API client (header, 403 and 429 handling, no token leakage) and a round trip through the design-tokens pipeline with a contrast check. CI job and Dependabot entry added.
- Skill `mobile-engineering`, adapted from the Projects 23 skill of the same name, with a mobile design layer (platform guidelines, touch targets, safe areas, dynamic type, size classes, dark mode, gestures, design tokens per platform). Extension IDs and versions re-checked.
- `AGENTS.md` operating conditions for design-file access, browser access and image input; operational manual capabilities matrix and three new scenarios; Playwright MCP, Chrome DevTools MCP and Penpot MCP documented with npm versions.
- Rule 11: session tokens out of web storage, CSRF protection for cookie-authenticated requests.

### Fixed

- Adobe XD status stated precisely from Adobe's FAQ: no new features, bug, security and privacy fixes continue, no end date announced.

## 1.0.0: design and front-end specification (2026-10-15)

Projects 24 starts as a full copy of [Projects 23](https://github.com/gerrardgs/Projects23) version 2.1.0 (engineering rules, nine skills, templates, validator, installer and CI) and extends it for UI/UX designers, digital graphic designers and front-end developers.

### Added

- Rules, always on: `09-design-principles` (user goals, hierarchy, tokens, every state, responsive, no invented design facts) and `10-accessibility` (WCAG 2.2 AA baseline with the EAA, EN 301 549 and ADA context).
- Rules, on demand: `11-frontend-code`, `12-web-performance` (Core Web Vitals thresholds), `13-visual-assets-and-licensing` (licensing, colour management, export and print specifications), `14-ux-writing-and-ethics` (interface copy, forms, localisation, deceptive patterns, consent).
- Fourteen skills: `ux-research-and-strategy`, `ui-design-and-prototyping`, `graphic-design-production`, `motion-and-interaction`, `data-visualization-design`, `design-system-and-tokens`, `design-to-code-handoff`, `frontend-from-scratch`, `framework-frontend-engineering`, `css-architecture-and-responsive`, `accessibility-audit`, `web-performance-optimization`, `frontend-testing-and-visual-qa`, `design-critique-and-review`, each with references.
- Templates, all run before release:
  - `design-tokens`: DTCG 2025.10 tokens to CSS with light and dark themes, alias and cycle checks, theme-shape check, WCAG contrast checks. 17 tests; 22 contrast pairs pass; `tsc --noEmit` clean.
  - `static-site`: accessible starter page, progressive-enhancement form, theme toggle, dev server with path-traversal protection. html-validate and Stylelint clean; 13 tests; axe-core 0 violations (phone and desktop, light and dark, initial and error states).
  - `axe-check`: Playwright plus axe-core scanner for WCAG 2.0 to 2.2 A/AA.
- `docs/DESIGN-REFERENCES.md`: about 440 curated sources in 26 sections.
- `scripts/check-links.mjs` with self-tests, and `.github/workflows/links.yml` to run it weekly. On 2026-10-15 it checked 658 unique external links across the repository: 657 resolved or were blocked only for bots; `https://inkscape.org/` could not be reached from the verification network (DNS resolves, the connection timed out).
- Versions of 70+ front-end packages checked on the npm registry; Baseline status of about 60 web features from `web-features` 3.42.0; 22 additional VS Code extension IDs checked on the Marketplace API.
- Rule 03: front-end and design verification sources and nine new deprecated patterns (React 19 removals, `unload`, `100vh`, zoom-blocking viewport, FID, Adobe XD).
- Rule 04: browser platform replacements table. Rule 07: link to UI testing.
- `AGENTS.md`: design and front-end priorities, non-negotiables (accessibility, licensed assets), workflow, 14-rule and 23-skill indexes, design operating conditions, project profile fields for framework, support target and design source.
- CI jobs for the two front-end templates, including the axe scan; Dependabot entries for their dependencies.

### Changed

- `CLAUDE.md` imports the two new always-on rules.
- `project-bootstrap`: front-end and design toolchain section and extensions.
- Docs: architecture, operational manual (about 40 scenarios), anti-hallucination playbook (nine design failure modes), contributing guide.
- Installer and package metadata point to `gerrardgs/Projects24`.

### Fixed during verification

| Found | Fix |
| :--- | :--- |
| Link checker skipped Markdown links that carry a title (`[text](url "title")`) | Regex fixed; covered by a new self-test |
| Ten reference links returned 404 or no longer resolved (Material Design layout pages, Adobe XD page, ETSI page, 18F Methods site, Datawrapper article, Polaris, Thinking with Type site, Idealliance page, FigJam category, ICO page) | Replaced with the current official pages, verified |
| `@shadcn/ui` first described as a placeholder package | It is the old CLI name (last published March 2023); wording corrected |
| Static site CSS used hand-written vendor prefixes, rejected by Stylelint | Removed; prefixes belong to build tooling |

### Known issues

- The static site's development tools (Stylelint) depend on `braces`, which had a high-severity advisory ([GHSA-vfj7-8cjw-p6xm](https://github.com/advisories/GHSA-vfj7-8cjw-p6xm)) with no patched release on 2026-10-15. Nothing from npm ships to browsers, so CI audits production dependencies for that template; Dependabot will propose the fix when one is published.
- `https://inkscape.org/` could not be reached from the network used for verification; it is the project's long-standing official site and is kept.


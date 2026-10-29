# Skills index

Every skill in this specification, with when to use it. Tools that support Agent Skills load each skill's name and description automatically and open the body when a task matches; this index is for every other tool and for people. It is kept out of [`AGENTS.md`](../AGENTS.md) so that the always-on context stays small, and `node scripts/agents-sync.mjs --check` fails when a skill is missing here or listed without existing.

| Phase | Skill | Use it when |
| :--- | :--- | :--- |
| Discover | [ux-research-and-strategy](skills/ux-research-and-strategy/SKILL.md) | Briefs, research, personas, journeys, information architecture |
| Design | [ui-design-and-prototyping](skills/ui-design-and-prototyping/SKILL.md) | Wireframes, mockups, prototypes, layout, type, colour, components |
| Design | [graphic-design-production](skills/graphic-design-production/SKILL.md) | Logos, brand, social and ad artwork, print files, export specs |
| Design | [motion-and-interaction](skills/motion-and-interaction/SKILL.md) | Animation, transitions, micro-interactions, reduced motion |
| Design | [data-visualization-design](skills/data-visualization-design/SKILL.md) | Charts, dashboards, infographics |
| Media | [motion-graphics-and-animation](skills/motion-graphics-and-animation/SKILL.md) | Animated titles, explainers, logo stings, Lottie and Rive files, flash safety |
| Media | [video-editing-and-post-production](skills/video-editing-and-post-production/SKILL.md) | Editing, sound and loudness, captions, codecs, exports, video on the web |
| Media | [color-grading-and-color-management](skills/color-grading-and-color-management/SKILL.md) | Grading, ACES and OCIO, LUTs, scopes, SDR and HDR deliverables, calibration |
| Media | [photo-editing-and-retouching](skills/photo-editing-and-retouching/SKILL.md) | RAW, retouching, compositing, metadata, Content Credentials, disclosure laws |
| System | [design-system-and-tokens](skills/design-system-and-tokens/SKILL.md) | Design tokens, themes, component libraries, Storybook, governance |
| Handoff | [design-to-code-handoff](skills/design-to-code-handoff/SKILL.md) | Figma/Penpot or screenshot to code; developer handoff specs |
| Handoff | [ai-design-and-artifacts](skills/ai-design-and-artifacts/SKILL.md) | Claude Design, `/design`, `/design-sync`, AI-generated designs and decks to production |
| Handoff | [figma-integration](skills/figma-integration/SKILL.md) | Figma MCP server, Code Connect, variables-to-tokens sync, Figma plugins, Penpot MCP |
| Start | [project-bootstrap](skills/project-bootstrap/SKILL.md) | Creating a repository: runtime, toolchain, editor extensions, CI, docs |
| Build | [frontend-from-scratch](skills/frontend-from-scratch/SKILL.md) | New site or page, platform first; choosing the front-end stack |
| Build | [framework-frontend-engineering](skills/framework-frontend-engineering/SKILL.md) | React, Next.js, Vue, Nuxt, Svelte, Angular, Astro apps and components |
| Build | [css-architecture-and-responsive](skills/css-architecture-and-responsive/SKILL.md) | Styling, layout, responsive design, themes, dark mode |
| Build | [mobile-engineering](skills/mobile-engineering/SKILL.md) | iOS, Android, Flutter, React Native apps: platform design, accessibility, security, store release |
| Build | [web-integrations-and-platforms](skills/web-integrations-and-platforms/SKILL.md) | CMS, WordPress, Shopify, payments, auth UI, email, PWA, SEO, analytics and third-party scripts |
| Integrate | [mcp-servers-and-integrations](skills/mcp-servers-and-integrations/SKILL.md) | Choosing, vetting, configuring and securing MCP servers; databases via MCP Toolbox |
| Build | [native-from-scratch](skills/native-from-scratch/SKILL.md) | Writing a new back-end service, CLI or module, standard library first |
| Change | [change-existing-code](skills/change-existing-code/SKILL.md) | Modifying, refactoring, upgrading or migrating existing code |
| Test | [test-engineering](skills/test-engineering/SKILL.md) | Adding tests, regression tests, test setup, flaky tests |
| Test | [frontend-testing-and-visual-qa](skills/frontend-testing-and-visual-qa/SKILL.md) | Component, end-to-end and visual regression tests; design QA |
| Test | [accessibility-audit](skills/accessibility-audit/SKILL.md) | WCAG audits, screen reader testing, accessibility fixes and statements |
| Tune | [web-performance-optimization](skills/web-performance-optimization/SKILL.md) | Core Web Vitals, Lighthouse, images, fonts, bundles |
| Tune | [resilience-and-chaos-engineering](skills/resilience-and-chaos-engineering/SKILL.md) | Failure modes, resilience patterns, SLOs and error budgets, chaos experiments |
| Debug | [systematic-debugging](skills/systematic-debugging/SKILL.md) | Errors, crashes, wrong output, slowness, incidents |
| Deliver | [agent-delivery-loop](skills/agent-delivery-loop/SKILL.md) | Work beyond one session: phase loop with planning files (GSD), unattended story loop (Ralph) |
| Deliver | [git-worktrees](skills/git-worktrees/SKILL.md) | One worktree per parallel or unattended task: create, inspect, set up, merge back |
| Review | [anti-slop-filter](skills/anti-slop-filter/SKILL.md) | Output that looks AI-generated or generic (UI, copy, code comments); purpose test and delivery report |
| Clean text | [clean-user-facing-text](skills/clean-user-facing-text/SKILL.md) | Local zero-dependency Unicode hygiene and stylometric rewrite pass for reader-facing prose while preserving voice and facts |
| Provenance | [remove-ai-marks](skills/remove-ai-marks/SKILL.md) | Multi-vendor AI mark removal: invisible Unicode (Layer A), rewrite (Layer B), and C2PA/EXIF/container metadata across files |
| Review | [design-critique-and-review](skills/design-critique-and-review/SKILL.md) | Feedback on designs, prototypes, pages, brand pieces |
| Review | [rigorous-code-audit](skills/rigorous-code-audit/SKILL.md) | Reviewing a diff, pull request or codebase |
| Review | [coderabbit-review](skills/coderabbit-review/SKILL.md) | CodeRabbit reviews in the CLI or on pull requests, fixing its comments, `.coderabbit.yaml` |
| Secure | [security-hardening](skills/security-hardening/SKILL.md) | Threat modelling, hardening, security scanning, secrets |
| Secure | [content-hygiene](skills/content-hygiene/SKILL.md) | Hidden Unicode (zero-width, tag characters, Trojan Source bidi controls) and private file metadata; keeps AI disclosures and Content Credentials |
| Secure | [secret-scanning](skills/secret-scanning/SKILL.md) | gitleaks, TruffleHog, push protection; triaging findings; a leaked secret |
| Secure | [reverse-engineering](skills/reverse-engineering/SKILL.md) | Release-build audits of your own bundles and apps; authorized artifact analysis; REA |
| Secure | [security-vulnerability-audit](skills/security-vulnerability-audit/SKILL.md) | Security review or audit: safe local evidence, verified findings, impact-based severity |
| Document | [project-documentation](skills/project-documentation/SKILL.md) | Creating or updating docs/: PRD, glossary, architecture, tech stack, design, accessibility, performance, API, database, schema, security, privacy, testing, deployment and more |
| Automate | [ci-cd-pipeline](skills/ci-cd-pipeline/SKILL.md) | CI workflows, release automation, Dependabot |
| Ship | [frontend-deployment](skills/frontend-deployment/SKILL.md) | Static and server hosting, environment variables, security headers, caching, domains, previews, monitoring |
| Ship | [deploy-and-release](skills/deploy-and-release/SKILL.md) | Containers, configuration, migrations, rollout, monitoring, rollback |

A task often spans several skills. Building a designed page, for example, uses design-to-code handoff, CSS, accessibility audit, testing, then review.

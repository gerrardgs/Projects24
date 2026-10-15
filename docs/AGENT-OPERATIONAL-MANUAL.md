# Agent Operational Manual

Which rules and skills to use for each kind of task, for AI agents and for the people directing them. The always-on core in [AGENTS.md](../AGENTS.md) applies to every scenario. Paths below are relative to the repository root.

## 1. Scenario router

| Scenario | Read first | Then |
| :--- | :--- | :--- |
| New repository from an empty folder | [project-bootstrap](../.agents/skills/project-bootstrap/SKILL.md) | [native-from-scratch](../.agents/skills/native-from-scratch/SKILL.md), [ci-cd-pipeline](../.agents/skills/ci-cd-pipeline/SKILL.md) |
| New feature in an existing project | [change-existing-code](../.agents/skills/change-existing-code/SKILL.md) | [test-engineering](../.agents/skills/test-engineering/SKILL.md), rule [05](../.agents/rules/05-error-handling.md) |
| Bug report or failing behaviour | [systematic-debugging](../.agents/skills/systematic-debugging/SKILL.md) | [test-engineering](../.agents/skills/test-engineering/SKILL.md) for the regression test |
| Flaky test | [test-engineering](../.agents/skills/test-engineering/SKILL.md) section 4 | [systematic-debugging](../.agents/skills/systematic-debugging/SKILL.md) |
| Refactoring | [change-existing-code](../.agents/skills/change-existing-code/SKILL.md) | rule [02](../.agents/rules/02-clean-code.md) |
| Dependency or runtime upgrade | [change-existing-code](../.agents/skills/change-existing-code/SKILL.md) section 4 | rule [04](../.agents/rules/04-dependencies.md) |
| Code review or pull request review | [rigorous-code-audit](../.agents/skills/rigorous-code-audit/SKILL.md) | rule [06](../.agents/rules/06-security.md) |
| Security review, auth, payments, uploads, personal data | [security-hardening](../.agents/skills/security-hardening/SKILL.md) | [rigorous-code-audit](../.agents/skills/rigorous-code-audit/SKILL.md) |
| Slow code or high memory | [systematic-debugging](../.agents/skills/systematic-debugging/SKILL.md) "Performance problems" | its [tools reference](../.agents/skills/systematic-debugging/references/tools.md) |
| CI is failing | [systematic-debugging](../.agents/skills/systematic-debugging/SKILL.md) | [ci-cd-pipeline](../.agents/skills/ci-cd-pipeline/SKILL.md) |
| Set up or harden CI/CD | [ci-cd-pipeline](../.agents/skills/ci-cd-pipeline/SKILL.md) | [security-hardening](../.agents/skills/security-hardening/SKILL.md) section 4 |
| Containerise or deploy | [deploy-and-release](../.agents/skills/deploy-and-release/SKILL.md) | [ci-cd-pipeline](../.agents/skills/ci-cd-pipeline/SKILL.md) |
| Database schema change | [deploy-and-release](../.agents/skills/deploy-and-release/SKILL.md) section 4 | [change-existing-code](../.agents/skills/change-existing-code/SKILL.md) |
| Production incident | [systematic-debugging](../.agents/skills/systematic-debugging/SKILL.md) "Production incidents" | [deploy-and-release](../.agents/skills/deploy-and-release/SKILL.md) section 6 |
| Commit, pull request, release | rule [08](../.agents/rules/08-git-workflow.md) | |
| Documentation only | rule [01](../.agents/rules/01-core-principles.md) section 7 | [project-bootstrap assets](../.agents/skills/project-bootstrap/assets/) (README and ADR templates) |
| Question about the code, no change requested | rule [03](../.agents/rules/03-verification.md) | Answer from the code you read, with file and line references; change nothing |
| New product, feature discovery, "who are the users?" | [ux-research-and-strategy](../.agents/skills/ux-research-and-strategy/SKILL.md) | rule [09](../.agents/rules/09-design-principles.md), [ui-design-and-prototyping](../.agents/skills/ui-design-and-prototyping/SKILL.md) |
| Information architecture, navigation, sitemap | [ux-research-and-strategy](../.agents/skills/ux-research-and-strategy/SKILL.md) section 5 | [design-critique-and-review](../.agents/skills/design-critique-and-review/SKILL.md) |
| Design a screen, page, app or component | [ui-design-and-prototyping](../.agents/skills/ui-design-and-prototyping/SKILL.md) | rules [09](../.agents/rules/09-design-principles.md), [10](../.agents/rules/10-accessibility.md), [14](../.agents/rules/14-ux-writing-and-ethics.md) |
| Wireframe or prototype | [ui-design-and-prototyping](../.agents/skills/ui-design-and-prototyping/SKILL.md) sections 2 and 4 | [motion-and-interaction](../.agents/skills/motion-and-interaction/SKILL.md) |
| Logo, brand, social post, ad, poster, print file | [graphic-design-production](../.agents/skills/graphic-design-production/SKILL.md) | rule [13](../.agents/rules/13-visual-assets-and-licensing.md) |
| Chart, dashboard, infographic | [data-visualization-design](../.agents/skills/data-visualization-design/SKILL.md) | rule [10](../.agents/rules/10-accessibility.md) |
| Animation, transitions, micro-interactions | [motion-and-interaction](../.agents/skills/motion-and-interaction/SKILL.md) | rule [12](../.agents/rules/12-web-performance.md) |
| Design tokens, theme, dark mode, component library | [design-system-and-tokens](../.agents/skills/design-system-and-tokens/SKILL.md) | [css-architecture-and-responsive](../.agents/skills/css-architecture-and-responsive/SKILL.md) |
| Figma, Penpot or screenshot to code | [design-to-code-handoff](../.agents/skills/design-to-code-handoff/SKILL.md) | [frontend-testing-and-visual-qa](../.agents/skills/frontend-testing-and-visual-qa/SKILL.md) |
| Figma link, Figma MCP server, Code Connect, Figma plugin | [figma-integration](../.agents/skills/figma-integration/SKILL.md) | [design-to-code-handoff](../.agents/skills/design-to-code-handoff/SKILL.md) |
| Keep code tokens in sync with Figma variables | [figma-integration](../.agents/skills/figma-integration/SKILL.md) section 4 | [design-system-and-tokens](../.agents/skills/design-system-and-tokens/SKILL.md) |
| Mobile app screen, iOS, Android, Flutter, React Native | [mobile-engineering](../.agents/skills/mobile-engineering/SKILL.md) | rule [10](../.agents/rules/10-accessibility.md), [figma-integration](../.agents/skills/figma-integration/SKILL.md) section 5 |
| New website, landing page or portfolio | [frontend-from-scratch](../.agents/skills/frontend-from-scratch/SKILL.md) | [web-performance-optimization](../.agents/skills/web-performance-optimization/SKILL.md), [accessibility-audit](../.agents/skills/accessibility-audit/SKILL.md) |
| React, Vue, Svelte, Angular, Astro, Next.js or Nuxt work | [framework-frontend-engineering](../.agents/skills/framework-frontend-engineering/SKILL.md) | rule [11](../.agents/rules/11-frontend-code.md) |
| Styling, layout or responsive bug | [css-architecture-and-responsive](../.agents/skills/css-architecture-and-responsive/SKILL.md) section 6 | [systematic-debugging](../.agents/skills/systematic-debugging/SKILL.md) |
| Accessibility audit or fix, WCAG, EAA, ADA | [accessibility-audit](../.agents/skills/accessibility-audit/SKILL.md) | rule [10](../.agents/rules/10-accessibility.md) |
| Slow page, poor Core Web Vitals | [web-performance-optimization](../.agents/skills/web-performance-optimization/SKILL.md) | rule [12](../.agents/rules/12-web-performance.md) |
| UI tests, visual regression, cross-browser QA | [frontend-testing-and-visual-qa](../.agents/skills/frontend-testing-and-visual-qa/SKILL.md) | [test-engineering](../.agents/skills/test-engineering/SKILL.md) |
| Review a design or UI | [design-critique-and-review](../.agents/skills/design-critique-and-review/SKILL.md) | [accessibility-audit](../.agents/skills/accessibility-audit/SKILL.md) |
| Review a front-end pull request | [rigorous-code-audit](../.agents/skills/rigorous-code-audit/SKILL.md) | [design-critique-and-review](../.agents/skills/design-critique-and-review/SKILL.md), rule [11](../.agents/rules/11-frontend-code.md) |
| Interface copy, error messages, forms, consent | rule [14](../.agents/rules/14-ux-writing-and-ethics.md) | rule [10](../.agents/rules/10-accessibility.md) section 4 |
| Finding a trustworthy source on any design or front-end topic | [DESIGN-REFERENCES.md](DESIGN-REFERENCES.md) | rule [03](../.agents/rules/03-verification.md) |
| Deploy a site, hosting, headers, domains, environment variables | [frontend-deployment](../.agents/skills/frontend-deployment/SKILL.md) | [ci-cd-pipeline](../.agents/skills/ci-cd-pipeline/SKILL.md) front-end templates |
| CMS, WordPress, Shopify, payments, auth UI, email, PWA, analytics | [web-integrations-and-platforms](../.agents/skills/web-integrations-and-platforms/SKILL.md) | rule [04](../.agents/rules/04-dependencies.md) section 9 |
| Works locally but broken when deployed; hydration, CORS, layout bugs | [systematic-debugging](../.agents/skills/systematic-debugging/SKILL.md) with its [browser-debugging reference](../.agents/skills/systematic-debugging/references/browser-debugging.md) | [frontend-deployment](../.agents/skills/frontend-deployment/SKILL.md) |
| A tool, framework or service this spec does not mention | rule [04](../.agents/rules/04-dependencies.md) section 9 | [TOOLKIT.md](TOOLKIT.md) |
| Not sure how to phrase the request | [PROMPT-LIBRARY.md](PROMPT-LIBRARY.md) | |

## 2. Execution loop for any scenario

This is clean execution ([rule 15](../.agents/rules/15-clean-execution.md)) in six steps; the result must also be clean code ([rule 02](../.agents/rules/02-clean-code.md)).

1. **Understand**: restate the goal and acceptance criteria; list assumptions.
2. **Ground**: read the relevant code, manifests and tests; run the baseline build and tests.
3. **Plan**: the smallest correct change; for multi-step work, a numbered plan with checkpoints.
4. **Do**: one step at a time, following the rules and the chosen skill.
5. **Verify**: run the formatter, linter, type checker and tests; read the actual output.
6. **Report**: the format in `AGENTS.md` section 7: changed, verified, not done, risks.

## 3. Using the spec where files are not loaded automatically

- **Chat models (ChatGPT, Claude.ai, Gemini, DeepSeek, Llama, Qwen and others)**: paste `AGENTS.md` first, then the rule or skill for the task. For design work without a design file, attach screenshots and the brand guide, and ask the model to label estimated values. Tell the model it cannot run commands, so every result must be labelled unverified until you run it.
- **IDE or CLI agents that load only `AGENTS.md`**: the indexes in `AGENTS.md` direct the agent to open the right rule or skill file.
- **Sub-agents**: pass each one the task, the acceptance criteria, and the links to the relevant rule and skill files. Sub-agents start without the parent's context.

## 4. Capabilities matrix: what to do with the tools you have

Agents run with very different abilities. Use the best one available and say which you used.

| Capability | Use it for | Without it |
| :--- | :--- | :--- |
| Shell and file access | Run formatters, linters, tests, builds, the token pipeline and the link checker | Mark every result unverified; give the user the commands |
| Figma MCP server or Penpot MCP server | Exact layout, variables, components, Code Connect mappings, screenshots ([figma-integration](../.agents/skills/figma-integration/SKILL.md)) | Ask for Dev Mode exports, a token file or screenshots; label values as estimates |
| Figma REST API token | Variables-to-tokens sync in CI | Use a plugin export or `get_variable_defs` per selection |
| Browser automation (Playwright MCP, Chrome DevTools MCP, computer use, or local Playwright) | See the rendered UI, console errors, network, performance traces, keyboard flows, axe scans | Say the UI was not seen rendered; provide test steps |
| Image input (vision) | Compare a build with a design or screenshot; critique layouts | Work from code and specs; ask for descriptions |
| Network access | Verify versions, Baseline status, licences and links | Use lockfiles and installed docs; label facts as unverified |
| Sub-agents | Parallel audits (accessibility, performance, visual QA) with one skill each | Do the passes one after another |
| Hooks (Claude Code `PreToolUse`/`PostToolUse`, Git pre-commit) | Enforce formatting, linting and secret scanning deterministically | Rely on the rules and CI |

## 5. What humans should still do

- Approve anything irreversible or outward-facing: deletions, force pushes, migrations, deployments, publishing sites or social posts, changes to shared design libraries, messages to other people.
- Judge design quality and brand fit, and run usability tests with real people; an agent can check rules, not taste or real user behaviour.
- Review diffs before merging; an agent's report is a summary, not proof.
- Keep the "Project profile" in `AGENTS.md` current, so agents run the right commands.
- Re-verify dated facts (runtime versions, tool locations, action SHAs) periodically; `node scripts/agents-sync.mjs` checks structure, not the outside world.

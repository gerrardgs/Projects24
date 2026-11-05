# Motion tools: which library for which job

Choose the cheapest tool that does the job ([motion-craft](motion-craft.md) section 1, step 3), then check its licence, size and accessibility behaviour. Facts looked up on 2026-11-04 with `npm view` and each project's own page; versions move, so re-run the lookup before pinning.

| Tool | Use it for | Licence | Version | Watch |
| :--- | :--- | :--- | :--- | :--- |
| CSS transitions, `@starting-style`, scroll-driven animations | state changes, entries, simple scroll effects | the platform | n/a | support varies; check [modern-css](../../css-architecture-and-responsive/references/modern-css.md) |
| Web Animations API | scripted motion with CSS performance, no library | the platform | n/a | no springs or layout animations |
| [Motion](https://motion.dev/) (`motion`, `framer-motion`) | springs, layout and exit animations, gestures | MIT | 14.9.1 | pin the version; a major release changes the API |
| [GSAP](https://gsap.com/) | timelines, SVG morphing, scroll storytelling | GSAP Standard "no charge" licence (Webflow; effective 2025-04-30, last modified 2025-05-30), not an open-source licence | 3.15.1 (`@gsap/react` 2.1.2) | commercial use is allowed at no charge, including the former members-only plugins; the licence prohibits using GSAP in tools that let users build visual animations without code, if they compete with Webflow's; Webflow may change the terms, so record the licence version in `docs/ASSETS.md` and re-read it before upgrades |
| [Lenis](https://github.com/darkroomengineering/lenis) | smooth scrolling on top of native scroll | MIT | 1.3.27 | runs on native scroll, so sticky positioning, anchors and assistive technology keep working; `respectReducedMotion` is on by default, so leave it on; set `anchors` if anchor links must work; smoothed scrolling is a taste choice that can feel wrong and can trigger vestibular symptoms, so keep the speed modest and test with keyboard and touch |
| [React Bits](https://github.com/DavidHDev/react-bits) | copy-in animated components for React | MIT with the Commons Clause (source-available: use in an application, website or product is allowed, selling the software itself is not) | repository `4dc7b5b` (2026-10-31) | third-party code to read before use ([21-design-intelligence](../../../rules/21-design-intelligence.md) section 4): check each component's reduced-motion handling, bundle weight and dependencies, record the licence, and expect the same look as every other site that copies the same effect |

Rules for all of them:

- A library earns its place against CSS: do not install one for a fade. Prefer one animation library per project.
- Every effect has a reduced-motion path and a keyboard path; scroll-linked effects never hide content from people who scroll fast or use assistive technology.
- Measure cost: bundle size and main-thread time on a mid-range phone ([12-web-performance](../../../rules/12-web-performance.md)), not on the development laptop.
- Smooth-scroll and scroll-jacking are the first effects to drop under `prefers-reduced-motion`, and they are on the list of generic effects that make unrelated sites look alike ([motion-context-and-tells](motion-context-and-tells.md)).

# Four UX laws, what they say and what they do not

Fitts's, Hick's, Doherty's and Jakob's laws are quoted everywhere, often more broadly than their sources allow. This page states each one as the source does, grades it with the [evidence register](evidence-register.md), and says how to use it without over-reading it. Cite the entry ID ([E-nn]) with the strength letter, and test with your own users.

| Law | Entry | Strength | One line |
| :--- | :--- | :--- | :--- |
| Fitts's law | E-27 | A | Pointing time rises with distance and falls with target width |
| Hick-Hyman law | E-28 | C | Choice reaction time rises with the information in the choice |
| Doherty threshold | E-29 | C | Fast responses (about 400 ms) keep people productive |
| Jakob's law | E-30 | B | People expect your site to work like the others they know |

## 1. Fitts's law [E-27, A]

MT = a + b log2(2A/W): movement time (MT) grows with the distance to the target (A) and falls as the target's width (W) grows; intercept and slope are measured per device and person. Variants such as Welford's and a Shannon-form version fit better for small difficulty.

- **Use it for**: placing and sizing frequent or critical controls: bigger and closer is faster; keep the primary action near where the pointer or thumb already is; do not put a destructive control next to a frequent one; targets at least 24 by 24 CSS px, and about 44 by 44 for primary touch controls ([10-accessibility](../../../rules/10-accessibility.md)); extend the hit area with padding, not the visual.
- **Do not read it as**: "make everything big". It models aimed pointing, not choosing or reading. A large decorative button is not a better design, and a huge target has costs in layout and mistaken taps. It says nothing about touch screens' own error patterns, which need testing on devices.

## 2. Hick-Hyman law [E-28, C]

Choice reaction time grows with the amount of information in the choice; Hyman extended Hick's result to alternatives that are not equally likely. Only bibliographic records and summaries of the papers were read here, and the sources disagree on the volume of Hyman's paper, so the strength is C.

- **Use it for**: a reason to test whether people are slowed by a long list of equal, unfamiliar options at a decision point; to group, order by likelihood, use progressive disclosure, and offer a sensible default.
- **Do not read it as**: "fewer options is always better". It was measured with simple stimulus and response tasks, not with menus, search or expert use. Well-organised large sets (a familiar menu, an alphabetical list, a search box) are not slow in the way the law suggests. Count what people can see and recognise, not the number of items in the code.

## 3. Doherty threshold [E-29, C]

The 1982 IBM report is credited with showing that productivity rises sharply when a system answers in under about 400 ms. The report itself was not found, only secondary accounts, and Kent Beck's comment is a fair warning: 400 ms is a practical rule of thumb, not a cognitive constant. A later study mentioned by one source found a smaller, linear effect; that was not confirmed.

- **Use it for**: a response budget to design toward: acknowledge every action immediately (pressed state in the same frame, [fluid-motion](../../motion-and-interaction/references/fluid-motion.md)), show progress for what cannot be fast, never block input while loading, and measure real timings on mid-range devices ([12-web-performance](../../../rules/12-web-performance.md)). A measured interaction time is reported as measured, and a missing one as "not measured".
- **Do not read it as**: a guarantee that 399 ms is good and 401 ms bad, or as licence to fake speed with misleading progress.

## 4. Jakob's law [E-30, B]

Nielsen: users spend most of their time on other sites, so they expect yours to work the same way; when a design deviates from expectations, usability suffers. He adds the limits: a clearly better design can win, settled patterns should be adopted, and old conventions can be dropped, reluctantly and for a real gain. He lists scroll-jacking among the violations.

- **Use it for**: choosing familiar patterns for navigation, search, forms, carts and icons; spending novelty on one signature element rather than on structure ([perception-and-cognition](perception-and-cognition.md) section 3; E-03, E-04); and a check on motion that overrides native scrolling ([motion-tools](../../motion-and-interaction/references/motion-tools.md)).
- **Do not read it as**: "never innovate", or as an instruction to look like everyone else. A distinct identity ([project-design-identity](../../project-design-identity/SKILL.md)) lives in colour, type, voice, imagery and one signature, on top of conventional structure. Conventions also differ by market and platform; follow the ones your audience actually uses.

## 5. Citing them

Write "Fitts's law [E-27, A]" and say what you used it for. Do not write "studies prove" or quote a number such as 400 ms as a fact; it is a rule of thumb with a stated source. If a project depends on one of these laws for an important decision, re-open the source and test it with your users.

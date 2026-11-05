# Motion in context: how much, what character, and what to refuse

Motion rules depend on the product and its people. A decision lens, a list of motion tells to refuse, and the checks for writing motion. Adapted, in our own words, from [kylezantos/design-motion-principles](https://github.com/kylezantos/design-motion-principles) (MIT, commit `4a9ca87`, read 2026-11-04), which distils the public work of Emil Kowalski, Jakub Krehel and Jhey Tompkins; its weighting is its author's interpretation, not theirs. The frequency and purpose rules are in [motion-craft](motion-craft.md); polish numbers are in [polish-details](../../ui-design-and-prototyping/references/polish-details.md).

## 1. Three questions, three lenses

| Question | Lens | Fits |
| :--- | :--- | :--- |
| Should this animate at all? | restraint and speed | productivity tools, dashboards, anything used hundreds of times a day |
| Is it subtle and polished enough to ship? | production polish | consumer products, e-commerce, mobile apps |
| What could this become? | playful experiment | creative sites, portfolios, children's products, onboarding |

Weight them by context before building or reviewing, and state the weighting. A tool used all day leans on restraint; a children's product leans on polish and play; a portfolio or campaign on polish and play with restraint for forms and navigation. In this repository the weighting comes from the project's identity brief: its `mode`, `energy` and `motion` dials ([project-design-identity](../../project-design-identity/SKILL.md)). Do not apply one lens everywhere: a sub-300 ms rule is wrong for a children's game, and elastic bounce is wrong for a bank.

Duration is context-dependent too: under about 300 ms for productivity UI, 200 to 500 ms where smoothness is the goal, and "what serves the effect" for playful work. Do not cap durations universally; check the weighting first. The golden rule stays: the best animation is the one that goes unnoticed. (If every interaction draws "nice animation!", it is too prominent for production, except where delight is the point.)

## 2. Easing has character

Each curve says something about the brand. A bouncy or elastic curve suits an energetic children's product and not enterprise software, error states, frequently repeated actions or fast tasks; a professional product uses ease-out or a subtle spring. Pure-CSS springs, bounces and elastics are possible with the `linear()` easing function; check browser support first ([modern-css](../../css-architecture-and-responsive/references/modern-css.md)).

## 3. Motion tells to refuse

A tell is a pattern that reads as generated because it is applied everywhere and the same everywhere; one deliberate use is normal polish. Flag the pattern when it repeats across a view or a codebase without a reason in code comments or the design notes.

| Tell | What it looks like | Instead |
| :--- | :--- | :--- |
| Pulsing indicators | glowing dots, breathing buttons, looping "live" rings, `animate-pulse` on status | a static status treatment; a pulse only for one brand element with a written reason |
| Blur on every entrance | `filter: blur()` on every entering section, card and paragraph | one hero or dialog; never on running text where it hurts first-paint reading |
| Hover scale on everything | the same `scale(1.05)` on every card, button and image | feedback that means something (press, selection); one primary action at most |
| Stagger on every list | delay-per-item on every list and grid | a staged entrance only where sequence explains hierarchy |
| Bouncy springs on utility actions | overshoot on toggles, menus and form feedback | critically damped springs or ease-out ([fluid-motion](fluid-motion.md)) |
| Uniform fade-in | every element fades in the same way on mount | none, or one signature move |
| Motion on mount for static content | animation that plays on load for text nobody is waiting for | render it in place |

Also in the list: attention-seeking loops generally, `transition: all`, scale from zero, equal weight for enter and exit, and one duration for everything ([motion-craft](motion-craft.md) section 2). The related generic-design tells are in [ui-patterns](../../anti-slop-filter/references/ui-patterns.md).

## 4. Before presenting motion you wrote

- Does every animation have a nameable purpose (feedback, orientation, continuity)? If not, remove it.
- Is it on a high-frequency or keyboard-started action? Then it is instant.
- Do dropdowns, popovers and tooltips grow from their trigger? Are exits quieter than entrances? Is duration matched to the element's size?
- Does it animate only `transform` and `opacity`, with `will-change` used sparingly, and no keyframes on anything the user can re-trigger?
- Is a reduced-motion path in the same code, not a follow-up? Reduced motion keeps functional changes (an alternative that does not move) and may drop decorative ones.
- Does it match the motion already in the project, unless that is what you are fixing?

## 5. Functional versus decorative

The test: if removing the animation stops the user understanding what happened, it is functional and needs a non-moving alternative under reduced motion. If not, it is decorative and may be removed. Avoid large-scale zoom, spin and parallax as default effects, and give every ambient animation a pause control ([age-ability-and-neurodiversity](../../human-design-nature/references/age-ability-and-neurodiversity.md) section 4).

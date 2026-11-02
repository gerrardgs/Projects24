# Design passes: choose the mode, then run the pass the work needs

A vocabulary for improving an interface in focused passes instead of one vague "make it better". It sits on top of the rules and skills of this repository and replaces none of them. Concepts adapted, in our own words, from [pbakaus/impeccable](https://github.com/pbakaus/impeccable) (Apache-2.0, version 4.8.0, commit `e89e3ad`, read 2026-11-02). No file, script or binary of that project is copied or installed here, and its detector is not used; the repository's own gates ([anti-slop-filter](../../anti-slop-filter/SKILL.md), [accessibility-audit](../../accessibility-audit/SKILL.md)) do that work. Its sample numbers are one author's taste: test them.

## 1. Pick the mode from the surface, not the product

The mode says what success looks like for the person on this surface. A tool's landing page is still persuasion; a fashion house's documentation is still reading.

| Mode | The visitor | Typical surfaces | Ambition shows as |
| :--- | :--- | :--- | :--- |
| Persuade | decides and acts | landing pages, campaigns, pricing | distinct point of view, real imagery where the brief needs it, one clear action |
| Operate | completes a task | app screens, dashboards, editors, settings, admin | scanability, consistency, platform expectations, precise detail; known patterns earn their place |
| Read | understands something | docs, articles, guides, help, changelogs | structure for comprehension first, then a reading experience worth staying in |
| Experience | is inside the work | portfolios, galleries, showcases | the artifact leads from the first screen; the interface recedes |

Record the mode in the design plan for that surface. Persuade and Experience may commit to bold, distinct work; Operate and Read show craft as restraint ([09-design-principles](../../../rules/09-design-principles.md)). The brief wins: a pinned aesthetic, era, font or palette is honoured even when it conflicts with a habit of yours, and refinement keeps the existing identity while redesign replaces it. Never split the difference unannounced.

## 2. The passes

Run one at a time, say which you are running, and report evidence from the rendered result at the sizes it ships at.

| Pass | Question it answers | Look at |
| :--- | :--- | :--- |
| Critique | Does the design work for its users? | hierarchy, clarity, emotional fit, task flow; score against the [heuristics](../../design-critique-and-review/SKILL.md) |
| Audit | Is it technically sound? | accessibility, performance, responsive behaviour, theming; measured, not impressions |
| Harden | Does it survive real conditions? | extreme and missing data ([break-ui](../../frontend-testing-and-visual-qa/references/break-ui.md)), errors and offline, long translations, right-to-left, 1,000 items |
| Clarify | Can people tell what happened and what to do? | labels, errors, empty states; one fact now, the next action, the context that changes the decision; say each idea once ([14-ux-writing-and-ethics](../../../rules/14-ux-writing-and-ethics.md)) |
| Distill | What can go? | competing actions, repeated information, decoration, options nobody needs; keep the one primary goal |
| Adapt | Does it fit a different context? | another device, input, connection or use; rethink the experience, do not scale pixels (hover on touch, tiny targets, desktop patterns on a phone) |
| Onboard | How fast does a person reach first value? | the moment that proves the product worth their time, not a tour of everything; empty states that help |
| Polish | Is the last 5 percent right? | drift from the design system, classified as missing token, one-off implementation, conceptual mismatch or local defect, then fixed at the narrowest correct level ([polish-details](polish-details.md)) |

Polish is refinement, never a concealed redesign: if the concept is wrong, say so and recommend a redesign. A tool's findings are evidence of defects, not proof of quality; look at the real result and the real interaction path.

## 3. Craft floor before any interface edit

Check these on the built result, in one batched look, not as separate trips. They are a floor, not a direction.

- **Contrast**: body and placeholder text at least 4.5:1, large text 3:1 ([10-accessibility](../../../rules/10-accessibility.md)); on a coloured surface tint secondary text from that hue instead of plain grey.
- **Depth and spacing**: shadows with an offset and a soft blur (a zero-offset coloured halo is decoration); tight groups, generous separation, more space above a heading than below it. Read the computed values.
- **Type**: a body measure of about 65 to 75 characters, balanced headings, visible steps in the scale, real copy checked at every breakpoint.
- **Motion**: one authored moment instead of scattered effects or the same entrance on every section ([motion-craft](../../motion-and-interaction/references/motion-craft.md)).
- **States**: hover, focus, disabled, loading, error, empty; real content; working controls.
- **Browser surfaces nobody drew**: text selection, caret, scrollbars, focus rings and numerals in tables ship with defaults that belong to no design system. Theme them from the palette; it is cheap and shows care.
- **Copy**: the product's own language. Controls name their action; errors name the problem and the recovery.
- **Coverage**: every requirement in the brief is present and findable within seconds.

Defaults to question rather than ban, because the brief can earn any of them: same-size icon-heading-text cards as the page structure, the big-number hero metric, an eyebrow label above every heading, gradient text, decorative glass and blur, a thick coloured side border on cards, hard offset shadows outside a world that chose them, emoji standing in for an icon system, geometric masks pretending to be a photograph's outline, and light or dark picked by category instead of by who uses it, where and in what light. This overlaps the catalogue of [anti-slop-filter](../../anti-slop-filter/SKILL.md); where they differ, the stricter reading applies until the owner decides.

## 4. Order of authority

1. The user and the brief, then the repository's design direction ([21-design-intelligence](../../../rules/21-design-intelligence.md) section 1).
2. Accessibility, safety, honesty and licensing rules, which no pass overrides.
3. The passes and the craft floor above.

Verify by looking at the rendered result at its shipping sizes, and fix everything one look shows before looking again.

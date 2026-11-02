# Age, ability and neurodiversity

People differ in how they see, move, hear, remember and read, and the same person differs by day, light, tiredness and stress. Design for the range. Cited as [E-nn] ([evidence-register](evidence-register.md)).

## 1. Principles

- **Age is a poor proxy.** Older people differ widely; vision, dexterity, hearing and cognition can decline, and designing for older users is similar to designing for people with disabilities [E-19, A]. Build to WCAG [E-26, A] and the result serves older users, tired users and users in bright sun.
- **Abilities are a spectrum and often temporary or situational**: a broken arm, a noisy train, a baby in one hand. Ask what each choice does to the people at the edges.
- **Offer control instead of guessing.** Text size, theme, motion, density and language settings let each person adjust, and respect the system's own settings (`prefers-color-scheme`, `prefers-reduced-motion`, text scaling).

## 2. Seeing

- About 1 in 12 men have colour vision deficiency [E-18, A]. Never use colour alone for status, errors, chart series or links; add text, shape, pattern or position. Check designs with a colour-blindness simulation.
- Contrast and size minimums are in [10-accessibility](../../../rules/10-accessibility.md) (WCAG [E-26]). Treat them as floors. Low-vision users may need more, and zoom to 200 percent and reflow at 320 CSS px must work.
- Light mode usually performs better for people with normal vision; some people with visual impairments do better in dark mode, and some prefer it [E-17, B]. Ship both when the product is used for long periods, and make the default follow the system setting.

## 3. Moving

- Targets: at least 24 by 24 CSS px (AA), aim for 44 by 44 [E-26, A]. Children under 9 need much larger targets (about 2 cm square) and simple gestures such as tap, swipe and drag, and little fine motor control [E-21, B].
- No drag-only or hover-only actions; keyboard and switch access are first-class ([10-accessibility](../../../rules/10-accessibility.md) section 2).

## 4. Motion and the vestibular system

- Motion on a screen can cause dizziness, nausea or migraine in some people [E-23, A]. Honour `prefers-reduced-motion` (gentler, not necessarily zero), avoid large parallax and scroll-jacking, give a way to pause anything that moves for more than five seconds, and never flash more than three times a second ([motion-and-interaction](../../motion-and-interaction/SKILL.md)).

## 5. Reading, memory and attention

- W3C's COGA Note gives supplementary guidance for cognitive and learning disabilities, neurodiversity and intellectual disabilities [E-20, A]. Its themes in practice: plain words, one idea per sentence, clear next step, no time pressure without a way to extend, forgiving forms, consistent layout, help in context, and no blame in errors ([14-ux-writing-and-ethics](../../../rules/14-ux-writing-and-ethics.md)).
- For dyslexia the common guidance is clear sans-serif type of about 12 to 14 point with generous line spacing near 1.5, left-aligned text and short lines; the evidence that sans-serif beats serif is mixed and spacing seems to matter more [E-25, C]. Allow users to change spacing and text size rather than fixing one setting.

## 6. Children

- Protecting children is more than target size: age-appropriate design codes and consent rules apply to products likely to be used by them. Take the legal requirements from the owner and counsel; this repository does not provide legal advice ([14-ux-writing-and-ethics](../../../rules/14-ux-writing-and-ethics.md)).

## 7. Test with people

Automated checks find a fraction of the problems ([accessibility-audit](../../accessibility-audit/SKILL.md)). Include people with disabilities in research where you can, and report what you tested and what you could not.

---
name: human-design-nature
description: A sourced knowledge base of human design taste and perception for deciding what an interface should look and feel like for its actual people - how people group and judge a screen in milliseconds, the balance of familiarity and novelty, colour and emotion across cultures, brand personality, trust and credibility, culture, language and region, age, ability and neurodiversity, light and dark preference, motion sensitivity, context of use, individual differences and trends - with an evidence register that records each source, its strength, what was actually read and its limits, a taste-to-design-choice table, and a checker that keeps the register dated. Use when choosing or defending a design direction, writing a design brief or identity, tailoring a design to an audience or market, or when someone claims what users like without a source.
license: MIT
metadata:
  version: "1.0.0"
---

# Human Design Nature

Design taste is not one thing. People judge a screen in a fraction of a second, prefer the familiar with a measure of the new, feel colour and shape differently by culture and moment, and differ in what they can see, hear, reach and hold in mind. This skill stores what can be sourced about that, in a form that turns into design choices, and says plainly what is not known.

It informs a decision; it never makes one. The project's users, its brief and the safety, accessibility and honesty rules come first ([21-design-intelligence](../../rules/21-design-intelligence.md) section 1). To turn the result into a distinct identity for one project, use [project-design-identity](../project-design-identity/SKILL.md).

## 1. How to use it

1. **Describe the people and the situation**: audiences, languages and scripts, devices, context of use, stress, frequency, accessibility needs. Take it from the owner or research; write unknowns as unknowns ([ux-research-and-strategy](../ux-research-and-strategy/SKILL.md)).
2. **Open the matching file**:
   - [perception-and-cognition](references/perception-and-cognition.md): grouping, first impressions, complexity, familiarity, affordances;
   - [emotion-meaning-and-trust](references/emotion-meaning-and-trust.md): feeling, brand personality, colour, credibility;
   - [culture-language-and-region](references/culture-language-and-region.md): audiences by region and language;
   - [age-ability-and-neurodiversity](references/age-ability-and-neurodiversity.md): sight, movement, motion sensitivity, cognition, children, older people;
   - [context-individuals-and-trends](references/context-individuals-and-trends.md): context of use, individuals, trends.
3. **Go through [taste-to-design-map](references/taste-to-design-map.md)** row by row and write each decision with its evidence ID in the identity brief.
4. **Test** with the real audience. A result from your users replaces a tendency from the literature.
5. **Record what you learned**: new sources go into the [evidence register](references/evidence-register.md) with date, strength and limits.

## 2. Honesty rules

- **Cite the register or do not claim it.** Any statement about what people like, feel or do must carry an entry ID. "Users love...", "Gen Z wants...", "people in country X prefer..." without an entry is fabrication ([AGENTS.md](../../../AGENTS.md) non-negotiable 1).
- **Strength is part of the claim.** `A` standard or undisputed; `B` credible research with limits; `C` a lens or thin result. Never present a `C` as a fact.
- **Say what you read.** The register records whether the page, only the abstract, or only reports about a source were read. Re-open the source before relying on a number in a decision that matters.
- **Tendencies are for groups, never for a person.** Do not stereotype by age, gender, nationality or inferred personality. Test, or offer control.
- **Hypotheses end in a test.** Every row of the map names how to confirm it.
- **Not established is a list too.** The register ends with common claims it does not support; leave them out until sourced.

## 3. Keeping it current

The register is dated. `node assets/check-evidence.mjs references/evidence-register.md` checks its form (unique IDs, a link, a type, a strength, how it was read, an ISO date), that every `[E-nn]` cited in the other files exists, and warns when an entry has not been re-checked for 365 days. To refresh an entry: open the source, correct the finding and limits if they changed, then update the date. To add research: add the entry first, then cite it. Review the whole register at least once a year and whenever a project's audience changes.

## 4. Relation to other skills

- Direction and sources for visual style: [ui-ux-pro-max](../ui-ux-pro-max/SKILL.md), [DESIGN-REFERENCES](../../../docs/DESIGN-REFERENCES.md); this skill adds the human side the databases lack.
- Gates that apply to every choice: [anti-slop-filter](../anti-slop-filter/SKILL.md), [accessibility-audit](../accessibility-audit/SKILL.md), [14-ux-writing-and-ethics](../../rules/14-ux-writing-and-ethics.md).

## Done when

- [ ] The audience and context are written down, with unknowns marked
- [ ] Each design choice that rests on a human tendency cites an evidence ID and its strength
- [ ] Nothing from the "not established" list is used as a fact
- [ ] Each hypothesis has a test, and test results are recorded
- [ ] `node assets/check-evidence.mjs references/evidence-register.md` exits 0

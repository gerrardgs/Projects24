---
name: project-design-identity
description: Give every project its own design identity that is documented, different from every other project in the portfolio, and kept up to date - an identity brief per project (audience and context, personality, signature decisions for colour, type, shape, layout, density, imagery, voice and motion, a "not like" list, evidence, open questions, change log), a shared vocabulary of identity axes, a tested checker that fails when two projects look alike (same display font and hue, too few differing signature axes, or too small a distance), flags overdue reviews and unknown evidence ids, and suggests free hues and unused styles. Use when starting or redesigning any interface, choosing colours, type or layout for a project, when a new project seems to look like an existing one, or when reviewing whether a design direction is distinct and current.
license: MIT
metadata:
  version: "1.0.0"
---

# Project Design Identity

Generated designs drift to the same look whatever the project, and a portfolio built by one person or one agent drifts further: the same teal, the same rounded cards, the same font pairing. This skill makes distinctness a checked property. Each project records its identity in a brief, the briefs are compared, and a brief that is too close to another or out of date fails a check.

Distinct is not arbitrary. The identity comes from the project's people and context ([human-design-nature](../human-design-nature/SKILL.md)), and the safety, accessibility, honesty and licensing rules outrank it ([21-design-intelligence](../../rules/21-design-intelligence.md) section 1). Never copy another product's identity to get one ([13-visual-assets-and-licensing](../../rules/13-visual-assets-and-licensing.md)).

## 1. What each project keeps

- A study ledger at `docs/DESIGN-STUDY.md` ([design-study](../design-study/SKILL.md)) that records what was observed, imitated and modified; the brief cites its rows.
- A brief at `docs/DESIGN-IDENTITY.md` (or `<name>.identity.md` in a shared folder), from [design-identity.template.md](assets/design-identity.template.md). The front matter holds the choices in a fixed vocabulary ([identity axes](references/identity-axes.md)); the body holds the reasons.
- A line in the owner's portfolio registry: a JSON file next to the projects that lists every project and the path to its brief ([registry.example.json](assets/registry.example.json)). A project in the registry without a brief is reported.
- Tokens that implement the brief ([design-system-and-tokens](../design-system-and-tokens/SKILL.md)). The brief says why; the tokens say what.

## 2. Procedure for a new or redesigned interface

1. **Know the people.** Write the audience and context, with unknowns marked. Use [human-design-nature](../human-design-nature/SKILL.md) for what can be sourced, and ask the owner for what cannot. Choose the mode (persuade, operate, read, experience) from the surface ([design-passes](../ui-design-and-prototyping/references/design-passes.md)).
2. **Look at the portfolio first.** `node assets/check-identity.mjs --registry <registry.json> --gaps` prints the widest free hue gaps and the type styles, shapes, layouts, imagery and voices no project uses yet. Start your options there, unless the audience's evidence points elsewhere.
3. **Widen, then choose.** Get a data-backed starting point with [ui-ux-pro-max](../ui-ux-pro-max/SKILL.md) (`--design-system`) and treat it as one input. It is built from keywords and tends to propose the same answer for similar briefs; the portfolio check is how you notice that.
4. **Write the brief.** Study references the honest way first ([design-study](../design-study/SKILL.md): observe, imitate, modify, with a ledger), and deal three genuinely different directions before choosing one. Fill every section, including "Studied references". Each choice carries its reason and an evidence ID with its strength, or is marked as a taste choice to test. "Not like" names the closest projects and what keeps this one apart.
5. **Check.** `node assets/check-identity.mjs --registry <registry.json> --evidence <evidence-register.md>`. Fix a collision by changing a choice, not the threshold. If two projects are meant to share a brand (a product family), declare `sharesBrandWith` with a `shareReason`, and get the owner's approval.
6. **Implement and verify.** Build the tokens from the brief, run the gates ([anti-slop-filter](../anti-slop-filter/SKILL.md), [accessibility-audit](../accessibility-audit/SKILL.md)), and test with the audience. The decisive test of distinctness is human: show five people unlabelled screenshots from two projects and ask which is which. Record the result in the brief.

## 3. Keeping it updated

A brief is a living document with a review date (`updated` plus `reviewEveryDays`, 180 by default). Update it, and add a dated Change log line, when:

- the audience, market, language or platform changes;
- research or a test shows a decision does not work for the people;
- the brand, product scope or a major release changes the surface;
- an accessibility or performance failure forces a design change;
- the check reports the review overdue, or another project's brief changes and now sits close;
- the evidence register changes an entry the brief relies on ([human-design-nature](../human-design-nature/SKILL.md) section 3).

The check warns when a review is overdue (`--strict` makes it fail, for scheduled runs). Changing a brief is a design change to existing work: propose it and wait for approval ([AGENTS.md](../../../AGENTS.md) non-negotiable 11).

## 4. What the check measures, and what it does not

- It compares the choices written in the briefs, weighted: display font, primary hue and layout count most. It fails a pair when: the display font is the same and the primary hues are within 30 degrees; fewer than 4 of 8 signature axes (hue band of 40 degrees, display font, type style, shape, layout, imagery, voice, density) differ; or the weighted distance is below 0.40.
- The thresholds are guardrails set by this repository's maintainers. They are not research findings. Adjust with `--min-distance` and say why. Two projects can pass and still feel alike to a person, or fail while serving a family on purpose.
- It cannot see the real interface. A brief that says "airy" over a dense screen passes. The identity is verified in the rendered result, at the sizes it ships at.
- It does not rank taste. A bold identity is no better than a quiet one; fit to the audience is the measure.

## 5. Blind spots

- **Difference for its own sake.** An unreadable palette or an unusual navigation is not an identity. Distinct choices still pass the accessibility and usability gates, and familiar structure with one signature element is often the right answer ([perception-and-cognition](../human-design-nature/references/perception-and-cognition.md) section 3).
- **A copied identity.** Cloning another product's look, or using a tool that clones designs, is excluded by the licensing rule and by this skill ([mcp-catalog](../mcp-servers-and-integrations/references/mcp-catalog.md), "Reviewed and not adopted").
- **Trend lock-in.** An identity that only follows the current trend converges with everyone else's later ([context-individuals-and-trends](../human-design-nature/references/context-individuals-and-trends.md)).
- **Stale evidence.** A brief that rests on an old register entry should be re-read when the entry is re-checked.
- **Registry gaps.** A project missing from the registry is invisible to the check. Add new projects when they start.

## Done when

- [ ] The project has a brief with every section filled, unknowns marked, and reasons with evidence IDs
- [ ] `node assets/check-identity.mjs --registry <registry.json> --evidence <evidence-register.md>` exits 0, with no unexplained exemption
- [ ] The tokens implement the brief, and the gates and the audience test were run
- [ ] The brief's `updated` date and Change log record the latest change
- [ ] "Not like" names the closest projects, and the unlabelled-screenshot test was run or listed as an open step

---
name: design-study
description: Learn from existing design the honest way - observe, imitate, modify - with a record of every study. A study ledger per project (reference, date seen, licence status, fact or impression, technique imitated, what was changed, scope, credit, where used), twenty study cards written from the taste-skill research (name as monument, pinned poster, colour chapters, the page is the object, one motif, the product performs, dark room, type only and more) each with what to watch for, the taste-skill procedures folded in (inventory of the subject, page as claims, deal three directions then choose, look and fix at three widths), and a tested checker that refuses to imitate a restricted or unknown reference as an asset, text or code. Use when studying a reference, gallery, competitor or template, when asked to make something like another design, when sourcing images or fonts, or when a design feels borrowed.
license: MIT
metadata:
  version: "1.0.0"
---

# Design Study: Observe, Imitate, Modify

Designers learn from other designers' work. The method is old and sound: look closely, practise the technique, then make it your own. It goes wrong in two ways: copying what is protected (assets, text, code, marks) and stopping at imitation, so the result looks like its source. This skill keeps the method and records it, so every borrowing has a licence and every imitation has a modification.

It works with [project-design-identity](../project-design-identity/SKILL.md) (what makes this project different) and [human-design-nature](../human-design-nature/SKILL.md) (why people respond as they do). The licensing rules are in [13-visual-assets-and-licensing](../../rules/13-visual-assets-and-licensing.md); the order of authority is in [21-design-intelligence](../../rules/21-design-intelligence.md).

Concepts adapted, in our own words, from [leonxlnx/taste-skill](https://github.com/Leonxlnx/taste-skill) (MIT, commit `12af471`, read 2026-11-02). Nothing was installed or run from it, and none of its libraries, scripts or images are copied. Its research is model judgement from still frames of gallery pages, so its findings are strength C.

## 1. The three steps

1. **Observe.** Look at the reference as a maker. Write what you can state as a **fact** (a measured size, a count, a behaviour you saw) apart from your **impression** (it feels calm). Note the idea behind it, not only the look: what claim does the design make about its subject?
2. **Imitate.** Practise the technique, structure or pattern in a scratch page with your own content. Imitation is practice, not delivery.
3. **Modify.** Change it until it is this project's: derive the choice from the subject, adjust the axes of the identity brief, keep what serves the audience, drop what does not. Write what changed. If you cannot, the modification is not finished.

## 2. What may be imitated

| Scope | Allowed for | Not allowed |
| :--- | :--- | :--- |
| technique, structure, pattern | any reference, whatever its status | copying the arrangement so closely that the result is recognisably the other work |
| asset (image, font, icon, illustration, audio, video), text, code | references with status `open`, `own` or `licensed`, with the licence and credit written down | anything `restricted` or `unknown`: treat unknown as all rights reserved |

Never imitate a brand's marks, a person's likeness, a product's distinctive trade dress or another site's copy. A design that a client asks to "look like X" is a brief to extract X's technique and then modify it, or to decline the copy and say why ([13-visual-assets-and-licensing](../../rules/13-visual-assets-and-licensing.md)).

## 3. The ledger

Each project keeps `docs/DESIGN-STUDY.md` from [design-study.template.md](assets/design-study.template.md); a filled example is [example-study.md](assets/example-study.md). One row per reference. The identity brief's "Studied references" section cites the row IDs ([project-design-identity](../project-design-identity/SKILL.md)).

`node assets/check-study.mjs docs/DESIGN-STUDY.md --brief docs/DESIGN-IDENTITY.md` fails when:

- a row lacks a link or study card, a real date, a known status or scope;
- the observation does not start with "Fact:" or "Impression:";
- there is no modification, or it repeats the imitation;
- a restricted or unknown reference is imitated as an asset, text or code, or borrowed material has no credit;
- a cited study card or ledger row does not exist.

It warns when a row was seen over a year ago, or when three or more rows lean on one reference (many projects imitating one source converge). The check proves the record is honest in form. It cannot tell whether the result looks too close to its source: look at them side by side, and ask someone who has not seen the source.

## 4. Study cards

[references/study-cards.md](references/study-cards.md) holds twenty ideas (S-01 to S-20), each as Observe, Imitate, Modify and Watch. Use a card as a starting reference (`card:S-nn` in the ledger) and always add your own modification. They give no fonts, colours or components: a published replacement list becomes the next generic look.

## 5. Procedures folded in from taste-skill

- **Inventory the subject** before designing: eight to twelve things that belong to this client and to no competitor (the name and its meaning, the street and what it looks like, the numbers in the brief, the constraint it lives with, its materials, rituals and printed things). The idea of the design comes from this list, and each item is also a query for finding real pictures. Goes into the identity brief's "Audience and context".
- **Write the page as claims with proof**, one line per section, and delete any section with no claim. This avoids the stock sequence of hero, logos, three features, testimonial, pricing and call to action ([ui-design-and-prototyping](../ui-design-and-prototyping/SKILL.md)).
- **Deal several, choose one.** Models pick the category default every time. Get three genuinely different directions (use `--gaps` of the identity check and the study cards), choose the one that carries the subject's idea, and record why.
- **Look and fix.** Screenshot at three widths, judge them against a written rubric (idea, hierarchy, type, colour, content, craft), fix, look again. Verify in a real browser ([frontend-testing-and-visual-qa](../frontend-testing-and-visual-qa/SKILL.md)).
- **Dated tells.** A tell is a device that reads as generated because it was produced by default, not because it is bad. Track them with dates ([anti-slop-filter](../anti-slop-filter/references/ui-patterns.md) section "Dated tells") and never answer with a named replacement; answer with a procedure.
- **Substance, not only restraint.** Removing ornaments is half the job. A page that lost its labels, rules and cards and gained nothing reads as thin. Put in larger type, whole fields of colour, real pictures of this subject's world, and full content in every section.
- **Real pictures, honestly credited.** Open archives and museums hold the subject's place, materials and trade history, often free to use with a credit. Record each in the project's assets list with its licence and credit line (`docs/ASSETS.md`, [16-project-documentation](../../rules/16-project-documentation.md)) and in the ledger when it came from a study. Do not run a downloader you have not read ([21-design-intelligence](../../rules/21-design-intelligence.md) section 5).
- **Page or app screen.** A page is read and scrolled; an app screen is worked in. They follow different rules (quiet borders and repeated panels are normal in an app, gradients and glows are not); match the mode of the surface ([design-passes](../ui-design-and-prototyping/references/design-passes.md)).

## 6. Blind spots

- **Recognisable copy.** Imitating a technique closely enough that people see the source. Modify more, and test with someone who has not seen it.
- **Imitating the trend.** Studying only the current gallery winners makes everything converge. Mix sources: print, objects, architecture, the subject's own world.
- **Licence by assumption.** A picture being on the web does not make it free. Unknown means restricted.
- **Observation that is really opinion.** Keep Fact and Impression apart; an impression is allowed, a guess presented as a measurement is not.
- **A ledger written after the fact.** Fill the row when you study, not when someone asks.

## Done when

- [ ] Every reference used has a ledger row with date, status, a fact or impression, the imitated technique and a real modification
- [ ] No restricted or unknown reference is imitated as an asset, text or code; borrowed material has its licence and credit
- [ ] The identity brief cites the rows, and `check-study.mjs` exits 0
- [ ] The result was compared side by side with its sources and does not read as a copy
- [ ] The assets list names every picture, font and icon with its licence

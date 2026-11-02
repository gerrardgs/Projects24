---
project: <project name, the same as in the registry>
updated: YYYY-MM-DD
reviewEveryDays: 180
mode: operate                 # persuade | operate | read | experience
primaryHue: 0                 # OKLCH hue angle of the main brand colour, 0-359
accentHue: 0                  # OKLCH hue angle of the accent, 0-359
neutralTone: neutral          # cool | neutral | warm
chroma: balanced              # muted | balanced | vivid
displayFont: <licensed family for headings>
bodyFont: <licensed family for text>
typeStyle: humanist           # grotesk | humanist | serif-display | geometric | rounded | mono-accent
shape: soft                   # sharp | soft | round | mixed
density: comfortable          # compact | comfortable | airy
layout: stacked               # grid | editorial | dashboard | stacked | asymmetric | sidebar-app
energy: 2                     # 1 calm, 2 confident, 3 bold
rhythm: 2                     # 1 uniform, 2 consistent with breaks, 3 varied
motion: 1                     # 1 states only, 2 transitions, 3 choreographed
imagery: photography          # photography | illustration | three-d | type-only | data | abstract
voice: plain                  # plain | warm | formal | playful | technical
personality: [competence]     # one to three of: sincerity | excitement | competence | sophistication | ruggedness
---

# Design identity: <project name>

> Fill every section with facts about this project's people and context. Mark what you do not know as unknown; do not invent audiences, statistics or quotes. Choices cite evidence IDs from the [human-design-nature](../../human-design-nature/references/evidence-register.md) register. Delete this note.

## Audience and context

Who uses it, in which languages and scripts, on which devices, where, how often, under what stress, with which accessibility needs. Sources: <owner, research, analytics>. Unknown: <list>.

## Personality and feeling

Two or three words (from the personality list) and the target feeling as a point between calm and activated, pleasant and unpleasant. Why these fit the audience and the moment of use.

## Signature decisions

The few choices that make this product recognisable, each with its reason: the colour story (hues, tone, chroma), the type pairing, the shape language, the layout archetype and density, the imagery, the voice, the one motion moment. Link the tokens ([design-system-and-tokens](../../design-system-and-tokens/SKILL.md)).

## Not like

The other projects in the portfolio and the common patterns of the category this identity deliberately avoids, and what in each choice keeps it apart. Run `node check-identity.mjs` against the portfolio and paste the closest pair here.

## Studied references

The references observed, imitated and modified for this identity, as ledger row IDs from `docs/DESIGN-STUDY.md` (ST-01, ST-02...) with one line each on what was kept and what was changed ([design-study](../../design-study/SKILL.md)). Say "none yet" only for a first draft.

## Evidence and rationale

Each decision with its evidence ID and strength, for example "calm affect for anxious parents [E-11, B]". What was tested with real users, and the result. Where a literature tendency and a test result disagree, the test wins.

## Open questions

What is unknown and the first step to find out.

## Change log

- YYYY-MM-DD: first version. Reason, what changed, who decided.

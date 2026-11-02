# From human tendencies to design choices

The working table: for each design variable, what the register supports, what to do with it, and how to confirm. Strength is the register's letter. Everything here is a hypothesis about a group until the project's own users confirm it, so each row ends in a test. Choices land in the project's identity brief ([project-design-identity](../../project-design-identity/SKILL.md)).

| Variable | What the evidence supports | Do | Confirm by |
| :--- | :--- | :--- | :--- |
| Visual complexity | Low complexity with high prototypicality gives the best first impression [E-03, B]; complexity and colourfulness preferences differ by country, age, gender and education [E-07, B] | Operate and Read modes: low. Persuade and Experience: higher only with purpose. Keep controls legible at any level | A five-second test and a task test with the real audience |
| Novelty versus familiarity | Novelty is liked while typicality holds [E-04, B]; easy processing and repeated exposure raise liking [E-05, E-06, B] | One signature element, familiar structure and navigation | Compare a familiar and a bolder variant on the same task |
| Hue and meaning | Colour-emotion associations are mostly shared and locally tinted [E-08, B] | Choose hue for the intended feeling, then check meanings in the market with local people | Interviews in the target market |
| Colour use | About 1 in 12 men have colour vision deficiency [E-18, A] | Never colour alone; test with a colour-blindness simulation | The [accessibility-audit](../../accessibility-audit/SKILL.md) checks |
| Saturation, colourfulness | Group tendencies differ [E-07, B] | Moderate by default; raise or lower for the audience's evidence | Preference test with the real audience |
| Affect (energy) | Valence and arousal describe feeling [E-11, B] | Calm for anxiety, money and health; lively where the task is playful. Maps to the energy dial | Read the copy and screens aloud: does the tone fit the moment? |
| Brand personality | Five dimensions, with local variants [E-09, B] | Two or three words, all choices checked against them | Ask users to describe the product in their own words |
| Trust | Looks are noticed first [E-02, E-14]; pretty forgives only small problems [E-15, B] | Real content, working controls, plain honest copy, consistent behaviour | A task test, and review against [anti-slop-filter](../../anti-slop-filter/SKILL.md) |
| Clickability | Weak signifiers cost time [E-16, B] | Controls look and read as controls whatever the style | First-click test |
| Shape language | Thin evidence [E-13, C] | A convention: choose to fit the personality words, apply from tokens | Audience feedback; do not defend it with research |
| Grouping and space | Perceptual grouping [E-01, A] | Group with space, alignment and common regions; spacing steps carry meaning | Squint test; screen-reader order |
| Light and dark | Light is usually better for normal vision, dark helps some and is preferred by some [E-17, B] | Ship both for long sessions, follow the system setting | Contrast checks in both; test at night |
| Age and ability | Overlap with disability needs [E-19, A]; children under 9 need about 2 cm targets [E-21, B] | WCAG floors, larger targets and simpler gestures where the audience calls for it | Sessions with the audience, including people with disabilities |
| Language and script | Expansion up to 300 percent on short strings [E-22, B] | Flexible layouts, locale formats, mirrored right-to-left | Worst-case data ([break-ui](../../frontend-testing-and-visual-qa/references/break-ui.md)) |
| Motion | Vestibular risk [E-23, A] | Purposeful, reduced-motion variant, a pause for long motion | Test with the setting on |
| Reading and cognition | COGA guidance [E-20, A]; dyslexia advice [E-25, C] | Plain words, spacing and size controls, one clear next step | Comprehension check with representative users |

## Using the table

1. Write the audience and context first (what you know, what you do not). Unknowns are listed, not filled.
2. Go row by row; write the decision and the evidence ID in the identity brief's rationale.
3. When two rows pull apart (a bold look versus legibility for older users), the rules win in this order: safety and accessibility, honesty, then the audience's evidence, then expression ([21-design-intelligence](../../../rules/21-design-intelligence.md) section 1).
4. Record what the test showed. A result from your own users replaces a literature tendency in the brief.

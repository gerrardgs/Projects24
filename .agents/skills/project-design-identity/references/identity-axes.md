# Identity axes

The vocabulary of the brief's front matter. Using the same words in every project is what makes briefs comparable. Choose a value for the reasons in the body, not because it is listed.

| Field | Values and meaning |
| :--- | :--- |
| `mode` | `persuade` (decide and act: landing pages), `operate` (complete a task: app screens, dashboards), `read` (understand: docs, articles), `experience` (be inside the work: portfolios, galleries). Chosen per surface, see [design-passes](../../ui-design-and-prototyping/references/design-passes.md) |
| `primaryHue`, `accentHue` | Hue angle 0 to 359 in OKLCH, the colour space that keeps lightness steady across hues. Approximate positions: red 25 to 30, orange 55, yellow 100 to 110, green 140 to 145, teal and cyan 190 to 195, blue 260 to 265, purple 300, magenta 330 to 350. Check the actual colour in a colour tool; contrast is checked on the final pair, not the hue |
| `neutralTone` | `cool`, `neutral`, `warm`: the tint of greys and backgrounds |
| `chroma` | `muted`, `balanced`, `vivid`: the overall colour saturation of the palette |
| `displayFont`, `bodyFont` | Licensed families ([13-visual-assets-and-licensing](../../../rules/13-visual-assets-and-licensing.md)); record the licence in `docs/ASSETS.md`. System fonts are allowed; name the stack |
| `typeStyle` | `grotesk` (neutral sans), `humanist` (calligraphic sans), `serif-display` (serif headings), `geometric` (circle-and-line forms), `rounded` (soft terminals), `mono-accent` (monospace used as a deliberate accent for data or code, not as a costume) |
| `shape` | `sharp` (right angles, small radii), `soft` (modest radii), `round` (large radii, pills), `mixed` (radii vary by role on purpose). Radii come from tokens |
| `density` | `compact` (many items per screen, expert use), `comfortable`, `airy` (generous space, low items per screen) |
| `layout` | `grid` (modular, regular columns), `editorial` (articles and varied compositions), `dashboard` (panels of data), `stacked` (a single column flow), `asymmetric` (deliberately unbalanced composition), `sidebar-app` (persistent navigation beside content) |
| `energy` | 1 calm and plain, 2 confident, 3 bold and expressive: how loudly the design greets. Relates to the arousal axis of [emotion-meaning-and-trust](../../human-design-nature/references/emotion-meaning-and-trust.md) |
| `rhythm` | 1 uniform sections, 2 consistent with a few breaks, 3 varied and asymmetric |
| `motion` | 1 states only, 2 transitions and reveals, 3 choreographed sequences; always with a reduced-motion variant |
| `imagery` | `photography`, `illustration`, `three-d`, `type-only`, `data` (charts and figures lead), `abstract` (shapes and textures) |
| `voice` | `plain`, `warm`, `formal`, `playful`, `technical`; the tone of interface text ([14-ux-writing-and-ethics](../../../rules/14-ux-writing-and-ethics.md)) |
| `personality` | One to three of sincerity, excitement, competence, sophistication, ruggedness ([emotion-meaning-and-trust](../../human-design-nature/references/emotion-meaning-and-trust.md) section 2). The words the whole identity must agree with |
| `updated`, `reviewEveryDays` | Date of the last real review (YYYY-MM-DD) and the interval, 30 to 730 days |
| `sharesBrandWith`, `shareReason` | Optional. A deliberate family relation to another project, with a sentence of reason and the owner's approval. Exempts the pair from the difference check |

Energy, rhythm and motion are the same three dials used in [anti-slop-filter](../../anti-slop-filter/SKILL.md) section 3.

Adding a value to a list requires a change to the checker's vocabulary and its tests, and a line in the changelog. Do not invent values in a brief.

# Polish details: the small things that make an interface feel finished

A checklist for the last pass on a screen that already works, is accessible and has the right structure. It does not replace those: polish on a broken layout is decoration. Ideas adapted, in our own words, from [jakubkrehel/make-interfaces-feel-better](https://github.com/jakubkrehel/make-interfaces-feel-better) (MIT, commit `35545ea`, read 2026-11-02). Numbers below are that author's taste or a common starting point, not standards; test them against your own design and users, and keep what survives.

Before suggesting a fix, express it in the project's own styling system (Tailwind classes in a Tailwind project, tokens in a token project). To review, slow the motion to about 10 percent in the browser's animation panel and walk every state: hover, focus, active, loading, empty. What feels off slowed down is slightly wrong at full speed.

## 1. Shape and alignment

- **Concentric corners.** A nested element's radius is the outer radius minus the padding between them (equivalently, outer = inner + padding). Equal radii on parent and child is the most common reason a card looks slightly off.
- **Optical alignment.** Where geometric centring looks wrong (a play triangle, an icon beside a label, an asymmetric glyph), nudge it by eye and keep the nudge in the component, not in the page.
- **Elevation with shadow, structure with borders.** A border that only fakes depth can be a layered, low-opacity shadow. Keep borders that say something: dividers, selected and focus states.
- **Image edges.** A hairline outline at low opacity (pure black on light themes, pure white on dark, not a tinted grey that picks up the surface colour) gives images a consistent edge on similar backgrounds.
- **Hit area.** Prefer 44 by 44 CSS px on touch ([WCAG 2.5.5](https://www.w3.org/WAI/WCAG22/Understanding/target-size-enhanced.html), level AAA; 24 by 24 is the AA floor, [2.5.8](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html)). Extend a small control with a pseudo-element, and never let two hit areas overlap.

## 2. Type

- Tabular figures (`font-variant-numeric: tabular-nums`) for numbers that update or line up, so they do not shift the layout.
- `text-wrap: balance` for headings and `text-wrap: pretty` for body text reduce orphans; check browser support before relying on it ([modern CSS](../../css-architecture-and-responsive/references/modern-css.md)).
- Font smoothing on macOS (`-webkit-font-smoothing: antialiased`) is a taste setting that affects only some platforms; compare before you ship it.

## 3. Icons

- One stroke weight per icon set, matched to the text beside it (about 1.5 px next to regular text and 2 px next to semibold is a starting point). Never mix icon libraries on one surface.
- One SVG per icon, drawn in `currentColor`; hover, selected and disabled come from CSS colour and opacity, not from extra files. Outline is the default, fill marks the active state.
- Icons that swap in place can fade and scale slightly instead of popping; keep the duration short and respect reduced motion.

## 4. Motion in the details

Full guidance is in [motion-craft](../../motion-and-interaction/references/motion-craft.md). The polish-level points:

- Interactive state changes use CSS transitions, which can be interrupted halfway. Keyframes are for staged sequences that run once.
- Never `transition: all`; list the properties. Use `will-change` only for `transform`, `opacity` or `filter`, and only after you saw a first-frame stutter.
- A small press scale on buttons gives tactile feedback. One practitioner uses 0.96 and says anything below 0.95 feels exaggerated; treat it as a starting value to try, and let it be switched off where motion would distract.
- Exits are quieter than entrances: a small fixed offset, not the full height.
- Do not animate on first page load by default; stagger only an infrequent, staged entrance where sequence explains hierarchy, never routine or repeated interactions.
- Motion is never the only feedback. Every animated change also has a static cue: colour, icon or label.

## 5. Review output

Report what you inspected, not what you assume: for each of type, shape and alignment, icons, motion and performance, name the evidence (files, components, states) and the result (findings, clear, or not reviewed with a reason). Quick reviews cover the main path and report only high and medium issues, up to five; full reviews cover the scope, up to fifteen. A polish finding that also affects accessibility or performance is reported under that heading first ([design-critique-and-review](../../design-critique-and-review/SKILL.md)).

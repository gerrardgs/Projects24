# Fluid, physical motion: gestures, springs and materials

How to make a touch or pointer interface feel direct: response, tracking, interruption, springs, momentum, boundaries, translucent layers and the accessibility fallbacks they need. Concepts adapted, in our own words, from the `apple-design` skill of [emilkowalski/skill](https://github.com/emilkowalski/skill) (MIT, commit `f1090be`, read 2026-11-04). That skill summarises Apple's WWDC talks, chiefly *Designing Fluid Interfaces* (2018); the talks themselves were not re-watched here, so treat the numbers as one practitioner's starting values to test, not as specifications. For the decision order and review standards of everyday interface motion, read [motion-craft](motion-craft.md) first; this file is for motion the user controls with a finger or pointer.

Reduced motion comes with every pattern below ([10-accessibility](../../../rules/10-accessibility.md), [age-ability-and-neurodiversity](../../human-design-nature/references/age-ability-and-neurodiversity.md) section 4).

## 1. The idea

An interface feels alive when motion starts from the value on screen now, inherits the user's velocity, projects momentum forward, and can be grabbed and reversed at any instant. Springs make that natural because they are interruptible and velocity-aware by construction. Everything below serves one of four human needs the source names: predictability, understanding, achievement and joy.

## 2. Techniques

| Technique | Do | Avoid |
| :--- | :--- | :--- |
| Response | Show feedback on pointer-down, and keep updating during the gesture | Waiting for release or `click`; debounces and timers on the input path |
| Direct manipulation | Track 1:1 with Pointer Events and `setPointerCapture`; keep the offset from where the user grabbed; keep a short history of positions and times for velocity | Snapping the element's centre to the finger; reporting only a final swipe event |
| Interruptibility | Never lock input during a transition; animate from the current on-screen value, not the target; use springs for anything the user can grab | CSS transitions or keyframes for gesture-driven motion; restarting from the target value, which makes a visible jump |
| Reversal | Carry velocity through a re-target so the motion does not hit a "brick wall"; split 2D motion into independent X and Y springs | Replacing one animation with another at the moment of reversal |
| Springs | Think in damping ratio (overshoot) and response (speed), not mass and stiffness; start at damping 1.0 (no bounce) and add a little bounce (about 0.8) only when the gesture itself carried momentum | Bounce on something that merely faded in |
| Velocity handoff | Start the release animation at the pointer's release velocity; some APIs want it relative to the remaining distance (velocity divided by distance to go) | A visible seam between dragging and animating |
| Momentum projection | Project where the gesture is going (exponential decay, a deceleration rate near 0.998 for a normal scroll feel) and snap to the point nearest that projection | Snapping from the release point; the textbook v-squared formula |
| Spatial consistency | Enter and exit along one path; anchor popovers and sheets to their trigger; mirror the easing on reversible transitions | In from the right, out through the bottom |
| Telegraphing | Make in-between frames point at the outcome (a control grows toward the finger) | Blind interpolation |
| Boundaries | Rubber-band: resistance that grows with distance past the edge | A hard stop that reads as frozen |
| Tap and drag detail | Highlight on press, commit on release; about 10 px of hysteresis before choosing a direction; recognise tap, drag and swipe in parallel from the first move and cancel the losers | Waiting for a single recogniser to finish; paying a double-tap delay where no double-tap exists |
| Frame smoothness | Animate `transform` and `opacity` on the display clock (`requestAnimationFrame`); keep per-frame movement under the strobing threshold; a slight stretch or blur can show speed | Layout properties in motion ([motion-craft](motion-craft.md) section 3) |

Starting spring values reported by the source for Apple interactions (test them, they are not standards): reposition about damping 1.0 and response 0.4 s; rotation 0.8 and 0.4 s; sheet or drawer 0.8 and 0.3 s. With a spring library that takes `bounce` and `duration`, damping 1.0 maps to bounce 0.

## 3. Translucent layers and depth

- Build navigation bars, toolbars and sheets as translucent layers over scrolling content, using `backdrop-filter` and a semi-transparent fill, instead of opaque strips that take space.
- Material weight encodes hierarchy: heavier surfaces separate structure (a sidebar), lighter ones draw attention to controls. Never stack a light translucent surface on another; legibility collapses.
- Larger surfaces read as thicker: stronger blur and a deeper shadow than a small chip.
- Dim to focus on a modal task; use translucency and offset without a scrim for a parallel panel that must not break the flow.
- Keep text legible over changing backgrounds: higher contrast and slightly heavier weight, not flat grey; put colour on a solid layer.
- Prefer a faded edge mask where content slides under floating chrome over a hard divider.
- Animate blur and scale together when a glass surface enters or leaves.
- Glass is a taste choice with accessibility costs: contrast must be measured over the whole area text crosses ([anti-slop-filter](../../anti-slop-filter/SKILL.md) gates), and decorative glass on every component is a listed tell ([ui-patterns](../../anti-slop-filter/references/ui-patterns.md)).

## 4. Feedback beyond the screen

Motion, sound and haptics follow three rules, from the source's summary of Apple's audio-haptic talk: **causality** (it is obvious what caused it), **harmony** (the visual, the sound and the haptic land on the same frame) and **utility** (only where it earns its place; over-feedback teaches people to ignore all of it). Never make sound or vibration the only signal, and respect system settings and silent modes.

## 5. Fallbacks that ship with the pattern

| Setting | Behaviour |
| :--- | :--- |
| `prefers-reduced-motion: reduce` | Replace slides, springs and parallax with short cross-fades or a static change; drop overshoot; keep opacity and colour changes that aid comprehension |
| `prefers-reduced-transparency: reduce` | Raise the background opacity, drop the blur |
| `prefers-contrast: more` | Near-solid backgrounds with a defined, contrasting border |

Also avoid full-viewport moving backgrounds, slow looping oscillations and abrupt brightness jumps (ease theme changes). Check browser support for each media feature before relying on it ([modern-css](../../css-architecture-and-responsive/references/modern-css.md)).

## 6. Typography that changes with size

- Tracking is size-specific: large display text wants slightly negative letter spacing, small text slightly positive, body near zero. One fixed value is wrong somewhere.
- Leading falls as size rises: tight on large headings, looser on body text, looser again for scripts with tall ascenders and descenders.
- Build hierarchy from weight, size and leading together; emphasise with weight.
- Scale layout with the user's text size (`rem` and `em`, not fixed pixels), and use the platform's system font unless there is a reason not to ([project-design-identity](../../project-design-identity/SKILL.md) records that reason).

## 7. Foundations the source names

Purpose, agency, responsibility, familiarity, flexibility, simplicity (not minimalism), craft and delight, with delight as the result of the other seven, not an add-on. They agree with [09-design-principles](../../../rules/09-design-principles.md) and [human-design-nature](../../human-design-nature/SKILL.md): keep people in control with easy undo, ask for privacy-relevant data at the moment it is needed, build on what people know, and test with real people in real context. Prototype interactions with working code, and judge motion in slow motion and frame by frame.

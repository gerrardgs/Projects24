# Motion craft: should it move, how, and when to take it out

A decision order and a review checklist for interface motion. Adapted, in our own words, from the animation skills of [emilkowalski/skill](https://github.com/emilkowalski/skill) (MIT, commit `f1090be`, read 2026-11-02): build, review, performance and "remove animations". The durations and curves below are that practitioner's starting values and common conventions, not standards. Measure on a mid-range phone, and prefer the project's existing motion tokens over inventing a second set.

Accessibility comes first and is not optional: motion respects `prefers-reduced-motion` ([10-accessibility](../../../rules/10-accessibility.md)), and nothing that moves for more than five seconds lacks a pause ([WCAG 2.2.2](https://www.w3.org/WAI/WCAG22/Understanding/pause-stop-hide.html)).

## 1. Decision order for a new animation

Stop at the first step that says no.

1. **Should it move at all?** Match motion to how often it is seen.

   | Seen | Decision |
   | :--- | :--- |
   | Hundreds of times a day, or started from the keyboard (shortcuts, command palette) | No animation. Any duration reads as delay |
   | Tens of times a day (hover, list navigation) | Near-imperceptible: a short colour or opacity change, or nothing |
   | Occasionally (dialogs, drawers, toasts) | Standard animation |
   | Rarely or once (onboarding, success) | The place for delight |

2. **What is its purpose?** Name it: feedback, spatial consistency (where it came from or went), state indication, bridging a jarring change, or explanation. Delight only at the rare tier. If you cannot name a purpose, do not build it. Data the user is reading or acting on does not move for style.
3. **Cheapest tool that works.** CSS transition for state you control with a class or attribute; CSS `@starting-style` for entry on mount; a CSS animation for predetermined motion that must stay smooth while the page is busy; the Web Animations API for programmatic control without a library; a motion library only for springs, layout and exit animations, or gesture-driven values. Do not install a library for a fade ([04-dependencies](../../../rules/04-dependencies.md)).
4. **Properties.** Animate `transform` and `opacity`; they skip layout and paint. Avoid width, height, margin, padding, top and left (a height animation on an accordion is the usual tolerated exception). Never start from `scale(0)`; start from about 0.9 to 0.97 with opacity 0. Set the `transform-origin` of popovers and tooltips at their trigger; dialogs stay centred.
5. **Curve and duration.** Entering and exiting: ease-out. Moving on screen: ease-in-out. Hover or colour: ease. Constant motion: linear. Never ease-in on interface motion: it is slow exactly when the user is watching. The built-in CSS curves are weak; use a stronger custom curve from the project's tokens, or one from [easing.dev](https://easing.dev/). Starting durations: press feedback 100 to 160 ms, tooltips 125 to 200 ms, dropdowns 150 to 250 ms, dialogs and drawers 200 to 500 ms. Interface animations stay under about 300 ms unless explained. Use a spring for drag with momentum or a gesture the user can reverse, with little or no bounce.
6. **Interruption and exit.** Rapidly triggered things (toasts, toggles) use transitions, which retarget from the current value, not keyframes, which restart. Exit the way it entered. Slow on the deliberate phase (a press-and-hold confirm), quick on the system's response.
7. **Ship the guards with it**: reduced motion (gentler, not necessarily zero: keep opacity and colour, drop movement) and hover effects gated behind `@media (hover: hover) and (pointer: fine)`.

## 2. Review standards

Flag, with the file and the value, any of these:

- no stated purpose, or motion on a high-frequency or keyboard-started action;
- `transition: all`, ease-in on interface motion, `scale(0)`, or an unexplained duration over 300 ms;
- layout properties animated; a parent CSS variable driving a child's transform (it recalculates every child);
- keyframes on something triggered rapidly; symmetric timing on a press-and-release or hold;
- everything entering at once where a short stagger (tens of milliseconds) would show order;
- missing reduced-motion handling; ungated hover motion;
- motion personality that does not match the product (a playful bounce in a dashboard).

Approval is earned. If you cannot tell whether motion feels right, deleting it is often the better move. To judge feel, replay at a fraction of the speed and walk each state.

## 3. When motion drops frames

Name the cause before changing code; "added `will-change`" is not a diagnosis.

- The frame budget is about 16.7 ms at 60 Hz and about 8 ms at 120 Hz. A developer's laptop is the least representative device; say which findings come from code and which need a recording on a real device.
- Wrong property: swap to `transform` or `opacity`; use `filter: drop-shadow()` rather than animating `box-shadow`.
- Busy main thread (only during load or navigation): move the motion to CSS or the Web Animations API so it runs off the main thread.
- Hand-rolled animation in React: write to the element's style through a ref per frame, not through state.
- Drag that gets slower as a list grows: stop animating an inherited CSS variable; set `transform` on the element.
- Large `blur()` transitions lag, especially in Safari: keep animated blur small (under about 20 px).
- `will-change` is the last step, only for `transform`, `opacity` or `filter`, and only after you saw first-frame stutter. Hardware acceleration is something the browser may grant; which properties you animate is yours to control.

Performance numbers are reported only if measured ([12-web-performance](../../../rules/12-web-performance.md)).

## 4. Making an interface feel faster: take animations out

Put every existing animation on trial, and let it stay only if it can defend itself. Walk each one through this order and record the branch:

1. Started from the keyboard, or seen hundreds of times a day: remove it.
2. On functional data the user reads or acts on (charts, tables, numbers): remove it, unless it shows a real change of value, such as a number moving from old to new after the user's action. Replaying on every refresh is decoration.
3. No nameable purpose: keep only if it is a rare, first-time moment; otherwise remove it.
4. Seen tens of times a day: reduce to a colour or opacity change of 150 ms or less.
5. Over budget (above about 300 ms, or a slide where a fade says the same): shorten it.

Reduce means a smaller version of the same motion, never a different one. Before deleting, check what depends on it: an element that is invisible until its entrance finishes, unmount that waits for the exit, or a callback on the end event. Motion that bridges a jarring change (a toast that would otherwise teleport in) earns its place. Marketing pages get more latitude than product screens, but a reveal on every section still holds content back from people who scroll fast. Respect a comment or design document that explains why an animation exists. Removal is a change to existing code: list it and get approval first ([15-clean-execution](../../../rules/15-clean-execution.md) section 2), and propose, do not perform, the removal of a motion library.

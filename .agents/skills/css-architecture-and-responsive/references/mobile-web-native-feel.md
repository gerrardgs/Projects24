# Making a web app feel native on a phone

The small CSS, meta and input fixes that separate "a website in a browser" from something that feels installed. Symptoms and fixes adapted, in our own words, from the `mobile-native` skill of [emilkowalski/skill](https://github.com/emilkowalski/skill) (MIT, commit `f1090be`, read 2026-11-04). Each fix is correct where its reason applies, not as a global habit. Check each feature's support before relying on it ([modern-css](modern-css.md)).

Four rules first:

1. **Capability queries, not device sniffing.** Use `(hover: hover)`, `(pointer: fine)`, `env()` and viewport units; never branch on the user-agent string or the screen width to guess touch. Touch and mouse are not exclusive (tablets with trackpads, laptops with touch screens), so write for both and gate by capability.
2. **Never disable zoom.** `user-scalable=no` and `maximum-scale=1` fail WCAG ([10-accessibility](../../../rules/10-accessibility.md)). Fix the cause of the zoom instead (input text size).
3. **CSS or a meta tag before JavaScript.** A script that detects touch to hide hover styles is the wrong tool for a media query.
4. **The phone is the source of truth.** Desktop device emulation cannot reproduce sticky hover, tap delay, rubber-banding, safe areas or the software keyboard. Say which fixes you verified from code and which need hardware.

## Symptoms and fixes

| Symptom | Cause | Fix |
| :--- | :--- | :--- |
| A hover style stays after a tap | touch browsers fake a hover on first tap | wrap hover styles in `@media (hover: hover) and (pointer: fine)`; give press feedback through `:active`, which works on every input |
| A grey or blue flash on tap | the browser paints a highlight on tappable elements | set `-webkit-tap-highlight-color: transparent` once, and give every tappable element its own `:active` state |
| Wrong height; bottom-pinned buttons under the browser bar | `100vh` is the largest viewport (browser bar collapsed) | `100dvh` for an app shell, `100svh` for a hero (no layout shift on scroll); keep a `100vh` fallback for old browsers |
| The page zooms when an input is focused (iOS Safari) | input text under 16 px | inputs at 16 px or larger; scale down only where the platform allows. Set the keyboard too: `inputmode` (`numeric`, `decimal`), `type="email"` and `type="tel"`, `autocapitalize` and `autocorrect` where a value is a code or username, `enterkeyhint` |
| A tap feels laggy | a possible double-tap wait, and feedback only on release | `touch-action: manipulation` on controls; feedback on press (`:active`, or `pointerdown` if script is needed), kept to about 100 to 160 ms ease-out |
| Pull-to-refresh or the page bounce fights an app's own scrolling | scroll chaining to the page | `overscroll-behavior: none` on `html` and `body` for an app shell, `contain` on inner scrollers (a sheet, a chat list). Never block it with `touchmove` and `preventDefault()` |
| Content runs under the notch or home indicator | the default is a letterboxed page | `viewport-fit=cover` plus padding from `env(safe-area-inset-*)` for fixed headers, tab bars, toasts and sheets; without the meta tag the insets are `0` |
| Long-press selects a button's label | text selection on controls | `user-select: none` on controls only; never on `body`, because people copy addresses, errors and order numbers |
| A horizontal carousel makes the page jitter vertically | the browser guesses which axis you own | `touch-action: pan-y` on a horizontal track; better, native scrolling with `scroll-snap-type: x mandatory` and `scroll-snap-align` on slides |
| The status bar colour is wrong in one theme | one `theme-color` for both schemes | one `<meta name="theme-color" media="(prefers-color-scheme: ...)">` per scheme, matching the colour at the very top of the page |
| The keyboard covers a bottom-pinned input on Android | the viewport does not resize for the keyboard | `interactive-widget=resizes-content` in the viewport meta, with `dvh` |

## Baseline for a mobile-facing app

Ship these before the first component: a viewport meta with `width=device-width, initial-scale=1`, `viewport-fit=cover` and `interactive-widget=resizes-content`; `theme-color` per scheme; `-webkit-tap-highlight-color: transparent`; `touch-action: manipulation` on controls; `overscroll-behavior: none` on an app shell (not on a scrolling document); `100dvh` for the shell; 16 px inputs; hover styles behind the capability query; safe-area padding on fixed bars.

## Never ship

| Never | Instead |
| :--- | :--- |
| `user-scalable=no` or `maximum-scale=1` | 16 px inputs |
| ungated `:hover` | the capability query |
| `100vh` for an app shell or pinned UI | `100dvh` |
| press feedback on `click` only | `:active` or `pointerdown` |
| `touchmove` with `preventDefault()` to stop overscroll | `overscroll-behavior` |
| `user-select: none` on `body` | only on controls |
| `touch-action: none` on something people must scroll past | `pan-x` or `pan-y` |
| `env(safe-area-inset-*)` without `viewport-fit=cover` | add the meta tag |
| user-agent sniffing for touch | `(hover)` and `(pointer)` queries |
| calling it fixed after emulation | test on real hardware: a phone a few years old, with the keyboard open, in landscape once, and as an installed PWA when that is a target |

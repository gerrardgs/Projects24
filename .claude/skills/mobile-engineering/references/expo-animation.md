# Animation in React Native and Expo

How to decide, build and check motion in an Expo app so that it holds up on a real device. Adapted, in our own words, from the `animate-expo` skill of [emilkowalski/skill](https://github.com/emilkowalski/skill) (MIT, commit `f1090be`, read 2026-11-04); the web counterpart is the motion skills of the design repository. Library names and APIs below are as that skill states them for Reanimated 4; check the installed versions and each library's documentation before using them ([03-verification](../../../rules/03-verification.md)).

Mobile changes three things: there is no hover (every hover affordance must be redesigned as press, position or nothing); there are two runtimes (the React Native runtime and the UI runtime where worklets run every frame); and a finger is on the element, so interruptibility and velocity handoff are the baseline, not polish.

## 1. Decision order

1. **Should it animate?** Not for things done hundreds of times a day (tab switches, keyboard open and close, scrolling, settings toggles). Tabs are peers, so they do not slide. Tens of times a day: under about 150 ms or nothing. Occasional (sheets, toasts, onboarding): standard. Rare (success, celebration): the delight budget.
2. **What is the purpose?** Feedback, spatial consistency, state indication, preventing a jarring change, explanation, or delight at the rare tier. If you cannot name it, do not build it.
3. **Cheapest tool that works.**

| Need | Tool |
| :--- | :--- |
| A state-driven change with no gesture (press, toggle, colour) | Reanimated CSS transition |
| A loop, multi-stage animation, or one that plays on mount | Reanimated CSS animation |
| Mounting, unmounting, list reflow | layout animations (`entering`, `exiting`, `itemLayoutAnimation`) |
| Anything a finger touches, or anything derived from scroll | shared value, `Gesture`, `useAnimatedStyle` |
| Screen to screen, sheets, tab bar, context menus, large titles | the platform's own components through Expo Router; never hand-roll them |
| Keyboard-following UI | `react-native-keyboard-controller` |
| Vector illustration | Lottie, for illustration only, never UI state |
| A huge scene or freeform drawing | Skia |

Install through Expo (`npx expo install <package>`) so versions match the SDK. Use a shared value only for continuous or interruptible values; a press scale is a transition.

4. **Properties.** `transform` and `opacity` are cheap; layout properties re-run layout every frame for the node and its siblings. Exception: an absolutely positioned childless element (a progress fill). Never start from scale 0 (start near 0.9 to 0.97 with opacity 0). Transform order matters: translate first. Android shadows are `elevation`, and animating it re-renders the shadow, so animate the opacity of a pre-shadowed layer. Do not animate blur intensity; crossfade a static blurred layer.
5. **Timing or spring.** If a finger was involved, use a spring: it carries velocity through an interruption. Reanimated's spring takes the two designer parameters, duration and damping ratio. Starting values the source gives (test them): default settle 400 ms, damping ratio 1; snap back after a drag 400 ms, 0.8, with the release velocity; sheet or drawer 300 ms, 0.8. Bounce only when the gesture carried momentum. Everything without a finger uses ease-out (entering, exiting), ease-in-out (moving on screen) or linear (progress); never ease-in on UI. Press feedback 100 to 150 ms; small state changes 150 to 200 ms; keep UI motion under about 300 ms and leave screen transitions to the platform.

## 2. Keep it off the JavaScript thread

This is where React Native motion usually fails.

- Never `setState` from a gesture or scroll handler; one render per frame is the biggest cause of jank. A shared value feeding `useAnimatedStyle` avoids React re-rendering at all.
- Never schedule work back to the React Native runtime on every frame; do it once at the end, or react at a threshold.
- Never read or write a shared value during render. Use `.get()` and `.set()` (compiler-safe) in worklets, handlers and effects.
- Functions called from a worklet need the `'worklet'` directive, or they fail on a device while working in the debugger.
- Reanimated, not the core `Animated`, for anything a finger touches; `PanResponder` is replaced by the gesture handler.

## 3. Press, haptics, accessibility

- Feedback on press-in, commit on press-out; about 0.97 scale in 100 to 150 ms; at least 44 by 44 pt (48 dp on Android), adding `hitSlop` instead of growing the visual; a press-retention offset so a drifting finger does not cancel; an Android ripple only in a Material-styled app.
- Haptics at the causal moment, on the same frame as the visual, one per user action, never on scroll or per frame, and never the only feedback (many users disable them and most Android hardware is silent). Selection ticks for steps, light impact for a snap, medium for a heavy landing, notification feedback for success or error.
- Reduced motion means fewer and gentler: keep opacity and colour changes that explain a state, drop translation, scale, parallax and overshoot, and make screen transitions fade ([10-accessibility](../../../rules/10-accessibility.md)).
- Text scales: never animate to a hard-coded height; measure with layout or animate a transform instead.

## 4. Setup that silently breaks motion

Wrap the app in `GestureHandlerRootView` or gestures do nothing without an error. Reanimated 4 requires the New Architecture. Expo Go is not a performance environment. On ProMotion iPhones third-party animations are capped at 60 fps unless the minimum frame duration key is set (recent Expo SDKs set it); at 120 fps the frame budget is about 8 ms.

## 5. Verify

Judge feel in a release build on the slowest device you support, not in a simulator or on a flagship in development mode. State what you checked there and what you only checked in code ([07-testing](../../../rules/07-testing.md)).

# Apple conventions outside Apple's frameworks: vocabulary, Liquid Glass, code audit, Apple Pay

Companion to [apple-hig-review](apple-hig-review.md). Concepts adapted, in our own words, from [dickwu/apple-design-skill](https://github.com/dickwu/apple-design-skill) (read 2026-11-05; no licence file, so ideas only and nothing copied). Details that come from Apple's guidelines are labelled "per the third-party summary": Apple's HIG pages could not be read with the tools used here, so check each on its page before it enters a finding. Apple's App Review Guidelines page was readable and is quoted where used.

## 1. Speak the team's framework

Translate Apple's names into the framework in front of you; never water down the principle.

| Apple's term | Flutter and React Native | Tauri and Electron | Design meaning |
| :--- | :--- | :--- | :--- |
| iOS, iPadOS | mobile, tablet | | touch first, one-handed reach, compact width |
| macOS | | desktop | pointer and keyboard, multiple windows, menu bar |
| semantic and system colours | theme data, design tokens | CSS custom properties | colours named by role that adapt to light and dark |
| SF Symbols | an icon set (Material Icons, Lucide, your own) | an icon set | one consistent, weight-matched icon system |
| Dynamic Type | text scaling, font scaling | zoom and font-size settings | text scales with the person's setting |
| tab bar | a bottom navigation or tab navigator | | top-level sections, always visible |
| sidebar, split view | a rail plus a detail pane | sidebar plus content pane | a two- or three-column hierarchy |
| toolbar, navigation bar | app bar, header | toolbar | actions on the current view |
| sheet, popover | bottom sheet, modal, dialog | dialog, panel | a temporary, focused task |
| Liquid Glass | backdrop blur | `backdrop-filter`, system vibrancy | a translucent functional layer over content |
| VoiceOver | TalkBack, semantics labels | ARIA, screen readers | screen-reader support |
| safe area | safe-area insets | title bar and window chrome | content never hides under system UI |
| size classes | width and height breakpoints | media and container queries | layout keyed to the space available, not to the device |
| menu bar, Dock menu | | native app menu, tray menu | every command reachable from a menu |
| widget, Live Activity | a native extension the app feeds data to | | a glanceable surface outside the app; its views are native, so the framework supplies data, not drawing |

Conventions to check: **mobile** (Flutter, React Native) bottom tab navigation, large enough targets (about 44 pt on iOS, 48 dp on Material), layouts that follow size, safe areas, system text scaling, keyboard avoidance and the swipe gestures the platform expects. When one codebase targets iOS and Android, decide per component whether to follow each platform or share one design, and say which; tab bars, sheets and back navigation are where people notice. **Desktop** (Tauri, Electron) a native menu bar with every command, standard shortcuts and window controls, resizable and multi-window layouts, context menus, hover and pointer feedback, settings under the app menu; prefer the platform's real materials and window chrome over a web imitation.

## 2. Liquid Glass and translucent layers

Per the third-party summary of Apple's Materials, Color and Layout pages, Liquid Glass is the translucent material Apple introduced in 2025 for controls and navigation that float above content. Read it as a layered model, then check the pages.

- **Two layers.** The content layer (text, images, lists, media, backgrounds) uses standard materials when it needs depth, never glass. The functional layer (tab bars, toolbars, sidebars, navigation bars, sheets, popovers, alerts) floats above and is the only place glass belongs. Content scrolls and peeks through the functional layer.
- **Restraint.** Standard system components pick up the material on their own. On custom controls use it only for the few most important functional elements; glass on many custom controls distracts from the content and glass stacked on glass blurs the hierarchy it exists to create.
- **Variants.** The regular variant for most components and anything text-heavy or over a busy background (alerts, sidebars, popovers); the clear variant only over visually rich media such as photos and video, where a dimming layer may be needed over bright content. Both change with the person's system settings (a preferred look for the material, Reduce Transparency, Increase Contrast): design so those states still read well.
- **Colour.** Glass has no colour of its own and takes the colours behind it; symbols and text on it default to monochrome. Colour it sparingly, for primary actions and status; emphasise a primary action by colouring its background, not its label; keep one or two prominent actions per view; keep brand colour off most controls and put brand expression in the content layer. Keep controls legible in the resting state, with colourful content scrolled to the top.
- **Edges.** Prefer a scroll-edge effect (content fading and blurring where it meets a bar) to a solid or semi-opaque band under the controls, and extend visually rich content beneath sidebars, toolbars and tab bars so the material has something to reflect.

Review checklist for any glass, blur or translucent bar (on Apple platforms or in a web or cross-platform imitation):

1. Layer discipline: glass only on floating controls and navigation; on app backgrounds, cards, list rows or content containers it is a defect.
2. Restraint: count the custom glass surfaces; more than the few most important is a defect.
3. Variant fit: text-heavy or busy surfaces use the regular variant; clear only over media.
4. Colour budget: at most one or two tinted primary actions per view; labels stay monochrome over colourful content.
5. Accessibility states: Reduce Transparency gets an opaque fallback, Increase Contrast gets stronger fills and borders, Reduce Motion drops morphing and refraction animation.
6. Scroll edge: content fades where it meets a bar, with no painted band in place of the material.
7. Targets: translucency never shrinks hit areas below the platform minimum, and contrast is measured over the real background in both themes ([anti-slop-filter](../../anti-slop-filter/SKILL.md), [fluid-motion](../../motion-and-interaction/references/fluid-motion.md) section 3).

Other stacks can only approximate the material. The numbers the source suggests are practical starting points, not specifications: blur about 20 to 40 px for regular and 8 to 16 px for clear, fill about 60 to 80 percent for regular and 20 to 40 percent for clear, a modest saturation boost, a label colour that follows the luminance beneath, a scroll-edge blur band, and a dimming layer behind clear glass over bright media (the source attributes a figure of 35 percent to Apple; check the Materials page). Prefer the platform's own implementation where the framework offers it.

## 3. Reviewing code instead of screenshots

Screenshots show what a reviewer captured; code shows what every build shows, including screens nobody captured.

1. **Find every surface the store reviewer will see**, including web pages the app opens: a checkout, sign-in or account page in an in-app browser or web view (Safari view controllers, web authentication sessions, `WKWebView`, Flutter `url_launcher` or `webview_flutter`, React Native `react-native-webview` or `expo-web-browser`) is part of the app under review, even when it lives in another repository. Ask for that repository.
2. **Search, then read.** Patterns are leads for `grep` or `rg`, not findings: open the file and confirm what it renders.
3. **Report** in the format of apple-hig-review with the file and line, and mark anything inferred without running the app as unverified.

## 4. Apple Pay and payment marks

The App Review Guideline 4.9 (read on Apple's page, 2026-11-05) says: "Apps using Apple Pay must provide all material purchase information to the user prior to sale of any good or service and must use Apple Pay branding and user interface elements correctly, as described in the Apple Pay Marketing Guidelines and Human Interface Guidelines." For recurring payments it requires, at a minimum, disclosure of the length of the renewal term and that it continues until cancelled, what is provided each period, the actual charges, and how to cancel. A hand-drawn button or mark is a common reason for rejection, so a finding here is Critical.

What to search for (the patterns come from the third-party summary; the rules they enforce are on the HIG Apple Pay page, which you must read before flagging):

| Pattern | Why it matters |
| :--- | :--- |
| the Apple logo character (`U+F8FF`), a path traced from the logo, or an Apple logo from an icon set placed next to the word "Pay" | the logo is not used as a stand-in for the word Apple |
| icon-library glyphs named for Apple Pay (`fa-apple-pay`, `siApplepay` and similar) | only artwork provided by Apple is allowed; a third-party redraw is not Apple's artwork |
| an image asset named `apple_pay`, `applepay` or `apple-pay` | compare it with the files from Apple's marketing guidelines: recoloured, cropped, redrawn or re-exported files are alterations |
| CSS or style props on the mark (radius, aspect ratio, filters, shadows, transforms, animation, a removed border) | the mark is shipped unaltered, sized by height only |
| a custom button labelled "Apple Pay", "Pay" or the Apple glyph, built from a generic button, view or touchable | the button is drawn by the platform, not by your own styles |
| a text-only "Apple Pay" option beside logos for cards and other wallets | text-only is allowed only when every payment option is text-only |
| "ApplePay", "Apple pay", "APPLE PAY", or a translated or transliterated name | two words, capital A and P, never translated |
| code that hides the button or greys it out until an option is chosen | do not hide the button or make it look unavailable; explain the problem after the tap |
| a button smaller than the other payment buttons, or below the fold | size and position rules on the HIG page |

What replaces a custom button (names per the third-party summary; check the current documentation of each): SwiftUI `PayWithApplePayButton`; UIKit and AppKit `PKPaymentButton`; the web `<apple-pay-button>` element from Apple's JavaScript SDK or the `-apple-pay-button` appearance values; Flutter's `pay` package button; in React Native the native button of your payment SDK (for example Stripe's `PlatformPayButton`), avoiding wrappers that draw it in JavaScript. For the mark, ship Apple's file unchanged, set only its height, keep it at least as tall as the other payment marks and leave the clear space Apple specifies. In a repository that normalises line endings, mark the SVG as binary so the file is not rewritten.

Payment data and keys follow the usual rules: no card data in logs or analytics, keys in the environment ([06-security](../../../rules/06-security.md)), and webhooks verified ([web-integrations-and-platforms](../../web-integrations-and-platforms/SKILL.md)).

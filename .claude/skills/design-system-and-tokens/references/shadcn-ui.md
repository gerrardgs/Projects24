# shadcn/ui as sourced code under your own design system

[shadcn/ui](https://ui.shadcn.com/docs) says of itself: "This is not a component library. It is how you build your component library." Components are distributed as source you add to your project and then own. Facts read from its documentation on 2026-11-05 and from npm the same day: the CLI package `shadcn` is MIT, 4.23.0; the primitives it builds on, `radix-ui` 1.8.1 and `@base-ui/react` 1.9.0, are MIT (the documentation pages read do not name its primitives or state its licence; the package metadata does the latter). Re-run the lookup before pinning.

Because the code is copied into your repository, it is third-party code that becomes yours: read it, keep its licence and credit, and maintain it ([21-design-intelligence](../../../rules/21-design-intelligence.md) section 4, [04-dependencies](../../../rules/04-dependencies.md)).

## 1. Adopting it well

- **Pin and review.** Run the CLI at an exact version (`npx shadcn@<version> add <component>`), review the files it writes (and the dependencies it adds) before committing, and record the licence in `docs/ASSETS.md`. Add only the components the project uses.
- **Theme through tokens.** The documentation recommends CSS variables: surface tokens such as `background` and `primary`, each with a `-foreground` counterpart for text and icons on that surface; dark mode overrides the same tokens under a `.dark` selector; default values are in OKLCH; a new token is defined under `:root` and `.dark` and exposed to Tailwind with `@theme inline`. Map these names onto your design tokens ([design-system-and-tokens](../SKILL.md) section 2) instead of keeping a second, parallel set, and check contrast of every pair in both themes.
- **Own the top layer.** The top layer of component code is meant to be edited: change the component itself when the design needs it, instead of piling overrides on top.
- **Registries.** The CLI can install from configured registries ("a flat-file structure that defines the components, their dependencies, and properties"). A registry is a source of code: allow only registries you trust, and read what it installs. The MCP server for it is in [mcp-catalog](../../mcp-servers-and-integrations/references/mcp-catalog.md).

## 2. Do not ship the default look

The defaults are well made and recognised everywhere, so a project that keeps them looks like every other project that does. Distinct identity belongs in the tokens (hues, radii, type, density), in the components you modify, and in the voice and imagery around them ([project-design-identity](../../project-design-identity/SKILL.md)); the checker's axes (shape, density, type style) are exactly what the token file controls. Run the identity check before accepting a theme.

## 3. Accessibility and quality still need checking

Primitives from accessible libraries give you semantics and keyboard behaviour; they do not give you your own labels, contrast, focus visibility, error messages or reduced-motion handling. Test the assembled screens with the keyboard and a screen reader, at 200 percent zoom and in both themes ([accessibility-audit](../../accessibility-audit/SKILL.md)), and check animation for a reduced-motion path ([motion-tools](../../motion-and-interaction/references/motion-tools.md)).

## 4. Upgrades

There is no package to bump: you merge changes by hand. Diff the new component source against your modified copy, note upstream changes in the changelog, and re-run tests. Components you modified heavily may be cheaper to maintain than to re-sync.

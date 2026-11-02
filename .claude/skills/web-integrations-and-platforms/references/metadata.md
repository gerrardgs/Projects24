# Page metadata: audit and fix

A checklist for the head of an HTML page: title, description, canonical, indexing, social cards, icons, structured data and language. Ideas adapted, in our own words, from the `fixing-metadata` skill of [ibelick/ui-skills](https://github.com/ibelick/ui-skills) (MIT, commit `4907a52`, read 2026-11-02). It complements [section 6 of the skill](../SKILL.md) and [16-project-documentation](../../../rules/16-project-documentation.md) (`docs/SEO.md`).

Keep the change scoped to metadata: do not refactor unrelated code, do not migrate frameworks or SEO libraries unless asked, and follow the project's existing pattern (a framework metadata API, a head component, plain tags).

## Order of work

1. List the pages with missing or wrong metadata.
2. Fix the critical problems first: duplicates, wrong canonical, accidental indexing rules.
3. Make title, description, canonical and `og:url` agree with each other.
4. Check social cards on a real, public URL, not on localhost.

## Checklist, by priority

| Priority | Area | Rules |
| :--- | :--- | :--- |
| 1, critical | Correctness and duplication | Define metadata in one place per page; no competing systems; no duplicate title, description, canonical or robots tags; values are deterministic (no random or unstable output); escape user-generated strings; every page has a safe default title and description |
| 2, high | Title and description | Every page has a title; one consistent title format; short and readable, no stuffing; shareable or searchable pages have a plain-text description (no Markdown, no quote spam) |
| 3, high | Canonical and indexing | The canonical points to the preferred URL; `noindex` only for private, duplicate or non-public pages; the robots meta matches real access intent; previews and staging are `noindex` where possible; paginated pages canonicalise correctly |
| 4, high | Social cards | Shareable pages set Open Graph title, description and image; images use absolute URLs, with stable dimensions and aspect ratio; `og:url` equals the canonical; a sensible `og:type`; `twitter:card` set, `summary_large_image` by default |
| 5, medium | Icons and manifest | At least one favicon that works across browsers; an Apple touch icon where relevant; a valid, referenced manifest when used; `theme-color` set on purpose; stable, cacheable icon paths |
| 6, medium | Structured data | Only when it maps to real page content; valid and matching what is rendered; never invent ratings, reviews, prices or organisation details; one block per page unless more is required |
| 7, low to medium | Language and alternates | A correct `<html lang>`; `og:locale` when the site is localised; `hreflang` alternates only for pages that exist; each locale canonicalises to itself |

## Review habits

- Prefer stable, boring metadata over clever or dynamic.
- Invented structured data is a fabrication ([AGENTS.md](../../../../AGENTS.md) non-negotiable 1) and can be penalised by search engines.
- A preview image is a public asset: licence and credit it like any other ([13-visual-assets-and-licensing](../../../rules/13-visual-assets-and-licensing.md)), and do not put private data in it.
- Report what you checked and where (a real URL, a validator, the page source), not what you assume.

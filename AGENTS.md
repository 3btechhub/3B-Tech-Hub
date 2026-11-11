# Website UI and CSS Rules

These rules apply to every production page in this repository. GitHub Pages publishes the `site/` directory.

## Single source of truth
- `site/assets/style.css` is the canonical production design system.
- Reuse existing styles for buttons, inputs, selects, textareas, labels, cards, panels, notices, links, typography, icons, borders, radii, spacing, focus states and responsive sizing.
- Do not duplicate common component styles in page-level or embedded styles.
- Change shared design tokens/rules centrally and let every page inherit them.
- Page-specific CSS is allowed only for genuinely unique layout composition and must use the existing shared tokens.
- Do not add redundant selectors, parallel variants, unnecessary overrides or extra `!important` declarations.
- Prefer semantic classes and existing shared component classes.

## Required implementation approach
1. Inspect `site/assets/style.css` before styling.
2. Search for an existing style before adding a new rule.
3. Fix inconsistent shared styles at their source rather than adding another override.
4. Keep page styles focused on unique layout composition.
5. Verify light/dark themes, narrow/wide viewports, keyboard focus and overflow when browser tooling is available.
6. Never claim browser visual verification unless it was actually performed.

## Design principles
- Maintain the monochrome black, white and neutral-gray palette.
- Keep typography, controls, cards, borders, radii, icons and spacing consistent by semantic role.
- Keep touch targets readable and accessible.
- Prefer content-driven sizing, flexible layouts and wrapping over fixed dimensions that cause overflow.
- Keep the interface clean, minimal and balanced.
- The floating menu remains right-anchored and center-aligned; do not add a backdrop.
- Do not introduce a new hosting/backend provider. Production architecture is GitHub Pages + Supabase.

## Completion requirements
- A shared-style change must remain consistent across all production pages.
- Report which shared rules changed and which checks actually ran.
- Do not describe the unshipped `src/` prototype as part of the production site.

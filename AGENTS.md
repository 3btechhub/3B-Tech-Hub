# Website UI and CSS Rules

These rules apply to every page, route, component, and admin screen in this repository.

## Single source of truth

- `src/app/globals.css` is the canonical source for the website-wide design system.
- If a visual element already has a shared style (for example: buttons, inputs, selects, textareas, labels, cards, panels, notices, links, typography, icons, borders, radii, spacing, focus states, or responsive control sizing), every page MUST use that shared style. Do not redefine the same visual treatment in a page stylesheet, component stylesheet, embedded `<style>` block, or inline style.
- Shared design values must be changed centrally in the global design tokens/rules. Update the canonical rule once and let all pages inherit it.
- Prefer shared semantic classes and existing global component classes. If a genuinely reusable component style is missing, add it once to `globals.css` and reuse it everywhere.
- Page-level CSS is allowed only for page-specific composition or a genuinely unique component. It must consume the global tokens and shared component rules; it must not restyle common elements.
- Do not add duplicate selectors, parallel variants, page-specific overrides, or extra `!important` declarations to compensate for conflicting styles. Consolidate the original rule instead.
- Do not add presentation through React inline `style` props or embedded style blocks. Move reusable presentation to the canonical stylesheet; use inline styles only when a value is truly dynamic and cannot reasonably be represented by a class or CSS custom property.

## Required implementation approach

1. Before styling a page, inspect `src/app/globals.css` and reuse the existing token/class for the element.
2. Search the repository for existing styles of the same element before creating a new rule.
3. If the same element has inconsistent styles across pages, fix the shared source and remove redundant page-level declarations rather than adding another override.
4. Keep page styles focused on layout structure only (for example, a unique grid arrangement), using shared tokens such as colors, typography, spacing, control dimensions, and radii.
5. When adding a new reusable visual pattern, define it centrally, give it a clear semantic class, and use that class on every relevant page.
6. Verify light and dark themes, narrow and wide viewports, keyboard focus, and content overflow after changes. Do not silently clip or truncate meaningful content.

## Design principles

- Maintain the site's monochrome black, white, and neutral-gray palette.
- Keep typography, controls, cards, borders, corner radii, icon sizing, and spacing consistent by semantic role across the whole site.
- Preserve readable, normal text and icon sizes and comfortable touch targets.
- Follow the project's Space Adaptation & Fairness Logic: components should adapt their own layout and size to available space before taking space another component needs; create additional space when necessary and feasible; never force unnecessary stretching or shrinking.
- Prefer content-driven sizing, flexible layouts, wrapping, and responsive constraints over fixed dimensions that cause overflow.
- Keep the interface clean, minimal, balanced, and accessible.

## Completion requirements

- A styling change is not complete if it fixes only one page while leaving the same shared element inconsistent elsewhere.
- Report which shared rules were changed, which pages/components now consume them, and what responsive/theme checks were actually run.
- Never claim browser visual verification unless it was actually performed.

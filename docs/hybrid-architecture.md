# Minimal-Code Hybrid Architecture

## Governing principle

**Code defines HOW. Database defines WHAT, WHICH, WHERE, WHEN and WITH WHAT SETTINGS.**

The production application remains a small, trusted execution core. Supabase stores changeable values, content, configuration, page definitions and references to prebuilt capabilities.

This is not a promise that arbitrary new executable behavior can be created from SQL/JSON. New executable capabilities require reviewed code; the database can select and configure only registered capabilities.

## Hardcoded core — keep it minimal

- Runtime bootstrap and Supabase client initialization.
- Generic renderers and component registry.
- Reusable layout and design engines.
- Routing and page-resolution engine.
- Registered function/action handlers.
- Authentication, authorization and security enforcement.
- Input validation, sanitization and safe fallbacks.
- Data access layer and cache/invalidation logic.

These are mechanisms, not site-specific content or presentation values.

## Database-driven configuration and data

- Design tokens: colors, typography, sizes, spacing, radii, borders and shadows.
- Branding: site name, logo references, favicon and identity content.
- Layout configuration: header/footer composition, content widths, section ordering and responsive variants.
- Component configuration: component type, registered variant, content bindings and allowed options.
- Navigation: labels, links, ordering, visibility and region/locale conditions.
- Page hierarchy: Main Pages, Sub Pages, parent relationships, slugs, status and ordering.
- Page content: text, structured blocks, media references and localized content.
- Feature configuration: enabled modules and approved behavior options.
- Function configuration: registered action identifier plus validated parameters (never executable source).
- SEO: title, description, canonical path, social metadata and indexing directives.
- Business data: products, services, workshops and technicians.

## Runtime contract

1. Fetch the public runtime configuration once per page load and reuse it.
2. Validate the schema version and each value against a code-owned allowlist.
3. Apply configuration through CSS custom properties, registered components and safe DOM APIs.
4. Load only the page/content records needed for the current route.
5. Cache public configuration with a bounded lifetime and refresh it after an Owner publishes changes.
6. If configuration is unavailable or invalid, use minimal safe defaults and keep the page usable.
7. Never use eval, Function, inline event code, arbitrary SQL, untrusted selectors or arbitrary HTML from database values.
8. Security decisions are never delegated to public configuration. RLS and trusted server-side checks remain authoritative.

## Data model direction

The existing `public.site_settings` table is the initial key/value configuration store. The `runtime_config` key uses a versioned JSON document with:
- `themes.light` and `themes.dark`
- `layout`
- `branding`
- `features`

Existing catalogue tables remain the source of truth for products, services, workshops and technicians. `site_content` remains the page-content foundation. A later migration should add explicit page/component relations only after the generic page renderer and Admin workflow are designed together.

## Implementation status

### Phase 1 — runtime configuration foundation
- Add a public, versioned `runtime_config` setting without overwriting existing settings.
- Load it once through the public `site_settings` read policy.
- Apply only allowlisted design and layout tokens.
- Reject unsafe values and fail closed to the existing minimal CSS defaults.
- Add unit tests for validation, application and unavailable-database behavior.

### Remaining phases
- Replace remaining page-specific literals with semantic configuration/component references.
- Build a generic component registry and data-driven layout renderer.
- Implement dynamic Main Page/Sub Page hierarchy and route resolution.
- Add safe registered action handlers for configurable interactions.
- Build Owner-only editors for design tokens, layout, navigation, pages and components.
- Add revision, preview, publish and rollback workflow.
- Verify RLS, accessibility, responsive behavior, performance and browser E2E before production rollout.

## Performance and SEO constraints

- Do not issue a database query for each component or token.
- Fetch configuration in one request, cache it, and batch page data where possible.
- Keep first-render defaults small and avoid blocking critical content on optional settings.
- Keep page titles and descriptions available to crawlers; use route-level static metadata or pre-rendered metadata until a crawler-friendly rendering strategy is implemented.
- Lazy-load below-the-fold media and avoid shipping unused component code.

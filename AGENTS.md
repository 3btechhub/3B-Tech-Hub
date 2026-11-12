# Website Implementation Rules

Read `docs/master-spec.md` before changing production code. It is the single source of truth for the allowed website scope.

## Scope
- Only the structure, layout, features, dashboard modules, user types, country routes and languages in `docs/master-spec.md` may appear in production.
- Services, Products, Workshops and Technicians are approved content modules with fields defined in docs/master-spec.md. Do not add Media Library, bookings, or other unapproved modules.
- Canonical country identifiers are exactly `global`, `bd`, and `ksa`; language defaults are `en`, `bn`, and `ar` respectively.
- Global content is visible on every route; country-specific content is restricted to its matching route.
- Owner `3btechhub@gmail.com` is fixed and protected. Allowed user types are Owner, Admin, Member and Visitor.

## Centralized UI
- `site/assets/style.css` is the canonical design system.
- Use only monochrome black/white with neutral gray hierarchy.
- Use shared semantic sizes Small, Medium and Large for text, buttons and input/output controls.
- Reuse shared components and tokens. Avoid duplicate styles, overrides and hard-coded repeated page layouts.
- Provide theme-aware light/dark icon appearances.
- Verify responsive behavior, focus, contrast and RTL Arabic layout where tooling is available.

## Security
- GitHub Pages serves only static client code.
- Supabase handles authentication, PostgreSQL, RLS, Storage and Edge Functions.
- Never expose a service-role or secret key in browser code.
- Enforce roles and data access with RLS and trusted server-side functions; hiding UI is not authorization.
- Keep the fixed Owner protected from demotion, deletion and blocking.
- Do not make unrelated Supabase security changes outside the requested scope.

## Validation and reporting
- Run `npm run validate` after code changes when possible.
- Run the relevant GitHub Actions checks.
- Report only checks actually performed; never claim visual/browser verification without performing it.
- Keep changes on the active feature branch until reviewed. Do not push scope changes directly to `main`.

# Dynamic Page Engine

## Data model
- `pages`: Main Pages (`parent_id = null`) and Sub Pages (`parent_id` points directly to a Main Page).
- `page_components`: ordered allowlisted component instances and JSON configuration.
- `page_revisions`: JSON snapshots for rollback.
- Each page has a country scope: `global`, `bd` or `ksa`.

## Country and language behavior
- Global pages are visible on every country route.
- BD pages are visible only on `/bd/`.
- KSA pages are visible only on `/ksa/`.
- Global route uses Global pages only.
- Country-specific pages take precedence over a Global page with the same slug.
- Page language is independently selected from `en`, `bn` or `ar`; Arabic uses RTL.
- The page country column and country-aware unique indexes require the pending Supabase migration described in the implementation checklist.

## Trust boundary
The database stores content and validated configuration only. It never stores executable JavaScript, SQL, HTML templates or arbitrary function bodies. The frontend renderer has a fixed allowlist of component handlers. Unknown component types are ignored.

## Routing
- GitHub Pages `404.html` acts as a safe fallback for non-static paths.
- Dynamic routes use `/<main-slug>` and `/<main-slug>/<sub-slug>` below the GitHub Pages project base path.
- Account, Profile, Dashboard and country roots are reserved static routes.
- Only published pages are fetched; components are fetched in one batched query.
- Unknown, unpublished, malformed and failed lookups retain the not-found experience.

## Registered components
`hero`, `rich_text`, `image`, `card_grid`, `button_group`, `faq`, `spacer`.

## Page module
Owner/Admin can create, edit, publish, archive and delete Main/Sub Pages, edit components, set ordering, preview content, manage SEO and review revisions. Admin access is limited by RLS and trusted authorization.

## Verification
Node tests cover safe slugs, reserved routes, country-specific precedence, Main/Sub grouping and ordering. Browser tests cover navigation and safe text rendering. Production browser verification remains pending.

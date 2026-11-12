# Dynamic Page Engine

## Data model
- `pages`: Main Pages (`parent_id = null`) and Sub Pages (`parent_id` points directly to a Main Page).
- `page_components`: ordered, allowlisted component instances and JSON configuration.
- `page_revisions`: JSON snapshots for future rollback support.

## Live database
- The initial schema and hardening migrations are applied to the production Supabase project.
- RLS is enabled on all three tables. Public reads are limited to published pages/components; writes require the existing site-admin authorization helper.
- A database trigger prevents Sub Pages from nesting below another Sub Page and prevents publishing a child beneath an unpublished Main Page.
- Main Page and component updates maintain `updated_at` using the existing shared trigger function.
- Table grants are least-privilege: public SELECT only; authenticated writes are limited to page/component CRUD and revision insert. TRUNCATE, REFERENCES and TRIGGER privileges are revoked.
- Foreign-key indexes cover creator/updater references used for attribution and cleanup.
- Migration filenames match the versions recorded in Supabase migration history.

## Trust boundary
The database stores content and validated configuration only. It never stores executable JavaScript, SQL, HTML templates, or arbitrary function bodies. The frontend renderer has a fixed allowlist of component handlers. Unknown component types are ignored.

## Routing
- GitHub Pages `404.html` acts as a safe fallback for non-static paths.
- Dynamic routes use `/<main-slug>` and `/<main-slug>/<sub-slug>` below the GitHub Pages project base path.
- Existing static routes are reserved and never intercepted by the dynamic resolver.
- Only published pages are fetched; component data is fetched in one batched query.
- Unknown, unpublished, malformed, and failed lookups retain the not-found experience.

## Initial registered components
`hero`, `rich_text`, `image`, `card_grid`, `button_group`, `faq`, `spacer`.

## Owner/Admin Page Builder
- Owner/Admin dashboard includes Main/Sub Page CRUD, Draft/Publish/Archive, structured component editing, ordering, preview, SEO fields and revision restore.
- Published pages automatically appear in the matching-language navigation; drafts and archived pages stay hidden.
- Sub Pages are grouped under their Main Page in navigation and use nested URLs.
- The navigation uses the existing page schema; no arbitrary HTML, script or SQL is evaluated.

## Automated verification
- Node tests validate safe slugs, reserved static route protection, Main/Sub grouping and sort order.
- A Chromium browser test checks rendered navigation links and verifies dynamic page content is inserted as text rather than executable markup.
- GitHub Actions runs the syntax, regression and browser checks before allowing Pages deployment.

## Remaining work
1. Verify the live Supabase-backed navigation and dynamic deep links in the production browser after an authorized merge and deployment.

# Dynamic Page Engine — Phase 1

## Data model
- `pages`: Main pages (`parent_id = null`) and Sub pages (`parent_id` points to a Main page).
- `page_components`: ordered component instances and JSON configuration.
- `page_revisions`: JSON snapshots for future rollback support.

## Trust boundary
The database stores content and validated configuration only. It never stores executable JavaScript, SQL, HTML templates, or arbitrary function bodies. The frontend renderer has a fixed allowlist of component handlers. Unknown component types are ignored.

## Access model
- Public visitors can read published pages and their components only.
- Site admins can read drafts and manage pages/components/revisions through existing `private.is_site_admin()`.
- Revision writes are admin-only.
- RLS is enabled for every new public table.

## Initial registered components
`hero`, `rich_text`, `image`, `card_grid`, `button_group`, `faq`, `spacer`.

## Next phases
1. Route resolver and public page data loader.
2. Owner/admin page editor (create, edit, reorder, draft, publish, archive).
3. Revision snapshot and restore workflow.
4. Navigation and SEO integration.
5. Preview and browser end-to-end tests.

# Master-Spec Refactor Status

Updated: 2026-11-12

## Approved scope

See [master-spec.md](master-spec.md). This is the only allowed website specification.

## Work completed on `refactor/master-spec-2026-11-12`

- [x] Created a dedicated refactor branch from `main`.
- [x] Preserved the existing `backup/2026-11-12-before-scope-reset` source branch.
- [x] Added the authoritative master specification and repository implementation rules.
- [x] Simplified Global, BD and KSA home pages.
- [x] Standardized canonical country identifiers to `global`, `bd` and `ksa`.
- [x] Added the Account route and retained `/login/` as a compatibility redirect.
- [x] Replaced dashboard navigation with Overview, Audit, User, Role, Permission and Settings.
- [x] Removed Services, Products, Workshops and Technicians frontend routes and product-catalog code.
- [x] Restricted the user administration Edge Function source to Admin and Member.
- [x] Updated role UI to treat legacy Customer/Staff/Editor/Manager assignments as Member during transition.
- [x] `npm run validate` and dynamic-page browser navigation tests pass in GitHub Actions (CI run 990).
- [x] Applied Supabase migration `20261112103919_add_runtime_configuration`.
- [x] Applied Supabase migration `20261112103930_add_country_scope_and_member_role`; the role check accepts Member.
- [x] Removed `pages`, `page_components`, `page_revisions` and `site_content` tables, the dynamic page hierarchy function, triggers and policies.
- [x] Removed the Page Builder, dynamic page routing/rendering assets, tests and dedicated documentation.

## Still required before merge/deployment

- [ ] Complete final migration: archive legacy rows privately, convert Customer to Member, remove Manager/Editor/Staff role values, then drop out-of-scope tables `site_content`, `products`, `services`, `workshops`, `technicians` and `media_assets`.
- [ ] Deploy the updated `owner-users` Edge Function with the new frontend.
- [ ] Verify Owner/Admin/Member authorization and audit behavior in a browser.
- [ ] Verify IP routing, Global fallback, manual route selection, language defaults, language switching and Arabic RTL.
- [ ] Verify country routing, Account, Profile and Settings in a browser.
- [ ] Run the final GitHub Actions checks after the remaining changes.
- [ ] Review the final diff and merge only after all required checks pass.

## Data safety note

The live database still contains catalogue tables and records (9 Products, 6 Services, 2 Workshops and 3 Technicians). They have not been dropped. The source backup branch protects code only; it is not a database or Storage backup. The final migration must archive legacy rows into a private, non-API schema before dropping active legacy tables.

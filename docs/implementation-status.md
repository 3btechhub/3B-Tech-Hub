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
- [x] Replaced dashboard navigation with Overview, Audit, Page, User, Role, Permission and Settings.
- [x] Removed Services, Products, Workshops and Technicians frontend routes and product-catalog code.
- [x] Added country scope to the Page Builder, dynamic navigation and dynamic page resolver.
- [x] Restricted the user administration Edge Function source to Admin and Member.
- [x] Updated role UI to treat legacy Customer/Staff/Editor/Manager assignments as Member during transition.
- [x] `npm run validate` and dynamic-page browser navigation tests pass in GitHub Actions (CI run 990).
- [x] Applied Supabase migration `20261112103919_add_runtime_configuration`.
- [x] Applied Supabase migration `20261112103930_add_country_scope_and_member_role`; live `pages.country` is now constrained to Global/BD/KSA and the role check accepts Member.

## Still required before merge/deployment

- [x] Converted the two legacy Workshop records into a Workshops Main Page with two Sub Pages.\n- [x] Converted the three legacy Technician records into a Technicians Main Page with three Sub Pages, preserving country, phone, WhatsApp and image URLs.\n- [x] Converted all five legacy Technician Storage image objects into an Images Main Page with five Sub Pages, retaining original Storage URLs.\n- [x] Enabled Home visibility for all 13 converted Main/Sub Pages and added responsive homepage sections/cards with image, contact and location rendering.
- [x] Added optional Page contact fields and explicit `visibility` column to the live `pages` table; Page Builder form now includes Location, Phone, WhatsApp, Email, Image URL and Home visibility.
- [ ] Complete final migration: archive legacy rows privately, convert Customer to Member, remove Manager/Editor/Staff role values, then drop out-of-scope tables `site_content`, `products`, `services`, `workshops`, `technicians` and `media_assets`.
- [ ] Deploy the updated `owner-users` Edge Function with the new frontend.
- [ ] Verify Owner/Admin/Member authorization and audit behavior in a browser.
- [ ] Verify IP routing, Global fallback, manual route selection, language defaults, language switching and Arabic RTL.
- [ ] Verify Page Builder, country-scoped content, converted Workshop/Technician/Image homepage sections, Account, Profile and Settings in a browser.
- [ ] Run the final GitHub Actions checks after the remaining changes.
- [ ] Review the final diff and merge only after all required checks pass.

## Data safety note

The live database still contains legacy catalogue tables and their source records (9 Products, 6 Services, 2 Workshops and 3 Technicians), plus the five original Technician image objects in Storage. Workshop, Technician and Image information has been copied into the new Pages tree; original source rows and Storage objects remain intact and must not be deleted until the private archive/backup and final cleanup are separately verified. The source backup branch protects code only; it is not a database or Storage backup.

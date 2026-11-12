# 3B TECH HUB — Approved Data Model

The live Supabase project is `sburxeuxkrilbfppxylm` in `ap-northeast-1`.

## Approved application tables

| Table | Purpose |
|---|---|
| `user_profiles` | Member profile fields and preferred language |
| `user_roles` | Protected Owner/Admin/Member assignments |
| `pages` | Main Page and Sub Page records, including country scope, visibility, optional contact and image fields |
| `page_components` | Allowlisted page layout components |
| `page_revisions` | Page revision snapshots |
| `site_settings` | Website title, logo reference and centralized configuration |
| `audit_logs` | Append-only administrative activity |

Every exposed table must have RLS enabled and least-privilege policies. Visitor is anonymous access, not an assigned role row.

Page records include required title/type/country, optional description/location/phone/WhatsApp/email/image, and a `visibility` flag for Home sections. Sub Pages require a valid Main Page parent. Draft or hidden pages are not public.

## Country identifiers

Only `global`, `bd` and `ksa` are canonical. The live `pages.country` column enforces these values. Global content is visible everywhere; BD and KSA content are restricted to their matching route.

## Access-control intent

- Visitor: published public pages only.
- Member: read/update own profile and use public pages.
- Admin: approved page operations and audit access.
- Owner: all approved dashboard modules, user/role administration and settings.
- Audit records are append-only for application users.

## Pending legacy cleanup

The production database still contains legacy tables and rows for Products, Services, Workshops, Technicians, old site content and media metadata. The final cleanup migration will archive these rows in a private schema, convert old role names to Member, and drop the out-of-scope public tables after the new frontend and Edge Function are deployed.

## Data safety

- Keep schema changes in version-controlled migrations.
- Protect the fixed Owner account from demotion, deletion and blocking.
- Store only changed column names in audit metadata; do not copy full rows or profile details.
- Never expose private profile data or service credentials through the public Data API.
- Do not claim a database backup until an export/archive and restore test are verified.

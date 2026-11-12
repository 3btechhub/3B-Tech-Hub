# 3B TECH HUB — Approved Data Model

The live Supabase project is `sburxeuxkrilbfppxylm` in `ap-northeast-1`.

## Approved application tables

| Table | Purpose |
|---|---|
| `user_profiles` | Member profile fields and preferred language |
| `user_roles` | Protected Owner/Admin/Member assignments |
| `site_settings` | Website title, logo reference and centralized configuration |
| `audit_logs` | Append-only administrative activity |

Every exposed table must have RLS enabled and least-privilege policies. Visitor is anonymous access, not an assigned role row.

## Country identifiers

Only `global`, `bd` and `ksa` are canonical route identifiers. Country routing is handled by the static frontend.

## Access-control intent

- Visitor: public website access only.
- Member: read/update own profile and use public pages.
- Admin: Overview and Audit access.
- Owner: all approved dashboard modules, user/role administration and settings.
- Audit records are append-only for application users.

## Pending legacy cleanup

The former page/content tables and dynamic page engine have been removed. Products, Services, Workshops, Technicians and media metadata remain separate modules and have not been removed.

## Data safety

- Keep schema changes in version-controlled migrations.
- Protect the fixed Owner account from demotion, deletion and blocking.
- Store only changed column names in audit metadata; do not copy full rows or profile details.
- Never expose private profile data or service credentials through the public Data API.
- Do not claim a database backup until an export/archive and restore test are verified.

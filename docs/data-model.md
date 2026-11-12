# 3B TECH HUB — Approved Data Model

The live Supabase project is `sburxeuxkrilbfppxylm` in `ap-northeast-1`.

## Approved application tables
| Table | Purpose |
|---|---|
| `user_profiles` | Member profile fields: display name and phone |
| `user_roles` | Protected Owner/Admin/Member assignments |
| `site_settings` | Website title, logo reference and centralized configuration |
| `audit_logs` | Append-only administrative activity |
| `services` | Shared service catalogue |
| `products` | Shared product catalogue |
| `workshops` | Shared workshop catalogue |
| `technicians` | Shared technician catalogue |
| `media_assets` | Media metadata for uploaded content |

Every exposed table must have RLS enabled and least-privilege policies. Visitor is anonymous access, not an assigned role row.

## Content scope
Services, Products, Workshops and Technicians are shared across the single website. Their records do not carry country identifiers or country-based visibility rules. User profiles do not store a preferred language or locale.

## Access-control intent
- Visitor: public website access only.
- Member: read/update own profile and use public pages.
- Admin: Overview and Audit access.
- Owner: all approved dashboard modules, user/role administration and settings.
- Audit records are append-only for application users.

## Data safety
- Keep schema changes in version-controlled migrations.
- Preserve content rows when removing obsolete metadata columns.
- Protect the fixed Owner account from demotion, deletion and blocking.
- Store only changed column names in audit metadata; do not copy full rows or profile details.
- Never expose private profile data or service credentials through the public Data API.
- Do not claim a database backup until an export/archive and restore test are verified.

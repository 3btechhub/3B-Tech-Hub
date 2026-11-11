# 3B TECH HUB — Supabase Data Model

The live database is Supabase project `sburxeuxkrilbfppxylm` in `ap-northeast-1`.

## Live application tables
| Table | Purpose |
|---|---|
| `user_profiles` | User display name, phone and profile settings |
| `user_roles` | Server-controlled role assignments |
| `site_content` | Structured website content |
| `products` | Product types and group/country routing |
| `services` | Six country-specific service categories |
| `media_assets` | Metadata for approved media |
| `site_settings` | Website configuration |
| `audit_logs` | Append-only administrative event history |
| `workshops` | Workshop listings |
| `technicians` | Technician listings |

## Product grouping
- `mobile` → Mobile & Accessories
- `satellite` → Satellite & TV Equipment

Product records describe a product type/category, not an individual stock item. Country values are `bd`, `saudi`, `global` or null where the schema allows it.

## Service routing
Bangladesh:
- TV Repair
- Mobile Repair
- Mobile Parts Sell

Saudi Arabia:
- Satellite Dish Installation
- Satellite Dish Servicing
- Satellite Dish Parts Sell

## Access-control intent
- Public visitors: read active/published public catalogue and media only.
- Authenticated customer: read/update own profile.
- Admin: delegated catalogue operations only; no Owner-role assignment.
- Owner: highest authority, role management and system configuration.
- Audit logs: application roles cannot update or delete audit entries.

## Data safety
- Keep migrations in version control and reconcile applied migration versions before future schema work.
- Add indexes to foreign-key columns used in joins/deletes.
- Store only changed column names in audit metadata; do not copy full rows.
- Never expose private profile data or service credentials through the public Data API.
- Do not claim a database backup until a full export and restore test are verified.

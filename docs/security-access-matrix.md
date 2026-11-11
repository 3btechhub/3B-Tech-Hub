# 3B TECH HUB — Supabase Access Control Matrix

| Capability | Anonymous | Customer | Staff | Manager | Admin | Owner |
|---|---:|---:|---:|---:|---:|---:|
| Read active public catalogue | Yes | Yes | Yes | Yes | Yes | Yes |
| Read own profile | No | Yes | Yes | Yes | Yes | Yes |
| Update own profile | No | Yes | Yes | Yes | Yes | Yes |
| Manage products/services/workshops/technicians | No | No | No | No | Delegated | Yes |
| Read all user roles | No | No | No | No | Read only | Yes |
| Create/change roles | No | No | No | No | No | Yes |
| Grant Owner role | No | No | No | No | No | Protected Owner workflow only |
| Read audit logs | No | No | No | No | Yes | Yes |
| Update/delete audit logs | No | No | No | No | No | No |
| Manage site settings | No | No | No | No | No | Yes |

## Enforcement requirements
1. RLS is enabled on every exposed application table.
2. Anonymous role receives SELECT only on explicitly public tables.
3. Authenticated role receives only the table privileges needed by the application; RLS still restricts each row and operation.
4. Profile SELECT/UPDATE must be restricted to `auth.uid()`, with a separate trusted Owner policy where necessary.
5. User-role INSERT/UPDATE/DELETE must be Owner-only. Admin must never be able to promote itself or another account to Owner.
6. UPDATE policies must include both `USING` and `WITH CHECK`.
7. Storage writes must be Owner/Admin-only; public reads must be limited to approved public assets.
8. Audit rows are append-only to application roles and readable only by authorized administrators.
9. Never use user-editable JWT metadata as an authorization source.
10. Never expose service-role credentials to browser code.

## Current verification boundary
RLS is enabled on all 10 public tables. The audit hardening migration is applied and verified: anonymous application-table writes are revoked, user-role changes are Owner-only, the primary Owner is protected, audit triggers are active and workshop FK indexes exist. Browser-level negative access tests and the complete admin UI release checks are still pending.

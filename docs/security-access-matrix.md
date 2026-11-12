# 3B TECH HUB — Access Control Matrix

| Capability | Visitor | Member | Admin | Owner |
|---|---:|---:|---:|---:|
| Read public pages | Yes | Yes | Yes | Yes |
| Read/update own profile | No | Yes | Yes | Yes |
| Manage Main/Sub Pages | No | No | Yes | Yes |
| Read Audit | No | No | Yes | Yes |
| Manage Users | No | No | No | Yes |
| Assign Admin/Member roles | No | No | No | Yes |
| Manage Permission policy | No | No | No | Yes |
| Manage Website Settings | No | No | No | Yes |
| Change/delete protected Owner | No | No | No | No |
| Update/delete Audit rows | No | No | No | No |

## Enforcement
1. RLS is enabled on every exposed application table.
2. Anonymous visitors receive SELECT only on explicitly public data.
3. Authenticated access is row-restricted; authentication alone is not authorization.
4. Profile SELECT/UPDATE is restricted to `auth.uid()`, with trusted Owner access where required.
5. User-role INSERT/UPDATE/DELETE is Owner-only.
6. UPDATE policies include both `USING` and `WITH CHECK`.
7. Audit rows are append-only for application roles.
8. Never use user-editable JWT metadata as an authorization source.
9. Never expose service-role credentials to browser code.

## Migration status
The current production database still has legacy role values and out-of-scope tables. The refactor branch changes the application role vocabulary and prepares the required database migration; do not merge/deploy until the migration is reviewed and verified.

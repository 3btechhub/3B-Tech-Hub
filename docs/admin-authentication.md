# Account Authentication and Authorization

## Identity
- Supabase Auth email/password is the identity provider.
- The static frontend uses only the Supabase publishable key.
- The authenticated user's UUID comes from the verified Supabase session.
- `3btechhub@gmail.com` is the fixed primary Owner in `public.user_roles`.
- Browser-supplied email, role or user UUID is never sufficient authorization.

## User types
- Owner: full access to all approved modules; fixed and protected.
- Admin: Overview, Audit and Page management; cannot manage users, roles, permissions or system settings.
- Member: own Account and Profile only, plus public pages.
- Visitor: anonymous public access only; no Auth role row.

## Enforcement
- RLS is enabled on every exposed application table.
- UPDATE policies include both `USING` and `WITH CHECK`.
- User-role changes are Owner-only.
- Anonymous visitors receive no application-table write privileges.
- Never authorize from user-editable metadata or hidden UI controls.
- Never expose Supabase secret/service-role keys in client code.

## Audit
- Record actor UUID, action, resource type, resource ID and changed column names.
- Never store passwords, tokens, API keys, complete profile rows or unnecessary personal data.
- Audit records are append-only for application roles and readable by Admin/Owner.

## Owner administration endpoint
The `owner-users` Edge Function checks the caller's verified Auth session and the Owner role before listing users, inviting Members/Admins, changing roles, blocking/unblocking accounts or sending password-reset emails. The service-role key remains inside the Edge Function runtime only.

The primary Owner cannot be blocked, demoted, deleted or replaced. The Owner role cannot be granted through the user-management endpoint. Admins cannot invoke this endpoint.

# Admin Authentication and Authorization

## Production identity
- Supabase Auth email/password is the identity provider.
- The static site uses the public publishable key only.
- The authenticated user's UUID comes from the verified Supabase session.
- `3btechhub@gmail.com` is the highest-authority Owner; its Owner role is stored in `public.user_roles`.
- No browser-supplied email, role or user UUID is sufficient authorization by itself.

## Access rules
- Owner: full authority, including role assignment and system-level actions.
- Admin: only explicitly delegated catalogue/content operations; cannot grant or modify Owner roles.
- Manager/Editor/Staff: no authority unless a matching RLS policy and tested workflow explicitly grants it.
- Customer: own profile only.
- Anonymous visitor: public active/published content only.

## Enforcement
- Every exposed table has RLS enabled.
- UPDATE policies must include both `USING` and `WITH CHECK`.
- Role-management writes must be Owner-only.
- Public visitors must not have INSERT, UPDATE or DELETE table privileges.
- Never authorize from user-editable metadata or hidden UI controls.
- Never expose Supabase secret/service-role keys in client code.

## Audit events
- Record actor UUID, action, resource type, resource ID and changed column names.
- Never store passwords, tokens, API keys, complete profile rows or other unnecessary personal data.
- Audit records are append-only for application roles and readable only by authorized admins.

## Owner administration endpoint
The `owner-users` Supabase Edge Function is deployed with JWT verification enabled. It checks the caller's verified Auth session and the `owner` role before allowing user listing, invitations, role changes, block/unblock and password-reset email requests. It uses the service-role key only inside the Edge Function runtime and writes an actor-attributed audit event for each operation.

The primary Owner account cannot be blocked or demoted. The Owner role cannot be assigned through the user-management endpoint. Admins cannot invoke the endpoint.

## Remaining verification
- Run browser-level tests for Owner, Admin and Customer access paths.
- Verify invite and password-reset emails against the configured Supabase Auth redirect URL and SMTP settings.
- Verify blocked users cannot continue an existing session after token/session refresh.

# Admin Authentication and Authorization

## Session authentication
- Appwrite email/password session creation occurs in a server route.
- Session secret is stored in an HttpOnly, SameSite=Lax cookie; Secure is enabled in production.
- /admin routes verify the session against Appwrite and require an exact server-side Owner ID allowlist.
- Owner access is deny-by-default. No public admin registration exists.

## Role policy
- The role permission matrix is centralized in src/lib/permissions.ts.
- Owner is the only role permitted to approve/publish content or manage users.
- Admin, Manager and Staff receive progressively limited permissions.
- The matrix is policy code only: non-owner roles must not be assigned until trusted server-side role profiles and resource-level enforcement are implemented.

## Audit event contract
- src/lib/audit-schema.ts defines bounded event fields and allowed action/outcome values.
- Validation rejects unknown roles/actions and oversized metadata.
- Do not record passwords, session secrets, API keys, complete request bodies, or payment data.
- An Appwrite audit append adapter is implemented and privileged content/media APIs require audit storage to be configured. Actual audit writes have not yet been verified against a provisioned Appwrite table; do not claim live audit logging until preview integration tests pass.

## Hosting environment
- NEXT_PUBLIC_APPWRITE_ENDPOINT
- NEXT_PUBLIC_APPWRITE_PROJECT_ID
- ADMIN_OWNER_USER_IDS — comma-separated exact Appwrite user IDs; server-only.

## Remaining production hardening
- Configure distributed edge/WAF rate limiting for /api/admin/login.
- Verify Appwrite session behavior and allowed origins in a preview deployment.
- Add MFA and trusted role profile storage before delegating roles.
- Persist audit events in an append-only Appwrite collection/table after schema and permissions are reviewed.
- Configure Appwrite project platform origins to actual preview and production domains.

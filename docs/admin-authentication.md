# Admin Authentication — Security Foundation

## Implemented in this branch
- Appwrite email/password session creation through a server route; credentials are not sent to browser-side Appwrite SDK calls.
- Appwrite session secret is stored in an HttpOnly, SameSite=Lax cookie; Secure is enabled in production.
- All /admin routes are protected by a server layout that verifies the session against Appwrite's /account endpoint.
- Owner authorization is deny-by-default and requires an exact user ID in the server-only ADMIN_OWNER_USER_IDS environment variable.
- No public admin registration or role self-assignment exists.
- Logout revokes the current Appwrite session and clears the cookie.
- Login/logout endpoints check the Origin header when present.

## Required hosting environment
- NEXT_PUBLIC_APPWRITE_ENDPOINT
- NEXT_PUBLIC_APPWRITE_PROJECT_ID
- ADMIN_OWNER_USER_IDS — comma-separated exact Appwrite user IDs; keep this server-only.

Do not put API keys, session secrets or owner IDs in NEXT_PUBLIC variables. Do not set ADMIN_OWNER_USER_IDS until the owner account has been verified in Appwrite.

## Important production hardening still required
- Configure edge/WAF rate limiting for /api/admin/login; this in-memory-free implementation intentionally does not pretend to provide distributed rate limiting.
- Confirm the exact Appwrite deployment's session cookie behavior and allowed origins in a real preview environment.
- Add MFA enforcement and account recovery policy.
- Add trusted role profiles and audit logging before delegating Admin/Manager/Staff access. This initial gate intentionally supports owner IDs only.
- Configure Appwrite project platform origins to the actual preview and production domains.
- Add integration tests against a non-production Appwrite project before production enablement.

## Safety
No Appwrite database, bucket, user, API key, or production deployment is created by these code changes. The Admin area remains inaccessible until valid Appwrite settings and an explicitly configured owner ID are provided.

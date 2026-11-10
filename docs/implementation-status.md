# Implementation Status

Updated: 2026-11-10

## Completed
- [x] Architecture and logical data model drafted.
- [x] Feature branch `foundation/architecture` created and draft PR #1 opened.
- [x] Next.js 16 / React 19 / TypeScript project scaffold and responsive public homepage added.
- [x] GitHub Actions CI, Vitest and Playwright smoke-test configuration added.
- [x] Admin workspace, settings, content and Media Library preview shells added.
- [x] Role policy, settings schema and media validation schemas/tests added.
- [x] Media delivery architecture documented: optimized responsive images, lazy loading, CDN, video posters, Appwrite Storage CRUD and external HTTPS URLs.
- [x] Appwrite temporary CRUD write test passed and all temporary resources were cleaned up.
- [x] Server-side Appwrite email/password login route added; browser does not receive the session secret.
- [x] HttpOnly, SameSite=Lax session cookie and server-side Appwrite session verification added.
- [x] All /admin routes now require an exact Owner Appwrite user ID allowlist; deny-by-default.
- [x] Logout revokes the Appwrite session; public admin registration is not provided.
- [x] Admin authentication prerequisites and remaining hardening documented in docs/admin-authentication.md.

## In progress / pending
- [ ] Run and fix GitHub CI after the authentication changes.
- [ ] Verify login/session cookie behavior in a non-production preview with the actual Appwrite project and allowed origins.
- [ ] Configure distributed edge/WAF rate limiting for the login endpoint.
- [ ] Confirm the Owner Appwrite user ID and configure ADMIN_OWNER_USER_IDS in hosting secrets.
- [ ] Add MFA, trusted role profiles and audit logging before delegating staff roles.
- [ ] Confirm initial languages, currencies, contact channels and booking policies.
- [ ] Provision production Appwrite schema and Storage only after access rules and requirements are reviewed.
- [ ] Configure Vercel preview environment and secrets.
- [ ] End-to-end testing and owner review.

## Release rule
No production deployment or merge to `main` until the owner approves the preview and release.

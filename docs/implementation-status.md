# Implementation Status

Updated: 2026-11-10

## Completed
- [x] Architecture, logical data model, responsive Next.js public foundation and admin preview shells.
- [x] GitHub Actions CI, Vitest and Playwright smoke-test configuration.
- [x] Settings, media and structured page-content validation schemas with unit tests.
- [x] Page section contracts: hero, rich text, service grid, FAQ and CTA; unsafe links and arbitrary HTML are rejected.
- [x] Draft → In review → Owner approval → Owner publish workflow policy; published revisions are immutable.
- [x] Media delivery and CRUD requirements documented, including Appwrite uploads and external HTTPS media.
- [x] Appwrite temporary CRUD write test passed; all temporary resources cleaned up.
- [x] Server-side Appwrite login, HttpOnly session cookie, Appwrite session verification, logout and deny-by-default Owner ID gate.
- [x] Role permission matrix centralized; owner-only publish/approval and user management policy covered by tests.
- [x] Audit event validation contract and tests added; persistent audit storage is not yet active.
- [x] Fixed two Next.js internal-link lint errors discovered in CI.

## In progress / pending
- [ ] Re-run and verify full GitHub CI after lint fixes and the latest content-schema commits. A CI run was observed queued for the earlier foundation commit; no successful run is confirmed yet.
- [ ] Review dependency audit: prior npm install reported 11 vulnerabilities (9 moderate, 2 critical); inspect exact advisories and update safely.
- [ ] Connect structured content schema to persistent page/version storage, editor UI and protected preview rendering.
- [ ] Enforce trusted server-side authorization on every content mutation endpoint before enabling saves or publishing.
- [ ] Verify login/session cookie behavior in a non-production preview with Appwrite and configured origins.
- [ ] Configure distributed edge/WAF rate limiting and MFA.
- [ ] Confirm Owner Appwrite user ID and set ADMIN_OWNER_USER_IDS in hosting secrets.
- [ ] Implement trusted role profiles before delegating non-owner roles.
- [ ] Persist audit events in append-only storage after access policy review.
- [ ] Confirm business settings, configure Vercel preview, and complete end-to-end owner review.

## Release rule
No production deployment or merge to main until the owner approves the preview and release.

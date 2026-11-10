# Implementation Status

Updated: 2026-11-10

## Completed
- [x] Architecture, logical data model, responsive Next.js public foundation and admin preview shells.
- [x] GitHub Actions CI, Vitest and Playwright smoke-test configuration.
- [x] Settings, media and structured page-content validation schemas with unit tests.
- [x] Page section contracts: hero, rich text, service grid, FAQ and CTA; unsafe links, arbitrary HTML and non-HTTPS hero media URLs are rejected.
- [x] Interactive admin content editor shell with local draft editing, schema validation and live preview; no persistent save or publish action is enabled.
- [x] Draft → In review → Owner approval → Owner publish workflow policy; published revisions are immutable.
- [x] CI dependency-audit report step added; audit output is retained as a short-lived workflow artifact.
- [x] Media delivery and CRUD requirements documented, including Appwrite uploads and external HTTPS media.
- [x] Appwrite temporary CRUD write test passed; all temporary resources cleaned up.
- [x] Server-side Appwrite login, HttpOnly session cookie, Appwrite session verification, logout and deny-by-default Owner ID gate.
- [x] Role permission matrix centralized; owner-only publish/approval and user management policy covered by tests.
- [x] Audit event validation contract and tests added; persistent audit storage is not yet active.
- [x] GitHub Actions run #75 completed successfully for its tested commit: typecheck, lint, unit tests, Playwright smoke test and production build all passed.

## In progress / pending
- [ ] Confirm a new CI run validates the latest content editor and audit-workflow commits; run #75 predates these latest changes.
- [ ] Inspect the dependency audit artifact for exact advisories; do not apply force upgrades blindly.
- [ ] Connect structured content schema to persistent page/version storage and protected preview rendering.
- [ ] Enforce trusted server-side authorization on every content mutation endpoint before enabling saves or publishing.
- [ ] Verify login/session cookie behavior in a non-production preview with Appwrite and configured origins.
- [ ] Configure distributed edge/WAF rate limiting and MFA.
- [ ] Confirm Owner Appwrite user ID and set ADMIN_OWNER_USER_IDS in hosting secrets.
- [ ] Implement trusted role profiles before delegating non-owner roles.
- [ ] Persist audit events in append-only storage after access policy review.
- [ ] Confirm business settings, configure Vercel preview, and complete end-to-end owner review.

## Release rule
No production deployment or merge to main until the owner approves the preview and release.

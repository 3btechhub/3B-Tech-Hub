# Implementation Status

Updated: 2026-11-10

## Completed
- [x] Architecture, logical data model, responsive Next.js public foundation and admin preview shells.
- [x] GitHub Actions CI, Vitest and Playwright smoke-test configuration.
- [x] Settings, media and structured page-content validation schemas with unit tests.
- [x] Interactive admin content editor with local live preview, persistent Save Draft API integration and link to protected saved-revision preview.
- [x] Owner-only content draft create/list and submit-for-review, approve and publish workflow APIs with audit recording and rollback attempts.
- [x] Media Library UI for device upload, external HTTPS URL registration, metadata editing, trash and restore.
- [x] Owner-only Media APIs for listing, upload, external registration, metadata update, soft-delete and restore. Permanent deletion remains disabled until usage tracking is implemented.
- [x] Upload validation enforces a 50 MB limit, MIME allowlist and basic file-signature checks; newly uploaded files are private by default.
- [x] Appwrite server adapter uses server-only API key configuration; APIs return 503 until required server resource IDs and secrets exist.
- [x] Persistent audit append adapter added; content/media writes require audit storage and attempt rollback if audit append fails.
- [x] Appwrite setup documentation defines required Content, Media, Audit tables and private Storage bucket.
- [x] Appwrite project inventory checked: zero TablesDB databases and zero Storage buckets; no production resources were created.
- [x] Temporary Appwrite CRUD write test previously passed and all temporary resources were cleaned up.
- [x] Server-side Appwrite login, HttpOnly session cookie, Appwrite session verification, logout and deny-by-default Owner ID gate.
- [x] Role permission matrix centralized; owner-only approval/publishing and user management policy covered by tests.
- [x] Vitest upgraded to 5.1.0 to remove the two critical Tinypool/Vitest advisories found in the earlier dependency report.

## In progress / pending
- [x] CI run #226 passed on commit `e6f8cda8fce657418cbb40bd81d52ed5c4d1adf8`: install, dependency-audit report upload, typecheck, lint, unit tests, Playwright browser setup, E2E tests and production build.\n- [ ] Two subsequent commits add the saved content revision browser; their CI run must complete before this latest UI change is marked verified.
- [ ] Dependency audit after Vitest upgrade reports 8 moderate, 0 critical. Remaining findings are in the Next 16 ESLint configuration/typescript-eslint/minimatch chain. npm suggests downgrading eslint-config-next to 15.5.29, which is not an appropriate automatic fix for this Next 16 app; review compatible upstream patch before changing.
- [ ] Configure Appwrite server API key and provision Content, Media, Audit tables plus private Storage bucket after schema and access policy review. Current project inventory has none; APIs are disabled until configured.
- [ ] Configure Appwrite table columns, indexes and least-privilege API key scopes exactly as documented.
- [ ] Verify APIs against a configured non-production Appwrite preview; no live upload or persistent content write has been tested.
- [x] Added protected server-rendered preview for saved page revisions under /admin/content/preview/[revisionId].\n- [ ] Connect published content to public website pages.
- [x] Added an Owner-protected saved content revision browser with refresh, status/revision metadata and links to private previews.\n- [ ] Extend the content editor to reopen/edit existing saved revisions; add media pagination/search/usage tracking.
- [ ] Configure distributed edge/WAF rate limiting and MFA.
- [ ] Confirm Owner Appwrite user ID and set ADMIN_OWNER_USER_IDS in hosting secrets.
- [ ] Implement trusted role profiles before delegating non-owner roles.
- [ ] Connect Vercel preview and complete end-to-end owner review.

## Release rule
No production deployment or merge to main until the owner approves the preview and release.

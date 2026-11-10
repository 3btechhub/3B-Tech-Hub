# Implementation Status

Updated: 2026-11-10

## Implemented in the development branch
- [x] Next.js App Router, TypeScript, responsive public-site foundation and admin workspace.
- [x] GitHub Actions CI configuration, Vitest unit tests and Playwright smoke-test configuration.
- [x] Settings, media, content, audit and permission validation schemas with unit tests.
- [x] Owner-gated admin authentication routes, Appwrite session verification, HttpOnly session cookie and logout flow.
- [x] Structured content editor, draft persistence APIs, revision browser, saved-draft reopen/edit APIs and protected revision preview.
- [x] Owner-only content workflow transitions, audit adapter and published-only public page renderer/API.
- [x] Media Library UI, device upload, external HTTPS registration, metadata editing, soft-delete/restore and authenticated private-media preview.
- [x] 50 MB media upload limit, MIME allowlist, basic file-signature validation and private-by-default uploaded objects.
- [x] Media API pagination and title search; dashboard search and page navigation.
- [x] Corrected Appwrite row lookup URL construction.
- [x] Corrected Appwrite row deletion to use the configured endpoint.
- [x] Applied server-side `deletedAt IS NULL` filtering before media pagination so page totals and results stay consistent.
- [x] Server-only Appwrite adapter; APIs fail closed (503) when required production configuration is absent.
- [x] Architecture, data model, security, content, media and Appwrite configuration documentation, including required media title full-text index.

## Remaining production work
- [x] Reconnected Appwrite and verified the active Production project `3B Tech Hub` (region `fra`).
- [x] Created and verified TablesDB `3btechhub-prod`, Content/Media/Audit tables, required columns/indexes and private Storage bucket `media`.
- [ ] Configure least-privilege server API key and production environment variables; configure actual Owner user ID in ADMIN_OWNER_USER_IDS.
- [ ] Run live Appwrite tests for login, content create/edit/approve/publish, media upload/read/update/trash/restore, audit persistence and rollback.
- [ ] Add media usage/reference tracking before enabling permanent deletion.
- [ ] Build thumbnail/optimized rendition generation and a security-reviewed CDN delivery policy; do not expose private uploads publicly by default.
- [ ] Add distributed rate limiting, MFA and complete security review.
- [ ] Review remaining moderate dependency audit findings against compatible upstream patches.
- [ ] Verify GitHub Actions checks for the current development branch; the connector currently returns no commit status entries for the latest changes.
- [ ] Connect/configure production hosting, secrets, domain and DNS.
- [ ] Complete accessibility, responsive, SEO, performance, backup/restore and browser testing.

## Release controls
- Development is targeted at the real production project, not a separate preview product.
- Public launch, DNS changes, payment activation and destructive production operations still require explicit Owner approval.
- Do not describe unavailable integrations or unrun tests as completed.

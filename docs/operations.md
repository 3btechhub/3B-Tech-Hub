# 3B TECH HUB — Production Operations

## Hosting and release
- Production hosting: GitHub Pages, publishing the `site/` directory.
- Source repository: `3btechhub/3btechhub`.
- Production branch: `main`.
- Backend: Supabase project `sburxeuxkrilbfppxylm` (`ap-northeast-1`).
- Vercel, Appwrite and Cloudflare are not part of the approved stack.
- Review and test changes on a dedicated branch before merging to `main`.

## Credentials
- Only the Supabase publishable key may be used in the static browser app.
- Never commit or expose service-role/secret keys.
- RLS and Storage policies are the security boundary for browser-originated requests.
- GitHub Actions secrets must be limited to the exact workflows that need them.

## Health checks
Before release verify:
- GitHub Pages deployment succeeds.
- Homepage, country routing, services and products load.
- Login, logout, profile update and password change work.
- Owner-only product/service/workshop/technician CRUD works.
- Anonymous requests cannot write to database tables or Storage.
- A non-owner authenticated user cannot access Owner functions.
- Audit events are created for privileged mutations.

## Backup and recovery
- The repository backup branch protects source code only; it does not include Supabase data or Storage objects.
- The connector used for this audit does not expose a full database backup/export or restore operation.
- Do not label a source branch as a complete project backup.
- Before destructive database work, create a Supabase dashboard backup/export using an available plan-supported method and verify that it can be restored.
- Keep schema migrations and a data export separate; both are needed for recovery.
- A restore procedure is not complete until it has been tested against an isolated database.

## Legacy code
The repository contains an unshipped Next.js prototype under `src/`. GitHub Pages does not deploy it. Do not configure it with any retired provider or describe its server routes as production features.

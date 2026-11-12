# 3B TECH HUB — Production Operations

## Hosting and release
- Production hosting: GitHub Pages, publishing the `site/` directory.
- Source repository: `3btechhub/3btechhub`.
- Production branch: `main`.
- Backend: Supabase project `sburxeuxkrilbfppxylm` (`ap-northeast-1`).
- GitHub + Supabase only; Vercel, Appwrite and Cloudflare are excluded.
- Review and test changes on a dedicated branch before merging to `main`.

## Credentials and access
- Only the Supabase publishable key may be used in the static browser app.
- Never commit or expose service-role/secret keys.
- RLS and trusted Edge Functions enforce authorization.
- The fixed Owner is `3btechhub@gmail.com`.
- User types: Owner, Admin, Member and Visitor.

## Release health checks
- GitHub Pages deployment succeeds.
- Global, BD and KSA home routes load.
- IP detection, Global fallback and manual route switching work.
- Language defaults and independent language switching work; Arabic uses RTL.
- Account, Profile, Dashboard, Page Builder, Audit and Settings work.
- Admin cannot access Owner-only User, Role, Permission or Settings functions.
- Anonymous requests cannot write to application tables or Storage.
- Audit events are created for privileged mutations.

## Backup and recovery
- `backup/2026-11-12-before-scope-reset` protects source code only, not Supabase data or Storage objects.
- The connected tools do not provide a verified full database + Storage export/restore workflow.
- Before destructive database work, archive the legacy rows in a private schema or use a plan-supported database backup/export and verify restoration.
- Keep schema migrations and data archives separate.
- A restore procedure is not complete until tested against an isolated database.

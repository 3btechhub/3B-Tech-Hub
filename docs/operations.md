# 3B TECH HUB — Production Operations

## Hosting and release
- Production hosting: GitHub Pages, publishing the `site/` directory.
- Source repository: `3btechhub/3btechhub`.
- Production branch: `main`.
- Backend: Supabase project `sburxeuxkrilbfppxylm` (`ap-northeast-1`).
- GitHub + Supabase only; Vercel, Appwrite and Cloudflare are excluded.
- Review and test changes on a dedicated branch before merging to `main`.

## Website behavior
- One English-only website.
- Home: `/`; Account: `/account/`; Profile: `/profile/`; Dashboard: `/dashboard/`.
- Header and Footer persist while Main Area navigation changes.
- Document direction is always LTR.
- No country detection, country-based versions, language switching or RTL mode.

## Credentials and access
- Only the Supabase publishable key may be used in the static browser app.
- Never commit or expose service-role/secret keys.
- RLS and trusted Edge Functions enforce authorization.
- The fixed Owner is `3btechhub@gmail.com`.
- User types: Owner, Admin, Member and Visitor.

## Release health checks
- GitHub Pages deployment succeeds.
- Home, Account, Profile and Dashboard load.
- English labels and LTR layout remain consistent.
- Admin cannot access Owner-only User, Role, Permission or Settings functions.
- Anonymous requests cannot write to application tables or Storage.
- Audit events are created for privileged mutations.

## Backup and recovery
- `backup/2026-11-12-before-scope-reset` protects source code only, not Supabase data or Storage objects.
- The connected tools do not provide a verified full database + Storage export/restore workflow.
- Keep schema migrations and data archives separate.
- A restore procedure is not complete until tested against an isolated database.

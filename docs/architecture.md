# 3B TECH HUB — Live Architecture

## Production platform
- GitHub repository: source control, review, CI and deployment automation.
- GitHub Pages: publishes the static website from `site/`.
- Supabase: email/password Auth, PostgreSQL, Row Level Security and Storage.
- The browser uses only the Supabase publishable key. Secret/service-role keys must never be shipped to GitHub Pages.

Vercel, Appwrite and Cloudflare are not part of the approved production architecture.

## Runtime flow
```text
Browser
  |-- GitHub Pages: HTML, CSS and JavaScript from site/
  |-- Supabase Auth: email/password sessions
  |-- Supabase Data API: public catalogue reads and owner-only writes
  |-- Supabase Storage: public catalogue images
  v
PostgreSQL + RLS policies + Storage policies
```

## Current public modules
- Homepage and region routing (Bangladesh, Saudi Arabia and Global).
- Six service pages, with Bangladesh/Saudi routing.
- Product catalogue grouped into Mobile & Accessories and Satellite & TV Equipment.
- Workshop and technician listings.
- Login, user profile and password-change flow.

## Authorization
- `3btechhub@gmail.com` is the highest-authority Owner.
- Owner authorization is stored in `public.user_roles`, never trusted from browser input.
- Public visitors receive only published/active catalogue data through RLS.
- Owner-only writes are enforced by RLS and database functions, not by hiding UI controls.
- The `anon` database role must never have write privileges on application tables.
- Role assignment and account administration must be Owner-only.

## Data and storage rules
- Keep schema changes in version-controlled Supabase migrations.
- Every exposed public table must have RLS enabled and reviewed policies.
- Keep user profile data private; users can read/update only their own profile unless an Owner-only workflow applies.
- Public media is limited to approved assets in the `site-media` bucket.
- Do not store secrets, passwords or service-role credentials in repository files or browser code.
- Audit privileged changes without copying personal data or complete row contents into audit metadata.

## Release process
1. Work on a dedicated branch.
2. Review the diff and migration.
3. Run CI checks and regression tests.
4. Verify database policies/advisors after schema changes.
5. Merge only a passing change to `main`.
6. Confirm the GitHub Pages deployment and smoke-test the public site.

The previously unshipped Next.js/Appwrite prototype and its server routes have been removed from the production branch. The approved live architecture is only the GitHub Pages static frontend and Supabase services. The pre-cleanup source is preserved in the backup branch created before these fixes; do not restore or reconnect the retired prototype.

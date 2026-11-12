# 3B TECH HUB — Approved Architecture

Read [master-spec.md](master-spec.md) first. It defines the complete allowed product scope.

## Production platform

- GitHub Pages publishes the static frontend from `site/`.
- Supabase provides Auth, PostgreSQL, RLS and trusted Edge Functions.
- Supabase publishable key may be used in browser code. Secret/service-role keys must never be shipped to GitHub Pages.
- No Vercel, Appwrite, Cloudflare, Next.js server hosting or additional platform is allowed.

## Shared page renderer

- One persistent document shell owns the Header, Main Area and Footer.
- A single route resolver maps `/global/`, `/bd/`, `/ksa/`, `/account/`, `/profile/` and `/dashboard/` to modular Main Area views.
- Country routes reuse one Home view and vary only country context, language defaults and country-scoped data.
- Internal navigation and browser Back/Forward replace only the Main Area; Header and Footer remain mounted.
- The root entry defaults to Home after country detection; direct canonical route visits are preserved.
- Static-host route entry files bootstrap the root shell, while page view markup is maintained once under `site/views/`.

## Runtime

```text
Browser
  |-- GitHub Pages: HTML, CSS and JavaScript
  |-- Supabase Auth: account sessions
  |-- Supabase Data API: authorized account and dashboard operations
  v
PostgreSQL + RLS + trusted Edge Functions
```

## Approved routes and page model

- Home: `/global/`, `/bd/`, `/ksa/`
- Account: `/account/`
- Profile: `/profile/`
- Dashboard: `/dashboard/`

Only `global`, `bd` and `ksa` are canonical country identifiers. Global content is visible on every route; country-specific content is restricted to its matching route.

## Authorization

- `3btechhub@gmail.com` is the fixed primary Owner.
- Allowed account roles: Owner, Admin and Member. Visitor is anonymous public access.
- Owner has full access to approved modules.
- Admin has Overview and Audit access; user/role/permission/settings administration remains Owner-only.
- Member can access only their own account/profile.
- Visitor can access the public website only.
- All authorization is enforced in RLS and trusted Edge Functions.

## Release process

1. Work on a dedicated branch.
2. Review code, route changes and database migration.
3. Run regression tests and GitHub Actions.
4. Verify RLS and database advisors after schema changes.
5. Merge only a passing, reviewed change to `main`.
6. Confirm GitHub Pages deployment and smoke-test the site.

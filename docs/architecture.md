# 3B TECH HUB — Approved Architecture

Read [master-spec.md](master-spec.md) first. It defines the complete allowed product scope.

## Production platform
- GitHub Pages publishes the static frontend from `site/`.
- Supabase provides Auth, PostgreSQL, RLS and trusted Edge Functions.
- Supabase publishable key may be used in browser code. Secret/service-role keys must never be shipped to GitHub Pages.
- No Vercel, Appwrite, Cloudflare, Next.js server hosting or additional platform is allowed.

## Shared page renderer
- One persistent document shell owns the Header, Main Area and Footer.
- The root URL (`/`) opens this shell and initially resolves the independent Home page.
- The Home page is a normal first-class route at `/home/`, with its own static route entry and view file; it is not hard-coded as the shell's permanent Main Area.
- One route resolver maps `/home/`, `/account/`, `/profile/` and `/dashboard/` to their independent modular Main Area views.
- The root entry is canonicalized to `/home/` after the shared shell loads, so `/` is not a separate content page.
- Internal navigation and browser Back/Forward replace only the Main Area; Header and Footer remain mounted.
- Page view markup is maintained once under `site/views/`; static-host route entry files bootstrap the shared shell.

## Language
- The interface is English-only.
- The document uses `lang="en"` and `dir="ltr"`.
- There is no country lookup, locale lookup, translation system, language selector, or RTL mode.

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
- Home: `/home/`
- Account: `/account/` (`/login/` compatibility alias)
- Profile: `/profile/`
- Dashboard: `/dashboard/`

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
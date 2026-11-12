# 3B TECH HUB — Approved Architecture

Read [master-spec.md](master-spec.md) first. It defines the complete allowed product scope.

## Production platform

- GitHub Pages publishes the static frontend from `site/`.
- Supabase provides Auth, PostgreSQL, RLS and trusted Edge Functions.
- Supabase publishable key may be used in browser code. Secret/service-role keys must never be shipped to GitHub Pages.
- No Vercel, Appwrite, Cloudflare, Next.js server hosting or additional platform is allowed.

## Runtime

```text
Browser
  |-- GitHub Pages: HTML, CSS and JavaScript
  |-- Supabase Auth: account sessions
  |-- Supabase Data API: public pages and authorized dashboard operations
  v
PostgreSQL + RLS + trusted Edge Functions
```

## Approved routes and page model

- Home: `/global/`, `/bd/`, `/ksa/`
- Account: `/account/`
- Profile: `/profile/`
- Dashboard: `/dashboard/`
- Dynamic Main Pages and Sub Pages: stored in `pages` and rendered through the allowlisted page engine.

Only `global`, `bd` and `ksa` are canonical country identifiers. Global content is visible on every route; country-specific content is restricted to its matching route.

## Authorization

- `3btechhub@gmail.com` is the fixed primary Owner.
- Allowed account roles: Owner, Admin and Member. Visitor is anonymous public access.
- Owner has full access to approved modules.
- Admin has Overview, Audit and Page access; user/role/permission/settings administration remains Owner-only.
- Member can access only their own account/profile and public pages.
- Visitor can access public pages only.
- All authorization is enforced in RLS and trusted Edge Functions.

## Release process

1. Work on a dedicated branch.
2. Review code, route changes and database migration.
3. Run regression tests and GitHub Actions.
4. Verify RLS and database advisors after schema changes.
5. Merge only a passing, reviewed change to `main`.
6. Confirm GitHub Pages deployment and smoke-test the site.

# 3B TECH HUB

**3B TECH HUB** is the only official brand name.

The approved product scope is defined in [docs/master-spec.md](docs/master-spec.md). All production code, routes, database features and UI must follow that specification exactly.

## Platform

- GitHub: source repository, CI/CD and static website hosting through GitHub Pages.
- Supabase: email/password Auth, PostgreSQL, Row Level Security, Storage only where required, and Edge Functions.
- No Vercel, Appwrite, Cloudflare, or other hosting provider is used.

## Approved website

- Structure: Home, Account, Profile and Dashboard.
- Shared layout: Header, Main Area and Footer.
- Dashboard modules: Overview, Audit, User, Role, Permission and Settings.
- User types: Owner, Admin, Member and Visitor.
- Country routes: `global`, `bd`, `ksa`.
- Default languages: English for Global, Bangla for Bangladesh and Arabic for Saudi Arabia.
- Theme: monochrome black and white with neutral gray hierarchy.

## Country and language behavior

The first entry attempts IP country detection. Bangladesh routes to `/bd/`, Saudi Arabia to `/ksa/`, and all other countries or detection failures to `/global/`. A visitor can change the route from the menu. Language can be changed independently without changing the route.

## Fixed Owner

The primary Owner is `3btechhub@gmail.com`. The Owner role must never be demoted, deleted, blocked or replaced. Authorization is enforced by Supabase RLS and trusted Edge Functions, not by UI visibility.

## Deployment

GitHub Pages publishes the `site/` directory. Expected project URL:

`https://3btechhub.github.io/3btechhub/`

## Validation

- `npm test` — Node.js regression tests.
- `npm run validate` — JavaScript syntax checks and regression tests.
- GitHub Actions validates the required route files and deployable static assets.

The master-spec refactor is being prepared on `refactor/master-spec-2026-11-12`. It must pass CI and receive a database migration review before merging to `main`.

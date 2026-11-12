# 3B TECH HUB

**3B TECH HUB** is the only official brand name.

The approved product scope is defined in [docs/master-spec.md](docs/master-spec.md). All production code, routes, database features and UI must follow that specification exactly.

## Platform
- GitHub: source repository, CI/CD and static website hosting through GitHub Pages.
- Supabase: email/password Auth, PostgreSQL, Row Level Security, Storage only where required, and Edge Functions.
- No Vercel, Appwrite, Cloudflare, or other hosting provider is used.

## Approved website
- One website with one English interface.
- Structure: Home, Account, Profile and Dashboard.
- Shared layout: Header, Main Area and Footer.
- Dashboard modules: Overview, Audit, Services, Products, Workshops, Technicians, User, Role, Permission and Settings.
- User types: Owner, Admin, Member and Visitor.
- Theme: monochrome black and white with neutral gray hierarchy.
- No country-specific versions, location detection, language selector, translation system or RTL mode.

## Fixed Owner
The primary Owner is `3btechhub@gmail.com`. The Owner role must never be demoted, deleted, blocked or replaced. Authorization is enforced by Supabase RLS and trusted Edge Functions, not by UI visibility.

## Deployment
GitHub Pages publishes the `site/` directory. Expected project URL:

`https://3btechhub.github.io/3btechhub/`

## Validation
- `npm test` — Node.js regression tests.
- `npm run validate` — JavaScript syntax checks and regression tests.
- GitHub Actions validates the required route files and deployable static assets.

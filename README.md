# 3B TECH HUB

**3B TECH HUB** is the only official brand name. No expanded or alternate brand name is used.

The production website is a static, mobile-first frontend published by **GitHub Pages**. Supabase provides email/password authentication, PostgreSQL, Row Level Security and Storage.

## Platform policy

- GitHub: source repository, CI/CD and static website hosting through GitHub Pages.
- Supabase: Auth, PostgreSQL, RLS, Storage and Edge Functions.
- No Vercel, Appwrite, Cloudflare, or other hosting provider is used.

## Website requirements

- Use only **3B TECH HUB** as the brand name everywhere.
- Homepage main content: “3B TECH HUB”; keep the custom header and footer.
- Login uses email and password only. Google OAuth is not included.
- The login UI remains minimal: placeholder inputs and a simple submit button.
- Supabase publishable key is public by design; all data access must be protected by RLS.
- Never expose a Supabase secret/service-role key in the browser.

## Deploy

The `.github/workflows/deploy-pages.yml` workflow validates and publishes the `site/` directory. GitHub Pages must be configured to use GitHub Actions in repository Settings → Pages. The expected project-site URL is:

`https://3btechhub.github.io/3btechhub/`

The static release includes the public catalogue, profile/authentication flows, Owner/Admin catalogue CRUD, a searchable Supabase Media Library, Owner-only user administration and website profile settings. A complete content revision/page-builder workflow and a full database-plus-Storage backup/restore process remain pending.

## Supabase

- Project: `sburxeuxkrilbfppxylm`
- Region: `ap-northeast-1`
- Auth provider: email/password only.
- RLS is enabled on all 10 public application tables. Anonymous write grants have been revoked, role changes are Owner-only, and audit triggers are active.
- The verified Owner account `3btechhub@gmail.com` already has the `owner` role. Never change or remove this primary Owner assignment.

## Validation

- `npm test` — built-in Node.js regression tests.
- `npm run validate` — browser-module syntax checks plus regression tests.
- GitHub Actions validates required static routes and deployment artifacts.
- GitHub Pages workflow validates the deployed static assets.

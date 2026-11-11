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

The current static release contains the requested homepage and Supabase email/password authentication. Admin CMS and server-only API workflows are not yet migrated; they must not be exposed until implemented with Supabase Auth/RLS/Edge Functions.

## Supabase

- Project: `sburxeuxkrilbfppxylm`
- Region: `ap-northeast-1`
- Auth provider: email/password only.
- Database tables have RLS enabled. Verify each policy before enabling user-facing data operations.
- Create the verified owner account through Supabase Auth, then assign the owner role using that actual Auth UUID. Never guess or commit a user UUID.

## Validation

- `npm run typecheck`
- `npm run lint`
- `npm run test`
- `npm run test:e2e`
- GitHub Pages workflow validates the deployed static assets.

# 3B TECH HUB — GitHub + Supabase release checklist

## Target platform
- GitHub repository: `3btechhub/3B-Tech-Hub`
- GitHub Pages: static frontend from `site/`
- Supabase project: `sburxeuxkrilbfppxylm` (`ap-northeast-1`)
- Supabase provides email/password Auth, PostgreSQL, RLS and Storage.
- Vercel, Appwrite and Cloudflare are not part of the target stack.

## Implemented foundation
- Supabase schema exists for profiles, roles, CMS content, products, services, bookings, media metadata, settings and audit logs.
- RLS is enabled on the application tables.
- GitHub Pages static homepage preserves the requested brand title and header/footer.
- Login uses Supabase email/password Auth; Google OAuth is not used.
- Static assets are published by GitHub Actions.

## Still required before full feature launch
1. In repository Settings → Pages, set Build and deployment source to GitHub Actions.
2. Confirm Supabase email/password provider, confirmation emails and password recovery URLs for the final Pages domain.
3. Create the actual owner account in Supabase Auth. Current project inspection found zero Auth users and zero owner/admin role rows.
4. Assign the owner role only using the verified Auth user UUID.
5. Migrate the remaining CMS, profile, bookings, media and settings workflows to static client components and/or Supabase Edge Functions with RLS enforcement.
6. Add browser tests for login, password recovery, signup and all admin workflows.
7. Verify GitHub Pages deployment and the Supabase Auth redirect URLs.

## Security
- Do not put a service-role/secret key in GitHub, browser code or Pages artifacts.
- The publishable key in the static app is intended for public clients; RLS is the security boundary.
- Never grant an owner role without verifying the actual Auth user UUID.
- Do not claim the full CMS/admin feature set is production-ready until the remaining migration and tests pass.

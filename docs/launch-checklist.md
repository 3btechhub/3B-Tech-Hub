# 3B TECH HUB — First Production Release

## Platform
- GitHub is source control and CI/CD.
- Supabase project: sburxeuxkrilbfppxylm (ap-northeast-1).
- Cloudflare Workers runs the dynamic Next.js app through OpenNext.
- Vercel and Appwrite are not part of the target stack.

## Foundation implemented
- Additive Supabase schema for profiles, roles, CMS content, products, services, bookings, media metadata, settings and audit logs.
- RLS enabled on every application table.
- Public reads limited to published content, active products/services, public settings and public media.
- Storage bucket site-media with public read and admin-only writes.
- Supabase SSR browser/server client helpers and Next.js 16 proxy for cookie refresh.
- Cloudflare Workers configuration and GitHub Actions deployment workflow.

## Required before production deployment
1. Configure GitHub Actions variable CLOUDFLARE_ACCOUNT_ID and secret CLOUDFLARE_API_TOKEN (Workers Scripts: Edit; account scope only).
2. Confirm Supabase Auth email/password provider and email templates; do not enable Google OAuth.
3. Create the owner account through the verified signup/invite flow, then assign owner role from Supabase SQL Editor using the actual Auth user UUID. Never guess or commit the UUID.
4. Complete remaining Appwrite API/auth/media route migration to Supabase before enabling admin/customer workflows. Existing admin API modules are not all migrated by this foundation change.
5. Verify typecheck, lint, unit tests, OpenNext build and Worker preview.
6. Run browser checks for homepage, header/footer, login, mobile layout and public pages.
7. Verify health endpoint, security advisor, storage access and rollback procedure.
8. Only then approve production deployment and attach custom domain if desired.

## Owner role bootstrap — after owner account exists
Replace the UUID placeholder with the exact Auth user UUID from Supabase Auth users:

    insert into public.user_roles (user_id, role)
    values ('00000000-0000-0000-0000-000000000000', 'owner')
    on conflict (user_id, role) do nothing;

Do not run the example until the placeholder has been replaced with the verified owner UUID.

## Secrets
Never put Supabase service-role/secret keys in Git, browser variables or Worker public vars. This foundation uses the publishable key and RLS. Add a secret key only if a reviewed server-only use case requires it.

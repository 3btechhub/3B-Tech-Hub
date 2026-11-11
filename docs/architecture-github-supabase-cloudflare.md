# 3B TECH HUB — GitHub + Supabase + Cloudflare Architecture

## Decision
The target platform is GitHub + Supabase + Cloudflare Workers. Vercel and Appwrite are retired and must not be reintroduced. GitHub is source control and CI/CD; Supabase is the application backend; Cloudflare Workers provides the dynamic web runtime.

## Runtime
- Next.js App Router + React + TypeScript.
- Cloudflare Workers using the currently supported Next.js-on-Workers adapter/runtime. Validate framework and adapter compatibility against Cloudflare's current guide before upgrading or deploying.
- Do not use GitHub Pages for this app: it needs server rendering, route handlers and authenticated server requests.
- GitHub Actions performs reproducible install, typecheck, lint, unit tests, E2E tests and production build/deploy.
- Cloudflare deployment secrets are configured as encrypted Worker secrets, never committed.

## Supabase
- PostgreSQL is the source of truth for content, site settings, users/roles, products, services, bookings, orders, media metadata and audit events.
- Supabase Auth uses email/password initially; Google OAuth is not part of the login experience.
- Supabase Storage stores media with explicit public/private bucket policy.
- Realtime is opt-in only for features that need live updates.
- Edge Functions are used only when a separate Supabase-hosted function is useful; ordinary Next.js server actions/route handlers remain on the Worker.
- Every exposed table has RLS enabled and least-privilege policies. Never expose a Supabase secret/service-role key in browser code.

## Next.js Supabase integration
- Use pinned @supabase/supabase-js and @supabase/ssr dependencies with committed lockfile.
- Create separate browser and request-scoped server clients.
- Use the current Next.js Proxy convention and Supabase SSR cookie refresh flow.
- Validate server-side identity with Supabase Auth claims/user APIs; never trust client-provided role or user metadata for authorization.
- Admin roles are stored in protected app_metadata or a dedicated role table with policies; do not use user-editable user_metadata for authorization.
- Authenticated responses must be private/no-store and must never be shared-cached.

## Data and migration safety
- Existing Supabase project: 3B TECH HUB, region ap-northeast-1.
- Initial audit found no tables in public schema. A security advisor found public.rls_auto_enable() executable by anon/authenticated. EXECUTE has been revoked from PUBLIC, anon and authenticated; preserve the owner-installed event trigger and verify privileges after changes.
- Do not assume any former Appwrite data was migrated. Inventory and export any recoverable data separately before schema creation.
- Use reviewed SQL migrations in supabase/migrations, backups before production DDL, RLS on all exposed tables, and advisor checks after schema changes.
- Never drop project resources, tables, buckets, users or records as part of routine migration.

## Migration sequence
1. Keep existing main branch stable; implement on foundation/supabase-cloudflare.
2. Inventory Appwrite/Vercel references, route behavior, auth flows, schemas, storage and tests.
3. Add Supabase SSR clients and env validation; keep old adapters isolated temporarily during migration.
4. Design and review normalized Supabase schema, indexes, constraints, RLS and storage policies.
5. Migrate authentication and owner/admin authorization; verify recovery, logout and session refresh.
6. Migrate content drafts, approval/publish workflow, settings, audit log and media.
7. Migrate public and admin APIs; add integration and E2E tests.
8. Add Cloudflare Workers adapter/configuration, preview deploy and production secrets.
9. Run CI, security/performance advisors, smoke tests and manual browser checks.
10. Switch production only after owner approval and rollback plan verification.

## Environment variables
Public:
- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY

Server/CI secrets:
- SUPABASE_SECRET_KEY only if a privileged server operation is genuinely required; prefer user-scoped SSR clients and RLS.
- CLOUDFLARE_API_TOKEN
- CLOUDFLARE_ACCOUNT_ID
- Any other integration secrets only when that integration is approved.

## Hosting cost and limitations
Target free tiers, not a promise of permanent $0 cost. Monitor Worker requests/CPU, Supabase database/storage/egress/auth quotas, inactivity pause behavior and GitHub Actions minutes. A custom domain may cost money. Never trade off security or backups to remain free.

## Release gates
- Build, lint, typecheck, unit tests and E2E pass.
- Supabase security and performance advisors reviewed; no unresolved critical/high finding.
- RLS tests cover anonymous, member, staff/admin and owner access.
- Login, logout, password recovery, content workflow, media upload/preview/delete, settings persistence and audit log verified.
- Lighthouse and Core Web Vitals checked on deployed pages.
- Owner explicitly approves production cutover.

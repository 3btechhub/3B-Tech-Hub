# 3B TECH HUB

A clean, fast, dynamic and owner-controlled platform for electronics repair, technical services, products, bookings and customer support.

## Product requirements
- Homepage main content: only “Three Brothers Technology Hub”; keep the custom header and footer.
- Login UI stays simple with email/password only. Google login is not used.
- Mobile-first, accessible, SEO-friendly, lightweight and secure.
- Owner approval before public publishing; content workflow: Draft → Preview → Approval → Publish.
- Admin-editable content, navigation, theme, services, products, SEO and business settings where practical.

## Technology
- Web: Next.js App Router, React and TypeScript.
- UI: Tailwind CSS and shared reusable components.
- Database/Auth/Storage: Supabase PostgreSQL, Supabase Auth and Supabase Storage.
- Dynamic hosting: Cloudflare Workers through the OpenNext adapter.
- Source control and CI/CD: GitHub and GitHub Actions.
- Testing: Vitest and Playwright.
- Vercel and Appwrite are retired and must not be reintroduced.

## Repository
- Repository: https://github.com/3btechhub/3B-Tech-Hub
- Production branch: main
- Migration work: launch/cloudflare-supabase
- Supabase project: sburxeuxkrilbfppxylm (ap-northeast-1)
- Cloudflare Worker name: 3b-tech-hub

## Local development
1. Use Node.js 22.
2. Copy .env.example to .env.local.
3. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY.
4. Run npm install, then npm run dev.

## Validation
- npm run typecheck
- npm run lint
- npm run test
- npm run test:e2e
- npm run cf:build
- npm run cf:preview

## Deployment
The Cloudflare workflow requires GitHub Actions variable CLOUDFLARE_ACCOUNT_ID and secret CLOUDFLARE_API_TOKEN. The token should have only the Workers Scripts Edit permission for the intended account. Deployment runs from main after reviewed changes are merged.

Before production launch, finish the Appwrite-to-Supabase route migration, configure and verify the owner role, run E2E tests and test the Worker preview. See docs/launch-checklist.md.

## Security
- RLS is enabled on every application table.
- Never commit Supabase secret/service-role keys or customer data.
- Publishable keys may be used in browser applications with correct RLS policies.
- Keep private/authenticated responses out of shared CDN caches.
- Use verified user IDs when assigning owner/admin roles; never guess IDs.

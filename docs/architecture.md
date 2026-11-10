# 3B TECH HUB — Technical Architecture

## 1. Goals
Build a maintainable, secure, responsive business platform that can grow from a repair-service website into a multi-channel business system. The platform must support owner-controlled customization and an approval-gated publishing workflow.

## 2. System overview

```text
Customer / Admin browser
        |
        v
Next.js App Router (React + TypeScript)
  | Public pages / SEO / Admin UI
  | Server Actions or Route Handlers (validated)
  v
Appwrite services
  | Auth + TablesDB + Storage + Functions
  v
Business data and protected files

GitHub repository -> GitHub Actions -> Vercel Preview
                                      -> Owner approval
                                      -> Production deployment
Cloudflare: DNS / edge protection / caching where appropriate
```

## 3. Technology choices
- Next.js App Router + React + TypeScript: server rendering, metadata, typed application code and shared public/admin foundation.
- Tailwind CSS + shadcn/ui: responsive design system with accessible reusable components.
- Appwrite: authentication, TablesDB, file storage and server-side functions.
- Vercel: preview and production hosting for Next.js. GitHub Pages is not the target host because the planned platform requires server-side capabilities.
- GitHub Actions: automated lint, type-check, tests and build validation.
- Vitest + Playwright: unit/component and end-to-end browser testing.
- Cloudflare: DNS and carefully configured edge protection; avoid caching authenticated/admin responses.

## 4. Application modules
1. Public website: home, about, service categories, service details, products, blog, FAQ, reviews and contact.
2. Service operations: booking requests, status tracking, customer communication and service history.
3. Commerce foundation: product catalogue, inventory, cart/order capability and payment-provider integration when selected.
4. Admin workspace: dashboard, page/content editor, navigation, theme, media, services, products, bookings, orders, customers, SEO, users/roles, settings, audit log and backups.
5. Integration layer: notifications, analytics, payment providers and AI services through server-side adapters.

## 5. Admin customization and publishing
- Store editable content and site configuration as data, not hard-coded page text.
- Provide reusable page sections and templates with validated configuration.
- Separate draft and published versions.
- Preview uses draft data in a protected preview context.
- Only an authorized owner can approve and publish.
- Record who changed, approved and published each version.
- Keep rollback/version history for content and configuration.
- Sensitive system settings and credentials are not editable as plain content fields.

## 6. Security model
- Appwrite Auth for identity; enforce authorization on the server for every privileged operation.
- Roles: Owner, Admin, Manager, Staff. Owner has final publishing authority.
- Deny-by-default database and storage permissions; grant only the minimum required access.
- Never expose Appwrite API keys, OpenAI keys or other server secrets in browser code.
- Validate and normalize all user input on the server; rate-limit public forms and authentication-sensitive endpoints.
- Restrict uploads by type, size and ownership; use private storage for sensitive files.
- Maintain audit events for privileged changes.
- Use secure headers, dependency updates, backups and recovery tests.

## 7. SEO and performance
- Server-render public pages where useful; generate canonical URLs, metadata, sitemap and robots rules.
- Add Schema.org structured data for the business and relevant service/product pages.
- Optimize images, fonts, caching and Core Web Vitals.
- Keep admin pages authenticated and excluded from indexing.
- Support multilingual content architecture (initial language choice to be confirmed before content production).

## 8. Environments and release flow
- Development: local developer environment with non-production data.
- Preview: isolated deployment for review and testing.
- Production: promoted only after owner approval.
- CI checks: lint, TypeScript, unit tests, end-to-end smoke tests and production build.
- Store environment variables in hosting/provider secret stores; never in Git.
- Maintain a documented rollback procedure.

## 9. Scalability decisions
- API-first service boundaries allow future mobile apps and third-party integrations.
- Modular domain areas keep booking, catalogue, content and identity concerns separate.
- Use pagination, indexes and query limits for growing datasets.
- Add background jobs/functions for notifications and long-running workflows.
- Add caching only to public, non-personalized data.
- Evaluate dedicated database/replicas only when measured traffic and reliability needs justify cost.

## 10. Open decisions before production
- Primary domain and DNS ownership.
- Initial public languages and currencies.
- Payment provider(s), if online payments are required.
- Exact service locations, booking rules and notification channels.
- Legal/privacy policy requirements for operating markets.
- Final admin user identities and role assignments.

## 11. Current implementation status
Architecture documentation only. No production application, Appwrite database, storage bucket, function or Vercel deployment has been created yet.

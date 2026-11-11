# 3B TECH HUB — Technical Architecture

## 1. Goals
Build a maintainable, secure, responsive business platform that can grow from a repair-service website into a multi-channel business system. The platform must support owner-controlled customization and an approval-gated publishing workflow.

## 2. System overview

```text
Customer / Admin browser
        |
        v
Appwrite Sites — Next.js App Router (SSR, Node.js 22)
  | Public pages / SEO / Admin UI
  | Server Route Handlers (validated)
  v
Appwrite services
  | Auth + TablesDB + Storage
  v
Business data and protected files

GitHub repository -> GitHub Actions (CI)
        |
        v
Appwrite VCS deployment -> build -> SSR deployment
        |
        v
Owner verification / release approval
```

Vercel is intentionally excluded. Appwrite Sites is the production hosting and SSR platform.

## 3. Technology choices
- Next.js App Router + React + TypeScript: server rendering, metadata, typed application code and shared public/admin foundation.
- Tailwind CSS + shared UI components: responsive design system with accessible reusable components and globally consistent sizing.
- Appwrite: authentication, TablesDB, file storage and server-side runtime credentials.
- Appwrite Sites: GitHub-connected Next.js SSR hosting.
- GitHub Actions: automated lint, type-check, tests, dependency audit and build validation.
- Vitest + Playwright: unit/component and end-to-end browser testing.
- DNS and edge protection: configure only after the primary domain and DNS owner are confirmed. Do not cache authenticated/admin responses.

## 4. Application modules
1. Public website: home, about, service categories, service details, products, blog, FAQ, reviews and contact.
2. Service catalogue: service information, categories and public service pages.
3. Product catalogue: product information and direct customer contact; no order, checkout or payment module.
4. Admin workspace: dashboard, service and product catalogues, workshops, technicians, media, users/roles, permissions, settings, audit log and backups.
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
- The SSR API key must remain a secret Site variable and should have only the TablesDB row and Storage file scopes required by the application.

## 7. Current Appwrite resources
- Site: `3b-tech-hub`
- Database: `3btechhub-prod`
- Tables: `content`, `audit_logs`, `media_assets`, `site_settings`
- Storage bucket: `media`
- The tables are provisioned in Appwrite TablesDB. The logical data model in `docs/data-model.md` describes the current implemented foundation and future expansion separately.

## 8. Media management and delivery
- Provide a central Media Library with CRUD for images, videos, documents and other approved assets.
- Support Appwrite Storage uploads and validated external HTTPS media URLs.
- Optimize images with responsive renditions, AVIF/WebP where supported, thumbnails, lazy loading and CDN caching for public assets.
- Use poster images and lazy-loaded/adaptive delivery for video; avoid loading large originals unnecessarily.
- Track media usage and prevent unsafe deletion of assets referenced by published content.
- Validate uploads and external hosts; enforce server-side role checks and private/public storage boundaries.

## 9. SEO and performance
- Server-render public pages where useful; generate canonical URLs, metadata, sitemap and robots rules.
- Add Schema.org structured data for the business and relevant service/product pages.
- Optimize images, fonts, caching and Core Web Vitals.
- Keep admin pages authenticated and excluded from indexing.
- Support multilingual content architecture (initial language choice to be confirmed before content production).

## 10. Environments and release flow
- Development: local developer environment with non-production data.
- Preview: isolated Appwrite deployment for review and testing.
- Production: promote only after owner approval and release checks.
- CI checks: lint, TypeScript, unit tests, end-to-end smoke tests, dependency audit and production build.
- Store environment variables in Appwrite Site secret variables; never in Git.
- Maintain a documented rollback procedure using a previously successful Appwrite deployment.

## 11. Open decisions before production
- Primary domain and DNS ownership.
- Initial public languages and currencies.
- Payment provider(s), if online payments are required.
- Exact service locations and notification channels.
- Legal/privacy policy requirements for operating markets.
- Additional admin user identities and delegated role assignments.

## 12. Current implementation status
The Next.js application is connected to GitHub and Appwrite Sites. The production Site is configured for Next.js SSR on Node.js 22. The Appwrite database, four core TablesDB tables and media bucket are provisioned. A successful Appwrite build has been recorded.

A successful build is not equivalent to full end-to-end production verification. Owner authentication, content CRUD, media workflows, settings persistence, audit events, backup/restore and browser-level checks must pass before the system is declared fully production-ready.

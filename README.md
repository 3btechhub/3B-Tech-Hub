# 3B TECH HUB

A scalable, owner-controlled digital platform for electronics repair, technical services, products, bookings and customer support.

## Product principles
- Owner approval is required before production publishing.
- Every content/configuration change follows Draft → Preview → Approval → Publish.
- Admin-first customization: page content, navigation, theme, services, products, SEO and business settings should be editable without code wherever practical.
- Secure by default: least privilege, server-side authorization, validated inputs and protected secrets.
- Modular and API-first so future mobile apps, integrations and AI capabilities can reuse the platform.

## Planned technology
- **Web:** Next.js (App Router), React, TypeScript
- **UI:** Tailwind CSS, shadcn/ui
- **Backend:** Appwrite Auth, TablesDB, Storage and Functions
- **Hosting:** Vercel (production web hosting)
- **Source control / CI:** GitHub and GitHub Actions
- **Testing:** Vitest and Playwright
- **Security / edge:** Appwrite permissions, server-side role checks, Cloudflare
- **SEO:** Next.js metadata, sitemap, robots and Schema.org structured data

## Repository status
This repository is being initialized. Architecture and data-model decisions are documented under `docs/`. Appwrite resources and production hosting are not yet provisioned.

## Documentation
- [Architecture](docs/architecture.md)
- [Data model](docs/data-model.md)

## Environments
- Local development: planned
- Preview: planned; approval required before production promotion
- Production: planned; no live deployment has been made

## Security
Never commit API keys, secrets, credentials, customer personal data, or production environment files. Use environment variables in the hosting provider and server-side code only.

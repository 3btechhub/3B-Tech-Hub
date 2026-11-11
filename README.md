# 3B TECH HUB

A scalable, owner-controlled digital platform for electronics repair, technical services, products, bookings and customer support.

## Product principles
- Owner approval is required before production publishing.
- Every content/configuration change follows Draft → Preview → Approval → Publish.
- Admin-first customization: page content, navigation, theme, services, products, SEO and business settings should be editable without code wherever practical.
- Secure by default: least privilege, server-side authorization, validated inputs and protected secrets.
- Modular and API-first so future mobile apps, integrations and AI capabilities can reuse the platform.

## Technology
- **Web:** Next.js App Router, React and TypeScript
- **UI:** Tailwind CSS and shared reusable UI components
- **Backend:** Appwrite Auth, TablesDB and Storage
- **Hosting / SSR:** Appwrite Sites (Next.js SSR, Node.js 22)
- **Source control / CI:** GitHub and GitHub Actions
- **Testing:** Vitest and Playwright
- **SEO:** Next.js metadata, sitemap, robots and structured data

Vercel is not part of the deployment architecture. Production hosting and server rendering are provided by Appwrite Sites.

## Repository and deployment
- Repository: [3btechhub/3B-Tech-Hub](https://github.com/3btechhub/3B-Tech-Hub)
- Production branch: `main`
- Appwrite Site: `3b-tech-hub`
- Appwrite project: `6af3bd9b003db0b9afb5`
- Appwrite database: `3btechhub-prod`
- Storage bucket: `media`
- Deployment is connected to GitHub VCS and is built with `npm install` and `npm run build`.
- The Appwrite Site uses the Next.js SSR adapter and Node.js 22.
- Server-only Appwrite credentials are stored as secret Site variables; never commit them to this repository.
- The Owner account must be created in Appwrite Auth and its exact user ID added to `ADMIN_OWNER_USER_IDS` before admin sign-in is enabled.
- A successful build does not by itself prove that every authenticated workflow or integration is operational; use the health endpoint and release checklist below.

## Local development
1. Install Node.js 22.
2. Copy `.env.example` to `.env.local`.
3. Fill the Appwrite values using the Appwrite Console. Never commit real credentials.
4. Run `npm install`.
5. Run `npm run dev`.

## Validation commands
- `npm run typecheck`
- `npm run lint`
- `npm run test`
- `npm run test:e2e`
- `npm run build`

## Production health and release
- Health endpoint: `/api/health`
- A healthy response requires the Content, Media, Settings and Audit TablesDB checks to connect.
- Verify Owner login, content draft CRUD, media upload/preview/delete, settings save/reload and audit events before declaring a release production-ready.
- Keep the Appwrite API key server-only and grant only the scopes required by the SSR application.
- Keep a known-good Appwrite deployment available for rollback. Do not delete historical deployments or production data as part of routine releases.

## Documentation
- [Architecture](docs/architecture.md)
- [Data model](docs/data-model.md)

## Security
Never commit API keys, secrets, credentials, customer personal data, or production environment files. Use Appwrite Site secret variables for server-only values. Only public endpoint/project identifiers may use `NEXT_PUBLIC_*` variables.

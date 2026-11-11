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
- Appwrite Site: `3B TECH HUB` (`3b-tech-hub`)
- Production URL: https://3btechhub.appwrite.network
- Appwrite project: `6af42ac200285a12f46f`
- Appwrite database: `3btechhub-prod`
- Storage bucket: `media`
- Deployment is connected to GitHub VCS and is built with `npm install` and `npm run build`.
- The Appwrite Site uses the Next.js SSR adapter and Node.js 22.
- Keep `APPWRITE_API_KEY` in Appwrite Site Variables as a secret, never in Global Variables or Git. The Appwrite Sites scoped `x-appwrite-key` header is preferred at runtime; the secret variable is a fallback.
- The exact Owner Auth user ID is configured in the `ADMIN_OWNER_USER_ID` Site variable; it is an identifier, not a credential. Keep passwords, API keys and session secrets private. `ADMIN_OWNER_USER_IDS` remains supported for multiple owners.
- A successful build does not by itself prove that every authenticated workflow or integration is operational; use the health endpoint and release checklist below.
- Current Appwrite Free plan reports a Site quota of zero. Confirm an eligible Sites entitlement before treating production hosting as durable; the current site may remain disabled despite a successful build.

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

# 3B TECH HUB — Production Operations

## Hosting and release
- Production hosting is Appwrite Sites (Next.js SSR, Node.js 22); Vercel is not part of the deployment path.
- The production branch is `main` in `3btechhub/3B-Tech-Hub`.
- Verify the Appwrite deployment reaches `ready` before activating it.
- Keep the active deployment and at least one recent known-good deployment for rollback.
- Inactive deployment retention is configured to 7 days to reduce build-storage accumulation.

## Server credentials
- Keep `APPWRITE_API_KEY` in Appwrite Site Variables with Secret enabled. Do not place it in Global Variables, `NEXT_PUBLIC_*`, Git, or client code.
- The Site's scoped `x-appwrite-key` is preferred; `APPWRITE_API_KEY` is a server-side fallback.
- Current server scopes are limited to `rows.read`, `rows.write`, `buckets.read`, `files.read`, and `files.write`.
- Owner identity is configured with the secret `ADMIN_OWNER_USER_ID` and `ADMIN_OWNER_EMAIL` Site variables. Never store credentials in the repository.

## Health checks
- Public health endpoint: `/api/health`.
- A healthy response requires Content, Media, Settings, Audit, Media Bucket and Owner configuration checks to pass.
- Before release, verify Owner sign-in, draft save/load, review/approve/publish, settings save/reload, media upload/preview/metadata/trash/restore and audit records.
- The health endpoint reports configuration and service connectivity; it does not replace authenticated end-to-end testing.

## Backup and recovery limitation
- The current Appwrite Free plan rejects backup-policy operations with `additional_resource_not_allowed` ("Backups are not allowed on your plan").
- Therefore, scheduled Appwrite backups and an Appwrite-managed restore policy are **not configured**. An eligible plan upgrade is required before these can be enabled.
- At the time this runbook was written, the production TablesDB tables contain zero rows and the `media` Storage bucket contains zero files. The GitHub repository preserves the application source and schema documentation, but it is not a backup of future production records or uploaded files.
- Do not describe the project as having automated data backups until a backup archive has been created successfully and a restore test has passed.

## Storage investigation
- Appwrite Usage currently reports 0 B file storage, 68.4 KB deployment storage and 208.4 MB build storage.
- Billing aggregation previously reported approximately 3.34 GB, which does not reconcile with the Usage view or the three listed deployments.
- Organization Billing Aggregation access returned 401 in the current operator session. Keep this discrepancy open until Appwrite Billing exposes a matching current-cycle breakdown; do not delete production resources based only on the inconsistent figure.

## Domain
- The active public address is the Appwrite-generated `3btechhub.appwrite.network` hostname.
- A branded custom domain requires a domain name controlled by the project owner and DNS verification. Do not invent or register a domain without that ownership information.

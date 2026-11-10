# Appwrite Server Setup

Admin APIs remain disabled until the Owner provisions and configures dedicated Appwrite resources.

## Required server-only environment
- APPWRITE_API_KEY: server-only key with least-privilege TablesDB row read/create/update/delete and Storage file create/delete scopes. Uploads are private by default; do not expose them publicly until an explicit delivery-permission flow is implemented.
- APPWRITE_DATABASE_ID
- APPWRITE_CONTENT_TABLE_ID
- APPWRITE_MEDIA_TABLE_ID
- APPWRITE_AUDIT_TABLE_ID
- APPWRITE_MEDIA_BUCKET_ID
- Existing NEXT_PUBLIC_APPWRITE_ENDPOINT and NEXT_PUBLIC_APPWRITE_PROJECT_ID.

Never expose APPWRITE_API_KEY through NEXT_PUBLIC variables, client bundles, logs or audit metadata.

For content revisions, keep a unique composite index on slug + locale + revision to prevent duplicate version numbers. The current API also checks the latest known revision before insertion; the unique index is the final concurrency guard.

## Content table columns
Create a TablesDB table with row-level client permissions disabled and columns: slug (string), locale (string), revision (integer), status (string), payload (string with suitable size), createdBy (string), createdAt (string/datetime).

## Media table columns
Create a separate table with columns for title, altText, caption, tags, visibility, sourceType, externalUrl, storageBucketId, storageFileId, mediaType, mimeType, fileSize, provider, createdBy, createdAt and deletedAt. Match types and size limits to Appwrite TablesDB constraints.

## Audit table columns
Create a separate table with actorId, actorRole, action, targetType, targetId, requestId, metadata and occurredAt. Do not grant client write access. Validated events are appended after privileged content/media changes and workflow transitions; a failed audit write triggers rollback attempts where the underlying operation can be safely reversed.

## Storage bucket
Create a private bucket initially. Enforce the 50 MB maximum and allowed image/video/PDF MIME types. Public delivery must be enabled only after a separate review of public/private access and CDN cache policy.

## API behavior
- Draft creation and listing are Owner-only, same-origin and accept only schema-valid draft revisions.
- Owner-only workflow actions support submit for review, approve and publish, with validated status transitions and audit events.
- External media registration is Owner-only and accepts HTTPS URLs only.
- Upload validates size, MIME and basic file signature before storage. If metadata or audit persistence fails, the uploaded object and metadata row are rolled back where possible.
- APIs return 503 while required server-side configuration is absent. They do not create resources automatically.
- Appwrite API key permissions must be least-privilege, server-only and rotated if exposed.

## Implemented API operations
- Content draft create/list and Owner-only submit-for-review, approve and publish transitions.
- Media list, device upload, external URL registration, metadata update, soft-delete and restore.
- Protected server-rendered preview of a saved content revision under the authenticated admin route.

## Not yet implemented
Advanced pagination/search, editing an existing content revision (create a new revision instead), permanent media deletion with usage checks, media rendition generation/CDN delivery, public published-page reads, strong optimistic concurrency for concurrent revision creation, and non-owner role profiles remain pending.

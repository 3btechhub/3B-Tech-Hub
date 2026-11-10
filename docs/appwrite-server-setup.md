# Appwrite Server Setup

Admin APIs remain disabled until the Owner provisions and configures dedicated Appwrite resources.

## Required server-only environment
- APPWRITE_API_KEY: server-only key with only the required TablesDB row-create and Storage file create/delete scopes.
- APPWRITE_DATABASE_ID
- APPWRITE_CONTENT_TABLE_ID
- APPWRITE_MEDIA_TABLE_ID
- APPWRITE_MEDIA_BUCKET_ID
- Existing NEXT_PUBLIC_APPWRITE_ENDPOINT and NEXT_PUBLIC_APPWRITE_PROJECT_ID.

Never expose APPWRITE_API_KEY through NEXT_PUBLIC variables, client bundles, logs or audit metadata.

## Content table columns
Create a TablesDB table with row-level client permissions disabled and columns: slug (string), locale (string), revision (integer), status (string), payload (string with suitable size), createdBy (string), createdAt (string/datetime).

## Media table columns
Create a separate table with columns for title, altText, caption, tags, visibility, sourceType, externalUrl, storageBucketId, storageFileId, mediaType, mimeType, fileSize, provider, createdBy, createdAt and deletedAt. Match types and size limits to Appwrite TablesDB constraints.

## Storage bucket
Create a private bucket initially. Enforce the 50 MB maximum and allowed image/video/PDF MIME types. Public delivery must be enabled only after a separate review of public/private access and CDN cache policy.

## API behavior
- Draft creation is Owner-only, same-origin and accepts only schema-valid draft revisions.
- External media registration is Owner-only and accepts HTTPS URLs only.
- Upload validates size, MIME and basic file signature before storage. If metadata persistence fails, the uploaded object is deleted as rollback.
- APIs return 503 while required server-side configuration is absent. They do not create resources automatically.
- Appwrite API key permissions must be least-privilege, server-only and rotated if exposed.

## Not yet implemented
Listing/search, update, soft-delete/restore, permanent delete with usage checks, media rendition generation, published page reads, optimistic concurrency, persistent audit logging and non-owner role profiles remain pending.

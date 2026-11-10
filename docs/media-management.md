# Media Library and Delivery Architecture

## Goals
Provide fast, reliable delivery of images, video, documents and other approved media, with owner-controlled CRUD from the admin dashboard. Support both first-party Appwrite Storage assets and externally hosted media URLs.

## Supported source types
- Managed upload: Appwrite Storage is the canonical managed asset store.
- External URL: HTTPS URL hosted by an approved third-party origin/CDN; store metadata and reference the URL without copying the file.
- Video embed/stream: support approved provider embeds or streaming URLs; do not treat arbitrary webpages as safe video embeds.

## Media Library capabilities
- Create: upload files or register an external URL.
- Read: searchable/filterable library with preview, metadata, dimensions, duration, size, MIME type, source, status and usage references.
- Update: edit title, alt text, caption, tags, focal point, category and replacement file/URL while preserving stable asset references where possible.
- Delete: soft-delete/trash first; permanent deletion only after checking references and owner-authorized confirmation. Prevent accidental deletion of media used by published pages.
- Bulk operations: select, tag, archive and delete with permission checks.
- Track usage: record which pages, products, services or content entries reference each asset.

## Performance and delivery
- Use Next.js image optimization for supported image formats and responsive srcset/sizes.
- Generate thumbnails and appropriately sized variants; prefer AVIF/WebP where supported and retain safe fallbacks.
- Lazy-load below-the-fold images; prioritize only the actual above-the-fold/LCP image.
- Set width/height or aspect ratio to reduce layout shift; use placeholders/blur previews where practical.
- Deliver public assets through a CDN with versioned URLs and cache headers. Never publicly cache private/customer files.
- Avoid loading original full-resolution images when a smaller rendition is sufficient.
- For video, use poster images, lazy-loaded player/embed, adaptive streaming/provider delivery where available, and avoid autoplay with sound.
- Configure external image host allowlists and Next.js remote image patterns; do not allow arbitrary remote hosts by default.
- External URLs should be HTTPS, validated against unsafe schemes, and displayed with a safe fallback when unavailable.

## Data model
MediaAsset logical fields:
- id, sourceType (appwrite | external | video_embed)
- storageBucketId and storageFileId (managed files only)
- externalUrl and provider (external sources only)
- mediaType, mimeType, fileName, fileSize, width, height, duration
- title, altText, caption, tags, folder/category, focalPoint
- visibility (public | private), processingStatus, createdBy, createdAt, updatedAt, deletedAt
- usage references are indexed separately or maintained through a validated relation model.

## Security and governance
- Enforce Owner/Admin/Manager/Staff permissions server-side; do not trust role values supplied by the browser.
- Validate MIME type and file signature, file size, extension, dimensions/duration and upload ownership.
- Use generated storage IDs and safe filenames; never execute uploaded content.
- Keep private assets private and issue access only through authorized server routes or short-lived access mechanisms.
- Protect external embeds with provider allowlists, CSP and safe iframe attributes; never render arbitrary HTML from a media URL.
- Audit upload, metadata edit, replacement, archive, restore and permanent delete actions.
- Owner approval remains required for publishing changes; media edits alone must not silently publish draft content.

## Admin UX
Dedicated Media Library with grid/list views, upload progress, drag-and-drop upload, URL import, search, filters, folders/tags, preview, metadata editor, usage panel, trash/restore and bulk actions. Provide alt-text fields and accessibility guidance.

## Implementation sequence
1. Define Appwrite Storage bucket policy and media metadata table after security review.
2. Implement server-side upload and URL registration endpoints with validation.
3. Build Media Library CRUD and usage tracking in Admin.
4. Add image rendition/CDN strategy and video delivery adapters.
5. Add automated tests for permissions, upload validation, URL validation, deletion safety and public/private caching.
6. Measure Core Web Vitals and tune based on real asset sizes and traffic.

## Important constraints
- External URLs are references, not files under our control; their availability, speed, privacy behavior and permanence depend on the external host.
- Do not proxy or download external content without a clear need and permission.
- Do not create production buckets/tables or incur paid media/CDN services until owner approval and provider/cost decisions are clear.

# Media Library and Delivery

## Current production media path
- Supabase Storage bucket: `site-media`.
- Catalogue images are uploaded from the Owner dashboard and stored as public URLs.
- Storage write policies must be Owner/Admin-only; public visitors may read only approved public assets.
- The browser uses the public Supabase publishable key; no service-role key is permitted.

## Required Media Library behavior
- Upload approved image/video/document types with explicit size limits.
- List and preview assets.
- Edit metadata and alternative text.
- Copy public URLs.
- Filter by type/date and search by name.
- Delete only after checking product, service, workshop, technician and site-content references. A trash/restore workflow is not implemented yet.
- Keep private assets inaccessible to anonymous visitors.
- Audit metadata updates and deletes through database triggers. Storage upload/delete audit correlation and trash/restore are not implemented yet.

## Safety
- Validate MIME type, file size and file extension.
- Use generated storage paths, not raw user-provided paths.
- Do not render arbitrary HTML or unsafe external media URLs.
- Do not delete a file that is still referenced by published content.
- Never place service-role credentials in browser code.

## Status
The Owner/Admin dashboard includes a searchable Media Library backed by the existing public Storage bucket and metadata table. It lists existing bucket files, supports upload, filename/alt-text updates, type/date filters and URL copy, and blocks deletion when a catalogue or site-content record references the file. Browser-level verification is still pending; there is no soft-delete/restore or private-media workflow.

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
- Soft-delete first; permanent deletion requires checking all product/service/workshop/technician references.
- Keep private assets inaccessible to anonymous visitors.
- Audit upload, metadata update, visibility change, trash and restore actions.

## Safety
- Validate MIME type, file size and file extension.
- Use generated storage paths, not raw user-provided paths.
- Do not render arbitrary HTML or unsafe external media URLs.
- Do not delete a file that is still referenced by published content.
- Never place service-role credentials in browser code.

## Status
The existing catalogue image upload path is live. A dedicated searchable Media Library, metadata CRUD, usage tracking and tested restore flow remain unfinished. Do not represent those capabilities as complete until they are connected to Supabase and verified.

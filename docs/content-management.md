# Structured Content and Publishing Workflow

## Page editor data contract
- Pages are stored as validated structured sections, never as arbitrary executable HTML.
- Supported section types: hero, rich text, service grid, FAQ and call-to-action.
- Each section has bounded text, item counts and strict field validation.
- Navigation targets accept internal paths or HTTPS URLs only.
- SEO title and description have explicit length limits.
- Page revisions carry locale, revision number and workflow status.

## Approval workflow
- Draft → In review: an authenticated editor may submit a revision.
- In review → Draft: an editor may return a revision for changes.
- In review → Approved: Owner only.
- Approved → Published: Owner only.
- Published revisions are immutable; create a new draft revision for subsequent edits.

## Important implementation boundary
The schema, transition policy, browser editor and Owner-only draft APIs are implemented. Draft creation/listing and submit-for-review, approval and publishing endpoints are present, with audit writes required and rollback attempted if audit recording fails. A protected server-rendered preview is now available at the admin preview route after a revision is saved. The APIs and preview remain unavailable until Appwrite resources and server secrets are configured. Public published-page reads and a complete draft revision browser are still pending. Do not treat the CMS as production-ready.


## Current implementation additions
- Saved revisions can be reopened by their revision ID through the Owner-only GET endpoint and edited in place only while their status is Draft.
- The Owner-only PUT endpoint validates the complete page schema and prevents changing a draft's slug, locale or revision number. Submitted, approved and published revisions remain locked.
- The revision browser displays revision IDs and links to protected previews.
- Public content is served through a read-only API and dynamic locale/slug pages. Only rows with Published status and a valid matching payload are eligible; drafts and review states are never returned.
- Public page reads use short CDN revalidation headers. Private admin previews remain no-store and noindex.

## Remaining before production
Appwrite database/table resources and the server API key are not configured in this project. The new read/edit/publish paths therefore have not yet been verified against live Appwrite data. Add pagination, revision concurrency protection via a unique slug+locale+revision index, and a dedicated public content cache invalidation strategy before launch.

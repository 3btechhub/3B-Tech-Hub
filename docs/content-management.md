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

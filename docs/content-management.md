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
The schema, transition policy and a browser-local editor preview shell are implemented. The editor validates its local draft and displays a live preview. Persistent page storage, protected preview rendering, server-side authorization at mutation endpoints, audit persistence and publishing are not yet connected. The current editor is a local-only prototype; it does not save data or call a backend. Do not treat this contract alone as a live CMS.

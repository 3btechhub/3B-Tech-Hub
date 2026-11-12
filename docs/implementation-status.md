# Single English Website Refactor

Updated: 2026-11-13

## Approved scope
See [master-spec.md](master-spec.md). The website is one English-only site with one shared layout and shared content catalogues.

## Changes in progress on `feature/single-english-site-2026-11-13`
- [x] Removed country detection and country context bootstrap from the frontend.
- [x] Replaced country-aware routing with one root Home route and the approved Account, Profile and Dashboard routes.
- [x] Removed language and country selectors from the shared menu and 404 page.
- [x] Fixed the document language to English and direction to LTR.
- [x] Removed country filters and country fields from frontend content-module forms.
- [x] Removed country/language selector and RTL styles.
- [ ] Remove obsolete country entry files and country router asset.
- [ ] Apply a database migration to drop content `country` columns and profile `preferred_locale`, while preserving all content rows.
- [ ] Remove obsolete country/language feature flags from public runtime configuration.
- [ ] Run validation, review the complete diff, merge and verify deployment.

## Data safety
The migration is intended to remove only obsolete metadata columns. It must not delete Services, Products, Workshops, Technicians, user profiles, roles, audit logs, or uploaded media.

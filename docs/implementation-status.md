# Single English Website Refactor

Updated: 2026-11-13

## Approved scope
See [master-spec.md](master-spec.md). The website is one English-only site with one shared layout and shared content catalogues.

## Completed
- [x] Removed IP/country detection and country context bootstrap from the frontend.
- [x] Implemented one persistent Header, Main Area and Footer shell with four independent page views: Home, Account, Profile and Dashboard.
- [x] Home is a first-class page at `/home/`; the root URL opens the shared shell and canonicalizes to Home rather than acting as a separate content page.
- [x] Account, Profile and Dashboard retain their own routes; navigation changes only the Main Area.
- [x] Removed language and country selectors from the shared menu and 404 page.
- [x] Fixed the document language to English and direction to LTR.
- [x] Removed country filters and country fields from frontend content-module forms and catalogue queries.
- [x] Removed country/language selector and RTL styles.
- [x] Removed obsolete country entry files and country router asset.
- [x] Removed obsolete country and locale metadata from Supabase.
- [x] Removed obsolete country/language selector flags from public runtime configuration.
- [x] Updated CI and GitHub Pages validation for the single-site structure.
- [x] GitHub Actions validation passed.
- [x] Merged PR #32 to main.

## Supabase migration
- Migration: `20261112222407_remove_country_locale_support`
- Removed `country` from Services, Products, Workshops and Technicians.
- Removed `preferred_locale` from User Profiles.
- Removed `language_selector` and `region_selector` from public runtime configuration.
- Preserved all content and user rows.

## Remaining verification
- [ ] Confirm the post-merge GitHub Pages deployment succeeds.
- [ ] Perform a live browser smoke test of Home, Account, Profile and Dashboard.

## Data safety
The schema migration removes only obsolete metadata. It does not delete Services, Products, Workshops, Technicians, user profiles, roles, audit logs, or uploaded media.
# Implementation Status

Updated: 2026-11-12

## Live platform
- [x] GitHub Pages deploys the `site/` static frontend.
- [x] Supabase project `sburxeuxkrilbfppxylm` is active and healthy.
- [x] Supabase email/password authentication is used by the static frontend.
- [x] RLS is enabled on all 10 public application tables.
- [x] The Owner role is assigned to `3btechhub@gmail.com`.
- [x] Six active services are present with the approved country routing.
- [x] Products are stored in two groups: Mobile & Accessories and Satellite & TV Equipment.
- [x] Product group selection and catalogue pagination regression fixes are being added on the audit-fix branch.

## Implemented static-site modules
- [x] Homepage, login and user profile.
- [x] Service, product, workshop and technician catalogue rendering.
- [x] Owner-only CRUD forms for services, products, workshops and technicians.
- [x] Supabase Storage image uploads for catalogue records.
- [x] Dedicated Media Library with Storage listing, upload, metadata CRUD, filters and reference-safe deletion (browser verification pending).
- [ ] Owner user administration (invite, list, role assignment, block/unblock).
- [ ] Dedicated role/permission administration UI.
- [x] Owner-only website profile settings connected to Supabase; public homepage tagline and meta description read the public settings record.
- [ ] Complete backup/export and tested restore workflow.

## Database review findings
- [x] Revoke unnecessary anonymous write grants and review authenticated grants.
- [x] Restrict user-role mutations to the Owner, not any Admin.
- [x] Add append-only audit triggers for privileged data changes.
- [x] Add the missing workshop foreign-key indexes.
- [x] Add updated_at triggers for workshops and technicians.
- [x] Reconcile migration history with version-controlled SQL files.

## CI and verification
- [x] Static website file validation.
- [x] JavaScript syntax validation.
- [x] Unit/regression tests for catalogue behavior (CI run pending).
- [ ] Browser end-to-end tests for authentication and owner CRUD.
- [ ] Automated accessibility, responsive and production smoke tests.

- [x] Reconciled all 11 version-controlled migration files to the exact versions and SQL statements recorded in Supabase migration history.
- [x] Applied and verified least-privilege grants, Owner-only role policies, protected primary Owner, audit triggers, workshop indexes and timestamp triggers.
- [x] Deployed JWT-verified `owner-users` Edge Function for Owner-only invitations, role changes, account blocking/unblocking and password-reset emails.
- [x] Added User, Role Summary and Permission Matrix panels to the Owner dashboard.

## Explicitly not production-ready
The inactive Next.js/Appwrite prototype has been removed from the production branch. The audit backup branch preserves the pre-cleanup source. The live application is only the GitHub Pages frontend plus Supabase.

Do not claim a backup is complete until a database export/archive exists and a restore test has passed. Do not claim a module is complete until it is connected to Supabase, protected by RLS and verified in the browser.

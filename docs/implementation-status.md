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
- [ ] Dedicated Media Library CRUD and media usage tracking.
- [ ] Owner user administration (invite, list, role assignment, block/unblock).
- [ ] Dedicated role/permission administration UI.
- [ ] Website settings UI connected to Supabase.
- [ ] Complete backup/export and tested restore workflow.

## Database review findings
- [ ] Revoke unnecessary anonymous write grants and review authenticated grants.
- [ ] Restrict user-role mutations to the Owner, not any Admin.
- [ ] Add append-only audit triggers for privileged data changes.
- [ ] Add the missing workshop foreign-key indexes.
- [ ] Add updated_at triggers for workshops and technicians.
- [ ] Reconcile migration history with version-controlled SQL files.

## CI and verification
- [x] Static website file validation.
- [x] JavaScript syntax validation.
- [ ] Unit/regression tests for catalogue behavior.
- [ ] Browser end-to-end tests for authentication and owner CRUD.
- [ ] Automated accessibility, responsive and production smoke tests.

## Explicitly not production-ready
The old Next.js application under `src/` is not deployed by GitHub Pages. Its server routes and prototype modules must not be treated as active production features. No retired provider is part of the live architecture.

Do not claim a backup is complete until a database export/archive exists and a restore test has passed. Do not claim a module is complete until it is connected to Supabase, protected by RLS and verified in the browser.

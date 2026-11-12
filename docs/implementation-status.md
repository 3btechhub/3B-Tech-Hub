# Master-Spec Refactor Status

Updated: 2026-11-12

## Approved scope

See [master-spec.md](master-spec.md). This is the only allowed website specification.

## Work completed on `refactor/master-spec-2026-11-12`

- [x] Created a dedicated refactor branch from `main`.
- [x] Preserved the existing `backup/2026-11-12-before-scope-reset` branch.
- [x] Added the authoritative master specification.
- [x] Aligned repository implementation rules with the master specification.
- [x] Simplified Global, BD and KSA home pages.
- [x] Standardized canonical country route identifiers to `global`, `bd` and `ksa`.
- [x] Added the Account route and retained `/login/` as a compatibility redirect.
- [x] Replaced dashboard navigation with Overview, Audit, Page, User, Role, Permission and Settings.
- [x] Removed the Services, Products, Workshops and Technicians frontend routes and their product-catalog helper.
- [x] Removed legacy catalogue test coverage and updated CI route checks.
- [x] Restricted the user administration Edge Function role choices to Admin and Member.

## Still required before merge

- [ ] Align the live `user_roles.role` constraint and role policies with Owner/Admin/Member.
- [ ] Review and remove legacy database tables outside the approved scope after backup/dependency verification.
- [ ] Verify the Owner Edge Function and dashboard flows with the new role model.
- [ ] Verify the Page Builder and Audit module in a browser.
- [ ] Verify IP routing, manual route selection, all three language defaults, language switching and Arabic RTL.
- [x] `npm run validate` and the dynamic-page browser navigation test pass in GitHub Actions (CI run 990).
- [ ] Browser verification of IP routing, language switching, Page Builder, Audit and account/profile flows remains pending.
- [ ] Review the final diff and create a pull request; do not merge until all required checks pass.

## Data safety note

The live database still contains legacy catalogue tables and records. They have not been deleted by this branch. The existing Git backup protects source code only; it is not a verified database or Storage backup. No claim of database backup completion is made.

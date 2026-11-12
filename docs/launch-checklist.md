# 3B TECH HUB — Master-Spec Release Checklist

## Production platform
- Repository: `3btechhub/3btechhub`
- GitHub Pages: static frontend from `site/`
- Supabase project: `sburxeuxkrilbfppxylm` (`ap-northeast-1`)
- GitHub + Supabase only. Vercel, Appwrite and Cloudflare are excluded.

## Scope acceptance
- [ ] Only Home, Account, Profile, Dashboard, Page and Sub Page are present.
- [ ] Dashboard contains only Overview, Audit, Page, User, Role, Permission and Settings.
- [ ] User types are Owner, Admin, Member and Visitor.
- [ ] Country routes are exactly Global, BD and KSA.
- [ ] Global, BD and KSA page visibility follows the master specification.
- [ ] Default languages are English, Bangla and Arabic for Global, BD and KSA.
- [ ] Arabic layout is RTL; language switching does not change country route.
- [ ] Theme is monochrome black/white with neutral gray and theme-aware icons.
- [ ] Small, Medium and Large semantic sizes are used consistently.

## Security
- [ ] Fixed Owner `3btechhub@gmail.com` remains protected.
- [ ] Owner/Admin/Member roles and RLS policies match the access matrix.
- [ ] Anonymous visitors cannot write to application tables or Storage.
- [ ] Admin cannot manage users, roles, permissions or system settings.
- [ ] Audit logs are append-only.
- [ ] No secret/service-role key is present in browser assets or Pages artifacts.

## Validation
- [ ] `npm run validate` passes.
- [ ] GitHub Actions CI and browser navigation tests pass.
- [ ] IP detection, Global fallback and manual route changes pass browser tests.
- [ ] Language defaults, switching and Arabic RTL pass browser tests.
- [ ] Account, Profile, Page Builder, Audit and Settings work in a real browser.
- [ ] Supabase country/role migration is applied and verified.
- [ ] Legacy tables outside the master specification are removed after private archive verification.
- [ ] GitHub Pages deployment and production smoke tests pass.

Do not claim a database backup until a full export/archive and restore test are verified.

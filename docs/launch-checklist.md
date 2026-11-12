# 3B TECH HUB — Release Checklist

## Production platform
- Repository: `3btechhub/3btechhub`
- GitHub Pages: static frontend from `site/`
- Supabase project: `sburxeuxkrilbfppxylm` (`ap-northeast-1`)
- GitHub + Supabase only. Vercel, Appwrite and Cloudflare are excluded.

## Scope acceptance
- [ ] One website with English-only UI and LTR layout.
- [ ] Only Home, Account, Profile and Dashboard pages.
- [ ] Header, Main Area and Footer remain persistent.
- [ ] Dashboard contains only Overview, Audit, Services, Products, Workshops, Technicians, User, Role, Permission and Settings.
- [ ] User types are Owner, Admin, Member and Visitor.
- [ ] Services, Products, Workshops and Technicians are shared across the website without country metadata.
- [ ] No country detection, country versions, language selector, translation system or RTL styles.
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
- [ ] GitHub Actions CI passes.
- [ ] Account, Profile, Dashboard, Audit and Settings work in a real browser.
- [ ] Supabase migration removes obsolete country/locale metadata while preserving all content rows.
- [ ] GitHub Pages deployment and production smoke tests pass.

Do not claim a database backup until a full export/archive and restore test are verified.

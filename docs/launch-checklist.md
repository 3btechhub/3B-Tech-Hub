# 3B TECH HUB — GitHub + Supabase Release Checklist

## Production platform
- Repository: `3btechhub/3btechhub`
- GitHub Pages: static frontend from `site/`
- Supabase project: `sburxeuxkrilbfppxylm` (`ap-northeast-1`)
- Supabase: Auth, PostgreSQL, RLS and Storage.
- Vercel, Appwrite and Cloudflare are excluded.

## Verified foundation
- GitHub Pages CI and deployment workflow have completed successfully in the latest observed run.
- Supabase project is active and healthy.
- RLS is enabled on all 10 public application tables.
- `3btechhub@gmail.com` has the Owner role.
- Six active services exist:
  - Bangladesh: TV Repair, Mobile Repair, Mobile Parts Sell.
  - Saudi Arabia: Satellite Dish Installation, Satellite Dish Servicing, Satellite Dish Parts Sell.
- Product catalogue currently has 9 active records across two product groups.

## Before production release
1. Confirm GitHub Pages is configured to deploy through GitHub Actions.
2. Verify Supabase Auth redirect URLs match the GitHub Pages project-site URL.
3. Run anonymous and authenticated RLS tests for every exposed table.
4. Confirm the Owner can manage catalogue records and non-owners cannot.
5. Verify profile update, password change, login and logout in a real browser.
6. Verify image upload and public image delivery through the `site-media` bucket.
7. Verify audit event creation and Owner-only audit reads.
8. Run unit and browser regression tests.
9. Confirm backup/export and restore procedure before any destructive database operation.

## Security
- Never put a Supabase secret/service-role key in GitHub, browser code or Pages artifacts.
- The publishable key is public by design; RLS is mandatory.
- Do not allow anonymous INSERT, UPDATE or DELETE privileges.
- Only the Owner may grant or change privileged roles.
- Do not claim a backup or restore workflow is complete until a real export and restore test succeeds.

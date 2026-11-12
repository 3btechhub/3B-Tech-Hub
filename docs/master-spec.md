# 3B TECH HUB — Master Specification

This document is the sole product-scope authority for the website. Production UI, routes, modules, data models and tests must stay within this specification. Anything not listed here is out of scope and must not be introduced.

## 1. Website structure
- Home
- Account
- Profile
- Dashboard

## 2. Shared layout
- Header
- Main Area
- Footer

The Header, Main Area and Footer form one persistent shared layout. The root entry (`/`) loads this shared layout; its Main Area initially displays the independent Home page. The Home page has its own canonical route (`/home/`), view file and static route entry, just like Account, Profile and Dashboard. Navigation swaps only the Main Area while Header and Footer remain mounted. Each page view is maintained once under `site/views/`.

## 3. Features
- Separate Logo and Website Title components
- Menu
- Dark / Light theme
- English-only interface
- Authentication
- CRUD
- Icons and fallback visuals
- Cards
- Pill buttons

There is one website and one fixed interface language: English. No country detection, country-specific versions, language switching, translation catalogue, locale preference, or right-to-left layout is part of the product.

## 4. Dashboard modules
Only these modules may exist:
- Overview
- Audit
- Services
- Products
- Workshops
- Technicians
- User
- Role
- Permission
- Settings

Services, Products, Workshops and Technicians are approved content-management modules. No Media Library, booking or other additional dashboard module is permitted.

### Content module fields
- Services: Name (required), Slug (required), Description, Category, Image, Visibility.
- Products: Name (required), Slug (required), Description, Category, Image, Visibility.
- Workshops: Name (required), Slug (required), Description, Location, Technician, Category, Image, Visibility.
- Technicians: Name (required), Slug (required), Description, Skill, Category, Image, Visibility.
- Slugs are generated from Name automatically and remain manually editable; they must be unique.
- Image files are uploaded directly to Supabase Storage and can be removed or replaced.
- In every content module, show the uploaded image when present; if absent or failed to load, show a module-appropriate fallback icon. Technicians alone use a human avatar fallback.
- Only Name and Slug are required; all other fields are optional.
- Content records are shared across the one website; there is no country-based filtering.

## 5. User types
- Owner — fixed primary account: 3btechhub@gmail.com
- Admin
- Member
- Visitor

Visitor is the anonymous/public access level and does not need a Supabase Auth role assignment. Owner must never be demoted, deleted, blocked, or replaced. Admin permissions are explicitly delegated; Member is a normal authenticated account.

## 6. Website routes
- Home: `/home/`
- Account: `/account/`
- Profile: `/profile/`
- Dashboard: `/dashboard/`
- `/` is the shared-layout entry point and resolves to the independent Home page at `/home/`; it is not a separate content page.
- `/login/` remains a compatibility alias for Account.

All four are independent page routes within one website. The Header and Footer remain mounted while the Main Area changes.

## 7. Language
- The entire website is permanently English.
- The document language is `en` and layout direction is LTR.
- No language selector, language switching, translation system, language-specific storage, or user locale field is permitted.

## 8. Design system
- Monochrome black and white, with neutral gray only for hierarchy and states.
- Two icon appearances: light-theme and dark-theme variants.
- Text, buttons, and input/output controls have only three semantic sizes: Small, Medium, Large.
- Reuse centralized design tokens and shared components; do not duplicate page-level styles.
- Simple, clean, responsive, accessible and consistent.

## 9. Engineering conditions
Fast, clean, reliable, usable, easy to maintain, secure, safe, consistent, centralized, minimal required configuration, maximum optional fields, minimal hard-coded values, and simple design.
- Keep authorization in Supabase RLS and trusted server-side functions, never in UI visibility alone.
- Never expose service-role or secret keys to the browser.
- Owner identity and role are enforced using verified Auth identity and protected database logic.
- Prefer shared components over duplicated page implementations.
- Every approved page has a safe fallback.
- Do not add product or service functionality outside the approved module list.

## 10. Platform constraints
- GitHub Pages: static frontend, source and CI/CD.
- Supabase: Auth, PostgreSQL, RLS, Storage and Edge Functions.
- Do not add Vercel, Appwrite, Cloudflare, Next.js server hosting, or any other platform.

## 11. Scope acceptance
A production page, menu item, dashboard tab, database feature or workflow is allowed only when it directly implements an item in sections 1–5 or a required shared behavior in sections 6–10. Otherwise remove it from the active product.
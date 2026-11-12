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

## 3. Features
- Logo
- Website Title
- Menu
- Dark / Light theme
- Multi-language
- IP / location / country detection and country-based routing
- Authentication
- CRUD
- Icons
- Fallback
- Cards
- Pill buttons

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
- Services: Name (required), Slug (required), Description, Category, Country, Image, Visibility.
- Products: Name (required), Slug (required), Description, Category, Country, Image, Visibility.
- Workshops: Name (required), Slug (required), Description, Location, Technician, Category, Country, Image, Visibility.
- Technicians: Name (required), Slug (required), Description, Skill, Category, Country, Image, Visibility.
- Slugs are generated from Name automatically and remain manually editable; they must be unique.
- Image files are uploaded directly to Supabase Storage and can be removed or replaced.
- Only Name and Slug are required; all other fields are optional.

## 5. User types
- Owner — fixed primary account: 3btechhub@gmail.com
- Admin
- Member
- Visitor

Visitor is the anonymous/public access level and does not need a Supabase Auth role assignment. Owner must never be demoted, deleted, blocked, or replaced. Admin permissions are explicitly delegated; Member is a normal authenticated account.

## 6. Country routes
Canonical route identifiers and paths:
- `global` — default route; content available to everyone
- `bd` — Bangladesh-only content
- `ksa` — Saudi Arabia-only content

Global content is visible on every route. Bangladesh-only content is visible only on `bd`; Saudi-only content is visible only on `ksa`. Country-scoped content must never leak into another country route. Country values are exactly `global`, `bd`, and `ksa`; do not use `saudi` as a canonical value.

On the first visit to the site entry point, attempt IP/country detection. Map Bangladesh to `bd`, Saudi Arabia to `ksa`, and every other country or detection failure to `global`. A visitor may manually change the route from the menu at any time. Persist an intentional manual selection for later visits. Direct visits to a canonical route must stay on that route.

## 7. Route language defaults
- `global` — English (`en`)
- `bd` — Bengali (`bn`)
- `ksa` — Arabic (`ar`)

Language can be changed independently on every route using the menu. Changing language must not change country route. Arabic must set RTL; English and Bengali must set LTR.

## 8. Design system
- Monochrome black and white, with neutral gray only for hierarchy and states.
- Two icon appearances: light-theme and dark-theme variants.
- Text, buttons, and input/output controls have only three semantic sizes: Small, Medium, Large.
- Reuse centralized design tokens and shared components; do not duplicate route-level styles.
- Simple, clean, responsive, accessible and consistent.

## 9. Engineering conditions
Fast, clean, reliable, usable, easy to maintain, secure, safe, consistent, centralized, globalized, minimal required configuration, maximum optional fields, minimal hard-coded values, and simple design.
- Keep authorization in Supabase RLS and trusted server-side functions, never in UI visibility alone.
- Never expose service-role or secret keys to the browser.
- Owner identity and role are enforced using verified Auth identity and protected database logic.
- Prefer shared components over duplicated country-route implementations.
- Every route has a safe fallback. Failed IP detection falls back to `global`.
- Do not add product or service functionality outside the approved module list.

## 10. Platform constraints
- GitHub Pages: static frontend, source and CI/CD.
- Supabase: Auth, PostgreSQL, RLS, Storage and Edge Functions.
- Do not add Vercel, Appwrite, Cloudflare, Next.js server hosting, or any other platform.

## 11. Scope acceptance
A production page, menu item, dashboard tab, route, database feature or workflow is allowed only when it directly implements an item in sections 1–5 or a required shared behavior in sections 6–10. Otherwise remove it from the active product.

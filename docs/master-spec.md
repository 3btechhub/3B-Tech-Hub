# 3B TECH HUB — Master Specification

**Document status:** Authoritative product and engineering specification  
**Last scanned:** 2026-11-12  
**Repository:** `3btechhub/3btechhub`  
**Specification branch:** `refactor/master-spec-2026-11-12`

This is the single source of truth for the 3B TECH HUB website. All frontend routes, layouts, modules, data models, permissions, database policies, tests and deployment workflows must conform to this document. The approved scope is intentionally small. Do not add features, modules, tables, routes or dependencies merely because they are technically possible.

If existing code or database state conflicts with this specification, this specification defines the target behavior. Record the mismatch in the implementation status and resolve it safely; do not silently redefine the product to match legacy code.

---

## 1. Product identity and purpose

- Official brand name: **3B TECH HUB**.
- The website is a simple, country-aware, multilingual information and account platform.
- The website is built from reusable Main Pages and Sub Pages rather than separate hardcoded content modules.
- Keep the experience simple, fast, readable, responsive, reliable and easy to maintain.
- Prefer centralized configuration, reusable functions, shared styles and data-driven pages.
- Keep mandatory fields and setup requirements to a minimum; make nonessential fields optional.

## 2. Website structure and routes

The only approved top-level website areas are:

1. **Home** — public landing page and visible Page sections.
2. **Account** — sign in, create account and account recovery.
3. **Profile** — signed-in user's personal account details.
4. **Dashboard** — authorized administration workspace.
5. **Page** — a Main Page managed through the Page module.
6. **Sub Page** — a child page belonging to one Main Page.

Canonical static routes:

- `/` — entry point and country detection.
- `/global/` — Global home.
- `/bd/` — Bangladesh home.
- `/ksa/` — Saudi Arabia home.
- `/account/` — Account.
- `/profile/` — Profile.
- `/dashboard/` — Dashboard.

Dynamic content routes use a safe slug:
- Main Page: `/<main-slug>/`
- Sub Page: `/<main-slug>/<sub-slug>/`

Reserved route names (including account, login, profile, dashboard, global, bd, ksa, assets and auth) cannot be used as Main Page slugs. `/login/` may remain only as a compatibility redirect to Account; it is not a separate product area.

No separate Services, Products, Workshops, Technicians, Media, Booking or other top-level route/module is allowed. Existing information from those areas must be represented as Pages/Sub Pages when it is still needed.

## 3. Shared layout

Every page and route must use the same shared structure:

- **Header**
- **Main Area**
- **Footer**

Rules:
- Header and Footer must remain present on every page and route, including Account, Profile, Dashboard, dynamic Main Pages, Sub Pages and fallback pages.
- Neither Header nor Footer may be hidden to make room for a module or form.
- Keep brand identity, navigation, theme, language and country controls in the shared Header.
- Main Area is the only region whose page-specific content changes.
- Use consistent content width, spacing, alignment and responsive behavior across routes.

## 4. Global features

Only these shared features are approved:

- Logo and Website Title.
- Primary menu and dynamic Page navigation.
- Dark / Light theme.
- Multi-language support.
- IP country detection and country-based routing.
- Authentication and account recovery.
- Page and approved dashboard CRUD.
- Icons with light-theme and dark-theme appearances.
- Safe fallback behavior for missing content, unavailable services and invalid routes.
- Reusable Cards and Pill Buttons.
- Centralized design tokens and optional runtime configuration.

Do not add unrelated integrations, analytics dashboards, commerce, booking, chat, notifications or other features without a formal specification change.

## 5. Country routing and content scope

Only these canonical country identifiers are allowed:

| Identifier | Meaning | Default language |
|---|---|---|
| `global` | Global / all countries | English (`en`) |
| `bd` | Bangladesh | Bengali (`bn`) |
| `ksa` | Saudi Arabia | Arabic (`ar`) |

### 5.1 First visit and route selection

- On the first entry to the website, attempt IP-based country detection.
- Bangladesh (`BD`) maps to `/bd/`.
- Saudi Arabia (`SA`) maps to `/ksa/`.
- Every other country, invalid response, timeout or detection failure maps to `/global/`.
- A manually selected country route takes precedence on later entry visits and is persisted.
- A direct visit to a canonical country route must remain on that route.
- Legacy `saudi` may be normalized to `ksa` only as a compatibility input; it is never stored as a canonical country value.
- Country detection determines the initial route only. It must not continuously override a visitor's manual selection.

### 5.2 Country content visibility

- Global content is eligible to appear on every route.
- BD-only content is eligible only on the BD route.
- KSA-only content is eligible only on the KSA route.
- A country-specific record must never be exposed as content for another country's route.
- Main Page and Sub Page country scope must be checked together when building navigation, Home sections and dynamic routes.
- Country filtering in frontend queries is useful for presentation but is not, by itself, a security boundary. Public database/API access must not permit country-scoped records to be enumerated outside their allowed scope. Enforce the approved access model through database policies or a trusted server-side data interface.

## 6. Language and text direction

Supported languages:

- English: `en`
- Bengali: `bn`
- Arabic: `ar`

Default language by country route:
- Global → English.
- BD → Bengali.
- KSA → Arabic.

Rules:
- Language can be changed independently on every country route.
- Changing language must never change the selected country route.
- Persist the selected language per country route; a saved preference takes precedence over that route's default.
- When a translation is unavailable, use the English page/content fallback.
- **Text direction depends only on the selected language, never on the country route.**
- Arabic (`ar`) → RTL on Global, BD and KSA routes.
- English (`en`) → LTR on every route, including KSA.
- Bengali (`bn`) → LTR on every route.
- Set the document language and direction from the active language. Do not set RTL merely because the visitor is on the KSA route.

## 7. Design system and interaction standards

### 7.1 Visual identity
- Monochrome black and white.
- Neutral gray may be used for secondary text, borders, muted states and hierarchy.
- No unrelated accent-color system.
- Provide appropriate icon appearances for light and dark themes.
- Keep contrast, focus indicators and readable labels accessible.

### 7.2 Semantic sizing
Only three semantic sizes are permitted for text, buttons and input/output controls:

- Small
- Medium
- Large

Use centralized sizing tokens. Do not create arbitrary one-off sizes for individual modules unless a genuine content/visual requirement is documented.

### 7.3 Layout and interaction
- Use a consistent content width and spacing scale.
- Keep forms aligned and labels consistently positioned.
- Keep action buttons grouped consistently.
- Use Cards and Pill Buttons consistently.
- On narrow screens, stack multi-column layouts without horizontal overflow.
- CRUD modules show their existing records as a list/database first.
- Create and Edit forms appear only when the user requests Create or Edit.
- Destructive actions require clear confirmation and safe error handling.
- Every interactive control must have a real action, an accessible name and visible feedback.

## 8. User types and authorization

The only user types are:

1. **Owner**
2. **Admin**
3. **Member**
4. **Visitor**

Visitor is anonymous/public access. Visitor is not a stored Auth role and does not need a `user_roles` row.

### 8.1 Fixed Owner
- Primary Owner account: `3btechhub@gmail.com`.
- Owner identity must be verified against Supabase Auth, not trusted from browser input or user-editable metadata.
- The primary Owner must never be demoted, deleted, blocked, replaced or reassigned.
- No other account may be promoted to Owner through the website.
- Owner protection must exist in trusted server-side logic and database authorization, not only in disabled UI controls.

### 8.2 Role permissions

| Capability | Visitor | Member | Admin | Owner |
|---|---:|---:|---:|---:|
| View public, in-scope published pages | Yes | Yes | Yes | Yes |
| Use Account / own authentication | No account | Yes | Yes | Yes |
| View and edit own Profile | No | Yes | Yes | Yes |
| Dashboard Overview | No | No | Yes | Yes |
| Dashboard Audit | No | No | Yes | Yes |
| Page management | No | No | Yes | Yes |
| User administration | No | No | No | Yes |
| Role assignment | No | No | No | Yes |
| Permission matrix access | No | No | No | Yes |
| Website/system Settings | No | No | No | Yes |

- Admin may manage approved Pages and access Overview/Audit.
- Admin cannot invite users, assign roles, block users or change system Settings.
- Member can manage only their own Profile and account.
- Owner has all approved Dashboard permissions.
- RLS and trusted Edge Functions must enforce these permissions. Hiding a tab is not authorization.

## 9. Account and Profile behavior

### 9.1 Account
Account supports only:
- Sign In with email and password.
- Create account.
- Email confirmation when required by Supabase Auth.
- Forgot password / password recovery.
- Recovery completion using a valid recovery session or verification flow.
- Clear success/error feedback and safe redirects.

Successful authentication sends the user to Profile. Unauthenticated access to Profile or Dashboard must redirect to Account.

### 9.2 Profile
The user Profile is intentionally minimal and contains only:

- Name
- Email
- Phone Number
- Change Password

Rules:
- A user may view and update only their own profile.
- Email changes must follow the Auth provider's confirmation rules.
- Password changes must use Supabase Auth and appropriate current/recovery session checks.
- Do not add profile statistics, activity feeds, preferences panels, address books or other sections.

## 10. Dashboard

Dashboard modules are restricted to exactly these seven:

1. Overview
2. Audit
3. Page
4. User
5. Role
6. Permission
7. Settings

No additional Dashboard module is allowed.

### 10.1 Overview
- A concise summary of approved website data.
- No unrelated analytics or business metrics.
- Counts must reflect the approved data model and respect the current user's permissions.

### 10.2 Audit
- Shows administrative activity available to the current authorized role.
- Audit records are append-only for normal application users.
- Record actor, action, resource type, resource identifier, timestamp and minimal metadata.
- Store changed field names or safe action metadata only; do not copy full records, passwords, tokens or private profile values into audit metadata.

### 10.3 Page
- The single content-management module for Main Pages and Sub Pages.
- List/database is the default view.
- Create/Edit forms appear only on demand.
- Support publish, unpublish/draft, archive and safe delete behavior.
- A Main Page cannot be deleted while it has Sub Pages; move/delete children first.
- Save revisions before modifying existing page/component content or status.
- Show page components and revision history only in the context of a selected Page.

### 10.4 User
- Owner-only.
- List Auth users, invite a Member or Admin, refresh the list, change allowed role, block/unblock and request password reset.
- Visitor is not an invited or stored role.
- Never expose service credentials or privileged Auth operations to the browser.
- Protect the fixed Owner from every user-management action.

### 10.5 Role
- Owner-only.
- Display role assignments and role counts.
- Only Owner may assign Admin or Member.
- No role assignment may create a second Owner.
- Legacy role labels must be normalized/migrated to Member before legacy values are removed.

### 10.6 Permission
- Show the permission matrix defined in Section 8.2.
- The displayed matrix must match actual RLS and Edge Function enforcement.
- Do not imply permissions that the backend does not enforce.

### 10.7 Settings
- Owner-only.
- Website Title.
- Logo reference/URL (optional).
- Approved centralized runtime configuration only.
- Runtime configuration is allowlisted and validated; it may adjust monochrome theme tokens and approved layout dimensions only.
- Do not allow arbitrary CSS, HTML, JavaScript, URLs as CSS, executable content or unrestricted design overrides.

## 11. Page and Sub Page data model

### 11.1 Page types
- Main Page: top-level content page; `parent_id` must be NULL.
- Sub Page: child content page; `parent_id` must reference an existing Main Page.
- Orphan Sub Pages and Sub Pages whose parent is another Sub Page are prohibited.
- Page slugs are lowercase English URL-safe values using letters, numbers and hyphens.

### 11.2 Page fields

| Field | Requirement |
|---|---|
| Title | Required |
| Description | Optional |
| Type | Required: Main Page or Sub Page |
| Parent Main Page | Required for Sub Page; unavailable for Main Page |
| Country | Required; defaults to `global` |
| Language/Locale | Required; defaults from current route language |
| Location | Optional |
| Phone Number | Optional |
| WhatsApp Number | Optional |
| Email | Optional |
| Image URL | Optional |
| Home Visibility | Optional boolean; defaults to false |
| Status | Draft, Published or Archived |
| Sort Order | Optional ordering value |
| SEO Title | Optional |
| SEO Description | Optional |

### 11.3 Page display rules
- Only Published pages may be public.
- A page appears as a Home section/card only when Published and Home Visibility is enabled.
- Main Pages create Home sections; their eligible Sub Pages appear as cards within that section.
- Hidden pages remain accessible only through authorized management interfaces and must not appear in public Home sections/navigation.
- Dynamic page routes must validate slugs, parent-child relationship, country and locale before rendering.
- Missing, draft, archived, invalid or out-of-scope pages use a safe not-found/fallback state.
- Contact fields and images are optional; missing values must not break the layout.
- External image URLs must be validated and rendered safely.

### 11.4 Approved Page components
Only these data-driven components may be used:

- `hero`
- `rich_text`
- `image`
- `card_grid`
- `button_group`
- `faq`
- `spacer`

Component configuration must be JSON objects with strict field validation and safe URL/text handling. Arbitrary HTML, script, iframe, SQL or JavaScript components are prohibited. Components must be ordered, independently hideable and manageable from the selected Page.

## 12. Approved application data model

The approved application tables are:

| Table | Purpose |
|---|---|
| `user_profiles` | User display name, phone and preferred locale |
| `user_roles` | Protected Owner/Admin/Member role assignments |
| `pages` | Main Page and Sub Page records |
| `page_components` | Allowlisted Page layout components |
| `page_revisions` | Page/component revision snapshots |
| `site_settings` | Website identity and approved configuration |
| `audit_logs` | Administrative activity history |

Rules:
- Every exposed public-schema table must have RLS enabled and least-privilege policies.
- Public access is limited to published, in-scope content and explicitly public settings.
- Profile access is self-only except for explicitly authorized administrative operations.
- Role assignment and user administration are Owner-only.
- Audit access is Admin/Owner as approved; writes must come from trusted operations.
- Page components and revisions inherit the authorization and visibility rules of their parent Page.
- Never expose Supabase service-role or secret keys in frontend code.
- Do not use user-editable metadata as an authorization source.
- Database migrations must be version-controlled and reviewed.
- Do not create extra public tables for legacy modules.

## 13. Legacy data and migration safety

The following are out of the approved target data model:
- `site_content`
- `products`
- `services`
- `workshops`
- `technicians`
- `media_assets`

Legacy content that remains useful must first be converted into the approved Pages/Sub Pages structure with its text, country, contact information and image references preserved.

Cleanup rules:
1. Inventory and privately archive the original records and related Storage objects.
2. Verify archive completeness and a usable restore path.
3. Convert legacy role assignments to the approved role model without changing the fixed Owner.
4. Update and verify all frontend and Edge Function consumers.
5. Review foreign keys, policies, triggers, functions and Storage references.
6. Remove legacy tables/objects only in a separately reviewed migration after the above checks pass.
7. Keep a written record of row counts and object counts before and after cleanup.

A source-code backup branch is not a database or Storage backup. Never claim a database backup unless the export/archive and restore verification have both been completed.

## 14. Storage

- Supabase Storage is used only for approved website media that needs file storage.
- Existing bucket: `site-media`.
- Accepted image types currently configured: JPEG, PNG, WebP, AVIF and GIF.
- Current configured maximum object size: 10 MiB.
- Public media may be read publicly only when the associated content is intended to be public.
- Upload, replacement and deletion permissions must follow Owner/Admin authorization and least privilege.
- Keep existing image objects until their archive and all replacement references are verified.
- Do not create separate media-management modules.

## 15. Platform and deployment

Approved platform responsibilities:

- **GitHub**
  - Source repository.
  - Version control and review.
  - GitHub Actions CI/CD.
  - GitHub Pages static website hosting from the `site/` directory.
- **Supabase**
  - Authentication.
  - PostgreSQL database.
  - Row Level Security.
  - Storage where required.
  - Trusted Edge Functions.

Do not introduce Vercel, Appwrite, Cloudflare, another hosting provider, a second backend platform or a server-rendering host.

Expected public website:
`https://3btechhub.github.io/3btechhub/`

Deployment rules:
- Only approved code merged to `main) is eligible for Production deployment.
- Pull request checks must pass before merge.
- Deployment must publish the `site/` directory.
- Do not claim a Production release from a feature/refactor branch.
- Do not claim browser testing or successful CI unless the corresponding run and result are verified.
- Keep dependency versions controlled and avoid unnecessary dependencies.

## 16. Quality, safety and fallback requirements

- Simple, clean and responsive on mobile and desktop.
- Consistent header, footer, content width, alignment, spacing and semantic sizing.
- Safe text rendering; do not inject untrusted HTML.
- Validate route slugs, URLs, form inputs and component configuration.
- Fail safely when IP detection, Supabase queries, authentication or dynamic content fails.
- Country detection failure → Global route.
- Missing translation → English fallback.
- Missing page or invalid route → safe not-found state.
- Missing optional page data → omit that field without breaking the page.
- Never let a frontend-only permission check replace backend authorization.
- Do not expose private profile data, access tokens or privileged credentials.
- Preserve original data until migration and restore safety are verified.

## 17. Acceptance checklist

A release is conformant only when all applicable checks pass:

### Structure and layout
- [ ] Only the approved website areas and seven Dashboard modules exist.
- [ ] Header and Footer remain visible on every route.
- [ ] No out-of-scope navigation item, route or module is present.
- [ ] Layout is consistent and responsive.

### Country and language
- [ ] IP detection maps BD, SA and all other/failure cases correctly.
- [ ] Manual country selection persists and direct canonical routes remain stable.
- [ ] Country-specific content cannot be exposed on another country route.
- [ ] Route language defaults and saved per-route preferences work.
- [ ] Arabic alone activates RTL; English and Bengali remain LTR on every route.

### Accounts and permissions
- [ ] Sign-in, account creation, email confirmation and recovery work.
- [ ] Profile contains only Name, Email, Phone Number and Change Password.
- [ ] Visitor, Member, Admin and Owner permissions match the matrix.
- [ ] The fixed Owner cannot be demoted, deleted, blocked or replaced.
- [ ] RLS and trusted Edge Functions enforce all sensitive actions.

### Pages and content
- [ ] Main Page and Sub Page validation prevents orphan or invalid parent relationships.
- [ ] Page list is the default view; Create/Edit forms are on demand.
- [ ] Publish, draft, archive, delete and revision behavior works.
- [ ] Only published and visible pages appear in Home sections.
- [ ] Navigation and dynamic page routes honor country and locale fallback.
- [ ] Only registered Page components can render.

### Data and deployment
- [ ] Only approved tables are used by the active product.
- [ ] Legacy records and Storage objects are archived and verified before cleanup.
- [ ] CI syntax, regression and browser navigation tests pass.
- [ ] Production deployment is verified from the intended `main` commit.
- [ ] No release is marked complete while a required check remains unverified.

---

## Appendix A — Live project scan (2026-11-12)

This appendix records observed implementation state. It does not expand the approved product scope. If the observed state conflicts with Sections 1–17, resolve the discrepancy in favor of the specification.

### A.1 Repository and branch state
- Repository: `3btechhub/3btechhub`.
- Scanned branch: `refactor/master-spec-2026-11-12`.
- The branch is **19 commits ahead and 7 commits behind** `main` at scan time; the branches have diverged.
- The scanned branch contains the static site, dashboard, Account/Profile pages, Page Builder, dynamic page engine, country router, runtime configuration and GitHub Actions workflows.
- The workflow definitions validate required routes, JavaScript syntax/regression tests and browser navigation; GitHub Pages deployment is configured for `main`.
- Do not assume the scanned branch is already in Production.

### A.2 Current route and frontend inventory
- Static route files exist for Home, Account, Profile, Dashboard and Global/BD/KSA home routes.
- Shared Header/Footer markup is present in the inspected route templates.
- Country router uses IP lookup with a timeout, manual-route persistence and Global fallback.
- Language preference is stored per country route in browser storage.
- RTL selectors are tied to the selected Arabic language direction, not directly to the KSA country route.
- Dynamic Page navigation and rendering use country/locale filters and English fallback.
- Page Builder supports Main/Sub Page records, contact/image fields, Home visibility, status, ordering, SEO fields, components and revision snapshots.
- Approved component renderer registers only the seven component types in Section 11.4.
- Dashboard markup contains the seven approved modules. The frontend removes User, Role, Permission and Settings tabs for Admin; Owner-only user operations are routed through the `owner-users` Edge Function.

### A.3 Live Supabase inventory
- Project: `sburxeuxkrilbfppxylm`.
- Region: `ap-northeast-1`.
- Active approved tables and observed row counts:
  - `pages`: 13
  - `user_profiles`: 2
  - `user_roles`: 2
  - `page_components`: 0
  - `page_revisions`: 0
  - `site_settings`: 2
  - `audit_logs`: 5
- The 13 Page records consist of 3 Main Pages and 10 Sub Pages:
  - Workshops: 1 Main Page + 2 Sub Pages, BD scope.
  - Technicians: 1 Main Page + 3 Sub Pages, Global parent with BD/KSA child records.
  - Images: 1 Main Page + 5 Sub Pages, Global/BD/KSA child records.
- All 13 converted records are currently Published and Home Visibility is enabled.
- The fixed Owner account is present with the Owner role.
- One existing account still has the legacy `customer` role.
- Public schema currently contains 13 tables, including the seven approved tables and six legacy tables listed in Section 13.
- Existing Storage bucket: `site-media`; five original Technician image objects remain present.

### A.4 Known implementation gaps requiring resolution
1. **User administration Edge Function is outdated:** the live `owner-users` function is active but still accepts legacy roles (`manager`, `editor`, `staff`, `customer`) and uses a legacy `/login/` redirect. Update and verify it against the approved Owner/Admin/Member model before relying on User/Role administration.
2. **Legacy role values remain in the database:** the live role constraint still permits legacy role names, and one account is assigned `customer`. Safely convert legacy assignments to `member`, update the constraint and remove obsolete role handling only after checking all dependencies.
3. **Legacy tables remain:** `site_content`, `products`, `services`, `workshops`, `technicians` and `media_assets` still exist. Preserve their data and five original Storage objects until a private archive and restore check are verified.
4. **Country-scope enforcement needs backend verification:** current public Page read policy permits reads of all Published Page rows. Frontend country filters control normal rendering, but they do not by themselves prevent direct API reads of another country's records. Add and test a trusted country-scope enforcement design before treating country privacy/isolation as complete.
5. **Branch integration is pending:** the scanned refactor branch is diverged from `main`. Reconcile the seven commits behind before merge; review the complete diff and run the final CI checks.
6. **Browser acceptance remains pending:** verify real sign-in/roles, route detection/manual selection, language/RTL, Page Builder, Home sections, Profile, Audit and Settings in a browser against the intended release commit.
7. **Production status must be checked independently:** a successful workflow on a non-main branch does not establish that the current refactor is deployed.

### A.5 Migration history observed
The live migration history includes the initial foundation, RLS hardening, profile phone, earlier legacy content modules, dynamic Page engine, runtime configuration and country/Member role migrations through:
- `20261112103919_add_runtime_configuration`
- `20261112103930_add_country_scope_and_member_role`

The Page contact and Home visibility migration file exists on the scanned branch and the corresponding live columns are present. Verify migration history and schema state together before any further DDL or cleanup.

---

**Change control:** Any new route, module, user type, table, component, platform or behavior outside this document requires an explicit product-scope decision and a reviewed update to this Master Specification before implementation.

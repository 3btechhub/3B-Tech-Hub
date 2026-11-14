# 3B TECH HUB
## Master Specification

<sub>Canonical project requirements · Updated 14 November 2026 · GitHub + Supabase</sub>

> This document is the single source of truth for the Website project. The latest Owner-approved requirements in this document take priority over older specifications, legacy documentation and existing implementation details. Earlier requirements remain applicable only where they do not conflict with the current specification.

---

## Project direction

Build a clean, professional, responsive, modular website with a dashboard-driven content management system.

The system should be:

- Simple, modular, secure and maintainable
- Responsive and mobile-first
- Built from reusable components
- Designed around clear forms, database lists, buttons and cards
- Ready for future expansion without activating unapproved features

**Primary interface settings**

| Property | Current decision |
|---|---|
| Primary viewport | Mobile first |
| Default component size | Medium |
| Interface language | English |
| Layout direction | LTR |
| Themes | Light and Dark |
| Primary palette | Black, White and Neutral Gray |

Use only the semantic component sizes Small, Medium and Large. Keep equivalent inputs, outputs, buttons and cards consistent in size at each responsive breakpoint. Content length must not resize standard components; wrap, truncate or scroll content within the defined dimensions. Responsive layout changes may adapt to viewport width.

Keep the architecture ready for future RTL support through CSS logical properties, inherited direction and direction-aware reusable components. Do not activate an RTL/LTR switch or language-based direction switching without explicit approval.

## Approved technology

- **GitHub** — source code and version control
- **Supabase** — PostgreSQL database, Authentication, Storage and backend services

Do not introduce another hosting or backend platform without explicit approval.

Preserve the working Supabase Authentication system, database security, existing data and Storage objects. Use additive, reversible migrations wherever practical.

## Main website pages

The website has three primary pages:

- **Home**
- **Account**
- **Dashboard**

The shared website layout consists of Header, Main Area and Footer.

### Header

Keep the Website Logo, Website Title and Navigation Menu as separate components. Clicking the logo or title must not trigger navigation or another action.

The navigation should reflect the three-page architecture. Account access should expose the appropriate account layout for the current authentication state. Dashboard access is visible only to the Owner. Hiding a menu item is never a substitute for backend authorization.

Keep the Language and Country selectors where they are supported by the current implementation and approved configuration. English is the default language and Global is the default country context.

## Account page and layouts

Account contains these layouts:

- Login
- Create Account
- Reset Password
- Profile

Each layout has its own configurable slug. These are layouts within the Account experience, not additional primary pages.

Preserve the existing authentication flows. Do not expose passwords in the Dashboard. Password changes and resets must use secure authentication flows.

The Profile layout should remain simple and contain:

- Name
- Email
- Phone Number
- Change Password

## Dashboard modules

The Dashboard contains these modules, in this order:

- Overview
- Website Informations
- Service Types
- Product Types
- Services
- Products
- Workshops
- Technicians
- Countries
- Languages
- Users
- Roles
- Permissions
- Customizations
- Settings

Every module has its own configurable slug. Slugs are managed inside Settings. A module slug is an identifier for the module within the Dashboard; it does not create an independent standalone page.

### Overview

Show clickable summary cards for the main data modules and useful system status. Each card opens its corresponding Dashboard module.

Show health information only when it has actually been checked. Relevant checks include website availability, Supabase connectivity, database, Storage, Authentication and backend services. Never guess or imply a healthy status without verification.

### Website Informations

Manage the website identity and introduction:

- Logo
- Title
- Intro

Logo and Title remain separate components. Support logo upload, preview, replacement and removal through secure Supabase Storage operations.

## Home content

By default, Home displays information from these six modules:

- Service Types
- Product Types
- Services
- Products
- Workshops
- Technicians

Home cards show only the item's uploaded image or a suitable fallback icon and its title. Do not show descriptions or unrelated metadata on these cards. Uploaded images take precedence over fallback icons.

Keep section titles clear and centered, with consistent responsive spacing. A section that is hidden in Customizations must not appear on Home.

### Home customization choices

The Customizations module provides Home visibility and ordering controls for:

- Service Types
- Product Types
- Services
- Products
- Workshops
- Technicians
- Countries
- Languages

The default Home content remains the six catalogue modules listed above. Countries and Languages may be managed in the Home customization choices, but must not be added to the default Home display unless enabled by the Owner.

## Module interface standard

The following eleven modules use two clearly separated sections:

- Service Types
- Product Types
- Services
- Products
- Workshops
- Technicians
- Countries
- Languages
- Users
- Roles
- Permissions

### Form

Use one shared Form per module for creating and editing records. When a record is selected from Database, load its values into that same Form.

The Form supports:

- Create
- Update
- Delete
- Save
- Cancel

Delete should be available for a selected record and protected by the applicable authorization and system safeguards.

### Database

The Database section displays the module's records and supports:

- Viewing records
- Selecting a record to load it into the shared Form
- Rearranging record order

The Form and Database sections must remain visually distinct and easy to use on mobile.

### Views

Support:

- List View
- Details View

Details View is an in-context view within the existing Home or Dashboard experience. Do not create standalone module pages or individual catalogue item pages.

## Catalogue module fields

All catalogue modules use Title, Description, Slug, related records, Images and Visibility as specified below. Relationship fields must use explicit database relationships; do not infer associations from names or categories.

### Service Types

- Title
- Description
- Slug
- Country
- Product Types
- Services
- Products
- Workshops
- Technicians
- Images
- Visibility

### Product Types

- Title
- Description
- Slug
- Country
- Service Types
- Services
- Products
- Workshops
- Technicians
- Images
- Visibility

### Services

- Title
- Description
- Slug
- Country
- Service Types
- Product Types
- Products
- Workshops
- Technicians
- Images
- Visibility

### Products

- Title
- Description
- Slug
- Country
- Service Types
- Product Types
- Services
- Workshops
- Technicians
- Images
- Visibility

### Workshops

- Title
- Description
- Slug
- Country
- Service Types
- Product Types
- Services
- Products
- Technicians
- Images
- Visibility

### Technicians

- Title
- Description
- Slug
- Country
- Service Types
- Product Types
- Services
- Products
- Workshops
- Images
- Visibility

### Countries

- Title
- Description
- Slug
- Service Types
- Product Types
- Services
- Products
- Workshops
- Technicians
- Images
- Visibility

### Languages

- Title
- Description
- Slug
- Country
- Service Types
- Product Types
- Services
- Products
- Workshops
- Technicians
- Images
- Visibility

## User, Role and Permission modules

### Users

- Name
- Email
- Roles
- Permissions
- Images
- Status

### Roles

- Name
- Email
- Users
- Permissions
- Images
- Status

### Permissions

- Roles
- Name
- Email
- Users
- Roles relationship

The Roles relationship is represented once in the Permissions form even though it appears twice in the supplied field list.

Each of these modules provides the following Status actions:

- Active
- Deactive
- Block
- Delete

Keep authentication and access-management workflows secure. Never expose passwords. Maintain the relationship between Supabase Auth users and profile records. Role and permission assignments must be validated on the server and enforced by database policies.

### Supported roles and Owner protection

The supported role model includes:

- Owner
- Member
- Visitor

The primary Owner account is **3btechhub@gmail.com**. It must never be deleted, blocked, demoted or replaced. The Owner role must not be deleted or deactivated. A role with assigned users must not be deleted without safe reassignment.

## Required fields

Only the following fields are required for these modules:

| Modules | Required fields |
|---|---|
| Service Types, Product Types, Services, Products, Workshops, Technicians, Countries, Languages | Title and Slug |
| Users, Roles, Permissions | Email |

All other listed fields are optional unless a verified security or database invariant requires otherwise.

Slugs must be generated from the Title by default, remain manually editable, and be unique within the applicable module. Enforce uniqueness in the database.

## Fixed defaults and protected selections

### Country

Global is checked by default and cannot be unchecked or removed from a record's country selection. Other available countries can be independently checked or unchecked.

The Global country record is a protected system record and must not be deleted or renamed.

### Visibility

Owner is checked by default and cannot be unchecked. Other available visibility values can be independently checked or unchecked.

Enforce these defaults and protections in both the interface and trusted database/backend logic.

### Language

English is pre-created and selected as the default language. If additional languages exist, the user can switch to another available language.

## Customizations

Customizations manages:

- Module on Home
- Show / Hide
- Rearrange

Changes must update the Home display and order without creating new standalone pages. Hidden modules must not render publicly. Respect the configured visibility rules.

## Settings

Settings manages configuration that applies across the website, including:

- Dashboard module slugs
- Account layout slugs
- Website identity settings
- Home module configuration where applicable
- Other approved website-wide preferences

Module slugs and Account layout slugs must be editable here. Changing a slug must not break data identity, relationships or authorization.

## Data model and compatibility

Every module retains its own primary data table. Use relationship/junction tables for many-to-many associations between catalogue modules, countries, languages, users, roles and permissions.

The current names **Service Types** and **Product Types** replace the older Categories and Device Types terminology in the user interface and specification.

Preserve existing Device Types records and relationships as Product Types. Do not delete and recreate records merely to change their display name. Preserve existing Services, Products, Workshops, Technicians, Countries, Users, Roles, Permissions, Authentication records, Storage objects and supporting data.

Contacts, Locations and other legacy records may remain as supporting or legacy data. They are not primary pages, Dashboard modules or default Home sections under the current specification. Do not blindly delete them.

## Security and privacy

Use:

- Supabase Authentication
- Row Level Security (RLS)
- Trusted Edge Functions
- Server-side permission validation
- Database constraints
- Owner protection
- Validated Role-Permission relationships
- Secure image upload and Storage access

Frontend visibility is never authorization. Every sensitive operation must be validated by trusted backend or database controls. Users must not be able to elevate their own roles or permissions.

Keep Visitor Analytics and administrative Activity Logs as separate concerns where those existing capabilities are retained. Analytics may include page views, unique and repeat visitors, timestamps, device, operating system, browser and approximate country/city. Never store raw IP addresses. Disclose third-party IP geolocation processing, label location as approximate rather than GPS, show the required ipdata attribution where its data is displayed, reuse a visitor location for 24 hours and restrict analytics access to Owner. Retain analytics for 90 days.

## Design and accessibility

Use a clean, uncluttered visual hierarchy with restrained use of text. Prefer cards, buttons and clearly labeled input/output controls. Use distinct, meaningful icons for different modules and actions.

Keep the Black, White and Neutral Gray palette and Light/Dark themes. Maintain consistent spacing, typography, borders, focus states and touch targets. Use accessible labels and keyboard-operable controls. Do not use placeholders as substitutes for input labels.

Public Home cards must contain only an image or fallback icon and the item title. Keep the complete editable data in Dashboard forms.

## Change control and delivery

Before changing project resources, inspect the current GitHub and Supabase implementation and verify dependencies, relationships, foreign keys, RLS policies, Storage references, application references and existing data.

Preserve working features unless they conflict with this specification. Prefer safe additive migrations and avoid destructive changes without a verified migration plan.

Do not report a feature as implemented, tested or live until the relevant code, database behavior, security controls and deployment have been verified.

---

**Project:** 3B TECH HUB  
**Canonical specification:** This document  
**Last updated:** 14 November 2026  
**Technology:** GitHub + Supabase

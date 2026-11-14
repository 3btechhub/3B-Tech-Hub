# 3B TECH HUB — MASTER SPECIFICATION

**Version:** Fixed Master Specification — 13 November 2026  
**Project:** 3B TECH HUB  
**Technology:** GitHub + Supabase  
**Status:** Canonical Requirement Source of Truth

> This document is the single authoritative specification for the Website project. It supersedes all earlier project specifications and documentation. If any repository note or legacy document conflicts with this file, this specification takes precedence.

---

## 1. Project Overview

Build a modern, simple, clean, professional, responsive, Hybrid Dashboard Driven Modular Website.

Core principles:
- Modular Architecture
- Dashboard-driven Content Management
- Secure Authentication
- Role & Permission Management
- Responsive Design
- LTR-first presentation
- Future RTL readiness
- Maintainable, reusable and scalable components

The architecture must support future extension of modules, languages, routes, countries, roles and permissions. Future capabilities must not be activated without explicit approval.

## 2. Technology Architecture

Approved platforms:
- **GitHub:** source code and version control.
- **Supabase:** database, authentication, storage and backend services.

Do not introduce Vercel, Appwrite, Cloudflare or another hosting/backend platform.

## 3. Main Pages and Layout

Pages:
1. Home
2. Login
3. Create Account
4. Forgot Password
5. Profile
6. Dashboard
7. Services
8. Products
9. Workshops
10. Technicians
11. Contacts

Shared layout: Header, Main Area and Footer.

Each content module has a listing page and individual detail pages.

## 4. Header Specification

The Header contains three separate components:
1. Website Logo
2. Website Title
3. Navigation Menu

Logo and Title must remain separate components. Clicking either must perform no navigation or action.

### Menu items
- Home
- Profile
- Services
- Products
- Workshops
- Technicians
- Contacts
- Login / Logout
- Divider
- Light / Dark Theme
- Language Dropdown
- Country Dropdown
- Divider
- Dashboard

### Visibility and authorization
- Profile and Logout are visible only while authenticated.
- Login is visible while unauthenticated.
- Dashboard menu item is visible only to Owner; Member and Visitor must not see it.
- Hiding a menu item is not authorization. Routes, backend operations and database access must independently enforce permissions.

## 5. Home Page

Five homepage sections:
1. Services
2. Products
3. Workshops
4. Technicians
5. Contacts

Public item cards on Home display only the uploaded image (or the module's fallback icon when no image is available) and the item title. The image/icon is placed at the logical start of the card: left in LTR and right in RTL. Do not display descriptions, categories, types, skills, locations or other metadata on Home cards. Categories remain available in Dashboard content-management forms and stored records; this is a display-only restriction, not a data/schema deletion. Each content item has a detail page and unique slug-based URL, in addition to the module listing page. Slugs are used in public routes and links but are never rendered as a separate UI field or label.

A disabled section must not appear on Home. Keep a consistent, responsive vertical gap between each Home section. Center-align every section title and style it at a clear headline-level size. Each module title is a link to its corresponding public listing page. Place a smaller “View all” link directly below the title, centered, with no underline in normal or hover states. When an item has no uploaded image, choose its fallback icon from the item name/meaning first, regardless of its parent module; use the module icon only when no item-name match is available. Apply the same item-name icon mapping on Home and public module listing pages. Uploaded images always take precedence over fallback icons.

## 6. Dashboard Architecture

The Dashboard has these 12 modules:
1. Overview
2. Audits & Logs
3. Categories
4. Services
5. Products
6. Workshops
7. Technicians
8. Contacts
9. User
10. Role
11. Permission
12. Settings

Modules are independently structured and extensible.

## 7. Overview Module

Show counts for:
- Services
- Products
- Workshops
- Technicians
- Contacts
- Users
- Roles
- Permissions

Also show Website Health Status, limited to verifiable checks:
- Website availability
- Supabase connection
- Database
- Storage
- Authentication service
- Backend services

Never infer a healthy/active status when it has not actually been checked.

## 8. Content Management Modules

Modules: Categories, Services, Products, Workshops, Technicians, Contacts, User, Role and Permission.

Where applicable, operations include Create, View, Edit, Delete and Show/Hide. Each module has its own form and fields. Do not force a shared content schema onto Contacts, User, Role or Permission.

## 9. Content Management Standard

This standard applies to Services, Products, Workshops and Technicians.

### Common fields
- Name (required)
- Slug (required)
- Description (optional)
- Category (optional)
- Image (optional)
- Visibility (required system state)

### Slug rules
- Generate automatically from Name.
- Allow manual editing.
- Slug must be unique.
- Enforce uniqueness at database level.

### Image management
Use Supabase Storage for direct upload, replace, remove and preview. Show a fallback icon when an image is missing or broken.

### Categories form
- Title (required)
- Type (required; fixed options: Service, Device)
- Type values are enforced by a database constraint and cannot be created or changed from the Dashboard.

### Services form
Name, Slug, Description, Category, Image, Visibility, Related Workshops, Related Mechanicians.

### Products form
Name, Slug, Description, Category, Image, Price, Currency, Stock Quantity, Condition, Visibility, Related Workshops.

### Customer-first catalogue presentation
- Keep the Home page and its existing sections, order, layout and cards unchanged.
- Services and Products remain separate public listing pages.
- Listing pages show category shortcuts and direct item cards together, so category navigation is optional rather than a required step.
- Provide a search field on each listing page.
- Every Service and Product has its own detail page.
- Service detail pages present the service description, related Workshops, related Mechanicians and direct contact options.
- Product detail pages present product information, price when supplied, stock/availability information, related Workshops or sales locations when assigned, and direct contact options.
- Related Workshop and Mechanician assignments are managed from the Owner Dashboard and use explicit database relationships; do not infer provider assignments from category names.
- If no provider has been assigned, do not invent or display an unrelated provider.

### Workshops form
Name, Slug, Description, Location, Technician, Category, Image, Visibility.

### Technicians form
Name, Slug, Description, Skill, Category, Image, Visibility.

## 10. Contacts Module

Contacts has its own schema:
- Name
- Value (URL, email address or phone number)

There is no Type field or Type column. Determine the contact destination and icon from the Value itself. Use URL host/domain matching to render the matching brand's official SVG logo for social and messaging services (including YouTube, Reddit, X, LinkedIn, Instagram, TikTok, WhatsApp, IMO and Facebook). Detect Gmail addresses and Gmail URLs separately from other email addresses. For supported brands, use their brand-specific SVG assets; for IMO and other valid websites, retrieve the site's favicon from its URL/domain. Use a generic mail icon for non-Gmail addresses and a phone icon for telephone numbers. Unknown valid web URLs use the favicon associated with their hostname, with a generic website icon only as a final fallback. Generate safe actions from the value: mailto for email, tel for phone, normalized HTTPS links for websites and messaging URLs. Do not rely on a separately stored contact type or infer icons from another content module.

Operations: Create, View, Edit and Delete. Provide a separate listing page and detail page. Do not impose the common content-module fields on Contacts.

## 11. Authentication and Profile

Preserve the existing Authentication System and its currently functioning flows. Do not unnecessarily replace or disrupt Login, Create Account or Forgot Password.

Profile is a separate page and is available from the Header only while logged in.

Keep the user Profile simple:
- Name
- Email
- Phone Number
- Change Password

Do not add unrelated dashboard sections or statistics to Profile.

## 12. User, Role and Permission System

Preserve the existing working User, Role and Permission architecture and workflows while aligning the supported role model below. Inspect the current implementation before changing detailed fields or operations.

### Supported roles
1. Owner
2. Member
3. Visitor

Future roles and permissions must be extensible without an architectural overhaul.

### Primary Owner
**3btechhub@gmail.com**

The primary Owner must never be deleted, blocked, demoted or replaced.

### 12.1 User Module

Suggested form fields:
- Full Name (required)
- Email Address (required)
- Phone Number (optional)
- Assigned Role (required)
- Account Status
- Email Verification Status (system-derived/read-only)
- Created Date (system-derived/read-only)

Potential operations, subject to existing system capabilities and permissions:
- Create
- View
- Edit Profile
- Assign or Change Role
- Activate / Deactivate
- Block / Unblock
- Delete

Never expose a user's password for viewing or direct editing in the Dashboard. Use secure authentication flows. Maintain the relationship between Auth User and Profile data. Owner protection applies to every operation.

### 12.2 Role Module

Suggested fields:
- Role Name (required)
- Role Slug / Identifier (required, unique)
- Description (optional)
- Assigned Permissions
- Role Status

Potential operations:
- Create, View, Edit, Delete
- Assign / Remove Permissions
- Activate / Deactivate

The Owner role cannot be deleted or deactivated. A role with assigned users must not be deleted without safe reassignment.

### 12.3 Permission Module

Suggested fields:
- Permission Name (required)
- Permission Key (required, unique)
- Description (optional)
- Module / Resource (required)
- Action Type (required)
- Permission Status

Action types:
- Create
- View
- Edit
- Delete
- Publish
- Hide
- Manage

Potential operations:
- Create, View, Edit, Delete
- Activate / Deactivate
- Assign to Role / Remove from Role

Permission keys must be unique. Role-Permission relationships must be flexible. New modules must be able to define their own permissions.

**Important:** User, Role and Permission form details above are recommendations, not permission to replace existing behavior. Verify the existing implementation and preserve required working workflows before finalizing changes.

## 13. Audits & Logs

Keep these as distinct concerns and interfaces.

### 13.1 Visitor Analytics
- Total Visitors
- Page Views
- Visited Pages
- Date and Time
- Approximate Country / City
- Device
- Operating System
- Browser
- Repeat Visits

### 13.2 Activity Logs
- Actor
- Action
- Module
- Record
- Date and Time
- Result
- Device

Visitor Analytics and administrative Activity Logs must use separate data and interfaces. Collect page views, unique/repeat visitors, timestamps, device, OS, browser and approximate Country/City using server-side IP geolocation. Never store raw IP addresses. Disclose that ipdata processes the request IP; location is approximate, not GPS. Show the required visible attribution link to ipdata.co wherever the geolocation data is displayed. Reuse a visitor's location for 24 hours to limit external lookups. Restrict reads to Owner and retain analytics for 90 days.

## 14. Settings Module

### Website identity
- Website Title
- Website Logo

Logo operations: Upload, Replace, Preview and Remove. Title and Logo are managed separately and remain separate components.

## 15. RTL / LTR Direction Policy

### 15.1 Current default: LTR Only

The entire website must currently render in **LTR (Left-to-Right)**. LTR is the only active display direction and the default on every page, including Header, Dashboard, forms, tables, cards, navigation and content detail pages.

### 15.2 Current UI restrictions
- Do not display an RTL/LTR switch.
- Do not display a direction selector.
- LTR is the sole current default and active direction.

### 15.3 Future RTL readiness
Build the architecture so RTL can be enabled later without redesigning the whole website or rebuilding components.

Requirements:
- Use CSS Logical Properties and inherited document direction; do not force RTL or LTR on individual shared components.
- Build direction-aware reusable components.
- Avoid hard-coded left/right assumptions.
- Ensure layout, spacing, alignment and navigation can adapt to either direction.
- Keep RTL and LTR compatibility in the component architecture.
- In item cards and icon/title controls, place the image or icon at the logical start before the title: left in LTR and right in RTL, with a consistent gap.

### 15.4 Future activation
Only after explicit approval may Settings expose direction controls or language-based automatic direction.

**Fixed decision: LTR Only now; prepare the architecture for easy future RTL enablement.**

## 16. Route-Based View

Current implementation uses one global route context. Keep architecture extensible for future multi-route and region-based routing.

Proposed routes:
- /
- /services
- /services/:slug
- /products
- /products/:slug
- /workshops
- /workshops/:slug
- /technicians
- /technicians/:slug
- /contacts
- /contacts/:id
- /dashboard
- /login
- /register
- /forgot-password
- /profile

Dashboard modules may have separate routes. Route architecture must not activate unapproved regional or country variants.

## 17. Multi-language and Country

The current interface language is English. Keep the architecture ready for future Bangla, Arabic and other languages.

- Keep translation resources separate.
- Support Arabic RTL.
- Manage language and route independently.
- Header includes Language Dropdown and Country Dropdown.
- Current country context is global.
- Future country-specific content, regions and routes require approval.

Do not activate languages or country features beyond the approved current scope.

## 18. Design System

### Colors
Use only three primary colors:
- Black
- White
- Neutral Gray

### Themes
- Light Mode
- Dark Mode

### Sizes
Use only three semantic sizes for text, buttons, inputs, outputs and boxes:
- Small
- Medium
- Large

Design must be responsive, clean, simple and professional, with consistent cards, reusable components, spacing and typography. The current layout is LTR-first. Use distinct, semantically appropriate icons for different modules and actions; do not reuse one generic icon everywhere. Keep icon mappings and fallback rules isolated by module: changing a Services icon rule must not change Products, Workshops, Technicians or Contacts. Public item cards on Home and module listing pages must contain only an uploaded image or fallback icon plus the item title; omit descriptions and secondary metadata. Keep full item details on the detail page and preserve all Dashboard editing fields.

### Content-independent component sizing and responsive layout
- Component dimensions must not grow or shrink according to the amount or length of content.
- Inputs, selects, textareas, output areas, buttons and cards use consistent, explicitly defined dimensions within each device breakpoint.
- Long text must wrap, truncate or scroll inside the existing component dimensions; it must not resize the component.
- Responsive changes remain enabled for viewport/device width: grid columns, layout, alignment and spacing may change at defined breakpoints.
- Do not use intrinsic/content-driven sizing (such as content-sized columns, auto-fit sizing or fit-content sizing) for the standard component system.
- Apply the same sizing tokens consistently across equivalent components and keep touch controls usable on mobile.

## 19. Security Architecture

Use:
- Supabase Authentication
- Row Level Security (RLS)
- Trusted Edge Functions
- Server-side permission validation
- Database constraints
- Owner protection
- Secure User management
- Validated Role-Permission relationships

Frontend visibility is never a substitute for authorization. Every sensitive operation must be checked by trusted backend/database controls. A user must not be able to exceed their permissions by changing their own role or permissions.

## 20. Future Extensibility

Prepare the architecture for future:
- Modules
- Languages
- Countries
- Routes and Regions
- Roles
- Permissions
- Features
- RTL Direction

Architecture readiness does not authorize activation. Every new feature or scope change requires explicit user approval. Use a distinct, semantically appropriate icon for each Dashboard module and content type.

## 21. Scope Control and Cleanup

Review and remove only verified, unused or out-of-scope legacy modules, features, tables, columns, APIs, Edge Functions, UI components, workflows, code and data.

Preserve necessary working systems, especially:
- Authentication
- User
- Role
- Permission

Before deleting any database object, inspect dependencies, relationships, foreign keys, RLS policies, Storage references, application references and existing data. Never perform blind destructive operations.

## 22. Final Development Principles

1. Simple
2. Modular
3. Secure
4. Scalable
5. Maintainable
6. Reusable
7. Future-ready
8. Responsive
9. LTR-first
10. Permission-controlled

## 23. Project Change Approval Policy

This Master Specification is the canonical design and requirements reference.

Before making a real project change:
1. Inspect the current GitHub and Supabase implementation.
2. Compare the existing implementation with this specification.
3. Explain the required changes clearly.
4. Explain impact and risks.
5. Wait for explicit user approval.

Without explicit approval, do not change GitHub code, Supabase database, Storage, Authentication, deployment or any other project resource.

---

**END OF FIXED MASTER SPECIFICATION**

**Project:** 3B TECH HUB  
**Technology:** GitHub + Supabase  
**Current Direction:** LTR Only  
**Future Direction:** RTL-ready Architecture

## 24. Owner-approved Dashboard Module Specification — 14 November 2026

This section records the latest explicit Owner-approved module specification and supersedes conflicting earlier field/form details in this document.

### Overview
Show a clickable summary-count card for every module except Settings: Categories, Services, Products, Workshops, Technicians, Contacts, Users, Roles and Permissions. Each card opens its matching module.

### Module fields
- Categories: Title; Type (fixed checklist options Service and Device; either or both may be selected).
- Services: Title, Slug, Countries, Categories, Products, Workshops, Technicians, Images, Visibility.
- Products: Title, Slug, Countries, Categories, Service, Workshops, Technicians, Images, Visibility.
- Workshops: Title, Slug, Countries, Location, Categories, Service, Products, Technicians, Images, Visibility.
- Technicians: Title, Slug, Countries, Skill/Expertise, Phone Number, Whatsapp Number, Link, Email, Categories, Service, Products, Workshops, Images, Visibility.
- Contacts: Title, Value.
- User: Title, Roles, Permissions.
- Roles: Title, Users, Permissions.
- Permission: Title, Users, Roles.
- Settings: Website Logo, Website Title, Website Intro.

Each named module remains a distinct module with its own primary database table. Catalogue relationships are shared across Categories, Services, Products, Workshops and Technicians; access relationships are shared across Users, Roles and Permissions. The nine non-Settings CRUD modules use a consistent form/checklist/list/create/read/update/delete interaction pattern. Every displayed field is connected to its corresponding database data. Input boxes must not show placeholders. Countries includes Global, selected by default for new records. Keep the dashboard visually consistent with the website design and easy to understand.

Relationship/junction tables represent shared many-to-many information while each module retains its own primary table. Existing authentication, role and permission safeguards remain in force.

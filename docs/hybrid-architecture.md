# Centralized, Data-Driven Website Architecture

The master specification governs product scope. This document describes the engineering approach for implementing it.

## Governing principle

**Code defines HOW; data and configuration define WHAT, WHERE and WITH WHICH OPTIONS.**

Keep a small trusted execution core. Use shared components, route configuration and validated database content rather than duplicated country/page implementations.

## Trusted code
- Bootstrap, Supabase client and session handling.
- Country and language resolution.
- Authentication, authorization and security enforcement.
- Shared Header, Main Area, Footer and design tokens.
- Main/Sub Page router and allowlisted component renderer.
- CRUD data access, input validation and safe fallbacks.

## Centralized data
- Website title and logo reference.
- Main/Sub Page hierarchy, country scope, locale, status and order.
- Page component type and validated component configuration.
- User roles and audit history.
- Optional settings with safe defaults.

## Runtime contract
1. Fetch only the configuration and page records needed for the current route.
2. Validate values against a code-owned allowlist.
3. Apply styling through centralized CSS custom properties and shared components.
4. Never evaluate database strings as JavaScript, SQL or arbitrary HTML.
5. If configuration is unavailable or invalid, use a minimal safe default.
6. Security decisions remain in RLS and trusted Edge Functions, never public configuration.

## Performance and maintainability
- Avoid one query per component.
- Keep shared CSS canonical in `site/assets/style.css`.
- Prefer semantic Small/Medium/Large sizes.
- Keep optional fields optional unless they are required for safe operation.
- Avoid duplicated page layouts and route-specific hard-coded content.
- Test Global, BD and KSA plus English, Bangla and Arabic, including RTL.

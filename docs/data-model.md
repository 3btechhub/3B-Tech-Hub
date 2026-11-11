# 3B TECH HUB — Data Model

This document distinguishes the four provisioned Appwrite TablesDB tables from future business modules. The current physical schema is authoritative for the live application; proposed modules below are not claimed to be provisioned.

## Implemented TablesDB foundation

| Table ID | Purpose | Current use |
|---|---|---|
| `content` | Content revisions | Draft and revision records |
| `audit_logs` | Audit trail | Privileged action history |
| `media_assets` | Media metadata | Storage file references and media details |
| `site_settings` | Site configuration | Persisted global settings |

The production database ID is `3btechhub-prod`. All four tables are enabled. Their current row-security configuration is disabled; this must remain paired with server-only API-key access and strict server-side authorization. Do not grant direct public/client access to these tables.

## Design rules
- Use stable IDs; do not expose sequential internal identifiers.
- Include createdAt/updatedAt where appropriate.
- Use explicit status enums and validate transitions server-side.
- Store money as integer minor units plus ISO currency code (never floating-point money).
- Store timestamps in UTC; render in the user's selected timezone.
- Keep private customer and operational data separate from public catalogue/content.
- Avoid storing payment card data; use a compliant payment provider.

## Future business modules (not yet provisioned)
| Table | Purpose | Key fields |
|---|---|---|
| pages | Page metadata and routing | slug, title, status, locale, seoJson |
| page_versions | Draft/published page revisions | pageId, version, contentJson, state, createdBy, approvedBy |
| navigation_items | Editable menus | label, href, parentId, sortOrder, isVisible |
| services | Repair/service catalogue | slug, name, description, categoryId, active |
| service_categories | Service grouping | name, slug, sortOrder |
| products | Product catalogue | sku, slug, name, description, priceMinor, currency, stockQty, active |
| customers | Customer profile | authUserId, name, email, phone, consentJson |
| bookings | Service booking requests | bookingNo, customerId, serviceId, preferredAt, status, notes |
| orders | Product orders | orderNo, customerId, status, subtotalMinor, currency |
| order_items | Order line items | orderId, productId, quantity, unitPriceMinor |
| service_jobs | Repair work lifecycle | bookingId, jobNo, status, diagnosis, estimateMinor, finalMinor |
| reviews | Customer feedback | customerId, serviceId, rating, body, moderationStatus |
| articles | Blog/news content | slug, title, bodyJson, status, publishedAt, seoJson |
| users_profile | Application role profile | authUserId, displayName, role, active |
| notifications | Notification delivery state | recipientId, channel, templateKey, status, sentAt |

## Suggested status flows
- Page: draft → in_review → approved → published → archived.
- Booking: requested → confirmed → in_progress → completed; cancellation/rejection recorded separately.
- Order: pending → confirmed → processing → fulfilled; cancellation/refund states handled explicitly.
- Service job: received → diagnosing → awaiting_approval → repairing → quality_check → ready → delivered.

## Access-control intent
- Public visitors: read only published public pages, active services and active products; create rate-limited public enquiries/bookings through validated server endpoints.
- Customer: read/update permitted own profile; read own bookings/orders/jobs only.
- Staff: access assigned operational records only; no publishing or role administration by default.
- Manager: manage approved operational areas; no owner-only publishing/security settings unless explicitly delegated.
- Admin: manage content and operations within assigned scope; cannot bypass owner approval.
- Owner: full administrative authority, final approval and publishing.
- Server runtime: use narrowly scoped service credentials and validate actor/ownership before each operation.

## Index candidates for future modules
Create indexes only after query patterns are finalized. Likely candidates include:
- pages.slug (unique), pages.status + locale
- products.slug (unique), products.sku (unique), products.active
- bookings.bookingNo (unique), bookings.customerId + createdAt, bookings.status + preferredAt
- orders.orderNo (unique), orders.customerId + createdAt, orders.status
- articles.slug (unique), articles.status + publishedAt
- audit_logs.actorId + createdAt, audit_logs.resourceType + resourceId

## Before expanding the schema
1. Confirm initial language(s) and currency/currencies.
2. Confirm customer account requirement (guest booking vs mandatory sign-in).
3. Confirm whether product checkout/payment is in launch scope.
4. Review data retention, privacy and consent requirements.
5. Convert approved future modules into Appwrite columns, indexes and permissions.

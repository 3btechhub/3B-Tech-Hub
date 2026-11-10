# 3B TECH HUB — Data Model Draft

This is a logical schema proposal, not a provisioned database. Physical Appwrite TablesDB columns, indexes and permissions will be created after validating field sizes, relationships and access rules.

## Design rules
- Use stable IDs; do not expose sequential internal identifiers.
- Include createdAt/updatedAt where appropriate.
- Use explicit status enums and validate transitions server-side.
- Store money as integer minor units plus ISO currency code (never floating-point money).
- Store timestamps in UTC; render in the user's selected timezone.
- Keep private customer and operational data separate from public catalogue/content.
- Avoid storing payment card data; use a compliant payment provider.

## Proposed tables

| Table | Purpose | Key fields |
|---|---|---|
| site_settings | Global site configuration | key, valueJson, visibility, updatedBy |
| pages | Page metadata and routing | slug, title, status, locale, seoJson |
| page_versions | Draft/published page revisions | pageId, version, contentJson, state, createdBy, approvedBy |
| navigation_items | Editable menus | label, href, parentId, sortOrder, isVisible |
| media_assets | Uploaded media metadata | fileId, altText, mimeType, size, visibility |
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
| audit_logs | Privileged action history | actorId, action, resourceType, resourceId, metadataJson |
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
- Server functions: use narrowly scoped service credentials and validate actor/ownership before each operation.

## Index candidates
Create indexes only after query patterns are finalized. Likely candidates include:
- pages.slug (unique), pages.status + locale
- products.slug (unique), products.sku (unique), products.active
- bookings.bookingNo (unique), bookings.customerId + createdAt, bookings.status + preferredAt
- orders.orderNo (unique), orders.customerId + createdAt, orders.status
- articles.slug (unique), articles.status + publishedAt
- audit_logs.actorId + createdAt, audit_logs.resourceType + resourceId

## Before provisioning
1. Confirm initial language(s) and currency/currencies.
2. Confirm customer account requirement (guest booking vs mandatory sign-in).
3. Confirm whether product checkout/payment is in launch scope.
4. Review data retention, privacy and consent requirements.
5. Convert this logical model into Appwrite columns, indexes, relationships and row-level permissions.

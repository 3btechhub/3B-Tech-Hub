# Catalogue and Content Management

## Live catalogue modules
The GitHub Pages frontend reads public active records from Supabase and the Owner dashboard manages:
- Services
- Products
- Workshops
- Technicians

All writes must be protected by Supabase RLS. Hiding controls in the browser is not an authorization boundary.

## Product data model
- Group: `mobile` (Mobile & Accessories) or `satellite` (Satellite & TV Equipment).
- Product type/name: e.g. Phone Glass Protector.
- Country: `bd`, `saudi`, `global` or null where allowed.
- Status: active, draft or archived according to the table schema.
- The public catalogue initially shows four cards; the More control reveals the next four without hiding already-visible cards.

## Service country routing
Bangladesh: TV Repair, Mobile Repair, Mobile Parts Sell.
Saudi Arabia: Satellite Dish Installation, Satellite Dish Servicing, Satellite Dish Parts Sell.

## Publishing rules
- Public visitors see active/published records only.
- Owner-only CRUD is enforced by RLS.
- Preserve the six approved service records and their country assignments.
- Product records represent categories/types, not individual stock products.

## Remaining CMS work
A full page builder, revisions/approval workflow, website settings editor and dedicated media library are not part of the live static release. Build them only against Supabase and with tested RLS/Edge Function authorization.

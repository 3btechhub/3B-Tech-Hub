# Page Management

The only content management system is the Page module defined in [master-spec.md](master-spec.md).

## Page hierarchy

- Main Page: a top-level dynamic page.
- Sub Page: belongs to exactly one Main Page.
- Sub Pages cannot be published unless their parent Main Page is published.
- URL slugs are lowercase, URL-safe values.
- The browser renders only registered, allowlisted component types. Stored content must never be treated as executable HTML or JavaScript.

## Publishing and access

- Visitors and Members can read published pages.
- Admin and Owner can manage pages according to RLS.
- Page CRUD, publication status, hierarchy and revisions are enforced by Supabase policies and database constraints.
- Global, BD and KSA visibility follows the country rules in the master specification.

No separate Services, Products, Workshops, Technicians, Media Library, Booking or catalogue management module is permitted.

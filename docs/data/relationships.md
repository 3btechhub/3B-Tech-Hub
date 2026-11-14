# Data Relationships

## Relationship rules

Use explicit database relationships and relationship/junction tables for many-to-many associations.

Catalogue relationship fields must be backed by explicit database relationships. Do not infer associations from names or categories.

## Relationship domains

Relationships may connect:

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

## Access relationships

Maintain the relationship between Supabase Auth users and their profile records.

Role and permission assignments must be validated on the server and enforced by database policies.

Preserve existing relationships when updating terminology or restructuring documentation.

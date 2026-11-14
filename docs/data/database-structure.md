# Database Structure

## Module data

Every module retains its own primary data table.

Use relationship/junction tables for many-to-many associations between:

- Catalogue modules
- Countries
- Languages
- Users
- Roles
- Permissions

## Compatibility and preservation

The current names Service Types and Product Types replace the older Categories and Device Types terminology in the user interface and specification.

Preserve existing Device Types records and relationships as Product Types. Do not delete and recreate records merely to change their display name.

Preserve existing:

- Services
- Products
- Workshops
- Technicians
- Countries
- Users
- Roles
- Permissions
- Authentication records
- Storage objects
- Supporting data

Contacts, Locations and other legacy records may remain as supporting or legacy data. They are not primary pages, Dashboard modules or default Home sections under the current specification. Do not blindly delete them.

See [Data Relationships](relationships.md).

# Required Fields

## Catalogue and reference modules

The following modules require only Title and Slug:

- Service Types
- Product Types
- Services
- Products
- Workshops
- Technicians
- Countries
- Languages

## Access-management modules

The following modules require only Email:

- Users
- Roles
- Permissions

## Optional fields

All other listed fields are optional unless a verified security or database invariant requires otherwise.

## Slug rules

- Generate Slug from Title by default.
- Keep Slug manually editable.
- Slug must be unique within the applicable module.
- Enforce uniqueness in the database.

# Countries Module

## Fields

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

## Required fields

- Title
- Slug

All other listed fields are optional unless a verified security or database invariant requires otherwise.

## Relationships

Use explicit database relationships for all related records. Do not infer associations from names or categories.

## Slug

Generate the Slug from Title by default. Keep it manually editable and unique within the applicable module. Enforce uniqueness in the database.

## Protected default

The Global country record is protected. It must not be deleted or renamed. Global is always included in a record's country selection and cannot be unchecked or removed from that selection.

## Interface

Use the shared [Module Interface Standard](../dashboard/module-interface-standard.md).

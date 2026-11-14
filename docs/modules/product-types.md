# Product Types Module

## Fields

- Title
- Description
- Slug
- Country
- Service Types
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

## Legacy compatibility

Product Types is the current terminology replacing the older Device Types terminology in the interface and specification. Preserve existing Device Types records and relationships; do not delete and recreate records merely to change their display name.

## Interface

Use the shared [Module Interface Standard](../dashboard/module-interface-standard.md).

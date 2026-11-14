# Languages Module

## Fields

- Title
- Description
- Slug
- Country
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

## Default language

English is pre-created and selected as the default language. If additional languages exist, the user can switch to another available language.

## Interface

Use the shared [Module Interface Standard](../dashboard/module-interface-standard.md).

# Users Module

## Fields

- Name
- Email
- Roles
- Permissions
- Images
- Status

## Required fields

- Email

All other listed fields are optional unless a verified security or database invariant requires otherwise.

## Status actions

- Active
- Deactive
- Block
- Delete

## Security

Maintain the relationship between Supabase Auth users and profile records. Role and permission assignments must be validated on the server and enforced by database policies. Never expose passwords.

## Interface

Use the shared [Module Interface Standard](../dashboard/module-interface-standard.md).

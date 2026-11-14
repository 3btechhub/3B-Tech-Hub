# Roles Module

## Fields

- Name
- Email
- Users
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

A role with assigned users must not be deleted without safe reassignment. The Owner role is protected and must not be deleted or deactivated.

## Interface

Use the shared [Module Interface Standard](../dashboard/module-interface-standard.md).

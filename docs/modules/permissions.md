# Permissions Module

## Fields

- Roles
- Name
- Email
- Users
- Roles relationship

The Roles relationship is represented once in the Permissions form even though it appears twice in the supplied field list.

## Required fields

- Email

All other listed fields are optional unless a verified security or database invariant requires otherwise.

## Status actions

- Active
- Deactive
- Block
- Delete

## Security

Role and permission assignments must be validated on the server and enforced by database policies. Users must not be able to elevate their own roles or permissions.

## Interface

Use the shared [Module Interface Standard](../dashboard/module-interface-standard.md).

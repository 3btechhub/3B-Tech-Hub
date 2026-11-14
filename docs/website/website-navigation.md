# Website Navigation

## Navigation structure

Navigation reflects the three-page website architecture:

- Home
- Account
- Dashboard

## Access-aware navigation

- Account access exposes the appropriate account layout for the current authentication state.
- Dashboard access is visible only to the Owner.
- Hiding a menu item is never a substitute for backend authorization.

## Selectors

Keep Language and Country selectors where they are supported by the current implementation and approved configuration.

- English is the default language.
- Global is the default country context.

See [Header Layout](../layouts/header.md), [Authentication](../security/authentication.md) and [Authorization](../security/authorization.md).

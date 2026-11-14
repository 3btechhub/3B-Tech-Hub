# Header Layout

## Components

Keep the following as separate components:

- Website Logo
- Website Title
- Navigation Menu

Clicking the Logo or Title must not trigger navigation or another action.

## Navigation behavior

The navigation reflects the three primary website pages: Home, Account and Dashboard.

- Account access exposes the appropriate account layout for the current authentication state.
- Dashboard access is visible only to the Owner.
- Frontend menu visibility is not an authorization control.

## Selectors

Keep Language and Country selectors where supported by the current implementation and approved configuration.

- English is the default language.
- Global is the default country context.

## Layout boundaries

Header is a shared website layout, separate from Content and Footer.

Do not add unapproved header elements or interactions.

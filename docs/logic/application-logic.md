# Application Logic

This file records application-level behavior that spans multiple screens or modules.

## Confirmed behavior
- Home renders the configured sections; its default set is documented in [Home Customizations](../customizations/home-customizations.md).
- Dashboard hosts the modules listed in [Dashboard Overview](../dashboard/dashboard-overview.md).
- A module's configured slug is managed through Settings; modules do not become standalone pages.
- The shared Form + Database interaction follows [Module Interface Standard](../dashboard/module-interface-standard.md).
- Account layouts use configurable slugs as documented in the Account files.

## Pending Specification
No complete application execution flow, data-fetching strategy, cache policy for application records, optimistic update policy, retry policy or cross-module synchronization algorithm is currently approved. Define these before implementation.
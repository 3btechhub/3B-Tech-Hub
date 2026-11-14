# Global Rules

## Authority and scope
- The latest Owner-approved project specification takes precedence over older or conflicting requirements.
- These documents are the canonical source for agreed product requirements.
- Do not infer missing behavior from framework conventions or existing UI.
- Mark unresolved requirements as **Pending Specification**.
- Do not change production code, data, configuration or deployment without explicit approval.

## Product-wide rules
- The website has three primary pages: Home, Account and Dashboard.
- Dashboard modules are sections within the Dashboard, not independent pages.
- Module slugs and Account layout slugs are configurable through Settings.
- Use the approved English interface, mobile-first responsive layout, Light/Dark themes and Black/White/Neutral Gray palette.
- Keep the layout LTR while ensuring architecture can support RTL later; do not activate an RTL switch without approval.
- Preserve existing supported records and relationships during migrations.
- Country Global and the Owner visibility selection are protected defaults as defined in the data documentation.

## Documentation rule
Each behavior belongs in its relevant topic file. Cross-reference rather than duplicating authoritative rules.
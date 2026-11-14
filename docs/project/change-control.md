# Change Control and Delivery

## Before making changes

Inspect the current GitHub and Supabase implementation. Verify:

- Dependencies and application references
- Database relationships and foreign keys
- Row Level Security policies
- Storage references and existing objects
- Existing records and authentication relationships

## Safe change requirements

- Preserve working features unless they conflict with the current Owner-approved specification.
- Prefer safe, additive and reversible migrations.
- Avoid destructive changes without a verified migration plan.
- Preserve existing data and relationships.
- Do not introduce unapproved platforms or features.

## Reporting requirements

Do not report a feature as implemented, tested or live until the relevant code, database behavior, security controls and deployment have been verified.

The detailed requirements are indexed in [Master Specification](../master-spec.md).

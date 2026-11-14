# Authorization

## Enforcement

Use:

- Row Level Security (RLS)
- Trusted Edge Functions
- Server-side permission validation
- Database constraints
- Validated Role-Permission relationships

Frontend visibility is never authorization. Every sensitive operation must be validated by trusted backend or database controls.

## Privilege protection

Users must not be able to elevate their own roles or permissions.

Dashboard visibility is Owner-only, and backend authorization must independently enforce access.

## Storage

Use secure image upload and Storage access controls.

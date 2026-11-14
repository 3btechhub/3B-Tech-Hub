# Error Handling

## Principles
- Do not expose secrets, credentials, stack traces or sensitive database details to users.
- Treat server-side validation and authorization failures as authoritative.
- Preserve user-entered data where safely possible after a recoverable failure.
- Do not silently report a failed operation as successful.

## Pending Specification
A complete error taxonomy, user-facing message catalogue, logging levels, correlation identifiers, retry policy, offline behavior, monitoring/alerting and recovery procedures must be approved and documented before implementation.
# Backend Functions

## Scope
Server-side application operations, service contracts and orchestration belong here.

## Confirmed constraints
- Authorization and validation must not rely on frontend checks alone.
- Preserve protected Owner rules on trusted server-side paths.
- Preserve existing data and relationships during approved migrations.

## Pending Specification
Named backend functions, endpoints, request/response schemas, transaction boundaries, idempotency, rate limits, retries, logging and error codes have not been comprehensively specified. Define contracts before implementation.
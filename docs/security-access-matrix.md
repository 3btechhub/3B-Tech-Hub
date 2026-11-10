# 3B TECH HUB — Access Control Matrix

This is the application policy baseline. It must be enforced in trusted server code and Appwrite row/file permissions before any privileged feature is enabled. Hiding UI elements is not authorization.

| Capability | Owner | Admin | Manager | Staff |
|---|---:|---:|---:|---:|
| Read content | Yes | Yes | Yes | Yes |
| Edit content drafts | Yes | Yes | No | No |
| Approve content | Yes | No | No | No |
| Publish content | Yes | No | No | No |
| Manage catalogue | Yes | Yes | Yes | No |
| Manage bookings | Yes | Yes | Yes | Yes (assigned scope only) |
| Manage customers | Yes | Yes | Yes | No |
| Manage users and roles | Yes | No | No | No |
| Manage system settings | Yes | No | No | No |
| Read audit log | Yes | Yes (limited) | No | No |

## Enforcement requirements
1. Resolve the authenticated Appwrite user on the server for every privileged request.
2. Load the role from a protected server-managed profile; never trust a role supplied by the browser.
3. Apply deny-by-default checks on every read/write endpoint and Appwrite resource.
4. Validate record ownership and staff assignment before returning operational records.
5. Require owner role for approval and publishing, with a second explicit confirmation for production release.
6. Record actor, action, resource, timestamp and relevant before/after metadata in append-only audit events.
7. Do not expose Appwrite API keys or privileged credentials to browser code.
8. Add tests for both allowed and denied paths; include cross-customer access tests.

## Current status
The role policy is implemented as a tested TypeScript policy module. It is not yet connected to authenticated sessions or Appwrite permissions, so it is not a production security boundary.

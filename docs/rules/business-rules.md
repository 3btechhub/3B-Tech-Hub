# Business Rules

## Owner protection
The Owner account `3btechhub@gmail.com` must not be deleted, blocked, demoted or replaced. The Owner role is protected. See [Owner Protection](../security/owner-protection.md).

## Role assignment
A role that has assigned users cannot be deleted until those users are reassigned.

## Catalogue relationships
The approved relationship fields are documented separately in each module specification and in [Data Relationships](../data/relationships.md). Do not infer cascade delete, automatic relationship creation or synchronization behavior.

## Legacy data
Device Types is presented as Product Types. Existing Device Types records and relationships must be preserved rather than deleted and recreated. Supporting or legacy Contacts/Locations and other legacy records may remain, but are not primary pages, Dashboard modules or default Home sections.

## Pending decisions
Deletion policy for related records, archival behavior, conflict resolution, ordering persistence and concurrent edits require explicit specification.
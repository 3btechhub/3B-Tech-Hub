# State Management

## Known stateful interactions
- Selecting a Database record loads that record into the module Form.
- Database records can be rearranged.
- Forms support create, update and delete operations.
- Light/Dark theme is supported.
- Home sections can be customized.

## Pending Specification
The project has not yet defined a state-management library, global/local state boundaries, URL synchronization, persistence across refresh, draft state, dirty-form detection, unsaved-change prompts, loading state model, race-condition handling or real-time subscription behavior. These are design decisions, not assumed implementation facts.
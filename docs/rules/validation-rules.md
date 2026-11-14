# Validation Rules

## Confirmed required fields
- Service Types, Product Types, Services, Products, Workshops, Technicians, Countries and Languages: Title and Slug.
- Users, Roles and Permissions: Email.

## Confirmed fixed selections
- Country: Global is permanently selected and cannot be unchecked, deleted or renamed.
- Visibility: Owner is permanently selected.

## Not yet specified
The following must not be guessed: slug-generation algorithm, slug normalization, uniqueness scope, case sensitivity, whitespace handling, email normalization, URL formats, image MIME/size limits, maximum field lengths, relationship cardinality validation, duplicate detection, asynchronous validation and exact validation messages.

Record each approved rule here with its field, condition, timing, user-facing message and server-side enforcement requirement.
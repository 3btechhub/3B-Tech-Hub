# Module Interface Standard

## Applicable modules

The following eleven modules use this interface:

- Service Types
- Product Types
- Services
- Products
- Workshops
- Technicians
- Countries
- Languages
- Users
- Roles
- Permissions

## Form

Use one shared Form per module for creating and editing records.

When a record is selected from Database, load its values into that same Form.

The Form supports:

- Create
- Update
- Delete
- Save
- Cancel

Delete is available for a selected record and must be protected by applicable authorization and system safeguards.

## Database

The Database section displays the module's records and supports:

- Viewing records
- Selecting a record to load it into the shared Form
- Rearranging record order

## Views

Support:

- List View
- Details View

Details View is an in-context view within the existing Home or Dashboard experience. Do not create standalone module pages or individual catalogue item pages.

## Responsive behavior

Keep Form and Database visually distinct and easy to use on mobile.

See each module's individual specification for its fields and module-specific rules.

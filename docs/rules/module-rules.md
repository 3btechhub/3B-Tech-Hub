# Module Rules

## Shared module interface
The eleven data modules are Service Types, Product Types, Services, Products, Workshops, Technicians, Countries, Languages, Users, Roles and Permissions.

Each module uses the shared Form + Database interface described in [Module Interface Standard](../dashboard/module-interface-standard.md). The Form handles create, update and delete operations. Selecting a Database record loads it into the Form. The Database supports record rearrangement.

## Catalogue and reference modules
Service Types, Product Types, Services, Products, Workshops, Technicians, Countries and Languages use their individually documented fields. For these eight modules, only Title and Slug are currently specified as required.

Home's default sections are Service Types, Product Types, Services, Products, Workshops and Technicians. Countries and Languages are optional customization choices, not default Home sections.

## Access-management modules
Users, Roles and Permissions use their own field definitions. Email is currently specified as required for these three modules. User, role and permission status actions are Active, Deactive, Block and Delete where applicable to the documented module.

## Module-specific details
The field lists and protected relationships in each module file remain authoritative. Any unlisted field, action, cascade behavior or uniqueness rule is **Pending Specification**.
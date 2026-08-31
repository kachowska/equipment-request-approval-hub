# SharePoint views and permissions

## Recommended list views

### My active requests
Filter:
- `ApprovalStatus` is not `Rejected`
- `FulfillmentStatus` is not `Completed`

The Canvas App applies the current-user filter with `EmployeeEmail = User().Email`.

### Pending approvals
Filter:
- `ApprovalStatus = Pending Approval`

### IT fulfillment queue
Filter:
- `ApprovalStatus = Approved`
- `FulfillmentStatus != Completed`

### Completed
Filter:
- `FulfillmentStatus = Completed`

## Permissions

Hiding buttons in Power Apps is only a UX control. It is **not sufficient security** by itself.

Recommended portfolio deployment:

- Members of an `Equipment Hub Employees` group: read list + create items.
- Managers: contribute.
- IT: contribute.
- Configure SharePoint item-level settings so employees can read and edit only their own items where practical.
- Managers / IT work through separate groups with broader permissions.
- Do not expose the `App Roles` list for general editing.
- Enable version history on `Equipment Requests`.

For a stronger production design, use Entra groups and/or a flow/service account to enforce item-level permission changes after creation.

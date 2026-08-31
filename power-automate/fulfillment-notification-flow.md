# Power Automate flow: Fulfillment notifications

Flow name: `Equipment Request - Fulfillment Notification`

Trigger: SharePoint — When an item is created or modified.

## Case 1: status changes to In Progress

Send an email or Teams message to `EmployeeEmail`:
- request ID
- device type
- fulfillment started
- assigned IT person

## Case 2: status changes to Completed

Send an email or Teams message:
- request ID
- device type
- completion timestamp
- fulfillment contact

Use trigger conditions or a comparison against previous values so notifications are not duplicated on unrelated updates.

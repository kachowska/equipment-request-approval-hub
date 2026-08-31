# Power Apps control map

App name: **Employee Equipment Request & Approval Hub**

Data sources:
- `Equipment Requests`
- `App Roles`

## Screens

### `scrHome`
Role-aware landing page.
- `lblWelcome`
- `lblRole`
- `btnNewRequest`
- `btnMyRequests`
- `btnManagerQueue` — Manager only
- `btnITQueue` — IT only

### `scrRequestForm`
Create/edit request.
- `txtTitle`
- `cmbDepartment`
- `cmbDeviceType`
- `txtReason`
- `cmbUrgency`
- `btnSaveDraft`
- `btnSubmit`

### `scrMyRequests`
Employee request gallery.
- `galMyRequests`
- status chips
- open details action

### `scrManagerQueue`
Manager view.
- `galManagerQueue`
- current pending requests assigned to manager
- link/instruction to use Microsoft Approval card for the authoritative decision

### `scrITQueue`
IT view.
- `galITQueue`
- `btnStartFulfillment`
- `btnCompleteFulfillment`

### `scrRequestDetails`
Read-only request details plus role-dependent actions.

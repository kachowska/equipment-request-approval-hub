# Power Fx formulas

These formulas use text email columns deliberately so the portfolio project can be reproduced without depending on a specific Person-column schema.

## App.OnStart

```powerfx
Set(varCurrentUserEmail, Lower(User().Email));
Set(varCurrentUserName, User().FullName);

Set(
    varRoleRecord,
    LookUp(
        'App Roles',
        Lower(UserEmail) = varCurrentUserEmail && Active = true
    )
);

Set(
    varCurrentRole,
    Coalesce(varRoleRecord.Role.Value, "Employee")
);

Set(
    varManagerEmail,
    Lower(Coalesce(varRoleRecord.ManagerEmail, ""))
);
```

## Home role visibility

Manager queue button:

```powerfx
varCurrentRole = "Manager"
```

IT queue button:

```powerfx
varCurrentRole = "IT"
```

New request button:

```powerfx
varCurrentRole = "Employee"
```

## My requests gallery

```powerfx
SortByColumns(
    Filter(
        'Equipment Requests',
        Lower(EmployeeEmail) = varCurrentUserEmail
    ),
    "Created",
    SortOrder.Descending
)
```

## Manager queue gallery

```powerfx
SortByColumns(
    Filter(
        'Equipment Requests',
        Lower(ApproverEmail) = varCurrentUserEmail &&
        ApprovalStatus.Value = "Pending Approval"
    ),
    "Created",
    SortOrder.Ascending
)
```

## IT queue gallery

```powerfx
SortByColumns(
    Filter(
        'Equipment Requests',
        ApprovalStatus.Value = "Approved" &&
        FulfillmentStatus.Value <> "Completed"
    ),
    "Modified",
    SortOrder.Descending
)
```

## Validation before save

```powerfx
Set(
    varFormValid,
    !IsBlank(Trim(txtTitle.Text)) &&
    !IsBlank(cmbDepartment.Selected.Value) &&
    !IsBlank(cmbDeviceType.Selected.Value) &&
    Len(Trim(txtReason.Text)) >= 10 &&
    !IsBlank(cmbUrgency.Selected.Value)
);
```

## Create draft

```powerfx
If(
    !varFormValid,
    Notify("Complete all required fields. Reason must contain at least 10 characters.", NotificationType.Error),
    Set(
        varSavedRequest,
        Patch(
            'Equipment Requests',
            Defaults('Equipment Requests'),
            {
                Title: Trim(txtTitle.Text),
                EmployeeName: varCurrentUserName,
                EmployeeEmail: varCurrentUserEmail,
                Department: {Value: cmbDepartment.Selected.Value},
                DeviceType: {Value: cmbDeviceType.Selected.Value},
                RequestReason: Trim(txtReason.Text),
                Urgency: {Value: cmbUrgency.Selected.Value},
                ApprovalStatus: {Value: "Draft"},
                ApproverEmail: varManagerEmail,
                RequestDate: Now(),
                FulfillmentStatus: {Value: "Not Started"},
                ApprovalRequested: false
            }
        )
    );
    Notify("Draft saved.", NotificationType.Success)
)
```

## Submit request

```powerfx
If(
    IsBlank(varSavedRequest.ID),
    Notify("Save the request before submitting.", NotificationType.Error),
    Patch(
        'Equipment Requests',
        varSavedRequest,
        {
            ApprovalStatus: {Value: "Pending Approval"},
            ApprovalRequested: false
        }
    );
    Refresh('Equipment Requests');
    Notify("Request submitted for manager approval.", NotificationType.Success);
    Navigate(scrMyRequests)
)
```

## Employee edit rule

For edit-button `Visible`:

```powerfx
Lower(ThisItem.EmployeeEmail) = varCurrentUserEmail &&
ThisItem.ApprovalStatus.Value = "Draft"
```

Design decision: after submission the request is locked. This prevents an employee from changing the request after an approval card has already been generated.

## Start fulfillment

```powerfx
Patch(
    'Equipment Requests',
    galITQueue.Selected,
    {
        FulfillmentStatus: {Value: "In Progress"},
        FulfilledByName: varCurrentUserName,
        FulfilledByEmail: varCurrentUserEmail
    }
);
Refresh('Equipment Requests')
```

## Complete fulfillment

```powerfx
Patch(
    'Equipment Requests',
    galITQueue.Selected,
    {
        FulfillmentStatus: {Value: "Completed"},
        FulfilledByName: varCurrentUserName,
        FulfilledByEmail: varCurrentUserEmail,
        FulfilledDate: Now()
    }
);
Refresh('Equipment Requests')
```

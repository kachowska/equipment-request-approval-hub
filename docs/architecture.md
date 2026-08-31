# Architecture

```mermaid
flowchart LR
    E[Employee] --> PA[Power Apps Canvas App]
    M[Manager] --> PA
    IT[IT Specialist] --> PA

    PA --> ER[(SharePoint: Equipment Requests)]
    PA --> AR[(SharePoint: App Roles)]

    ER --> F1[Power Automate: Manager Approval]
    F1 --> AP[Microsoft Approvals]
    AP --> M
    F1 --> ER
    F1 --> N1[Outlook / Teams notification]
    N1 --> E

    ER --> F2[Power Automate: Fulfillment Notification]
    F2 --> N2[Outlook / Teams]
    N2 --> E
```

## Trust boundaries

- Power Apps controls the user experience.
- SharePoint stores the business records and version history.
- Power Automate owns the authoritative approval transition.
- App role visibility is not treated as sufficient authorization by itself.

# Employee Equipment Request & Approval Hub

Portfolio project for a junior Microsoft 365 / Power Platform role.

## Business problem

Employees need a simple way to request laptops, monitors, peripherals and other equipment. Managers need a consistent approval process, while IT needs a clear fulfillment queue and an auditable status trail.

The solution uses:

- **SharePoint Online / Microsoft Lists** as the system of record
- **Power Apps Canvas** as the role-aware front end
- **Power Automate** for manager approval and notifications
- **Power Fx** for filtering, validation and UI behavior
- **Teams / Outlook** notifications through Microsoft 365 connectors

A local browser prototype is included so the business rules can be tested without a Microsoft 365 tenant.

## Current status

**Implementation package: complete**
**Local workflow prototype: validated**
**Microsoft 365 tenant deployment: pending**

This repository does **not** claim that the SharePoint list, Canvas App or cloud flow has been deployed in a real tenant yet. The included build pack is designed to make that deployment straightforward and reproducible.

Do not mark the project `cv_eligible: true` until the tenant deployment is completed and the acceptance tests are executed against the live Power Platform solution.

## Roles

- **Employee** — creates requests and sees own requests
- **Manager** — reviews requests assigned for approval
- **IT** — sees approved requests and manages fulfillment

Role information is stored in a second SharePoint list (`App Roles`) instead of being hardcoded into the app.

## Main workflow

1. Employee creates a request.
2. Required fields are validated.
3. Employee submits the request.
4. SharePoint stores the request with `Pending Approval`.
5. Power Automate sends a standard approval to the manager.
6. Approval result updates the SharePoint item.
7. Employee receives the decision notification.
8. Approved requests appear in the IT fulfillment queue.
9. IT marks fulfillment `In Progress` and finally `Completed`.

## Repository structure

```text
sharepoint/
  equipment-requests-schema.json
  app-roles-schema.json
  sample-equipment-requests.csv
  sample-app-roles.csv
  views-and-permissions.md

powerapps/
  app-map.md
  formulas.md
  screen-specs.md

power-automate/
  approval-flow-spec.md
  fulfillment-notification-flow.md

prototype/
  index.html
  styles.css
  app.mjs
  workflow.mjs
  workflow.test.mjs

qa/
  manual-test-cases.csv
  uat-scenarios.md
  traceability-matrix.csv
  test-report.md

docs/
  architecture.md
  deployment-guide.md
  user-guide.md
  acceptance-criteria.md

registry/
  pending-project-record.json

validate_project.py
```

## Local validation

No third-party packages are required.

```bash
cd prototype
node --test workflow.test.mjs

cd ..
python validate_project.py
```

To view the local prototype:

```bash
cd prototype
python -m http.server 8000
```

Open `http://localhost:8000`.

## Portfolio evidence after tenant deployment

Capture these screenshots after the cloud build is completed:

1. SharePoint `Equipment Requests` list with columns and sample items.
2. SharePoint `App Roles` list.
3. Employee request screen in Power Apps.
4. Manager queue.
5. IT fulfillment queue.
6. Power Automate approval flow.
7. Approval email or Teams card.
8. Approved request reflected back in SharePoint.
9. Completed fulfillment state.
10. Test execution evidence.

## Official references used for the design

- Microsoft Learn: Create a canvas app with data from a SharePoint / Microsoft List
  https://learn.microsoft.com/en-us/power-apps/maker/canvas-apps/app-from-sharepoint
- Microsoft Learn: Power Fx Patch
  https://learn.microsoft.com/en-us/power-platform/power-fx/reference/function-patch
- Microsoft Learn: Filter / Search / LookUp
  https://learn.microsoft.com/en-us/power-platform/power-fx/reference/function-filter-lookup
- Microsoft Learn: User()
  https://learn.microsoft.com/en-us/power-platform/power-fx/reference/function-user
- Microsoft Learn: Start and wait for an approval
  https://learn.microsoft.com/en-us/connectors/approvals/

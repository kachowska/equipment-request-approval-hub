# Deployment guide

## Prerequisites

- Microsoft 365 account with SharePoint Online
- Power Apps access
- Power Automate access
- Permission to create lists, Canvas Apps and cloud flows
- Three test identities are ideal: Employee, Manager and IT

## 1. Create SharePoint lists

Create:
- `Equipment Requests`
- `App Roles`

Use the schemas under `sharepoint/*.json`.

Enable version history on `Equipment Requests`.

## 2. Load role mappings

Add three test users to `App Roles`:
- Employee with a `ManagerEmail`
- Manager
- IT

Use real tenant UPNs during deployment. The `.example` values in sample CSV files are placeholders only.

## 3. Create the Canvas App

In Power Apps:

1. Start with data.
2. Choose SharePoint.
3. Connect to the target site.
4. Add both lists as data sources.
5. Create the screens in `powerapps/app-map.md`.
6. Apply formulas from `powerapps/formulas.md`.
7. Configure responsive containers.
8. Save and publish.

## 4. Build the approval flow

Create `Equipment Request - Manager Approval` from `power-automate/approval-flow-spec.md`.

Test:
- approval email/card is delivered
- Approve updates the item
- Reject updates the item
- manager comments are stored
- employee receives the result

## 5. Build fulfillment notification flow

Use `power-automate/fulfillment-notification-flow.md`.

## 6. Apply permissions

Follow `sharepoint/views-and-permissions.md`.

## 7. Execute QA

Run all cases in `qa/manual-test-cases.csv`, then execute the five UAT scenarios.

Update `qa/test-report.md` with:
- actual tenant
- date
- tester
- passed/failed counts
- defects
- screenshots/evidence

## 8. Completion gate

Only after:
- cloud app deployed
- both flows tested
- all critical acceptance criteria passed
- screenshots captured

change the registry project record to:
- `status: completed`
- `cv_eligible: true`

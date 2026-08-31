# Power Automate flow: Manager approval

Flow name: `Equipment Request - Manager Approval`

## Trigger

SharePoint — **When an item is created or modified**

Site Address: your SharePoint site  
List Name: `Equipment Requests`

## Trigger guard

Continue only when:

- `ApprovalStatus` equals `Pending Approval`
- `ApprovalRequested` equals `false`
- `ApproverEmail` is not empty

This prevents the flow from starting repeatedly after its own SharePoint updates.

## Actions

1. **Update item**
   - Set `ApprovalRequested = true`

2. **Start and wait for an approval**
   - Approval type: `Approve/Reject - First to respond`
   - Title: `Equipment request #<ID>: <Title>`
   - Assigned to: `ApproverEmail`
   - Details:
     - Employee
     - Department
     - Device type
     - Urgency
     - Reason
     - Link to item

3. **Condition: Outcome = Approve**

### If Yes
Update item:
- `ApprovalStatus = Approved`
- `ManagerComment = approval comments`
- `FulfillmentStatus = Not Started`

Send employee email / Teams notification:
- request approved
- request ID
- device
- manager comment

### If No
Update item:
- `ApprovalStatus = Rejected`
- `ManagerComment = approval comments`
- `FulfillmentStatus = Not Applicable`

Send employee email / Teams notification:
- request rejected
- request ID
- manager comment

## Failure handling

Add a parallel error path or Scope:
- record failure in flow run history
- do not silently change a request to Approved/Rejected
- leave request in `Pending Approval`
- surface the failed run during testing

## Important

The flow is the authoritative source of the approval decision. The manager queue in the Canvas App is a review/dashboard experience.

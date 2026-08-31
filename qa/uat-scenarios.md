# UAT scenarios

## UAT-01 — Employee requests a laptop
Employee creates a high-urgency laptop request, submits it and sees `Pending Approval`.

Expected: request is stored, manager is assigned, employee cannot edit after submission.

## UAT-02 — Manager approves
Assigned manager reviews the request through the queue and responds to the Microsoft Approval.

Expected: request becomes `Approved`, comment is stored, employee is notified.

## UAT-03 — Manager rejects
Employee submits another request. Manager rejects with a reason.

Expected: request becomes `Rejected`, comment is visible, request does not enter IT queue.

## UAT-04 — IT fulfills approved request
IT opens the approved queue, starts fulfillment, then completes it.

Expected: fulfillment transitions correctly and completion identity/timestamp are stored.

## UAT-05 — Role boundaries
Sign in as Employee, Manager and IT.

Expected:
- Employee sees only own requests and no privileged navigation.
- Manager sees assigned pending approvals.
- IT sees approved non-completed requests.

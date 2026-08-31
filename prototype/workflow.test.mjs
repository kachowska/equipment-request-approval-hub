import test from "node:test";
import assert from "node:assert/strict";
import {
  APPROVAL, FULFILLMENT, createDraft, submitRequest, decideRequest,
  setFulfillmentStatus, visibleRequestsForRole, canEditRequest
} from "./workflow.mjs";

const base = {
  title: "Laptop request",
  employeeName: "Emma Employee",
  employeeEmail: "emma.employee@contoso.example",
  department: "Engineering",
  deviceType: "Laptop",
  requestReason: "Required for development work",
  urgency: "High",
  approverEmail: "maya.manager@contoso.example"
};

test("valid request creates draft", () => {
  const result = createDraft(base, new Date("2026-08-31T10:00:00Z"));
  assert.equal(result.ok, true);
  assert.equal(result.request.approvalStatus, APPROVAL.DRAFT);
});

test("short reason fails validation", () => {
  const result = createDraft({...base, requestReason: "short"});
  assert.equal(result.ok, false);
  assert.equal(result.errors.requestReason, "Minimum 10 characters");
});

test("manager mapping is required", () => {
  const result = createDraft({...base, approverEmail: ""});
  assert.equal(result.ok, false);
  assert.equal(result.errors.approverEmail, "Manager mapping required");
});

test("owner can edit draft", () => {
  const request = createDraft(base).request;
  assert.equal(canEditRequest(request, base.employeeEmail), true);
});

test("different employee cannot edit draft", () => {
  const request = createDraft(base).request;
  assert.equal(canEditRequest(request, "other@contoso.example"), false);
});

test("submit moves draft to pending approval", () => {
  const request = createDraft(base).request;
  const pending = submitRequest(request, base.employeeEmail);
  assert.equal(pending.approvalStatus, APPROVAL.PENDING);
});

test("submitted request cannot be edited", () => {
  const request = submitRequest(createDraft(base).request, base.employeeEmail);
  assert.equal(canEditRequest(request, base.employeeEmail), false);
});

test("assigned manager can approve", () => {
  const pending = submitRequest(createDraft(base).request, base.employeeEmail);
  const approved = decideRequest(pending, base.approverEmail, "Approve", "OK");
  assert.equal(approved.approvalStatus, APPROVAL.APPROVED);
});

test("unassigned manager cannot decide", () => {
  const pending = submitRequest(createDraft(base).request, base.employeeEmail);
  assert.throws(() => decideRequest(pending, "wrong@contoso.example", "Approve"), /assigned manager/);
});

test("rejection requires a comment", () => {
  const pending = submitRequest(createDraft(base).request, base.employeeEmail);
  assert.throws(() => decideRequest(pending, base.approverEmail, "Reject", ""), /comment is required/);
});

test("rejected request is not applicable for fulfillment", () => {
  const pending = submitRequest(createDraft(base).request, base.employeeEmail);
  const rejected = decideRequest(pending, base.approverEmail, "Reject", "Budget");
  assert.equal(rejected.fulfillmentStatus, FULFILLMENT.NOT_APPLICABLE);
});

test("only approved request can start fulfillment", () => {
  const draft = createDraft(base).request;
  assert.throws(() => setFulfillmentStatus(draft, "ivan.it@contoso.example", FULFILLMENT.IN_PROGRESS), /approved/);
});

test("IT can start approved request", () => {
  const pending = submitRequest(createDraft(base).request, base.employeeEmail);
  const approved = decideRequest(pending, base.approverEmail, "Approve");
  const started = setFulfillmentStatus(approved, "ivan.it@contoso.example", FULFILLMENT.IN_PROGRESS);
  assert.equal(started.fulfillmentStatus, FULFILLMENT.IN_PROGRESS);
});

test("completion records timestamp", () => {
  const pending = submitRequest(createDraft(base).request, base.employeeEmail);
  const approved = decideRequest(pending, base.approverEmail, "Approve");
  const completed = setFulfillmentStatus(approved, "ivan.it@contoso.example", FULFILLMENT.COMPLETED, new Date("2026-08-31T12:00:00Z"));
  assert.equal(completed.fulfilledDate, "2026-08-31T12:00:00.000Z");
});

test("employee gallery only returns own requests", () => {
  const own = createDraft(base).request;
  const other = createDraft({...base, employeeEmail: "other@contoso.example"}).request;
  const result = visibleRequestsForRole([own, other], "Employee", base.employeeEmail);
  assert.equal(result.length, 1);
  assert.equal(result[0].employeeEmail, base.employeeEmail);
});

test("manager queue only returns assigned pending requests", () => {
  const a = submitRequest(createDraft(base).request, base.employeeEmail);
  const b = submitRequest(createDraft({...base, approverEmail:"other.manager@contoso.example"}).request, base.employeeEmail);
  const result = visibleRequestsForRole([a,b], "Manager", base.approverEmail);
  assert.equal(result.length, 1);
});

test("IT queue excludes rejected and completed requests", () => {
  const p1 = submitRequest(createDraft(base).request, base.employeeEmail);
  const approved = decideRequest(p1, base.approverEmail, "Approve");
  const completed = setFulfillmentStatus(approved, "ivan.it@contoso.example", FULFILLMENT.COMPLETED);
  const p2 = submitRequest(createDraft({...base, title:"Second"}).request, base.employeeEmail);
  const open = decideRequest(p2, base.approverEmail, "Approve");
  const p3 = submitRequest(createDraft({...base, title:"Third"}).request, base.employeeEmail);
  const rejected = decideRequest(p3, base.approverEmail, "Reject", "No");
  const result = visibleRequestsForRole([completed, open, rejected], "IT", "ivan.it@contoso.example");
  assert.deepEqual(result.map(r => r.title), ["Second"]);
});

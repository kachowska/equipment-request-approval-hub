export const APPROVAL = Object.freeze({
  DRAFT: "Draft",
  PENDING: "Pending Approval",
  APPROVED: "Approved",
  REJECTED: "Rejected",
});

export const FULFILLMENT = Object.freeze({
  NOT_STARTED: "Not Started",
  IN_PROGRESS: "In Progress",
  COMPLETED: "Completed",
  NOT_APPLICABLE: "Not Applicable",
});

const REQUIRED = ["title", "department", "deviceType", "requestReason", "urgency"];

export function validateRequest(input) {
  const errors = {};
  for (const field of REQUIRED) {
    const value = input[field];
    if (typeof value !== "string" || value.trim() === "") {
      errors[field] = "Required";
    }
  }
  if (typeof input.requestReason === "string" && input.requestReason.trim().length > 0 && input.requestReason.trim().length < 10) {
    errors.requestReason = "Minimum 10 characters";
  }
  if (!input.employeeEmail || !input.employeeEmail.includes("@")) {
    errors.employeeEmail = "Valid employee email required";
  }
  if (!input.approverEmail || !input.approverEmail.includes("@")) {
    errors.approverEmail = "Manager mapping required";
  }
  return errors;
}

export function canEditRequest(request, actorEmail) {
  return request.employeeEmail.toLowerCase() === actorEmail.toLowerCase()
    && request.approvalStatus === APPROVAL.DRAFT;
}

export function createDraft(input, now = new Date()) {
  const errors = validateRequest(input);
  if (Object.keys(errors).length) {
    return { ok: false, errors };
  }
  return {
    ok: true,
    request: {
      id: input.id ?? crypto.randomUUID(),
      title: input.title.trim(),
      employeeName: input.employeeName.trim(),
      employeeEmail: input.employeeEmail.toLowerCase(),
      department: input.department,
      deviceType: input.deviceType,
      requestReason: input.requestReason.trim(),
      urgency: input.urgency,
      approvalStatus: APPROVAL.DRAFT,
      approverEmail: input.approverEmail.toLowerCase(),
      managerComment: "",
      requestDate: now.toISOString(),
      fulfillmentStatus: FULFILLMENT.NOT_STARTED,
      fulfilledByEmail: "",
      fulfilledDate: null,
      approvalRequested: false,
    },
  };
}

export function submitRequest(request, actorEmail) {
  if (!canEditRequest(request, actorEmail)) {
    throw new Error("Only the request owner can submit a draft");
  }
  return {
    ...request,
    approvalStatus: APPROVAL.PENDING,
    approvalRequested: false,
  };
}

export function decideRequest(request, managerEmail, decision, comment = "") {
  if (request.approvalStatus !== APPROVAL.PENDING) {
    throw new Error("Only pending requests can be decided");
  }
  if (request.approverEmail.toLowerCase() !== managerEmail.toLowerCase()) {
    throw new Error("Only assigned manager can decide request");
  }

  if (decision === "Approve") {
    return {
      ...request,
      approvalStatus: APPROVAL.APPROVED,
      managerComment: comment.trim(),
      fulfillmentStatus: FULFILLMENT.NOT_STARTED,
      approvalRequested: true,
    };
  }

  if (decision === "Reject") {
    if (!comment.trim()) {
      throw new Error("Rejection comment is required");
    }
    return {
      ...request,
      approvalStatus: APPROVAL.REJECTED,
      managerComment: comment.trim(),
      fulfillmentStatus: FULFILLMENT.NOT_APPLICABLE,
      approvalRequested: true,
    };
  }

  throw new Error("Decision must be Approve or Reject");
}

export function setFulfillmentStatus(request, itEmail, nextStatus, now = new Date()) {
  if (request.approvalStatus !== APPROVAL.APPROVED) {
    throw new Error("Only approved requests can enter fulfillment");
  }
  if (![FULFILLMENT.IN_PROGRESS, FULFILLMENT.COMPLETED].includes(nextStatus)) {
    throw new Error("Unsupported fulfillment status");
  }

  return {
    ...request,
    fulfillmentStatus: nextStatus,
    fulfilledByEmail: itEmail.toLowerCase(),
    fulfilledDate: nextStatus === FULFILLMENT.COMPLETED ? now.toISOString() : request.fulfilledDate,
  };
}

export function visibleRequestsForRole(requests, role, email) {
  const normalized = email.toLowerCase();

  if (role === "Employee") {
    return requests.filter(r => r.employeeEmail.toLowerCase() === normalized);
  }

  if (role === "Manager") {
    return requests.filter(r =>
      r.approverEmail.toLowerCase() === normalized &&
      r.approvalStatus === APPROVAL.PENDING
    );
  }

  if (role === "IT") {
    return requests.filter(r =>
      r.approvalStatus === APPROVAL.APPROVED &&
      r.fulfillmentStatus !== FULFILLMENT.COMPLETED
    );
  }

  return [];
}

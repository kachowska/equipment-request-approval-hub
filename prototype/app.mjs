import {
  APPROVAL, FULFILLMENT, createDraft, submitRequest, decideRequest,
  setFulfillmentStatus, visibleRequestsForRole
} from "./workflow.mjs";

const state = {
  currentRole: "Employee",
  currentEmail: "emma.employee@contoso.example",
  currentName: "Emma Employee",
  users: {
    Employee: { email: "emma.employee@contoso.example", name: "Emma Employee", manager: "maya.manager@contoso.example" },
    Manager: { email: "maya.manager@contoso.example", name: "Maya Manager" },
    IT: { email: "ivan.it@contoso.example", name: "Ivan IT" }
  },
  requests: []
};

const roleSelect = document.querySelector("#role");
const form = document.querySelector("#request-form");
const tableBody = document.querySelector("#request-rows");
const status = document.querySelector("#status");

function syncIdentity() {
  const user = state.users[state.currentRole];
  state.currentEmail = user.email;
  state.currentName = user.name;
  document.querySelector("#identity").textContent = `${state.currentRole}: ${state.currentName}`;
  document.querySelector("#new-request-panel").hidden = state.currentRole !== "Employee";
  render();
}

roleSelect.addEventListener("change", () => {
  state.currentRole = roleSelect.value;
  syncIdentity();
});

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const fd = new FormData(form);
  const employee = state.users.Employee;
  const result = createDraft({
    title: fd.get("title"),
    employeeName: employee.name,
    employeeEmail: employee.email,
    department: fd.get("department"),
    deviceType: fd.get("deviceType"),
    requestReason: fd.get("requestReason"),
    urgency: fd.get("urgency"),
    approverEmail: employee.manager
  });

  if (!result.ok) {
    status.textContent = Object.values(result.errors).join(" · ");
    return;
  }

  const submitted = submitRequest(result.request, employee.email);
  state.requests.unshift(submitted);
  form.reset();
  status.textContent = "Request submitted for approval.";
  render();
});

function render() {
  const visible = visibleRequestsForRole(state.requests, state.currentRole, state.currentEmail);
  tableBody.innerHTML = "";

  for (const request of visible) {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${request.title}</td>
      <td>${request.deviceType}</td>
      <td>${request.approvalStatus}</td>
      <td>${request.fulfillmentStatus}</td>
      <td class="actions"></td>
    `;
    const actions = tr.querySelector(".actions");

    if (state.currentRole === "Manager") {
      const approve = document.createElement("button");
      approve.textContent = "Approve";
      approve.addEventListener("click", () => {
        replaceRequest(decideRequest(request, state.currentEmail, "Approve", "Approved in local prototype."));
      });

      const reject = document.createElement("button");
      reject.textContent = "Reject";
      reject.addEventListener("click", () => {
        replaceRequest(decideRequest(request, state.currentEmail, "Reject", "Rejected in local prototype."));
      });

      actions.append(approve, reject);
    }

    if (state.currentRole === "IT") {
      if (request.fulfillmentStatus === FULFILLMENT.NOT_STARTED) {
        const start = document.createElement("button");
        start.textContent = "Start";
        start.addEventListener("click", () => {
          replaceRequest(setFulfillmentStatus(request, state.currentEmail, FULFILLMENT.IN_PROGRESS));
        });
        actions.append(start);
      } else if (request.fulfillmentStatus === FULFILLMENT.IN_PROGRESS) {
        const complete = document.createElement("button");
        complete.textContent = "Complete";
        complete.addEventListener("click", () => {
          replaceRequest(setFulfillmentStatus(request, state.currentEmail, FULFILLMENT.COMPLETED));
        });
        actions.append(complete);
      }
    }

    tableBody.append(tr);
  }
}

function replaceRequest(updated) {
  const idx = state.requests.findIndex(r => r.id === updated.id);
  state.requests[idx] = updated;
  render();
}

syncIdentity();

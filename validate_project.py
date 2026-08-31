from pathlib import Path
import json, csv, sys, re

ROOT = Path(__file__).parent
errors = []

required_files = [
    "README.md",
    "sharepoint/equipment-requests-schema.json",
    "sharepoint/app-roles-schema.json",
    "sharepoint/sample-equipment-requests.csv",
    "sharepoint/sample-app-roles.csv",
    "powerapps/app-map.md",
    "powerapps/formulas.md",
    "power-automate/approval-flow-spec.md",
    "prototype/workflow.mjs",
    "prototype/workflow.test.mjs",
    "qa/manual-test-cases.csv",
    "qa/uat-scenarios.md",
    "qa/traceability-matrix.csv",
    "docs/acceptance-criteria.md",
    "registry/pending-project-record.json",
]

for rel in required_files:
    if not (ROOT / rel).exists():
        errors.append(f"Missing file: {rel}")

schema = json.loads((ROOT / "sharepoint/equipment-requests-schema.json").read_text(encoding="utf-8"))
column_names = {c["name"] for c in schema["columns"]}
required_columns = {
    "EmployeeName","EmployeeEmail","Department","DeviceType","RequestReason","Urgency",
    "ApprovalStatus","ApproverEmail","ManagerComment","RequestDate","FulfillmentStatus",
    "FulfilledByEmail","FulfilledDate","ApprovalRequested"
}
missing_columns = required_columns - column_names
if missing_columns:
    errors.append(f"Missing SharePoint columns: {sorted(missing_columns)}")

with (ROOT / "qa/manual-test-cases.csv").open(encoding="utf-8", newline="") as f:
    rows = list(csv.DictReader(f))
if len(rows) < 20:
    errors.append(f"Only {len(rows)} manual test cases; expected at least 20")

uat_text = (ROOT / "qa/uat-scenarios.md").read_text(encoding="utf-8")
uat_count = len(re.findall(r"^## UAT-\d+", uat_text, flags=re.M))
if uat_count < 5:
    errors.append(f"Only {uat_count} UAT scenarios; expected at least 5")

acceptance_text = (ROOT / "docs/acceptance-criteria.md").read_text(encoding="utf-8")
acs = set(re.findall(r"AC-\d{2}", acceptance_text))
with (ROOT / "qa/traceability-matrix.csv").open(encoding="utf-8", newline="") as f:
    traced = {r["acceptance_criterion"] for r in csv.DictReader(f)}
missing_trace = acs - traced
if missing_trace:
    errors.append(f"Acceptance criteria without tests: {sorted(missing_trace)}")

record = json.loads((ROOT / "registry/pending-project-record.json").read_text(encoding="utf-8"))
if record.get("cv_eligible") is not False:
    errors.append("Pending project record must remain cv_eligible=false before tenant validation")

if errors:
    print("PROJECT VALIDATION: FAILED")
    for e in errors:
        print(" -", e)
    sys.exit(1)

print("PROJECT VALIDATION: PASSED")
print(f" - required files: {len(required_files)}")
print(f" - SharePoint required columns: {len(required_columns)}")
print(f" - manual test cases: {len(rows)}")
print(f" - UAT scenarios: {uat_count}")
print(f" - acceptance criteria traced: {len(acs)}")
print(" - registry gate: cv_eligible=false until tenant validation")

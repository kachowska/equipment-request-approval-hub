# Test report

## Local prototype

Execution date: 2026-08-31  
Runtime: Node.js built-in test runner

Command:

```bash
cd prototype
node --test workflow.test.mjs
```

Result:

- Tests: **17**
- Passed: **17**
- Failed: **0**
- Skipped: **0**

Validated local business rules include:

- request validation
- draft creation
- employee ownership checks
- submit transition
- assigned-manager approval
- rejection comment requirement
- IT fulfillment transitions
- employee/manager/IT queue filtering
- completed/rejected request exclusion

## Project structure validator

Command:

```bash
python validate_project.py
```

Result: **PASSED**

Validated:

- 15 required artifact files
- required SharePoint fields present
- 28 manual test cases
- 5 UAT scenarios
- 20 acceptance criteria covered by traceability
- registry guard remains `cv_eligible=false`

## Cloud Power Platform solution

Status: **NOT YET EXECUTED**

The following are not claimed as validated yet:

- real SharePoint list creation
- Power Apps publish
- Power Automate approval delivery
- Outlook/Teams notifications
- live SharePoint permissions
- live manual/UAT execution

### Completion gate

After tenant deployment, record:

- Tenant:
- Date:
- Tester:
- Passed:
- Failed:
- Blocked:
- Defects:
- Screenshot/evidence links:

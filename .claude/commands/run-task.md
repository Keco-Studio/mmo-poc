---
description: Execute a TaskSpec JSON with full scope enforcement and verification
argument-hint: <path to tasks/todo/task_XXXX_*.json>
---

# run-task

Execute a TaskSpec task with full scope enforcement and verification.

## Usage

```
/run-task <task-id>
```

Example: `/run-task task-008`

## Workflow

### Step 1: Read the TaskSpec

Locate and read the active TaskSpec JSON file from `.claude/tasks/`. Identify:
- `taskId` to execute
- `allowedFiles` scope boundaries
- `forbiddenFiles` scope boundaries
- `acceptance` criteria to verify
- `commands` to run for validation

### Step 2: Verify Scope Boundaries

Confirm the task's `allowedFiles` and `forbiddenFiles` before making any changes. Do not edit files outside `allowedFiles`.

### Step 3: Load Relevant Skills

If the task specifies `skills`, invoke them with the Skill tool before implementation.

### Step 4: Implement the Change

Make the smallest correct change within scope. Follow existing patterns in the codebase.

### Step 5: Run Validation Commands

Execute each command in the task's `commands` array. For each:
- Run the exact command specified
- Verify the `expectedOutput` appears in the result
- If a command fails, stop and report the failure

### Step 6: Check Acceptance Criteria

Verify all acceptance criteria are met:
- Build passes (`npm run build`)
- Validation passes (`npm run validate`)
- Tests pass (`npm run test`)
- Playtest passes when available (`npm run playtest`)

### Step 7: Scope Guard Check

Confirm no files outside `allowedFiles` were modified. Confirm no `forbiddenFiles` were touched.

### Step 8: Report Results

Summarize:
- Files changed (with paths)
- Validation results for each command
- Acceptance criteria status
- Any issues encountered

## Hard Rules

- **Scope compliance**: Never edit files outside `allowedFiles`. Never modify `forbiddenFiles`.
- **No skipping tests**: If tests fail, the task is not complete. Fix the failure, do not skip it.
- **No hidden errors**: Report all errors transparently. Do not suppress or ignore console errors.
- **No unscoped changes**: Changes must be confined to the task's filesystem scope.
- **No phase bleeding**: Do not implement work from future phases unless the TaskSpec explicitly asks.

## Example Usage

```
/run-task task-008
```

**Input:** TaskSpec with `task-008` defining:
- `allowedFiles`: `[".claude/commands/run-task.md"]`
- `forbiddenFiles`: `["**/*.json", "**/src/**"]`
- `commands`: `[{ "description": "Verify file created", "command": "test -f .claude/commands/run-task.md", "expectedOutput": "" }]`
- `acceptance`: `["Command file exists", "Command has usage example", "Command has workflow"]`

**Execution:**
1. Read TaskSpec, confirm task-008 scope
2. Verify `.claude/commands/run-task.md` is in allowedFiles
3. Create `.claude/commands/run-task.md` with required content
4. Run `test -f .claude/commands/run-task.md` - passes
5. Verify acceptance criteria met
6. Confirm no forbidden files were touched
7. Report success with file path and validation results

## Definition of Done

A task is done only when:
- All `commands` pass with expected output
- All `acceptance` criteria verified
- Scope guard confirms no out-of-scope changes
- Build passes
- Validation passes
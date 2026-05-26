---
description: Review the current git diff against the active TaskSpec scope before finalizing
---

# review-patch

Review changes against the active TaskSpec scope before finalizing.

## Usage

```
/review-patch
```

Review all uncommitted changes and verify they align with the active TaskSpec scope.

## Workflow

### Step 1: Identify Active TaskSpec

Locate the active TaskSpec JSON file from `.claude/tasks/`. Determine which task is currently being worked on by checking recent commits or the task context.

### Step 2: Get Uncommitted Changes

Run `git diff` and `git status` to identify all files that have been modified but not yet committed.

### Step 3: Load Scope Boundaries

From the active TaskSpec, extract:
- `allowedFiles` - files and patterns that are in scope
- `forbiddenFiles` - files and patterns that are explicitly out of scope
- `acceptance` criteria that must be met

### Step 4: Compare Changes Against Scope

For each modified file:
- Verify it falls within `allowedFiles` patterns
- Confirm it does not match any `forbiddenFiles` patterns
- Flag any out-of-scope files for review

### Step 5: Validate Changes Against Acceptance Criteria

Ensure the changes satisfy all acceptance criteria defined in the TaskSpec:
- Review code patterns and structure
- Verify all required functionality is implemented
- Check that no partial or incomplete work remains

### Step 6: Report Scope Compliance

Summarize:
- Files changed (with paths)
- Scope compliance status (all in-scope, any violations)
- Acceptance criteria alignment
- Any concerns or recommendations

## Example Usage

```
/review-patch
```

**Input:** Uncommitted changes to files:
- `.claude/commands/new-cmd.md`
- `.claude/skills/new-skill.md`

**Active TaskSpec:**
- `taskId`: `task-009`
- `allowedFiles`: `[".claude/commands/**", ".claude/skills/*.md"]`
- `forbiddenFiles`: `["**/src/**", "**/*.json"]`
- `acceptance`: `["Command created", "Skill created", "Both have usage examples"]`

**Execution:**
1. Identify task-009 as active TaskSpec
2. Run `git diff` to get modified files
3. Extract scope: commands/** and skills/*.md are allowed
4. Confirm `.claude/commands/new-cmd.md` matches `.claude/commands/**` - compliant
5. Confirm `.claude/skills/new-skill.md` matches `.claude/skills/*.md` - compliant
6. Verify both files have usage examples per acceptance criteria
7. Report: All files within scope, acceptance criteria satisfied

**Output:**
```
Scope Review Complete:
- Files changed: 2
- In scope: 2
- Out of scope: 0
- Acceptance: All criteria met
Status: READY FOR COMMIT
```
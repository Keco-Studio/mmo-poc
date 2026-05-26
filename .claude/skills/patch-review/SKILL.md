---
name: patch-review
description: Use before marking a task complete or committing - reviews the diff against the active TaskSpec's allowedFiles/forbiddenFiles, confirms acceptance criteria, flags unrelated changes, and writes the patch summary
---

# patch-review

Review changed files against the active TaskSpec scope, confirm acceptance criteria are met, identify unrelated changes, and write the patch summary.

## When to Use

Invoke this skill when:
- A task implementation is complete and all tests pass
- Before finalizing any development branch or claiming work is done
- When asked to review a patch or prepare a PR
- When verifying that changes align with the original requirements

## Inputs

| Input | Description |
|-------|-------------|
| `TaskSpec` | The active task specification (from `.claude/tasks/{taskId}/task.md` or equivalent) |
| `git diff` | Output of `git diff` showing all changes in the working directory |
| `build output` | Any build, lint, or test results relevant to the changes |
| `taskId` | (Optional) The task ID being reviewed |

## Workflow

### Step 1: Load the TaskSpec

Read the task specification for the active task. Identify:
- Original requirements and acceptance criteria
- Scope boundaries (what was in scope vs. out of scope)
- Any constraints or non-functional requirements

### Step 2: List All Changed Files

Run `git diff --name-only` to get a complete list of files modified in this session. Verify against the TaskSpec scope.

### Step 3: Diff-by-Diff Review

For each changed file:
1. Run `git diff <file>` to see the specific changes
2. Confirm the change is necessary for the task
3. Flag any changes that appear unrelated or excessive
4. Check for unintended side effects (modified tests, regenerated files)

### Step 4: Validate Against Acceptance Criteria

For each acceptance criterion in the TaskSpec:
- Confirm at least one change addresses it
- Verify the change is correct and complete
- Note any criteria that are not yet satisfied

### Step 5: Check for Unrelated Changes

Identify changes that:
- Modify files outside the task scope
- Include formatting or whitespace changes unrelated to the task
- Contain debug code, commented-out code, or TODO comments left behind
- Affect dependencies without justification

### Step 6: Review Test Coverage

Confirm:
- Relevant tests exist and pass
- New tests cover new behavior
- Tests are not mocked beyond necessity

### Step 7: Run Build Verification

Execute build commands as appropriate for the project:
```bash
# Example commands - adjust to project type
npm run build
npm test
# or equivalent for your project
```

### Step 8: Write Patch Summary

Produce a summary with:

```
## Patch Summary: {task name}

### Files Changed ({count})
- (list of files)

### Scope Verification
- [ ] All changes align with TaskSpec
- [ ] No unrelated changes detected
- [ ] Acceptance criteria addressed

### Recommendations
- (any concerns or suggestions)
```

## Checks

Use these validation criteria:

| Check | Description |
|-------|-------------|
| **Scope compliance** | Every changed file is necessary for the task |
| **Acceptance criteria met** | All criteria in TaskSpec have corresponding, correct changes |
| **No regressions** | Existing tests pass; no breaking changes |
| **Clean diff** | Minimal unrelated changes (formatting, whitespace, debug code) |
| **Test coverage** | Appropriate tests exist and pass for new behavior |
| **Build passes** | Project builds successfully without errors |
| **Documentation** | External docs (README, API docs) updated if behavior changed |

## Common Mistakes

Avoid these errors when reviewing patches:

1. **Approving scope creep** - Accepting changes that go beyond the TaskSpec without questioning them
2. **Ignoring unrelated changes** - Allowing formatting or cosmetic changes to mask the real changes
3. **Missing untested paths** - Not verifying that edge cases or error paths have test coverage
4. **Skipping the build** - Assuming the code works because tests pass, without running the full build
5. **Finalizing without review** - Claiming a task is complete without doing a diff-by-diff review

## Related Skills

- [rpg-task-spec](./rpg-task-spec/SKILL.md) - Define and manage TaskSpecs
- [verification-before-completion](./verification-before-completion/SKILL.md) - Verify work before claiming done
- [finishing-a-development-branch](./finishing-a-development-branch/SKILL.md) - Complete development work

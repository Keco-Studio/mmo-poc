---
name: rpg-task-spec
description: Use when a user request needs to be decomposed into a scoped TaskSpec JSON before implementation - turns ideas into tasks with allowedFiles, forbiddenFiles, acceptance criteria, and commands
---

# rpg-task-spec

Turn an idea into a scoped TaskSpec JSON file by decomposing a request into tasks with allowedFiles, forbiddenFiles, acceptance criteria, and commands.

## When to Use

**Invoke this skill when:**
- A user provides a feature request, bug report, or idea that needs to be planned before implementation
- You need to create a TaskSpec JSON file (`tasks/todo/*.json`) for a multi-step implementation
- The request is complex enough that scoping filesystem boundaries and acceptance criteria is needed
- You are starting work that has not yet been decomposed into implementable tasks

**Do NOT use this skill when:**
- The request is a single, trivial task that can be done in one step
- A TaskSpec JSON file already exists and you are just executing it
- The user is asking for a code review or debugging of existing code
- You are using a skill that already produces TaskSpec output (e.g., `superpowers:executing-plans`)

## Inputs

- **TaskSpec context**: Any prior TaskSpec files in `tasks/todo/` that are relevant
- **Spec docs**: Any requirements, design documents, or specifications the user has provided
- **Codebase state**: A working understanding of the current project structure and technology stack
- **User's idea**: The raw request or idea to be decomposed

## Workflow

### Step 1: Understand the Request

Clarify the user's goal. Ask focused questions to establish:
1. What is the user trying to accomplish?
2. What does success look like?
3. Are there any constraints (technology, deadline, scope)?

Do not proceed to decomposition until the request is clear.

### Step 2: Identify Scope Boundaries

Determine which files and directories are in scope for the implementation:

- **`allowedFiles`**: List specific files and patterns that are permitted to be modified (e.g., `["src/**/*.ts", "test/**/*.ts"]`)
- **`forbiddenFiles`**: List files and patterns that must NOT be modified (e.g., `["**/*.md", "**/vendor/**"]`)

Be specific. Broad wildcards should be justified by the task scope.

### Step 3: Decompose into Tasks

Break the implementation into sequential tasks. Each task should:
- Be completable in a single working session
- Have a clear filesystem scope subset
- Have a testable outcome

Number tasks sequentially (task-001, task-002, etc.).

### Step 4: Define Acceptance Criteria

For each task, define observable, testable acceptance criteria:

- **Code exists**: The required code is written and passes linting/typing if applicable
- **Tests pass**: New or existing tests cover the change and pass
- **Behavior verified**: Manual verification steps confirm expected behavior

Avoid vague criteria like "works" or "feature complete". Use concrete checks.

### Step 5: Specify Commands

For each task, define one or more commands to verify the task is complete:

- **Build/lint commands**: `npm run build`, `cargo check`, etc.
- **Test commands**: `npm test`, `pytest`, etc.
- **Manual commands**: Any manual verification steps with expected output

### Step 6: Write the TaskSpec JSON

Assemble the TaskSpec JSON file at `tasks/todo/<task-name>.json`:

```json
{
  "name": "<task-name>",
  "version": "1.0",
  "tasks": [
    {
      "id": "task-001",
      "title": "<human-readable title>",
      "allowedFiles": ["<pattern>"],
      "forbiddenFiles": ["<pattern>"],
      "acceptanceCriteria": [
        "<criterion 1>",
        "<criterion 2>"
      ],
      "commands": [
        {
          "description": "<what this command checks>",
          "command": "<exact command>",
          "expectedOutput": "<substring or pattern expected in output>"
        }
      ]
    }
  ]
}
```

## Validation Checks

Before considering the TaskSpec complete, verify:

1. Every task has at least one `allowedFiles` entry
2. Every task has at least one `acceptanceCriteria` entry
3. Every task has at least one `commands` entry with a concrete command
4. `forbiddenFiles` is non-empty or explicitly set to `[]` when scope is broad
5. The JSON is valid (parseable, no trailing commas, correct field types)
6. Task IDs are unique and follow the `task-XXX` naming pattern
7. Commands use correct syntax for the project's toolchain

## Common Mistakes

### Mistake 1: Vague Scope Boundaries
**Problem**: Using `["**/*"]` for allowedFiles without justification.
**Fix**: Be specific about which files/directories are relevant to the task. If everything is in scope, say so explicitly and explain why.

### Mistake 2: Missing Forbidden Files
**Problem**: Not declaring files that must not change, leading to accidental modifications.
**Fix**: Always list files that could be accidentally modified but are out of scope for this task.

### Mistake 3: Unverifiable Acceptance Criteria
**Problem**: Criteria like "feature works" or "code is correct" cannot be checked.
**Fix**: Define criteria that can be verified by a command or a clear manual step. Use concrete checks: "command X returns Y", "test Z passes", "file contains pattern P".

### Mistake 4: Tasks Too Large
**Problem**: A single task spans multiple concerns and cannot be completed in one session.
**Fix**: Break tasks into smaller units. If a task has more than 5 acceptance criteria, consider splitting it.

### Mistake 5: No Rollback Plan
**Problem**: If a task fails partway, there is no defined recovery path.
**Fix**: For significant changes, note in a task comment what to do if the task cannot be completed. "If task-003 fails, revert to task-002 state and re-assess scope."

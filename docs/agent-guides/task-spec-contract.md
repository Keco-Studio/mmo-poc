# TaskSpec Contract

Every implementation task should define:

- `taskId`
- `title`
- `phase`
- `intent`
- `description`
- `skills`
- `allowedFiles`
- `forbiddenFiles`
- `contextFiles`
- `acceptance`
- `commands`
- `maxAttempts`
- `outOfScope`

Claude should not edit files outside `allowedFiles`.

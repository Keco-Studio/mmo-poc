# Phase 3 Playtest Bot Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Formalize the playtest bot with a JSON report writer that summarizes test results, screenshots, and console errors after each test run.

**Architecture:** A report script reads Playwright test results from `test-results/` and `reports/`, aggregates screenshots and runtime state snapshots, and writes a structured JSON report. Tests already save screenshots and JSON state via `testInfo.attach`. The report script packages all of this into a single artifact.

**Tech Stack:** Node.js script (tsx), Playwright's built-in test reporting, `fs` for file reading.

---

## Existing Test Infrastructure

- `tests/playtest/game.spec.ts` — opens game, checks canvas and state, captures console errors
- `tests/playtest/npc-dialogue.spec.ts` — moves near Verdant, opens dialogue, saves screenshot to `reports/npc-dialogue.png`, attaches JSON state
- `playwright.config.ts` — base URL 127.0.0.1:5173, webServer auto-starts dev
- `package.json` scripts: `playtest` runs `playwright test`

## Files to Create

- `scripts/write-playtest-report.ts` — generates `reports/playtest-report.json` from test-results and reports/
- `reports/.gitkeep` — ensures reports/ is tracked

## Task 0024: JSON Report Writer

**Files:**
- Create: `scripts/write-playtest-report.ts`
- Modify: `package.json`
- Test: `npm run playtest && npm run report`

### Step 1: Create the report script

Create `scripts/write-playtest-report.ts`:

```typescript
import * as fs from 'fs';
import * as path from 'path';

const REPORTS_DIR = path.resolve('reports');
const TEST_RESULTS_DIR = path.resolve('test-results');

interface TestResult {
  name: string;
  passed: boolean;
  duration: number;
  errors: string[];
  screenshot?: string;
  state?: object;
}

interface PlaytestReport {
  generated: string;
  totalTests: number;
  passed: number;
  failed: number;
  tests: TestResult[];
}

function readDirEntries(dir: string, ext: string): string[] {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir).filter(f => f.endsWith(ext));
}

function parseTestResults(): TestResult[] {
  const results: TestResult[] = [];
  if (!fs.existsSync(TEST_RESULTS_DIR)) return results;

  for (const testDir of fs.readdirSync(TEST_RESULTS_DIR)) {
    const testPath = path.join(TEST_RESULTS_DIR, testDir);
    if (!fs.statSync(testPath).isDirectory()) continue;

    const resultsFile = path.join(testPath, 'test-results.xml');
    if (!fs.existsSync(resultsFile)) continue;

    const xml = fs.readFileSync(resultsFile, 'utf-8');
    const passed = !xml.includes('failure') && !xml.includes('error');

    const errorsFile = path.join(testPath, 'errors.txt');
    const errors: string[] = [];
    if (fs.existsSync(errorsFile)) {
      const errContent = fs.readFileSync(errorsFile, 'utf-8');
      errContent.split('\n').forEach(line => { if (line.trim()) errors.push(line.trim()); });
    }

    // Find attached screenshot and state
    const screenshotFiles = readDirEntries(path.join(testPath, 'attachments'), '.png');
    const stateFiles = readDirEntries(path.join(testPath, 'attachments'), '.json');

    results.push({
      name: testDir.replace(/--/g, ' ').replace(/chromium/g, '').trim(),
      passed,
      duration: 0,
      errors,
      screenshot: screenshotFiles[0],
      state: stateFiles[0] ? JSON.parse(fs.readFileSync(path.join(testPath, 'attachments', stateFiles[0]), 'utf-8')) : undefined,
    });
  }
  return results;
}

function writeReport(): void {
  const tests = parseTestResults();
  const passed = tests.filter(t => t.passed).length;
  const failed = tests.filter(t => !t.passed).length;

  const report: PlaytestReport = {
    generated: new Date().toISOString(),
    totalTests: tests.length,
    passed,
    failed,
    tests,
  };

  fs.mkdirSync(REPORTS_DIR, { recursive: true });
  const reportPath = path.join(REPORTS_DIR, 'playtest-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(`Playtest report written: ${reportPath}`);
  console.log(`Total: ${tests.length} | Passed: ${passed} | Failed: ${failed}`);
}

writeReport();
```

### Step 2: Add report script to package.json

Read `package.json`, add:

```json
"report": "tsx scripts/write-playtest-report.ts"
```

### Step 3: Verify report directory exists

Run: `ls reports/`
Expected: shows `npc-dialogue.png` from previous test runs

### Step 4: Run the report script

Run: `npm run report`
Expected: `reports/playtest-report.json` created, console shows total/passed/failed counts

### Step 5: Verify report has correct structure

Run: `cat reports/playtest-report.json | node -e "const d=JSON.parse(require('fs').readFileSync('/dev/stdin','utf-8')); console.log('total:', d.totalTests, 'passed:', d.passed, 'failed:', d.failed, 'tests:', d.tests.length)"`
Expected: `total: 2 passed: 2 failed: 0 tests: 2`

### Step 6: Commit

```bash
git add scripts/write-playtest-report.ts reports/.gitkeep package.json
git commit -m "$(cat <<'EOF'
feat: add JSON playtest report writer (Phase 3 Task 0024)

scripts/write-playtest-report.ts reads test-results/ and attachments/
to produce a structured reports/playtest-report.json with test names,
pass/fail status, errors, screenshots, and runtime state snapshots.

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>
EOF
)"
```

---

## Verification Commands

After Task 0024:
- `npm run build` — must pass
- `npm run playtest` — must pass (2/2)
- `npm run report` — must produce `reports/playtest-report.json`
- Report JSON must have `totalTests`, `passed`, `failed`, `tests[]` with `name`, `passed`, `errors`

## Out of Scope

- HTML report generation (Phase 8 Workbench UI handles that)
- Integrating report into CI pipeline
- Auto-opening report after tests
- Test result trending/history
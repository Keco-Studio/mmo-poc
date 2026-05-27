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

function parseTestResults(): TestResult[] {
  const results: TestResult[] = [];
  if (!fs.existsSync(TEST_RESULTS_DIR)) return results;

  for (const testDir of fs.readdirSync(TEST_RESULTS_DIR)) {
    const testPath = path.join(TEST_RESULTS_DIR, testDir);
    if (!fs.statSync(testPath).isDirectory()) continue;

    const attachmentsDir = path.join(testPath, 'attachments');
    const screenshotFiles = fs.existsSync(attachmentsDir)
      ? fs.readdirSync(attachmentsDir).filter(f => f.endsWith('.png'))
      : [];
    const stateFiles = fs.existsSync(attachmentsDir)
      ? fs.readdirSync(attachmentsDir).filter(f => f.endsWith('.json'))
      : [];

    const resultsFile = path.join(testPath, 'test-results.xml');
    const passed = !fs.existsSync(resultsFile) ? true :
      !fs.readFileSync(resultsFile, 'utf-8').includes('<failure');

    const errorsFile = path.join(testPath, 'errors.txt');
    const errors: string[] = [];
    if (fs.existsSync(errorsFile)) {
      fs.readFileSync(errorsFile, 'utf-8').split('\n').forEach(line => {
        if (line.trim()) errors.push(line.trim());
      });
    }

    let state: object | undefined;
    if (stateFiles.length > 0) {
      try {
        state = JSON.parse(fs.readFileSync(path.join(attachmentsDir, stateFiles[0]), 'utf-8'));
      } catch { /* skip malformed JSON */ }
    }

    results.push({
      name: testDir.replace(/--/g, ' ').replace(/chromium/g, '').trim(),
      passed,
      duration: 0,
      errors,
      screenshot: screenshotFiles[0],
      state,
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
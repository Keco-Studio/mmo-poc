import * as fs from 'fs';
import * as path from 'path';

const PATCH_HISTORY_DIR = path.resolve('.claude/patch-history');
const REPORT_FILE = path.resolve('reports/playtest-report.json');

interface PatchSummary {
  timestamp: string;
  commit?: string;
  testRun: string;
  rootCause: string;
  affectedFiles: string[];
  fix: string;
}

function getLastCommit(): string | undefined {
  try {
    return require('child_process').execSync('git rev-parse --short HEAD', { encoding: 'utf-8' }).trim();
  } catch { return undefined; }
}

export function writePatchSummary(rootCause: string, affectedFiles: string[], fix: string): void {
  const report = fs.existsSync(REPORT_FILE) ? JSON.parse(fs.readFileSync(REPORT_FILE, 'utf-8')) : {};
  const summary: PatchSummary = {
    timestamp: new Date().toISOString(),
    commit: getLastCommit(),
    testRun: report.generated ?? 'unknown',
    rootCause,
    affectedFiles,
    fix,
  };
  fs.mkdirSync(PATCH_HISTORY_DIR, { recursive: true });
  const fileName = `patch-${Date.now()}.json`;
  fs.writeFileSync(path.join(PATCH_HISTORY_DIR, fileName), JSON.stringify(summary, null, 2));
  console.log(`Patch summary written: ${PATCH_HISTORY_DIR}/${fileName}`);
}
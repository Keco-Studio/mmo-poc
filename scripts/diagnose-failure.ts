import * as fs from 'fs';
import * as path from 'path';

const TEST_RESULTS_DIR = path.resolve('test-results');

interface Diagnosis {
  rootCause: string;
  affectedFiles: string[];
  suggestedFix: string;
}

function diagnose(): Diagnosis | null {
  if (!fs.existsSync(TEST_RESULTS_DIR)) return null;

  for (const entry of fs.readdirSync(TEST_RESULTS_DIR)) {
    const errorsFile = path.join(TEST_RESULTS_DIR, entry, 'errors.txt');
    if (!fs.existsSync(errorsFile)) continue;
    const errors = fs.readFileSync(errorsFile, 'utf-8');

    if (errors.includes('Error during scene initialization')) {
      return {
        rootCause: 'scene initialization failure',
        affectedFiles: ['src/game/VillageScene.ts', 'src/world/MapRenderer.ts', 'src/actors/Verdant.ts'],
        suggestedFix: 'Check asset loading paths and async/await in onInitialize. Ensure ImageSource paths use /assets/ prefix and files exist in public/.',
      };
    }
    if (errors.includes('Expected blob') && errors.includes('image')) {
      return {
        rootCause: 'asset path not served correctly',
        affectedFiles: ['src/world/MapRenderer.ts', 'src/actors/Verdant.ts'],
        suggestedFix: 'ImageSource path must use /assets/ prefix (Vite public dir). Verify PNGs exist in public/assets/.',
      };
    }
    if (errors.includes('TypeError') || errors.includes('undefined is not')) {
      return {
        rootCause: 'runtime null reference',
        affectedFiles: [],
        suggestedFix: 'Check for uninitialized class members or missing await calls.',
      };
    }
  }
  return null;
}

const diag = diagnose();
if (diag) {
  console.log('Root cause:', diag.rootCause);
  console.log('Affected files:', diag.affectedFiles.join(', '));
  console.log('Suggested fix:', diag.suggestedFix);
}
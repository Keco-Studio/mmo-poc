import * as fs from 'fs';
import * as path from 'path';
import { PNG } from 'pngjs';

interface QAIssue {
  file: string;
  severity: 'error' | 'warning';
  message: string;
}

interface AssetQAReport {
  generated: string;
  totalAssets: number;
  issues: QAIssue[];
  summary: { errors: number; warnings: number };
}

const ASSETS_DIR = path.resolve('assets');
const issues: QAIssue[] = [];

function validateCharacterManifest(filePath: string): void {
  const content = fs.readFileSync(filePath, 'utf-8');
  const manifest = JSON.parse(content);
  const pngPath = path.resolve(path.dirname(filePath), manifest.image);

  if (!fs.existsSync(pngPath)) {
    issues.push({ file: pngPath, severity: 'error', message: 'Image file not found' });
    return;
  }

  const pngData = fs.readFileSync(pngPath);
  const png = PNG.sync.read(pngData);
  const expectedW = manifest.frameWidth;
  const expectedH = manifest.frameHeight;

  if (png.width % expectedW !== 0) {
    issues.push({ file: pngPath, severity: 'warning', message: `Image width ${png.width} not evenly divisible by frameWidth ${expectedW}` });
  }
  if (png.height % expectedH !== 0) {
    issues.push({ file: pngPath, severity: 'warning', message: `Image height ${png.height} not evenly divisible by frameHeight ${expectedH}` });
  }

  const totalFrames = manifest.animations
    ? Object.values(manifest.animations as Record<string, {frames:number[]}>).flatMap(a => a.frames)
    : [];
  const maxFrame = Math.max(0, ...totalFrames);
  const framesPerRow = Math.floor(png.width / expectedW);
  const totalAvailable = Math.floor(png.width / expectedW) * Math.floor(png.height / expectedH);
  if (maxFrame >= totalAvailable) {
    issues.push({ file: pngPath, severity: 'error', message: `Animation references frame ${maxFrame} but only ${totalAvailable} frames available (${framesPerRow} cols x ${Math.floor(png.height/expectedH)} rows)` });
  }

  const frameW = Math.min(expectedW, png.width);
  const frameH = Math.min(expectedH, png.height);
  const firstFrameData = png.data.subarray(0, frameW * frameH * 4);
  const hasAnyOpaquePixel = firstFrameData.some((v, i) => i % 4 !== 3 && v > 0);
  if (png.width >= expectedW && png.height >= expectedH && !hasAnyOpaquePixel) {
    issues.push({ file: pngPath, severity: 'warning', message: `First frame appears empty (no opaque pixels)` });
  }
}

function validateTilesetManifest(filePath: string): void {
  const content = fs.readFileSync(filePath, 'utf-8');
  const manifest = JSON.parse(content);
  const pngPath = path.resolve(path.dirname(filePath), manifest.image);

  if (!fs.existsSync(pngPath)) {
    issues.push({ file: pngPath, severity: 'error', message: 'Image file not found' });
    return;
  }

  const pngData = fs.readFileSync(pngPath);
  const png = PNG.sync.read(pngData);
  const cols = Math.floor(png.width / manifest.tileWidth);
  const rows = Math.floor(png.height / manifest.tileHeight);

  for (const [tileName, tileInfo] of Object.entries(manifest.tiles as Record<string, {frame:number}>)) {
    if (tileInfo.frame >= cols * rows) {
      issues.push({ file: pngPath, severity: 'error', message: `Tile "${tileName}" references frame ${tileInfo.frame} but only ${cols * rows} frames exist (${cols}x${rows})` });
    }
  }
}

const report: AssetQAReport = {
  generated: new Date().toISOString(),
  totalAssets: 0,
  issues: [],
  summary: { errors: 0, warnings: 0 },
};

for (const manifestFile of fs.readdirSync(path.join(ASSETS_DIR, 'characters')).filter(f => f.endsWith('.manifest.json'))) {
  validateCharacterManifest(path.join(ASSETS_DIR, 'characters', manifestFile));
  report.totalAssets++;
}

for (const manifestFile of fs.readdirSync(path.join(ASSETS_DIR, 'tilesets')).filter(f => f.endsWith('.manifest.json'))) {
  validateTilesetManifest(path.join(ASSETS_DIR, 'tilesets', manifestFile));
  report.totalAssets++;
}

report.issues = issues;
report.summary.errors = issues.filter(i => i.severity === 'error').length;
report.summary.warnings = issues.filter(i => i.severity === 'warning').length;

fs.mkdirSync(path.resolve('reports'), { recursive: true });
fs.writeFileSync(path.resolve('reports', 'asset-qa-report.json'), JSON.stringify(report, null, 2));

console.log(`Asset QA Report`);
console.log(`Total assets: ${report.totalAssets}`);
console.log(`Errors: ${report.summary.errors}`);
console.log(`Warnings: ${report.summary.warnings}`);
if (issues.length) {
  issues.forEach(i => console.log(`  [${i.severity}] ${i.file}: ${i.message}`));
}

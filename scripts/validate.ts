import * as fs from 'fs';
import * as path from 'path';

const ASSETS_DIR = path.resolve('assets');
const MAP_FILE = path.resolve('src/data/map.json');

let errors = 0;

function validateCharacterManifest(filePath: string): void {
  const content = fs.readFileSync(filePath, 'utf-8');
  let manifest: Record<string, unknown>;

  try {
    manifest = JSON.parse(content);
  } catch {
    console.error(`FAIL: ${filePath} - invalid JSON`);
    errors++;
    return;
  }

  const required = ['id', 'type', 'image', 'frameWidth', 'frameHeight', 'anchor', 'animations'];
  for (const key of required) {
    if (!(key in manifest)) {
      console.error(`FAIL: ${filePath} - missing required field "${key}"`);
      errors++;
    }
  }

  if (manifest.type !== 'character') {
    console.error(`FAIL: ${filePath} - type must be "character"`);
    errors++;
  }

  const img = manifest.image as string;
  if (!img || img.trim() === '') {
    console.error(`FAIL: ${filePath} - image path is empty`);
    errors++;
  } else {
    const imgPath = path.resolve(path.dirname(filePath), img);
    if (!fs.existsSync(imgPath)) {
      console.error(`FAIL: ${filePath} - image not found: ${imgPath}`);
      errors++;
    }
  }

  const fw = manifest.frameWidth as number;
  const fh = manifest.frameHeight as number;
  if (typeof fw !== 'number' || fw <= 0 || !Number.isInteger(fw)) {
    console.error(`FAIL: ${filePath} - frameWidth must be positive integer`);
    errors++;
  }
  if (typeof fh !== 'number' || fh <= 0 || !Number.isInteger(fh)) {
    console.error(`FAIL: ${filePath} - frameHeight must be positive integer`);
    errors++;
  }

  const anims = manifest.animations as Record<string, unknown> | undefined;
  if (anims) {
    for (const [name, anim] of Object.entries(anims)) {
      if (!name || name.trim() === '') {
        console.error(`FAIL: ${filePath} - empty animation name`);
        errors++;
      }
      const a = anim as Record<string, unknown>;
      if (!a.frames || !Array.isArray(a.frames) || a.frames.length === 0) {
        console.error(`FAIL: ${filePath} - animation "${name}" missing or empty frames array`);
        errors++;
      }
      if (typeof a.fps !== 'number' || a.fps <= 0) {
        console.error(`FAIL: ${filePath} - animation "${name}" fps must be positive number`);
        errors++;
      }
    }
  }
}

function validateTilesetManifest(filePath: string): void {
  const content = fs.readFileSync(filePath, 'utf-8');
  let manifest: Record<string, unknown>;

  try {
    manifest = JSON.parse(content);
  } catch {
    console.error(`FAIL: ${filePath} - invalid JSON`);
    errors++;
    return;
  }

  const required = ['id', 'type', 'image', 'tileWidth', 'tileHeight', 'tiles'];
  for (const key of required) {
    if (!(key in manifest)) {
      console.error(`FAIL: ${filePath} - missing required field "${key}"`);
      errors++;
    }
  }

  if (manifest.type !== 'tileset') {
    console.error(`FAIL: ${filePath} - type must be "tileset"`);
    errors++;
  }

  const img = manifest.image as string;
  if (!img || img.trim() === '') {
    console.error(`FAIL: ${filePath} - image path is empty`);
    errors++;
  } else {
    const imgPath = path.resolve(path.dirname(filePath), img);
    if (!fs.existsSync(imgPath)) {
      console.error(`FAIL: ${filePath} - image not found: ${imgPath}`);
      errors++;
    }
  }

  const tw = manifest.tileWidth as number;
  const th = manifest.tileHeight as number;
  if (typeof tw !== 'number' || tw <= 0 || !Number.isInteger(tw)) {
    console.error(`FAIL: ${filePath} - tileWidth must be positive integer`);
    errors++;
  }
  if (typeof th !== 'number' || th <= 0 || !Number.isInteger(th)) {
    console.error(`FAIL: ${filePath} - tileHeight must be positive integer`);
    errors++;
  }

  const tiles = manifest.tiles as Record<string, unknown> | undefined;
  if (tiles) {
    for (const [name, tile] of Object.entries(tiles)) {
      if (!name || name.trim() === '') {
        console.error(`FAIL: ${filePath} - empty tile name`);
        errors++;
      }
      const t = tile as Record<string, unknown>;
      if (typeof t.frame !== 'number' || !Number.isInteger(t.frame) || t.frame < 0) {
        console.error(`FAIL: ${filePath} - tile "${name}" frame must be non-negative integer`);
        errors++;
      }
      if (typeof t.blocked !== 'boolean') {
        console.error(`FAIL: ${filePath} - tile "${name}" blocked must be boolean`);
        errors++;
      }
    }
  }
}

function validateMapTileReferences(): void {
  const content = fs.readFileSync(MAP_FILE, 'utf-8');
  const map = JSON.parse(content);

  const tilesetFiles = [
    path.resolve(ASSETS_DIR, 'tilesets/village.manifest.json'),
  ];

  const tilesByManifest: Record<string, Record<string, unknown>> = {};
  for (const mf of tilesetFiles) {
    if (!fs.existsSync(mf)) continue;
    const manifest = JSON.parse(fs.readFileSync(mf, 'utf-8'));
    tilesByManifest[mf] = manifest.tiles as Record<string, unknown>;
  }

  const legend = map.legend as Record<string, { tile: string }>;
  for (const [sym, info] of Object.entries(legend)) {
    const tileName = info.tile;
    if (!tileName) {
      console.error(`FAIL: ${MAP_FILE} - legend symbol "${sym}" missing tile key`);
      errors++;
      continue;
    }
    let found = false;
    for (const [, tiles] of Object.entries(tilesByManifest)) {
      if (tileName in tiles) { found = true; break; }
    }
    if (!found) {
      console.error(`FAIL: ${MAP_FILE} - tile "${tileName}" not found in any tileset manifest`);
      errors++;
    }
  }
}

console.log('Validating asset manifests...\n');

// Character manifests
const charDir = path.resolve(ASSETS_DIR, 'characters');
if (fs.existsSync(charDir)) {
  for (const file of fs.readdirSync(charDir)) {
    if (file.endsWith('.manifest.json')) {
      validateCharacterManifest(path.resolve(charDir, file));
    }
  }
}

// Tileset manifests
const tileDir = path.resolve(ASSETS_DIR, 'tilesets');
if (fs.existsSync(tileDir)) {
  for (const file of fs.readdirSync(tileDir)) {
    if (file.endsWith('.manifest.json')) {
      validateTilesetManifest(path.resolve(tileDir, file));
    }
  }
}

// Map tile references
console.log('Validating map tile references...');
validateMapTileReferences();

console.log('');
if (errors === 0) {
  console.log('All manifests valid.');
} else {
  console.error(`${errors} validation error${errors > 1 ? 's' : ''} found.`);
  process.exit(1);
}
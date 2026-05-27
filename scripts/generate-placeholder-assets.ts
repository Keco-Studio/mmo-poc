import { PNG } from 'pngjs';
import * as fs from 'fs';
import * as path from 'path';

const ASSETS = path.resolve('assets');

// Verdant: 32x32 single-frame green placeholder
const verdantPng = new PNG({ width: 32, height: 32, filterType: -1 });
for (let y = 0; y < 32; y++) {
  for (let x = 0; x < 32; x++) {
    const idx = (y * 32 + x) << 2;
    verdantPng.data[idx] = 70;    // R
    verdantPng.data[idx + 1] = 210; // G
    verdantPng.data[idx + 2] = 120; // B
    verdantPng.data[idx + 3] = 255; // A
  }
}
fs.writeFileSync(path.join(ASSETS, 'characters', 'verdant.png'), PNG.sync.write(verdantPng));
console.log('Created assets/characters/verdant.png');

// Verdant manifest
const verdantManifest = {
  id: 'verdant',
  type: 'character',
  image: './verdant.png',
  frameWidth: 32,
  frameHeight: 32,
  anchor: { x: 0.5, y: 1 },
  animations: {
    'idle-down': { frames: [0], fps: 1 },
    'talk-down': { frames: [0, 1], fps: 2 }
  }
};
fs.writeFileSync(
  path.join(ASSETS, 'characters', 'verdant.manifest.json'),
  JSON.stringify(verdantManifest, null, 2) + '\n'
);
console.log('Created assets/characters/verdant.manifest.json');

// Village tileset: 160x40 (4 tiles at 40x40)
// Tile 0 = grass (green), 1 = path (tan), 2 = water (blue), 3 = wall (brown)
const TILE_W = 40;
const TILE_H = 40;
const COLS = 4;
const villagePng = new PNG({ width: TILE_W * COLS, height: TILE_H, filterType: -1 });

const tileColors: [number, number, number][] = [
  [50, 120, 50],   // grass
  [160, 130, 80],  // path
  [40, 80, 180],   // water
  [120, 80, 40]    // wall
];

for (let tile = 0; tile < COLS; tile++) {
  const [r, g, b] = tileColors[tile];
  for (let y = 0; y < TILE_H; y++) {
    for (let x = 0; x < TILE_W; x++) {
      const px = tile * TILE_W + x;
      const idx = (y * villagePng.width + px) << 2;
      villagePng.data[idx] = r;
      villagePng.data[idx + 1] = g;
      villagePng.data[idx + 2] = b;
      villagePng.data[idx + 3] = 255;
    }
  }
}
fs.writeFileSync(path.join(ASSETS, 'tilesets', 'village.png'), PNG.sync.write(villagePng));
console.log('Created assets/tilesets/village.png');

// Village manifest
const villageManifest = {
  id: 'village',
  type: 'tileset',
  image: './village.png',
  tileWidth: TILE_W,
  tileHeight: TILE_H,
  tiles: {
    grass: { frame: 0, blocked: false },
    path:  { frame: 1, blocked: false },
    water: { frame: 2, blocked: true  },
    wall:  { frame: 3, blocked: true  }
  }
};
fs.writeFileSync(
  path.join(ASSETS, 'tilesets', 'village.manifest.json'),
  JSON.stringify(villageManifest, null, 2) + '\n'
);
console.log('Created assets/tilesets/village.manifest.json');

console.log('\nAll placeholder assets generated.');
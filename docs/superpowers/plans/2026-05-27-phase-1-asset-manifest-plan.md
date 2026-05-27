# Phase 1 Asset Manifest System Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace hardcoded Verdant and map visuals with manifest-driven placeholder assets, plus validation and TaskSpecs for the asset workflow.

**Architecture:** Phase 1 uses static placeholder PNG assets and JSON manifests committed to the repo. Runtime code imports manifest JSON and asset URLs through Vite, then small loader helpers convert named manifest entries into Excalibur graphics. Validation is a Node script that checks manifest shape, referenced files, positive dimensions, and map tile references.

**Tech Stack:** TypeScript, Vite asset imports, Excalibur.js, Node.js scripts, JSON manifests, Playwright

---

## File Map

```text
docs/agent-guides/asset-manifest-contract.md
  Contract docs for character and tileset manifest JSON.

tasks/todo/task_0011_asset_manifest_contract.json
  TaskSpec for the contract task itself.

tasks/todo/task_0012_placeholder_assets.json
  TaskSpec for placeholder PNGs + manifest files.

tasks/todo/task_0013_manifest_loader.json
  TaskSpec for loader helpers.

tasks/todo/task_0014_render_assets_from_manifests.json
  TaskSpec for runtime integration.

tasks/todo/task_0015_manifest_validation.json
  TaskSpec for validation command.

assets/characters/verdant.png
assets/characters/verdant.manifest.json
assets/tilesets/village.png
assets/tilesets/village.manifest.json
  Generated placeholder art and manifests.

scripts/generate-placeholder-assets.ts
  Regenerates placeholder PNG files from embedded base64.

src/assets/manifestTypes.ts
  Runtime TypeScript types for manifests.

src/assets/AssetManifestLoader.ts
  Excalibur helpers for loading textures and creating named graphics.

src/actors/Verdant.ts
  Uses Verdant manifest and named animation/sprite keys instead of a hardcoded color rectangle.

src/world/MapRenderer.ts
  Uses village tileset manifest instead of hardcoded tile colors.

src/data/map.json
  Keeps map symbols but each symbol maps to manifest tile keys.

scripts/validate.ts
  Validates asset manifests and map tile keys.

package.json
  Adds validate script and placeholder asset generation script.

tsconfig.json
  Includes scripts so validation/generation code typechecks.
```

---

## Task 0011: Asset Manifest Contract + TaskSpecs

**Files:**
- Create: `docs/agent-guides/asset-manifest-contract.md`
- Create: `tasks/todo/task_0011_asset_manifest_contract.json`
- Create: `tasks/todo/task_0012_placeholder_assets.json`
- Create: `tasks/todo/task_0013_manifest_loader.json`
- Create: `tasks/todo/task_0014_render_assets_from_manifests.json`
- Create: `tasks/todo/task_0015_manifest_validation.json`

- [ ] **Step 1: Create asset manifest contract doc**

Write `docs/agent-guides/asset-manifest-contract.md`:

```md
# Asset Manifest Contract

Asset manifests make sprites and tilesets replaceable without runtime code changes.

## Character Manifest

A character manifest describes one sprite sheet and named animations.

```json
{
  "id": "verdant",
  "type": "character",
  "image": "./verdant.png",
  "frameWidth": 32,
  "frameHeight": 32,
  "anchor": { "x": 0.5, "y": 1 },
  "animations": {
    "idle-down": { "frames": [0], "fps": 1 },
    "talk-down": { "frames": [0, 1], "fps": 2 }
  }
}
```

Rules:

- `id` is a stable lowercase identifier.
- `type` must be `character`.
- `image` is a relative path from the manifest to the image file.
- `frameWidth` and `frameHeight` are positive integers.
- `anchor.x` and `anchor.y` are normalized values from 0 to 1.
- `animations` is keyed by names like `idle-down`; actor code uses these names.
- Animation frame numbers live only in the manifest.

## Tileset Manifest

A tileset manifest maps tile names to sprite frames and collision metadata.

```json
{
  "id": "village",
  "type": "tileset",
  "image": "./village.png",
  "tileWidth": 40,
  "tileHeight": 40,
  "tiles": {
    "grass": { "frame": 0, "blocked": false },
    "path": { "frame": 1, "blocked": false },
    "water": { "frame": 2, "blocked": true },
    "wall": { "frame": 3, "blocked": true }
  }
}
```

Rules:

- `type` must be `tileset`.
- `image` is a relative path from the manifest to the image file.
- `tileWidth` and `tileHeight` are positive integers.
- `tiles` keys are semantic names used by map data.
- Rendering uses tile names, not colors or frame numbers in code.
- Collision may derive blocked behavior from the manifest or from map legend entries that reference manifest tile names.

## Validation Expectations

`npm run validate` must check:

- Manifest JSON parses.
- Required fields exist.
- Referenced image files exist.
- Dimensions are positive integers.
- Animation names and tile names are non-empty.
- `src/data/map.json` legend entries refer to tile names present in `assets/tilesets/village.manifest.json`.

Validation does not inspect image pixels. Pixel QA belongs to Phase 7.
```

- [ ] **Step 2: Create task_0011 TaskSpec**

Write `tasks/todo/task_0011_asset_manifest_contract.json`:

```json
{
  "taskId": "task_0011_asset_manifest_contract",
  "title": "Document asset manifest contract",
  "phase": "Phase 1",
  "intent": "spec",
  "description": "Document the character and tileset manifest shapes used by Phase 1 asset work.",
  "skills": ["rpg-task-spec", "patch-review"],
  "allowedFiles": [
    "docs/agent-guides/asset-manifest-contract.md",
    "tasks/todo/task_0011_asset_manifest_contract.json",
    "tasks/todo/task_0012_placeholder_assets.json",
    "tasks/todo/task_0013_manifest_loader.json",
    "tasks/todo/task_0014_render_assets_from_manifests.json",
    "tasks/todo/task_0015_manifest_validation.json"
  ],
  "forbiddenFiles": ["src/**", "server/**", "assets/**", "tests/**"],
  "contextFiles": [
    "docs/superpowers/specs/2026-05-27-phase-1-asset-manifest-design.md",
    "AI_NPC_Village_DevKit_Claude_Code_Native_Spec_v0.3.md"
  ],
  "acceptance": [
    "Asset manifest contract document exists",
    "TaskSpecs 0011-0015 exist under tasks/todo/",
    "All TaskSpecs are valid JSON"
  ],
  "commands": ["node -e \"for (const f of require('fs').readdirSync('tasks/todo')) JSON.parse(require('fs').readFileSync('tasks/todo/'+f,'utf8')); console.log('valid')\""],
  "maxAttempts": 2,
  "outOfScope": ["Do not implement runtime loaders", "Do not create asset files", "Do not modify game code"]
}
```

- [ ] **Step 3: Create task_0012 TaskSpec**

Write `tasks/todo/task_0012_placeholder_assets.json`:

```json
{
  "taskId": "task_0012_placeholder_assets",
  "title": "Generate placeholder asset PNGs and manifests",
  "phase": "Phase 1",
  "intent": "asset",
  "description": "Add placeholder Verdant and village tileset PNG files plus manifests and a reproducible generator script.",
  "skills": ["asset-manifest", "patch-review"],
  "allowedFiles": [
    "assets/characters/verdant.png",
    "assets/characters/verdant.manifest.json",
    "assets/tilesets/village.png",
    "assets/tilesets/village.manifest.json",
    "scripts/generate-placeholder-assets.ts",
    "package.json"
  ],
  "forbiddenFiles": ["src/**", "server/**", "tests/**"],
  "contextFiles": ["docs/agent-guides/asset-manifest-contract.md"],
  "acceptance": [
    "Placeholder PNGs exist under assets/characters and assets/tilesets",
    "Verdant and village manifest JSON files exist",
    "npm run generate:assets recreates the placeholder PNG files"
  ],
  "commands": ["npm run generate:assets"],
  "maxAttempts": 2,
  "outOfScope": ["Do not wire assets into runtime code", "Do not add final production art"]
}
```

- [ ] **Step 4: Create task_0013 TaskSpec**

Write `tasks/todo/task_0013_manifest_loader.json`:

```json
{
  "taskId": "task_0013_manifest_loader",
  "title": "Add asset manifest loader helpers",
  "phase": "Phase 1",
  "intent": "implement",
  "description": "Add TypeScript manifest types and Excalibur helper functions for named character and tileset graphics.",
  "skills": ["asset-manifest", "excalibur-scene", "patch-review"],
  "allowedFiles": [
    "src/assets/manifestTypes.ts",
    "src/assets/AssetManifestLoader.ts"
  ],
  "forbiddenFiles": ["server/**", "tests/**", "src/actors/**", "src/world/**"],
  "contextFiles": ["docs/agent-guides/asset-manifest-contract.md"],
  "acceptance": [
    "Manifest types compile under strict TypeScript",
    "Loader exposes createCharacterAnimation and createTileSprite helpers",
    "npm run build passes"
  ],
  "commands": ["npm run build"],
  "maxAttempts": 2,
  "outOfScope": ["Do not modify runtime actors", "Do not modify map rendering"]
}
```

- [ ] **Step 5: Create task_0014 TaskSpec**

Write `tasks/todo/task_0014_render_assets_from_manifests.json`:

```json
{
  "taskId": "task_0014_render_assets_from_manifests",
  "title": "Render Verdant and map tiles from manifests",
  "phase": "Phase 1",
  "intent": "implement",
  "description": "Update Verdant and village tile rendering to use manifest-backed placeholder assets instead of hardcoded colors.",
  "skills": ["asset-manifest", "excalibur-scene", "patch-review"],
  "allowedFiles": [
    "src/actors/Verdant.ts",
    "src/world/MapRenderer.ts",
    "src/data/map.json",
    "tests/playtest/game.spec.ts",
    "tests/playtest/npc-dialogue.spec.ts"
  ],
  "forbiddenFiles": ["server/**", "src/systems/**", "src/ui/**"],
  "contextFiles": [
    "docs/agent-guides/asset-manifest-contract.md",
    "docs/agent-guides/runtime-state-contract.md"
  ],
  "acceptance": [
    "Verdant visual is loaded via verdant.manifest.json",
    "Map tile sprites are loaded via village.manifest.json",
    "Actor and map code use named manifest keys, not hardcoded frame indexes",
    "npm run build passes",
    "npm run playtest passes"
  ],
  "commands": ["npm run build", "npm run playtest"],
  "maxAttempts": 3,
  "outOfScope": ["Do not change player movement", "Do not change dialogue behavior", "Do not add final art"]
}
```

- [ ] **Step 6: Create task_0015 TaskSpec**

Write `tasks/todo/task_0015_manifest_validation.json`:

```json
{
  "taskId": "task_0015_manifest_validation",
  "title": "Validate asset manifests and map tile references",
  "phase": "Phase 1",
  "intent": "implement",
  "description": "Add npm run validate to check asset manifest structure, referenced image files, positive dimensions, and map tile references.",
  "skills": ["asset-manifest", "patch-review"],
  "allowedFiles": [
    "scripts/validate.ts",
    "package.json",
    "tsconfig.json",
    "docs/HARNESS.md"
  ],
  "forbiddenFiles": ["server/**", "src/actors/**", "src/world/**", "tests/**"],
  "contextFiles": ["docs/agent-guides/asset-manifest-contract.md"],
  "acceptance": [
    "npm run validate checks Verdant and village manifests",
    "npm run validate checks map tile names against the village tileset manifest",
    "npm run build passes",
    "npm run validate passes",
    "npm run playtest passes"
  ],
  "commands": ["npm run build", "npm run validate", "npm run playtest"],
  "maxAttempts": 2,
  "outOfScope": ["Do not inspect image pixels", "Do not add Phase 7 asset QA"]
}
```

- [ ] **Step 7: Validate JSON TaskSpecs**

Run:

```bash
node -e "for (const f of require('fs').readdirSync('tasks/todo')) JSON.parse(require('fs').readFileSync('tasks/todo/'+f,'utf8')); console.log('valid')"
```

Expected output includes:

```text
valid
```

- [ ] **Step 8: Commit contract and TaskSpecs**

```bash
git add docs/agent-guides/asset-manifest-contract.md tasks/todo/task_0011_asset_manifest_contract.json tasks/todo/task_0012_placeholder_assets.json tasks/todo/task_0013_manifest_loader.json tasks/todo/task_0014_render_assets_from_manifests.json tasks/todo/task_0015_manifest_validation.json
git commit -m "$(cat <<'EOF'
tasks: add Phase 1 asset manifest specs

Documents the asset manifest contract and adds scoped TaskSpecs for placeholder
assets, loader helpers, runtime manifest rendering, and validation.

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>
EOF
)"
```

---

## Task 0012: Placeholder Asset Generation

**Files:**
- Create: `assets/characters/verdant.png`
- Create: `assets/characters/verdant.manifest.json`
- Create: `assets/tilesets/village.png`
- Create: `assets/tilesets/village.manifest.json`
- Create: `scripts/generate-placeholder-assets.ts`
- Modify: `package.json`

- [ ] **Step 1: Add package script**

Modify `package.json` scripts to include:

```json
"generate:assets": "tsx scripts/generate-placeholder-assets.ts"
```

Add dev dependency:

```json
"tsx": "^4.19.2"
```

- [ ] **Step 2: Install dependency**

Run:

```bash
npm install
```

Expected: exits 0 and updates `package-lock.json`.

- [ ] **Step 3: Write placeholder generator**

Create `scripts/generate-placeholder-assets.ts`:

```ts
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';

const files = new Map<string, string>([
  [
    'assets/characters/verdant.png',
    'iVBORw0KGgoAAAANSUhEUgAAAEAAAAAgCAYAAABV7bNHAAAAAXNSR0IArs4c6QAAAFRJREFUWEftzjENAAAIw7D9d26gAkPlUQXs2dmd9gAA7cAFwAUAQACAAQAGABgAYACAAQAGABgAYACAAQAGABgAYACAAQAGABgAYACAAQAGABgAcAAFfQGvFQIsR8hmXwAAAABJRU5ErkJggg=='
  ],
  [
    'assets/tilesets/village.png',
    'iVBORw0KGgoAAAANSUhEUgAAAKAAAAAoCAYAAADil6gpAAAAAXNSR0IArs4c6QAAAHBJREFUeF7t0jENAAAIxDDAv+f9MxgIKiRFbubM7swDAFxhYWBhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWHxAAGVYALawxBTAAAAAElFTkSuQmCC'
  ]
]);

for (const [path, base64] of files) {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, Buffer.from(base64, 'base64'));
}
```

- [ ] **Step 4: Write Verdant manifest**

Create `assets/characters/verdant.manifest.json`:

```json
{
  "id": "verdant",
  "type": "character",
  "image": "./verdant.png",
  "frameWidth": 32,
  "frameHeight": 32,
  "anchor": { "x": 0.5, "y": 1 },
  "animations": {
    "idle-down": { "frames": [0], "fps": 1 },
    "talk-down": { "frames": [0, 1], "fps": 2 }
  }
}
```

- [ ] **Step 5: Write village tileset manifest**

Create `assets/tilesets/village.manifest.json`:

```json
{
  "id": "village",
  "type": "tileset",
  "image": "./village.png",
  "tileWidth": 40,
  "tileHeight": 40,
  "tiles": {
    "grass": { "frame": 0, "blocked": false },
    "path": { "frame": 1, "blocked": false },
    "water": { "frame": 2, "blocked": true },
    "wall": { "frame": 3, "blocked": true }
  }
}
```

- [ ] **Step 6: Generate placeholder PNGs**

Run:

```bash
npm run generate:assets
```

Expected: exits 0 and creates both PNG files.

- [ ] **Step 7: Verify files exist**

Run:

```bash
node -e "for (const f of ['assets/characters/verdant.png','assets/characters/verdant.manifest.json','assets/tilesets/village.png','assets/tilesets/village.manifest.json']) require('fs').statSync(f); console.log('assets ok')"
```

Expected:

```text
assets ok
```

- [ ] **Step 8: Commit placeholder assets**

```bash
git add package.json package-lock.json scripts/generate-placeholder-assets.ts assets/characters/verdant.png assets/characters/verdant.manifest.json assets/tilesets/village.png assets/tilesets/village.manifest.json
git commit -m "$(cat <<'EOF'
assets(task-0012): add placeholder manifests and PNGs

Adds generated placeholder Verdant and village tileset images plus manifest JSON
files and a reproducible generator script.

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>
EOF
)"
```

---

## Task 0013: Manifest Loader Helpers

**Files:**
- Create: `src/assets/manifestTypes.ts`
- Create: `src/assets/AssetManifestLoader.ts`

- [ ] **Step 1: Write manifest types**

Create `src/assets/manifestTypes.ts`:

```ts
export type CharacterAnimationManifest = {
  frames: number[];
  fps: number;
};

export type CharacterManifest = {
  id: string;
  type: 'character';
  image: string;
  frameWidth: number;
  frameHeight: number;
  anchor: { x: number; y: number };
  animations: Record<string, CharacterAnimationManifest>;
};

export type TilesetManifest = {
  id: string;
  type: 'tileset';
  image: string;
  tileWidth: number;
  tileHeight: number;
  tiles: Record<string, { frame: number; blocked: boolean }>;
};
```

- [ ] **Step 2: Write loader helpers**

Create `src/assets/AssetManifestLoader.ts`:

```ts
import { Animation, ImageSource, Rectangle, Sprite, SpriteSheet, range, vec } from 'excalibur';
import { CharacterManifest, TilesetManifest } from './manifestTypes';

export function createImageSource(url: string): ImageSource {
  return new ImageSource(url);
}

export function createCharacterSpriteSheet(manifest: CharacterManifest, image: ImageSource): SpriteSheet {
  return SpriteSheet.fromImageSource({
    image,
    grid: {
      rows: 1,
      columns: 2,
      spriteWidth: manifest.frameWidth,
      spriteHeight: manifest.frameHeight,
    },
  });
}

export function createCharacterAnimation(manifest: CharacterManifest, sheet: SpriteSheet, name: string): Animation {
  const animation = manifest.animations[name];
  if (!animation) throw new Error(`Missing animation: ${name}`);
  return Animation.fromSpriteSheet(sheet, animation.frames, animation.fps);
}

export function createTileSprite(manifest: TilesetManifest, sheet: SpriteSheet, name: string): Sprite {
  const tile = manifest.tiles[name];
  if (!tile) throw new Error(`Missing tile: ${name}`);
  return sheet.sprites[tile.frame];
}

export function createTilesetSpriteSheet(manifest: TilesetManifest, image: ImageSource): SpriteSheet {
  const columns = Object.keys(manifest.tiles).length;
  return SpriteSheet.fromImageSource({
    image,
    grid: {
      rows: 1,
      columns,
      spriteWidth: manifest.tileWidth,
      spriteHeight: manifest.tileHeight,
    },
  });
}

export function createFallbackRectangle(width: number, height: number, color = '#ffffff'): Rectangle {
  return new Rectangle({ width, height, color: Color.fromHex(color) });
}
```

Then fix the missing `Color` import by making the import line:

```ts
import { Animation, Color, ImageSource, Rectangle, Sprite, SpriteSheet } from 'excalibur';
```

Remove unused `range` and `vec` from the import.

- [ ] **Step 3: Build**

Run:

```bash
npm run build
```

Expected: exits 0.

- [ ] **Step 4: Commit loader helpers**

```bash
git add src/assets/manifestTypes.ts src/assets/AssetManifestLoader.ts
git commit -m "$(cat <<'EOF'
feat(task-0013): add asset manifest loader helpers

Adds strict manifest types and Excalibur helper functions for character
animations and tileset sprites by manifest key.

Validation: npm run build passes.

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>
EOF
)"
```

---

## Task 0014: Render Verdant and Map Tiles from Manifests

**Files:**
- Modify: `src/actors/Verdant.ts`
- Modify: `src/world/MapRenderer.ts`
- Modify: `src/data/map.json`
- Test: `tests/playtest/game.spec.ts`
- Test: `tests/playtest/npc-dialogue.spec.ts`

- [ ] **Step 1: Update map legend to manifest tile keys**

Modify `src/data/map.json` legend entries to include `tile`:

```json
"legend": {
  "g": { "tile": "grass", "blocked": false },
  "p": { "tile": "path", "blocked": false },
  "w": { "tile": "water", "blocked": true }
}
```

- [ ] **Step 2: Update collision type compatibility**

Modify `src/world/collision.ts` type alias from:

```ts
type TileInfo = { name: string; blocked: boolean };
```

to:

```ts
type TileInfo = { tile: string; blocked: boolean };
```

- [ ] **Step 3: Update Verdant to use manifest asset URL**

Replace `src/actors/Verdant.ts` with:

```ts
import { Actor, ImageSource, SpriteSheet, vec } from 'excalibur';
import verdantManifest from '../../assets/characters/verdant.manifest.json';
import verdantUrl from '../../assets/characters/verdant.png?url';
import { createCharacterAnimation, createCharacterSpriteSheet } from '../assets/AssetManifestLoader';
import { CharacterManifest } from '../assets/manifestTypes';

const manifest = verdantManifest as CharacterManifest;
const image = new ImageSource(verdantUrl);
const sheet = createCharacterSpriteSheet(manifest, image);
const idleDown = createCharacterAnimation(manifest, sheet, 'idle-down');

export class Verdant extends Actor {
  constructor(x: number, y: number) {
    super({
      name: 'Verdant',
      pos: vec(x, y),
      width: manifest.frameWidth,
      height: manifest.frameHeight,
      anchor: vec(manifest.anchor.x, manifest.anchor.y),
    });
    this.graphics.use(idleDown);
  }
}
```

- [ ] **Step 4: Update MapRenderer to use tileset manifest**

Replace `src/world/MapRenderer.ts` with:

```ts
import { Actor, ImageSource, Scene, SpriteSheet, vec } from 'excalibur';
import mapData from '../data/map.json';
import villageManifest from '../../assets/tilesets/village.manifest.json';
import villageUrl from '../../assets/tilesets/village.png?url';
import { createTileSprite, createTilesetSpriteSheet } from '../assets/AssetManifestLoader';
import { TilesetManifest } from '../assets/manifestTypes';
import { TileMap } from './collision';

const manifest = villageManifest as TilesetManifest;
const image = new ImageSource(villageUrl);
const sheet = createTilesetSpriteSheet(manifest, image);

export function addMapToScene(scene: Scene): void {
  const map = mapData as TileMap;
  for (let row = 0; row < map.height; row++) {
    for (let col = 0; col < map.width; col++) {
      const sym = map.tiles[row][col];
      const info = map.legend[sym];
      const tileName = info?.tile ?? 'grass';
      const tile = new Actor({
        pos: vec(col * map.tileSize + map.tileSize / 2, row * map.tileSize + map.tileSize / 2),
        width: map.tileSize,
        height: map.tileSize,
      });
      tile.graphics.use(createTileSprite(manifest, sheet, tileName));
      scene.add(tile);
    }
  }
}
```

- [ ] **Step 5: Build**

Run:

```bash
npm run build
```

Expected: exits 0.

- [ ] **Step 6: Run playtests**

Run:

```bash
npm run playtest
```

Expected: 2 tests pass.

- [ ] **Step 7: Commit manifest rendering**

```bash
git add src/actors/Verdant.ts src/world/MapRenderer.ts src/world/collision.ts src/data/map.json tests/playtest/game.spec.ts tests/playtest/npc-dialogue.spec.ts
git commit -m "$(cat <<'EOF'
feat(task-0014): render Verdant and tiles from manifests

Updates Verdant and map rendering to consume asset manifests and placeholder
PNGs by named animation/tile keys instead of hardcoded colors or frame indexes.

Validation: npm run build and npm run playtest pass.

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>
EOF
)"
```

---

## Task 0015: Manifest Validation Command

**Files:**
- Create: `scripts/validate.ts`
- Modify: `package.json`
- Modify: `tsconfig.json`
- Modify: `docs/HARNESS.md`

- [ ] **Step 1: Add validate script**

Modify `package.json` scripts to include:

```json
"validate": "tsx scripts/validate.ts"
```

- [ ] **Step 2: Include scripts in tsconfig**

Modify `tsconfig.json` include:

```json
"include": ["src", "scripts", "vite.config.ts", "playwright.config.ts", "tests"]
```

- [ ] **Step 3: Write validation script**

Create `scripts/validate.ts`:

```ts
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join, normalize } from 'node:path';

function readJson(path: string): unknown {
  return JSON.parse(readFileSync(path, 'utf8'));
}

function assert(condition: boolean, message: string): void {
  if (!condition) throw new Error(message);
}

function assertPositiveInt(value: unknown, field: string): void {
  assert(Number.isInteger(value) && Number(value) > 0, `${field} must be a positive integer`);
}

function validateCharacterManifest(path: string): void {
  const manifest = readJson(path) as any;
  assert(manifest.type === 'character', `${path}: type must be character`);
  assert(typeof manifest.id === 'string' && manifest.id.length > 0, `${path}: id required`);
  assert(typeof manifest.image === 'string' && manifest.image.length > 0, `${path}: image required`);
  assertPositiveInt(manifest.frameWidth, `${path}: frameWidth`);
  assertPositiveInt(manifest.frameHeight, `${path}: frameHeight`);
  assert(typeof manifest.anchor?.x === 'number', `${path}: anchor.x required`);
  assert(typeof manifest.anchor?.y === 'number', `${path}: anchor.y required`);
  assert(manifest.animations && typeof manifest.animations === 'object', `${path}: animations required`);
  for (const [name, animation] of Object.entries(manifest.animations as Record<string, any>)) {
    assert(name.length > 0, `${path}: animation name cannot be empty`);
    assert(Array.isArray(animation.frames) && animation.frames.length > 0, `${path}: ${name}.frames required`);
    assertPositiveInt(animation.fps, `${path}: ${name}.fps`);
  }
  const imagePath = normalize(join(dirname(path), manifest.image));
  assert(existsSync(imagePath), `${path}: missing image ${imagePath}`);
}

function validateTilesetManifest(path: string): Set<string> {
  const manifest = readJson(path) as any;
  assert(manifest.type === 'tileset', `${path}: type must be tileset`);
  assert(typeof manifest.id === 'string' && manifest.id.length > 0, `${path}: id required`);
  assert(typeof manifest.image === 'string' && manifest.image.length > 0, `${path}: image required`);
  assertPositiveInt(manifest.tileWidth, `${path}: tileWidth`);
  assertPositiveInt(manifest.tileHeight, `${path}: tileHeight`);
  assert(manifest.tiles && typeof manifest.tiles === 'object', `${path}: tiles required`);
  const tileNames = new Set<string>();
  for (const [name, tile] of Object.entries(manifest.tiles as Record<string, any>)) {
    assert(name.length > 0, `${path}: tile name cannot be empty`);
    assert(Number.isInteger(tile.frame) && tile.frame >= 0, `${path}: ${name}.frame must be a non-negative integer`);
    assert(typeof tile.blocked === 'boolean', `${path}: ${name}.blocked must be boolean`);
    tileNames.add(name);
  }
  const imagePath = normalize(join(dirname(path), manifest.image));
  assert(existsSync(imagePath), `${path}: missing image ${imagePath}`);
  return tileNames;
}

function validateMap(tileNames: Set<string>): void {
  const map = readJson('src/data/map.json') as any;
  assert(map.legend && typeof map.legend === 'object', 'src/data/map.json: legend required');
  for (const [symbol, entry] of Object.entries(map.legend as Record<string, any>)) {
    assert(symbol.length === 1, `src/data/map.json: legend symbol ${symbol} must be one character`);
    assert(typeof entry.tile === 'string', `src/data/map.json: legend ${symbol}.tile required`);
    assert(tileNames.has(entry.tile), `src/data/map.json: unknown tile ${entry.tile}`);
    assert(typeof entry.blocked === 'boolean', `src/data/map.json: legend ${symbol}.blocked must be boolean`);
  }
}

validateCharacterManifest('assets/characters/verdant.manifest.json');
const tileNames = validateTilesetManifest('assets/tilesets/village.manifest.json');
validateMap(tileNames);
console.log('validate: ok');
```

- [ ] **Step 4: Update docs/HARNESS.md**

Ensure the Required Commands section includes:

```md
- `npm run validate`
```

If already present, no content change is needed.

- [ ] **Step 5: Run validation**

Run:

```bash
npm run validate
```

Expected:

```text
validate: ok
```

- [ ] **Step 6: Run build and playtests**

Run:

```bash
npm run build && npm run playtest
```

Expected: build exits 0 and both Playwright tests pass.

- [ ] **Step 7: Commit validation**

```bash
git add package.json package-lock.json tsconfig.json scripts/validate.ts docs/HARNESS.md
git commit -m "$(cat <<'EOF'
feat(task-0015): validate asset manifests

Adds npm run validate to check manifest structure, referenced image files,
positive dimensions, and map tile references against the village tileset.

Validation: npm run build, npm run validate, and npm run playtest pass.

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>
EOF
)"
```

---

## Final Phase 1 Verification

- [ ] **Step 1: Run all checks**

```bash
npm run build && npm run validate && npm run playtest
```

Expected:

```text
validate: ok
2 passed
```

- [ ] **Step 2: Move TaskSpecs to done**

```bash
mv tasks/todo/task_0011_asset_manifest_contract.json tasks/done/
mv tasks/todo/task_0012_placeholder_assets.json tasks/done/
mv tasks/todo/task_0013_manifest_loader.json tasks/done/
mv tasks/todo/task_0014_render_assets_from_manifests.json tasks/done/
mv tasks/todo/task_0015_manifest_validation.json tasks/done/
```

- [ ] **Step 3: Commit task cleanup**

```bash
git add tasks/done/task_0011_asset_manifest_contract.json tasks/done/task_0012_placeholder_assets.json tasks/done/task_0013_manifest_loader.json tasks/done/task_0014_render_assets_from_manifests.json tasks/done/task_0015_manifest_validation.json
git add -u tasks/todo
git commit -m "$(cat <<'EOF'
chore: mark Phase 1 asset manifest tasks done

Moves completed Phase 1 TaskSpecs from tasks/todo/ to tasks/done/ after
implementation and verification.

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>
EOF
)"
```

- [ ] **Step 4: Push**

```bash
git push origin main
```

---

## Self-Review

Spec coverage:

- Asset contract docs: Task 0011.
- Character and tileset manifests: Task 0012.
- Placeholder PNG assets: Task 0012.
- TypeScript loaders: Task 0013.
- Verdant and map runtime integration: Task 0014.
- Validation command: Task 0015.
- Build/playtest verification: Tasks 0014, 0015, final verification.

Placeholder scan: no TODO/TBD/fill-in placeholders remain.

Type consistency:

- Map legend uses `tile` consistently after Task 0014.
- `TileInfo` in `collision.ts` matches map JSON after Task 0014.
- Loader function names match runtime calls: `createCharacterSpriteSheet`, `createCharacterAnimation`, `createTilesetSpriteSheet`, `createTileSprite`.

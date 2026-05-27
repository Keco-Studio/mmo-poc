---
name: asset-manifest
description: Use when adding or modifying game assets (sprites, tilesets, PNGs) - covers manifest contract, asset loader usage, placeholder generation, and validation
---

# Asset Manifest Skill

## Overview

Assets are driven by JSON manifest files in `assets/` directories. Each manifest describes an image, frame grid, named animations/tiles, and blocked behavior. Runtime code uses named keys rather than frame indexes.

## Asset Locations

```
assets/
  characters/
    verdant.png
    verdant.manifest.json
  tilesets/
    village.png
    village.manifest.json

public/assets/          # Vite-served copies
  characters/
  tilesets/
```

## Character Manifest

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

## Tileset Manifest

```json
{
  "id": "village",
  "type": "tileset",
  "image": "./village.png",
  "tileWidth": 40,
  "tileHeight": 40,
  "tiles": {
    "grass": { "frame": 0, "blocked": false },
    "path":  { "frame": 1, "blocked": false },
    "water": { "frame": 2, "blocked": true }
  }
}
```

## Frame Index Convention

Frames are indexed left-to-right, top-to-bottom (row-major):
- Frame 0 = top-left
- Frame 1 = one tile right
- Frame N = `col = N % columns`, `row = floor(N / columns)`

## Adding a New Character

1. Create the PNG in `assets/characters/`
2. Create `assets/characters/<name>.manifest.json` with the contract above
3. Copy to `public/assets/characters/`
4. Regenerate placeholders if needed: `npm run generate:assets`
5. Validate: `npm run validate`
6. Update character loading in the appropriate actor's `bootstrapCharacter()` static method

## Adding a New Tile

1. Add the tile to `assets/tilesets/<tileset>.png` (append to the right)
2. Update `assets/tilesets/<tileset>.manifest.json` — add entry to `tiles` object with next frame index
3. Update `public/assets/tilesets/` copy
4. If the tile is used in `src/data/map.json`, ensure the legend key maps to the tile name
5. Validate: `npm run validate`

## Placeholder Generation

```bash
npm run generate:assets  # runs scripts/generate-placeholder-assets.ts via tsx
```

This regenerates all placeholder PNGs from the manifest definitions.

## Validation

```bash
npm run validate
```

Checks:
- All manifest JSON is parseable
- Required fields exist (id, type, image, dimensions)
- Referenced image files exist
- Frame dimensions are positive integers
- Named animations/tiles are non-empty
- Map tile keys exist in tileset manifests

## Asset Loader Usage

`src/assets/AssetManifestLoader.ts` provides:
- `createSpriteSheet(imageSource, manifest)` — build Excalibur SpriteSheet
- `createAnimation(manifest, sheet, name)` — build Excalibur Animation from named animation
- `createTileSprite(manifest, sheet, tileName)` — build Sprite for a named tile
- `getSpriteByFrame(sheet, index)` — get sprite by frame index

Assets are bootstrapped at scene init via static `bootstrapCharacter()` methods and `bootstrapTileAssets()`.

## When to Use This Skill

- Adding a new NPC sprite
- Adding a new map tile
- Modifying an existing manifest (rename animation, change frame)
- Debugging asset loading failures
- Running validation before committing asset changes
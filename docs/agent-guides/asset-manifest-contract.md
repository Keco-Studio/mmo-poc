# Asset Manifest Contract

## Overview

The harness uses **manifests** to decouple sprite/tileset art from runtime code. Each manifest is a small JSON file that describes an image, its frame grid, named animations, and tile mappings. Actor and scene code refers to named keys rather than hardcoded frame indexes, so Claude and artists can swap assets without touching game logic.

## Manifest Types

### Character Manifest

Describes one sprite sheet and its named animations.

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

**Fields:**
- `id` — unique name, matches the NPC id
- `type` — must be `"character"`
- `image` — path relative to the manifest file (e.g., same directory)
- `frameWidth`, `frameHeight` — pixel dimensions of one frame
- `anchor` — normalized pivot point (0–1). `{ "x": 0.5, "y": 1 }` means bottom-center.
- `animations` — map of animation name → frame list and playback rate

**Constraint:** runtime code must use animation names (`"idle-down"`, `"talk-down"`) rather than raw frame indices.

### Tileset Manifest

Maps semantic tile keys to sprite positions in a grid tileset.

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
    "water": { "frame": 2, "blocked": true  },
    "wall":  { "frame": 3, "blocked": true  }
  }
}
```

**Fields:**
- `id` — tileset name (matches map data reference)
- `type` — must be `"tileset"`
- `image` — path relative to the manifest
- `tileWidth`, `tileHeight` — pixel dimensions of one tile
- `tiles` — map of semantic key → `{ frame, blocked }`

**Frame index convention:**
- Count left-to-right, then top-to-bottom
- Frame 0 = top-left, Frame 1 = one tile right, Frame N = `col = N % cols`, `row = floor(N / cols)`

**Constraint:** map data refers to semantic tile keys (`"grass"`), not raw frame numbers.

## Where Manifests Live

```
assets/
  characters/
    verdant.png
    verdant.manifest.json
  tilesets/
    village.png
    village.manifest.json
```

## Validation Rules

`npm run validate` enforces:
1. Manifest JSON is parseable.
2. All required fields exist (`id`, `type`, `image`, dimensions, `animations`/`tiles` depending on type).
3. Referenced image path is non-empty.
4. Frame dimensions are positive integers.
5. Each named animation/tile key is non-empty.
6. For map tile references: each key used in `map.json` exists in the referenced tileset manifest.

Validation does NOT inspect image pixels.

## Loader Interface

`src/assets/AssetManifestLoader.ts` provides:
- `loadCharacterManifest(manifest)` — returns an object with `{ texture, sprites, animations }`
- `loadTilesetManifest(manifest)` — returns a tileset ready for `MapRenderer`
- `createAnimation(manifest, texture, animationName)` — builds a named Excalibur animation
- `createTileSprite(manifest, texture, tileName)` — builds a named Excalibur sprite

## Adding New Assets

1. Drop the PNG in the appropriate `assets/` subdirectory.
2. Create the manifest JSON alongside it.
3. Run `npm run validate` to check structure.
4. Update runtime code to request the named animation or tile key.
5. No changes to actor/scene code needed beyond the manifest key.

# Phase 1 Asset Manifest System Design

## Context

Phase 0A/0B completed the Claude-native harness and a playable Excalibur village slice: player movement, tile map, collision, Verdant NPC, prompt/dialogue, runtime state, and Playwright playtests. The current visual implementation is mostly hardcoded colored rectangles and JSON data. Phase 1 makes game assets structured and replaceable through manifests so Claude and humans can swap art without changing actor or scene code.

Source spec: `AI_NPC_Village_DevKit_Claude_Code_Native_Spec_v0.3.md` Phase 1.

## Goal

Make sprites and tilesets manifest-driven.

Acceptance:

- Verdant sprite manifest loads.
- Map tiles render through a tileset manifest.
- Actor/game code uses named animations or sprite keys, not hardcoded frame indexes.
- Replacing the Verdant image and manifest can update the game without changing runtime code.
- Build and playtests pass.

## Approach

Use placeholder generated PNG assets plus real manifest contracts. This proves the asset pipeline immediately without waiting for final art.

Phase 1 will add:

1. Asset manifest documentation.
2. Character and tileset manifest JSON files.
3. Small placeholder PNG assets under `assets/`.
4. TypeScript loaders under `src/assets/`.
5. Minimal runtime integration for Verdant and village tiles.
6. Validation script support for manifest JSON.
7. Focused TaskSpecs for incremental implementation.

## File Layout

```text
docs/agent-guides/asset-manifest-contract.md

assets/
  characters/
    verdant.png
    verdant.manifest.json
  tilesets/
    village.png
    village.manifest.json

src/assets/
  manifestTypes.ts
  AssetManifestLoader.ts

scripts/
  generate-placeholder-assets.ts
  validate.ts
```

Existing files expected to change during implementation:

```text
package.json
tsconfig.json
src/actors/Verdant.ts
src/world/MapRenderer.ts
src/data/map.json
tests/playtest/game.spec.ts
tests/playtest/npc-dialogue.spec.ts
```

## Manifest Contracts

### Character Manifest

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

Runtime code may request `idle-down` or `talk-down`; it must not encode Verdant-specific frame numbers outside the manifest.

### Tileset Manifest

A tileset manifest maps semantic tile names to sprite positions.

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

Map data should refer to semantic tile keys. Rendering and collision can derive visual and blocked behavior from the tileset manifest.

## Runtime Integration

`src/assets/AssetManifestLoader.ts` will expose small functions:

- `loadCharacterManifest(manifest)`
- `createAnimation(manifest, texture, animationName)`
- `loadTilesetManifest(manifest)`
- `createTileSprite(manifest, texture, tileName)`

Implementation can start synchronous from imported JSON and asset URLs. It does not need a dynamic asset registry yet.

`Verdant.ts` should render its idle/talk graphics using the character manifest. `MapRenderer.ts` should render map tiles through the tileset manifest. If Excalibur async asset loading is needed, keep it small and localized in the loader or game bootstrap.

## Validation

Add `npm run validate` if missing. Validation should check:

- Manifest JSON is parseable.
- Required fields exist.
- Referenced images exist.
- Frame dimensions are positive integers.
- Named animations/tile keys are non-empty.
- Map tile keys exist in the tileset manifest.

Validation does not need to inspect image pixels yet; that belongs to Phase 7 Asset QA.

## Testing

Required checks per task:

- `npm run build`
- `npm run validate`
- `npm run playtest`

Playwright tests should continue to verify the game opens and the NPC dialogue flow works. They should not rely on pixel-perfect image checks in Phase 1.

## Task Decomposition

### Task 0011 — Asset Manifest Contract

Create docs and TaskSpec scaffolding for asset manifests.

Scope:

- `docs/agent-guides/asset-manifest-contract.md`
- `tasks/todo/task_0011_asset_manifest_contract.json`

Acceptance:

- Contract documents character and tileset manifest shape.
- Contract defines validation expectations.

### Task 0012 — Placeholder Asset Generation

Generate tiny placeholder PNGs and manifests.

Scope:

- `assets/characters/verdant.png`
- `assets/characters/verdant.manifest.json`
- `assets/tilesets/village.png`
- `assets/tilesets/village.manifest.json`
- `scripts/generate-placeholder-assets.ts`
- `package.json`

Acceptance:

- Assets and manifests exist.
- Generator can recreate placeholders.

### Task 0013 — Manifest Loader

Add TypeScript manifest types and loader helpers.

Scope:

- `src/assets/manifestTypes.ts`
- `src/assets/AssetManifestLoader.ts`

Acceptance:

- Loader can create named character animations/sprites.
- Loader can create named tile sprites.
- `npm run build` passes.

### Task 0014 — Render Verdant and Tiles via Manifests

Update runtime rendering to consume manifests.

Scope:

- `src/actors/Verdant.ts`
- `src/world/MapRenderer.ts`
- `src/data/map.json`
- relevant tests if state timing changes

Acceptance:

- Verdant visual comes from `verdant.manifest.json`.
- Map tiles render from `village.manifest.json`.
- No hardcoded Verdant frame indexes in actor code.
- Existing Playwright tests pass.

### Task 0015 — Manifest Validation

Add validation script and command.

Scope:

- `scripts/validate.ts`
- `package.json`
- `docs/HARNESS.md` if command documentation needs aligning

Acceptance:

- `npm run validate` checks all asset manifests and map tile references.
- Invalid manifest or map tile keys produce clear errors.
- `npm run build`, `npm run validate`, and `npm run playtest` pass.

## Out of Scope

- Final production-quality pixel art.
- Empty-frame detection and anchor drift analysis (Phase 7).
- AI-generated asset QA reports (Phase 7).
- Workbench UI for browsing assets (Phase 8).
- NPC AI integration (Phase 6).
- General asset registry or hot-reload UI.

## Risks and Mitigations

- **Excalibur image loading may require async resource handling.** Keep loader small and wire resources only where needed.
- **PNG generation can add tooling complexity.** Use a tiny Node script with a minimal dependency only if necessary; otherwise commit static placeholders.
- **Validation can sprawl.** Limit Phase 1 validation to manifest structure, file existence, numeric dimensions, and map tile key consistency.
- **Tests may become visually brittle.** Keep Playwright checks based on runtime state and DOM/canvas existence, not pixel snapshots.

## Success Definition

Phase 1 is complete when the game still plays exactly as before, but Verdant and village tiles are backed by manifests and replaceable assets. Claude can inspect manifest docs, create scoped TaskSpecs for asset work, validate manifest structure, and rely on existing Playwright tests to catch runtime breakage.

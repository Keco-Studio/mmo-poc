---
name: excalibur-scene
description: Use when editing src/game/*.ts scene files or src/actors/*.ts in the Excalibur.js village - preserves scene lifecycle, keeps data out of code, maintains runtime inspector contract
---

# excalibur-scene

Use this skill when editing Excalibur scene files or actor components in the MMO harness codebase.

## When to Use

This skill triggers when you are:
- Creating a new scene class (e.g., `VillageScene`, `DungeonScene`)
- Adding or modifying actors in a scene
- Adding or modifying systems in a scene
- Connecting scene events or lifecycle hooks
- Editing any file under `src/scenes/` or `src/actors/`
- Adding new actor components that integrate with existing systems

## Inputs

- `VillageScene.ts` (or the relevant scene file)
- `runtime-state-contract.md` for the current scene contract
- Actor files under `src/actors/`
- System files under `src/systems/`

## Workflow

### Step 1: Verify the scene contract

Before making changes, read `runtime-state-contract.md` for the scene. Understand what actors, systems, and state the scene is expected to manage. If no contract exists, flag this before proceeding.

### Step 2: Identify the scope of changes

Determine whether you are:
- Editing an existing actor/component
- Adding a new actor/component to an existing scene
- Creating a new scene from scratch
- Modifying scene lifecycle (init, onActivate, onDeactivate, teardown)

### Step 3: Keep actors and systems separated

Actors are data containers (position, health, inventory). Systems contain logic (movement, combat, AI). Never embed game data (items, quests, dialogue) directly in scene code. Scene files should only wire actors and systems together.

### Step 4: Use Excalibur lifecycle hooks correctly

```typescript
// Correct: use onActivate/onDeactivate for scene lifecycle
export class VillageScene extends Scene {
  private playerSpawnSystem!: PlayerSpawnSystem;

  onActivate(): void {
    // Subscribe to events, start systems, register actors
    this.playerSpawnSystem = new PlayerSpawnSystem();
    this.addSystem(this.playerSpawnSystem);
  }

  onDeactivate(): void {
    // Clean up subscriptions, stop timers, remove actors
    this.clearSystems();
    this.engine.currentScene.cleanup();
  }
}

// Avoid: do not put game logic in the scene constructor
constructor(engine: Engine) {
  super(engine);
  // Do not add systems or actors here — use onActivate
}
```

### Step 5: Preserve runtime inspector compatibility

Excalibur scenes support runtime inspector debugging. Do not:
- Override `update` in ways that break frame timing
- Remove the `engine` reference needed by the inspector
- Disable the built-in actor/component tree

### Step 6: Validate the changes

After editing:
- Run the scene tests (if present) to verify actors load correctly
- Verify no circular dependencies between scene and actor files
- Confirm the scene file does not import game data (items, quests, dialogue)

## Checks

- Scene extends `excalibur.Scene` and uses `onActivate`/`onDeactivate` for lifecycle
- Actors and systems are added only during `onActivate` (not constructor)
- No game data (items, quests, dialogue) is embedded in the scene file
- Scene file does not import from `src/data/` or `src/quests/`
- Systems are properly cleaned up in `onDeactivate` via `this.clearSystems()`
- Actor components use `@property()` decorators for runtime inspector visibility

## Common Mistakes

### 1. Adding systems in the scene constructor

Systems should be added in `onActivate`, not in the constructor. The engine is not fully initialized during construction, which can cause null reference errors when systems try to access engine resources.

### 2. Embedding game data in scene code

Putting items, quests, or dialogue directly in scene files couples the scene to game content. Instead, reference actor templates or data files that are loaded at runtime.

```typescript
// Wrong
const quest = { id: 'village_1', title: 'Find the Elder' };

// Correct - load from data files
import { questRegistry } from '@data/quests';
const quest = questRegistry.get('village_1');
```

### 3. Forgetting to clean up systems on deactivate

When the scene is deactivated (e.g., player moves to a different scene), systems that are not removed continue running and cause memory leaks or phantom events. Always call `this.clearSystems()` in `onDeactivate`.

### 4. Breaking the runtime inspector

Excalibur's runtime inspector relies on the scene maintaining its `engine` reference and not overriding critical lifecycle methods. Avoid removing `super.onActivate()` calls or overwriting internal inspector properties.

### 5. Not checking the scene contract before editing

The `runtime-state-contract.md` defines what state the scene must provide to other systems. Editing an actor without checking the contract can break assumptions made by other scenes or network synchronization code.
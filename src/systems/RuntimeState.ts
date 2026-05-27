import type { Actor } from 'excalibur';

type RuntimeNpc = { id: string; name: string; x: number; y: number };

export type GameState = {
  scene: string;
  ready: boolean;
  player: { x: number; y: number };
  npcs: RuntimeNpc[];
  promptVisible: boolean;
  dialogueOpen: boolean;
  errors: string[];
};

declare global {
  interface Window {
    __GAME_STATE__: GameState;
  }
}

const emptyPlayer = { x: 0, y: 0 };

export function initializeGameState(): void {
  window.__GAME_STATE__ = {
    scene: 'village',
    ready: false,
    player: emptyPlayer,
    npcs: [],
    promptVisible: false,
    dialogueOpen: false,
    errors: [],
  };
}

export function updateGameState(input: {
  scene: string;
  ready: boolean;
  player?: Actor | { x: number; y: number };
  npcs?: Actor[] | RuntimeNpc[];
  promptVisible?: boolean;
  dialogueOpen?: boolean;
  errors?: string[];
}): void {
  window.__GAME_STATE__ = {
    scene: input.scene,
    ready: input.ready,
    player: input.player
      ? 'x' in input.player
        ? { x: Math.round(input.player.x), y: Math.round(input.player.y) }
        : { x: Math.round((input.player as Actor).pos.x), y: Math.round((input.player as Actor).pos.y) }
      : emptyPlayer,
    npcs: (input.npcs ?? []).map(npc => {
      if ('x' in npc) return npc as RuntimeNpc;
      return { id: npc.name, name: npc.name, x: Math.round(npc.pos.x), y: Math.round(npc.pos.y) };
    }),
    promptVisible: input.promptVisible ?? false,
    dialogueOpen: input.dialogueOpen ?? false,
    errors: input.errors ?? [],
  };
}
// Character manifest types
export interface CharacterAnimation {
  frames: number[];
  fps: number;
}

export interface CharacterManifest {
  id: string;
  type: 'character';
  image: string;
  frameWidth: number;
  frameHeight: number;
  anchor: { x: number; y: number };
  animations: Record<string, CharacterAnimation>;
}

// Tileset manifest types
export interface TileInfo {
  frame: number;
  blocked: boolean;
}

export interface TilesetManifest {
  id: string;
  type: 'tileset';
  image: string;
  tileWidth: number;
  tileHeight: number;
  tiles: Record<string, TileInfo>;
}

// Re-exports for convenience
export type { TileInfo as TileInfoFromManifest };
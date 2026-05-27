type TileInfo = { name: string; blocked: boolean };
type TileMap = { tileSize: number; width: number; height: number; tiles: string[]; legend: Record<string, TileInfo> };

export function isBlockedAt(map: TileMap, x: number, y: number): boolean {
  const col = Math.floor(x / map.tileSize);
  const row = Math.floor(y / map.tileSize);
  if (col < 0 || row < 0 || col >= map.width || row >= map.height) return true;
  const symbol = map.tiles[row]?.[col];
  return !symbol || map.legend[symbol]?.blocked !== false;
}

export type { TileMap };

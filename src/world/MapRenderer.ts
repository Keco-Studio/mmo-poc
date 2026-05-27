import { Actor, Color, Rectangle, Scene, vec } from 'excalibur';
import mapData from '../data/map.json';
import { TileMap } from './collision';

const TILE_COLORS: Record<string, Color> = {
  grass: Color.fromRGB(50, 120, 50),
  path: Color.fromRGB(160, 130, 80),
  water: Color.fromRGB(40, 80, 180),
};

export function addMapToScene(scene: Scene): void {
  const map = mapData as TileMap;
  for (let row = 0; row < map.height; row++) {
    for (let col = 0; col < map.width; col++) {
      const sym = map.tiles[row][col];
      const info = map.legend[sym];
      const color = info ? TILE_COLORS[info.name] : Color.Transparent;
      const tile = new Actor({
        pos: vec(col * map.tileSize + map.tileSize / 2, row * map.tileSize + map.tileSize / 2),
        width: map.tileSize,
        height: map.tileSize,
      });
      tile.graphics.use(new Rectangle({ width: map.tileSize, height: map.tileSize, color }));
      scene.add(tile);
    }
  }
}

import { Actor, ImageSource, Scene, Sprite, SpriteSheet, vec } from 'excalibur';
import mapData from '../data/map.json';
import { TileMap } from './collision';
import { TilesetManifest } from '../assets/manifestTypes';
import villageManifest from '../../assets/tilesets/village.manifest.json';

export type { TilesetManifest };

let _tileSheet: SpriteSheet | null = null;
let _tileSprites: Record<string, Sprite> = {};
let _initialized = false;

export async function bootstrapTileAssets(): Promise<void> {
  if (_initialized) return;
  const manifest = villageManifest as TilesetManifest;
  // Serve from /public as /assets per Vite convention
  const imgPath = `/assets/tilesets/${manifest.image}`;
  const img = new ImageSource(imgPath);
  await img.load();

  const cols = Math.floor(img.width / manifest.tileWidth);
  _tileSheet = SpriteSheet.fromImageSource({
    image: img,
    grid: {
      rows: Math.floor(img.height / manifest.tileHeight),
      columns: cols,
      spriteWidth: manifest.tileWidth,
      spriteHeight: manifest.tileHeight,
    },
  });

  _tileSprites = {};
  for (const [key, tileInfo] of Object.entries(manifest.tiles)) {
    const x = (tileInfo as { frame: number }).frame % cols;
    const y = Math.floor((tileInfo as { frame: number }).frame / cols);
    _tileSprites[key] = _tileSheet.getSprite(x, y)!;
  }
  _initialized = true;
}

export function addMapToScene(scene: Scene): void {
  if (!_initialized) return;
  const map = mapData as TileMap;

  for (let row = 0; row < map.height; row++) {
    for (let col = 0; col < map.width; col++) {
      const sym = map.tiles[row][col];
      const info = map.legend[sym];
      if (!info) continue;
      const sprite = _tileSprites[(info as { tile: string }).tile];
      if (!sprite) continue;

      const tile = new Actor({
        pos: vec(
          col * map.tileSize + map.tileSize / 2,
          row * map.tileSize + map.tileSize / 2
        ),
        width: map.tileSize,
        height: map.tileSize,
      });
      tile.graphics.use(sprite.clone());
      scene.add(tile);
    }
  }
}
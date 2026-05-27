import {
  ImageSource,
  SpriteSheet,
  Animation,
  Sprite,
} from 'excalibur';
import {
  CharacterManifest,
  TilesetManifest,
  TileInfo,
} from './manifestTypes';

export type { CharacterManifest, TilesetManifest, TileInfo };

/**
 * Create an Excalibur SpriteSheet from a character manifest and loaded ImageSource.
 */
export function createSpriteSheet(
  imageSource: ImageSource,
  manifest: CharacterManifest
): SpriteSheet {
  const cols = Math.floor(imageSource.width / manifest.frameWidth);
  return SpriteSheet.fromImageSource({
    image: imageSource,
    grid: {
      rows: Math.floor(imageSource.height / manifest.frameHeight),
      columns: cols,
      spriteWidth: manifest.frameWidth,
      spriteHeight: manifest.frameHeight,
    },
  });
}

/**
 * Create a named Excalibur Animation from a character manifest.
 * Uses row-major frame indices (top-left = 0, rightward = 1, etc.)
 */
export function createAnimation(
  manifest: CharacterManifest,
  spriteSheet: SpriteSheet,
  animationName: string
): Animation {
  const animDef = manifest.animations[animationName];
  if (!animDef) {
    throw new Error(
      `Animation "${animationName}" not found in manifest "${manifest.id}"`
    );
  }

  const frameDuration = 1000 / animDef.fps;
  return Animation.fromSpriteSheet(spriteSheet, animDef.frames, frameDuration);
}

/**
 * Create a SpriteSheet from a tileset manifest.
 */
export function createTilesetSheet(
  imageSource: ImageSource,
  manifest: TilesetManifest
): SpriteSheet {
  const cols = Math.floor(imageSource.width / manifest.tileWidth);
  return SpriteSheet.fromImageSource({
    image: imageSource,
    grid: {
      rows: Math.floor(imageSource.height / manifest.tileHeight),
      columns: cols,
      spriteWidth: manifest.tileWidth,
      spriteHeight: manifest.tileHeight,
    },
  });
}

/**
 * Get a tile sprite by semantic name from a tileset manifest.
 */
export function createTileSprite(
  manifest: TilesetManifest,
  sheet: SpriteSheet,
  tileName: string
): Sprite {
  const tileInfo = manifest.tiles[tileName];
  if (!tileInfo) {
    throw new Error(`Tile "${tileName}" not found in tileset "${manifest.id}"`);
  }
  const cols = sheet.columns;
  const x = tileInfo.frame % cols;
  const y = Math.floor(tileInfo.frame / cols);
  return sheet.getSprite(x, y)!;
}

/**
 * Get a single sprite by frame index from a sprite sheet.
 */
export function getSpriteByFrame(
  spriteSheet: SpriteSheet,
  frameIndex: number
): Sprite {
  const cols = spriteSheet.columns;
  const x = frameIndex % cols;
  const y = Math.floor(frameIndex / cols);
  return spriteSheet.getSprite(x, y)!;
}

// Re-export for tileset use
export type { SpriteSheet, Sprite, Animation };
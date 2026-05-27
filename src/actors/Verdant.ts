import { Actor, Color, ImageSource, SpriteSheet, vec } from 'excalibur';
import verdantManifest from '../../assets/characters/verdant.manifest.json';
import { CharacterManifest } from '../assets/manifestTypes';

export class Verdant extends Actor {
  private static _sheet: SpriteSheet | null = null;
  private static _initialized = false;

  static async bootstrapCharacter(): Promise<void> {
    if (Verdant._initialized) return;
    const manifest = verdantManifest as CharacterManifest;
    const imgPath = `/assets/characters/${manifest.image}`;
    const img = new ImageSource(imgPath);
    await img.load();

    const cols = Math.floor(img.width / manifest.frameWidth);
    Verdant._sheet = SpriteSheet.fromImageSource({
      image: img,
      grid: {
        rows: Math.floor(img.height / manifest.frameHeight),
        columns: cols,
        spriteWidth: manifest.frameWidth,
        spriteHeight: manifest.frameHeight,
      },
    });
    Verdant._initialized = true;
  }

  constructor(x: number, y: number) {
    super({
      name: 'Verdant',
      pos: vec(x, y),
      width: 32,
      height: 32,
      color: Color.fromRGB(70, 210, 120),
    });
  }

  override onInitialize(): void {
    if (Verdant._sheet && !this.graphics.options.anchor) {
      const frame = Verdant._sheet.getSprite(0, 0);
      if (frame) {
        const manifest = verdantManifest as CharacterManifest;
        this.anchor = vec(manifest.anchor.x, manifest.anchor.y);
        this.graphics.use(frame);
      }
    }
  }
}
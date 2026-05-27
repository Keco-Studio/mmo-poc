import { Color, Scene } from 'excalibur';

export class VillageScene extends Scene {
  override onInitialize(): void {
    this.backgroundColor = Color.fromRGB(40, 80, 40);
  }
}

import { Color, Scene } from 'excalibur';
import { Player } from '../actors/Player';

export class VillageScene extends Scene {
  player!: Player;

  override onInitialize(): void {
    this.backgroundColor = Color.fromRGB(40, 80, 40);
    this.player = new Player();
    this.add(this.player);
  }
}

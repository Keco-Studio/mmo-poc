import { Color, Engine, Scene } from 'excalibur';
import { Player } from '../actors/Player';
import { updateGameState } from '../systems/RuntimeState';

export class VillageScene extends Scene {
  player!: Player;
  private _lastUpdateMs = 0;

  override onInitialize(): void {
    this.backgroundColor = Color.fromRGB(40, 80, 40);
    this.player = new Player();
    this.add(this.player);
  }

  override onPostUpdate(_engine: Engine, _elapsed: number): void {
    this._lastUpdateMs += _elapsed;
    if (this._lastUpdateMs < 1000) return;
    this._lastUpdateMs = 0;
    updateGameState({
      scene: 'village',
      ready: true,
      player: this.player,
    });
  }
}

import { Color, Engine, Scene } from 'excalibur';
import { Player } from '../actors/Player';
import { Verdant } from '../actors/Verdant';
import { updateGameState } from '../systems/RuntimeState';
import { updateInteractionPrompt } from '../systems/InteractionSystem';
import { InteractionPrompt } from '../ui/InteractionPrompt';
import { addMapToScene } from '../world/MapRenderer';
import npcs from '../data/npcs.json';

export class VillageScene extends Scene {
  player!: Player;
  npcs: Verdant[] = [];
  prompt!: InteractionPrompt;
  promptVisible = false;
  private _lastUpdateMs = 0;

  override onInitialize(): void {
    this.backgroundColor = Color.fromRGB(40, 80, 40);
    addMapToScene(this);
    this.player = new Player();
    this.add(this.player);

    this.npcs = npcs.map((npc) => new Verdant(npc.x, npc.y));
    for (const npc of this.npcs) this.add(npc);

    this.prompt = new InteractionPrompt();
    this.add(this.prompt);
  }

  override onPostUpdate(_engine: Engine, _elapsed: number): void {
    this._lastUpdateMs += _elapsed;
    this.promptVisible = updateInteractionPrompt(this.player, this.npcs, this.prompt);
    if (this._lastUpdateMs < 1000) return;
    this._lastUpdateMs = 0;
    updateGameState({
      scene: 'village',
      ready: true,
      player: this.player,
      npcs: this.npcs,
      promptVisible: this.promptVisible,
    });
  }
}

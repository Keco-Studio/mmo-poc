import { Color, Engine, Keys, Scene } from 'excalibur';
import { Player } from '../actors/Player';
import { Verdant } from '../actors/Verdant';
import { updateGameState } from '../systems/RuntimeState';
import { updateInteractionPrompt } from '../systems/InteractionSystem';
import { InteractionPrompt } from '../ui/InteractionPrompt';
import { DialogueBox } from '../ui/DialogueBox';
import { InspectorOverlay } from '../ui/InspectorOverlay';
import { addMapToScene, bootstrapTileAssets } from '../world/MapRenderer';
import npcs from '../data/npcs.json';
import dialogue from '../data/dialogue.json';

export class VillageScene extends Scene {
  player!: Player;
  npcs: Verdant[] = [];
  prompt!: InteractionPrompt;
  dialogueBox!: DialogueBox;
  promptVisible = false;
  dialogueOpen = false;
  private _inspector!: InspectorOverlay;
  private _lastUpdateMs = 0;

  override async onInitialize(): Promise<void> {
    this.backgroundColor = Color.fromRGB(40, 80, 40);
    await bootstrapTileAssets();
    await Verdant.bootstrapCharacter();
    addMapToScene(this);
    this.player = new Player();
    this.add(this.player);

    this.npcs = npcs.map((npc) => new Verdant(npc.x, npc.y));
    for (const npc of this.npcs) this.add(npc);

    this.prompt = new InteractionPrompt();
    this.add(this.prompt);

    this.dialogueBox = new DialogueBox();
    this.add(this.dialogueBox);

    this._inspector = new InspectorOverlay();
  }

  override onPreUpdate(engine: Engine): void {
    if (this.promptVisible && engine.input.keyboard.wasPressed(Keys.KeyE)) {
      this.dialogueBox.open(dialogue.verdant.speaker, dialogue.verdant.line);
      this.dialogueOpen = true;
    }
  }

  override onPostUpdate(_engine: Engine, _elapsed: number): void {
    this._lastUpdateMs += _elapsed;
    this.promptVisible = updateInteractionPrompt(this.player, this.npcs, this.prompt);
    if (this._lastUpdateMs < 1000) return;
    this._lastUpdateMs = 0;
    updateGameState({
      scene: 'village',
      ready: true,
      player: { x: Math.round(this.player.pos.x), y: Math.round(this.player.pos.y) },
      npcs: this.npcs.map(n => ({ id: n.name, name: n.name, x: Math.round(n.pos.x), y: Math.round(n.pos.y) })),
      promptVisible: this.promptVisible,
      dialogueOpen: this.dialogueOpen,
      errors: [],
    });
    this._inspector.update({
      fps: _engine.clock.fpsSampler.fps,
      player: { x: this.player.pos.x, y: this.player.pos.y },
      npcs: this.npcs.map(n => ({ id: n.name, name: n.name, x: n.pos.x, y: n.pos.y })),
      ui: { promptVisible: this.promptVisible, dialogueOpen: this.dialogueOpen },
      errors: [],
    });
  }
}
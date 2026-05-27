import { Color, Font, FontUnit, Label, TextAlign, vec } from 'excalibur';

export class InteractionPrompt extends Label {
  constructor() {
    super({
      text: 'Press E to talk',
      pos: vec(0, 0),
      font: new Font({
        size: 16,
        unit: FontUnit.Px,
        color: Color.White,
        textAlign: TextAlign.Center,
      }),
    });
    this.graphics.visible = false;
  }

  show(x: number, y: number): void {
    this.pos = vec(x, y - 42);
    this.graphics.visible = true;
  }

  hide(): void {
    this.graphics.visible = false;
  }

  get visiblePrompt(): boolean {
    return this.graphics.visible;
  }
}

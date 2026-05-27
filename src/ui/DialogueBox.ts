import { Actor, Color, Font, FontUnit, Label, Rectangle, vec } from 'excalibur';

export class DialogueBox extends Actor {
  private speaker = new Label({
    text: '',
    pos: vec(-340, -44),
    font: new Font({ size: 18, unit: FontUnit.Px, color: Color.White }),
  });

  private line = new Label({
    text: '',
    pos: vec(-340, -12),
    font: new Font({ size: 16, unit: FontUnit.Px, color: Color.White }),
  });

  constructor() {
    super({ pos: vec(400, 520), width: 720, height: 120 });
    this.graphics.use(new Rectangle({ width: 720, height: 120, color: Color.fromRGB(20, 20, 30) }));
    this.graphics.visible = false;
  }

  override onInitialize(): void {
    this.addChild(this.speaker);
    this.addChild(this.line);
  }

  open(speaker: string, line: string): void {
    this.speaker.text = speaker;
    this.line.text = line;
    this.graphics.visible = true;
    this.speaker.graphics.visible = true;
    this.line.graphics.visible = true;
  }

  close(): void {
    this.graphics.visible = false;
    this.speaker.graphics.visible = false;
    this.line.graphics.visible = false;
  }

  get isOpen(): boolean {
    return this.graphics.visible;
  }
}

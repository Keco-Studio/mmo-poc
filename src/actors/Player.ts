import { Actor, Color, Engine, Keys, vec } from 'excalibur';

const SPEED = 180;
const HALF_SIZE = 12;

export class Player extends Actor {
  constructor() {
    super({
      name: 'player',
      pos: vec(120, 120),
      width: HALF_SIZE * 2,
      height: HALF_SIZE * 2,
      color: Color.fromRGB(80, 160, 255),
    });
  }

  override onPreUpdate(engine: Engine, elapsedMs: number): void {
    const kb = engine.input.keyboard;
    const dx = Number(kb.isHeld(Keys.KeyD) || kb.isHeld(Keys.ArrowRight)) - Number(kb.isHeld(Keys.KeyA) || kb.isHeld(Keys.ArrowLeft));
    const dy = Number(kb.isHeld(Keys.KeyS) || kb.isHeld(Keys.ArrowDown)) - Number(kb.isHeld(Keys.KeyW) || kb.isHeld(Keys.ArrowUp));
    const length = Math.hypot(dx, dy) || 1;
    const step = SPEED * (elapsedMs / 1000);

    this.pos.x += (dx / length) * step;
    this.pos.y += (dy / length) * step;
    this.pos.x = Math.min(engine.drawWidth - HALF_SIZE, Math.max(HALF_SIZE, this.pos.x));
    this.pos.y = Math.min(engine.drawHeight - HALF_SIZE, Math.max(HALF_SIZE, this.pos.y));
  }
}

import { Actor, Color, vec } from 'excalibur';

export class Verdant extends Actor {
  constructor(x: number, y: number) {
    super({
      name: 'Verdant',
      pos: vec(x, y),
      width: 28,
      height: 32,
      color: Color.fromRGB(70, 210, 120),
    });
  }
}

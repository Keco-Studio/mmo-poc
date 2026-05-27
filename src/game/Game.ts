import { Engine } from 'excalibur';
import { VillageScene } from './VillageScene';

export function createGame(): Engine {
  return new Engine({
    width: 800,
    height: 600,
    canvasElementId: 'game',
    scenes: {
      village: VillageScene,
    },
  });
}

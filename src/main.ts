import { createGame } from './game/Game';

declare global {
  interface Window {
    __GAME_STATE__: {
      scene: string;
      ready: boolean;
    };
  }
}

window.__GAME_STATE__ = { scene: 'village', ready: false };

const game = createGame();
game.start().then(() => {
  game.goToScene('village');
  window.__GAME_STATE__ = { scene: 'village', ready: true };
});

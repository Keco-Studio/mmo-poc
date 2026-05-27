import { createGame } from './game/Game';
import { initializeGameState } from './systems/RuntimeState';

initializeGameState();

const game = createGame();
game.start().then(() => {
  game.goToScene('village');
});

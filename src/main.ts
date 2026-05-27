import { createGame } from './game/Game';
import { initializeGameState } from './systems/RuntimeState';
import { startErrorCollection } from './systems/ErrorCollector';

startErrorCollection();
initializeGameState();

const game = createGame();
game.start().then(() => {
  game.goToScene('village');
});

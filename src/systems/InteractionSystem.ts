import { Actor } from 'excalibur';
import { InteractionPrompt } from '../ui/InteractionPrompt';

const RANGE = 48;

export function updateInteractionPrompt(player: Actor, npcs: Actor[], prompt: InteractionPrompt): boolean {
  const nearest = npcs.find((npc) => player.pos.distance(npc.pos) <= RANGE);
  if (nearest) {
    prompt.show(nearest.pos.x, nearest.pos.y);
    return true;
  }
  prompt.hide();
  return false;
}

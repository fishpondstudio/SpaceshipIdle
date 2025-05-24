import type { GameState } from "@spaceship-idle/shared/src/game/GameState";
import type { Tile } from "@spaceship-idle/shared/src/utils/Helper";

export interface ITileWithGameState {
   tile: Tile;
   gs: GameState;
}

import type { GameState } from "@spaceship-idle/shared/src/game/GameState";
import { calcShipScore } from "@spaceship-idle/shared/src/game/logic/BattleLogic";
import { RPCClient } from "../rpc/RPCClient";

export async function AddShipToMatchmakingPool(gs: GameState): Promise<void> {
   const [score] = calcShipScore(gs);
   if (score <= 0) {
      return;
   }
   try {
      await RPCClient.saveShipV2(gs);
   } catch (e) {
      console.error(e);
   }
}

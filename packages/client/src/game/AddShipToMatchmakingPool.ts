import type { GameState } from "@spaceship-idle/shared/src/game/GameState";
import { calcShipScore } from "@spaceship-idle/shared/src/game/logic/BattleLogic";
import { getMatchmakingQuantum, getUsedQuantum } from "@spaceship-idle/shared/src/game/logic/ResourceLogic";
import { RPCClient } from "../rpc/RPCClient";

export async function AddShipToMatchmakingPool(gs: GameState): Promise<void> {
   if (getMatchmakingQuantum(gs) !== getUsedQuantum(gs)) {
      return;
   }
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

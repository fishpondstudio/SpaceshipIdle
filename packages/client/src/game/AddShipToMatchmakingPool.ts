import type { GameState } from "@spaceship-idle/shared/src/game/GameState";
import { calculateScore } from "@spaceship-idle/shared/src/game/logic/BattleLogic";
import { quantumQualified } from "@spaceship-idle/shared/src/game/logic/ResourceLogic";
import { RPCClient } from "../rpc/RPCClient";

export async function AddShipToMatchmakingPool(gs: GameState): Promise<void> {
   try {
      const ship = await RPCClient.findShip(quantumQualified(gs), [1, 1]);
      const score = calculateScore(gs, ship.json);
      if (score >= 0.5) {
         await RPCClient.saveShip(gs, score);
      }
   } catch (e) {
      console.error(e);
   }
}

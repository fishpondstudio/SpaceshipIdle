import type { GameState } from "@spaceship-idle/shared/src/game/GameState";
import { calcShipScore } from "@spaceship-idle/shared/src/game/logic/BattleLogic";
import { getQuantumQualified } from "@spaceship-idle/shared/src/game/logic/ResourceLogic";
import { RPCClient } from "../rpc/RPCClient";

export async function AddShipToMatchmakingPool(gs: GameState): Promise<void> {
   try {
      const ship = await RPCClient.findShip(getQuantumQualified(gs), [1, 1]);
      const [score] = calcShipScore(gs, ship.json);
      if (score >= 0.5) {
         await RPCClient.saveShip(gs, score);
      }
   } catch (e) {
      console.error(e);
   }
}

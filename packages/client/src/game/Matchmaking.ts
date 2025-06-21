import { hashGameState } from "@spaceship-idle/shared/src/game/GameState";
import type { IShip } from "@spaceship-idle/shared/src/rpc/ServerMessageTypes";
import { INT32_MAX } from "@spaceship-idle/shared/src/utils/Helper";
import { RPCClient } from "../rpc/RPCClient";
import { G } from "../utils/Global";

export async function findShip(score: number, hp: number, dps: number): Promise<IShip> {
   let range = 0.05;
   while (true) {
      try {
         const ship = await RPCClient.findShipV3(
            hashGameState(G.save.current),
            [0, INT32_MAX],
            [score / (1 + range * 2), score * (1 + range)],
            [0, hp * (1 + range)],
            [0, dps * (1 + range)],
         );
         return ship;
      } catch (e) {
         if (range > 1) {
            throw new Error("Failed to find an opponent");
         }
         range *= 2;
      }
   }
}

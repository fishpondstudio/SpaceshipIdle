import { hashGameState } from "@spaceship-idle/shared/src/game/GameState";
import type { IShip } from "@spaceship-idle/shared/src/rpc/ServerMessageTypes";
import { INT32_MAX } from "@spaceship-idle/shared/src/utils/Helper";
import { RPCClient } from "../rpc/RPCClient";
import { G } from "../utils/Global";
import { BattledShips } from "./BattledShips";

export async function findShip(score: number, hp: number, dps: number): Promise<IShip | undefined> {
   let range = 0.05;
   const excludedHash = Array.from(BattledShips);
   excludedHash.push(hashGameState(G.save.state));
   while (true) {
      try {
         const ship = await RPCClient.findShipV3(
            excludedHash,
            [0, INT32_MAX],
            [score / (1 + range * 2), score * (1 + range)],
            [0, hp * (1 + range)],
            [0, dps * (1 + range)],
         );
         return ship;
      } catch (e) {
         range *= 2;
         if (range > 0.5) {
            return undefined;
         }
      }
   }
}

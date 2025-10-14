import { hashGameState } from "@spaceship-idle/shared/src/game/GameState";
import type { IShip } from "@spaceship-idle/shared/src/rpc/ServerMessageTypes";
import { INT32_MAX, quadratic } from "@spaceship-idle/shared/src/utils/Helper";
import { RPCClient } from "../rpc/RPCClient";
import { G } from "../utils/Global";

export async function findShip(
   score: number,
   hp: number,
   dps: number,
   victoryRate: number,
): Promise<IShip | undefined> {
   let range = 0.01;
   const excludedHash = Array.from(G.save.data.battledShips);
   excludedHash.push(hashGameState(G.save.state));
   const factor = quadratic((victoryRate - 0.5) * 2) * 0.2;
   const min = () => 1 / (1 + range) + factor;
   const max = () => 1 + range + factor;
   while (true) {
      try {
         console.log(`findShip: base = ${factor}, min = ${min()}, max = ${max()}`);
         const ship = await RPCClient.findShipV3(
            excludedHash,
            [0, INT32_MAX],
            [score * min(), score * max()],
            [0, hp * max()],
            [0, dps * max()],
         );
         return ship;
      } catch {
         range *= 2;
         if (range > 0.1) {
            return undefined;
         }
      }
   }
}

import { forEach, mapSafeAdd, safeAdd, type Tile, type ValueOf } from "../../utils/Helper";
import { TypedEvent } from "../../utils/TypedEvent";
import { DamageType } from "../definitions/BuildingProps";
import type { GameState } from "../GameState";
import type { Runtime } from "./Runtime";
import type { RuntimeStat } from "./RuntimeStat";

export const TickProductionOption = {
   None: 0,
} as const;

export type TickProductionOption = ValueOf<typeof TickProductionOption>;

export function tickProduction(gs: GameState, stat: RuntimeStat, rt: Runtime): void {
   stat.constructed.clear();
   const tiles = Array.from(gs.tiles).sort(([tileA, dataA], [tileB, dataB]) => {
      return dataB.priority - dataA.priority;
   });
   tiles.forEach(([tile, data]) => {
      mapSafeAdd(stat.constructed, data.type, 1);
   });
   forEach(stat.rawDamagePerSec, (k, v) => {
      safeAdd(stat.rawDamage, k, v);
   });
   forEach(stat.actualDamagePerSec, (k, v) => {
      safeAdd(stat.actualDamage, k, v);
   });
   stat.rawDamages.push(stat.rawDamagePerSec);
   stat.actualDamages.push(stat.actualDamagePerSec);
   stat.rawDamagePerSec = { [DamageType.Kinetic]: 0, [DamageType.Explosive]: 0, [DamageType.Energy]: 0 };
   stat.actualDamagePerSec = { [DamageType.Kinetic]: 0, [DamageType.Explosive]: 0, [DamageType.Energy]: 0 };

   const [hp, maxHp] = rt.tabulateHp(gs.tiles);
   stat.currentHp = hp;
   stat.maxHp = maxHp + stat.destroyedHp;
}

export const RequestFloater = new TypedEvent<{ tile: Tile; amount: number }>();

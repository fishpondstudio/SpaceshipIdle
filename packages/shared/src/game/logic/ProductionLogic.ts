import { type Tile, type ValueOf, forEach, hasFlag, mapSafeAdd, safeAdd } from "../../utils/Helper";
import { TypedEvent } from "../../utils/TypedEvent";
import { L, t } from "../../utils/i18n";
import { Config } from "../Config";
import type { Inventory } from "../GameOption";
import type { GameState } from "../GameState";
import type { ElementSymbol } from "../PeriodicTable";
import { DamageType, type IBoosterDefinition, WeaponKey } from "../definitions/BuildingProps";
import { BattleStartAmmoCycles } from "../definitions/Constant";
import { getCooldownMultiplier } from "./BattleLogic";
import { BattleType } from "./BattleType";
import { getNormalizedValue, isBooster } from "./BuildingLogic";
import type { Runtime } from "./Runtime";
import type { RuntimeStat } from "./RuntimeStat";
import { type RuntimeTile, TileFlag } from "./RuntimeTile";
import { getTechName } from "./TechLogic";

export const TickProductionOption = {
   None: 0,
} as const;

export type TickProductionOption = ValueOf<typeof TickProductionOption>;

export function tickProduction(
   gs: GameState,
   stat: RuntimeStat,
   rt: Runtime,
   elements: Map<ElementSymbol, Inventory> | null,
): void {
   stat.delta.clear();

   stat.produced.forEach((v, k) => {
      mapSafeAdd(stat.delta, k, v - (stat.consumed.get(k) ?? 0));
   });

   stat.consumed.forEach((v, k) => {
      if (!stat.delta.has(k)) {
         stat.delta.set(k, -v);
      }
   });

   stat.consumed.clear();
   stat.produced.clear();
   stat.theoreticalConsumed.clear();
   stat.theoreticalProduced.clear();
   stat.constructed.clear();

   const tiles = Array.from(gs.tiles).sort(([tileA, dataA], [tileB, dataB]) => {
      return dataB.priority - dataA.priority;
   });

   // Consumption
   tiles.forEach(([tile, data]) => {
      mapSafeAdd(stat.constructed, data.type, 1);
      const def = Config.Buildings[data.type];
      const rs = rt.get(tile);
      if (!rs) return;

      gs.unlockedTech.forEach((tech) => {
         const def = Config.Tech[tech];
         forEach(def.multiplier, (building, amount) => {
            if (data.type === building) {
               rs.productionMultiplier.add(amount, getTechName(tech));
            }
         });
      });
      const element = def.element;
      if (element) {
         const thisRun = gs.elements.get(element) ?? 0;
         if (thisRun > 0) {
            rs.productionMultiplier.add(thisRun, t(L.ElementAmountThisRun, element));
         }
         const permanent = elements?.get(element)?.level ?? 0;
         if (permanent > 0) {
            rs.xpMultiplier.add(permanent, t(L.ElementPermanent, element));
         }
      }

      rs.insufficient.clear();
      forEach(def.input, (res, _amount) => {
         const amount = _amount * data.level * data.capacity;
         mapSafeAdd(stat.theoreticalConsumed, res, amount);
         if (rt.productionTick === 0) {
            mapSafeAdd(gs.resources, res, amount * BattleStartAmmoCycles);
         }
         if (res === "Power" && hasFlag(rs.props.flags, TileFlag.NoPower)) {
            rs.insufficient.add(res);
            return;
         }
         if ((gs.resources.get(res) ?? 0) < amount) {
            rs.insufficient.add(res);
            // This is here so that Power stat is more useful. The stat will not be double counted because
            // if this is true, it means we are lacking Power, and the stat won't be set later.
            if (res === "Power") {
               mapSafeAdd(stat.consumed, res, amount);
            }
         }
      });
      if (rs.insufficient.size > 0) return;
      forEach(def.input, (res, _amount) => {
         const amount = _amount * data.level * data.capacity;
         mapSafeAdd(gs.resources, res, -amount);
         mapSafeAdd(stat.consumed, res, amount);
      });
   });

   gs.resources.set("Power", 0);

   // Production
   tiles.forEach(([tile, data]) => {
      const def = Config.Buildings[data.type];
      const rs = rt.get(tile);
      if (!rs) return;

      forEach(def.output, (res, _amount) => {
         const amount = _amount * data.level * data.capacity * rs.productionMultiplier.value;
         mapSafeAdd(stat.theoreticalProduced, res, amount);
         if (rs.insufficient.size <= 0) {
            mapSafeAdd(gs.resources, res, amount);
            mapSafeAdd(stat.produced, res, amount);
            if (rt.battleType !== BattleType.Simulated) {
               RequestFloater.emit({ tile, amount });
            }
         }
      });

      if (isBooster(data.type)) {
         const booster = def as IBoosterDefinition;
         booster.tick(booster, rs, rt);
      }

      const xp = getNonWeaponBuildingXP(rs);
      if (xp > 0) {
         mapSafeAdd(stat.theoreticalProduced, "XP", xp);
         if (rs.insufficient.size <= 0) {
            mapSafeAdd(gs.resources, "XP", xp);
            mapSafeAdd(stat.produced, "XP", xp);
         }
      }

      if (WeaponKey in def) {
         forEach(def.output, (res, _amount) => {
            const ammo = getCooldownMultiplier(data) * _amount * data.level;
            const xp = (Config.Price.get(res) ?? 0) * ammo;
            mapSafeAdd(stat.theoreticalConsumed, res, ammo / def.fireCooldown);
            mapSafeAdd(stat.theoreticalProduced, "XP", xp / def.fireCooldown);
         });
      }
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

   const [hp, maxHP] = rt.tabulateHP(gs.tiles);
   if (hp >= stat.currentHP) {
      stat.undamagedSec++;
   } else {
      stat.undamagedSec = 0;
   }
   stat.currentHP = hp;
   stat.maxHP = maxHP + stat.destroyedHP;
}

export const RequestFloater = new TypedEvent<{ tile: Tile; amount: number }>();

export function getNonWeaponBuildingXP(rs: RuntimeTile): number {
   if (WeaponKey in rs.def) {
      return 0;
   }
   return getNormalizedValue(rs.data) * rs.data.capacity * rs.productionMultiplier.value * (rs.xpMultiplier.value - 1);
}

import { type Tile, type ValueOf, forEach, hasFlag, mapSafeAdd, safeAdd } from "../../utils/Helper";
import { TypedEvent } from "../../utils/TypedEvent";
import { L, t } from "../../utils/i18n";
import { Config } from "../Config";
import type { GameState } from "../GameState";
import { abilityTarget } from "../definitions/Ability";
import { DamageType, type IBoosterDefinition, WeaponKey } from "../definitions/BuildingProps";
import { BattleStartAmmoCycles } from "../definitions/Constant";
import { getCooldownMultiplier } from "./BattleLogic";
import { isBooster } from "./BuildingLogic";
import type { Runtime } from "./Runtime";
import type { RuntimeStat } from "./RuntimeStat";
import { RuntimeFlag } from "./RuntimeTile";
import { getSide } from "./ShipLogic";
import { getTechName } from "./TechLogic";

export const TickProductionOption = {
   None: 0,
} as const;

export type TickProductionOption = ValueOf<typeof TickProductionOption>;

export function tickProduction(gs: GameState, stat: RuntimeStat, rt: Runtime): void {
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
   stat.theoreticalConsumed.clear();
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
               rs.productionMultiplier.add(amount, t(L.ResearchX, getTechName(tech)));
               rs.xpMultiplier.add(amount, t(L.ResearchX, getTechName(tech)));
            }
         });
      });
      const element = def.element;
      if (element) {
         const thisRun = gs.elements.get(element) ?? 0;
         if (thisRun > 0) {
            rs.productionMultiplier.add(thisRun, t(L.ElementAmountThisRun, element));
         }
         const permanent = gs.permanentElements.get(element)?.production ?? 0;
         if (permanent > 0) {
            rs.productionMultiplier.add(permanent, t(L.ElementPermanent, element));
         }
         const xp = gs.permanentElements.get(element)?.xp ?? 0;
         if (xp > 0) {
            rs.xpMultiplier.add(xp, t(L.ElementPermanent, element));
         }
      }

      rs.insufficient.clear();
      forEach(def.input, (res, _amount) => {
         if (res === "Power") {
            if (hasFlag(rs.props.runtimeFlag, RuntimeFlag.NoPower)) {
               rs.insufficient.add(res);
            }
            const amount = _amount * data.level;
            if (rt.productionTick === 0) {
               mapSafeAdd(gs.resources, res, amount);
            }
            if ((gs.resources.get(res) ?? 0) < amount) {
               rs.insufficient.add(res);
            }
         } else {
            const amount = _amount * data.level * data.capacity;
            if (rt.productionTick === 0) {
               mapSafeAdd(gs.resources, res, amount * BattleStartAmmoCycles);
            }
            mapSafeAdd(stat.theoreticalConsumed, res, amount);
            if ((gs.resources.get(res) ?? 0) < amount) {
               rs.insufficient.add(res);
            }
         }
      });

      // Here we consume Power regardless of other input resources. Because weapon firing
      // also requires Power.
      if (def.input.Power) {
         const amount = def.input.Power * data.level;
         if (!rs.insufficient.has("Power")) {
            mapSafeAdd(gs.resources, "Power", -amount);
         }
         // We deduct Power from stat even if there isn't enough. This makes the Power stat more useful!
         mapSafeAdd(stat.consumed, "Power", amount);
         mapSafeAdd(stat.theoreticalConsumed, "Power", amount);
      }

      if (rs.insufficient.size > 0) return;
      if (hasFlag(rs.props.runtimeFlag, RuntimeFlag.NoProduction)) return;

      forEach(def.input, (res, _amount) => {
         // Power is handled above!
         if (res === "Power") return;
         const amount = _amount * data.level * data.capacity;
         mapSafeAdd(gs.resources, res, -amount);
         mapSafeAdd(stat.consumed, res, amount);
      });
   });

   gs.resources.set("Power", 0);

   stat.produced.clear();
   stat.theoreticalProduced.clear();

   // Production
   tiles.forEach(([tile, data]) => {
      const def = Config.Buildings[data.type];
      const rs = rt.get(tile);
      if (!rs) return;

      forEach(def.output, (res, _amount) => {
         const amount = _amount * data.level * data.capacity * rs.productionMultiplier.value;
         mapSafeAdd(stat.theoreticalProduced, res, amount);

         if (hasFlag(rs.props.runtimeFlag, RuntimeFlag.NoProduction)) return;
         if (rs.insufficient.size > 0) return;

         mapSafeAdd(gs.resources, res, amount);
         mapSafeAdd(stat.produced, res, amount);
      });

      if (isBooster(data.type)) {
         const booster = def as IBoosterDefinition;
         abilityTarget(getSide(rs.tile), booster.range, rs.tile, rt.tiles).forEach((target) => {
            if (target === rs.tile) return;
            rt.get(target)?.addStatusEffect(booster.effect, rs.tile, rs.data.type, 1, 0);
         });
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

   const [hp, maxHp] = rt.tabulateHp(gs.tiles);
   stat.currentHp = hp;
   stat.maxHp = maxHp + stat.destroyedHp;
}

export const RequestFloater = new TypedEvent<{ tile: Tile; amount: number }>();

import { Config } from "@spaceship-idle/shared/src/game/Config";
import { DamageTypeLabel, WeaponKey } from "@spaceship-idle/shared/src/game/definitions/BuildingProps";
import type { Building } from "@spaceship-idle/shared/src/game/definitions/Buildings";
import { getCooldownMultiplier } from "@spaceship-idle/shared/src/game/logic/BattleLogic";
import {
   getBuildingDesc,
   getNormalizedValue,
   normalizedValueToHp,
} from "@spaceship-idle/shared/src/game/logic/BuildingLogic";
import { formatNumber } from "@spaceship-idle/shared/src/utils/Helper";
import { L, t } from "@spaceship-idle/shared/src/utils/i18n";
import { AbilityComp } from "./AbilityComp";

export function BuildingInfoComp({ building }: { building: Building }): React.ReactNode {
   const def = Config.Buildings[building];
   const normVal = getNormalizedValue({ type: building, level: 1 });
   const dmgPerFire = normVal * getCooldownMultiplier({ type: building });
   return (
      <>
         <div className="subtitle">{t(L.Production)}</div>
         <div>{getBuildingDesc(building)}</div>
         <div className="subtitle">{t(L.Defense)}</div>
         <div className="row">
            <div className="f1">{t(L.HP)}</div>
            <div>{formatNumber(normalizedValueToHp(normVal, building))}</div>
         </div>
         <div className="row g5">
            <div className="f1">{t(L.Armor)}</div>
            <div>{formatNumber(def.armor[0])}</div>
            <div className="text-green">+{formatNumber(def.armor[1])}</div>
         </div>
         <div className="row g5">
            <div className="f1">{t(L.Shield)}</div>
            <div>{formatNumber(def.shield[0])}</div>
            <div className="text-green">+{formatNumber(def.shield[1])}</div>
         </div>
         <div className="row g5">
            <div className="f1">{t(L.Deflection)}</div>
            <div>{formatNumber(def.deflection[0])}</div>
            <div className="text-green">+{formatNumber(def.deflection[1])}</div>
         </div>
         <div className="row g5">
            <div className="f1">{t(L.Evasion)}</div>
            <div>{formatNumber(def.evasion[0])}</div>
            <div className="text-green">+{formatNumber(def.evasion[1])}</div>
         </div>
         {WeaponKey in def ? (
            <>
               <div className="subtitle">{t(L.Attack)}</div>
               <div className="row g5">
                  <div className="f1">{t(L.Damage)}</div>
                  <div>{formatNumber((dmgPerFire * def.damagePct) / def.projectiles)}</div>
                  <div className="text-space">({DamageTypeLabel[def.damageType]()})</div>
               </div>
               <div className="row g5">
                  <div className="f1">{t(L.FireCooldown)}</div>
                  <div>{formatNumber(def.fireCooldown)}</div>
               </div>
               <div className="row g5">
                  <div className="f1">{t(L.ProjectileSpeed)}</div>
                  <div>{formatNumber(def.projectileSpeed)}</div>
               </div>
               <div className="row g5">
                  <div className="f1">{t(L.ProjectileCount)}</div>
                  <div>{formatNumber(def.projectiles)}</div>
               </div>
               <AbilityComp level={1} building={building} title={<div className="subtitle">{t(L.Ability)}</div>} />
            </>
         ) : null}
      </>
   );
}

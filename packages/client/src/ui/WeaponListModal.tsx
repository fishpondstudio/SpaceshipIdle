import { Tooltip } from "@mantine/core";
import { Config } from "@spaceship-idle/shared/src/game/Config";
import { AbilityRangeLabel, AbilityTimingLabel } from "@spaceship-idle/shared/src/game/definitions/Ability";
import {
   DamageTypeLabel,
   type IBuildingDefinition,
   WeaponKey,
} from "@spaceship-idle/shared/src/game/definitions/BuildingProps";
import type { Building } from "@spaceship-idle/shared/src/game/definitions/Buildings";
import { StatusEffects } from "@spaceship-idle/shared/src/game/definitions/StatusEffect";
import { getBuildingName, getDamagePerFire, getHP } from "@spaceship-idle/shared/src/game/logic/BuildingLogic";
import { DefaultMultipliers } from "@spaceship-idle/shared/src/game/logic/IMultiplier";
import { getTechForBuilding, getTechName } from "@spaceship-idle/shared/src/game/logic/TechLogic";
import { formatNumber, mapOf } from "@spaceship-idle/shared/src/utils/Helper";
import { L, t } from "@spaceship-idle/shared/src/utils/i18n";
import { BuildingInfoComp } from "./components/BuildingInfoComp";
import { TextureComp } from "./components/TextureComp";

export function WeaponListModal(): React.ReactNode {
   return (
      <div className="panel p0 m10">
         <table className="data-table">
            <thead>
               <tr>
                  <th></th>
                  <th></th>
                  <th className="text-right">{t(L.HP)}</th>
                  <th className="text-right">{t(L.ArmorShort)}</th>
                  <th className="text-right">{t(L.ShieldShort)}</th>
                  <th className="text-right">{t(L.DeflectionShort)}</th>
                  <th className="text-right">{t(L.EvasionShort)}</th>
                  <th className="text-right">{t(L.DamageAndCooldownShort)}</th>
                  <th className="text-right">{t(L.ProjectilePerFireAndSpeedShort)}</th>
                  <th className="text-left">{t(L.Ability)}</th>
               </tr>
            </thead>
            <tbody>
               {mapOf(Config.Buildings as Record<Building, IBuildingDefinition>, (building, _def) => {
                  if (!(WeaponKey in _def)) {
                     return null;
                  }
                  const def = _def as IBuildingDefinition;
                  const dmgPerFire = getDamagePerFire({ type: building, level: 1 });
                  return (
                     <tr key={building}>
                        <td className="condensed">
                           <Tooltip w={350} label={<BuildingInfoComp building={building} />}>
                              <TextureComp style={{ margin: 2 }} name={`Building/${building}`} width={40} />
                           </Tooltip>
                        </td>
                        <td>
                           <div>{getBuildingName(building)}</div>
                           <div className="text-xs text-space">{getTechName(getTechForBuilding(building))}</div>
                        </td>
                        <td className="text-right">{formatNumber(getHP({ type: building, level: 1 }))}</td>
                        <td className="text-right">
                           <div>{formatNumber(def.armor[0])}</div>
                           <div className="text-right text-green">+{formatNumber(def.armor[1])}</div>
                        </td>
                        <td className="text-right">
                           <div className="text-right">{formatNumber(def.shield[0])}</div>
                           <div className="text-right text-green">+{formatNumber(def.shield[1])}</div>
                        </td>
                        <td className="text-right">
                           <div>{formatNumber(def.deflection[0])}</div>
                           <div className="text-green">+{formatNumber(def.deflection[1])}</div>
                        </td>
                        <td className="text-right">
                           <div>{formatNumber(def.evasion[0])}</div>
                           <div className="text-green">+{formatNumber(def.evasion[1])}</div>
                        </td>
                        <td className="text-right">
                           <div>
                              {formatNumber((dmgPerFire * def.damagePct) / def.projectiles)}
                              {" / "}
                              {t(L.AbilityDurationSeconds, def.fireCooldown)}
                           </div>
                           <div className="text-xs text-space">{DamageTypeLabel[def.damageType]()}</div>
                        </td>
                        <td className="text-right">
                           <div>
                              {formatNumber(def.projectiles)} / {formatNumber(def.projectileSpeed)}
                           </div>
                        </td>
                        <td>
                           {def.ability ? (
                              <div>
                                 <div className="text-xs">{StatusEffects[def.ability.effect].name()}</div>
                                 <div className="text-xs text-space">
                                    {t(L.AbilityDurationSeconds, def.ability.duration(building, 1, DefaultMultipliers))}
                                    {" / "}
                                    {AbilityRangeLabel[def.ability.range]()}
                                    {" / "}
                                    {AbilityTimingLabel[def.ability.timing]()}
                                 </div>
                              </div>
                           ) : null}
                        </td>
                     </tr>
                  );
               })}
            </tbody>
         </table>
      </div>
   );
}

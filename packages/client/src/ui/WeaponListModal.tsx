import { SegmentedControl } from "@mantine/core";
import { Config } from "@spaceship-idle/shared/src/game/Config";
import {
   AbilityRangeLabel,
   AbilityRangeTexture,
   AbilityTimingLabel,
} from "@spaceship-idle/shared/src/game/definitions/Ability";
import { DamageTypeLabel } from "@spaceship-idle/shared/src/game/definitions/BuildingProps";
import { ShipClass } from "@spaceship-idle/shared/src/game/definitions/ShipClass";
import { StatusEffects } from "@spaceship-idle/shared/src/game/definitions/StatusEffect";
import {
   getBuildingName,
   getDamagePerFire,
   getHP,
   getUnlockableBuildings,
} from "@spaceship-idle/shared/src/game/logic/BuildingLogic";
import { DefaultMultipliers } from "@spaceship-idle/shared/src/game/logic/IMultiplier";
import { getTechForBuilding, getTechName, getTechShipClass } from "@spaceship-idle/shared/src/game/logic/TechLogic";
import { formatNumber } from "@spaceship-idle/shared/src/utils/Helper";
import { L, t } from "@spaceship-idle/shared/src/utils/i18n";
import { useState } from "react";
import { G } from "../utils/Global";
import { BuildingInfoComp } from "./components/BuildingInfoComp";
import { FloatingTip } from "./components/FloatingTip";
import { TextureComp } from "./components/TextureComp";

type SortBy = "tech" | "type";

export function WeaponListModal(): React.ReactNode {
   const [sortBy, setSortBy] = useState<SortBy>("tech");
   const buildings = getUnlockableBuildings();
   if (sortBy === "type") {
      buildings.sort((a, b) => {
         return Config.Buildings[a].code.localeCompare(Config.Buildings[b].code);
      });
   }
   return (
      <>
         <div className="panel m10 row p0">
            <div />
            <div className="mi">sort</div>
            <div className="f1">{t(L.SortAndGroupBy)}</div>
            <SegmentedControl
               data={[
                  { label: t(L.WeaponTech), value: "tech" },
                  { label: t(L.WeaponType), value: "type" },
               ]}
               onChange={(value) => setSortBy(value as SortBy)}
               value={sortBy}
            />
         </div>
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
                  {buildings.map((building) => {
                     const def = Config.Buildings[building];
                     const dmgPerFire = getDamagePerFire({ type: building, level: 1 });
                     const tech = getTechForBuilding(building);
                     if (!tech) {
                        return null;
                     }
                     const rangeTexture = def.ability ? AbilityRangeTexture[def.ability.range] : null;
                     if (rangeTexture && !G.textures.has(rangeTexture)) {
                        console.error(`Texture not found for AbilityRange: ${rangeTexture}`);
                     }
                     return (
                        <tr key={building}>
                           <td className="condensed">
                              <FloatingTip w={350} label={<BuildingInfoComp building={building} />}>
                                 <TextureComp style={{ margin: 2 }} name={`Building/${building}`} width={32} />
                              </FloatingTip>
                           </td>
                           <td>
                              <div>{getBuildingName(building)}</div>
                              <div className="text-xs text-space">
                                 {ShipClass[getTechShipClass(tech)].name()} / {getTechName(tech)}
                              </div>
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
                                 <div className="row g5">
                                    <div className="f1">
                                       <div className="text-xs">{StatusEffects[def.ability.effect].name()}</div>
                                       <div className="text-xs text-space">
                                          {t(
                                             L.AbilityDurationSeconds,
                                             def.ability.duration(building, 1, DefaultMultipliers),
                                          )}
                                          {" / "}
                                          {AbilityRangeLabel[def.ability.range]()}
                                          {" / "}
                                          {AbilityTimingLabel[def.ability.timing]()}
                                       </div>
                                    </div>
                                    {rangeTexture && G.textures.has(rangeTexture) && (
                                       <FloatingTip label={AbilityRangeLabel[def.ability.range]()}>
                                          <TextureComp name={rangeTexture} />
                                       </FloatingTip>
                                    )}
                                 </div>
                              ) : null}
                           </td>
                        </tr>
                     );
                  })}
               </tbody>
            </table>
         </div>
      </>
   );
}

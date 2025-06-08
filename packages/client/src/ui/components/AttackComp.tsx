import { Badge, Divider, Space, Tooltip } from "@mantine/core";
import { Config } from "@spaceship-idle/shared/src/game/Config";
import { DamageTypeLabel, ProjectileFlag, WeaponKey } from "@spaceship-idle/shared/src/game/definitions/BuildingProps";
import { getCooldownMultiplier } from "@spaceship-idle/shared/src/game/logic/BattleLogic";
import { formatNumber, hasFlag, mapOf } from "@spaceship-idle/shared/src/utils/Helper";
import { L, t } from "@spaceship-idle/shared/src/utils/i18n";
import { G } from "../../utils/Global";
import type { ITileWithGameState } from "../ITileWithGameState";
import { AbilityComp } from "./AbilityComp";
import { RenderHTML } from "./RenderHTMLComp";
import { ResourceAmount } from "./ResourceAmountComp";
import { TitleComp } from "./TitleComp";

export function AttackComp({ tile, gs }: ITileWithGameState): React.ReactNode {
   const data = gs.tiles.get(tile);
   if (!data) {
      return null;
   }
   const def = Config.Buildings[data?.type];
   if (!(WeaponKey in def)) {
      return null;
   }
   const rs = G.runtime.get(tile);
   if (!rs) {
      return null;
   }
   return (
      <>
         <div className="divider my10" />
         <TitleComp>{t(L.Attack)}</TitleComp>
         <div className="divider my10" />
         <div className="mx10">
            <div className="row my10">
               <div className="f1">{t(L.Damage)}</div>
               <Badge variant="outline">{DamageTypeLabel[def.damageType]()}</Badge>
               <div>{formatNumber(rs.props.damagePerProjectile)}</div>
            </div>
            <div className="row my10">
               <div className="f1">{t(L.FireCooldown)}</div>
               <div>{formatNumber(rs.props.fireCooldown)}</div>
            </div>
            <div className="row my10">
               <div className="f1">{t(L.ProjectileSpeed)}</div>
               <div>{formatNumber(rs.props.projectileSpeed)}</div>
            </div>
            {rs.props.projectiles > 1 ? (
               <div className="row my10">
                  <div className="f1">{t(L.ProjectileCount)}</div>
                  <div>{formatNumber(rs.props.projectiles)}</div>
               </div>
            ) : null}
            {hasFlag(rs.props.projectileFlag, ProjectileFlag.LaserDamage) ? (
               <div className="row my10">
                  <div className="f1">{t(L.LaserProjectile)}</div>
                  <Tooltip label={t(L.LaserProjectileDesc)} multiline maw="30vw">
                     <div className="mi">info</div>
                  </Tooltip>
               </div>
            ) : null}
            <div className="subtitle">{t(L.Ammo)}</div>
            {mapOf(def.output, (res, amount_) => {
               const amount = amount_ * getCooldownMultiplier(data);
               return (
                  <div key={res}>
                     <div className="row" key={res}>
                        <div>{Config.Resources[res].name()}</div>
                        {rs.insufficient.has(res) ? <div className="mi text-yellow">error</div> : null}
                        <div className="f1" />
                        <ResourceAmount res={res} amount={amount * data.level} />
                     </div>
                     <div style={{ textAlign: "right" }}>
                        <Tooltip multiline maw="30vw" label={<RenderHTML html={t(L.WeaponBuildingXPHTML)} />}>
                           <div
                              className="text-space"
                              style={{ textAlign: "right", fontSize: "var(--mantine-font-size-sm)" }}
                           >
                              +
                              {formatNumber((Config.Price.get(res) ?? 0) * amount * data.level * rs.xpMultiplier.value)}{" "}
                              {t(L.XP)}
                           </div>
                        </Tooltip>
                     </div>
                  </div>
               );
            })}
            {rs.xpMultiplier.value > 1 ? (
               <>
                  <Divider my="sm" variant="dashed" label={`${t(L.XPMultiplier)} x${rs.xpMultiplier.value}`} />
                  <div className="row text-sm">
                     <div className="f1">{t(L.BaseMultiplier)}</div>
                     <div>1</div>
                  </div>
                  {rs.xpMultiplier.detail.map((m) => {
                     return (
                        <div className="row text-sm" key={m.source}>
                           <div className="f1">{m.source}</div>
                           <div className="text-green">+{formatNumber(m.value)}</div>
                        </div>
                     );
                  })}
               </>
            ) : null}
            {rs.props.ability ? (
               <div className="text-sm">
                  <AbilityComp
                     level={data.level}
                     building={data.type}
                     space={<Space h="sm" />}
                     title={<div className="subtitle">{t(L.Ability)}</div>}
                  />
               </div>
            ) : null}
         </div>
      </>
   );
}

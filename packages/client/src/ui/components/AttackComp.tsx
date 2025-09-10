import { Badge, Switch } from "@mantine/core";
import { Config } from "@spaceship-idle/shared/src/game/Config";
import { DamageTypeLabel, ProjectileFlag } from "@spaceship-idle/shared/src/game/definitions/BuildingProps";
import { GameOptionUpdated } from "@spaceship-idle/shared/src/game/GameOption";
import { getDamagePerFire } from "@spaceship-idle/shared/src/game/logic/BuildingLogic";
import { formatNumber, hasFlag } from "@spaceship-idle/shared/src/utils/Helper";
import { L, t } from "@spaceship-idle/shared/src/utils/i18n";
import { useState } from "react";
import { G } from "../../utils/Global";
import { refreshOnTypedEvent } from "../../utils/Hook";
import type { ITileWithGameState } from "../ITileWithGameState";
import { AbilityComp } from "./AbilityComp";
import { FloatingTip } from "./FloatingTip";
import { html } from "./RenderHTMLComp";
import { StatComp } from "./StatComp";
import { TextureComp } from "./TextureComp";
import { TitleComp } from "./TitleComp";

export function AttackComp({ tile, gs }: ITileWithGameState): React.ReactNode {
   refreshOnTypedEvent(GameOptionUpdated);
   const [perSec, setPerSec] = useState(false);
   const data = gs.tiles.get(tile);
   if (!data) {
      return null;
   }
   const def = Config.Buildings[data?.type];
   const rs = G.runtime.get(tile);
   if (!rs) {
      return null;
   }
   let xp = getDamagePerFire({ type: data.type, level: data.level });
   if (perSec) {
      xp /= rs.props.fireCooldown;
   }
   return (
      <>
         <div className="divider my10" />
         <TitleComp>{t(L.Attack)}</TitleComp>
         <div className="divider my10" />
         <div className="mx10">
            <div className="row">
               <div className="f1">{t(L.Damage)}</div>
               <Badge variant="outline">{DamageTypeLabel[def.damageType]()}</Badge>
               <div>
                  <StatComp current={rs.props.damagePerProjectile} original={rs.originalProps.damagePerProjectile} />
               </div>
            </div>
            {rs.damageMultiplier.detail.length > 1 ? (
               <>
                  <div className="h10" />
                  <div className="subtitle">
                     {t(L.DamageMultiplier)} x{formatNumber(rs.damageMultiplier.value)}
                  </div>
                  {rs.damageMultiplier.detail.map((m) => {
                     return (
                        <div className="row text-sm" key={m.source}>
                           <div className="f1">{m.source}</div>
                           <div className="text-green">+{formatNumber(m.value)}</div>
                        </div>
                     );
                  })}
                  <div className="divider dashed mx-10 my10" />
               </>
            ) : null}
            <div className="row">
               <div className="f1">{t(L.FireCooldown)}</div>
               <div>
                  <StatComp current={rs.props.fireCooldown} original={rs.originalProps.fireCooldown} flip />
               </div>
            </div>
            <div className="row">
               <div className="f1">{t(L.ProjectileSpeed)}</div>
               <div>
                  <StatComp current={rs.props.projectileSpeed} original={rs.originalProps.projectileSpeed} />
               </div>
            </div>
            {rs.props.projectiles > 1 ? (
               <div className="row">
                  <div className="f1">{t(L.ProjectileCount)}</div>
                  <div>
                     <StatComp current={rs.props.projectiles} original={rs.originalProps.projectiles} />
                  </div>
               </div>
            ) : null}
            {hasFlag(rs.props.projectileFlag, ProjectileFlag.LaserDamage) ? (
               <div className="row">
                  <div className="f1">{t(L.LaserProjectile)}</div>
                  <FloatingTip label={html(t(L.LaserProjectileDesc))}>
                     <div className="mi">info</div>
                  </FloatingTip>
               </div>
            ) : null}
            {hasFlag(rs.props.projectileFlag, ProjectileFlag.DroneDamage) ? (
               <div className="row">
                  <div className="f1">{t(L.DroneProjectile)}</div>
                  <FloatingTip label={html(t(L.DroneProjectileDesc))}>
                     <div className="mi">info</div>
                  </FloatingTip>
               </div>
            ) : null}
         </div>
         {rs.props.ability ? (
            <div className="text-sm mx10">
               <AbilityComp
                  level={data.level}
                  building={data.type}
                  space={<div className="h5" />}
                  title={<div className="subtitle">{t(L.Ability)}</div>}
               />
            </div>
         ) : null}
         <div className="divider my10" />
         <TitleComp>
            <div>{t(L.XP)}</div>
            <div className="f1" />
            {t(L.PerFire)}
            <Switch className="mx5" size="xs" checked={perSec} onChange={() => setPerSec(!perSec)} />
            {t(L.PerSec)}
         </TitleComp>
         <div className="divider my10" />
         <div className="mx10">
            <div className="row g5">
               <TextureComp name="Others/XP" />
               <div>
                  {t(L.XP)} {perSec ? t(L.PerSec) : t(L.PerFire)}
               </div>
               <div className="f1" />
               <div>
                  <StatComp current={xp * (rs.hpMultiplier.value + rs.damageMultiplier.value - 1)} original={xp} />
               </div>
            </div>
            {rs.xpMultiplier.value > 1 || rs.hpMultiplier.value > 1 || rs.damageMultiplier.value > 1 ? (
               <div className="text-sm">
                  <div className="subtitle">
                     {t(L.XPMultiplier)} x
                     {formatNumber(rs.xpMultiplier.value + rs.damageMultiplier.value - 1 + rs.hpMultiplier.value - 1)}
                  </div>
                  {rs.xpMultiplier.detail.map((m) => {
                     return (
                        <div className="row g5" key={m.source}>
                           <div className="f1">{m.source}</div>
                           <div className="text-green">+{formatNumber(m.value)}</div>
                        </div>
                     );
                  })}
                  {rs.hpMultiplier.value > 1 ? (
                     <div className="row g5">
                        <div className="f1">{t(L.FromExtraHpMultiplier)}</div>
                        <div className="text-green">+{formatNumber(rs.hpMultiplier.value - 1)}</div>
                     </div>
                  ) : null}
                  {rs.damageMultiplier.value > 1 ? (
                     <div className="row g5">
                        <div className="f1">{t(L.FromExtraDamageMultiplier)}</div>
                        <div className="text-green">+{formatNumber(rs.damageMultiplier.value - 1)}</div>
                     </div>
                  ) : null}
               </div>
            ) : null}
         </div>
      </>
   );
}

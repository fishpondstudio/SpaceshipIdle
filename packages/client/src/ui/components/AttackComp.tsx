import { Badge, Switch, Tooltip } from "@mantine/core";
import { Config } from "@spaceship-idle/shared/src/game/Config";
import { DamageTypeLabel, ProjectileFlag, WeaponKey } from "@spaceship-idle/shared/src/game/definitions/BuildingProps";
import { GameOptionUpdated } from "@spaceship-idle/shared/src/game/GameOption";
import { getDamagePerFire } from "@spaceship-idle/shared/src/game/logic/BuildingLogic";
import { formatNumber, hasFlag } from "@spaceship-idle/shared/src/utils/Helper";
import { L, t } from "@spaceship-idle/shared/src/utils/i18n";
import { useState } from "react";
import { G } from "../../utils/Global";
import { refreshOnTypedEvent } from "../../utils/Hook";
import type { ITileWithGameState } from "../ITileWithGameState";
import { AbilityComp } from "./AbilityComp";
import { RenderHTML } from "./RenderHTMLComp";
import { StatComp } from "./StatComp";
import { XPIcon } from "./SVGIcons";
import { TitleComp } from "./TitleComp";

export function AttackComp({ tile, gs }: ITileWithGameState): React.ReactNode {
   refreshOnTypedEvent(GameOptionUpdated);
   const [perSec, setPerSec] = useState(false);
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
            {rs.damageMultiplier.detail.length > 0 ? (
               <>
                  <div className="h10" />
                  <div className="subtitle">
                     {t(L.DamageMultiplier)} x{formatNumber(rs.damageMultiplier.value)}
                  </div>
                  <div className="row text-sm">
                     <div className="f1">{t(L.BaseMultiplier)}</div>
                     <div>1</div>
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
                  <Tooltip label={<RenderHTML html={t(L.LaserProjectileDesc)} />} multiline maw="30vw">
                     <div className="mi">info</div>
                  </Tooltip>
               </div>
            ) : null}
            {hasFlag(rs.props.projectileFlag, ProjectileFlag.DroneDamage) ? (
               <div className="row">
                  <div className="f1">{t(L.DroneProjectile)}</div>
                  <Tooltip label={<RenderHTML html={t(L.DroneProjectileDesc)} />} multiline maw="30vw">
                     <div className="mi">info</div>
                  </Tooltip>
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
               <XPIcon />
               <div>{perSec ? t(L.PerSec) : t(L.PerFire)}</div>
               <div className="f1" />
               <div>
                  <StatComp current={xp * (rs.hpMultiplier.value + rs.damageMultiplier.value - 1)} original={xp} />
               </div>
            </div>
            <div className="text-sm text-dimmed">
               <div className="row g5">
                  <div style={{ width: 24 }} />
                  <div className="f1">{t(L.BaseMultiplier)}</div>
                  <div>1</div>
               </div>
               {rs.hpMultiplier.value > 1 ? (
                  <div className="row g5">
                     <div style={{ width: 24 }} />
                     <div className="f1">{t(L.HPMultiplier)}</div>
                     <div>+{formatNumber(rs.hpMultiplier.value - 1)}</div>
                  </div>
               ) : null}
               {rs.damageMultiplier.value > 1 ? (
                  <div className="row g5">
                     <div style={{ width: 24 }} />
                     <div className="f1">{t(L.DamageMultiplier)}</div>
                     <div>+{formatNumber(rs.damageMultiplier.value - 1)}</div>
                  </div>
               ) : null}
            </div>
         </div>
      </>
   );
}

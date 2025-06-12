import { Progress, Tooltip } from "@mantine/core";
import { Config } from "@spaceship-idle/shared/src/game/Config";
import {
   damageAfterArmor,
   damageAfterDeflection,
   damageAfterShield,
   evasionChance,
} from "@spaceship-idle/shared/src/game/logic/BattleLogic";
import { formatPercent } from "@spaceship-idle/shared/src/utils/Helper";
import { L, t } from "@spaceship-idle/shared/src/utils/i18n";
import { memo } from "react";
import { G } from "../../utils/Global";
import type { ITileWithGameState } from "../ITileWithGameState";
import { StatComp } from "./StatComp";
import { TitleComp } from "./TitleComp";

const Progress_ = memo(Progress, (oldProps, newProps) => {
   return oldProps.value === newProps.value;
});

export function DefenseComp({ tile, gs }: ITileWithGameState): React.ReactNode {
   const data = gs.tiles.get(tile);
   if (!data) {
      return null;
   }
   const def = Config.Buildings[data?.type];
   const rs = G.runtime.get(tile);
   if (!rs) {
      return null;
   }
   return (
      <>
         <div className="divider my10" />
         <TitleComp>{t(L.Defense)}</TitleComp>
         <div className="divider my10" />
         <div className="mx10">
            <div className="row">
               <div className="f1">{t(L.HP)}</div>
               <div>
                  <StatComp current={rs.props.hp} original={rs.originalProps.hp} />
               </div>
            </div>
            <Tooltip label={formatPercent((rs.props.hp - rs.damageTaken) / rs.props.hp)}>
               <Progress_ value={(100 * (rs.props.hp - rs.damageTaken)) / rs.props.hp} mb="xs" />
            </Tooltip>
            <Tooltip
               label={
                  <>
                     <div>{t(L.PropertyTooltip, def.armor[0], def.armor[1])}</div>
                     <div>{t(L.ArmorTooltip, formatPercent(1 - damageAfterArmor(rs.props.armor)))}</div>
                  </>
               }
            >
               <div className="row">
                  <div className="f1">{t(L.Armor)}</div>
                  <div>
                     <StatComp current={rs.props.armor} original={rs.originalProps.armor} />
                  </div>
               </div>
            </Tooltip>
            <Tooltip
               label={
                  <>
                     <div>{t(L.PropertyTooltip, def.shield[0], def.shield[1])}</div>
                     <div>{t(L.ShieldTooltip, formatPercent(1 - damageAfterShield(rs.props.shield)))}</div>
                  </>
               }
            >
               <div className="row">
                  <div className="f1">{t(L.Shield)}</div>
                  <div>
                     <StatComp current={rs.props.shield} original={rs.originalProps.shield} />
                  </div>
               </div>
            </Tooltip>
            <Tooltip
               label={
                  <>
                     <div>{t(L.PropertyTooltip, def.deflection[0], def.deflection[1])}</div>
                     <div>{t(L.DeflectionTooltip, formatPercent(1 - damageAfterDeflection(rs.props.deflection)))}</div>
                  </>
               }
            >
               <div className="row">
                  <div className="f1">{t(L.Deflection)}</div>
                  <div>
                     <StatComp current={rs.props.deflection} original={rs.originalProps.deflection} />
                  </div>
               </div>
            </Tooltip>
            <Tooltip
               label={
                  <>
                     <div>{t(L.PropertyTooltip, def.evasion[0], def.evasion[1])}</div>
                     <div>{t(L.EvasionTooltip, formatPercent(evasionChance(rs.props.evasion)))}</div>
                  </>
               }
            >
               <div className="row">
                  <div className="f1">{t(L.Evasion)}</div>
                  <div>
                     <StatComp current={rs.props.evasion} original={rs.originalProps.evasion} />
                  </div>
               </div>
            </Tooltip>
         </div>
      </>
   );
}

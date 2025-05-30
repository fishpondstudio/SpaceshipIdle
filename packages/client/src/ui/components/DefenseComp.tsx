import { Progress, Tooltip } from "@mantine/core";
import { Config } from "@spaceship-idle/shared/src/game/Config";
import {
   damageAfterArmor,
   damageAfterDeflection,
   damageAfterShield,
   evasionChance,
} from "@spaceship-idle/shared/src/game/logic/BattleLogic";
import { formatNumber, formatPercent } from "@spaceship-idle/shared/src/utils/Helper";
import { L, t } from "@spaceship-idle/shared/src/utils/i18n";
import { memo } from "react";
import { G } from "../../utils/Global";
import type { ITileWithGameState } from "../ITileWithGameState";
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
            <div className="row my10">
               <div className="f1">{t(L.HP)}</div>
               <div>
                  {formatNumber(rs.props.hp - rs.damageTaken)} / {formatNumber(rs.props.hp)}
               </div>
            </div>
            <Tooltip label={formatPercent((rs.props.hp - rs.damageTaken) / rs.props.hp)}>
               <Progress_ value={(100 * (rs.props.hp - rs.damageTaken)) / rs.props.hp} mb="xs" />
            </Tooltip>
            <div className="row my10">
               <div className="f1">{t(L.Armor)}</div>
               <Tooltip
                  label={
                     <>
                        <div>{t(L.PropertyTooltip, def.armor[0], def.armor[1])}</div>
                        <div>{t(L.ArmorTooltip, formatPercent(1 - damageAfterArmor(rs.props.armor)))}</div>
                     </>
                  }
               >
                  <div>{formatNumber(rs.props.armor)}</div>
               </Tooltip>
            </div>
            <div className="row my10">
               <div className="f1">{t(L.Shield)}</div>
               <Tooltip
                  label={
                     <>
                        <div>{t(L.PropertyTooltip, def.shield[0], def.shield[1])}</div>
                        <div>{t(L.ShieldTooltip, formatPercent(1 - damageAfterShield(rs.props.shield)))}</div>
                     </>
                  }
               >
                  <div>{formatNumber(rs.props.shield)}</div>
               </Tooltip>
            </div>
            <div className="row my10">
               <div className="f1">{t(L.Deflection)}</div>
               <Tooltip
                  label={
                     <>
                        <div>{t(L.PropertyTooltip, def.deflection[0], def.deflection[1])}</div>
                        <div>
                           {t(L.DeflectionTooltip, formatPercent(1 - damageAfterDeflection(rs.props.deflection)))}
                        </div>
                     </>
                  }
               >
                  <div>{formatNumber(rs.props.deflection)}</div>
               </Tooltip>
            </div>
            <div className="row my10">
               <div className="f1">{t(L.Evasion)}</div>
               <Tooltip
                  label={
                     <>
                        <div>{t(L.PropertyTooltip, def.evasion[0], def.evasion[1])}</div>
                        <div>{t(L.EvasionTooltip, formatPercent(evasionChance(rs.props.evasion)))}</div>
                     </>
                  }
               >
                  <div>{rs.props.evasion}</div>
               </Tooltip>
            </div>
         </div>
      </>
   );
}

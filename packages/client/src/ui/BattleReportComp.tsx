import { Tooltip } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { Config } from "@spaceship-idle/shared/src/game/Config";
import { DamageTypeLabel } from "@spaceship-idle/shared/src/game/definitions/BuildingProps";
import { formatNumber, formatPercent, mapOf } from "@spaceship-idle/shared/src/utils/Helper";
import { L, t } from "@spaceship-idle/shared/src/utils/i18n";
import { G } from "../utils/Global";

export function BattleReportComp(): React.ReactNode {
   const [show, { open, close }] = useDisclosure();

   if (!show) {
      return (
         <div className="row fstart g5 text-space text-sm pointer" onClick={open}>
            <div className="mi">analytics</div>
            <div>{t(L.ShowBattleReport)}</div>
         </div>
      );
   }

   const stat = G.runtime.rightStat;
   return (
      <>
         <div className="row fstart g5 text-space text-sm pointer" onClick={close}>
            <div className="mi">close</div>
            <div>{t(L.HideBattleReport)}</div>
         </div>
         <div className="h5" />
         <div className="panel" style={{ display: "flex", flexDirection: "column", gap: 5 }}>
            <div className="row fstart g5 title" style={{ margin: "-5px 0" }}>
               <div>{t(L.ActualRawDamageByType)}</div>
               <Tooltip label={t(L.ActualRawDamageTooltip)}>
                  <div className="mi sm">info</div>
               </Tooltip>
            </div>
            <div className="divider mx-10 my5" />
            {mapOf(stat.actualDamage, (damageType, damage) => {
               const rawDamage = stat.rawDamage[damageType] ?? 0;
               return (
                  <div key={damageType} className="row text-sm">
                     <div className="f1">{DamageTypeLabel[damageType]()}</div>
                     <div className="text-space">
                        {formatNumber(rawDamage)} / {formatNumber(damage)} (
                        {formatPercent(rawDamage === 0 ? 0 : damage / rawDamage)})
                     </div>
                  </div>
               );
            })}
            <div className="divider mx-10 my5" />
            <div className="title" style={{ margin: "-5px 0" }}>
               {t(L.ActualDamageByModuleType)}
            </div>
            <div className="divider mx-10 my5" />
            {Array.from(stat.actualDamageByBuilding.entries())
               .sort((a, b) => b[1] - a[1])
               .map(([building, damage]) => {
                  return (
                     <div key={building} className="row text-sm">
                        <div className="f1">{Config.Buildings[building].name()}</div>
                        <div className="text-space">{formatNumber(damage)}</div>
                     </div>
                  );
               })}
         </div>
      </>
   );
}

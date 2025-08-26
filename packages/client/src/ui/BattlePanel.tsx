import { Progress, Tooltip } from "@mantine/core";
import { DamageType, DamageTypeLabel } from "@spaceship-idle/shared/src/game/definitions/BuildingProps";
import { SuddenDeathSeconds, SuddenDeathUndamagedSec } from "@spaceship-idle/shared/src/game/definitions/Constant";
import { BattleType } from "@spaceship-idle/shared/src/game/logic/BattleType";
import { getBuildingName } from "@spaceship-idle/shared/src/game/logic/BuildingLogic";
import { Side } from "@spaceship-idle/shared/src/game/logic/Side";
import { classNames, formatHMS, formatNumber, formatPercent, mapOf } from "@spaceship-idle/shared/src/utils/Helper";
import { L, t } from "@spaceship-idle/shared/src/utils/i18n";
import { G } from "../utils/Global";
import { RenderHTML } from "./components/RenderHTMLComp";

const timerPanelWidth = 300;

export function TimerPanel(): React.ReactNode {
   if (!G.runtime) return null;
   if (G.runtime.battleType === BattleType.Peace) return null;
   return (
      <div
         className={classNames(
            "timer-panel",
            G.runtime.suddenDeathDamage(Side.Left) > 0 || G.runtime.suddenDeathDamage(Side.Right) > 0
               ? "text-red breathing"
               : null,
         )}
         style={{
            width: timerPanelWidth,
            left: `calc(50vw - ${timerPanelWidth / 2}px)`,
         }}
      >
         <div className="timer">{formatHMS(G.runtime.battleSeconds * 1000)}</div>
         <div className="text-sm">
            {G.runtime.battleType === BattleType.Qualifier ? t(L.QualifierBattleShort) : t(L.PracticeBattleShort)}
         </div>
      </div>
   );
}

export function BattlePanel({ side }: { side: Side }): React.ReactNode {
   if (!G.runtime) return null;
   if (G.runtime.battleType === BattleType.Peace) return null;

   return (
      <>
         <HPComponent side={side} />
         <DamageComponent side={side} />
      </>
   );
}

function HPComponent({ side }: { side: Side }): React.ReactNode {
   const hpStat = side === Side.Left ? G.runtime.leftStat : G.runtime.rightStat;
   return (
      <div
         className="sf-frame"
         style={{
            position: "absolute",
            top: 10,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            width: 400,
            height: 50,
            padding: "0 10px",
            maxWidth: "40vw",
            fontSize: "var(--mantine-font-size-sm)",
            ...(side === Side.Left ? { left: 10 } : { right: 10 }),
         }}
      >
         <div className="h5"></div>
         <Progress color={side === Side.Left ? "green" : "red"} value={(100 * hpStat.currentHp) / hpStat.maxHp} />
         <div className="h5"></div>
         <div className="row g5">
            <div className="f1">{t(L.HP)}</div>
            <div className="f1 text-center">{formatPercent(hpStat.currentHp / hpStat.maxHp, 0)}</div>
            <div className="f1 text-right">
               {formatNumber(hpStat.currentHp)}/{formatNumber(hpStat.maxHp)}
            </div>
         </div>
      </div>
   );
}

function DamageComponent({ side }: { side: Side }): React.ReactNode {
   // Damage stat is on the opposite side!
   const damageStat = side === Side.Left ? G.runtime.rightStat : G.runtime.leftStat;
   const suddenDeathDamage = G.runtime.suddenDeathDamage(side);
   return (
      <div className="battle-panel" style={side === Side.Left ? { left: 10 } : { right: 10 }}>
         {suddenDeathDamage > 0 ? (
            <Tooltip.Floating
               label={
                  <RenderHTML
                     html={t(
                        L.SuddenDeathTooltipV2,
                        SuddenDeathUndamagedSec,
                        SuddenDeathSeconds,
                        formatNumber(suddenDeathDamage),
                     )}
                  />
               }
               multiline
            >
               <div className="row text-red mb10">
                  <div>Sudden Death</div>
                  <div className="text-right">{formatNumber(suddenDeathDamage)}</div>
                  <div className="mi sm text-right">skull</div>
               </div>
            </Tooltip.Floating>
         ) : null}
         {mapOf(DamageType, (key, value) => {
            return (
               <div key={key} className="row">
                  <div>{DamageTypeLabel[value]()}</div>
                  <div className="text-right">{formatNumber(damageStat.actualDamage[value])}</div>
                  <div className={classNames("text-right", side === Side.Left ? "text-green" : "text-red")}>
                     +{formatNumber(damageStat.actualDamages.get(-1)?.[value] ?? 0)}
                  </div>
               </div>
            );
         })}
         <div className="h10" />
         {Array.from(damageStat.actualDamageByBuilding.entries())
            .sort((a, b) => b[1] - a[1])
            .map(([building, damage]) => {
               return (
                  <div key={building} className="row">
                     <div>{getBuildingName(building)}</div>
                     <div className="text-right">{formatNumber(damage)}</div>
                     <div />
                  </div>
               );
            })}
      </div>
   );
}

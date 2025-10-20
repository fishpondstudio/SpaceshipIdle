import { type DefaultMantineColor, getThemeColor, useMantineTheme } from "@mantine/core";
import { DamageType, DamageTypeLabel } from "@spaceship-idle/shared/src/game/definitions/BuildingProps";
import { SuddenDeathSeconds, SuddenDeathUndamagedSec } from "@spaceship-idle/shared/src/game/definitions/Constant";
import { BattleType } from "@spaceship-idle/shared/src/game/logic/BattleType";
import { getBuildingName } from "@spaceship-idle/shared/src/game/logic/BuildingLogic";
import { Side } from "@spaceship-idle/shared/src/game/logic/Side";
import { cls, divide, formatHMS, formatNumber, formatPercent, mapOf } from "@spaceship-idle/shared/src/utils/Helper";
import { L, t } from "@spaceship-idle/shared/src/utils/i18n";
import { G } from "../utils/Global";
import { FloatingTip } from "./components/FloatingTip";
import { RenderHTML } from "./components/RenderHTMLComp";

const timerPanelWidth = 300;

export function TimerPanel(): React.ReactNode {
   if (!G.runtime) return null;
   if (G.runtime.battleType === BattleType.Peace) return null;
   return (
      <div
         className={cls(
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
            {G.runtime.battleType === BattleType.Battle ? t(L.QualifierBattleShort) : t(L.PracticeBattleShort)}
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

function HealthBarComp({ value, color }: { value: number; color: DefaultMantineColor }): React.ReactNode {
   const theme = useMantineTheme();
   return (
      <div className="health-bar">
         <div className="damage" style={{ width: `${value}%` }} />
         <div className="fill" style={{ background: getThemeColor(color, theme), width: `${value}%` }} />
      </div>
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
         <HealthBarComp color={side === Side.Left ? "green" : "red"} value={(100 * hpStat.currentHp) / hpStat.maxHp} />
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
            <FloatingTip
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
            >
               <div className="row text-red mb10">
                  <div>{t(L.SuddenDeath)}</div>
                  <div>{formatNumber(suddenDeathDamage)}</div>
                  <div className="mi sm">skull</div>
                  <div className="f1" />
               </div>
            </FloatingTip>
         ) : null}
         <table style={{ tableLayout: "fixed" }}>
            <thead>
               <tr className="text-xs text-space text-uppercase">
                  <th style={{ width: 100 }} />
                  <th className="text-right" style={{ width: 60 }}>
                     <FloatingTip label={t(L.ActualDamageTooltip)}>
                        <div>{t(L.Actual)}</div>
                     </FloatingTip>
                  </th>
                  <th style={{ width: 50 }} />
                  <th className="text-right" style={{ width: 60 }}>
                     {t(L.Raw)}
                  </th>
                  <th style={{ width: 50 }} />
                  <th style={{ width: 50 }}>
                     <FloatingTip label={t(L.ReducedDamageTooltip)}>
                        <div>{t(L.Reduced)}</div>
                     </FloatingTip>
                  </th>
               </tr>
            </thead>
            <tbody>
               {mapOf(DamageType, (key, value) => {
                  const actualDamage = damageStat.actualDamage[value];
                  const rawDamage = damageStat.rawDamage[value];
                  return (
                     <tr key={key}>
                        <td style={{ width: 100 }}>{DamageTypeLabel[value]()}</td>
                        <td className="text-right" style={{ width: 60 }}>
                           {formatNumber(actualDamage)}
                        </td>
                        <td style={{ width: 60 }} className={cls(side === Side.Left ? "text-green" : "text-red")}>
                           +{formatNumber(damageStat.actualDamages.get(-1)?.[value] ?? 0)}
                        </td>
                        <td className="text-right" style={{ width: 60 }}>
                           {formatNumber(rawDamage)}
                        </td>
                        <td style={{ width: 60 }} className={cls(side === Side.Left ? "text-green" : "text-red")}>
                           +{formatNumber(damageStat.rawDamages.get(-1)?.[value] ?? 0)}
                        </td>
                        <td className="text-right" style={{ width: 60 }}>
                           {formatPercent(divide(rawDamage - actualDamage, rawDamage))}
                        </td>
                     </tr>
                  );
               })}
            </tbody>
         </table>
         <div className="h10" />
         <div className="row">
            {side === Side.Right ? <div className="f1" /> : null}
            <table style={{ tableLayout: "fixed" }}>
               <thead>
                  <tr className="text-xs text-space text-uppercase">
                     <th style={{ width: 100 }} />
                     <th className="text-right" style={{ width: 60 }}>
                        <FloatingTip label={t(L.ActualDamageTooltip)}>
                           <div>{t(L.Actual)}</div>
                        </FloatingTip>
                     </th>
                  </tr>
               </thead>
               <tbody>
                  {Array.from(damageStat.actualDamageByBuilding.entries())
                     .sort((a, b) => b[1] - a[1])
                     .map(([building, damage]) => {
                        return (
                           <tr key={building}>
                              <td>{getBuildingName(building)}</td>
                              <td className="text-right">{formatNumber(damage)}</td>
                           </tr>
                        );
                     })}
               </tbody>
            </table>
            {side === Side.Left ? <div className="f1" /> : null}
         </div>
      </div>
   );
}

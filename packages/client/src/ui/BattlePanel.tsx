import { type DefaultMantineColor, Progress, Tooltip } from "@mantine/core";
import { Config } from "@spaceship-idle/shared/src/game/Config";
import { DamageType, DamageTypeLabel } from "@spaceship-idle/shared/src/game/definitions/BuildingProps";
import { BattleType } from "@spaceship-idle/shared/src/game/logic/BattleType";
import type { RuntimeStat } from "@spaceship-idle/shared/src/game/logic/RuntimeStat";
import { Side } from "@spaceship-idle/shared/src/game/logic/Side";
import { classNames, formatHMS, formatNumber, formatPercent, mapOf } from "@spaceship-idle/shared/src/utils/Helper";
import { L, t } from "@spaceship-idle/shared/src/utils/i18n";
import { G } from "../utils/Global";

const timerPanelWidth = 300;

export function TimerPanel(): React.ReactNode {
   if (!G.runtime) return null;
   if (G.runtime.battleType === BattleType.Peace) return null;
   const suddenDeathDamage = G.runtime.suddenDeathDamage();
   return (
      <div
         className={classNames("timer-panel", suddenDeathDamage > 0 ? "text-red breathing" : null)}
         style={{
            width: timerPanelWidth,
            left: `calc(50vw - ${timerPanelWidth / 2}px)`,
         }}
      >
         <div className="timer">{formatHMS(G.runtime.productionTick * 1000)}</div>
         <Tooltip disabled={suddenDeathDamage <= 0} label={t(L.SuddenDeathTooltip, suddenDeathDamage)}>
            <div className="row g5">
               <div className="text-sm">
                  {G.runtime.battleType === BattleType.Qualifier ? t(L.QualifierBattleShort) : t(L.PracticeBattleShort)}
               </div>
               {suddenDeathDamage > 0 ? <div className="mi sm">skull</div> : null}
            </div>
         </Tooltip>
      </div>
   );
}

export function BattlePanel({ side }: { side: Side }): React.ReactNode {
   if (!G.runtime) return null;
   if (G.runtime.battleType === BattleType.Peace) return null;

   if (side === Side.Left) {
      const hpStat = G.runtime.leftStat;
      const style = { left: 10 };
      return (
         <>
            <HPComponent hp={hpStat.currentHp} totalHp={hpStat.maxHp} style={style} color="green" />
            <DamageComponent stat={G.runtime.rightStat} style={style} color="green" />
         </>
      );
   }

   const hpStat = G.runtime.rightStat;
   const style = { right: 10 };
   return (
      <>
         <HPComponent hp={hpStat.currentHp} totalHp={hpStat.maxHp} style={style} color="red" />
         <DamageComponent stat={G.runtime.leftStat} style={style} color="red" />
      </>
   );
}

function HPComponent({
   hp,
   totalHp,
   style,
   color,
}: { hp: number; totalHp: number; style?: React.CSSProperties; color?: DefaultMantineColor }): React.ReactNode {
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
            ...style,
         }}
      >
         <div className="h5"></div>
         <Progress color={color} value={(100 * hp) / totalHp} />
         <div className="h5"></div>
         <div className="row g5">
            <div className="f1">{t(L.HP)}</div>
            <div className="f1 text-center">{formatPercent(hp / totalHp, 0)}</div>
            <div className="f1 text-right">
               {formatNumber(hp)}/{formatNumber(totalHp)}
            </div>
         </div>
      </div>
   );
}

function DamageComponent({
   stat,
   style,
   color,
}: { stat: RuntimeStat; style?: React.CSSProperties; color?: string }): React.ReactNode {
   return (
      <div className="battle-panel" style={style}>
         {mapOf(DamageType, (key, value) => {
            return (
               <div key={key} className="row">
                  <div style={{ width: 100 }}>{DamageTypeLabel[value]()}</div>
                  <div style={{ width: 60 }} className="text-right">
                     {formatNumber(stat.actualDamage[value])}
                  </div>
                  <div
                     style={{ width: 50 }}
                     className={classNames("text-right", color === "green" ? "text-green" : "text-red")}
                  >
                     +{formatNumber(stat.actualDamages.get(-1)?.[value] ?? 0)}
                  </div>
               </div>
            );
         })}
         <div className="h10" />
         {Array.from(stat.actualDamageByBuilding.entries())
            .sort((a, b) => b[1] - a[1])
            .map(([building, damage]) => {
               return (
                  <div key={building} className="row">
                     <div>{Config.Buildings[building].name()}</div>
                     <div className="text-right">{formatNumber(damage)}</div>
                     <div />
                  </div>
               );
            })}
      </div>
   );
}

import { type DefaultMantineColor, Progress } from "@mantine/core";
import { DamageType } from "@spaceship-idle/shared/src/game/definitions/BuildingProps";
import { GameStateUpdated } from "@spaceship-idle/shared/src/game/GameState";
import { BattleType } from "@spaceship-idle/shared/src/game/logic/BattleType";
import type { RuntimeStat } from "@spaceship-idle/shared/src/game/logic/RuntimeStat";
import { Side } from "@spaceship-idle/shared/src/game/logic/Side";
import { classNames, formatNumber, formatPercent } from "@spaceship-idle/shared/src/utils/Helper";
import { L, t } from "@spaceship-idle/shared/src/utils/i18n";
import { G } from "../utils/Global";
import { refreshOnTypedEvent } from "../utils/Hook";

export function BattlePanel({ side }: { side: Side }): React.ReactNode {
   refreshOnTypedEvent(GameStateUpdated);
   if (!G.runtime) return null;
   if (G.runtime.battleType === BattleType.Peace) return null;
   const stat = side === Side.Right ? G.runtime.rightStat : G.runtime.leftStat;
   const style = side === Side.Left ? { left: 10 } : { right: 10 };
   const color = side === Side.Left ? "green" : "red";
   return (
      <>
         <HPComponent hp={stat.currentHP} totalHP={stat.maxHP} style={style} color={color} />
         <DamageComponent stat={stat} style={style} color={color} />
      </>
   );
}

function HPComponent({
   hp,
   totalHP,
   style,
   color,
}: { hp: number; totalHP: number; style?: React.CSSProperties; color?: DefaultMantineColor }): React.ReactNode {
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
         <Progress color={color} value={(100 * hp) / totalHP} />
         <div className="h5"></div>
         <div className="row g5">
            <div className="f1">{t(L.HP)}</div>
            <div className="f1 text-center">{formatPercent(hp / totalHP, 0)}</div>
            <div className="f1 text-right">
               {formatNumber(hp)}/{formatNumber(totalHP)}
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
      <div
         className="text-sm"
         style={{
            textShadow: "1px 1px 0 #000",
            position: "absolute",
            top: 70,
            ...style,
         }}
      >
         <div className="row">
            <div style={{ width: 100 }}>{t(L.Kinetic)}</div>
            <div style={{ width: 60 }} className="text-right">
               {formatNumber(stat.actualDamage[DamageType.Kinetic])}
            </div>
            <div
               style={{ width: 50 }}
               className={classNames("text-right", color === "green" ? "text-green" : "text-red")}
            >
               +{formatNumber(stat.actualDamages.get(-1)?.[DamageType.Kinetic] ?? 0)}
            </div>
         </div>
         <div className="row">
            <div style={{ width: 100 }}>{t(L.Explosive)}</div>
            <div style={{ width: 60 }} className="text-right">
               {formatNumber(stat.actualDamage[DamageType.Explosive])}
            </div>
            <div
               style={{ width: 50 }}
               className={classNames("text-right", color === "green" ? "text-green" : "text-red")}
            >
               +{formatNumber(stat.actualDamages.get(-1)?.[DamageType.Explosive] ?? 0)}
            </div>
         </div>
         <div className="row">
            <div style={{ width: 100 }}>{t(L.Energy)}</div>
            <div style={{ width: 60 }} className="text-right">
               {formatNumber(stat.actualDamage[DamageType.Energy])}
            </div>
            <div
               style={{ width: 50 }}
               className={classNames("text-right", color === "green" ? "text-green" : "text-red")}
            >
               +{formatNumber(stat.actualDamages.get(-1)?.[DamageType.Energy] ?? 0)}
            </div>
         </div>
      </div>
   );
}

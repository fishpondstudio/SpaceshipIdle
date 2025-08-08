import { ScrollArea, Tooltip } from "@mantine/core";
import {
   BattleLossQuantum,
   BattleWinQuantum,
   ElementThisRunColor,
} from "@spaceship-idle/shared/src/game/definitions/Constant";
import { GameStateUpdated } from "@spaceship-idle/shared/src/game/GameState";
import { getQualifiedQuantum, getUsedQuantum, quantumToXP } from "@spaceship-idle/shared/src/game/logic/ResourceLogic";
import { clamp, formatNumber, mMapOf, range } from "@spaceship-idle/shared/src/utils/Helper";
import { L, t } from "@spaceship-idle/shared/src/utils/i18n";
import { ElementImageComp } from "../game/ElementImage";
import { G } from "../utils/Global";
import { refreshOnTypedEvent } from "../utils/Hook";

export function QuantumProgressModal(): React.ReactNode {
   refreshOnTypedEvent(GameStateUpdated);
   const start = Math.floor(getQualifiedQuantum(G.save.current) / BattleWinQuantum - 1) * BattleWinQuantum;
   const limit = getQualifiedQuantum(G.save.current);
   const used = getUsedQuantum(G.save.current);
   return (
      <div className="m10">
         <div className="panel p5 text-center text-xs mb10 row" style={{ padding: "5px 10px" }}>
            <div className="f1 text-left text-space">{t(L.QualifiedQuantum)}</div>
            <div className="f1 text-right text-green">{t(L.UsedQuantum)}</div>
         </div>
         <ScrollArea
            type="auto"
            scrollbars="x"
            offsetScrollbars="x"
            style={{ width: "580px" }}
            classNames={{ content: "quantum-progress" }}
         >
            <div>
               {range(0, 5).map((i) => {
                  return <QuantumBlock key={i} start={start + BattleWinQuantum * i} qualified={limit} used={used} />;
               })}
            </div>
         </ScrollArea>
         <div className="divider mx-10 mb10" />
         <div>{t(L.ElementThisRun)}</div>
         {mMapOf(G.save.current.elements, (symbol, amount) => (
            <div className="row my10" key={symbol}>
               <ElementImageComp symbol={symbol} w="50" color={ElementThisRunColor} />
               <div className="f1">
                  <div className="text-lg">
                     <span className="text-dimmed">
                        {amount.hp} + {amount.damage} ({amount.amount})
                     </span>
                  </div>
               </div>
            </div>
         ))}
      </div>
   );
}

function QuantumBlock({ start, qualified, used }: { start: number; qualified: number; used: number }): React.ReactNode {
   const qualifiedPercent = clamp((qualified - start) / BattleWinQuantum, 0, 1);
   const usedPercent = clamp((used - start) / BattleWinQuantum, 0, 1);
   return (
      <div className="block">
         <div className="row g0">
            <div className="f1" />
            <div className="f1">{t(L.PlusOneElement)}</div>
         </div>
         <div className="row g0">
            <div className="f1" />
            <div className="indicator"></div>
            <div className="f1" />
         </div>
         <div className="progress">
            <div className="fill" style={{ width: `${qualifiedPercent * 100}%` }} />
            <div className="fill green" style={{ width: `${usedPercent * 100}%` }} />
         </div>
         <div className="row g0">
            <div className="indicator" />
            <div className="f1" />
            <div className="indicator" />
            <div className="f1" />
            <div className="indicator hidden" />
         </div>
         <div className="row g0">
            <Tooltip label={t(L.MaxSpaceshipValue)}>
               <div className="f1">{formatNumber(quantumToXP(start))}</div>
            </Tooltip>
            <Tooltip label={t(L.MaxSpaceshipValue)}>
               <div className="f1">{formatNumber(quantumToXP(start + BattleLossQuantum))}</div>
            </Tooltip>
         </div>
         <div className="row g0">
            <div className="f1">Q{start}</div>
            <div className="f1">Q{start + BattleLossQuantum}</div>
         </div>
      </div>
   );
}

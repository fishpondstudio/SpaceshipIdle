import { Tooltip } from "@mantine/core";
import { Config } from "@spaceship-idle/shared/src/game/Config";
import { BattleQuantum, TrialQuantum } from "@spaceship-idle/shared/src/game/definitions/Constant";
import { GameStateUpdated } from "@spaceship-idle/shared/src/game/GameState";
import {
   getCurrentQuantum,
   getQuantumLimit,
   getQuantumQualified,
   getUsedQuantum,
   quantumToSpaceshipValue,
} from "@spaceship-idle/shared/src/game/logic/ResourceLogic";
import { clamp, formatNumber, mMapOf, range } from "@spaceship-idle/shared/src/utils/Helper";
import { L, t } from "@spaceship-idle/shared/src/utils/i18n";
import { ElementImageComp } from "../game/ElementImage";
import { G } from "../utils/Global";
import { refreshOnTypedEvent } from "../utils/Hook";

export function QuantumProgressModal(): React.ReactNode {
   refreshOnTypedEvent(GameStateUpdated);
   const start = Math.floor(getQuantumLimit(G.save.current) / BattleQuantum - 1) * BattleQuantum;
   const qualified = getQuantumQualified(G.save.current);
   const current = getCurrentQuantum(G.save.current);
   const used = getUsedQuantum(G.save.current);
   return (
      <>
         <div className="panel p5 text-center text-xs mb10 row" style={{ padding: "5px 10px" }}>
            <div className="f1 text-left text-space">{t(L.QualifiedQuantum)}</div>
            <div className="f1 text-center text-blue">{t(L.ReachedQuantum)}</div>
            <div className="f1 text-right text-green">{t(L.UsedQuantum)}</div>
         </div>
         <div className="quantum-progress">
            <div>
               {range(0, 5).map((i) => {
                  return (
                     <QuantumBlock
                        key={i}
                        start={start + BattleQuantum * i}
                        qualified={qualified}
                        current={current}
                        used={used}
                     />
                  );
               })}
            </div>
         </div>
         <div className="divider mx-10 mb10" />
         <div>{t(L.ElementThisRun)}</div>
         {mMapOf(G.save.current.elements, (symbol, amount) => (
            <div className="row my10" key={symbol}>
               <ElementImageComp symbol={symbol} w="50" />
               <div className="f1">
                  <div className="text-lg">
                     <span className="text-dimmed">{amount}x</span> {symbol}
                  </div>
                  <div className="text-sm text-dimmed">
                     {t(L.ElementBoostThisRun, amount, Config.Buildings[Config.Element.get(symbol)!].name())}
                  </div>
               </div>
            </div>
         ))}
      </>
   );
}

function QuantumBlock({
   start,
   qualified,
   current,
   used,
}: { start: number; qualified: number; current: number; used: number }): React.ReactNode {
   const qualifiedPercent = clamp((qualified - start) / BattleQuantum, 0, 1);
   const currentPercent = clamp((current - start) / BattleQuantum, 0, 1);
   const usedPercent = clamp((used - start) / BattleQuantum, 0, 1);
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
            <div className="fill blue" style={{ width: `${currentPercent * 100}%` }} />
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
            <div className="f1">
               Q{start} {start >= qualified ? <span className="text-xs text-dimmed">{t(L.Qualifier)}</span> : null}
            </div>
            <div className="f1">
               Q{start + TrialQuantum}{" "}
               {start + TrialQuantum >= qualified ? (
                  <span className="text-xs text-dimmed">{t(L.SecondChance)}</span>
               ) : null}
            </div>
         </div>
         <div className="row g0">
            <Tooltip label={t(L.MaxSpaceshipValue)}>
               <div className="f1">{formatNumber(quantumToSpaceshipValue(start))}</div>
            </Tooltip>
            <Tooltip label={t(L.MaxSpaceshipValue)}>
               <div className="f1">{formatNumber(quantumToSpaceshipValue(start + TrialQuantum))}</div>
            </Tooltip>
         </div>
      </div>
   );
}

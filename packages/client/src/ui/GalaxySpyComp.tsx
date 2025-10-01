import type { Planet } from "@spaceship-idle/shared/src/game/definitions/Galaxy";
import { GameStateUpdated } from "@spaceship-idle/shared/src/game/GameState";
import { calcShipScore, generateShip } from "@spaceship-idle/shared/src/game/logic/BattleLogic";
import { getPlanetShipClass } from "@spaceship-idle/shared/src/game/logic/GalaxyLogic";
import { getShipClassElementLevel } from "@spaceship-idle/shared/src/game/logic/QuantumElementLogic";
import { canSpendResource, trySpendResource } from "@spaceship-idle/shared/src/game/logic/ResourceLogic";
import { Side } from "@spaceship-idle/shared/src/game/logic/Side";
import { getShipClass } from "@spaceship-idle/shared/src/game/logic/TechLogic";
import { cls, formatDelta, formatNumber, formatPercent, mathSign } from "@spaceship-idle/shared/src/utils/Helper";
import { L, t } from "@spaceship-idle/shared/src/utils/i18n";
import { srand } from "@spaceship-idle/shared/src/utils/Random";
import { useMemo } from "react";
import { ShipImageComp } from "../game/ShipImageComp";
import { G } from "../utils/Global";
import { refreshOnTypedEvent } from "../utils/Hook";
import { FloatingTip } from "./components/FloatingTip";
import { RenderHTML } from "./components/RenderHTMLComp";
import { ResourceListComp } from "./components/ResourceListComp";
import { TextureComp } from "./components/TextureComp";
import { playClick, playError } from "./Sound";

export function GalaxySpyComp({ planet }: { planet: Planet }): React.ReactNode {
   refreshOnTypedEvent(GameStateUpdated);
   const ship = useMemo(
      () =>
         generateShip(
            getPlanetShipClass(planet.id, G.save.data.galaxy),
            getShipClassElementLevel(getShipClass(G.save.state), G.save.state),
            srand(planet.seed),
         ),
      [planet.seed, planet.id],
   );
   const [score, hp, dps] = useMemo(() => calcShipScore(G.save.state), []);
   const [enemyScore, enemyHp, enemyDps] = useMemo(() => calcShipScore(ship), [ship]);
   const hpDiff = enemyHp - hp;
   const dpsDiff = enemyDps - dps;
   const scoreDiff = enemyScore - score;
   if (planet.revealed) {
      return (
         <div className="panel">
            <ShipImageComp style={{ padding: "0 5%" }} ship={ship} side={Side.Left} />
            <div className="divider my10 mx-10" />
            <table className="w100 text-sm">
               <tbody>
                  <FloatingTip label={<StatDiffComp yours={hp} theirs={enemyHp} />}>
                     <tr>
                        <td>
                           <div className="mi">security</div>
                        </td>
                        <td>
                           <div className="ml5">{t(L.MatchmakingDefense)}</div>
                        </td>
                        <td className="w100"></td>
                        <td className="text-right">{formatNumber(enemyHp)}</td>
                        <td className={cls("text-sm text-right", hpDiff > 0 ? "text-red" : "text-green")}>
                           <div className="ml10">{formatDelta(hpDiff)}</div>
                        </td>
                     </tr>
                  </FloatingTip>
                  <FloatingTip label={<StatDiffComp yours={dps} theirs={enemyDps} />}>
                     <tr>
                        <td>
                           <div className="mi">swords</div>
                        </td>
                        <td>
                           <div className="ml5">{t(L.MatchmakingAttack)}</div>
                        </td>
                        <td className="w100"></td>
                        <td className="text-right">{formatNumber(enemyDps)}</td>
                        <td className={cls("text-sm text-right", dpsDiff > 0 ? "text-red" : "text-green")}>
                           <div className="ml10">{formatDelta(dpsDiff)}</div>
                        </td>
                     </tr>
                  </FloatingTip>
                  <FloatingTip label={<StatDiffComp yours={score} theirs={enemyScore} />}>
                     <tr>
                        <td>
                           <div className="mi">cards_star</div>
                        </td>
                        <td>
                           <div className="ml5">{t(L.MatchmakingScore)}</div>
                        </td>
                        <td className="w100"></td>
                        <td className="text-right">{formatNumber(enemyScore)}</td>
                        <td className={cls("text-sm text-right", scoreDiff > 0 ? "text-red" : "text-green")}>
                           <div className="ml10">{formatDelta(scoreDiff)}</div>
                        </td>
                     </tr>
                  </FloatingTip>
               </tbody>
            </table>
         </div>
      );
   }

   return (
      <>
         <div className="panel">
            <div className="title">Cost</div>
            <div className="h5" />1 <TextureComp name="Others/Trophy16" className="inline-middle" /> Victory Point
         </div>
         <div className="h10" />
         <button
            className="btn w100"
            onClick={() => {
               if (!trySpendResource("VictoryPoint", 1, G.save.state.resources)) {
                  playError();
                  return;
               }
               playClick();
               planet.revealed = true;
               GameStateUpdated.emit();
            }}
            disabled={!canSpendResource("VictoryPoint", 1, G.save.state.resources)}
         >
            <FloatingTip
               label={
                  <>
                     <div>{t(L.GatherIntelligenceTooltip)}</div>
                     <div className="h5" />
                     <div className="flex-table mx-10">
                        <ResourceListComp res={{ VictoryPoint: -1 }} />
                     </div>
                  </>
               }
            >
               <div className="row">
                  <div className="mi sm">visibility</div>
                  <div>{t(L.GatherIntelligence)}</div>
               </div>
            </FloatingTip>
         </button>
      </>
   );
}

function StatDiffComp({ yours, theirs }: { yours: number; theirs: number }): React.ReactNode {
   const diff = theirs - yours;
   return (
      <RenderHTML
         html={t(
            L.StatCompDescHTML,
            formatNumber(theirs),
            formatNumber(yours),
            formatDelta(diff),
            mathSign(diff) + formatPercent(diff / yours),
         )}
      />
   );
}

import { Progress } from "@mantine/core";
import { useForceUpdate } from "@mantine/hooks";
import { type GameState, GameStateUpdated } from "@spaceship-idle/shared/src/game/GameState";
import type { BattleInfo } from "@spaceship-idle/shared/src/game/logic/BattleInfo";
import { calcShipScore } from "@spaceship-idle/shared/src/game/logic/BattleLogic";
import { BattleType } from "@spaceship-idle/shared/src/game/logic/BattleType";
import { findPlanet } from "@spaceship-idle/shared/src/game/logic/GalaxyLogic";
import { getWarmongerPenalty } from "@spaceship-idle/shared/src/game/logic/PeaceTreatyLogic";
import { canSpendResource, changeStat, trySpendResource } from "@spaceship-idle/shared/src/game/logic/ResourceLogic";
import { Runtime } from "@spaceship-idle/shared/src/game/logic/Runtime";
import { Side } from "@spaceship-idle/shared/src/game/logic/Side";
import { formatNumber, formatPercent } from "@spaceship-idle/shared/src/utils/Helper";
import { L, t } from "@spaceship-idle/shared/src/utils/i18n";
import type React from "react";
import { useMemo } from "react";
import { ShipImageComp } from "../game/ShipImageComp";
import { ShipScene } from "../scenes/ShipScene";
import { G } from "../utils/Global";
import { hideModal } from "../utils/ToggleModal";
import { DeclareWarCostComp } from "./components/DeclareWarCostComp";
import { FloatingTip } from "./components/FloatingTip";
import { hideLoading, showLoading } from "./components/LoadingComp";
import { ResourceListComp } from "./components/ResourceListComp";
import { MatchmakingShipComp } from "./MatchmakingShipComp";
import { hideSidebar } from "./Sidebar";
import { playClick, playError } from "./Sound";

export function PreBattleModal({ enemy, info }: { enemy: GameState; info: BattleInfo }): React.ReactNode {
   const forceUpdate = useForceUpdate();
   const [score, hp, dps] = useMemo(() => calcShipScore(G.save.state), []);
   let enemyScore = 0;
   let enemyHp = 0;
   let enemyDps = 0;
   [enemyScore, enemyHp, enemyDps] = useMemo(
      () => (info.hideEnemyInfo ? [0, 0, 0] : calcShipScore(enemy)),
      [enemy, info.hideEnemyInfo],
   );
   return (
      <div className="m10">
         <div className="row">
            <div className="f1">
               <ShipHeaderComp gs={G.save.state} side={Side.Left} info={{}} />
            </div>
            <div className="f1">
               <ShipHeaderComp gs={enemy} side={Side.Right} info={info} forceUpdate={forceUpdate} />
            </div>
         </div>
         <div className="h10" />
         <ShipStatComp left={hp} right={enemyHp} icon="security" tooltip={t(L.MatchmakingDefense)} />
         <ShipStatComp left={dps} right={enemyDps} icon="swords" tooltip={t(L.MatchmakingAttack)} />
         <ShipStatComp left={score} right={enemyScore} icon="cards_star" tooltip={t(L.MatchmakingScore)} />
         <div className="h10" />
         <div className="row">
            <button
               className="btn w100 py5"
               onClick={() => {
                  playClick();
                  hideModal();
               }}
            >
               {t(L.Decline)}
            </button>
            <FloatingTip
               w={300}
               label={
                  <DeclareWarCostComp
                     planet={info.planetId ? findPlanet(info.planetId, G.save.data.galaxy) : undefined}
                  />
               }
            >
               <button
                  className="btn filled w100 row g5 py5"
                  disabled={
                     !canSpendResource("VictoryPoint", getWarmongerPenalty(G.save.state), G.save.state.resources)
                  }
                  onClick={() => {
                     if (!trySpendResource("VictoryPoint", getWarmongerPenalty(G.save.state), G.save.state.resources)) {
                        playError();
                        return;
                     }

                     playClick();
                     showLoading();

                     const me = structuredClone(G.save.state);
                     me.resources.clear();
                     enemy.resources.clear();

                     G.speed = 0;
                     G.runtime = new Runtime({ state: me, options: G.save.options, data: G.save.data }, enemy);
                     G.runtime.battleType = BattleType.Battle;
                     G.runtime.battleInfo = info;

                     G.scene.loadScene(ShipScene);

                     if (!info.noWarmongerPenalty) {
                        changeStat("Warmonger", 1, G.save.state.stats);
                     }

                     hideSidebar();
                     hideModal();
                     GameStateUpdated.emit();
                     setTimeout(() => {
                        G.speed = 1;
                        hideLoading();
                        GameStateUpdated.emit();
                     }, 1000);
                  }}
               >
                  <div className="mi">swords</div>
                  <div>{t(L.StartBattle)}</div>
               </button>
            </FloatingTip>
         </div>
      </div>
   );
}

function ShipStatComp({
   left,
   right,
   icon,
   tooltip,
}: {
   left: number;
   right: number;
   icon: string;
   tooltip: React.ReactNode;
}): React.ReactNode {
   const max = Math.max(left, right);
   const min = Math.min(left, right);
   return (
      <>
         <div className="row">
            <div className="f1">
               <Progress color="green" size="lg" value={(100 * left) / max} />
            </div>
            <FloatingTip label={tooltip}>
               <div className="row g0" style={{ fontSize: 28, width: 50 }}>
                  <div
                     style={{ visibility: right > 0 && left >= right ? "visible" : "hidden" }}
                     className="mi text-green"
                  >
                     arrow_left
                  </div>
                  <div className="mi">{icon}</div>
                  <div
                     style={{ visibility: right > 0 && left <= right ? "visible" : "hidden" }}
                     className="mi text-red"
                  >
                     arrow_right
                  </div>
               </div>
            </FloatingTip>
            <div className="f1">
               <Progress color="red" size="lg" value={(100 * right) / max} />
            </div>
         </div>
         <div className="row" style={{ marginTop: -5 }}>
            <div className="row f1">
               <div className="f1">{formatNumber(left)}</div>
               <div className="text-green text-sm">
                  {right > 0 && left - min > 0
                     ? `+${formatNumber(left - min)} (${formatPercent((left - min) / max)})`
                     : ""}
               </div>
            </div>
            <div style={{ width: 50 }} />
            <div className="row f1">
               <div className="f1 text-red text-sm">
                  {right > 0 && right - min > 0
                     ? `+${formatNumber(right - min)} (${formatPercent((right - min) / max)})`
                     : ""}
               </div>
               <div>{right > 0 ? formatNumber(right) : "??"}</div>
            </div>
         </div>
      </>
   );
}

function ShipHeaderComp({
   gs,
   side,
   info,
   forceUpdate,
}: {
   gs: GameState;
   side: Side;
   info: BattleInfo;
   forceUpdate?: () => void;
}): React.ReactNode {
   return (
      <>
         <FloatingTip w={300} label={<MatchmakingShipComp ship={gs} />} disabled={info.hideEnemyInfo}>
            {side === Side.Left ? (
               <div className="text-xl row">
                  {t(L.SpaceshipPrefix, gs.name)}
                  <div className="mi text-space">info</div>
                  <div className="f1" />
               </div>
            ) : (
               <div className="text-xl row">
                  <div className="f1" />
                  <div className="mi text-space">info</div>
                  {t(L.SpaceshipPrefix, gs.name)}
               </div>
            )}
         </FloatingTip>
         <div className="h5" />
         {info.hideEnemyInfo ? (
            <div
               style={{
                  objectFit: "contain",
                  padding: 5,
                  aspectRatio: "4/3",
                  border: "1px solid var(--mantine-color-default-border)",
                  borderRadius: "var(--mantine-radius-sm)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
               }}
            >
               <button
                  className="btn"
                  disabled={!canSpendResource("VictoryPoint", 1, G.save.state.resources)}
                  onClick={() => {
                     if (!trySpendResource("VictoryPoint", 1, G.save.state.resources)) {
                        playError();
                        return;
                     }

                     playClick();
                     info.hideEnemyInfo = false;

                     if (info.planetId) {
                        const planet = findPlanet(info.planetId, G.save.data.galaxy);
                        if (planet) {
                           planet.revealed = true;
                        }
                     }

                     forceUpdate?.();
                     GameStateUpdated.emit();
                  }}
               >
                  <FloatingTip
                     w={300}
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
                     <div className="row g5 px10 py5">
                        <div className="mi">visibility</div>
                        <div>{t(L.GatherIntelligence)}</div>
                     </div>
                  </FloatingTip>
               </button>
            </div>
         ) : (
            <ShipImageComp
               ship={gs}
               side={side}
               style={{
                  objectFit: "contain",
                  padding: 5,
                  aspectRatio: "4/3",
                  border: "1px solid var(--mantine-color-default-border)",
                  borderRadius: "var(--mantine-radius-sm)",
               }}
            />
         )}
      </>
   );
}

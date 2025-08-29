import { Image, Progress } from "@mantine/core";
import { type GameState, GameStateUpdated } from "@spaceship-idle/shared/src/game/GameState";
import type { BattleInfo } from "@spaceship-idle/shared/src/game/logic/BattleInfo";
import { calcShipScore } from "@spaceship-idle/shared/src/game/logic/BattleLogic";
import { BattleType } from "@spaceship-idle/shared/src/game/logic/BattleType";
import { findPlanet } from "@spaceship-idle/shared/src/game/logic/GalaxyLogic";
import { getWarmongerPenalty } from "@spaceship-idle/shared/src/game/logic/PeaceTreatyLogic";
import { changeStat } from "@spaceship-idle/shared/src/game/logic/ResourceLogic";
import { Runtime } from "@spaceship-idle/shared/src/game/logic/Runtime";
import { Side } from "@spaceship-idle/shared/src/game/logic/Side";
import { formatNumber, formatPercent } from "@spaceship-idle/shared/src/utils/Helper";
import { L, t } from "@spaceship-idle/shared/src/utils/i18n";
import type React from "react";
import { useMemo } from "react";
import UnknownShip from "../assets/images/UnknownShip.svg";
import { AddShipToMatchmakingPool } from "../game/AddShipToMatchmakingPool";
import { ShipImageComp } from "../game/ShipImageComp";
import { ShipScene } from "../scenes/ShipScene";
import { G } from "../utils/Global";
import { hideModal } from "../utils/ToggleModal";
import { DeclareWarCostComp } from "./components/DeclareWarCostComp";
import { FloatingTip } from "./components/FloatingTip";
import { hideLoading, showLoading } from "./components/LoadingComp";
import { MatchmakingShipComp } from "./MatchmakingShipComp";
import { hideSidebar } from "./Sidebar";
import { playClick } from "./Sound";

export function PreBattleModal({ enemy, info }: { enemy: GameState; info: BattleInfo }): React.ReactNode {
   const [score, hp, dps] = useMemo(() => calcShipScore(G.save.state), []);
   let enemyScore = 0;
   let enemyHp = 0;
   let enemyDps = 0;
   if (!info.hideEnemyInfo) {
      [enemyScore, enemyHp, enemyDps] = useMemo(() => calcShipScore(enemy), [enemy]);
   }
   const warmonger = getWarmongerPenalty(G.save.state);
   return (
      <div className="m10">
         <div className="row">
            <div className="f1">
               <ShipHeaderComp gs={G.save.state} side={Side.Left} />
            </div>
            <div className="f1">
               <ShipHeaderComp gs={enemy} side={Side.Right} disableTooltip={info.hideEnemyInfo} />
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
                  onClick={() => {
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

                     AddShipToMatchmakingPool(me);

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
   disableTooltip,
}: {
   gs: GameState;
   side: Side;
   disableTooltip?: boolean;
}): React.ReactNode {
   return (
      <>
         <FloatingTip w={300} label={<MatchmakingShipComp ship={gs} />} disabled={disableTooltip}>
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
         {disableTooltip ? (
            <Image
               src={UnknownShip}
               style={{
                  objectFit: "contain",
                  padding: 5,
                  aspectRatio: "4/3",
                  border: "1px solid var(--mantine-color-default-border)",
                  borderRadius: "var(--mantine-radius-sm)",
               }}
            />
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

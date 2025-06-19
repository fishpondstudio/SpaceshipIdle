import { Grid, Progress, Switch, Tooltip } from "@mantine/core";
import { type GameState, GameStateUpdated } from "@spaceship-idle/shared/src/game/GameState";
import { calcShipScore } from "@spaceship-idle/shared/src/game/logic/BattleLogic";
import { BattleType } from "@spaceship-idle/shared/src/game/logic/BattleType";
import { calcSpaceshipXP, getQuantumLimit, getUsedQuantum } from "@spaceship-idle/shared/src/game/logic/ResourceLogic";
import { Runtime } from "@spaceship-idle/shared/src/game/logic/Runtime";
import { isQualifierBattle } from "@spaceship-idle/shared/src/game/logic/ShipLogic";
import { Side } from "@spaceship-idle/shared/src/game/logic/Side";
import { formatNumber, formatPercent } from "@spaceship-idle/shared/src/utils/Helper";
import { L, t } from "@spaceship-idle/shared/src/utils/i18n";
import type React from "react";
import { useMemo, useState } from "react";
import { AddShipToMatchmakingPool } from "../game/AddShipToMatchmakingPool";
import { ShipImageComp } from "../game/ShipImageComp";
import { ShipScene } from "../scenes/ShipScene";
import { G } from "../utils/Global";
import { hideModal } from "../utils/ToggleModal";
import { hideLoading, showLoading } from "./components/LoadingComp";
import { MatchmakingShipComp } from "./MatchmakingShipComp";
import { hideSidebar } from "./Sidebar";

export function MatchMakingModal({ enemy }: { enemy: GameState }): React.ReactNode {
   const [isPracticeBattle, setIsPracticeBattle] = useState(!isQualifierBattle(G.save.current, enemy));
   const [score, hp, dps] = useMemo(() => calcShipScore(G.save.current), []);
   const [enemyScore, enemyHp, enemyDps] = useMemo(() => calcShipScore(enemy), [enemy]);
   return (
      <div className="m10">
         <div className="row">
            <div className="f1">
               <ShipHeaderComp gs={G.save.current} side={Side.Left} />
            </div>
            <div className="f1">
               <ShipHeaderComp gs={enemy} side={Side.Right} />
            </div>
         </div>
         <div className="h10" />
         <ShipStatComp left={hp} right={enemyHp} icon="security" tooltip={t(L.MatchmakingDefense)} />
         <ShipStatComp left={dps} right={enemyDps} icon="swords" tooltip={t(L.MatchmakingAttack)} />
         <ShipStatComp left={score} right={enemyScore} icon="cards_star" tooltip={t(L.MatchmakingScore)} />
         <div className="h10" />
         <Tooltip
            disabled={isQualifierBattle(G.save.current, enemy)}
            label={t(L.QualifierBattleRequirement, getQuantumLimit(G.save.current))}
         >
            <div
               className="row p10"
               style={{
                  border: "1px solid var(--mantine-color-default-border)",
                  borderRadius: "var(--mantine-radius-sm)",
               }}
            >
               <div className="f1">{t(L.PracticeBattle)}</div>
               <Switch
                  checked={isPracticeBattle}
                  onChange={(e) => {
                     if (!isQualifierBattle(G.save.current, enemy)) {
                        setIsPracticeBattle(true);
                        return;
                     }
                     setIsPracticeBattle(e.target.checked);
                  }}
               />
            </div>
         </Tooltip>
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
            <button
               className="btn filled w100 py5"
               onClick={() => {
                  showLoading();

                  const me = structuredClone(G.save.current);
                  me.resources.clear();
                  enemy.resources.clear();

                  G.speed = 0;
                  G.runtime = new Runtime({ current: me, options: G.save.options }, enemy);
                  G.runtime.battleType = isPracticeBattle ? BattleType.Practice : BattleType.Qualifier;
                  G.scene.loadScene(ShipScene);

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
               {isPracticeBattle ? t(L.PracticeBattle) : t(L.QualifierBattle)}
            </button>
         </div>
      </div>
   );
}

function ShipStatComp({
   left,
   right,
   icon,
   tooltip,
}: { left: number; right: number; icon: string; tooltip: React.ReactNode }): React.ReactNode {
   const max = Math.max(left, right);
   const min = Math.min(left, right);
   return (
      <>
         <div className="row">
            <div className="f1">
               <Progress color="green" size="lg" value={(100 * left) / max} />
            </div>
            <Tooltip label={tooltip}>
               <div className="row g0" style={{ fontSize: 28, width: 50 }}>
                  <div style={{ visibility: left >= right ? "visible" : "hidden" }} className="mi text-green">
                     arrow_left
                  </div>
                  <div className="mi">{icon}</div>
                  <div style={{ visibility: left <= right ? "visible" : "hidden" }} className="mi text-red">
                     arrow_right
                  </div>
               </div>
            </Tooltip>
            <div className="f1">
               <Progress color="red" size="lg" value={(100 * right) / max} />
            </div>
         </div>
         <div className="row" style={{ marginTop: -5 }}>
            <div className="row f1">
               <div className="f1">{formatNumber(left)}</div>
               <div className="text-green text-sm">
                  {left - min > 0 ? `+${formatNumber(left - min)} (${formatPercent((left - min) / max)})` : ""}
               </div>
            </div>
            <div style={{ width: 50 }} />
            <div className="row f1">
               <div className="f1 text-red text-sm">
                  {right - min > 0 ? `+${formatNumber(right - min)} (${formatPercent((right - min) / max)})` : ""}
               </div>
               <div>{formatNumber(right)}</div>
            </div>
         </div>
      </>
   );
}

function ShipHeaderComp({ gs, side }: { gs: GameState; side: Side }): React.ReactNode {
   return (
      <>
         <Tooltip w={300} color="gray" label={<MatchmakingShipComp ship={gs} />}>
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
         </Tooltip>
         <div className="h5" />
         <ShipImageComp
            ship={gs}
            fit="contain"
            side={side}
            style={{
               padding: 5,
               aspectRatio: "4/3",
               border: "1px solid var(--mantine-color-default-border)",
               borderRadius: "var(--mantine-radius-sm)",
            }}
         />
      </>
   );
}

function ShipInfoComp({ gs, side }: { gs: GameState; side: Side }): React.ReactNode {
   return (
      <div
         style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: side === Side.Left ? "flex-start" : "flex-end",
            textAlign: side === Side.Left ? "left" : "right",
         }}
      >
         <Grid>
            <Grid.Col span={6}>
               <div style={{ fontSize: 32 }}>{formatNumber(getUsedQuantum(gs))}</div>
               <div className="text-sm text-dimmed">{t(L.Quantum)}</div>
            </Grid.Col>
            <Grid.Col span={6}>
               <div style={{ fontSize: 32 }}>{formatNumber(calcSpaceshipXP(gs))}</div>
               <div className="text-sm text-dimmed">{t(L.SpaceshipXP)}</div>
            </Grid.Col>
            <Grid.Col span={6}>
               <div style={{ fontSize: 32 }}>{formatNumber(gs.tiles.size)}</div>
               <div className="text-sm text-dimmed">{t(L.Modules)}</div>
            </Grid.Col>
            <Grid.Col span={6}>
               <div style={{ fontSize: 32 }}>{formatNumber(gs.unlockedTech.size)}</div>
               <div className="text-sm text-dimmed">{t(L.Tech)}</div>
            </Grid.Col>
         </Grid>
      </div>
   );
}

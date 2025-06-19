import { Grid, Progress, Switch, Tooltip } from "@mantine/core";
import { type GameState, GameStateUpdated } from "@spaceship-idle/shared/src/game/GameState";
import { calcShipScore } from "@spaceship-idle/shared/src/game/logic/BattleLogic";
import { BattleType } from "@spaceship-idle/shared/src/game/logic/BattleType";
import { calcSpaceshipXP, getQuantumLimit, getUsedQuantum } from "@spaceship-idle/shared/src/game/logic/ResourceLogic";
import { Runtime } from "@spaceship-idle/shared/src/game/logic/Runtime";
import { isQualifierBattle } from "@spaceship-idle/shared/src/game/logic/ShipLogic";
import { Side } from "@spaceship-idle/shared/src/game/logic/Side";
import { classNames, formatNumber } from "@spaceship-idle/shared/src/utils/Helper";
import { L, t } from "@spaceship-idle/shared/src/utils/i18n";
import { useMemo, useState } from "react";
import { AddShipToMatchmakingPool } from "../game/AddShipToMatchmakingPool";
import { ShipImageComp } from "../game/ShipImageComp";
import { ShipScene } from "../scenes/ShipScene";
import { G } from "../utils/Global";
import { hideModal } from "../utils/ToggleModal";
import { hideLoading, showLoading } from "./components/LoadingComp";
import { hideSidebar } from "./Sidebar";

export function MatchMakingModal({ enemy }: { enemy: GameState }): React.ReactNode {
   const [isPracticeBattle, setIsPracticeBattle] = useState(!isQualifierBattle(G.save.current, enemy));
   const [score, hp, dps] = useMemo(() => calcShipScore(G.save.current), []);
   const [enemyScore, enemyHp, enemyDps] = useMemo(() => calcShipScore(enemy), [enemy]);
   return (
      <div className="m15">
         <div className="row">
            <div className="f1">
               <ShipHeaderComp gs={G.save.current} side={Side.Left} />
            </div>
            <div className="f1">
               <ShipHeaderComp gs={enemy} side={Side.Right} />
            </div>
         </div>
         <div className="h10" />
         <div className="row">
            <div className="f1">
               <Progress size="lg" value={(100 * hp) / Math.max(hp, enemyHp)} />
            </div>
            <div className="mi mx10" style={{ fontSize: 32 }}>
               security
            </div>
            <div className="f1">
               <Progress size="lg" value={(100 * enemyHp) / Math.max(hp, enemyHp)} />
            </div>
         </div>
         <div className="row" style={{ marginTop: -5 }}>
            <div className="f1">
               <div>{formatNumber(hp)}</div>
            </div>
            <div className="f1 text-right">
               <div>{formatNumber(enemyHp)}</div>
            </div>
         </div>
         <div className="row">
            <div className="f1">
               <Progress size="lg" value={(100 * dps) / Math.max(dps, enemyDps)} />
            </div>
            <div className="mi mx10" style={{ fontSize: 32 }}>
               swords
            </div>
            <div className="f1">
               <Progress size="lg" value={(100 * enemyDps) / Math.max(dps, enemyDps)} />
            </div>
         </div>
         <div className="row" style={{ marginTop: -5 }}>
            <div className="f1">
               <div>{formatNumber(dps)}</div>
            </div>
            <div className="f1 text-right">
               <div>{formatNumber(enemyDps)}</div>
            </div>
         </div>
         <div className="row">
            <div className="f1">
               <Progress size="lg" value={(100 * score) / Math.max(score, enemyScore)} />
            </div>
            <div className="mi mx10" style={{ fontSize: 32 }}>
               swap_driving_apps_wheel
            </div>
            <div className="f1">
               <Progress size="lg" value={(100 * enemyScore) / Math.max(score, enemyScore)} />
            </div>
         </div>
         <div className="row" style={{ marginTop: -5 }}>
            <div className="f1">
               <div>{formatNumber(score)}</div>
            </div>
            <div className="f1 text-right">
               <div>{formatNumber(enemyScore)}</div>
            </div>
         </div>
         <div className="row">
            <ShipInfoComp gs={G.save.current} side={Side.Left} />
            <div className="mi mx10 text-space" style={{ fontSize: 48 }}>
               swords
            </div>
            <ShipInfoComp gs={enemy} side={Side.Right} />
         </div>
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

function ShipHeaderComp({ gs, side }: { gs: GameState; side: Side }): React.ReactNode {
   return (
      <>
         <Tooltip label={t(L.SpaceshipPrefix, gs.name)}>
            <div className={classNames("text-xl", side === Side.Left ? "text-left" : "text-right")}>
               {t(L.SpaceshipPrefix, gs.name)}
            </div>
         </Tooltip>
         <div className="h10" />
         <ShipImageComp
            ship={gs}
            fit="contain"
            side={side}
            style={{
               padding: 5,
               height: 280,
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

import { Box, Grid, Space, Switch, Text, Tooltip } from "@mantine/core";
import { type GameState, GameStateUpdated } from "@spaceship-idle/shared/src/game/GameState";
import { BattleType } from "@spaceship-idle/shared/src/game/logic/BattleType";
import {
   calculateSpaceshipValue,
   quantumLimit,
   quantumQualified,
   usedQuantum,
} from "@spaceship-idle/shared/src/game/logic/ResourceLogic";
import { Runtime } from "@spaceship-idle/shared/src/game/logic/Runtime";
import { Side } from "@spaceship-idle/shared/src/game/logic/Side";
import { formatNumber } from "@spaceship-idle/shared/src/utils/Helper";
import { L, t } from "@spaceship-idle/shared/src/utils/i18n";
import { useState } from "react";
import { AddShipToMatchmakingPool } from "../game/AddShipToMatchmakingPool";
import { ShipImageComp } from "../game/ShipImageComp";
import { ShipScene } from "../scenes/ShipScene";
import { G } from "../utils/Global";
import { hideModal } from "../utils/ToggleModal";
import { hideLoading, showLoading } from "./components/LoadingComp";
import { hideSidebar } from "./Sidebar";

export function MatchMakingModal({ enemy }: { enemy: GameState }): React.ReactNode {
   const [isPracticeBattle, setIsPracticeBattle] = useState(usedQuantum(enemy) < quantumQualified(G.save.current));
   return (
      <div style={{ padding: 5 }}>
         <div className="row">
            <ShipInfoComp gs={G.save.current} side={Side.Left} />
            <div className="mi mx10" style={{ fontSize: 72 }}>
               swords
            </div>
            <ShipInfoComp gs={enemy} side={Side.Right} />
         </div>
         <Space h="md" />
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
                  if (usedQuantum(enemy) < quantumLimit(G.save.current)) {
                     setIsPracticeBattle(true);
                     return;
                  }
                  setIsPracticeBattle(e.target.checked);
               }}
            />
         </div>
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
         <Tooltip label={t(L.SpaceshipPrefix, gs.name)}>
            <Text size="lg" truncate>
               {t(L.SpaceshipPrefix, gs.name)}
            </Text>
         </Tooltip>
         <Space h="sm" />
         <ShipImageComp
            ship={gs}
            fit="contain"
            side={side}
            style={{
               padding: 5,
               flex: "0 0 220px",
               height: 220,
               border: "1px solid var(--mantine-color-default-border)",
               borderRadius: "var(--mantine-radius-sm)",
            }}
         />
         <Space h="sm" />
         <Grid>
            <Grid.Col span={6}>
               <Box fz={32}>{formatNumber(usedQuantum(gs))}</Box>
               <Box fz="xs" c="dimmed" mt={-10} mb={5}>
                  {t(L.Quantum)}
               </Box>
            </Grid.Col>
            <Grid.Col span={6}>
               <Box fz={32}>{formatNumber(calculateSpaceshipValue(gs))}</Box>
               <Box fz="xs" c="dimmed" mt={-10} mb={5}>
                  {t(L.SpaceshipValue)}
               </Box>
            </Grid.Col>
            <Grid.Col span={6}>
               <Box fz={32}>{formatNumber(gs.tiles.size)}</Box>
               <Box fz="xs" c="dimmed" mt={-10} mb={5}>
                  {t(L.Modules)}
               </Box>
            </Grid.Col>
            <Grid.Col span={6}>
               <Box fz={32}>{formatNumber(gs.unlockedTech.size)}</Box>
               <Box fz="xs" c="dimmed" mt={-10} mb={5}>
                  {t(L.Tech)}
               </Box>
            </Grid.Col>
         </Grid>
      </div>
   );
}
